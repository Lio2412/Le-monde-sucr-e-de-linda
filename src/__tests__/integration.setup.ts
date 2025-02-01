import { PrismaClient } from '@prisma/client';
import { Client } from 'pg';
import { prisma } from '../config/database';
import crypto from 'crypto';
import { beforeAll, beforeEach, afterAll } from '@jest/globals';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/le_monde_sucre_test';
const USER_ROLE_ID = '00000000-0000-0000-0000-000000000001';

export const setupTestDatabase = async (): Promise<boolean> => {
  try {
    const client = new Client({
      connectionString: DATABASE_URL
    });

    await client.connect();
    
    // Vérifier si la base de données existe
    const result = await client.query(
      "SELECT EXISTS (SELECT FROM pg_database WHERE datname = 'le_monde_sucre_test')"
    );
    
    if (!result.rows[0].exists) {
      await client.query('CREATE DATABASE le_monde_sucre_test');
    }
    
    await client.end();
    
    // Exécuter les migrations
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    // Nettoyer la base de données
    const cleanupResult = await cleanupTestDatabase();
    if (!cleanupResult) {
      throw new Error('Échec du nettoyage de la base de données');
    }
    
    // Créer le rôle USER par défaut avec un ID fixe
    const userRole = await prisma.role.upsert({
      where: { id: USER_ROLE_ID },
      update: {
        nom: 'USER',
        description: 'Rôle utilisateur standard'
      },
      create: {
        id: USER_ROLE_ID,
        nom: 'USER',
        description: 'Rôle utilisateur standard'
      }
    });
    
    if (!userRole || !userRole.id) {
      throw new Error('Échec de la création du rôle USER');
    }
    
    console.log('Rôle USER créé avec succès - ID:', userRole.id);
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration de la base de données de test:', error);
    return false;
  }
};

export const cleanupTestDatabase = async (): Promise<boolean> => {
  try {
    // Supprimer toutes les données des tables dans l'ordre correct
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.commentaire.deleteMany();
    await prisma.like.deleteMany();
    await prisma.partage.deleteMany();
    await prisma.recette.deleteMany();
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données:', error);
    return false;
  }
};

export const getDatabaseStatus = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
};

export const prepareTest = async (): Promise<boolean> => {
  try {
    // Nettoyer la base de données
    const cleanupResult = await cleanupTestDatabase();
    if (!cleanupResult) {
      throw new Error('Échec du nettoyage de la base de données');
    }
    
    // Créer le rôle USER par défaut
    const userRole = await prisma.role.upsert({
      where: { nom: 'USER' },
      update: {},
      create: {
        id: crypto.randomUUID(),
        nom: 'USER',
        description: 'Rôle utilisateur standard'
      }
    });
    
    if (!userRole || !userRole.id) {
      throw new Error('Échec de la création du rôle USER');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la préparation du test:', error);
    return false;
  }
};

beforeAll(async () => {
  try {
    console.log('Début de l\'initialisation des tests...');
    
    // Vérifier la base de données
    const dbReady = await setupTestDatabase();
    if (!dbReady) {
      throw new Error('La base de données de test n\'est pas accessible');
    }

    // Nettoyer la base de données
    const cleanupResult = await cleanupTestDatabase();
    if (!cleanupResult) {
      throw new Error('Échec du nettoyage de la base de données');
    }

    // Créer le rôle USER avec un ID fixe
    const userRole = await prisma.role.upsert({
      where: { id: USER_ROLE_ID },
      update: {
        nom: 'USER',
        description: 'Rôle utilisateur standard'
      },
      create: {
        id: USER_ROLE_ID,
        nom: 'USER',
        description: 'Rôle utilisateur standard'
      }
    });
    
    if (!userRole || !userRole.id) {
      throw new Error('Échec de l\'initialisation du rôle USER');
    }
    
    console.log('Rôle USER initialisé avec succès - ID:', userRole.id);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des tests:', error);
    throw error;
  }
});

beforeEach(async () => {
  try {
    console.log('Début de la préparation du test...');
    
    // Nettoyer uniquement les données utilisateur
    await prisma.userRole.deleteMany();
    await prisma.user.deleteMany();
    
    // Vérifier que le rôle USER existe toujours
    const userRole = await prisma.role.findUnique({
      where: { id: USER_ROLE_ID }
    });
    
    if (!userRole || !userRole.id) {
      // Si le rôle n'existe pas, le recréer
      const newUserRole = await prisma.role.create({
        data: {
          id: USER_ROLE_ID,
          nom: 'USER',
          description: 'Rôle utilisateur standard'
        }
      });
      
      if (!newUserRole || !newUserRole.id) {
        throw new Error('Le rôle USER n\'a pas pu être recréé');
      }
    }
    
    console.log('Rôle USER vérifié - ID:', userRole?.id);
  } catch (error) {
    console.error('Erreur lors de la préparation du test:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    console.log('Début du nettoyage final...');
    // Nettoyer la base de données et se déconnecter
    const cleanupResult = await cleanupTestDatabase();
    if (!cleanupResult) {
      throw new Error('Échec du nettoyage final de la base de données');
    }
    await prisma.$disconnect();
    console.log('Nettoyage final et déconnexion terminés avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage final:', error);
    throw error;
  }
});

export const createUserRole = async () => {
  try {
    const userRole = await prisma.role.create({
      data: {
        nom: 'USER',
        description: 'Utilisateur standard'
      }
    });
    return userRole;
  } catch (error) {
    console.error('Erreur lors de la création du rôle USER:', error);
    throw error;
  }
};

export const checkDatabaseStructure = async (): Promise<boolean> => {
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `;
    
    const requiredTables = ['user', 'role', 'user_role'];
    const existingTables = (tables as any[]).map(t => t.tablename);
    
    const missingTables = requiredTables.filter(
      table => !existingTables.includes(table)
    );
    
    if (missingTables.length > 0) {
      throw new Error(`Tables manquantes: ${missingTables.join(', ')}`);
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la structure de la base de données:', error);
    return false;
  }
};

export const cleanupTests = async (): Promise<boolean> => {
  try {
    await cleanupTestDatabase();
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('Erreur lors du nettoyage final des tests:', error);
    return false;
  }
}; 