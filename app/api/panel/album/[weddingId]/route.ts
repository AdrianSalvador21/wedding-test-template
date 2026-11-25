import { NextRequest, NextResponse } from 'next/server';
import { albumStyleId, isAlbumStyleId, isWeddingIdFormat } from '../../../../../lib/album';
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
      uploadsClosed: wedding.photoAlbum?.uploadsClosed === true,
      // Spec 30 — en bodas gratis la pareja elige el estilo; en bodas con diseño es el del template.
      standalone: wedding.tier === 'free',
      style: albumStyleId(wedding),
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

// Cambia el modo del álbum (solo antes del día de la boda: cambiarlo a media boda revelaría o
// escondería fotos a quien ya subió), cierra/abre la subida de fotos de los invitados o, en una
// boda gratis (spec 30), cambia el estilo del álbum.
export async function PATCH(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const weddingId = params.weddingId;
  if (!isWeddingIdFormat(weddingId)) return notFound();
  const auth = await requireWeddingAccess(request, weddingId);
  if (!auth.ok) return auth.response;

  let body: { mode?: unknown; uploadsClosed?: unknown; style?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_input', field: 'body' }, { status: 400 });
  }
  const hasMode = body.mode !== undefined;
  const hasUploads = body.uploadsClosed !== undefined;
  const hasStyle = body.style !== undefined;
  if (!hasMode && !hasUploads && !hasStyle) return NextResponse.json({ error: 'invalid_input', field: 'body' }, { status: 400 });
  if (hasMode && body.mode !== 'open' && body.mode !== 'disposable') {
    return NextResponse.json({ error: 'invalid_input', field: 'mode' }, { status: 400 });
  }
  if (hasUploads && typeof body.uploadsClosed !== 'boolean') {
    return NextResponse.json({ error: 'invalid_input', field: 'uploadsClosed' }, { status: 400 });
  }
  if (hasStyle && !isAlbumStyleId(body.style)) {
    return NextResponse.json({ error: 'invalid_input', field: 'style' }, { status: 400 });
  }

  try {
    const { db } = await getAdminDeps();
    const wedding = await loadWedding(db, weddingId);
    if (!wedding) return notFound();
    const phase = albumPhase(wedding);
    if (phase === 'disabled') return NextResponse.json({ error: 'album_unavailable' }, { status: 404 });
    if (hasMode && phase !== 'before') return NextResponse.json({ error: 'mode_locked' }, { status: 409 });
    // Cerrar o abrir la subida solo tiene efecto mientras dure la ventana (o antes de que abra).
    if (hasUploads && phase === 'expired') return NextResponse.json({ error: 'album_expired' }, { status: 409 });
    // El estilo solo lo eligen las bodas gratis: las bodas con diseño usan el de su template.
    if (hasStyle && wedding.tier !== 'free') return NextResponse.json({ error: 'style_locked' }, { status: 409 });
    if (hasStyle && phase === 'expired') return NextResponse.json({ error: 'album_expired' }, { status: 409 });
    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (hasMode) update['photoAlbum.mode'] = body.mode;
    if (hasUploads) update['photoAlbum.uploadsClosed'] = body.uploadsClosed;
    if (hasStyle) update['photoAlbum.style'] = body.style;
    await db.collection('weddings').doc(weddingId).update(update);
    const after = await loadWedding(db, weddingId);
    return NextResponse.json({
      mode: after ? albumMode(after) : body.mode,
      uploadsClosed: after?.photoAlbum?.uploadsClosed === true,
      style: after ? albumStyleId(after) : body.style,
      phase: after ? albumPhase(after) : phase,
    });
  } catch (error) {
    console.error('Error en PATCH /api/panel/album/[weddingId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
