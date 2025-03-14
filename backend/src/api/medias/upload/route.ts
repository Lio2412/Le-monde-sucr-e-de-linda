import { NextResponse } from 'next/server';
import { mediaSchema } from '@/services/medias.service';
import { supabase } from '@/lib/supabase';
import { getImageMetadata, generateThumbnail, optimizeImage } from '@/lib/image';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import mime from 'mime';

const UPLOAD_DIR = join(process.cwd(), 'public/uploads');
const THUMBNAILS_DIR = join(process.cwd(), 'public/uploads/thumbnails');

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metadataStr = formData.get('metadata') as string;
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a été fourni' },
        { status: 400 }
      );
    }

    // Lire le fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Déterminer le type de média
    const mimeType = file.type || mime.getType(file.name) || 'application/octet-stream';
    const type = mimeType.startsWith('image/') ? 'image' : 
                mimeType.startsWith('video/') ? 'video' : 
                'document';

    // Générer un nom de fichier unique
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(UPLOAD_DIR, fileName);

    // Pour les images, générer une miniature et optimiser
    let miniatureUrl = undefined;
    let imageMetadata = undefined;

    if (type === 'image') {
      // Optimiser l'image
      const optimizedBuffer = await optimizeImage(buffer);
      await writeFile(filePath, optimizedBuffer);

      // Générer la miniature
      const thumbnailBuffer = await generateThumbnail(buffer);
      const thumbnailPath = join(THUMBNAILS_DIR, fileName);
      await writeFile(thumbnailPath, thumbnailBuffer);
      miniatureUrl = `/uploads/thumbnails/${fileName}`;

      // Obtenir les métadonnées de l'image
      imageMetadata = await getImageMetadata(buffer as any); // Correction du type
    } else {
      // Sauvegarder le fichier tel quel
      await writeFile(filePath, buffer);
    }

    // Créer l'entrée dans la base de données
    const mediaData = {
      nom: file.name,
      type,
      url: `/uploads/${fileName}`,
      miniatureUrl,
      taille: buffer.length,
      format: mimeType,
      ...metadata,
      ...(imageMetadata && {
        metadata: {
          largeur: imageMetadata.largeur,
          hauteur: imageMetadata.hauteur,
        },
      }),
    };

    // Valider les données
    const validatedData = mediaSchema.parse(mediaData);

    // Créer le média avec Supabase
    const { data: media, error } = await supabase
      .from('medias')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création du média dans Supabase: ${error.message}`);
    }

    return NextResponse.json(media);
  } catch (error: any) {
    console.error('Erreur lors de l\'upload du média:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de l\'upload du média' },
      { status: 500 }
    );
  }
}