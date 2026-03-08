const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { authenticateToken } = require('../middleware/auth');
const { subjectIdValidation } = require('../middleware/validation');

// Protected routes
router.get('/enrollments/my', authenticateToken, enrollmentController.getMyEnrollments);
router.post('/enrollments/:subjectId', authenticateToken, subjectIdValidation, enrollmentController.enroll);
router.get('/enrollments/:subjectId/check', authenticateToken, subjectIdValidation, enrollmentController.checkEnrollment);

module.exports = router;
