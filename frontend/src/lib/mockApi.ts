// Client-side Mock API for Vercel deployment
// Simulates backend responses using localStorage and in-memory data

import mockData, { 
  getUserByEmail, getUserById, addUser,
  getSubjectById, getAllSubjects, getSectionsBySubjectId,
  getVideosBySectionId, getVideoById, getVideosBySubjectId,
  getEnrollment, addEnrollment, getProgress, updateProgress,
  getRefreshToken, addRefreshToken, removeRefreshToken,
  User, Subject, Section, Video, Enrollment, VideoProgress
} from './mockDb';

// Simulated JWT tokens (base64 encoded JSON)
const createToken = (payload: object, expiresIn: string = '15m') => {
  const exp = expiresIn === '15m' ? Date.now() + 15 * 60 * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000;
  return btoa(JSON.stringify({ ...payload, exp }));
};

const verifyToken = (token: string) => {
  try {
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) throw new Error('Token expired');
    return decoded;
  } catch {
    throw new Error('Invalid token');
  }
};

// Hash password (simple hash for demo)
const hashPassword = async (password: string) => {
  // In production, use bcrypt. For demo, use simple hash
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

const comparePassword = async (password: string, hash: string) => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// Mock API responses
export const mockAuthApi = {
  register: async (email: string, password: string, name: string) => {
    // Check if user exists
    if (getUserByEmail(email)) {
      throw { response: { status: 409, data: { message: 'Email already registered' } } };
    }
    
    const newUser: User = {
      id: mockData.users.length + 1,
      email,
      password_hash: await hashPassword(password),
      name,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    addUser(newUser);
    
    const accessToken = createToken({ userId: newUser.id, email: newUser.email });
    const refreshToken = createToken({ userId: newUser.id, type: 'refresh' }, '7d');
    
    addRefreshToken({
      id: mockData.refresh_tokens.length + 1,
      user_id: newUser.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date()
    });
    
    return {
      data: {
        success: true,
        data: {
          user: { id: newUser.id, email: newUser.email, name: newUser.name },
          accessToken,
          refreshToken
        }
      }
    };
  },
  
  login: async (email: string, password: string) => {
    const user = getUserByEmail(email);
    if (!user || !(await comparePassword(password, user.password_hash))) {
      throw { response: { status: 401, data: { message: 'Invalid email or password' } } };
    }
    
    const accessToken = createToken({ userId: user.id, email: user.email });
    const refreshToken = createToken({ userId: user.id, type: 'refresh' }, '7d');
    
    addRefreshToken({
      id: mockData.refresh_tokens.length + 1,
      user_id: user.id,
      token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date()
    });
    
    return {
      data: {
        success: true,
        data: {
          user: { id: user.id, email: user.email, name: user.name },
          accessToken,
          refreshToken
        }
      }
    };
  },
  
  refresh: async (refreshToken: string) => {
    const tokenData = getRefreshToken(refreshToken);
    if (!tokenData) {
      throw { response: { status: 401, data: { message: 'Invalid or expired refresh token' } } };
    }
    
    const user = getUserById(tokenData.user_id);
    if (!user) {
      throw { response: { status: 401, data: { message: 'User not found' } } };
    }
    
    const accessToken = createToken({ userId: user.id, email: user.email });
    const newRefreshToken = createToken({ userId: user.id, type: 'refresh' }, '7d');
    
    removeRefreshToken(refreshToken);
    addRefreshToken({
      id: mockData.refresh_tokens.length + 1,
      user_id: user.id,
      token: newRefreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date()
    });
    
    return {
      data: {
        success: true,
        data: { accessToken, refreshToken: newRefreshToken }
      }
    };
  },
  
  logout: async (refreshToken: string) => {
    removeRefreshToken(refreshToken);
    return { data: { success: true } };
  },
  
  getMe: async (token: string) => {
    const decoded = verifyToken(token);
    const user = getUserById(decoded.userId);
    if (!user) {
      throw { response: { status: 404, data: { message: 'User not found' } } };
    }
    return {
      data: {
        success: true,
        data: { id: user.id, email: user.email, name: user.name }
      }
    };
  }
};

export const mockCourseApi = {
  getAllSubjects: async (userId?: number) => {
    const subjects = getAllSubjects().map(s => {
      const sectionCount = getSectionsBySubjectId(s.id).length;
      const videoCount = getVideosBySubjectId(s.id).length;
      const isEnrolled = userId ? !!getEnrollment(userId, s.id) : false;
      return {
        ...s,
        section_count: sectionCount,
        video_count: videoCount,
        is_enrolled: isEnrolled
      };
    });
    return { data: { success: true, data: subjects } };
  },
  
  getSubject: async (subjectId: number, userId?: number) => {
    const subject = getSubjectById(subjectId);
    if (!subject) {
      throw { response: { status: 404, data: { message: 'Subject not found' } } };
    }
    const isEnrolled = userId ? !!getEnrollment(userId, subjectId) : false;
    return { data: { success: true, data: { ...subject, is_enrolled: isEnrolled } } };
  },
  
  getSubjectTree: async (subjectId: number, userId?: number) => {
    const subject = getSubjectById(subjectId);
    if (!subject) {
      throw { response: { status: 404, data: { message: 'Subject not found' } } };
    }
    
    if (userId && !getEnrollment(userId, subjectId)) {
      throw { response: { status: 403, data: { message: 'You must be enrolled in this course' } } };
    }
    
    const sections = getSectionsBySubjectId(subjectId).map(section => {
      const videos = getVideosBySectionId(section.id).map(video => {
        const progress = userId ? getProgress(userId, video.id) : null;
        return {
          id: video.id,
          title: video.title,
          youtube_video_id: video.youtube_video_id,
          order_index: video.order_index,
          duration_seconds: video.duration_seconds,
          progress: progress || { is_completed: false, last_position_seconds: 0 }
        };
      });
      return { ...section, videos };
    });
    
    return {
      data: {
        success: true,
        data: { ...subject, sections, is_enrolled: true }
      }
    };
  }
};

export const mockVideoApi = {
  getVideo: async (videoId: number, userId?: number) => {
    const video = getVideoById(videoId);
    if (!video) {
      throw { response: { status: 404, data: { message: 'Video not found' } } };
    }
    
    const section = mockData.sections.find(s => s.id === video.section_id);
    const subject = section ? getSubjectById(section.subject_id) : null;
    
    if (!subject) {
      throw { response: { status: 404, data: { message: 'Subject not found' } } };
    }
    
    // Check enrollment for logged-in users
    if (userId && !getEnrollment(userId, subject.id)) {
      throw { response: { status: 403, data: { message: 'You must be enrolled in this course' } } };
    }
    
    // Get all videos in course for navigation
    const courseVideos = getVideosBySubjectId(subject.id);
    const currentIndex = courseVideos.findIndex(v => v.id === videoId);
    
    // Check if locked
    let locked = false;
    if (currentIndex > 0 && userId) {
      const prevVideo = courseVideos[currentIndex - 1];
      const prevProgress = getProgress(userId, prevVideo.id);
      locked = !prevProgress?.is_completed;
    }
    
    const progress = userId ? getProgress(userId, videoId) : null;
    
    return {
      data: {
        success: true,
        data: {
          id: video.id,
          title: video.title,
          youtube_url: video.youtube_url,
          youtube_video_id: video.youtube_video_id,
          duration_seconds: video.duration_seconds,
          subject_id: subject.id,
          subject_title: subject.title,
          section_id: video.section_id,
          order_index: video.order_index,
          locked,
          previous_video_id: currentIndex > 0 ? courseVideos[currentIndex - 1].id : null,
          next_video_id: currentIndex < courseVideos.length - 1 ? courseVideos[currentIndex + 1].id : null,
          progress: progress || { last_position_seconds: 0, is_completed: false }
        }
      }
    };
  }
};

export const mockProgressApi = {
  updateProgress: async (videoId: number, userId: number, lastPositionSeconds: number, isCompleted?: boolean) => {
    const video = getVideoById(videoId);
    if (!video) {
      throw { response: { status: 404, data: { message: 'Video not found' } } };
    }
    
    const existingProgress = getProgress(userId, videoId);
    const progress: VideoProgress = {
      id: existingProgress?.id || mockData.video_progress.length + 1,
      user_id: userId,
      video_id: videoId,
      last_position_seconds: lastPositionSeconds,
      is_completed: isCompleted !== undefined ? isCompleted : (existingProgress?.is_completed || false),
      created_at: existingProgress?.created_at || new Date(),
      updated_at: new Date()
    };
    
    updateProgress(progress);
    
    return {
      data: {
        success: true,
        data: {
          id: progress.id,
          last_position_seconds: progress.last_position_seconds,
          is_completed: progress.is_completed,
          updated_at: progress.updated_at
        }
      }
    };
  },
  
  getVideoProgress: async (videoId: number, userId: number) => {
    const progress = getProgress(userId, videoId);
    return {
      data: {
        success: true,
        data: progress || { last_position_seconds: 0, is_completed: false }
      }
    };
  },
  
  getCourseProgress: async (subjectId: number, userId: number) => {
    const videos = getVideosBySubjectId(subjectId);
    const completedVideos = videos.filter(v => {
      const progress = getProgress(userId, v.id);
      return progress?.is_completed;
    }).length;
    
    const percentage = videos.length > 0 ? Math.round((completedVideos / videos.length) * 100) : 0;
    
    return {
      data: {
        success: true,
        data: {
          total_videos: videos.length,
          completed_videos: completedVideos,
          progress_percentage: percentage
        }
      }
    };
  }
};

export const mockEnrollmentApi = {
  enroll: async (subjectId: number, userId: number) => {
    const subject = getSubjectById(subjectId);
    if (!subject) {
      throw { response: { status: 404, data: { message: 'Subject not found' } } };
    }
    
    if (getEnrollment(userId, subjectId)) {
      throw { response: { status: 409, data: { message: 'Already enrolled' } } };
    }
    
    addEnrollment({
      id: mockData.enrollments.length + 1,
      user_id: userId,
      subject_id: subjectId,
      enrolled_at: new Date()
    });
    
    return { data: { success: true, message: 'Enrolled successfully' } };
  },
  
  getMyEnrollments: async (userId: number) => {
    const enrollments = mockData.enrollments
      .filter(e => e.user_id === userId)
      .map(e => {
        const subject = getSubjectById(e.subject_id);
        return {
          id: e.id,
          subject_id: e.subject_id,
          enrolled_at: e.enrolled_at,
          subject_title: subject?.title,
          thumbnail_url: subject?.thumbnail_url
        };
      });
    return { data: { success: true, data: enrollments } };
  },
  
  checkEnrollment: async (subjectId: number, userId: number) => {
    const isEnrolled = !!getEnrollment(userId, subjectId);
    return { data: { success: true, data: { is_enrolled: isEnrolled } } };
  }
};
