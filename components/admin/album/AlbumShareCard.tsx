'use client';

import React, { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { AdminToggle } from '../ui';
import { track } from '../../../lib/analytics/client';
import type { AlbumMode, AlbumPhase } from '../../../lib/album';

// Spec 29 — "Compartir álbum": el enlace general del álbum (/[idioma]/wedding/[id]/fotos, sin ?guest=)
// para copiarlo o abrirlo, y el interruptor para cerrar la subida de fotos de los invitados. Con la
// subida cerrada, ese enlace sirve para que la familia vea el álbum completo sin poder subir.
export default function AlbumShareCard({
  url,
  openHref,
  phase,
  mode,
  uploadsClosed,
  windowEnded,
  closesLabel,
  onToggleUploads,
}: {
  url: string;
  openHref: string; // ruta relativa: en localhost o en un preview abre ese mismo servidor
  phase: AlbumPhase;
  mode: AlbumMode;
  uploadsClosed: boolean;
  windowEnded: boolean;
  closesLabel: string;
  onToggleUploads: (closed: boolean) => Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Navegadores sin permiso de portapapeles: se selecciona el texto para copiarlo a mano.
      const input = document.getElementById('album-share-url') as HTMLInputElement | null;
      input?.select();
      return;
    }
    setCopied(true);
    track('album_link_copied', {});
    setTimeout(() => setCopied(false), 2000);
  };

  const receiving = !uploadsClosed && !windowEnded;
  const toggle = async (next: boolean) => {
    setSaving(true);
    setError(null);
    try {
      await onToggleUploads(!next);
      track('album_uploads_toggled', { closed: !next });
    } catch {
      setError('No pudimos guardar el cambio. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  let status: string;
  if (windowEnded) status = `La subida cerró el ${closesLabel}. El álbum solo se puede ver.`;
  else if (uploadsClosed) status = `Cerrada: el álbum solo se puede ver. Puedes volver a abrirla hasta el ${closesLabel}.`;
  else if (phase === 'before') status = `Se abre el día de la boda y dura hasta el ${closesLabel}.`;
  else status = `Abierta hasta el ${closesLabel}: tus invitados pueden subir fotos.`;

  return (
    <section className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#71717A]">Compartir álbum</span>
        <span className="text-[13px] font-medium text-[#3F3F46] leading-normal">
          Comparte este enlace con tu familia para que vean el álbum. {receiving ? 'Mientras la subida esté abierta, también podrán subir fotos.' : 'Con la subida cerrada, solo pueden verlo.'}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <label htmlFor="album-share-url" className="sr-only">
          Enlace del álbum
        </label>
        <input
          id="album-share-url"
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          className="flex-1 min-w-0 h-11 px-3.5 rounded-lg border border-[rgba(0,0,0,0.14)] bg-[#FAFAFA] text-[13px] font-medium text-[#3F3F46] truncate focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)]"
        />
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={copy}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg bg-[#AE5730] hover:bg-[#8F4524] text-white text-sm font-semibold transition-colors"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar enlace'}
          </button>
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border border-[rgba(0,0,0,0.14)] bg-white hover:bg-[#FAFAFA] text-[#0A0A0A] text-sm font-semibold no-underline"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir álbum
          </a>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4 border-t border-[rgba(0,0,0,0.06)] pt-4">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-sm font-semibold text-[#0A0A0A]">Recibir fotos de los invitados</span>
          <span className={`text-[12.5px] font-semibold leading-snug ${receiving ? 'text-[#15803D]' : 'text-[#71717A]'}`}>{status}</span>
          {!windowEnded && !uploadsClosed && mode === 'disposable' && (
            <span className="text-[12.5px] font-medium text-[#71717A] leading-snug">Al cerrarla, el álbum completo se revela para todos.</span>
          )}
          {error && (
            <span role="alert" className="text-[12.5px] font-semibold text-[#B91C1C]">
              {error}
            </span>
          )}
        </div>
        {windowEnded ? (
          <span className="text-xs font-semibold text-[#71717A] flex-shrink-0 pt-0.5">Cerrada</span>
        ) : (
          <div className={saving ? 'opacity-50 pointer-events-none' : ''}>
            <AdminToggle checked={!uploadsClosed} onChange={(v) => void toggle(v)} ariaLabel="Recibir fotos de los invitados" />
          </div>
        )}
      </div>
    </section>
  );
}
