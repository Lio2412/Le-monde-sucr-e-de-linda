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

export interface AuthContextType {
  user: UserData | null;
  setUser: Dispatch<SetStateAction<UserData | null>>;
  loading: boolean;
  error: string | null;
  isAuthenticated: () => boolean;
  login: (credentials: { email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  hasRole: (roleName: string) => boolean;
  register: (data: RegisterData) => Promise<any>;
  getCurrentUser: () => Promise<any>;
} 