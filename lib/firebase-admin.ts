import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// SDK admin del servidor (spec 08). Solo se importa desde rutas de app/api/**:
// la cuenta de servicio nunca debe llegar a un componente de cliente.
// Se inicializa de forma perezosa para que el build no exija la variable.
function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no está configurada');
  }

  let credentials: Parameters<typeof cert>[0];
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON no es un JSON válido (debe ir completo y en una sola línea)');
  }

  return initializeApp({ credential: cert(credentials) });
}

export const getAdminAuth = () => getAuth(getAdminApp());
export const getAdminDb = () => getFirestore(getAdminApp());
