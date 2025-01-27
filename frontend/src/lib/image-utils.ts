// Fonction pour générer des URLs d'images optimisées avec des paramètres de qualité et de taille
export function getOptimizedImageUrl(url: string, width: number, quality = 75): string {
  // Si l'URL est déjà une URL d'image optimisée, la retourner telle quelle
  if (url.includes('?w=') || url.includes('&q=')) return url;

  // Si c'est une URL externe (Unsplash, etc.), utiliser leurs paramètres d'optimisation
  if (url.includes('unsplash.com')) {
    const params = new URLSearchParams({
      w: width.toString(),
      q: quality.toString(),
      auto: 'format',
      fit: 'crop'
    });
    return `${url}?${params.toString()}`;
  }

  // Pour les images locales, utiliser les paramètres de Next.js Image
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=${quality}`;
}

export type ImageVariant = 'hero' | 'thumbnail';

export const imageSizeConfigs = {
  hero: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 1200px, 2400px",
    quality: 90,
    priority: true
  },
  thumbnail: {
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    quality: 75,
    priority: false
  }
} as const;

// Fonction pour générer un ensemble d'URLs d'images srcSet
export function generateSrcSet(url: string, config: typeof imageSizeConfigs.hero): string {
  return config.breakpoints
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(url, width, config.quality);
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

// Fonction pour générer une couleur dominante à partir d'une URL d'image (pour le placeholder)
export function generatePlaceholderColor(url: string): string {
  // Simuler une couleur basée sur le hash de l'URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = url.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = Math.abs(hash % 360);
  const s = 20; // Saturation faible pour un effet pastel
  const l = 95; // Luminosité élevée pour un effet clair
  
  return `hsl(${h}, ${s}%, ${l}%)`;
}

// Fonction pour générer un placeholder SVG avec une couleur dominante
export function generatePlaceholderSvg(color: string): string {
  const svg = `
    <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${color}"/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Fonction pour générer un placeholder complet pour une image
export function generateImagePlaceholder(src: string): string {
  // Génère une couleur de placeholder basée sur le hash de l'URL de l'image
  const hash = src.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const h = Math.abs(hash) % 360;
  const s = 20 + (Math.abs(hash >> 8) % 30); // 20-50%
  const l = 85 + (Math.abs(hash >> 16) % 10); // 85-95%
  
  return `hsl(${h}, ${s}%, ${l}%)`;
} 