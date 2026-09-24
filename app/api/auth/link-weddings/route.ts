import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { authenticate, isAdminEmail, normalizeEmail } from '../../../../lib/serverAuth';

export const runtime = 'nodejs';

const FIELDS = ['couple.bride.name', 'couple.groom.name', 'event.date'];

interface LinkedWedding {
  id: string;
  title: string;
  date: string;
  // Solo para el operador: correos con acceso (weddingOwners/<id>.emails)
  ownerEmails?: string[];
}

function toWedding(id: string, data: FirebaseFirestore.DocumentData | undefined): LinkedWedding {
  const bride = data?.couple?.bride?.name || '';
  const groom = data?.couple?.groom?.name || '';
  const title = bride || groom ? [bride || '…', groom || '…'].join(' y ') : id;
  return { id, title, date: typeof data?.event?.date === 'string' ? data.event.date : '' };
}

const ownerEmailsOf = (data: FirebaseFirestore.DocumentData | undefined): string[] =>
  Array.isArray(data?.emails) ? data.emails.filter((e: unknown): e is string => typeof e === 'string') : [];

// Devuelve las bodas de la cuenta a partir de su correo verificado. El vínculo se
// evalúa en cada llamada (no se guardan uid), y solo el servidor lee weddingOwners.
export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (!auth.ok) return auth.response;
  if (!auth.user.emailVerified) {
    return NextResponse.json({ error: 'email_not_verified' }, { status: 403 });
  }

  try {
    const email = auth.user.email;
    const isAdmin = isAdminEmail(email);
    const db = getAdminDb();
    const ownersSnap = await db.collection('weddingOwners').get();

    let weddings: LinkedWedding[];
    if (isAdmin) {
      const ownersById = new Map(ownersSnap.docs.map((d) => [d.id, ownerEmailsOf(d.data())]));
      const snap = await db.collection('weddings').select(...FIELDS).get();
      weddings = snap.docs.map((d) => ({ ...toWedding(d.id, d.data()), ownerEmails: ownersById.get(d.id) ?? [] }));
    } else {
      const ids = ownersSnap.docs
        .filter((d) => ownerEmailsOf(d.data()).some((e) => normalizeEmail(e) === email))
        .map((d) => d.id);
      if (ids.length === 0) {
        weddings = [];
      } else {
        const refs = ids.map((id) => db.collection('weddings').doc(id));
        const docs = await db.getAll(...refs, { fieldMask: FIELDS });
        weddings = docs.filter((d) => d.exists).map((d) => toWedding(d.id, d.data()));
      }
    }

    weddings.sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.title.localeCompare(b.title));
    return NextResponse.json({ email, isAdmin, weddings });
  } catch (error) {
    console.error('Error en /api/auth/link-weddings:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
