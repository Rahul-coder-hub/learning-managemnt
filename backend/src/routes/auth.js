const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { 
    registerValidation, 
    loginValidation, 
    refreshTokenValidation 
} = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/refresh', refreshTokenValidation, authController.refreshToken);
router.post('/logout', refreshTokenValidation, authController.logout);

// Protected routes
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout-all', authenticateToken, authController.logoutAll);

module.exports = router;
