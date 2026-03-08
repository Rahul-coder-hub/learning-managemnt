const courseService = require('../services/courseService');
const enrollmentService = require('../services/enrollmentService');

const getAllSubjects = async (req, res, next) => {
    try {
        const userId = req.user?.userId || null;
        const subjects = await courseService.getAllSubjects(userId);
        
        res.json({
            success: true,
            data: subjects
        });
    } catch (error) {
        next(error);
    }
};

const getSubjectTree = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const userId = req.user?.userId || null;
        
        // Check if user is enrolled (required to view full tree)
        if (userId) {
            const isEnrolled = await enrollmentService.isEnrolled(userId, subjectId);
            if (!isEnrolled) {
                return res.status(403).json({
                    success: false,
                    message: 'You must be enrolled in this course to view its content'
                });
            }
        } else {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }
        
        const tree = await courseService.getSubjectTree(subjectId, userId);
        
        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        next(error);
    }
};

const getSubjectById = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const userId = req.user?.userId || null;
        
        const subject = await courseService.getSubjectById(subjectId, userId);
        
        res.json({
            success: true,
            data: subject
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllSubjects,
    getSubjectTree,
    getSubjectById
};
