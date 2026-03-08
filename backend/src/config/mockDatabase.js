// Mock Database for demonstration purposes
// In production, replace with actual MySQL connection

const mockData = {
  users: [
    {
      id: 1,
      email: 'test@example.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G', // password: "password123"
      name: 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  refresh_tokens: [],
  subjects: [
    {
      id: 1,
      title: 'Web Development Fundamentals',
      description: 'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
      thumbnail_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      title: 'React for Beginners',
      description: 'Master React.js and build interactive user interfaces.',
      thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      created_at: new Date(),
      updated_at: new Date()
    }
  ],
  sections: [
    { id: 1, subject_id: 1, title: 'Introduction to HTML', order_index: 1 },
    { id: 2, subject_id: 1, title: 'CSS Styling Basics', order_index: 2 },
    { id: 3, subject_id: 1, title: 'JavaScript Fundamentals', order_index: 3 },
    { id: 4, subject_id: 2, title: 'Getting Started with React', order_index: 1 },
    { id: 5, subject_id: 2, title: 'Components and Props', order_index: 2 }
  ],
  videos: [
    { id: 1, section_id: 1, title: 'What is HTML?', youtube_url: 'https://www.youtube.com/embed/ok-plXXHlWw', youtube_video_id: 'ok-plXXHlWw', order_index: 1, duration_seconds: 600 },
    { id: 2, section_id: 1, title: 'HTML Document Structure', youtube_url: 'https://www.youtube.com/embed/UB1O30fR-EE', youtube_video_id: 'UB1O30fR-EE', order_index: 2, duration_seconds: 720 },
    { id: 3, section_id: 1, title: 'Common HTML Tags', youtube_url: 'https://www.youtube.com/embed/Wm6CUkswsNw', youtube_video_id: 'Wm6CUkswsNw', order_index: 3, duration_seconds: 900 },
    { id: 4, section_id: 2, title: 'Introduction to CSS', youtube_url: 'https://www.youtube.com/embed/yfoY53QXEnI', youtube_video_id: 'yfoY53QXEnI', order_index: 1, duration_seconds: 800 },
    { id: 5, section_id: 2, title: 'CSS Selectors', youtube_url: 'https://www.youtube.com/embed/l1mER1bV0N0', youtube_video_id: 'l1mER1bV0N0', order_index: 2, duration_seconds: 650 },
    { id: 6, section_id: 3, title: 'JavaScript Basics', youtube_url: 'https://www.youtube.com/embed/W6NZfCO5SIk', youtube_video_id: 'W6NZfCO5SIk', order_index: 1, duration_seconds: 3000 },
    { id: 7, section_id: 3, title: 'Variables and Data Types', youtube_url: 'https://www.youtube.com/embed/c-I5S_zTwAc', youtube_video_id: 'c-I5S_zTwAc', order_index: 2, duration_seconds: 1800 },
    { id: 8, section_id: 4, title: 'React Introduction', youtube_url: 'https://www.youtube.com/embed/w7ejDZ8SWv8', youtube_video_id: 'w7ejDZ8SWv8', order_index: 1, duration_seconds: 2700 },
    { id: 9, section_id: 4, title: 'Setting Up React Environment', youtube_url: 'https://www.youtube.com/embed/Rh3tobg7hEo', youtube_video_id: 'Rh3tobg7hEo', order_index: 2, duration_seconds: 1500 },
    { id: 10, section_id: 5, title: 'Understanding Components', youtube_url: 'https://www.youtube.com/embed/Cla1WwguArA', youtube_video_id: 'Cla1WwguArA', order_index: 1, duration_seconds: 2400 }
  ],
  enrollments: [
    { id: 1, user_id: 1, subject_id: 1, enrolled_at: new Date() },
    { id: 2, user_id: 1, subject_id: 2, enrolled_at: new Date() }
  ],
  video_progress: []
};

// Mock query executor
const execute = async (sql, params) => {
  // Simple SQL parser for common operations
  sql = sql.trim().toLowerCase();
  
  // Normalize params to handle string/number comparison
  const normalizeParam = (p) => {
    if (typeof p === 'string' && !isNaN(p)) return parseInt(p);
    return p;
  };
  const normalizedParams = params ? params.map(normalizeParam) : [];
  
  // SELECT operations
  if (sql.startsWith('select')) {
    // Complex JOIN query for getAllSubjects
    if (sql.includes('count(distinct sec.id)') && sql.includes('from subjects')) {
      const subjectsWithCounts = mockData.subjects.map(s => {
        const sectionCount = mockData.sections.filter(sec => sec.subject_id === s.id).length;
        const videoCount = mockData.videos.filter(v => {
          const section = mockData.sections.find(sec => sec.id === v.section_id);
          return section && section.subject_id === s.id;
        }).length;
        return {
          ...s,
          section_count: sectionCount,
          video_count: videoCount
        };
      });
      return [subjectsWithCounts];
    }

    if (sql.includes('from users')) {
      if (sql.includes('where email = ?')) {
        return [mockData.users.filter(u => u.email === normalizedParams[0])];
      }
      if (sql.includes('where id = ?')) {
        return [mockData.users.filter(u => u.id === normalizedParams[0])];
      }
      return [mockData.users];
    }
    
    if (sql.includes('from subjects')) {
      if (sql.includes('where id = ?')) {
        return [mockData.subjects.filter(s => s.id === normalizedParams[0])];
      }
      // Return subjects with counts for listing
      const subjectsWithCounts = mockData.subjects.map(s => {
        const sectionCount = mockData.sections.filter(sec => sec.subject_id === s.id).length;
        const videoCount = mockData.videos.filter(v => {
          const section = mockData.sections.find(sec => sec.id === v.section_id);
          return section && section.subject_id === s.id;
        }).length;
        return {
          ...s,
          section_count: sectionCount,
          video_count: videoCount
        };
      });
      return [subjectsWithCounts];
    }
    
    if (sql.includes('from sections')) {
      if (sql.includes('where subject_id = ?')) {
        return [mockData.sections.filter(s => s.subject_id === normalizedParams[0]).sort((a, b) => a.order_index - b.order_index)];
      }
      return [mockData.sections];
    }
    
    if (sql.includes('from videos')) {
      // Handle double JOIN query: videos -> sections -> subjects (getVideoById)
      if (sql.includes('inner join sections') && sql.includes('inner join subjects') && sql.includes('where v.id = ?')) {
        const videoId = normalizedParams[0];
        const video = mockData.videos.find(v => v.id === videoId);
        if (!video) return [[]];
        const section = mockData.sections.find(s => s.id === video.section_id);
        const subject = section ? mockData.subjects.find(s => s.id === section.subject_id) : null;
        return [[{ ...video, subject_id: section ? section.subject_id : null, subject_title: subject ? subject.title : null }]];
      }
      if (sql.includes('where id = ?') || sql.includes('where v.id = ?')) {
        const videoId = normalizedParams[0];
        const video = mockData.videos.find(v => v.id === videoId);
        if (!video) return [[]];
        const section = mockData.sections.find(s => s.id === video.section_id);
        const subject = section ? mockData.subjects.find(s => s.id === section.subject_id) : null;
        return [[{ ...video, subject_id: section ? section.subject_id : null, subject_title: subject ? subject.title : null }]];
      }
      if (sql.includes('where section_id = ?')) {
        return [mockData.videos.filter(v => v.section_id === normalizedParams[0]).sort((a, b) => a.order_index - b.order_index)];
      }
      // Handle JOIN with sections for subject_id filter (getAllCourseVideos)
      if (sql.includes('inner join sections')) {
        const subjectId = normalizedParams[0];
        const sectionsForSubject = mockData.sections.filter(s => s.subject_id === subjectId);
        const videos = mockData.videos.filter(v => {
          return sectionsForSubject.some(s => s.id === v.section_id);
        }).map(v => {
          const section = mockData.sections.find(s => s.id === v.section_id);
          return { ...v, subject_id: section ? section.subject_id : null };
        }).sort((a, b) => {
          const sA = mockData.sections.find(s => s.id === a.section_id);
          const sB = mockData.sections.find(s => s.id === b.section_id);
          if (sA && sB && sA.order_index !== sB.order_index) return sA.order_index - sB.order_index;
          return a.order_index - b.order_index;
        });
        return [videos];
      }
      return [mockData.videos];
    }
    
    if (sql.includes('from enrollments')) {
      if (sql.includes('where user_id = ? and subject_id = ?')) {
        return [mockData.enrollments.filter(e => e.user_id === normalizedParams[0] && e.subject_id === normalizedParams[1])];
      }
      if (sql.includes('where user_id = ?')) {
        return [mockData.enrollments.filter(e => e.user_id === normalizedParams[0])];
      }
      return [mockData.enrollments];
    }
    
    if (sql.includes('from video_progress')) {
      if (sql.includes('where user_id = ? and video_id = ?')) {
        return [mockData.video_progress.filter(p => p.user_id === normalizedParams[0] && p.video_id === normalizedParams[1])];
      }
      if (sql.includes('where user_id = ?')) {
        return [mockData.video_progress.filter(p => p.user_id === normalizedParams[0])];
      }
      return [mockData.video_progress];
    }
    
    if (sql.includes('from refresh_tokens')) {
      if (sql.includes('where token = ?')) {
        return [mockData.refresh_tokens.filter(t => t.token === normalizedParams[0] && new Date(t.expires_at) > new Date())];
      }
      return [mockData.refresh_tokens];
    }
  }
  
  // INSERT operations
  if (sql.startsWith('insert')) {
    if (sql.includes('into users')) {
      const newUser = {
        id: mockData.users.length + 1,
        email: params[0],
        password_hash: params[1],
        name: params[2],
        created_at: new Date(),
        updated_at: new Date()
      };
      mockData.users.push(newUser);
      return [{ insertId: newUser.id }];
    }
    
    if (sql.includes('into enrollments')) {
      const newEnrollment = {
        id: mockData.enrollments.length + 1,
        user_id: normalizedParams[0],
        subject_id: normalizedParams[1],
        enrolled_at: new Date()
      };
      mockData.enrollments.push(newEnrollment);
      return [{ insertId: newEnrollment.id }];
    }
    
    if (sql.includes('into video_progress')) {
      const newProgress = {
        id: mockData.video_progress.length + 1,
        user_id: normalizedParams[0],
        video_id: normalizedParams[1],
        last_position_seconds: normalizedParams[2],
        is_completed: normalizedParams[3],
        created_at: new Date(),
        updated_at: new Date()
      };
      mockData.video_progress.push(newProgress);
      return [{ insertId: newProgress.id }];
    }
    
    if (sql.includes('into refresh_tokens')) {
      const newToken = {
        id: mockData.refresh_tokens.length + 1,
        user_id: params[0],
        token: params[1],
        expires_at: params[2],
        created_at: new Date()
      };
      mockData.refresh_tokens.push(newToken);
      return [{ insertId: newToken.id }];
    }
  }
  
  // UPDATE operations
  if (sql.startsWith('update')) {
    if (sql.includes('video_progress')) {
      const progress = mockData.video_progress.find(p => p.user_id === normalizedParams[2] && p.video_id === normalizedParams[3]);
      if (progress) {
        progress.last_position_seconds = normalizedParams[0];
        progress.is_completed = normalizedParams[1];
        progress.updated_at = new Date();
      }
      return [{ affectedRows: progress ? 1 : 0 }];
    }
  }
  
  // DELETE operations
  if (sql.startsWith('delete')) {
    if (sql.includes('from refresh_tokens')) {
      if (sql.includes('where token = ?')) {
        const index = mockData.refresh_tokens.findIndex(t => t.token === normalizedParams[0]);
        if (index > -1) {
          mockData.refresh_tokens.splice(index, 1);
        }
        return [{ affectedRows: index > -1 ? 1 : 0 }];
      }
      if (sql.includes('where user_id = ?')) {
        const initialLength = mockData.refresh_tokens.length;
        mockData.refresh_tokens = mockData.refresh_tokens.filter(t => t.user_id !== normalizedParams[0]);
        return [{ affectedRows: initialLength - mockData.refresh_tokens.length }];
      }
    }
  }
  
  return [[]];
};

const pool = {
  execute
};

const testConnection = async () => {
  console.log('Using mock database for demonstration');
  console.log('Pre-loaded user: test@example.com / password123');
};

module.exports = { pool, testConnection, mockData };
