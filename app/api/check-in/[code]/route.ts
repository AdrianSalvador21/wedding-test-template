import { NextRequest, NextResponse } from 'next/server';
import { buildSnapshot, findAccessByCode, getDb } from '../../../../lib/checkInServer';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUS_ERROR = { invalid: [404, 'link_invalid'], disabled: [403, 'check_in_disabled'], ended: [410, 'check_in_ended'] } as const;

// Spec 33 — foto de la boda para el modo hostess. Solo lo necesario para recibir gente. Con
// `If-None-Match` igual a la versión actual responde 304 sin cuerpo (no gasta datos cada 10 s).
export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const db = await getDb();
    const access = await findAccessByCode(db, params.code);
    if (access.status !== 'ok') {
      const [status, error] = STATUS_ERROR[access.status];
      return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
    }
    const snapshot = await buildSnapshot(db, access.weddingId, access.wedding);
    const etag = `"${snapshot.version}"`;
    if (request.headers.get('if-none-match') === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag, 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json(snapshot, { headers: { ETag: etag, 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('check-in snapshot', error);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
