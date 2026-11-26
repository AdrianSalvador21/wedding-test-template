'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  applyNotrackParam,
  capturePageview,
  registerProps,
  resolveSrc,
  setAdPersonalization,
  setCaptureEnabled,
  setInvitationContext,
  track,
} from '../../lib/analytics/client';
import { installClickTracking } from '../../lib/analytics/click-tracking';
import { applyGaDebugParam } from '../../lib/analytics/env';
import { setPerfScope } from '../../lib/analytics/perf';
import { demoIdFromPath, resolveScope } from '../../lib/analytics/scope';
import { observeSections } from '../../lib/analytics/section-tracking';

// Punto único de entrada de la analítica (specs 11 y 31). No renderiza nada.
// En cada cambio de ruta decide si se mide (`resolveScope`). Si es así, manda `page_view` saneado
// a GA4 y fija la personalización de anuncios (solo marketing y demos). También enciende las trazas
// automáticas de Performance solo en marketing y demos. Fuera de alcance (/api, rutas
// desconocidas) detiene la captura.
export default function AnalyticsProvider() {
  const pathname = usePathname();

  // Clics de WhatsApp, demos, salida de las demos al sitio e interacciones de las invitaciones.
  useEffect(() => installClickTracking(), []);

  useEffect(() => {
    applyNotrackParam();
    applyGaDebugParam();

    const scope = resolveScope(pathname);
    setPerfScope(scope);
    if (scope !== 'invitation' && scope !== 'demo') setInvitationContext(null);

    if (!scope) {
      setCaptureEnabled(false);
      return;
    }

    setCaptureEnabled(true);
    registerProps({ src: resolveSrc() });
    setAdPersonalization(scope === 'marketing' || scope === 'demo');
    capturePageview(pathname, scope);

    const demoId = demoIdFromPath(pathname);
    if (demoId) track('demo_opened', { demo_id: demoId });

    // Qué secciones llega a ver la persona (sitio, demos e invitaciones).
    if (scope !== 'admin') return observeSections(pathname);
  }, [pathname]);

  return null;
}
