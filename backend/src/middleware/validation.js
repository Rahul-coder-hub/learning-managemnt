const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    handleValidationErrors
];

const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

const refreshTokenValidation = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required'),
    handleValidationErrors
];

const videoIdValidation = [
    param('videoId')
        .isInt({ min: 1 })
        .withMessage('Valid video ID is required'),
    handleValidationErrors
];

const subjectIdValidation = [
    param('subjectId')
        .isInt({ min: 1 })
        .withMessage('Valid subject ID is required'),
    handleValidationErrors
];

const progressValidation = [
    param('videoId')
        .isInt({ min: 1 })
        .withMessage('Valid video ID is required'),
    body('lastPositionSeconds')
        .isInt({ min: 0 })
        .withMessage('Position must be a non-negative integer'),
    body('isCompleted')
        .optional()
        .isBoolean()
        .withMessage('isCompleted must be a boolean'),
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    registerValidation,
    loginValidation,
    refreshTokenValidation,
    videoIdValidation,
    subjectIdValidation,
    progressValidation
};
