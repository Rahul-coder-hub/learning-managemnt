'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, setTokens, clearTokens, getAccessToken } from '@/lib/api';
import { User, AuthResponse } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      const token = getAccessToken();
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          clearTokens();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      const { user, accessToken, refreshToken }: AuthResponse = response.data.data;
      
      setTokens(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      router.push('/courses');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  }, [router]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register(email, password, name);
      const { user, accessToken, refreshToken }: AuthResponse = response.data.data;
      
      setTokens(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      router.push('/courses');
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors
    } finally {
      clearTokens();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const isAuthenticated = !!user;

  return {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
  };
};
