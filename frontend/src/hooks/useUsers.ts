import { useState, useCallback } from 'react';
import { userService, User, CreateUserData, UpdateUserData } from '@/services/userService';
import { toast } from 'sonner';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserData) => {
    setError(null);
    try {
      const newUser = await userService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      toast.success('Utilisateur créé avec succès');
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors de la création de l\'utilisateur');
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: UpdateUserData) => {
    setError(null);
    try {
      const updatedUser = await userService.updateUser(id, userData);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      toast.success('Utilisateur mis à jour avec succès');
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors de la mise à jour de l\'utilisateur');
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setError(null);
    try {
      await userService.deleteUser(id);
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Utilisateur supprimé avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors de la suppression de l\'utilisateur');
      throw err;
    }
  }, []);

  const banUser = useCallback(async (id: string) => {
    setError(null);
    try {
      await userService.banUser(id);
      toast.success('Utilisateur banni avec succès');
      // Recharger la liste des utilisateurs pour obtenir le statut mis à jour
      await loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du bannissement de l\'utilisateur');
      throw err;
    }
  }, [loadUsers]);

  const changeUserRole = useCallback(async (id: string, role: string) => {
    setError(null);
    try {
      const updatedUser = await userService.changeUserRole(id, role);
      setUsers(prev => prev.map(user => user.id === id ? updatedUser : user));
      toast.success('Rôle de l\'utilisateur modifié avec succès');
      return updatedUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors du changement de rôle');
      throw err;
    }
  }, []);

  const resetUserPassword = useCallback(async (id: string) => {
    setError(null);
    try {
      await userService.resetUserPassword(id);
      toast.success('Mot de passe de l\'utilisateur réinitialisé avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error('Erreur lors de la réinitialisation du mot de passe');
      throw err;
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    banUser,
    changeUserRole,
    resetUserPassword,
  };
}