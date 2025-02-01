export interface Role {
  role: {
    nom: string;
    description: string;
  };
}

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  roles: Role[];
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface LoginCredentials {
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