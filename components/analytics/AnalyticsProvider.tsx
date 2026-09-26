'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  applyNotrackParam,
  capturePageview,
  initAnalytics,
  registerProps,
  resolveSrc,
  setCaptureEnabled,
  setRecording,
  track,
} from '../../lib/analytics/client';
import { installClickTracking } from '../../lib/analytics/click-tracking';
import { demoIdFromPath, resolveScope } from '../../lib/analytics/scope';
import { observeSections } from '../../lib/analytics/section-tracking';

// Punto único de entrada de la analítica (spec 11). No renderiza nada.
// En cada cambio de ruta decide si se mide (`resolveScope`), y si es así inicia PostHog,
// captura `$pageview` y activa la grabación solo en marketing y demos. En rutas fuera de
// alcance (invitaciones reales, /api, etc.) detiene la captura y la grabación.
export default function AnalyticsProvider() {
  const pathname = usePathname();

  // Clics de WhatsApp, demos y salida de las demos al sitio (una sola vez por carga).
  useEffect(() => installClickTracking(), []);

  useEffect(() => {
    applyNotrackParam();

    const scope = resolveScope(pathname);
    if (!scope) {
      setCaptureEnabled(false);
      return;
    }

    setCaptureEnabled(true);
    const src = resolveSrc();
    void initAnalytics();
    registerProps({ src });
    setRecording(scope === 'marketing' || scope === 'demo');
    capturePageview();

    const demoId = demoIdFromPath(pathname);
    if (demoId) track('demo_opened', { demo_id: demoId });

    // Qué secciones llega a ver la persona (landing y páginas de marketing).
    if (scope === 'marketing') return observeSections(pathname);
  }, [pathname]);

  return null;
}
