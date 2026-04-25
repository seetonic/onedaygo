const Place = require('../models/Place');
const Setting = require('../models/Setting');

async function getStartCoords() {
  const s = await Setting.findOne({ key: "starting_point" });
  return s ? s.value : { lat: 6.8476, lng: 80.3647 };
}

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const getAllPlaces = async (req, res) => {
  try {
    const { category, distance } = req.query;
    
    let query = { isPublished: true };
    
    if (category) {
      query.category = category;
    }
    
    if (distance) {
      query.distanceFromBase = { $lte: Number(distance) };
    }
    
    const places = await Place.find(query);
    
    res.json({ success: true, data: places });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPlaceById = async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({ success: false, message: 'Place not found' });
    }
    
    res.json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPlace = async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    // Check if coordinates are provided and within 25 km
    if (coordinates && coordinates.coordinates) {
      const [lng, lat] = coordinates.coordinates;
      const start = await getStartCoords();
      const dist = calcDistance(start.lat, start.lng, lat, lng);
      
      if (dist > 25) {
        return res.status(400).json({ success: false, message: "Location is outside the 25 km boundary" });
      }
    }
    
    const newPlace = new Place({
      ...req.body,
      createdBy: req.user._id,
      lastUpdated: new Date()
    });
    
    const savedPlace = await newPlace.save();
    
    res.status(201).json({ success: true, data: savedPlace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePlace = async (req, res) => {
  try {
    const { coordinates } = req.body;
    
    if (coordinates && coordinates.coordinates) {
      const [lng, lat] = coordinates.coordinates;
      const start = await getStartCoords();
      const dist = calcDistance(start.lat, start.lng, lat, lng);
      
      if (dist > 25) {
        return res.status(400).json({ success: false, message: "Location is outside the 25 km boundary" });
      }
    }
    
    const updateData = {
      ...req.body,
      lastUpdated: new Date()
    };
    
    const updatedPlace = await Place.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!updatedPlace) {
      return res.status(404).json({ success: false, message: 'Place not found' });
    }
    
    res.json({ success: true, data: updatedPlace });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePlace = async (req, res) => {
  try {
    const deletedPlace = await Place.findByIdAndDelete(req.params.id);
    
    if (!deletedPlace) {
      return res.status(404).json({ success: false, message: 'Place not found' });
    }
    
    res.json({ success: true, message: 'Place removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllPlacesAdmin = async (req, res) => {
  try {
    const places = await Place.find({}).sort({ lastUpdated: -1 });
    res.json({ success: true, data: places });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllPlaces,
  getPlaceById,
  createPlace,
  updatePlace,
  deletePlace,
  getAllPlacesAdmin
};
