export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Subject {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  created_at: string;
  section_count?: number;
  video_count?: number;
  is_enrolled?: boolean;
}

export interface Section {
  id: number;
  title: string;
  order_index: number;
  videos: VideoSummary[];
}

export interface VideoSummary {
  id: number;
  title: string;
  youtube_video_id: string;
  order_index: number;
  duration_seconds: number;
  progress?: {
    is_completed: boolean;
    last_position_seconds: number;
  };
}

export interface Video {
  id: number;
  title: string;
  youtube_url: string;
  youtube_video_id: string;
  duration_seconds: number;
  subject_id: number;
  subject_title: string;
  section_id: number;
  order_index: number;
  locked: boolean;
  previous_video_id: number | null;
  next_video_id: number | null;
  progress: {
    last_position_seconds: number;
    is_completed: boolean;
  };
}

export interface SubjectTree extends Subject {
  sections: Section[];
}

export interface Progress {
  last_position_seconds: number;
  is_completed: boolean;
  updated_at?: string;
}

export interface CourseProgress {
  total_videos: number;
  completed_videos: number;
  progress_percentage: number;
}

export interface Enrollment {
  id: number;
  subject_id: number;
  enrolled_at: string;
  subject_title: string;
  thumbnail_url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}
