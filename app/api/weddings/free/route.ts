import { NextRequest, NextResponse } from 'next/server';
import { authenticate, countFreeWeddingsForEmail } from '../../../../lib/serverAuth';
import { createInitialWeddingData, generateFreeWeddingId } from '../../../../lib/wedding-defaults';
import { isValidIsoDate } from '../../../../lib/admin-validation';

export const runtime = 'nodejs';

const FREE_WEDDING_LIMIT = 3;

const invalid = (field: string) => NextResponse.json({ error: 'invalid_input', field }, { status: 400 });
const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

// Alta de autoservicio (spec 16): cualquier cuenta autenticada crea su propia boda
// gratuita (la verificación de correo está deshabilitada a propósito), sin plantilla
// ni editor, hasta un máximo de 3 por cuenta. A diferencia de
// POST /api/admin/weddings, no exige ser operador ni recibe `templateId`: `tier: 'free'`
// y sin `template` es justamente lo que la distingue.
export async function POST(request: NextRequest) {
  const auth = await authenticate(request);
  if (!auth.ok) return auth.response;
  // La verificación de correo se deshabilitó a propósito (antes devolvía 403 aquí).

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return invalid('body');
  }

  const bride = text(body.bride, 80);
  const groom = text(body.groom, 80);
  const date = text(body.date, 10);

  if (!bride) return invalid('bride');
  if (!groom) return invalid('groom');
  if (!isValidIsoDate(date)) return invalid('date');

  try {
    const existing = await countFreeWeddingsForEmail(auth.user.email);
    if (existing >= FREE_WEDDING_LIMIT) {
      return NextResponse.json({ error: 'free_limit_reached', limit: FREE_WEDDING_LIMIT }, { status: 409 });
    }

    const { getAdminDb } = await import('../../../../lib/firebase-admin');
    const db = getAdminDb();
    const weddingId = await generateFreeWeddingId(bride, groom, async (id) => {
      const snap = await db.collection('weddings').doc(id).get();
      return snap.exists;
    });

    const wedding = createInitialWeddingData(weddingId);
    wedding.couple.bride.name = bride;
    wedding.couple.groom.name = groom;
    wedding.event.date = `${date}T16:00:00.000Z`; // mismo formato que usa el alta del operador
    wedding.tier = 'free'; // sin `template`: es justamente lo que createInitialWeddingData no incluye
    // Sin esto, el campo "Número de Personas" del panel de Invitados queda oculto (solo se
    // activa desde el Editor de invitación, que una boda gratuita no tiene) y `guestCount`
    // se fijaría en 1 para siempre, sin dato real para Mesas.
    wedding.selectedGuestTickets = false;

    const batch = db.batch();
    batch.create(db.collection('weddings').doc(weddingId), wedding as unknown as FirebaseFirestore.DocumentData);
    batch.create(db.collection('weddingOwners').doc(weddingId), { emails: [auth.user.email] });
    await batch.commit();

    return NextResponse.json({ id: weddingId }, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/weddings/free:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
