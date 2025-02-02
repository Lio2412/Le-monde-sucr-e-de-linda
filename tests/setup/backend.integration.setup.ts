import { PrismaClient, Role } from '@prisma/client';
import { Client } from 'pg';
import crypto from 'crypto';
import { prisma } from '../config/database';

// Configuration de la base de données de test
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:root@localhost:5432/le_monde_sucre_test";
const DATABASE_NAME = "le_monde_sucre_test";

const PG_CONFIG = {
  user: 'postgres',
  password: 'root',
  host: 'localhost',
  port: 5432,
  database: process.env.NODE_ENV === 'test' ? 'le_monde_sucre_test' : 'le_monde_sucre'
};

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  },
  log: ['query', 'error', 'warn']
});

let isDatabaseReady = false;

async function createTestDatabase() {
  const client = new Client(PG_CONFIG);

  try {
    await client.connect();
    
    // Vérifier si la base de données existe
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [DATABASE_NAME]
    );

    if (result.rows.length === 0) {
      // Créer la base de données si elle n'existe pas
      await client.query(`CREATE DATABASE ${DATABASE_NAME}`);
      console.log(`Base de données ${DATABASE_NAME} créée avec succès`);
    } else {
      console.log(`Base de données ${DATABASE_NAME} existe déjà`);
    }
  } catch (error) {
    console.error('Erreur lors de la création de la base de données:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function cleanDatabase() {
  try {
    console.log('Début du nettoyage de la base de données...');
    // Supprimer toutes les données dans l'ordre correct pour éviter les erreurs de clé étrangère
    await prismaClient.$transaction([
      prismaClient.userRole.deleteMany(),
      prismaClient.user.deleteMany(),
      prismaClient.role.deleteMany()
    ]);
    console.log('Base de données nettoyée avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données:', error);
    throw error;
  }
}

/**
 * Nettoie la base de données de test
 */
export async function cleanupTestDatabase() {
  console.log('Début du nettoyage de la base de données...');
  try {
    // Supprimer toutes les données dans l'ordre inverse des dépendances
    await prismaClient.userRole.deleteMany();
    await prismaClient.user.deleteMany();
    await prismaClient.role.deleteMany();
    await prismaClient.recette.deleteMany();
    await prismaClient.commentaire.deleteMany();
    await prismaClient.like.deleteMany();
    await prismaClient.partage.deleteMany();
    console.log('Base de données nettoyée avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage de la base de données:', error);
    throw error;
  }
}

/**
 * Crée le rôle USER s'il n'existe pas déjà
 */
async function createUserRole() {
  console.log('Début de la création/vérification du rôle USER...');
  let userRole = null;

  try {
    // Utiliser une connexion directe à PostgreSQL pour la création du rôle
    const client = new Client(PG_CONFIG);
    console.log('Connexion à la base de données établie');

    try {
      await client.connect();
      console.log('Recherche du rôle USER existant...');

      // Vérifier si le rôle existe déjà
      const checkResult = await client.query(
        'SELECT id, nom, description, "createdAt", "updatedAt" FROM roles WHERE nom = $1',
        ['USER']
      );

      if (checkResult.rows.length > 0) {
        userRole = checkResult.rows[0];
      } else {
        console.log('Création d\'un nouveau rôle USER...');
        // Créer le rôle s'il n'existe pas
        const now = new Date().toISOString();
        const insertResult = await client.query(
          `INSERT INTO roles (id, nom, description, "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, nom, description, "createdAt", "updatedAt"`,
          [crypto.randomUUID(), 'USER', 'Rôle utilisateur standard', now, now]
        );

        if (insertResult.rows.length === 0) {
          throw new Error('Échec de la création du rôle USER - aucune ligne insérée');
        }

        userRole = insertResult.rows[0];
        console.log('Rôle USER créé avec succès:', userRole);
      }
    } finally {
      await client.end();
      console.log('Connexion à la base de données fermée');
    }

    return userRole;
  } catch (error) {
    console.error('Erreur lors de la création/vérification du rôle USER:', error);
    throw error;
  }
}

/**
 * Vérifie la structure de la base de données
 */
async function checkDatabaseStructure() {
  console.log('Vérification de la connexion à la base de données...');
  const client = new Client(PG_CONFIG);

  try {
    await client.connect();

    // Vérifier si la base de données existe
    const dbResult = await client.query(
      'SELECT datname FROM pg_database WHERE datname = $1',
      [PG_CONFIG.database]
    );

    if (dbResult.rows.length === 0) {
      throw new Error(`La base de données ${PG_CONFIG.database} n'existe pas`);
    }
    console.log(`Base de données ${PG_CONFIG.database} existe déjà`);

    // Vérifier la structure des tables
    console.log('Vérification de la structure de la base de données...');
    const tablesResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('Tables trouvées:', tablesResult.rows);

    // Vérifier la structure de la table roles
    const rolesStructureResult = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'roles'"
    );
    console.log('Structure de la table roles:', rolesStructureResult.rows);

    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la base de données:', error);
    return false;
  } finally {
    await client.end();
  }
}

