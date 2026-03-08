const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const { authenticateToken } = require('../middleware/auth');
const { videoIdValidation } = require('../middleware/validation');

// Protected route - requires authentication
router.get('/videos/:videoId', authenticateToken, videoIdValidation, videoController.getVideo);

module.exports = router;
