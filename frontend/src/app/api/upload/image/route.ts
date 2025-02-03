import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier n\'a été fourni' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Créer un nom de fichier unique
    const fileName = `${Date.now()}-${file.name}`;
    const path = join(process.cwd(), 'public/uploads', fileName);

    // Sauvegarder le fichier
    await writeFile(path, buffer);

    // Retourner l'URL de l'image
    return NextResponse.json({
      success: 1,
      file: {
        url: `/uploads/${fileName}`
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'upload:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload du fichier' },
      { status: 500 }
    );
  }
} 