import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../../../../lib/serverAuth';
import { isValidWeddingId } from '../../../../../lib/wedding-defaults';
import { isTemplateId, isValidEmail, MAX_OWNER_EMAILS } from '../../../../../lib/admin-validation';

export const runtime = 'nodejs';

const notFound = () => NextResponse.json({ error: 'not_found' }, { status: 404 });
const invalid = (field: string) => NextResponse.json({ error: 'invalid_input', field }, { status: 400 });
const ownersLimit = () => NextResponse.json({ error: 'owners_limit' }, { status: 400 });

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
class OwnersLimitError extends Error {}
class PlannerEmailConflictError extends Error {}

// Spec 17 — agrega/quita el correo del planner de la lista de dueños de la boda, sin
// tocar los demás correos. Puro: no valida el límite, eso lo hace quien la llama.
function applyPlannerEmailToOwners(currentEmails: string[], prevPlannerEmail: string | null, nextPlannerEmail: string | null): string[] {
  let emails = currentEmails;
  if (prevPlannerEmail && prevPlannerEmail !== nextPlannerEmail) {
    emails = emails.filter((e) => e !== prevPlannerEmail);
  }
  if (nextPlannerEmail && !emails.includes(nextPlannerEmail)) {
    emails = [...emails, nextPlannerEmail];
  }
  return emails;
}

// Datos de los ajustes de una invitación: plantilla actual y cuántos invitados tiene
// (mientras tenga alguno, la dirección no se puede cambiar).
export async function GET(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  if (!isValidWeddingId(params.weddingId)) return notFound();

  try {
    const { getAdminDb } = await import('../../../../../lib/firebase-admin');
    const db = getAdminDb();
    const snap = await db.collection('weddings').doc(params.weddingId).get();
    if (!snap.exists) return notFound();
    const count = await db.collection('guests').where('weddingId', '==', params.weddingId).count().get();
    const templateId = snap.data()?.template?.id;
    const plannerEmail = snap.data()?.plannerEmail;
    return NextResponse.json({
      id: params.weddingId,
      templateId: isTemplateId(templateId) ? templateId : 'template-01',
      guestCount: count.data().count,
      plannerEmail: typeof plannerEmail === 'string' ? plannerEmail : null,
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

  let body: { templateId?: unknown; newWeddingId?: unknown; plannerEmail?: unknown };
  try {
    body = await request.json();
  } catch {
    return invalid('body');
  }

  const hasTemplate = body.templateId !== undefined;
  const newId = typeof body.newWeddingId === 'string' ? body.newWeddingId.trim() : undefined;
  const renaming = newId !== undefined && newId !== id;
  // Spec 17 — plannerEmail: string (asignar/cambiar) o null (quitar); undefined = no tocar.
  const hasPlannerChange = body.plannerEmail !== undefined;
  if (hasTemplate && !isTemplateId(body.templateId)) return invalid('templateId');
  if (newId !== undefined && !isValidWeddingId(newId)) return invalid('newWeddingId');
  let plannerEmailValue: string | null = null;
  if (hasPlannerChange) {
    if (body.plannerEmail === null) {
      plannerEmailValue = null;
    } else if (typeof body.plannerEmail === 'string') {
      plannerEmailValue = body.plannerEmail.trim().toLowerCase();
      if (!isValidEmail(plannerEmailValue)) return invalid('plannerEmail');
    } else {
      return invalid('plannerEmail');
    }
  }
  if (!hasTemplate && !renaming && !hasPlannerChange) return invalid('body');

  let db: FirebaseFirestore.Firestore;
  try {
    const { getAdminDb } = await import('../../../../../lib/firebase-admin');
    db = getAdminDb();
  } catch (error) {
    console.error('Configuración de firebase-admin:', error);
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 });
  }
  const oldRef = db.collection('weddings').doc(id);
  const now = new Date().toISOString();

  try {
    if (!renaming) {
      const snap = await oldRef.get();
      if (!snap.exists) return notFound();
      const data = snap.data() as FirebaseFirestore.DocumentData;
      const prevPlannerEmail = typeof data.plannerEmail === 'string' ? data.plannerEmail : null;

      const update: Record<string, unknown> = { updatedAt: now };
      // Spec 16: asignar plantilla es el único punto donde una boda pasa de 'free' a 'template'.
      if (hasTemplate) {
        update['template.id'] = body.templateId;
        update.tier = 'template';
      }

      if (hasPlannerChange) {
        const ownersRef = db.collection('weddingOwners').doc(id);
        const ownersSnap = await ownersRef.get();
        const currentEmails: string[] = Array.isArray(ownersSnap.data()?.emails) ? (ownersSnap.data()!.emails as string[]) : [];
        const otherOwnerEmails = currentEmails.filter((e) => e !== prevPlannerEmail);
        if (plannerEmailValue && otherOwnerEmails.includes(plannerEmailValue)) return invalid('plannerEmail');

        const nextEmails = applyPlannerEmailToOwners(currentEmails, prevPlannerEmail, plannerEmailValue);
        if (nextEmails.length > MAX_OWNER_EMAILS) return ownersLimit();

        update.plannerEmail = plannerEmailValue;
        if (nextEmails.length !== currentEmails.length || nextEmails.some((e, i) => e !== currentEmails[i])) {
          await ownersRef.set({ emails: nextEmails }, { merge: true });
        }
      }

      await oldRef.update(update);
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
      const prevPlannerEmail = typeof data.plannerEmail === 'string' ? data.plannerEmail : null;
      const currentEmails: string[] = owners.exists && Array.isArray(owners.data()?.emails) ? (owners.data()!.emails as string[]) : [];

      let finalEmails = currentEmails;
      if (hasPlannerChange) {
        const otherOwnerEmails = currentEmails.filter((e) => e !== prevPlannerEmail);
        if (plannerEmailValue && otherOwnerEmails.includes(plannerEmailValue)) throw new PlannerEmailConflictError();
        finalEmails = applyPlannerEmailToOwners(currentEmails, prevPlannerEmail, plannerEmailValue);
        if (finalEmails.length > MAX_OWNER_EMAILS) throw new OwnersLimitError();
      }

      const moved = {
        ...data,
        id: newId,
        event: { ...(data.event || {}), weddingId: newId },
        updatedAt: now,
        ...(hasTemplate ? { template: { id: body.templateId }, tier: 'template' } : {}),
        ...(hasPlannerChange ? { plannerEmail: plannerEmailValue } : {}),
      };
      tx.create(newRef, moved);
      tx.delete(oldRef);
      if (owners.exists) {
        tx.create(newOwnersRef, { ...(owners.data() as FirebaseFirestore.DocumentData), emails: finalEmails });
        tx.delete(oldOwnersRef);
      } else if (finalEmails.length > 0) {
        tx.create(newOwnersRef, { emails: finalEmails });
      }
    });
    return NextResponse.json({ id: newId });
  } catch (error) {
    if (error instanceof NotFoundError) return notFound();
    if (error instanceof HasGuestsError) return NextResponse.json({ error: 'has_guests', guestCount: error.guestCount }, { status: 409 });
    if (error instanceof OwnersLimitError) return ownersLimit();
    if (error instanceof PlannerEmailConflictError) return invalid('plannerEmail');
    if (isAlreadyExists(error)) return NextResponse.json({ error: 'wedding_exists' }, { status: 409 });
    console.error('Error en PATCH /api/admin/weddings/[weddingId]:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
