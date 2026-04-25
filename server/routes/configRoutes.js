const express = require('express');
const router = express.Router();

// Public endpoint — returns only the Maps API key (not other secrets).
// The key itself must be restricted by HTTP referrer in Google Cloud Console
// so it cannot be abused even if someone reads it from this endpoint.
router.get('/maps-key', (req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return res.status(500).json({ success: false, message: 'Maps API key not configured' });
  }
  res.json({ success: true, key });
});

module.exports = router;
