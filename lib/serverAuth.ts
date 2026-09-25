import { NextRequest, NextResponse } from 'next/server';

export interface VerifiedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
}

type AuthResult = { ok: true; user: VerifiedUser } | { ok: false; response: NextResponse };

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
}

export const isAdminEmail = (email: string) => getAdminEmails().includes(normalizeEmail(email));

// Verifica el ID token de Firebase Auth del encabezado Authorization: Bearer <token>.
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  const header = request.headers.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    return { ok: false, response: NextResponse.json({ error: 'unauthenticated' }, { status: 401 }) };
  }

  // Una configuración faltante (cuenta de servicio) es un error del servidor, no una sesión inválida.
  // Import dinámico: si el módulo no carga en el servidor (empaquetado), se responde JSON con el motivo
  // en vez de una caída sin cuerpo.
  let adminAuth: import('firebase-admin/auth').Auth;
  try {
    const { getAdminAuth } = await import('./firebase-admin');
    adminAuth = getAdminAuth();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Configuración de firebase-admin:', message);
    const reason = error && typeof error === 'object' && 'reason' in error ? String((error as { reason: unknown }).reason) : 'module_load';
    const detail = reason === 'module_load' ? message.slice(0, 200) : undefined;
    return { ok: false, response: NextResponse.json({ error: 'server_misconfigured', reason, detail }, { status: 500 }) };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.email) {
      return { ok: false, response: NextResponse.json({ error: 'unauthenticated' }, { status: 401 }) };
    }
    return {
      ok: true,
      user: { uid: decoded.uid, email: normalizeEmail(decoded.email), emailVerified: decoded.email_verified === true },
    };
  } catch {
    return { ok: false, response: NextResponse.json({ error: 'unauthenticated' }, { status: 401 }) };
  }
}

// Solo el operador: correo verificado y presente en ADMIN_EMAILS.
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  const result = await authenticate(request);
  if (!result.ok) return result;
  if (!result.user.emailVerified) {
    return { ok: false, response: NextResponse.json({ error: 'email_not_verified' }, { status: 403 }) };
  }
  if (!isAdminEmail(result.user.email)) {
    return { ok: false, response: NextResponse.json({ error: 'not_admin' }, { status: 403 }) };
  }
  return result;
}
