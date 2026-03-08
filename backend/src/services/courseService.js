const { pool } = require('../config/database');

const getAllSubjects = async (userId = null) => {
    let query = `
        SELECT 
            s.id,
            s.title,
            s.description,
            s.thumbnail_url,
            s.created_at,
            COUNT(DISTINCT sec.id) as section_count,
            COUNT(DISTINCT v.id) as video_count
        FROM subjects s
        LEFT JOIN sections sec ON s.id = sec.subject_id
        LEFT JOIN videos v ON sec.id = v.section_id
        GROUP BY s.id
        ORDER BY s.created_at DESC
    `;

    const [subjects] = await pool.execute(query);

    // If userId provided, check enrollment status
    if (userId) {
        const [enrollments] = await pool.execute(
            'SELECT subject_id FROM enrollments WHERE user_id = ?',
            [userId]
        );
        
        const enrolledSubjectIds = new Set(enrollments.map(e => e.subject_id));
        
        return subjects.map(subject => ({
            ...subject,
            is_enrolled: enrolledSubjectIds.has(subject.id)
        }));
    }

    return subjects.map(subject => ({
        ...subject,
        is_enrolled: false
    }));
};

const getSubjectById = async (subjectId, userId = null) => {
    const [subjects] = await pool.execute(
        `SELECT 
            s.id,
            s.title,
            s.description,
            s.thumbnail_url,
            s.created_at
        FROM subjects s
        WHERE s.id = ?`,
        [subjectId]
    );

    if (subjects.length === 0) {
        const error = new Error('Subject not found');
        error.statusCode = 404;
        throw error;
    }

    const subject = subjects[0];

    // Check enrollment if userId provided
    if (userId) {
        const [enrollments] = await pool.execute(
            'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
            [userId, subjectId]
        );
        subject.is_enrolled = enrollments.length > 0;
    } else {
        subject.is_enrolled = false;
    }

    return subject;
};

const getSubjectTree = async (subjectId, userId = null) => {
    // Get subject info
    const subject = await getSubjectById(subjectId, userId);

    // Get sections with videos
    const [sections] = await pool.execute(
        `SELECT 
            sec.id,
            sec.title,
            sec.order_index
        FROM sections sec
        WHERE sec.subject_id = ?
        ORDER BY sec.order_index`,
        [subjectId]
    );

    // Get all videos for this subject
    const [videos] = await pool.execute(
        `SELECT 
            v.id,
            v.section_id,
            v.title,
            v.youtube_video_id,
            v.order_index,
            v.duration_seconds
        FROM videos v
        INNER JOIN sections sec ON v.section_id = sec.id
        WHERE sec.subject_id = ?
        ORDER BY v.order_index`,
        [subjectId]
    );

    // Get progress for user if provided
    let videoProgress = {};
    if (userId) {
        const [progress] = await pool.execute(
            `SELECT 
                vp.video_id,
                vp.is_completed,
                vp.last_position_seconds
            FROM video_progress vp
            INNER JOIN videos v ON vp.video_id = v.id
            INNER JOIN sections sec ON v.section_id = sec.id
            WHERE vp.user_id = ? AND sec.subject_id = ?`,
            [userId, subjectId]
        );
        
        progress.forEach(p => {
            videoProgress[p.video_id] = p;
        });
    }

    // Build tree structure
    const sectionsWithVideos = sections.map(section => {
        const sectionVideos = videos
            .filter(v => v.section_id === section.id)
            .map(v => ({
                id: v.id,
                title: v.title,
                youtube_video_id: v.youtube_video_id,
                order_index: v.order_index,
                duration_seconds: v.duration_seconds,
                progress: videoProgress[v.id] || {
                    is_completed: false,
                    last_position_seconds: 0
                }
            }));

        return {
            id: section.id,
            title: section.title,
            order_index: section.order_index,
            videos: sectionVideos
        };
    });

    return {
        ...subject,
        sections: sectionsWithVideos
    };
};

const getAllCourseVideos = async (subjectId) => {
    const [videos] = await pool.execute(
        `SELECT 
            v.id,
            v.section_id,
            v.title,
            v.order_index
        FROM videos v
        INNER JOIN sections sec ON v.section_id = sec.id
        WHERE sec.subject_id = ?
        ORDER BY sec.order_index, v.order_index`,
        [subjectId]
    );
    return videos;
};

module.exports = {
    getAllSubjects,
    getSubjectById,
    getSubjectTree,
    getAllCourseVideos
};
