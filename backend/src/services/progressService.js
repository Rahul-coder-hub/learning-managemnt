const { pool } = require('../config/database');

const getProgress = async (userId, videoId) => {
    const [progress] = await pool.execute(
        `SELECT 
            id,
            last_position_seconds,
            is_completed,
            updated_at
        FROM video_progress
        WHERE user_id = ? AND video_id = ?`,
        [userId, videoId]
    );

    return progress.length > 0 ? progress[0] : null;
};

const updateProgress = async (userId, videoId, lastPositionSeconds, isCompleted = null) => {
    // Check if progress record exists
    const existingProgress = await getProgress(userId, videoId);

    if (existingProgress) {
        // Update existing record
        const completed = isCompleted !== null ? isCompleted : existingProgress.is_completed;
        
        await pool.execute(
            `UPDATE video_progress 
             SET last_position_seconds = ?, is_completed = ?
             WHERE user_id = ? AND video_id = ?`,
            [lastPositionSeconds, completed, userId, videoId]
        );
    } else {
        // Insert new record
        const completed = isCompleted !== null ? isCompleted : false;
        
        await pool.execute(
            `INSERT INTO video_progress (user_id, video_id, last_position_seconds, is_completed)
             VALUES (?, ?, ?, ?)`,
            [userId, videoId, lastPositionSeconds, completed]
        );
    }

    return getProgress(userId, videoId);
};

const markCompleted = async (userId, videoId) => {
    return updateProgress(userId, videoId, 0, true);
};

const getCourseProgress = async (userId, subjectId) => {
    const [result] = await pool.execute(
        `SELECT 
            COUNT(DISTINCT v.id) as total_videos,
            COUNT(DISTINCT CASE WHEN vp.is_completed = TRUE THEN v.id END) as completed_videos
        FROM videos v
        INNER JOIN sections sec ON v.section_id = sec.id
        LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
        WHERE sec.subject_id = ?`,
        [userId, subjectId]
    );

    const stats = result[0];
    const progressPercentage = stats.total_videos > 0 
        ? Math.round((stats.completed_videos / stats.total_videos) * 100) 
        : 0;

    return {
        total_videos: stats.total_videos,
        completed_videos: stats.completed_videos,
        progress_percentage: progressPercentage
    };
};

module.exports = {
    getProgress,
    updateProgress,
    markCompleted,
    getCourseProgress
};
