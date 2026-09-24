import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '../../../../../../lib/firebase-admin';
import { requireAdmin } from '../../../../../../lib/serverAuth';
import { isValidWeddingId } from '../../../../../../lib/wedding-defaults';
import { MAX_OWNER_EMAILS, normalizeEmailList } from '../../../../../../lib/admin-validation';

export const runtime = 'nodejs';

// Correos con acceso a una boda (weddingOwners/<id>.emails). Solo operador.
export async function GET(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  if (!isValidWeddingId(params.weddingId)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  try {
    const snap = await getAdminDb().collection('weddingOwners').doc(params.weddingId).get();
    const emails = Array.isArray(snap.data()?.emails) ? (snap.data()?.emails as unknown[]).filter((e): e is string => typeof e === 'string') : [];
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error en GET owners:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  if (!isValidWeddingId(params.weddingId)) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  let body: { emails?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_input', field: 'emails' }, { status: 400 });
  }

  const emails = normalizeEmailList(body.emails, 1, MAX_OWNER_EMAILS);
  if (!emails) return NextResponse.json({ error: 'invalid_input', field: 'emails' }, { status: 400 });

  try {
    const db = getAdminDb();
    const wedding = await db.collection('weddings').doc(params.weddingId).get();
    if (!wedding.exists) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    await db.collection('weddingOwners').doc(params.weddingId).set({ emails });
    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Error en PUT owners:', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
