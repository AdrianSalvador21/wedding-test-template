import { NextRequest, NextResponse } from 'next/server';
import { isWeddingIdFormat } from '../../../../../../../lib/album';
import { requireWeddingAccess } from '../../../../../../../lib/serverAuth';
import { getAdminDeps } from '../../../../../../../lib/albumServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'not_found' }, { status: 404 });

type Params = { params: { weddingId: string; photoId: string } };

async function loadPhoto(weddingId: string, photoId: string) {
  const { db, getBucket } = await getAdminDeps();
  const ref = db.collection('albumPhotos').doc(photoId);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.weddingId !== weddingId) return null;
  return { ref, data: snap.data() as { storagePath?: string; thumbPath?: string }, getBucket };
}

// Spec 29 — entrega el JPEG de una foto para armar el ZIP en el navegador. Pasa por el servidor
// para no depender de configurar CORS en el bucket (las <img> del álbum no lo necesitan).
export async function GET(request: NextRequest, { params }: Params) {
  if (!isWeddingIdFormat(params.weddingId) || !/^[A-Za-z0-9]{10,40}$/.test(params.photoId)) return notFound();
  const auth = await requireWeddingAccess(request, params.weddingId);
  if (!auth.ok) return auth.response;

  try {
    const photo = await loadPhoto(params.weddingId, params.photoId);
    const path = photo?.data.storagePath;
    if (!photo || typeof path !== 'string' || !path.startsWith(`albums/${params.weddingId}/`)) return notFound();
    const [bytes] = await photo.getBucket().file(path).download();
    return new NextResponse(new Uint8Array(bytes), { headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Error en GET /api/panel/album/.../photos/[photoId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// Spec 29 — ocultar o mostrar una foto. Oculta, deja de salir en el álbum público y en el ZIP.
export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isWeddingIdFormat(params.weddingId) || !/^[A-Za-z0-9]{10,40}$/.test(params.photoId)) return notFound();
  const auth = await requireWeddingAccess(request, params.weddingId);
  if (!auth.ok) return auth.response;

  let body: { hidden?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_input', field: 'body' }, { status: 400 });
  }
  if (typeof body.hidden !== 'boolean') return NextResponse.json({ error: 'invalid_input', field: 'hidden' }, { status: 400 });

  try {
    const photo = await loadPhoto(params.weddingId, params.photoId);
    if (!photo) return notFound();
    await photo.ref.update({ hidden: body.hidden });
    return NextResponse.json({ id: params.photoId, hidden: body.hidden });
  } catch (error) {
    console.error('Error en PATCH /api/panel/album/.../photos/[photoId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// Borra la foto y sus dos archivos (foto y miniatura) de Storage.
export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isWeddingIdFormat(params.weddingId) || !/^[A-Za-z0-9]{10,40}$/.test(params.photoId)) return notFound();
  const auth = await requireWeddingAccess(request, params.weddingId);
  if (!auth.ok) return auth.response;

  try {
    const photo = await loadPhoto(params.weddingId, params.photoId);
    if (!photo) return notFound();
    const bucket = photo.getBucket();
    const paths = [photo.data.storagePath, photo.data.thumbPath].filter((p): p is string => typeof p === 'string' && p.startsWith(`albums/${params.weddingId}/`));
    await Promise.all(paths.map((p) => bucket.file(p).delete({ ignoreNotFound: true })));
    await photo.ref.delete();
    return NextResponse.json({ id: params.photoId, deleted: true });
  } catch (error) {
    console.error('Error en DELETE /api/panel/album/.../photos/[photoId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
