import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    
    if (token) {
      // Check if token is expired and refresh if needed
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
    api.post('/register', { email, password, name }),
  
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  
  logout: (refreshToken: string) =>
    api.post('/logout', { refreshToken }),
  
  getMe: () => api.get('/me'),
};

// Courses API
export const courseApi = {
  getAllSubjects: () => api.get('/subjects'),
  getSubject: (subjectId: number) => api.get(`/subjects/${subjectId}`),
  getSubjectTree: (subjectId: number) => api.get(`/subjects/${subjectId}/tree`),
};

// Videos API
export const videoApi = {
  getVideo: (videoId: number) => api.get(`/videos/${videoId}`),
};

// Progress API
export const progressApi = {
  updateProgress: (videoId: number, lastPositionSeconds: number, isCompleted?: boolean) =>
    api.post(`/progress/videos/${videoId}`, { lastPositionSeconds, isCompleted }),
  getVideoProgress: (videoId: number) => api.get(`/progress/videos/${videoId}`),
  getCourseProgress: (subjectId: number) => api.get(`/progress/subjects/${subjectId}`),
};

// Enrollment API
export const enrollmentApi = {
  enroll: (subjectId: number) => api.post(`/enrollments/${subjectId}`),
  getMyEnrollments: () => api.get('/enrollments/my'),
  checkEnrollment: (subjectId: number) => api.get(`/enrollments/${subjectId}/check`),
};

export { setTokens, clearTokens, getAccessToken, getRefreshToken };
export default api;
