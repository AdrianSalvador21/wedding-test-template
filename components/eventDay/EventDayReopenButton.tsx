'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useTranslations } from '../../lib/translations';
import { albumPhase } from '../../lib/album';
import type { WeddingData } from '../../src/types/wedding';
import { useEventDayReopen } from './EventDayContext';

// Spec 32 — botón flotante "Mi mesa" que vuelve a abrir el pase en los templates 01, 03 y 04
// (Moderno lo lleva dentro de StickyConfirmBarV2). Va abajo a la izquierda, encima de AlbumFab
// cuando ese botón existe, para no tapar la música de la derecha.

export const TableIcon = ({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.6} aria-hidden="true">
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="3.5" r="1.6" />
    <circle cx="12" cy="20.5" r="1.6" />
    <circle cx="3.5" cy="12" r="1.6" />
    <circle cx="20.5" cy="12" r="1.6" />
  </svg>
);

// Alto de AlbumFab por template (albumThemes.ts → fab.height) para apilarse encima con 10 px de aire.
const FAB_HEIGHT: Record<string, number> = { 'template-01': 52, 'template-03': 52, 'template-04': 48 };

const STYLES: Record<string, CSSProperties> = {
  'template-01': { height: 52, padding: '0 20px', background: '#faf8f5', color: '#8B5E34', border: '1.5px solid #8B5E34', borderRadius: 0, fontFamily: "'Lora', serif", fontSize: 11.5, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', boxShadow: '0 8px 22px rgba(0,0,0,0.18)' },
  'template-03': { height: 52, padding: '0 24px', background: '#FAF6EF', color: '#A4572F', border: '1px solid #A4572F', borderRadius: 999, fontFamily: "'Jost', sans-serif", fontSize: 13, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', boxShadow: '0 8px 22px rgba(164,87,47,0.18)' },
  'template-04': { height: 48, padding: '0 18px', background: '#2E3323', color: '#F4EFE3', border: '1px solid #B7AD90', borderRadius: 0, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: '0 8px 22px rgba(20,22,14,0.35)' },
};

export default function EventDayReopenButton({ wedding }: { wedding: WeddingData }) {
  const reopen = useEventDayReopen();
  const { t } = useTranslations('eventDay');
  const [albumVisible, setAlbumVisible] = useState(false);
  useEffect(() => {
    const phase = albumPhase(wedding);
    setAlbumVisible(phase === 'open' || phase === 'closed');
  }, [wedding]);

  const templateId = wedding.template?.id || 'template-01';
  if (!reopen || templateId === 'template-02') return null;
  const style = STYLES[templateId] || STYLES['template-01'];
  const bottom = albumVisible ? 16 + (FAB_HEIGHT[templateId] || 52) + 10 : 16;

  return (
    <button
      type="button"
      data-track-action="event_day_reopen"
      onClick={reopen.reopen}
      style={{ position: 'fixed', left: 16, bottom, zIndex: 40, display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', ...style }}
    >
      <TableIcon size={templateId === 'template-04' ? 17 : 18} />
      {t('reopen')}
    </button>
  );
}
