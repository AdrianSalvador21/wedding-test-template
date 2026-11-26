// Spec 33 — check-in: utilidades que solo corren en el servidor (rutas de app/api/**). Usan
// firebase-admin: nunca se importan desde un componente de cliente.

import { createHash, randomBytes } from 'crypto';
import type {
  CheckInActivity,
  CheckInActivityType,
  CheckInOp,
  CheckInRecord,
  CheckInSnapshot,
  CheckInSnapshotGuest,
  FirebaseGuest,
  FirebaseTable,
  FirebaseVenueFixture,
} from '../src/types/wedding';
import { checkInDocId, checkInKey, guestUrlId, isCheckInEnded, personLabel, walkInDocId } from './checkIn';
import type { AlbumWeddingLike } from './album';

type Db = FirebaseFirestore.Firestore;

const ACCESS = 'checkInAccess';
const CHECKINS = 'checkIns';
const ACTIVITY = 'checkInActivity';

export type CheckInWedding = AlbumWeddingLike & {
  couple?: { bride?: { name?: string }; groom?: { name?: string } };
  defaultLanguage?: string;
  checkIn?: { enabled?: boolean; enabledAt?: string };
};

export async function getDb(): Promise<Db> {
  const { getAdminDb } = await import('./firebase-admin');
  return getAdminDb();
}

export async function loadWedding(db: Db, weddingId: string): Promise<CheckInWedding | null> {
  const snap = await db.collection('weddings').doc(weddingId).get();
  return snap.exists ? (snap.data() as CheckInWedding) : null;
}

// ---------- acceso por código ----------

export type AccessResult =
  | { status: 'ok'; weddingId: string; wedding: CheckInWedding }
  | { status: 'invalid' | 'disabled' | 'ended'; weddingId?: string; wedding?: CheckInWedding };

export const isCodeFormat = (code: string) => /^[A-Za-z0-9_-]{20,80}$/.test(code);

export async function findAccessByCode(db: Db, code: string): Promise<AccessResult> {
  if (!isCodeFormat(code)) return { status: 'invalid' };
  const snap = await db.collection(ACCESS).where('code', '==', code).limit(1).get();
  if (snap.empty) return { status: 'invalid' };
  const weddingId = snap.docs[0].id;
  const wedding = await loadWedding(db, weddingId);
  if (!wedding) return { status: 'invalid' };
  if (wedding.checkIn?.enabled !== true) return { status: 'disabled', weddingId, wedding };
  if (isCheckInEnded(wedding)) return { status: 'ended', weddingId, wedding };
  return { status: 'ok', weddingId, wedding };
}

export async function getAccessCode(db: Db, weddingId: string): Promise<string | null> {
  const snap = await db.collection(ACCESS).doc(weddingId).get();
  const code = snap.data()?.code;
  return typeof code === 'string' ? code : null;
}

const newCode = () => randomBytes(32).toString('base64url');

// Primera activación: crea el código. `rotate`: reemplaza el código y el anterior deja de servir.
export async function setCheckInEnabled(db: Db, weddingId: string, enabled: boolean): Promise<string | null> {
  const now = new Date().toISOString();
  const weddingRef = db.collection('weddings').doc(weddingId);
  const wedding = (await weddingRef.get()).data() as CheckInWedding | undefined;
  const enabledAt = wedding?.checkIn?.enabledAt || (enabled ? now : undefined);
  await weddingRef.set({ checkIn: { enabled, ...(enabledAt ? { enabledAt } : {}) } }, { merge: true });
  let code = await getAccessCode(db, weddingId);
  if (enabled && !code) {
    code = newCode();
    await db.collection(ACCESS).doc(weddingId).set({ weddingId, code, createdAt: now });
  }
  return code;
}

export async function rotateCode(db: Db, weddingId: string): Promise<string> {
  const code = newCode();
  const now = new Date().toISOString();
  await db.collection(ACCESS).doc(weddingId).set({ weddingId, code, rotatedAt: now, createdAt: now }, { merge: true });
  return code;
}

// ---------- reglas de asistencia (mismas que services/guestService.ts, sin el SDK de cliente) ----------

function seatedCount(g: FirebaseGuest): number {
  if (g.rsvpConfirmation?.attending === true) return g.rsvpConfirmation.guestCount || 1;
  return g.guestCount || 1;
}

function attendance(g: FirebaseGuest): 'confirmed' | 'declined' | 'pending' {
  if (g.rsvpConfirmation?.attending === true) return 'confirmed';
  if (g.rsvpConfirmation?.attending === false) return 'declined';
  if (g.rsvpStatus === 'confirmed') return 'confirmed';
  if (g.rsvpStatus === 'declined') return 'declined';
  return 'pending';
}

// ---------- foto de la boda ----------

function byWedding<T>(db: Db, collection: string, weddingId: string): Promise<(T & { id: string })[]> {
  return db
    .collection(collection)
    .where('weddingId', '==', weddingId)
    .get()
    .then((snap) => snap.docs.map((d) => ({ id: d.id, ...(d.data() as T) })));
}

