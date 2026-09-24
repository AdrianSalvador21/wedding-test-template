import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../lib/firebase-admin';
import { requireAdmin } from '../../../../../lib/serverAuth';
import { isValidWeddingId } from '../../../../../lib/wedding-defaults';
import { isTemplateId } from '../../../../../lib/admin-validation';

export const runtime = 'nodejs';

const notFound = () => NextResponse.json({ error: 'not_found' }, { status: 404 });
const invalid = (field: string) => NextResponse.json({ error: 'invalid_input', field }, { status: 400 });

const isAlreadyExists = (err: unknown) => {
  const code = err && typeof err === 'object' ? (err as { code?: unknown }).code : undefined;
  return code === 6 || code === 'already-exists';
};

class HasGuestsError extends Error {
  constructor(public guestCount: number) {
    super('has_guests');
  }
}
class NotFoundError extends Error {}

// Datos de los ajustes de una invitación: plantilla actual y cuántos invitados tiene
// (mientras tenga alguno, la dirección no se puede cambiar).
export async function GET(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  if (!isValidWeddingId(params.weddingId)) return notFound();

  try {
    const db = getAdminDb();
    const snap = await db.collection('weddings').doc(params.weddingId).get();
    if (!snap.exists) return notFound();
    const count = await db.collection('guests').where('weddingId', '==', params.weddingId).count().get();
    const templateId = snap.data()?.template?.id;
    return NextResponse.json({
      id: params.weddingId,
      templateId: isTemplateId(templateId) ? templateId : 'template-01',
      guestCount: count.data().count,
    });
  } catch (error) {
    console.error('Error en GET /api/admin/weddings/[weddingId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// Cambia la plantilla y/o la dirección (ID) de una invitación. La plantilla se puede cambiar
// siempre; la dirección solo si no hay invitados, porque sus enlaces dejarían de funcionar.
export async function PATCH(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const id = params.weddingId;
  if (!isValidWeddingId(id)) return notFound();

  let body: { templateId?: unknown; newWeddingId?: unknown };
  try {
    body = await request.json();
  } catch {
    return invalid('body');
  }

  const hasTemplate = body.templateId !== undefined;
  const newId = typeof body.newWeddingId === 'string' ? body.newWeddingId.trim() : undefined;
  const renaming = newId !== undefined && newId !== id;
  if (hasTemplate && !isTemplateId(body.templateId)) return invalid('templateId');
  if (newId !== undefined && !isValidWeddingId(newId)) return invalid('newWeddingId');
  if (!hasTemplate && !renaming) return invalid('body');

  const db = getAdminDb();
  const oldRef = db.collection('weddings').doc(id);
  const now = new Date().toISOString();

  try {
    if (!renaming) {
      const snap = await oldRef.get();
      if (!snap.exists) return notFound();
      await oldRef.update({ 'template.id': body.templateId, updatedAt: now });
      return NextResponse.json({ id });
    }

    const newRef = db.collection('weddings').doc(newId as string);
    const oldOwnersRef = db.collection('weddingOwners').doc(id);
    const newOwnersRef = db.collection('weddingOwners').doc(newId as string);
    const guestsQuery = db.collection('guests').where('weddingId', '==', id).limit(1);

    await db.runTransaction(async (tx) => {
      const [wedding, owners, guests] = await Promise.all([tx.get(oldRef), tx.get(oldOwnersRef), tx.get(guestsQuery)]);
      if (!wedding.exists) throw new NotFoundError();
      if (!guests.empty) {
        const count = await db.collection('guests').where('weddingId', '==', id).count().get();
        throw new HasGuestsError(count.data().count);
      }

      const data = wedding.data() as FirebaseFirestore.DocumentData;
      const moved = {
        ...data,
        id: newId,
        event: { ...(data.event || {}), weddingId: newId },
        updatedAt: now,
        ...(hasTemplate ? { template: { id: body.templateId } } : {}),
      };
      tx.create(newRef, moved);
      tx.delete(oldRef);
      if (owners.exists) {
        tx.create(newOwnersRef, owners.data() as FirebaseFirestore.DocumentData);
        tx.delete(oldOwnersRef);
      }
    });
    return NextResponse.json({ id: newId });
  } catch (error) {
    if (error instanceof NotFoundError) return notFound();
    if (error instanceof HasGuestsError) return NextResponse.json({ error: 'has_guests', guestCount: error.guestCount }, { status: 409 });
    if (isAlreadyExists(error)) return NextResponse.json({ error: 'wedding_exists' }, { status: 409 });
    console.error('Error en PATCH /api/admin/weddings/[weddingId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
