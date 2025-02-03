import { Dispatch, SetStateAction } from 'react';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  pseudo: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: UserData;
    token: string;
  };
  message?: string;
}

export interface UserData {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  roles: Array<{
    role: {
      nom: string;
      description: string;
    };
  }>;
}

export interface AuthService {
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  getMe: (token: string) => Promise<AuthResponse>;
  logout: () => void;
}

export interface User {
  id: number;
  email: string;
  nom: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginCredentials {
  email: string;
  motDePasse: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
} 