export async function buildSnapshot(db: Db, weddingId: string, wedding: CheckInWedding): Promise<CheckInSnapshot> {
  const [guests, seats, tables, fixtures, records] = await Promise.all([
    byWedding<FirebaseGuest>(db, 'guests', weddingId),
    byWedding<{ guestId: string; seatIndex: number; tableId?: string | null }>(db, 'tableSeats', weddingId),
    byWedding<FirebaseTable>(db, 'tables', weddingId),
    byWedding<FirebaseVenueFixture>(db, 'venueFixtures', weddingId),
    byWedding<CheckInRecord>(db, CHECKINS, weddingId),
  ]);

  const seatsByGuest = new Map<string, Map<number, string | null>>();
  seats.forEach((s) => {
    if (!seatsByGuest.has(s.guestId)) seatsByGuest.set(s.guestId, new Map());
    seatsByGuest.get(s.guestId)!.set(s.seatIndex, s.tableId ?? null);
  });

  const snapGuests: CheckInSnapshotGuest[] = guests.map((g) => {
    const count = seatedCount(g);
    const own = seatsByGuest.get(g.id);
    const seatTables = Array.from({ length: count }, (_, i) => (own && own.size > 0 ? own.get(i) ?? null : g.tableId ?? null));
    return {
      docId: g.id,
      guestId: g.guestId || g.id,
      name: g.name || 'Invitado',
      status: attendance(g),
      count,
      seats: seatTables,
      plusOneName: g.rsvpConfirmation?.plusOne?.name || null,
      addedAtDoor: !!g.addedAtDoor,
    };
  });

  // Llegadas huérfanas (invitación borrada o persona que ya no existe) no se cuentan.
  const countByGuest = new Map(snapGuests.map((g) => [g.docId, g.count]));
  const checkIns: CheckInSnapshot['checkIns'] = {};
  records.forEach((r) => {
    const count = countByGuest.get(r.guestDocId);
    if (count === undefined || r.seatIndex >= count) return;
    checkIns[checkInKey(r.guestDocId, r.seatIndex)] = { arrived: r.arrived === true, at: r.at, arrivedAt: r.arrivedAt, by: r.by };
  });

  const body = {
    wedding: {
      id: weddingId,
      bride: wedding.couple?.bride?.name || '',
      groom: wedding.couple?.groom?.name || '',
      date: typeof wedding.event?.date === 'string' ? wedding.event.date : null,
      tier: (wedding.tier === 'free' ? 'free' : 'template') as 'free' | 'template',
    },
    tables: tables.map((t) => ({ id: t.id, name: t.name, capacity: t.capacity, shape: t.shape, posX: t.posX, posY: t.posY })),
    fixtures: fixtures.map((f) => ({ id: f.id, type: f.type, label: f.label, posX: f.posX, posY: f.posY, width: f.width, height: f.height })),
    guests: snapGuests.sort((a, b) => a.docId.localeCompare(b.docId)),
    checkIns,
  };
  const version = createHash('sha1').update(JSON.stringify(body)).digest('base64url').slice(0, 20);
  return { ...body, serverTime: new Date().toISOString(), version };
}

// ---------- acciones ----------

export type OpResult = { opId: string; status: 'applied' | 'stale' | 'not_found' };

// `at` del futuro (reloj adelantado) se recorta a la hora del servidor.
const clampAt = (at: string) => {
  const now = Date.now();
  const t = Date.parse(at);
  return new Date(Number.isNaN(t) || t > now ? now : t).toISOString();
};

async function logActivity(db: Db, weddingId: string, type: CheckInActivityType, by: string, guestName: string, at: string, detail?: string) {
  const entry: CheckInActivity = { weddingId, type, by, guestName, at, ...(detail ? { detail } : {}) };
  await db.collection(ACTIVITY).add(entry);
}

async function loadGuest(db: Db, weddingId: string, guestDocId: string): Promise<(FirebaseGuest & { id: string }) | null> {
  const snap = await db.collection('guests').doc(guestDocId).get();
  if (!snap.exists) return null;
  const data = snap.data() as FirebaseGuest;
  if (data.weddingId !== weddingId) return null;
  return { ...data, id: snap.id };
}

const toSnapGuest = (g: FirebaseGuest & { id: string }): CheckInSnapshotGuest => ({
  docId: g.id, guestId: g.guestId || g.id, name: g.name, status: attendance(g), count: seatedCount(g), seats: [], plusOneName: g.rsvpConfirmation?.plusOne?.name || null, addedAtDoor: !!g.addedAtDoor,
});

// Crea los asientos que falten con la misma regla que `seatService.getOrCreateGuestSeats`
// (si no había ninguno, heredan el `tableId` del modelo del spec 12).
async function ensureSeats(db: Db, guest: FirebaseGuest & { id: string }): Promise<Set<number>> {
  const desired = seatedCount(guest);
  const existing = await db.collection('tableSeats').where('guestId', '==', guest.id).get();
  const have = new Set(existing.docs.map((d) => d.data().seatIndex as number));
  const inherited = existing.empty ? guest.tableId ?? null : null;
  const now = new Date().toISOString();
  const batch = db.batch();
  const created = new Set<number>();
  for (let i = 0; i < desired; i += 1) {
    if (have.has(i)) continue;
    created.add(i);
    batch.set(db.collection('tableSeats').doc(`${guest.id}_${i}`), { weddingId: guest.weddingId, guestId: guest.id, seatIndex: i, tableId: inherited, createdAt: now, updatedAt: now });
  }
  if (created.size > 0) await batch.commit();
  return created;
}

