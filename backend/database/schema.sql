-- Learning Management System Database Schema
-- Run this script to create the database and tables

CREATE DATABASE IF NOT EXISTS lms_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lms_database;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subjects (Courses) table
CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sections table (Course modules)
CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    INDEX idx_subject_order (subject_id, order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Videos (Lessons) table
CREATE TABLE IF NOT EXISTS videos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    youtube_url VARCHAR(255) NOT NULL,
    youtube_video_id VARCHAR(50) NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    duration_seconds INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    INDEX idx_section_order (section_id, order_index),
    INDEX idx_youtube_video_id (youtube_video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (user_id, subject_id),
    INDEX idx_user_enrollments (user_id),
    INDEX idx_subject_enrollments (subject_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Video progress table
CREATE TABLE IF NOT EXISTS video_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    video_id INT NOT NULL,
    last_position_seconds INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_progress (user_id, video_id),
    INDEX idx_user_progress (user_id),
    INDEX idx_video_progress (video_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data
-- Sample Course: Web Development Fundamentals
INSERT INTO subjects (id, title, description, thumbnail_url) VALUES 
(1, 'Web Development Fundamentals', 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800');

-- Sections for Web Development
INSERT INTO sections (id, subject_id, title, order_index) VALUES
(1, 1, 'Introduction to HTML', 1),
(2, 1, 'CSS Styling Basics', 2),
(3, 1, 'JavaScript Fundamentals', 3);

-- Videos for HTML Section
INSERT INTO videos (id, section_id, title, youtube_url, youtube_video_id, order_index, duration_seconds) VALUES
(1, 1, 'What is HTML?', 'https://www.youtube.com/embed/ok-plXXHlWw', 'ok-plXXHlWw', 1, 600),
(2, 1, 'HTML Document Structure', 'https://www.youtube.com/embed/UB1O30fR-EE', 'UB1O30fR-EE', 2, 720),
(3, 1, 'Common HTML Tags', 'https://www.youtube.com/embed/Wm6CUkswsNw', 'Wm6CUkswsNw', 3, 900);

-- Videos for CSS Section
INSERT INTO videos (id, section_id, title, youtube_url, youtube_video_id, order_index, duration_seconds) VALUES
(4, 2, 'Introduction to CSS', 'https://www.youtube.com/embed/yfoY53QXEnI', 'yfoY53QXEnI', 1, 800),
(5, 2, 'CSS Selectors', 'https://www.youtube.com/embed/l1mER1bV0N0', 'l1mER1bV0N0', 2, 650);

-- Videos for JavaScript Section
INSERT INTO videos (id, section_id, title, youtube_url, youtube_video_id, order_index, duration_seconds) VALUES
(6, 3, 'JavaScript Basics', 'https://www.youtube.com/embed/W6NZfCO5SIk', 'W6NZfCO5SIk', 1, 3000),
(7, 3, 'Variables and Data Types', 'https://www.youtube.com/embed/c-I5S_zTwAc', 'c-I5S_zTwAc', 2, 1800);

-- Sample Course: React for Beginners
INSERT INTO subjects (id, title, description, thumbnail_url) VALUES 
(2, 'React for Beginners', 'Master React.js and build interactive user interfaces.', 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800');

-- Sections for React
INSERT INTO sections (id, subject_id, title, order_index) VALUES
(4, 2, 'Getting Started with React', 1),
(5, 2, 'Components and Props', 2);

-- Videos for React Section 1
INSERT INTO videos (id, section_id, title, youtube_url, youtube_video_id, order_index, duration_seconds) VALUES
(8, 4, 'React Introduction', 'https://www.youtube.com/embed/w7ejDZ8SWv8', 'w7ejDZ8SWv8', 1, 2700),
(9, 4, 'Setting Up React Environment', 'https://www.youtube.com/embed/Rh3tobg7hEo', 'Rh3tobg7hEo', 2, 1500);

-- Videos for React Section 2
INSERT INTO videos (id, section_id, title, youtube_url, youtube_video_id, order_index, duration_seconds) VALUES
(10, 5, 'Understanding Components', 'https://www.youtube.com/embed/Cla1WwguArA', 'Cla1WwguArA', 1, 2400);
