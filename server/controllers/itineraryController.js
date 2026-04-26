const Itinerary = require('../models/Itinerary');
const Place = require('../models/Place');
const Setting = require('../models/Setting');

async function getTravelTime(originLat, originLng, destLat, destLng) {
  if (!process.env.GOOGLE_MAPS_API_KEY) return 0;
  
  const url = `https://maps.googleapis.com/maps/api/directions/json` +
    `?origin=${originLat},${originLng}` +
    `&destination=${destLat},${destLng}` +
    `&mode=driving` +
    `&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (
    data.status !== "OK" ||
    !data.routes ||
    data.routes.length === 0
  ) {
    console.log("Directions API error:", data.status);
    return 0;
  }

  const seconds = data.routes[0].legs[0].duration.value;
  return Math.round(seconds / 60);
}

const getItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ userId: req.user._id })
      .populate('places.placeId', 'name category photos distanceFromBase coordinates');
      
    if (!itinerary) {
      return res.json({ success: true, data: {} });
    }
    
    res.json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

  const saveItinerary = async (req, res) => {
  try {
    const { places } = req.body;
    
    if (!places || !Array.isArray(places)) {
      return res.status(400).json({ success: false, message: 'Places array is required' });
    }
    
    if (places.length > 6) {
      return res.status(400).json({ success: false, message: 'Maximum 6 places allowed' });
    }
    
    // Sort places by sequenceIndex
    places.sort((a, b) => a.sequenceIndex - b.sequenceIndex);
    
    const startingSetting = await Setting.findOne({ key: "starting_point" });
    const start = startingSetting
      ? startingSetting.value
      : { name: "Deurumpitiya", lat: 6.8476, lng: 80.3647 };

    let totalTravelTime = 0;
    const processedPlaces = [];
    
    let prevLat = start.lat;
    let prevLng = start.lng;
    
    for (const item of places) {
      const place = await Place.findById(item.placeId);
      if (!place) {
        return res.status(404).json({ success: false, message: `Place with id ${item.placeId} not found` });
      }
      
      const [lng, lat] = place.coordinates.coordinates;
      
      // Call Google Directions API using the helper
      const travelTimeMinutes = await getTravelTime(prevLat, prevLng, lat, lng);
      
      totalTravelTime += travelTimeMinutes;
      
      processedPlaces.push({
        placeId: item.placeId,
        sequenceIndex: item.sequenceIndex,
        estimatedTravelTime: travelTimeMinutes
      });
      
      prevLat = lat;
      prevLng = lng;
    }
    
    // Upsert itinerary
    const itinerary = await Itinerary.findOneAndUpdate(
      { userId: req.user._id },
      { 
        userId: req.user._id,
        places: processedPlaces,
        totalTravelTime,
        startingPoint: {
          name: start.name,
          coordinates: [start.lng, start.lat]
        }
      },
      { returnDocument: 'after', upsert: true }
    ).populate('places.placeId', 'name category photos distanceFromBase coordinates');
    
    res.json({ success: true, data: itinerary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getItinerary,
  saveItinerary
};
