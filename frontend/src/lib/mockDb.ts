// Mock Database for Vercel serverless deployment
// This replaces the Express backend for serverless environments

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Subject {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface Section {
  id: number;
  subject_id: number;
  title: string;
  order_index: number;
}

export interface Video {
  id: number;
  section_id: number;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  order_index: number;
  duration_seconds: number;
}

export interface Enrollment {
  id: number;
  user_id: number;
  subject_id: number;
  enrolled_at: Date;
}

export interface VideoProgress {
  id: number;
  user_id: number;
  video_id: number;
  last_position_seconds: number;
  is_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

// In-memory data store (resets on each serverless invocation)
const mockData = {
  users: [
    {
      id: 1,
      email: 'test@example.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYA.qGZvKG6G',
      name: 'Test User',
      created_at: new Date(),
      updated_at: new Date()
    }
  ] as User[],
  refresh_tokens: [] as RefreshToken[],
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
  ] as Subject[],
  sections: [
    { id: 1, subject_id: 1, title: 'Introduction to HTML', order_index: 1 },
    { id: 2, subject_id: 1, title: 'CSS Styling Basics', order_index: 2 },
    { id: 3, subject_id: 1, title: 'JavaScript Fundamentals', order_index: 3 },
    { id: 4, subject_id: 2, title: 'Getting Started with React', order_index: 1 },
    { id: 5, subject_id: 2, title: 'Components and Props', order_index: 2 }
  ] as Section[],
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
  ] as Video[],
  enrollments: [
    { id: 1, user_id: 1, subject_id: 1, enrolled_at: new Date() },
    { id: 2, user_id: 1, subject_id: 2, enrolled_at: new Date() }
  ] as Enrollment[],
  video_progress: [] as VideoProgress[]
};

// Helper functions
export const getUserByEmail = (email: string) => mockData.users.find(u => u.email === email);
export const getUserById = (id: number) => mockData.users.find(u => u.id === id);
export const addUser = (user: User) => mockData.users.push(user);

export const getSubjectById = (id: number) => mockData.subjects.find(s => s.id === id);
export const getAllSubjects = () => mockData.subjects;

export const getSectionsBySubjectId = (subjectId: number) => 
  mockData.sections.filter(s => s.subject_id === subjectId).sort((a, b) => a.order_index - b.order_index);

export const getVideosBySectionId = (sectionId: number) =>
  mockData.videos.filter(v => v.section_id === sectionId).sort((a, b) => a.order_index - b.order_index);

export const getVideoById = (id: number) => mockData.videos.find(v => v.id === id);

export const getVideosBySubjectId = (subjectId: number) => {
  const sections = getSectionsBySubjectId(subjectId);
  return mockData.videos.filter(v => sections.some(s => s.id === v.section_id));
};

export const getEnrollment = (userId: number, subjectId: number) =>
  mockData.enrollments.find(e => e.user_id === userId && e.subject_id === subjectId);

export const addEnrollment = (enrollment: Enrollment) => mockData.enrollments.push(enrollment);

export const getProgress = (userId: number, videoId: number) =>
  mockData.video_progress.find(p => p.user_id === userId && p.video_id === videoId);

export const updateProgress = (progress: VideoProgress) => {
  const index = mockData.video_progress.findIndex(p => p.id === progress.id);
  if (index >= 0) {
    mockData.video_progress[index] = progress;
  } else {
    mockData.video_progress.push(progress);
  }
};

export const getRefreshToken = (token: string) =>
  mockData.refresh_tokens.find(t => t.token === token && new Date(t.expires_at) > new Date());

export const addRefreshToken = (token: RefreshToken) => mockData.refresh_tokens.push(token);

export const removeRefreshToken = (token: string) => {
  const index = mockData.refresh_tokens.findIndex(t => t.token === token);
  if (index >= 0) mockData.refresh_tokens.splice(index, 1);
};

export default mockData;
