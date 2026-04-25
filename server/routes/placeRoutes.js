const express = require('express');
const router = express.Router();
const { 
  getAllPlaces, 
  getPlaceById, 
  createPlace, 
  updatePlace, 
  deletePlace,
  getAllPlacesAdmin
} = require('../controllers/placeController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Admin only route to get all places (published and unpublished)
router.get('/all', protect, adminOnly, getAllPlacesAdmin);

router.route('/')
  .get(getAllPlaces)
  .post(protect, adminOnly, createPlace);

router.route('/:id')
  .get(getPlaceById)
  .put(protect, adminOnly, updatePlace)
  .delete(protect, adminOnly, deletePlace);

module.exports = router;
