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

    // Verificar si existe el archivo de música
    const musicPath = path.join(process.cwd(), 'public', 'assets', 'music', `${weddingId}.mp3`);
    
    const musicExists = fs.existsSync(musicPath);

    return NextResponse.json({
      hasMusic: musicExists,
      musicUrl: musicExists ? `/assets/music/${weddingId}.mp3` : null,
      fileName: musicExists ? `${weddingId}.mp3` : null
    });

  } catch (error) {
    console.error('Error checking wedding music:', error);
    return NextResponse.json({ 
      hasMusic: false,
      musicUrl: null,
      fileName: null
    }, { status: 500 });
  }
}
