const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { authenticateToken, optionalAuthenticate } = require('../middleware/auth');
const { subjectIdValidation } = require('../middleware/validation');

// Public routes (with optional auth for enrollment status)
router.get('/subjects', optionalAuthenticate, courseController.getAllSubjects);
router.get('/subjects/:subjectId', optionalAuthenticate, subjectIdValidation, courseController.getSubjectById);

// Protected routes
router.get('/subjects/:subjectId/tree', authenticateToken, subjectIdValidation, courseController.getSubjectTree);

module.exports = router;
