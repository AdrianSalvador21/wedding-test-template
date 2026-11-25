'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download, Eye, EyeOff, Trash2, X } from 'lucide-react';
import { manrope } from '../ui';

// Spec 29 — visor a pantalla completa de la sección "Fotos" del panel: los novios recorren las
// fotos una por una (flechas, teclado o deslizando en celular) y pueden ocultarlas o borrarlas ahí.

export interface ViewerPhoto {
  id: string;
  url: string;
  uploaderName: string | null;
  hidden: boolean;
  createdAt: string;
}

const SWIPE_PX = 50;

export default function PanelPhotoViewer({
  photos,
  index,
  busy,
  when,
  onMove,
  onClose,
  onToggleHidden,
  onDelete,
  onDownload,
}: {
  photos: ViewerPhoto[];
  index: number;
  busy: boolean;
  when: (iso: string) => string;
  onMove: (index: number) => void;
  onClose: () => void;
  onToggleHidden: (photo: ViewerPhoto) => void;
  onDelete: (photo: ViewerPhoto) => void;
  onDownload: (photo: ViewerPhoto) => void;
}) {
  const photo = photos[index];
  const touchX = useRef<number | null>(null);
  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onMove(index - 1);
      if (e.key === 'ArrowRight' && hasNext) onMove(index + 1);
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, hasPrev, hasNext, onMove, onClose]);

  // Precarga la foto siguiente y la anterior para que el cambio sea inmediato.
  useEffect(() => {
    [photos[index + 1], photos[index - 1]].forEach((p) => {
      if (p) {
        const img = new window.Image();
        img.src = p.url;
      }
    });
  }, [index, photos]);

  if (!photo) return null;
  const name = photo.uploaderName || 'Invitado';
  const navBtn =
    'absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[rgba(20,17,16,0.55)] hover:bg-[rgba(20,17,16,0.8)] text-white flex items-center justify-center transition-colors';

  return (
    <div role="dialog" aria-modal="true" aria-label={`Foto de ${name}`} className="fixed inset-0 z-[60] bg-[#141110] text-white flex flex-col" style={manrope}>
      <div className="flex items-center justify-between pl-5 pr-3 pt-4 pb-2">
        <span className="text-[13px] font-medium text-[#CFC7BE]">
          {index + 1} de {photos.length}
        </span>
        <button type="button" onClick={onClose} aria-label="Cerrar" className="w-11 h-11 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)]">
          <X className="h-[22px] w-[22px]" />
        </button>
      </div>

      <div
        className="relative flex-1 min-h-0 flex items-center justify-center px-2 sm:px-16"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (dx > SWIPE_PX && hasPrev) onMove(index - 1);
          if (dx < -SWIPE_PX && hasNext) onMove(index + 1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={photo.id} src={photo.url} alt={`Foto de ${name}`} className="max-w-full max-h-full object-contain select-none" style={{ opacity: photo.hidden ? 0.5 : 1 }} draggable={false} />
        {photo.hidden && <span className="absolute left-1/2 -translate-x-1/2 top-3 text-xs font-semibold text-[#3F3F46] bg-[#F4F4F5] px-3 py-1 rounded-full">Oculta para los invitados</span>}
        {hasPrev && (
          <button type="button" aria-label="Foto anterior" onClick={() => onMove(index - 1)} className={`${navBtn} left-2 sm:left-4`}>
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        {hasNext && (
          <button type="button" aria-label="Foto siguiente" onClick={() => onMove(index + 1)} className={`${navBtn} right-2 sm:right-4`}>
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="px-5 pt-4 pb-7 sm:pb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-[15px] font-semibold truncate">{name}</span>
          <span className="text-[13px] font-medium text-[#CFC7BE]">{when(photo.createdAt)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onDownload(photo)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-[rgba(255,255,255,0.22)] text-sm font-semibold hover:bg-[rgba(255,255,255,0.08)]"
          >
            <Download className="h-4 w-4" />
            Descargar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onToggleHidden(photo)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-[rgba(255,255,255,0.22)] text-sm font-semibold hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-50"
          >
            {photo.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {photo.hidden ? 'Mostrar' : 'Ocultar'}
          </button>
          <button
            type="button"
            onClick={() => onDelete(photo)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-lg border border-[rgba(248,113,113,0.4)] text-[#FCA5A5] text-sm font-semibold hover:bg-[rgba(248,113,113,0.1)]"
          >
            <Trash2 className="h-4 w-4" />
            Borrar
          </button>
        </div>
      </div>
    </div>
  );
}
