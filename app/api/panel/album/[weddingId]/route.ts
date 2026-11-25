import { NextRequest, NextResponse } from 'next/server';
import { isWeddingIdFormat } from '../../../../../lib/album';
import { requireWeddingAccess } from '../../../../../lib/serverAuth';
import { albumDates, albumMode, albumPhase, getAdminDeps, listWeddingPhotos, loadWedding } from '../../../../../lib/albumServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'not_found' }, { status: 404 });

// Spec 29 — todas las fotos de la boda (incluidas las ocultas) y los contadores del panel.
export async function GET(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const weddingId = params.weddingId;
  if (!isWeddingIdFormat(weddingId)) return notFound();
  const auth = await requireWeddingAccess(request, weddingId);
  if (!auth.ok) return auth.response;

  try {
    const { db } = await getAdminDeps();
    const wedding = await loadWedding(db, weddingId);
    if (!wedding) return notFound();
    const photos = await listWeddingPhotos(db, weddingId);
    const participants = new Set(photos.map((p) => (p.guestId ? `g:${p.guestId}` : `d:${p.deviceId}`))).size;
    return NextResponse.json({
      phase: albumPhase(wedding),
      mode: albumMode(wedding),
      ...albumDates(wedding),
      stats: { total: photos.length, hidden: photos.filter((p) => p.hidden).length, participants },
      photos: photos.map((p) => ({
        id: p.id,
        thumbUrl: p.thumbUrl,
        url: p.url,
        uploaderName: p.uploaderName ?? null,
        hidden: p.hidden === true,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error en GET /api/panel/album/[weddingId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// Cambia el modo del álbum. Solo antes del día de la boda: cambiarlo a media boda revelaría o
// escondería fotos a quien ya subió.
export async function PATCH(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const weddingId = params.weddingId;
  if (!isWeddingIdFormat(weddingId)) return notFound();
  const auth = await requireWeddingAccess(request, weddingId);
  if (!auth.ok) return auth.response;

  let body: { mode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_input', field: 'body' }, { status: 400 });
  }
  if (body.mode !== 'open' && body.mode !== 'disposable') {
    return NextResponse.json({ error: 'invalid_input', field: 'mode' }, { status: 400 });
  }

  try {
    const { db } = await getAdminDeps();
    const wedding = await loadWedding(db, weddingId);
    if (!wedding) return notFound();
    const phase = albumPhase(wedding);
    if (phase === 'disabled') return NextResponse.json({ error: 'album_unavailable' }, { status: 404 });
    if (phase !== 'before') return NextResponse.json({ error: 'mode_locked' }, { status: 409 });
    await db.collection('weddings').doc(weddingId).update({ 'photoAlbum.mode': body.mode, updatedAt: new Date().toISOString() });
    return NextResponse.json({ mode: body.mode });
  } catch (error) {
    console.error('Error en PATCH /api/panel/album/[weddingId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
