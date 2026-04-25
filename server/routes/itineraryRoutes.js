const express = require('express');
const router = express.Router();
const { getItinerary, saveItinerary } = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getItinerary)
  .post(protect, saveItinerary);

module.exports = router;
