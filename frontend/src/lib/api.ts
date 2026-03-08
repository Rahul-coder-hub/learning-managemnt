import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  mockAuthApi,
  mockCourseApi,
  mockVideoApi,
  mockProgressApi,
  mockEnrollmentApi
} from './mockApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Check if we should use mock API (for Vercel deployment or when backend is unavailable)
const USE_MOCK_API = typeof window !== 'undefined' && 
  (window.location.hostname.includes('vercel.app') || 
   window.location.hostname === 'localhost' && API_URL.includes('localhost:5000'));

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const getAccessToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

const getRefreshToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refreshToken');
  }
  return null;
};

const setTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const clearTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: { exp: number } = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getUserIdFromToken = (): number | null => {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const decoded: any = jwtDecode(token);
    return decoded.userId;
  } catch {
    return null;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    
    if (token) {
      if (isTokenExpired(token)) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/refresh`, {
              refreshToken,
            });
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;
            setTokens(accessToken, newRefreshToken);
            config.headers.Authorization = `Bearer ${accessToken}`;
          } catch {
            clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/refresh`, {
            refreshToken,
          });
          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          setTokens(accessToken, newRefreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch {
          clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      } else {
        clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (email: string, password: string, name: string) =>
    USE_MOCK_API ? mockAuthApi.register(email, password, name) : api.post('/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    USE_MOCK_API ? mockAuthApi.login(email, password) : api.post('/login', { email, password }),
  
  logout: (refreshToken: string) =>
    USE_MOCK_API ? mockAuthApi.logout(refreshToken) : api.post('/logout', { refreshToken }),
  
  getMe: () => {
    const token = getAccessToken();
    return USE_MOCK_API && token ? mockAuthApi.getMe(token) : api.get('/me');
  },
};

// Courses API
export const courseApi = {
  getAllSubjects: () => {
    const userId = getUserIdFromToken();
    return USE_MOCK_API ? mockCourseApi.getAllSubjects(userId || undefined) : api.get('/subjects');
  },
  getSubject: (subjectId: number) => {
    const userId = getUserIdFromToken();
    return USE_MOCK_API ? mockCourseApi.getSubject(subjectId, userId || undefined) : api.get(`/subjects/${subjectId}`);
  },
  getSubjectTree: (subjectId: number) => {
    const userId = getUserIdFromToken();
    return USE_MOCK_API ? mockCourseApi.getSubjectTree(subjectId, userId || undefined) : api.get(`/subjects/${subjectId}/tree`);
  },
};

// Videos API
export const videoApi = {
  getVideo: (videoId: number) => {
    const userId = getUserIdFromToken();
    return USE_MOCK_API ? mockVideoApi.getVideo(videoId, userId || undefined) : api.get(`/videos/${videoId}`);
  },
};

// Progress API
export const progressApi = {
  updateProgress: (videoId: number, lastPositionSeconds: number, isCompleted?: boolean) => {
    const userId = getUserIdFromToken();
    if (USE_MOCK_API && userId) {
      return mockProgressApi.updateProgress(videoId, userId, lastPositionSeconds, isCompleted);
    }
    return api.post(`/progress/videos/${videoId}`, { lastPositionSeconds, isCompleted });
  },
  getVideoProgress: (videoId: number) => {
    const userId = getUserIdFromToken();
    if (USE_MOCK_API && userId) {
      return mockProgressApi.getVideoProgress(videoId, userId);
    }
    return api.get(`/progress/videos/${videoId}`);
  },
  getCourseProgress: (subjectId: number) => {
    const userId = getUserIdFromToken();
    if (USE_MOCK_API && userId) {
      return mockProgressApi.getCourseProgress(subjectId, userId);
    }
    return api.get(`/progress/subjects/${subjectId}`);
  },
};

// Enrollment API
export const enrollmentApi = {
  enroll: (subjectId: number) => {
    const userId = getUserIdFromToken();
    if (USE_MOCK_API && userId) {
      return mockEnrollmentApi.enroll(subjectId, userId);
    }
    return api.post(`/enrollments/${subjectId}`);
  },
  getMyEnrollments: () => {
    const userId = getUserIdFromToken();
    if (USE_MOCK_API && userId) {
      return mockEnrollmentApi.getMyEnrollments(userId);
    }
    return api.get('/enrollments/my');
  },
  checkEnrollment: (subjectId: number) => {
    const userId = getUserIdFromToken();
    if (USE_MOCK_API && userId) {
      return mockEnrollmentApi.checkEnrollment(subjectId, userId);
    }
    return api.get(`/enrollments/${subjectId}/check`);
  },
};

export { setTokens, clearTokens, getAccessToken, getRefreshToken };
export default api;
