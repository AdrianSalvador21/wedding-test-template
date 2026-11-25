import { NextRequest, NextResponse } from 'next/server';
import { ALBUM_PHOTO_LIMIT, isUuid, isWeddingIdFormat } from '../../../../../lib/album';
import { albumMode, albumPhase, countUploaderPhotos, findGuest, getAdminDeps, loadWedding, saveJpeg, toPublicPhoto } from '../../../../../lib/albumServer';
import type { AlbumPhoto } from '../../../../../src/types/wedding';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;
const MAX_THUMB_BYTES = 200 * 1024;
const MAX_NAME_LENGTH = 60;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

const isJpegFile = (value: FormDataEntryValue | null, maxBytes: number): value is File =>
  !!value && typeof value !== 'string' && value.type === 'image/jpeg' && value.size > 0 && value.size <= maxBytes;

const toInt = (value: FormDataEntryValue | null) => {
  const n = typeof value === 'string' ? Number.parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n > 0 && n <= 10000 ? n : 0;
};

// Spec 29 — subida pública de una foto (ya comprimida en el teléfono). Las validaciones van en el
// orden del spec: boda/fase, invitado, archivo y límite de 20 por invitación o dispositivo.
export async function POST(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const weddingId = params.weddingId;
  if (!isWeddingIdFormat(weddingId)) return fail(404, 'album_unavailable');

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, 'invalid_file');
  }

  try {
    const { db, getBucket } = await getAdminDeps();
    const wedding = await loadWedding(db, weddingId);
    if (!wedding) return fail(404, 'album_unavailable');
    const phase = albumPhase(wedding);
    if (phase === 'disabled') return fail(404, 'album_unavailable');
    if (phase !== 'open') return fail(403, 'album_closed');

    const guestId = typeof form.get('guestId') === 'string' ? (form.get('guestId') as string).trim() : '';
    const deviceId = typeof form.get('deviceId') === 'string' ? (form.get('deviceId') as string).trim() : '';
    let uploader: { guestId: string; name: string } | { deviceId: string; name: string };
    if (guestId) {
      const guest = await findGuest(db, weddingId, guestId);
      if (!guest) return fail(400, 'invalid_guest');
      uploader = { guestId, name: guest.name };
    } else if (isUuid(deviceId)) {
      const rawName = typeof form.get('name') === 'string' ? (form.get('name') as string).trim().slice(0, MAX_NAME_LENGTH) : '';
      uploader = { deviceId, name: rawName };
    } else {
      return fail(400, 'missing_uploader');
    }

    const photo = form.get('photo');
    const thumb = form.get('thumb');
    if (!isJpegFile(photo, MAX_PHOTO_BYTES) || !isJpegFile(thumb, MAX_THUMB_BYTES)) return fail(400, 'invalid_file');

    const used = await countUploaderPhotos(db, weddingId, uploader);
    if (used >= ALBUM_PHOTO_LIMIT) return fail(429, 'limit_reached');

    const ref = db.collection('albumPhotos').doc();
    const storagePath = `albums/${weddingId}/${ref.id}.jpg`;
    const thumbPath = `albums/${weddingId}/${ref.id}_thumb.jpg`;
    const bucket = getBucket();
    const [url, thumbUrl] = await Promise.all([
      saveJpeg(bucket, storagePath, Buffer.from(await photo.arrayBuffer())),
      saveJpeg(bucket, thumbPath, Buffer.from(await thumb.arrayBuffer())),
    ]);

    const doc: Omit<AlbumPhoto, 'id'> = {
      weddingId,
      source: 'guestId' in uploader ? 'guest' : 'device',
      ...('guestId' in uploader ? { guestId: uploader.guestId } : { deviceId: uploader.deviceId }),
      ...(uploader.name ? { uploaderName: uploader.name } : {}),
      storagePath,
      thumbPath,
      url,
      thumbUrl,
      width: toInt(form.get('width')),
      height: toInt(form.get('height')),
      sizeBytes: photo.size,
      hidden: false,
      createdAt: new Date().toISOString(),
    };
    await ref.set(doc);

    return NextResponse.json({
      photo: toPublicPhoto({ ...doc, id: ref.id }),
      remaining: Math.max(0, ALBUM_PHOTO_LIMIT - used - 1),
      mode: albumMode(wedding),
    });
  } catch (error) {
    console.error('Error en POST /api/album/[weddingId]/photos:', error);
    return fail(500, 'server_error');
  }
}
