const enrollmentService = require('../services/enrollmentService');

const enroll = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { subjectId } = req.params;
        
        const result = await enrollmentService.enrollUser(userId, subjectId);
        
        if (result.alreadyEnrolled) {
            return res.status(409).json({
                success: false,
                message: 'Already enrolled in this course'
            });
        }
        
        res.status(201).json({
            success: true,
            message: 'Enrolled successfully'
        });
    } catch (error) {
        next(error);
    }
};

const getMyEnrollments = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        
        const enrollments = await enrollmentService.getUserEnrollments(userId);
        
        res.json({
            success: true,
            data: enrollments
        });
    } catch (error) {
        next(error);
    }
};

const checkEnrollment = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { subjectId } = req.params;
        
        const isEnrolled = await enrollmentService.isEnrolled(userId, subjectId);
        
        res.json({
            success: true,
            data: { is_enrolled: isEnrolled }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    enroll,
    getMyEnrollments,
    checkEnrollment
};
