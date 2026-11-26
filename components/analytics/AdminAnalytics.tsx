'use client';

import { useEffect, useRef } from 'react';
import { useAuth, type AuthStatus } from '../../lib/auth-context';
import { identifyUser, resetAnalytics, setNotrack, track } from '../../lib/analytics/client';

// Analítica del admin (specs 11 y 31). Se monta dentro de `AuthProvider` (layouts de admin y login).
// - Cuentas de pareja o planner: se identifican SOLO por el uid de Firebase y la propiedad de usuario
//   `account_type` ('couple' | 'planner'); nunca correo ni ID de boda.
// - Cuentas del operador (`ADMIN_EMAILS`): no se mide nada; se activa el interruptor de tráfico
//   propio en este dispositivo, así también quedan fuera sus visitas al sitio.
// - Al cerrar sesión: los eventos siguientes ya no llevan `user_id`.
export default function AdminAnalytics() {
  const { status, user, isAdmin, isPlanner } = useAuth();
  const previousStatus = useRef<AuthStatus>(status);
  const identifiedUid = useRef<string | null>(null);

  useEffect(() => {
    const before = previousStatus.current;
    previousStatus.current = status;

    if (status === 'signedOut') {
      if (identifiedUid.current) {
        resetAnalytics();
        identifiedUid.current = null;
      }
      return;
    }

    if (status !== 'ready' && status !== 'noWeddings') return;

    if (isAdmin) {
      setNotrack(true);
      return;
    }

    const accountType = isPlanner ? 'planner' : 'couple';
    const identity = user ? `${user.uid}:${accountType}` : null;
    if (user && identity && identifiedUid.current !== identity) {
      identifyUser(user.uid, accountType);
      identifiedUid.current = identity;
    }

    if (before === 'unverified') track('email_verified', {});
  }, [status, user, isAdmin, isPlanner]);

  return null;
}
