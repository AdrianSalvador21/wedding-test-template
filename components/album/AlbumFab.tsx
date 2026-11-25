'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from '../../lib/translations';
import { albumPhase } from '../../lib/album';
import type { WeddingData } from '../../src/types/wedding';
import { getAlbumTheme } from './albumThemes';

// Spec 29 — botón flotante "Comparte tus fotos" de los templates 01, 03 y 04 (el 02 lo lleva en
// StickyConfirmBarV2). Solo existe con el álbum activado y en la fase 'open' o 'closed'; sin eso,
// la invitación queda exactamente como antes. Va abajo a la izquierda porque la música está a la derecha.
export function albumHref(weddingId: string, language: string, guestId?: string | null): string {
  const prefix = language === 'en' ? '/en' : '/es';
  const qs = guestId ? `?guest=${encodeURIComponent(guestId)}` : '';
  return `${prefix}/wedding/${encodeURIComponent(weddingId)}/fotos${qs}`;
}

export default function AlbumFab({ wedding, guestId }: { wedding: WeddingData; guestId?: string | null }) {
  const { t, currentLanguage } = useTranslations('album');
  // La fase depende de la hora: se calcula en el cliente para no desfasar el HTML del servidor.
  const [phase, setPhase] = useState<ReturnType<typeof albumPhase> | null>(null);
  useEffect(() => {
    setPhase(albumPhase(wedding));
  }, [wedding]);

  const templateId = wedding.template?.id || 'template-01';
  if (templateId === 'template-02') return null;
  if (phase !== 'open' && phase !== 'closed') return null;

  const theme = getAlbumTheme(templateId);
  return (
    <a
      href={albumHref(wedding.id, currentLanguage, guestId)}
      style={{
        position: 'fixed',
        left: 16,
        bottom: 16,
        zIndex: 40,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        ...theme.fab,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14.5 4h-5L7.5 6.5H4a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7.5a1 1 0 0 0-1-1h-3.5z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
      {phase === 'open' ? t('shareCta') : t('viewAlbumCta')}
    </a>
  );
}
