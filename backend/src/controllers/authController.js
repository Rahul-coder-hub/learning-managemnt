const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        
        const result = await authService.register(email, password, name);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const result = await authService.login(email, password);
        
        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        
        const result = await authService.refreshAccessToken(refreshToken);
        
        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        
        await authService.logout(refreshToken);
        
        res.json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        next(error);
    }
};

const logoutAll = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        
        await authService.logoutAll(userId);
        
        res.json({
            success: true,
            message: 'Logged out from all devices'
        });
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        const { userId, email } = req.user;
        
        res.json({
            success: true,
            data: {
                id: userId,
                email
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    logout,
    logoutAll,
    getMe
};
