import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Motivo de una configuración inválida de la cuenta de servicio; se devuelve tal cual en la
// respuesta (sin datos sensibles) para poder diagnosticar en producción.
export type AdminConfigReason = 'missing_env' | 'invalid_json' | 'invalid_credential';

export class AdminConfigError extends Error {
  constructor(public reason: AdminConfigReason, message: string) {
    super(message);
  }
}

// SDK admin del servidor (spec 08). Solo se importa desde rutas de app/api/**:
// la cuenta de servicio nunca debe llegar a un componente de cliente.
// Se inicializa de forma perezosa para que el build no exija la variable.
function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw || !raw.trim()) {
    throw new AdminConfigError('missing_env', 'FIREBASE_SERVICE_ACCOUNT_JSON no está configurada');
  }

  let credentials: Parameters<typeof cert>[0];
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new AdminConfigError('invalid_json', 'FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido (debe ir completo, sin comillas externas)');
  }

  try {
    return initializeApp({ credential: cert(credentials) });
  } catch (error) {
    throw new AdminConfigError('invalid_credential', `La cuenta de servicio no es válida: ${error instanceof Error ? error.message : 'error desconocido'}`);
  }
}

export const getAdminAuth = () => getAuth(getAdminApp());
export const getAdminDb = () => getFirestore(getAdminApp());
