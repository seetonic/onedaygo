require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('./models/Place');

const places = [
  {
    name: 'Seethawaka Botanical Garden',
    category: 'Nature',
    description: 'A serene botanical garden spread across several acres featuring diverse flora, walking paths, and scenic river views near Seethawaka.',
    coordinates: { type: 'Point', coordinates: [80.3198, 6.9012] },
    distanceFromBase: 8,
    openingHours: '8:00 AM - 5:00 PM',
    entranceFee: { LKR: 100, note: 'LKR 500 for foreigners' },
    travelTips: ['Wear comfortable shoes', 'Bring water'],
    safetyWarnings: [],
    bestVisitTime: 'Early morning 7:00 AM - 9:00 AM',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Kumari Ella Falls',
    category: 'Nature',
    description: 'A picturesque waterfall tucked within lush greenery, best experienced after the rains when the falls are at their most powerful.',
    coordinates: { type: 'Point', coordinates: [80.4567, 6.8234] },
    distanceFromBase: 10,
    openingHours: 'Open all day',
    entranceFee: { LKR: 0, note: 'Free entry' },
    travelTips: ['Best visited after rainfall', 'Wear non-slip footwear'],
    safetyWarnings: ['Slippery rocks near the falls', 'Do not swim in strong currents'],
    bestVisitTime: 'Morning 6:00 AM - 10:00 AM',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Seethawaka Rajamaha Viharaya',
    category: 'Religious',
    description: 'An ancient Buddhist temple of significant historical and religious importance, located in the heart of the Seethawaka kingdom.',
    coordinates: { type: 'Point', coordinates: [80.3312, 6.8876] },
    distanceFromBase: 5,
    openingHours: '6:00 AM - 8:00 PM',
    entranceFee: { LKR: 0, note: 'Free entry, donations welcome' },
    travelTips: ['Dress modestly', 'Remove footwear before entering'],
    safetyWarnings: [],
    bestVisitTime: 'Early morning or evening',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Barandi Kovil',
    category: 'Heritage',
    description: 'One of the last surviving monuments of the Seethawaka Kingdom, this ancient kovil offers a rare glimpse into the region\'s heritage.',
    coordinates: { type: 'Point', coordinates: [80.3445, 6.8634] },
    distanceFromBase: 5,
    openingHours: '6:00 AM - 6:00 PM',
    entranceFee: { LKR: 0, note: 'Free entry' },
    travelTips: ['One of the last surviving Seethawaka Kingdom monuments', 'Great for photography'],
    safetyWarnings: [],
    bestVisitTime: 'Morning light is best for photography',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Maniyamgama Rajamaha Viharaya',
    category: 'Religious',
    description: 'A historically significant Buddhist temple renowned for its ancient murals and tranquil atmosphere, set amidst paddy fields.',
    coordinates: { type: 'Point', coordinates: [80.3389, 6.8712] },
    distanceFromBase: 4,
    openingHours: '6:00 AM - 8:00 PM',
    entranceFee: { LKR: 0, note: 'Free entry' },
    travelTips: ['Known for ancient murals', 'Dress modestly'],
    safetyWarnings: [],
    bestVisitTime: 'Morning',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'LeisureWorld Water Park',
    category: 'Leisure',
    description: 'A popular family water park offering a range of pools, water slides, and attractions suitable for all ages.',
    coordinates: { type: 'Point', coordinates: [80.3567, 6.9234] },
    distanceFromBase: 12,
    openingHours: '9:00 AM - 6:00 PM',
    entranceFee: { LKR: 1500, note: 'Children LKR 1000' },
    travelTips: ['No outside food allowed inside the park', 'Bring a change of clothes', 'Weekdays are less crowded'],
    safetyWarnings: [],
    bestVisitTime: 'Weekday mornings',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Bamboo Garden Arukwattha',
    category: 'Nature',
    description: 'A peaceful bamboo forest with well-maintained walking paths, offering a quiet retreat into nature away from the city.',
    coordinates: { type: 'Point', coordinates: [80.4123, 6.9456] },
    distanceFromBase: 15,
    openingHours: '8:00 AM - 5:00 PM',
    entranceFee: { LKR: 50, note: 'Small entrance fee' },
    travelTips: ['Peaceful walking paths', 'Good for photography'],
    safetyWarnings: [],
    bestVisitTime: 'Morning',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Ambalama Leisure Lounge',
    category: 'Leisure',
    description: 'A relaxed leisure spot serving traditional Sri Lankan cuisine in a scenic outdoor setting along the riverbank.',
    coordinates: { type: 'Point', coordinates: [80.3678, 6.8456] },
    distanceFromBase: 10,
    openingHours: '10:00 AM - 10:00 PM',
    entranceFee: { LKR: 0, note: 'No entry fee, food charges apply' },
    travelTips: ['Traditional Sri Lankan food available', 'Book ahead for weekends'],
    safetyWarnings: [],
    bestVisitTime: 'Afternoon or evening',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Seethawaka Miracle Resort',
    category: 'Leisure',
    description: 'A lush resort offering day visits with access to a natural waterfall, swimming pool, and verdant gardens.',
    coordinates: { type: 'Point', coordinates: [80.3523, 6.8534] },
    distanceFromBase: 10,
    openingHours: '8:00 AM - 8:00 PM',
    entranceFee: { LKR: 500, note: 'Day visit fee' },
    travelTips: ['Natural waterfall on site', 'Swimming pool available'],
    safetyWarnings: ['Supervise children near the waterfall'],
    bestVisitTime: 'Morning to afternoon',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  },
  {
    name: 'Purple Sun Resort',
    category: 'Leisure',
    description: 'A charming resort with a relaxed atmosphere, in-house restaurant, and well-kept gardens, perfect for a peaceful day out.',
    coordinates: { type: 'Point', coordinates: [80.3501, 6.8589] },
    distanceFromBase: 5,
    openingHours: '8:00 AM - 10:00 PM',
    entranceFee: { LKR: 0, note: 'No entry fee' },
    travelTips: ['Good for relaxation', 'Restaurant on site'],
    safetyWarnings: [],
    bestVisitTime: 'Any time',
    isPublished: true,
    createdBy: null,
    lastUpdated: new Date()
  }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    await Place.deleteMany({});
    console.log('Existing places cleared.');

    await Place.insertMany(places);
    console.log('Seeding complete — 10 places added.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();
