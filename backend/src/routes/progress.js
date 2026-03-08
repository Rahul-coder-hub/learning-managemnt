const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/auth');
const { progressValidation, subjectIdValidation } = require('../middleware/validation');

// Protected routes
router.post('/progress/videos/:videoId', authenticateToken, progressValidation, progressController.updateProgress);
router.get('/progress/videos/:videoId', authenticateToken, progressController.getVideoProgress);
router.get('/progress/subjects/:subjectId', authenticateToken, subjectIdValidation, progressController.getCourseProgress);

module.exports = router;
