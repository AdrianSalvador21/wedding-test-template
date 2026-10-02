import { NextRequest, NextResponse } from 'next/server';
import { authenticate, isAdminEmail, normalizeEmail } from '../../../../lib/serverAuth';

export const runtime = 'nodejs';

const FIELDS = ['couple.bride.name', 'couple.groom.name', 'event.date', 'tier', 'plannerEmail'];

interface LinkedWedding {
  id: string;
  title: string;
  date: string;
  // Spec 16 — ausente se interpreta como 'template' (bodas creadas antes de este spec)
  tier: 'free' | 'template';
  // Spec 17 — correo del wedding planner atribuido, si aplica; visible para admin y dueño
  // no-admin por igual (a diferencia de ownerEmails, que sigue siendo solo de operador).
  plannerEmail: string | null;
  // Solo para el operador: correos con acceso (weddingOwners/<id>.emails)
  ownerEmails?: string[];
}

function toWedding(id: string, data: FirebaseFirestore.DocumentData | undefined): LinkedWedding {
  const bride = data?.couple?.bride?.name || '';
  const groom = data?.couple?.groom?.name || '';
  const title = bride || groom ? [bride || '…', groom || '…'].join(' y ') : id;
  const tier = data?.tier === 'free' ? 'free' : 'template';
  const plannerEmail = typeof data?.plannerEmail === 'string' ? data.plannerEmail : null;
  return { id, title, date: typeof data?.event?.date === 'string' ? data.event.date : '', tier, plannerEmail };
}

const ownerEmailsOf = (data: FirebaseFirestore.DocumentData | undefined): string[] =>
  Array.isArray(data?.emails) ? data.emails.filter((e: unknown): e is string => typeof e === 'string') : [];

// Devuelve las bodas de la cuenta a partir de su correo verificado. El vínculo se
// evalúa en cada llamada (no se guardan uid), y solo el servidor lee weddingOwners.
export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (!auth.ok) return auth.response;
  // La verificación de correo se deshabilitó a propósito (antes devolvía 403 aquí).

  try {
    const email = auth.user.email;
    const isAdmin = isAdminEmail(email);
    const { getAdminDb } = await import('../../../../lib/firebase-admin');
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
    // Solo el código de la falla (ej. PERMISSION_DENIED de Firestore), nunca el mensaje completo.
    const code = error && typeof error === 'object' && 'code' in error ? String((error as { code: unknown }).code) : 'unknown';
    const detail = code === 'unknown' && error instanceof Error ? error.message.slice(0, 200) : undefined;
    return NextResponse.json({ error: 'server_error', code, detail }, { status: 500 });
  }
}
