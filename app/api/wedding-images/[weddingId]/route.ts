import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { weddingId: string } }
) {
  try {
    const { weddingId } = params;
    
    // Validar que el weddingId no contenga caracteres peligrosos
    if (!weddingId || /[^a-zA-Z0-9\-_]/.test(weddingId)) {
      return NextResponse.json({ error: 'Invalid wedding ID' }, { status: 400 });
    }

    const galleryPath = path.join(process.cwd(), 'public', 'assets', 'wedding-images', weddingId, 'gallery');
    
    // Verificar si la carpeta existe
    if (!fs.existsSync(galleryPath)) {
      return NextResponse.json({ 
        heroImage: null,
        coupleImage: null,
        galleryImages: [] 
      });
    }

    // Leer todos los archivos de la carpeta gallery
    const files = fs.readdirSync(galleryPath);
    
    // Filtrar solo archivos de imagen
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });

    // Generar URLs para las imágenes de la galería
    const galleryImages = imageFiles.map(file => `/assets/wedding-images/${weddingId}/gallery/${file}`);

    // Verificar si existen hero.jpg y couple.jpg
    const heroPath = path.join(process.cwd(), 'public', 'assets', 'wedding-images', weddingId, 'hero.jpg');
    const couplePath = path.join(process.cwd(), 'public', 'assets', 'wedding-images', weddingId, 'couple.jpg');

    const heroImage = fs.existsSync(heroPath) ? `/assets/wedding-images/${weddingId}/hero.jpg` : null;
    const coupleImage = fs.existsSync(couplePath) ? `/assets/wedding-images/${weddingId}/couple.jpg` : null;

    return NextResponse.json({
      heroImage,
      coupleImage,
      galleryImages: galleryImages.sort() // Ordenar alfabéticamente
    });

  } catch (error) {
    console.error('Error reading wedding images:', error);
    return NextResponse.json({ 
      heroImage: null,
      coupleImage: null,
      galleryImages: [] 
    }, { status: 500 });
  }
}
