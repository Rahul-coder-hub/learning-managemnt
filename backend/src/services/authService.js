const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { accessTokenSecret, refreshTokenSecret, accessTokenExpiry, refreshTokenExpiry, refreshTokenExpiryDays } = require('../config/jwt');

const SALT_ROUNDS = 12;

const generateTokens = (userId, email) => {
    const accessToken = jwt.sign(
        { userId, email },
        accessTokenSecret,
        { expiresIn: accessTokenExpiry }
    );

    const refreshToken = jwt.sign(
        { userId, email, type: 'refresh' },
        refreshTokenSecret,
        { expiresIn: refreshTokenExpiry }
    );

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, token) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTokenExpiryDays);

    await pool.execute(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
    );
};

const removeRefreshToken = async (token) => {
    await pool.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

const removeAllUserRefreshTokens = async (userId) => {
    await pool.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
};

const validateRefreshToken = async (token) => {
    // Check if token exists in database
    const [rows] = await pool.execute(
        'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
        [token]
    );

    if (rows.length === 0) {
        throw new Error('Invalid or expired refresh token');
    }

    // Verify JWT
    const decoded = jwt.verify(token, refreshTokenSecret);
    return decoded;
};

const register = async (email, password, name) => {
    // Check if user already exists
    const [existingUsers] = await pool.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existingUsers.length > 0) {
        const error = new Error('User already exists with this email');
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const [result] = await pool.execute(
        'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
        [email, passwordHash, name]
    );

    const userId = result.insertId;

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(userId, email);
    await storeRefreshToken(userId, refreshToken);

    return {
        user: {
            id: userId,
            email,
            name
        },
        accessToken,
        refreshToken
    };
};

const login = async (email, password) => {
    // Get user
    const [users] = await pool.execute(
        'SELECT id, email, password_hash, name FROM users WHERE email = ?',
        [email]
    );

    if (users.length === 0) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email);
    await storeRefreshToken(user.id, refreshToken);

    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name
        },
        accessToken,
        refreshToken
    };
};

const refreshAccessToken = async (refreshToken) => {
    const decoded = await validateRefreshToken(refreshToken);
    
    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId, decoded.email);
    
    // Remove old refresh token and store new one
    await removeRefreshToken(refreshToken);
    await storeRefreshToken(decoded.userId, newRefreshToken);

    return {
        accessToken,
        refreshToken: newRefreshToken
    };
};

const logout = async (refreshToken) => {
    await removeRefreshToken(refreshToken);
};

const logoutAll = async (userId) => {
    await removeAllUserRefreshTokens(userId);
};

module.exports = {
    register,
    login,
    refreshAccessToken,
    logout,
    logoutAll
};
