import { NextRequest, NextResponse } from 'next/server';
import { requireWeddingAccess } from '../../../../../lib/serverAuth';
import { isWeddingIdFormat } from '../../../../../lib/album';
import { isCheckInEnded } from '../../../../../lib/checkIn';
import { buildSnapshot, getAccessCode, getDb, listActivity, loadWedding, rotateCode, setCheckInEnabled } from '../../../../../lib/checkInServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const notFound = () => NextResponse.json({ error: 'not_found' }, { status: 404 });

// Spec 33 — sección Check-in del panel: estado, link de hostess, foto completa y actividad.
export async function GET(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const weddingId = params.weddingId;
  if (!isWeddingIdFormat(weddingId)) return notFound();
  const auth = await requireWeddingAccess(request, weddingId);
  if (!auth.ok) return auth.response;
  try {
    const db = await getDb();
    const wedding = await loadWedding(db, weddingId);
    if (!wedding) return notFound();
    const [code, snapshot, activity] = await Promise.all([getAccessCode(db, weddingId), buildSnapshot(db, weddingId, wedding), listActivity(db, weddingId)]);
    return NextResponse.json(
      { enabled: wedding.checkIn?.enabled === true, code, ended: isCheckInEnded(wedding), snapshot, activity },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('panel check-in GET', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

// `{ enabled: boolean }` activa o desactiva (la primera activación crea el código).
// `{ rotate: true }` genera un link nuevo: el anterior deja de funcionar de inmediato.
export async function PATCH(request: NextRequest, { params }: { params: { weddingId: string } }) {
  const weddingId = params.weddingId;
  if (!isWeddingIdFormat(weddingId)) return notFound();
  const auth = await requireWeddingAccess(request, weddingId);
  if (!auth.ok) return auth.response;
  let body: { enabled?: unknown; rotate?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  try {
    const db = await getDb();
    if (!(await loadWedding(db, weddingId))) return notFound();
    if (body.rotate === true) {
      const code = await rotateCode(db, weddingId);
      return NextResponse.json({ code });
    }
    if (typeof body.enabled === 'boolean') {
      const code = await setCheckInEnabled(db, weddingId, body.enabled);
      return NextResponse.json({ enabled: body.enabled, code });
    }
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  } catch (error) {
    console.error('panel check-in PATCH', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
