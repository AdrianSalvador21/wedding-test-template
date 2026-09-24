'use client';

import { useEffect, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { AuthErrorScreen, LoadingScreen, NoAccessScreen, VerifyEmailScreen } from './auth-ui';

// Protege un panel de admin (spec 08). Envuelve al panel completo, así el documento de la boda
// ni se carga ni se escribe antes de pasar el guard. Es un control de interfaz: la protección
// de datos en Firestore llega con el spec 09.
export default function AuthGuard({ weddingId, children }: { weddingId: string; children: ReactNode }) {
  const auth = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';

  useEffect(() => {
    if (auth.status === 'signedOut') {
      const next = encodeURIComponent(window.location.pathname);
      router.replace(`/${locale}/login?next=${next}`);
    }
  }, [auth.status, locale, router]);

  if (auth.status === 'loading' || auth.status === 'signedOut') return <LoadingScreen text="Verificando tu sesión..." />;
  if (auth.status === 'unverified') return <VerifyEmailScreen />;
  if (auth.status === 'error') return <AuthErrorScreen />;

  const hasAccess = auth.isAdmin || auth.weddings.some((w) => w.id === weddingId);
  if (!hasAccess) return <NoAccessScreen />;

  return <>{children}</>;
}
