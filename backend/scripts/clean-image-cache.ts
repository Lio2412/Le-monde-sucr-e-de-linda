const fs = require('fs').promises;
const path = require('path');
const { imageConfig } = require('../config/image-optimization.config');

async function cleanImageCache() {
  const now = Date.now();
  const cacheMaxAge = imageConfig.cacheDuration * 1000; // Conversion en millisecondes

  try {
    // Parcourir tous les dossiers d'images
    for (const [key, dir] of Object.entries(imageConfig.outputPath)) {
      const fullPath = path.join(process.cwd(), 'public', dir);
      
      try {
        // Lire le contenu du dossier
        const files = await fs.readdir(fullPath);
        
        // Pour chaque fichier
        for (const file of files) {
          const filePath = path.join(fullPath, file);
          const stats = await fs.stat(filePath);
          
          // Vérifier l'âge du fichier
          const fileAge = now - stats.mtimeMs;
          
          // Si le fichier est plus vieux que la durée maximale du cache
          if (fileAge > cacheMaxAge) {
            try {
              await fs.unlink(filePath);
              console.log(`Fichier supprimé : ${filePath}`);
            } catch (error) {
              console.error(`Erreur lors de la suppression de ${filePath}:`, error);
            }
          }
        }
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          // Le dossier n'existe pas, on le crée
          await fs.mkdir(fullPath, { recursive: true });
          console.log(`Dossier créé : ${fullPath}`);
        } else {
          console.error(`Erreur lors du traitement du dossier ${fullPath}:`, error);
        }
      }
    }
    
    console.log('Nettoyage du cache d\'images terminé');
  } catch (error) {
    console.error('Erreur lors du nettoyage du cache d\'images:', error);
    throw error;
  }
}

// Si le script est exécuté directement
if (require.main === module) {
  cleanImageCache()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erreur fatale:', error);
      process.exit(1);
    });
}

module.exports = cleanImageCache; 