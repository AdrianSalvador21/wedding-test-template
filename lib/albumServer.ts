// Spec 29 — utilidades del álbum que solo corren en el servidor (rutas de app/api/**).
// Usan firebase-admin: nunca se importan desde un componente de cliente.

import { randomUUID } from 'crypto';
import type { AlbumPhoto } from '../src/types/wedding';
import type * as AdminModule from './firebase-admin';
import { albumMode, albumPhase, expiresAt, isRevealed, revealAt, uploadClosesAt, uploadOpensAt, type AlbumWeddingLike } from './album';

export type WeddingDoc = AlbumWeddingLike & {
  couple?: { bride?: { name?: string }; groom?: { name?: string } };
  template?: { id?: string };
  defaultLanguage?: string;
};

export async function getAdminDeps() {
  const { getAdminDb, getAdminBucket } = await import('./firebase-admin');
  return { db: getAdminDb(), getBucket: getAdminBucket };
}

export async function loadWedding(db: FirebaseFirestore.Firestore, weddingId: string): Promise<WeddingDoc | null> {
  const snap = await db.collection('weddings').doc(weddingId).get();
  return snap.exists ? (snap.data() as WeddingDoc) : null;
}

export async function findGuest(db: FirebaseFirestore.Firestore, weddingId: string, guestId: string): Promise<{ name: string } | null> {
  const snap = await db.collection('guests').where('guestId', '==', guestId).where('weddingId', '==', weddingId).limit(1).get();
  if (snap.empty) return null;
  const name = snap.docs[0].data()?.name;
  return { name: typeof name === 'string' ? name : '' };
}

export async function countUploaderPhotos(db: FirebaseFirestore.Firestore, weddingId: string, uploader: { guestId?: string; deviceId?: string }): Promise<number> {
  const field = uploader.guestId ? 'guestId' : 'deviceId';
  const value = uploader.guestId ?? uploader.deviceId;
  if (!value) return 0;
  const agg = await db.collection('albumPhotos').where('weddingId', '==', weddingId).where(field, '==', value).count().get();
  return agg.data().count;
}

export async function listWeddingPhotos(db: FirebaseFirestore.Firestore, weddingId: string): Promise<AlbumPhoto[]> {
  // Se ordena en memoria (de la más reciente a la más antigua): una boda tiene a lo sumo unos miles
  // de fotos y así la consulta no depende de que el índice compuesto ya esté desplegado.
  const snap = await db.collection('albumPhotos').where('weddingId', '==', weddingId).get();
  return snap.docs
    .map((d) => ({ ...(d.data() as AlbumPhoto), id: d.id }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
}

// URL de descarga con token: funciona aunque storage.rules niegue todo a los clientes.
export function downloadUrl(bucketName: string, path: string, token: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

export type AdminBucket = ReturnType<typeof AdminModule.getAdminBucket>;

export async function saveJpeg(bucket: AdminBucket, path: string, data: Buffer): Promise<string> {
  const token = randomUUID();
  await bucket.file(path).save(data, {
    resumable: false,
    contentType: 'image/jpeg',
    metadata: { cacheControl: 'public, max-age=31536000', metadata: { firebaseStorageDownloadTokens: token } },
  });
  return downloadUrl(bucket.name, path, token);
}

// Lo que el álbum público muestra de cada foto (sin rutas internas ni ids de quien subió).
export function toPublicPhoto(photo: AlbumPhoto) {
  return {
    id: photo.id,
    thumbUrl: photo.thumbUrl,
    url: photo.url,
    width: photo.width,
    height: photo.height,
    uploaderName: photo.uploaderName ?? null,
    createdAt: photo.createdAt,
  };
}

export function albumDates(wedding: WeddingDoc) {
  const iso = (d: Date | null) => (d ? d.toISOString() : null);
  return {
    opensAt: iso(uploadOpensAt(wedding)),
    closesAt: iso(uploadClosesAt(wedding)),
    revealAt: iso(revealAt(wedding)),
    expiresAt: iso(expiresAt(wedding)),
  };
}

export { albumMode, albumPhase, isRevealed };