/**
 * Configure la base de données pour les tests
 */
export async function setupTestDatabase() {
  console.log('Début de l\'initialisation des tests...');
  try {
    // Vérifier la structure de la base de données
    const isDatabaseReady = await checkDatabaseStructure();
    if (!isDatabaseReady) {
      throw new Error('La base de données n\'est pas prête pour les tests');
    }

    // Nettoyer la base de données
    await cleanupTestDatabase();

    // Créer le rôle USER
    const userRole = await createUserRole();
    if (!userRole || !userRole.id) {
      throw new Error('Échec de l\'initialisation du rôle USER');
    }
    console.log('Rôle USER initialisé avec succès - ID:', userRole.id);

  } catch (error) {
    console.error('Erreur lors de l\'initialisation des tests:', error);
    throw error;
  }
}

/**
 * Prépare l'environnement pour un test spécifique
 */
export async function prepareTest() {
  console.log('Début de la préparation du test...');
  try {
    // Nettoyer les données utilisateur
    await prismaClient.userRole.deleteMany();
    await prismaClient.user.deleteMany();
    console.log('Données utilisateur nettoyées');

    // Vérifier que le rôle USER existe
    const userRole = await prismaClient.role.findFirst({
      where: { nom: 'USER' }
    });

    if (!userRole) {
      throw new Error('Le rôle USER n\'existe pas');
    }

    console.log('Rôle USER vérifié - ID:', userRole.id);
    return userRole;

  } catch (error) {
    console.error('Erreur lors de la préparation du test:', error);
    throw error;
  }
}

/**
 * Nettoie l'environnement après les tests
 */
export async function cleanupTests() {
  console.log('Début du nettoyage final...');
  try {
    await cleanupTestDatabase();
    console.log('Nettoyage final et déconnexion terminés avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage final:', error);
    throw error;
  }
}

beforeAll(async () => {
  try {
    console.log('Début de l\'initialisation des tests...');
    
    // Vérifier la base de données
    const dbReady = await setupTestDatabase();
    if (!dbReady) {
      throw new Error('La base de données de test n\'est pas accessible');
    }

    // Nettoyer la base de données
    await cleanDatabase();

    // Créer le rôle USER
    const role = await createUserRole();
    
    if (!role || !role.id) {
      throw new Error('Échec de l\'initialisation du rôle USER');
    }
    
    console.log('Rôle USER initialisé avec succès - ID:', role.id);
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des tests:', error);
    throw error;
  }
});

beforeEach(async () => {
  try {
    console.log('Début de la préparation du test...');
    
    // Nettoyer uniquement les données utilisateur
    await prismaClient.$transaction([
      prismaClient.userRole.deleteMany(),
      prismaClient.user.deleteMany()
    ]);
    console.log('Données utilisateur nettoyées');

    // Se connecter à la base de données
    const client = new Client({
      ...PG_CONFIG,
      database: DATABASE_NAME
    });
    await client.connect();

    try {
      // Vérifier que le rôle USER existe toujours avec une requête SQL directe
      const result = await client.query(
        "SELECT id, nom, description, \"createdAt\", \"updatedAt\" FROM roles WHERE nom = $1",
        ['USER']
      );

      if (result.rows.length === 0) {
        throw new Error('Le rôle USER n\'a pas été trouvé avant le test');
      }

      const role = result.rows[0] as Role;
      console.log('Rôle USER vérifié - ID:', role.id);
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Erreur lors de la préparation du test:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    console.log('Début du nettoyage final...');
    // Nettoyer la base de données et se déconnecter
    await cleanDatabase();
    await prismaClient.$disconnect();
    console.log('Nettoyage final et déconnexion terminés avec succès');
  } catch (error) {
    console.error('Erreur lors du nettoyage final:', error);
    throw error;
  }
});

export { prismaClient }; 