async function tableName(db: Db, tableId: string | null): Promise<string> {
  if (!tableId) return 'sin mesa';
  const snap = await db.collection('tables').doc(tableId).get();
  return (snap.data()?.name as string) || 'otra mesa';
}

export async function applyOp(db: Db, weddingId: string, wedding: CheckInWedding, op: CheckInOp): Promise<OpResult> {
  const at = clampAt(op.at);
  const now = new Date().toISOString();

  if (op.type === 'walkIn') {
    const docId = walkInDocId(op.opId);
    const ref = db.collection('guests').doc(docId);
    if ((await ref.get()).exists) return { opId: op.opId, status: 'applied' }; // reintento: ya existe
    if (op.tableId) {
      const t = await db.collection('tables').doc(op.tableId).get();
      if (!t.exists || t.data()?.weddingId !== weddingId) return { opId: op.opId, status: 'not_found' };
    }
    const name = op.name.trim().slice(0, 120);
    const batch = db.batch();
    batch.set(ref, {
      weddingId,
      guestId: guestUrlId(name, op.opId.slice(0, 6).toLowerCase()),
      name,
      plusOneAllowed: op.count > 1,
      guestCount: op.count,
      language: wedding.defaultLanguage === 'en' ? 'en' : 'es',
      rsvpStatus: 'confirmed',
      rsvpConfirmation: { attending: true, guestCount: op.count, submittedAt: at },
      addedAtDoor: { by: op.by, at },
      createdAt: now,
      updatedAt: now,
    });
    for (let i = 0; i < op.count; i += 1) {
      batch.set(db.collection('tableSeats').doc(`${docId}_${i}`), { weddingId, guestId: docId, seatIndex: i, tableId: op.tableId, createdAt: now, updatedAt: now });
      const record: CheckInRecord = { weddingId, guestDocId: docId, seatIndex: i, arrived: true, arrivedAt: at, by: op.by, at, updatedAt: now };
      batch.set(db.collection(CHECKINS).doc(checkInDocId(weddingId, docId, i)), record);
    }
    await batch.commit();
    await logActivity(db, weddingId, 'walk_in', op.by, name, at, `${op.count} ${op.count === 1 ? 'persona' : 'personas'} · ${await tableName(db, op.tableId)}`);
    return { opId: op.opId, status: 'applied' };
  }

  const guest = await loadGuest(db, weddingId, op.guestDocId);
  if (!guest || op.seatIndex >= seatedCount(guest)) return { opId: op.opId, status: 'not_found' };
  const label = personLabel(toSnapGuest(guest), op.seatIndex);

  if (op.type === 'move') {
    if (op.tableId) {
      const t = await db.collection('tables').doc(op.tableId).get();
      if (!t.exists || t.data()?.weddingId !== weddingId) return { opId: op.opId, status: 'not_found' };
    }
    const created = await ensureSeats(db, guest);
    const seatRef = db.collection('tableSeats').doc(`${guest.id}_${op.seatIndex}`);
    const seat = await seatRef.get();
    // Gana el cambio más reciente: si Mesas lo cambió después, se respeta.
    const seatUpdated = seat.data()?.updatedAt as string | undefined;
    if (!created.has(op.seatIndex) && seatUpdated && seatUpdated > at) return { opId: op.opId, status: 'stale' };
    await seatRef.set({ tableId: op.tableId, updatedAt: at }, { merge: true });
    await logActivity(db, weddingId, 'moved', op.by, label, at, await tableName(db, op.tableId));
    return { opId: op.opId, status: 'applied' };
  }

  const ref = db.collection(CHECKINS).doc(checkInDocId(weddingId, guest.id, op.seatIndex));
  const current = (await ref.get()).data() as CheckInRecord | undefined;
  if (current && current.at >= at) return { opId: op.opId, status: 'stale' };
  const arrived = op.type === 'arrive';
  const record: CheckInRecord = {
    weddingId,
    guestDocId: guest.id,
    seatIndex: op.seatIndex,
    arrived,
    ...(arrived ? { arrivedAt: at } : current?.arrivedAt ? { arrivedAt: current.arrivedAt } : {}),
    by: op.by,
    at,
    updatedAt: now,
  };
  await ref.set(record);
  await logActivity(db, weddingId, arrived ? 'arrived' : 'undone', op.by, label, at);
  return { opId: op.opId, status: 'applied' };
}

// ---------- actividad ----------

// Solo filtra por weddingId y ordena aquí, como `activityService`, para no necesitar un índice compuesto.
export async function listActivity(db: Db, weddingId: string, max = 30): Promise<CheckInActivity[]> {
  const items = await byWedding<CheckInActivity>(db, ACTIVITY, weddingId);
  return items.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, max);
}
