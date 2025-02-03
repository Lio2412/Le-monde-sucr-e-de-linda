import { useState, useCallback } from 'react';
import axios from 'axios';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data } = await axios.post<AuthResponse>('/api/auth/login', credentials);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.post('/api/auth/register', data);
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      localStorage.removeItem('token');
      setUser(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const { data } = await axios.get<User>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(data);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      const message = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth
  };
} 