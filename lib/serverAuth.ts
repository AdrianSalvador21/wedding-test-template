import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebase-admin';

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
  let adminAuth: ReturnType<typeof getAdminAuth>;
  try {
    adminAuth = getAdminAuth();
  } catch (error) {
    console.error('Configuración de firebase-admin:', error instanceof Error ? error.message : error);
    return { ok: false, response: NextResponse.json({ error: 'server_misconfigured' }, { status: 500 }) };
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
