const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

router.post('/', protect, adminOnly, upload.single('photo'), (req, res) => {
  if (req.file) {
    res.json({
      success: true,
      data: { path: `uploads/${req.file.filename}` }
    });
  } else {
    res.status(400).json({ success: false, message: 'No file uploaded' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
});

module.exports = router;
