'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

// Spec 27 — `?preview=full` (antes `?vista=completa`) solo muestra la invitación completa (con el save the date activo) a
// quien tenga sesión de Firebase y sea admin o dueño de la boda. El sitio público no tiene
// AuthProvider, así que se resuelve aquí con el mismo endpoint que usa el panel, que no escribe nada.
// Solo trabaja cuando `enabled` es true: el resto de las visitas no tocan Auth ni la red.
export function useCanPreviewFull(weddingId: string | undefined, enabled: boolean): { allowed: boolean; checking: boolean } {
  // Para qué boda ya se resolvió y con qué resultado. `checking` se deriva de aquí para no pintar
  // ni un instante el save the date antes de saber si quien abre el link puede ver la vista previa.
  const [resolved, setResolved] = useState<{ weddingId: string; allowed: boolean } | null>(null);

  useEffect(() => {
    if (!enabled || !weddingId) return;
    let cancelled = false;
    // Solo interesa el primer estado de sesión (ya restaurado desde el navegador).
    let unsubscribe: () => void = () => {};
    unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      let allowed = false;
      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch('/api/auth/link-weddings', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
          const data = res.ok ? await res.json() : {};
          const weddings: { id?: string }[] = Array.isArray(data.weddings) ? data.weddings : [];
          allowed = data.isAdmin === true || weddings.some((w) => w.id === weddingId);
        } catch {
          allowed = false;
        }
      }
      if (!cancelled) setResolved({ weddingId, allowed });
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [weddingId, enabled]);

  if (!enabled || !weddingId) return { allowed: false, checking: false };
  if (resolved?.weddingId !== weddingId) return { allowed: false, checking: true };
  return { allowed: resolved.allowed, checking: false };
}
