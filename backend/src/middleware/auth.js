const jwt = require('jsonwebtoken');
const { accessTokenSecret } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    try {
        const decoded = jwt.verify(token, accessTokenSecret);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
};

// Optional auth - doesn't fail if no token, just sets req.user if valid
const optionalAuthenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, accessTokenSecret);
        req.user = decoded;
    } catch (error) {
        // Token invalid, but that's OK for optional auth
    }
    next();
};

module.exports = { authenticateToken, optionalAuthenticate };
