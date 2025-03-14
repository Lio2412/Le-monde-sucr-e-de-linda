import { z } from 'zod';
import { UserRole } from '@/lib/auth';

// Schéma de validation pour un utilisateur
export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').optional(),
  image: z.string().url('URL d\'image invalide').optional().nullable(),
  role: z.enum([UserRole.USER, UserRole.ADMIN]).default(UserRole.USER),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type User = z.infer<typeof userSchema>;

class UserService {
  private readonly API_URL = '/api/users';

  async getAll(params?: { 
    page?: number; 
    limit?: number;
    search?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.API_URL}?${queryParams}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des utilisateurs');
    }
    return response.json();
  }

  async getById(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
    return response.json();
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    // Valider les données avant l'envoi
    const validatedData = userSchema.omit({ id: true, createdAt: true, updatedAt: true }).parse(data);

    const response = await fetch(this.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création de l\'utilisateur');
    }
    return response.json();
  }

  async update(id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>) {
    // Valider les données avant l'envoi
    const validatedData = userSchema.partial().omit({ id: true, createdAt: true, updatedAt: true }).parse(data);

    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour de l\'utilisateur');
    }
    return response.json();
  }

  async delete(id: string) {
    const response = await fetch(`${this.API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de l\'utilisateur');
    }
    return response.json();
  }

  async getCurrentUser() {
    // Cette méthode récupère l'utilisateur actuellement connecté
    // Elle peut être implémentée en utilisant un token stocké localement
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        localStorage.removeItem('token');
        return null;
      }

      return response.json();
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
      localStorage.removeItem('token');
      return null;
    }
  }

  async login(email: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la connexion');
    }

    const data = await response.json();
    
    // Stocker le token dans le localStorage
    localStorage.setItem('token', data.token);
    
    return data.user;
  }

  async register(userData: { name: string; email: string; password: string }) {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'inscription');
    }

    return response.json();
  }

  logout() {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}

export const userService = new UserService(); 