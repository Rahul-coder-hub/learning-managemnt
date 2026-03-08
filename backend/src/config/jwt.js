module.exports = {
    accessTokenSecret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key_here',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    refreshTokenExpiryDays: parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS) || 7
};
