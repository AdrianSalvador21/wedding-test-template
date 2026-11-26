import { NextRequest, NextResponse } from 'next/server';
import { applyOp, buildSnapshot, findAccessByCode, getDb, type OpResult } from '../../../../../lib/checkInServer';
import { CHECKIN_MAX_OPS, isValidOp } from '../../../../../lib/checkIn';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUS_ERROR = { invalid: [404, 'link_invalid'], disabled: [403, 'check_in_disabled'], ended: [410, 'check_in_ended'] } as const;

// Spec 33 — acciones de la hostess (en línea o acumuladas sin señal). Se aplican en orden; gana la
// más reciente y "agregar invitado" es idempotente por opId. Devuelve el resultado de cada una y la
// foto nueva.
export async function POST(request: NextRequest, { params }: { params: { code: string } }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }
  const ops = (body as { ops?: unknown })?.ops;
  if (!Array.isArray(ops) || ops.length === 0 || ops.length > CHECKIN_MAX_OPS) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const access = await findAccessByCode(db, params.code);
    if (access.status !== 'ok') {
      const [status, error] = STATUS_ERROR[access.status];
      return NextResponse.json({ error }, { status });
    }
    const results: OpResult[] = [];
    for (const op of ops) {
      if (!isValidOp(op)) {
        results.push({ opId: typeof (op as { opId?: unknown })?.opId === 'string' ? (op as { opId: string }).opId : '', status: 'not_found' });
        continue;
      }
      results.push(await applyOp(db, access.weddingId, access.wedding, op));
    }
    const snapshot = await buildSnapshot(db, access.weddingId, access.wedding);
    return NextResponse.json({ results, snapshot }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('check-in ops', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
