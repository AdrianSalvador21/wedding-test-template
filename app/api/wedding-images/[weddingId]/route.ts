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

    const basePath = path.join(process.cwd(), 'public', 'assets', 'wedding-images', weddingId);
    const galleryPath = path.join(basePath, 'gallery');
    
    // Debug: Log paths en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ API Debug - weddingId:', weddingId);
      console.log('🖼️ API Debug - process.cwd():', process.cwd());
      console.log('🖼️ API Debug - basePath:', basePath);
      console.log('🖼️ API Debug - galleryPath:', galleryPath);
    }
    
    // Verificar si la carpeta base existe
    const baseExists = fs.existsSync(basePath);
    const galleryExists = fs.existsSync(galleryPath);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ API Debug - baseExists:', baseExists);
      console.log('🖼️ API Debug - galleryExists:', galleryExists);
    }
    
    // Verificar si la carpeta gallery existe
    if (!galleryExists) {
      if (process.env.NODE_ENV === 'development') {
        console.log('🖼️ API Debug - Gallery no existe, retornando vacío');
      }
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

    // Buscar archivo hero con cualquier extensión válida
    let heroPath = '';
    let heroExists = false;
    
    for (const ext of imageExtensions) {
      const testPath = path.join(basePath, `hero${ext}`);
      if (fs.existsSync(testPath)) {
        heroPath = testPath;
        heroExists = true;
        break;
      }
    }
    
    // Buscar archivo couple con cualquier extensión válida
    let couplePath = '';
    let coupleExists = false;
    
    for (const ext of imageExtensions) {
      const testPath = path.join(basePath, `couple${ext}`);
      if (fs.existsSync(testPath)) {
        couplePath = testPath;
        coupleExists = true;
        break;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ API Debug - heroPath:', heroPath);
      console.log('🖼️ API Debug - heroExists:', heroExists);
      console.log('🖼️ API Debug - couplePath:', couplePath);
      console.log('🖼️ API Debug - coupleExists:', coupleExists);
      console.log('🖼️ API Debug - galleryImages count:', imageFiles.length);
    }

    const heroImage = heroExists ? `/assets/wedding-images/${weddingId}/${path.basename(heroPath)}` : null;
    const coupleImage = coupleExists ? `/assets/wedding-images/${weddingId}/${path.basename(couplePath)}` : null;

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
