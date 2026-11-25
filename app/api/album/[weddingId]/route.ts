import { NextRequest, NextResponse } from 'next/server';
import { ALBUM_PHOTO_LIMIT, ALBUM_WEDDING_LIMIT, isUuid, isWeddingIdFormat } from '../../../../lib/album';
import {
  albumDates,
  albumMode,
  albumPhase,
  countUploaderPhotos,
  findGuest,
  getAdminDeps,
  isRevealed,
  listWeddingPhotos,
  loadWedding,
  toPublicPhoto,
} from '../../../../lib/albumServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Spec 29 — lectura pública del álbum. En modo abierto devuelve todas las fotos visibles; en modo
// cámara desechable, antes del revelado, solo las de quien pregunta (guestId o deviceId).
export async function GET(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const weddingId = params.weddingId;
  if (!isWeddingIdFormat(weddingId)) return NextResponse.json({ error: 'album_unavailable' }, { status: 404 });

  const guestParam = request.nextUrl.searchParams.get('guest') || '';
  const deviceParam = request.nextUrl.searchParams.get('device') || '';

  try {
    const { db } = await getAdminDeps();
    const wedding = await loadWedding(db, weddingId);
    if (!wedding) return NextResponse.json({ error: 'album_unavailable' }, { status: 404 });

    const phase = albumPhase(wedding);
    const names = {
      bride: wedding.couple?.bride?.name ?? '',
      groom: wedding.couple?.groom?.name ?? '',
    };
    const base = {
      phase,
      mode: albumMode(wedding),
      names,
      templateId: wedding.template?.id ?? null,
      ...albumDates(wedding),
    };
    if (phase === 'disabled' || phase === 'expired') {
      return NextResponse.json({ ...base, guestName: null, remaining: 0, albumFull: false, photos: [], total: 0 });
    }

    const guest = guestParam ? await findGuest(db, weddingId, guestParam) : null;
    const uploader = guest ? { guestId: guestParam } : isUuid(deviceParam) ? { deviceId: deviceParam } : null;

    const stored = await listWeddingPhotos(db, weddingId);
    // El tope de la boda cuenta también las ocultas: siguen ocupando espacio hasta que se borran.
    const weddingLeft = Math.max(0, ALBUM_WEDDING_LIMIT - stored.length);
    const all = stored.filter((p) => !p.hidden);
    const revealed = isRevealed(wedding);
    const visible = revealed
      ? all
      : all.filter((p) => (uploader?.guestId ? p.guestId === uploader.guestId : uploader?.deviceId ? p.deviceId === uploader.deviceId : false));

    const used = uploader ? await countUploaderPhotos(db, weddingId, uploader) : 0;

    return NextResponse.json({
      ...base,
      revealed,
      guestName: guest?.name ?? null,
      remaining: Math.max(0, Math.min(ALBUM_PHOTO_LIMIT - used, weddingLeft)),
      albumFull: weddingLeft === 0,
      photos: visible.map(toPublicPhoto),
      total: all.length,
    });
  } catch (error) {
    console.error('Error en GET /api/album/[weddingId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
