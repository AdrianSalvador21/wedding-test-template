import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cwd = process.cwd();
    const publicPath = path.join(cwd, 'public');
    const assetsPath = path.join(publicPath, 'assets');
    const weddingImagesPath = path.join(assetsPath, 'wedding-images');
    const musicPath = path.join(assetsPath, 'music');

    const diagnostics = {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      paths: {
        cwd,
        publicPath,
        assetsPath,
        weddingImagesPath,
        musicPath
      },
      exists: {
        public: fs.existsSync(publicPath),
        assets: fs.existsSync(assetsPath),
        weddingImages: fs.existsSync(weddingImagesPath),
        music: fs.existsSync(musicPath)
      },
      weddings: [] as Array<{
        id: string;
        heroExists: boolean;
        coupleExists: boolean;
        galleryExists: boolean;
        galleryCount: number;
        galleryFiles: string[];
      }>,
      musicFiles: [] as Array<{
        name: string;
        sizeKB: number;
        modified: string;
      }>
    };

    // Verificar bodas si la carpeta existe
    if (fs.existsSync(weddingImagesPath)) {
      const weddingDirs = fs.readdirSync(weddingImagesPath).filter(item => {
        const itemPath = path.join(weddingImagesPath, item);
        return fs.statSync(itemPath).isDirectory();
      });

      diagnostics.weddings = weddingDirs.map(weddingId => {
        const weddingPath = path.join(weddingImagesPath, weddingId);
        const heroPath = path.join(weddingPath, 'hero.jpg');
        const couplePath = path.join(weddingPath, 'couple.jpg');
        const galleryPath = path.join(weddingPath, 'gallery');

        let galleryFiles: string[] = [];
        if (fs.existsSync(galleryPath)) {
          galleryFiles = fs.readdirSync(galleryPath).filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
          });
        }

        return {
          id: weddingId,
          heroExists: fs.existsSync(heroPath),
          coupleExists: fs.existsSync(couplePath),
          galleryExists: fs.existsSync(galleryPath),
          galleryCount: galleryFiles.length,
          galleryFiles: galleryFiles.slice(0, 5) // Solo primeros 5 para no sobrecargar
        };
      });
    }

    // Verificar archivos de música si la carpeta existe
    if (fs.existsSync(musicPath)) {
      const musicFiles = fs.readdirSync(musicPath).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp3', '.wav', '.ogg', '.m4a'].includes(ext);
      });

      diagnostics.musicFiles = musicFiles.map(file => {
        const filePath = path.join(musicPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          sizeKB: Math.round(stats.size / 1024),
          modified: stats.mtime.toISOString()
        };
      });
    }

    return NextResponse.json(diagnostics);

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to run diagnostics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
