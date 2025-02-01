import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// Charger les variables d'environnement de test
dotenv.config({ path: '.env.test' });

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'FRONTEND_URL'
];

async function verifyTestEnvironment() {
  console.log('🔍 Vérification de l\'environnement de test...\n');

  // 1. Vérifier les variables d'environnement
  console.log('1. Vérification des variables d\'environnement:');
  let missingVars = false;
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Variable manquante: ${envVar}`);
      missingVars = true;
    } else {
      console.log(`✅ ${envVar} est défini`);
    }
  }
  console.log();

  if (missingVars) {
    console.error('❌ Certaines variables d\'environnement sont manquantes');
    process.exit(1);
  }

  // 2. Vérifier la connexion à la base de données
  console.log('2. Vérification de la connexion à la base de données:');
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  console.log();

  // 3. Vérifier les dossiers nécessaires
  console.log('3. Vérification des dossiers:');
  const uploadDir = process.env.UPLOAD_DIR || 'uploads/test';
  const uploadPath = path.join(process.cwd(), uploadDir);
  
  if (!fs.existsSync(uploadPath)) {
    try {
      fs.mkdirSync(uploadPath, { recursive: true });
      console.log(`✅ Dossier ${uploadDir} créé`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création du dossier ${uploadDir}:`, error);
      process.exit(1);
    }
  } else {
    console.log(`✅ Dossier ${uploadDir} existe`);
  }
  console.log();

  console.log('✅ Configuration de l\'environnement de test validée avec succès!\n');
}

verifyTestEnvironment().catch(error => {
  console.error('❌ Erreur lors de la vérification:', error);
  process.exit(1);
}); 