const express = require('express');
const router = express.Router();
const { getExchangeRate, updateExchangeRate, getStartingPoint, updateStartingPoint } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.route('/exchange-rate')
  .get(getExchangeRate)
  .put(protect, adminOnly, updateExchangeRate);

router.route('/starting-point')
  .get(getStartingPoint)
  .put(protect, adminOnly, updateStartingPoint);

module.exports = router;
