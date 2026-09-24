import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { requireAdmin } from '../../../../lib/serverAuth';
import { createInitialWeddingData, isValidWeddingId } from '../../../../lib/wedding-defaults';
import { isTemplateId, isValidEmail, isValidIsoDate, normalizeEmailList } from '../../../../lib/admin-validation';

export const runtime = 'nodejs';

const invalid = (field: string) => NextResponse.json({ error: 'invalid_input', field }, { status: 400 });
const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const isAlreadyExists = (err: unknown) => {
  const code = err && typeof err === 'object' ? (err as { code?: unknown }).code : undefined;
  return code === 6 || code === 'already-exists';
};

// Alta de una invitación (solo operador): crea weddings/<id> y weddingOwners/<id> en una
// sola operación atómica. Si el ID ya existe, no escribe nada.
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return invalid('body');
  }

  const bride = text(body.bride, 80);
  const groom = text(body.groom, 80);
  const brideEmail = text(body.brideEmail, 120).toLowerCase();
  const groomEmail = text(body.groomEmail, 120).toLowerCase();
  const date = text(body.date, 10);
  const weddingId = text(body.weddingId, 50);

  if (!bride) return invalid('bride');
  if (!groom) return invalid('groom');
  if (!isValidEmail(brideEmail)) return invalid('brideEmail');
  if (!isValidEmail(groomEmail)) return invalid('groomEmail');
  if (!isValidIsoDate(date)) return invalid('date');
  if (!isTemplateId(body.templateId)) return invalid('templateId');
  if (!isValidWeddingId(weddingId)) return invalid('weddingId');
  const emails = normalizeEmailList([brideEmail, groomEmail], 1, 2);
  if (!emails) return invalid('brideEmail');

  const wedding = createInitialWeddingData(weddingId);
  wedding.couple.bride.name = bride; // "persona 2" en el editor
  wedding.couple.groom.name = groom; // "persona 1" en el editor
  wedding.event.date = `${date}T16:00:00.000Z`; // mismo formato que escribe el editor
  wedding.template = { id: body.templateId };

  try {
    const db = getAdminDb();
    const batch = db.batch();
    batch.create(db.collection('weddings').doc(weddingId), wedding as unknown as FirebaseFirestore.DocumentData);
    batch.create(db.collection('weddingOwners').doc(weddingId), { emails });
    await batch.commit();
    return NextResponse.json({ id: weddingId }, { status: 201 });
  } catch (error) {
    if (isAlreadyExists(error)) return NextResponse.json({ error: 'wedding_exists' }, { status: 409 });
    console.error('Error en POST /api/admin/weddings:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
