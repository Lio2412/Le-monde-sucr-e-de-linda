'use client';

import { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  ArrowUpDown,
  Pencil,
  Trash2,
  Shield,
  Ban,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import { User } from '@/services/userService';
import { useUsers } from '@/hooks/useUsers';
import UserModal from './UserModal';

interface UserTableProps {
  searchQuery: string;
  roleFilter: string;
}

type SortConfig = {
  key: keyof User | '';
  direction: 'asc' | 'desc' | '';
};

export default function UserTable({ searchQuery, roleFilter }: UserTableProps) {
  const {
    users,
    isLoading,
    error,
    loadUsers,
    deleteUser,
    banUser,
    changeUserRole,
    resetUserPassword
  } = useUsers();

  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: '' });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Fonction de tri
  const sortUsers = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrer et trier les utilisateurs
  const sortAndFilterUsers = () => {
    let result = [...users];

    // Filtrage
    result = result.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.pseudo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === 'all' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });

    // Tri
    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof User];
        const bValue = b[sortConfig.key as keyof User];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    }

    return result;
  };

  // Fonction pour obtenir la couleur du badge selon le rôle
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  // Gérer la suppression
  const handleDelete = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        await deleteUser(userId);
        toast.success('Utilisateur supprimé avec succès');
        await refreshUsers();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  // Gérer le bannissement
  const handleBan = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir bannir cet utilisateur ?')) {
      try {
        await banUser(userId);
        toast.success('Utilisateur banni avec succès');
        await refreshUsers();
      } catch (error) {
        console.error('Erreur lors du bannissement:', error);
        toast.error('Erreur lors du bannissement de l\'utilisateur');
      }
    }
  };

  // Gérer le changement de rôle
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await changeUserRole(userId, newRole);
      toast.success(`Rôle modifié avec succès en "${newRole}"`);
      await refreshUsers();
    } catch (error) {
      console.error('Erreur lors du changement de rôle:', error);
      toast.error('Erreur lors du changement de rôle');
    }
  };

  // Réinitialiser le mot de passe
  const handleResetPassword = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')) {
      try {
        await resetUserPassword(userId);
        toast.success('Mot de passe réinitialisé avec succès');
      } catch (error) {
        console.error('Erreur lors de la réinitialisation du mot de passe:', error);
        toast.error('Erreur lors de la réinitialisation du mot de passe');
      }
    }
  };

  // Rafraîchir la liste des utilisateurs
  const refreshUsers = async () => {
    setIsRefreshing(true);
    try {
      await loadUsers();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement de la liste:', error);
      toast.error('Erreur lors du rafraîchissement de la liste des utilisateurs');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredAndSortedUsers = sortAndFilterUsers();

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
        <div>Une erreur est survenue lors du chargement des utilisateurs</div>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={refreshUsers}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          onClick={refreshUsers}
          disabled={isRefreshing}
          size="sm"
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Rafraîchir</span>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Utilisateur</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => sortUsers('email')}>
                  Email
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => sortUsers('role')}>
                  Rôle
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => sortUsers('createdAt')}>
                  Date d'inscription
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredAndSortedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Aucun utilisateur trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} alt={`${user.prenom} ${user.nom}`} />
                        <AvatarFallback>{user.prenom[0]}{user.nom[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.prenom} {user.nom}</div>
                        <div className="text-sm text-gray-500">@{user.pseudo}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={`${getRoleBadgeColor(user.role)}`}>
                      {user.role === 'admin' ? 'Administrateur' : 
                       user.role === 'moderator' ? 'Modérateur' : 'Utilisateur'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    <TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(user);
                            setIsModalOpen(true);
                          }}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Modifier
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Réinitialiser mot de passe
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DropdownMenuItem>
                                <Shield className="mr-2 h-4 w-4" />
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="w-full text-left">
                                    Changer le rôle
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}>
                                      Utilisateur
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'moderator')}>
                                      Modérateur
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                      Administrateur
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </DropdownMenuItem>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Définir les permissions</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            className="text-amber-600"
                            onClick={() => handleBan(user.id)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Bannir
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal de modification */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          loadUsers(); // Recharger la liste après modification
        }}
        user={selectedUser || undefined}
      />
    </div>
  );
}