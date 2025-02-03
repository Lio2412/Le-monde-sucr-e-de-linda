import sharp from 'sharp';

interface ImageMetadata {
  largeur: number;
  hauteur: number;
  format: string;
  taille: number;
}

export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  const metadata = await sharp(buffer).metadata();
  
  return {
    largeur: metadata.width || 0,
    hauteur: metadata.height || 0,
    format: metadata.format || '',
    taille: buffer.length,
  };
}

export async function generateThumbnail(buffer: Buffer, width: number = 200): Promise<Buffer> {
  return sharp(buffer)
    .resize(width, null, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toBuffer();
}

export async function optimizeImage(buffer: Buffer, options?: {
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}): Promise<Buffer> {
  const { quality = 80, format = 'webp' } = options || {};
  
  let pipeline = sharp(buffer);

  switch (format) {
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality });
      break;
    case 'png':
      pipeline = pipeline.png({ quality });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality });
      break;
  }

  return pipeline.toBuffer();
} 