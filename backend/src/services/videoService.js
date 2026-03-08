const { pool } = require('../config/database');
const courseService = require('./courseService');
const progressService = require('./progressService');

const getVideoById = async (videoId) => {
    const [videos] = await pool.execute(
        `SELECT 
            v.id,
            v.section_id,
            v.title,
            v.youtube_url,
            v.youtube_video_id,
            v.order_index,
            v.duration_seconds,
            sec.subject_id,
            s.title as subject_title
        FROM videos v
        INNER JOIN sections sec ON v.section_id = sec.id
        INNER JOIN subjects s ON sec.subject_id = s.id
        WHERE v.id = ?`,
        [videoId]
    );

    if (videos.length === 0) {
        const error = new Error('Video not found');
        error.statusCode = 404;
        throw error;
    }

    return videos[0];
};

const getVideoWithStatus = async (videoId, userId) => {
    const video = await getVideoById(videoId);

    // Get all videos in the course to determine order
    const courseVideos = await courseService.getAllCourseVideos(video.subject_id);
    
    // Find current video index
    const currentIndex = courseVideos.findIndex(v => v.id === parseInt(videoId));
    
    if (currentIndex === -1) {
        const error = new Error('Video not found in course');
        error.statusCode = 404;
        throw error;
    }

    // Determine if video is locked
    let locked = false;
    let previousVideoCompleted = true;

    if (currentIndex > 0) {
        const previousVideo = courseVideos[currentIndex - 1];
        const previousProgress = await progressService.getProgress(userId, previousVideo.id);
        previousVideoCompleted = previousProgress?.is_completed || false;
        locked = !previousVideoCompleted;
    }

    // Get previous and next video IDs
    const previousVideoId = currentIndex > 0 ? courseVideos[currentIndex - 1].id : null;
    const nextVideoId = currentIndex < courseVideos.length - 1 ? courseVideos[currentIndex + 1].id : null;

    // Get user's progress for this video
    const progress = await progressService.getProgress(userId, videoId);

    return {
        id: video.id,
        title: video.title,
        youtube_url: video.youtube_url,
        youtube_video_id: video.youtube_video_id,
        duration_seconds: video.duration_seconds,
        subject_id: video.subject_id,
        subject_title: video.subject_title,
        section_id: video.section_id,
        order_index: video.order_index,
        locked,
        previous_video_id: previousVideoId,
        next_video_id: nextVideoId,
        progress: progress || {
            last_position_seconds: 0,
            is_completed: false
        }
    };
};

const getVideoForGuest = async (videoId) => {
    const video = await getVideoById(videoId);
    
    // Get all videos in the course
    const courseVideos = await courseService.getAllCourseVideos(video.subject_id);
    const currentIndex = courseVideos.findIndex(v => v.id === parseInt(videoId));
    
    const previousVideoId = currentIndex > 0 ? courseVideos[currentIndex - 1].id : null;
    const nextVideoId = currentIndex < courseVideos.length - 1 ? courseVideos[currentIndex + 1].id : null;

    return {
        id: video.id,
        title: video.title,
        youtube_url: video.youtube_url,
        youtube_video_id: video.youtube_video_id,
        duration_seconds: video.duration_seconds,
        subject_id: video.subject_id,
        subject_title: video.subject_title,
        section_id: video.section_id,
        order_index: video.order_index,
        locked: currentIndex > 0, // First video unlocked for guests
        previous_video_id: previousVideoId,
        next_video_id: nextVideoId,
        progress: {
            last_position_seconds: 0,
            is_completed: false
        }
    };
};

module.exports = {
    getVideoById,
    getVideoWithStatus,
    getVideoForGuest
};
