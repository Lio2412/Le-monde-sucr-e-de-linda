/**
 * Types personnalisés pour remplacer les énumérations Prisma
 * Ces types sont utilisés pour la compatibilité avec SQLite qui ne supporte pas les énumérations
 */

/**
 * Énumération des rôles utilisateurs
 */
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

/**
 * Interface utilisateur pour remplacer le type généré par Prisma
 */
export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  image: string | null;
  role: string;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
} 