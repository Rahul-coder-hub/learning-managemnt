const { pool } = require('../config/database');

const enrollUser = async (userId, subjectId) => {
    // Check if already enrolled
    const [existing] = await pool.execute(
        'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
    );

    if (existing.length > 0) {
        return { alreadyEnrolled: true };
    }

    // Check if subject exists
    const [subjects] = await pool.execute(
        'SELECT id FROM subjects WHERE id = ?',
        [subjectId]
    );

    if (subjects.length === 0) {
        const error = new Error('Subject not found');
        error.statusCode = 404;
        throw error;
    }

    // Create enrollment
    await pool.execute(
        'INSERT INTO enrollments (user_id, subject_id) VALUES (?, ?)',
        [userId, subjectId]
    );

    return { alreadyEnrolled: false };
};

const isEnrolled = async (userId, subjectId) => {
    const [enrollments] = await pool.execute(
        'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
    );

    return enrollments.length > 0;
};

const getUserEnrollments = async (userId) => {
    const [enrollments] = await pool.execute(
        `SELECT 
            e.id,
            e.subject_id,
            e.enrolled_at,
            s.title as subject_title,
            s.thumbnail_url
        FROM enrollments e
        INNER JOIN subjects s ON e.subject_id = s.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC`,
        [userId]
    );

    return enrollments;
};

const unenrollUser = async (userId, subjectId) => {
    const [result] = await pool.execute(
        'DELETE FROM enrollments WHERE user_id = ? AND subject_id = ?',
        [userId, subjectId]
    );

    return result.affectedRows > 0;
};

module.exports = {
    enrollUser,
    isEnrolled,
    getUserEnrollments,
    unenrollUser
};
