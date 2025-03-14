import axios from 'axios';
import { adminService } from './admin.service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  pseudo: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  pseudo: string;
  role: string;
}

export interface UpdateUserData {
  email?: string;
  nom?: string;
  prenom?: string;
  pseudo?: string;
  role?: string;
  password?: string;
}

class UserService {
  private static instance: UserService;
  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Vérifie si un token admin existe
  private isAdminMode(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('adminToken');
    }
    return false;
  }

  async getAllUsers(): Promise<User[]> {
    try {
      // Si nous sommes en mode admin, utilisez l'API admin
      if (this.isAdminMode()) {
        return await adminService.getUsers();
      }
      
      // Sinon utilisez l'API utilisateur standard
      const response = await axios.get(`${API_URL}/api/users`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      // Si nous sommes en mode admin, utilisez l'API admin
      if (this.isAdminMode()) {
        return await adminService.getUserById(id);
      }
      
      // Sinon utilisez l'API utilisateur standard
      const response = await axios.get(`${API_URL}/api/users/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  async createUser(userData: CreateUserData): Promise<User> {
    try {
      // Si nous sommes en mode admin, utilisez l'API admin
      if (this.isAdminMode()) {
        return await adminService.createUser(userData);
      }
      
      // Sinon utilisez l'API utilisateur standard
      const response = await axios.post(`${API_URL}/api/users`, userData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    try {
      // Si nous sommes en mode admin, utilisez l'API admin
      if (this.isAdminMode()) {
        return await adminService.updateUser(id, userData);
      }
      
      // Sinon utilisez l'API utilisateur standard
      const response = await axios.put(`${API_URL}/api/users/${id}`, userData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      // Si nous sommes en mode admin, utilisez l'API admin
      if (this.isAdminMode()) {
        await adminService.deleteUser(id);
        return;
      }
      
      // Sinon utilisez l'API utilisateur standard
      await axios.delete(`${API_URL}/api/users/${id}`, {
        withCredentials: true
      });
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  async changeUserRole(id: string, role: string): Promise<User> {
    try {
      // Si nous sommes en mode admin, utilisez l'API admin
      if (this.isAdminMode()) {
        return await adminService.updateUser(id, { role });
      }
      
      // Sinon utilisez l'API utilisateur standard
      const response = await axios.patch(
        `${API_URL}/api/users/${id}/role`,
        { role },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.error(`Erreur lors du changement de rôle de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  async banUser(id: string): Promise<void> {
    try {
      // Si nous sommes en mode admin, utilisez l'API admin pour bannir l'utilisateur
      if (this.isAdminMode()) {
        await adminService.updateUser(id, { banni: true });
        return;
      }
      
      // Sinon utilisez l'API utilisateur standard
      await axios.post(
        `${API_URL}/api/users/${id}/ban`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error(`Erreur lors du bannissement de l'utilisateur ${id}:`, error);
      throw error;
    }
  }

  async resetUserPassword(id: string): Promise<void> {
    try {
      // Cette fonction n'est disponible qu'en mode admin
      if (this.isAdminMode()) {
        await adminService.resetUserPassword(id);
      } else {
        throw new Error("Cette fonctionnalité n'est disponible qu'en mode administrateur");
      }
    } catch (error) {
      console.error(`Erreur lors de la réinitialisation du mot de passe de l'utilisateur ${id}:`, error);
      throw error;
    }
  }
}

export const userService = UserService.getInstance();