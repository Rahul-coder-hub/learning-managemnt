const progressService = require('../services/progressService');
const videoService = require('../services/videoService');
const enrollmentService = require('../services/enrollmentService');

const updateProgress = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const userId = req.user.userId;
        const { lastPositionSeconds, isCompleted } = req.body;
        
        // Verify user is enrolled in the course
        const video = await videoService.getVideoById(videoId);
        const isEnrolled = await enrollmentService.isEnrolled(userId, video.subject_id);
        
        if (!isEnrolled) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to track progress'
            });
        }
        
        // Update progress
        const progress = await progressService.updateProgress(
            userId,
            videoId,
            lastPositionSeconds,
            isCompleted
        );
        
        res.json({
            success: true,
            message: 'Progress updated successfully',
            data: progress
        });
    } catch (error) {
        next(error);
    }
};

const getVideoProgress = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const userId = req.user.userId;
        
        const progress = await progressService.getProgress(userId, videoId);
        
        res.json({
            success: true,
            data: progress || {
                last_position_seconds: 0,
                is_completed: false
            }
        });
    } catch (error) {
        next(error);
    }
};

const getCourseProgress = async (req, res, next) => {
    try {
        const { subjectId } = req.params;
        const userId = req.user.userId;
        
        // Verify enrollment
        const isEnrolled = await enrollmentService.isEnrolled(userId, subjectId);
        
        if (!isEnrolled) {
            return res.status(403).json({
                success: false,
                message: 'You must be enrolled in this course to view progress'
            });
        }
        
        const progress = await progressService.getCourseProgress(userId, subjectId);
        
        res.json({
            success: true,
            data: progress
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    updateProgress,
    getVideoProgress,
    getCourseProgress
};
