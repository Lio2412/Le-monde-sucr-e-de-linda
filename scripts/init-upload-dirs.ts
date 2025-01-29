import { mkdir } from 'fs/promises';
import { join } from 'path';

async function initUploadDirs() {
  const publicDir = join(process.cwd(), 'public');
  const uploadsDir = join(publicDir, 'uploads');
  const sharesDir = join(uploadsDir, 'shares');

  try {
    // Créer les dossiers s'ils n'existent pas
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(sharesDir, { recursive: true });
    
    console.log('✅ Dossiers d\'upload initialisés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation des dossiers d\'upload:', error);
    process.exit(1);
  }
}

initUploadDirs(); 