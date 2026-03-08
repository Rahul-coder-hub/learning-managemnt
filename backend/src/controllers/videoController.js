const videoService = require('../services/videoService');
const enrollmentService = require('../services/enrollmentService');

const getVideo = async (req, res, next) => {
    try {
        const { videoId } = req.params;
        const userId = req.user?.userId || null;
        
        let video;
        
        if (userId) {
            // Get video with enrollment check
            const videoData = await videoService.getVideoById(videoId);
            const isEnrolled = await enrollmentService.isEnrolled(userId, videoData.subject_id);
            
            if (!isEnrolled) {
                return res.status(403).json({
                    success: false,
                    message: 'You must be enrolled in this course to view this lesson'
                });
            }
            
            video = await videoService.getVideoWithStatus(videoId, userId);
        } else {
            // Guest user - only first video of any course is accessible
            video = await videoService.getVideoForGuest(videoId);
        }
        
        res.json({
            success: true,
            data: video
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVideo
};
