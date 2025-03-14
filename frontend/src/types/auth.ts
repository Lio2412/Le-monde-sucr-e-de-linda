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
  token: string;
  user: User;
  isAdmin: boolean;
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

/**
 * Énumération des rôles utilisateur
 */
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

/**
 * Interface pour l'utilisateur
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

/**
 * Interface pour le payload du token JWT
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
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