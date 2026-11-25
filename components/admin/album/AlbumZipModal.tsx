'use client';

import React, { useEffect, useRef, useState } from 'react';
import { displayFont, manrope } from '../ui';
import { track } from '../../../lib/analytics/client';

// Spec 29 — descarga de las fotos visibles en ZIP, armado en el navegador con client-zip, en
// archivos de máximo 200 fotos (fotos-{weddingId}-1.zip, -2.zip…). Así no depende del límite de
// tiempo de las funciones del servidor ni carga todo el álbum en memoria a la vez.

const PART_SIZE = 200;

export interface ZipPhoto {
  id: string;
  uploaderName: string | null;
  createdAt: string;
}

const slug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'invitado';

export default function AlbumZipModal({
  weddingId,
  photos,
  fetchPhoto,
  onClose,
}: {
  weddingId: string;
  photos: ZipPhoto[];
  fetchPhoto: (id: string, signal: AbortSignal) => Promise<Response>;
  onClose: () => void;
}) {
  const parts = Math.max(1, Math.ceil(photos.length / PART_SIZE));
  const [part, setPart] = useState(1);
  const [doneInPart, setDoneInPart] = useState(0);
  const [status, setStatus] = useState<'working' | 'done' | 'error'>('working');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    (async () => {
      try {
        const { downloadZip } = await import('client-zip');
        for (let p = 0; p < parts; p++) {
          if (controller.signal.aborted) return;
          setPart(p + 1);
          setDoneInPart(0);
          const slice = photos.slice(p * PART_SIZE, (p + 1) * PART_SIZE);
          const files = async function* () {
            for (let i = 0; i < slice.length; i++) {
              const photo = slice[i];
              const res = await fetchPhoto(photo.id, controller.signal);
              if (!res.ok) throw new Error('photo');
              const n = String(p * PART_SIZE + i + 1).padStart(3, '0');
              yield { name: `${n}-${slug(photo.uploaderName || 'invitado')}.jpg`, lastModified: new Date(photo.createdAt), input: res };
              setDoneInPart(i + 1);
            }
          };
          const blob = await downloadZip(files()).blob();
          if (controller.signal.aborted) return;
          const href = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = href;
          a.download = `fotos-${weddingId}-${p + 1}.zip`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(href), 5000);
        }
        track('album_zip_downloaded', { photos: photos.length });
        setStatus('done');
      } catch {
        if (!controller.signal.aborted) setStatus('error');
      }
    })();
    return () => controller.abort();
  }, [weddingId, photos, parts, fetchPhoto]);

  const partTotal = Math.min(PART_SIZE, photos.length - (part - 1) * PART_SIZE);
  const pct = partTotal > 0 ? Math.round((doneInPart / partTotal) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]" />
        <div role="dialog" aria-modal="true" aria-labelledby="zip-title" className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h3 id="zip-title" className="text-[18px] text-[#0A0A0A] m-0" style={displayFont}>
              {status === 'done' ? 'Descarga lista' : status === 'error' ? 'No pudimos terminar la descarga' : 'Preparando tu descarga'}
            </h3>
            <p className="text-[14px] text-[#3F3F46] m-0">
              {photos.length} fotos visibles, en {parts} {parts === 1 ? 'archivo ZIP' : 'archivos ZIP'}. Las ocultas no se incluyen.
            </p>
          </div>
          {status === 'working' && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[13px]">
                <span className="font-semibold truncate">fotos-{weddingId}-{part}.zip</span>
                <span className="text-[#52525B] flex-shrink-0">
                  {doneInPart} de {partTotal}
                </span>
              </div>
              <div role="progressbar" aria-valuemin={0} aria-valuemax={partTotal} aria-valuenow={doneInPart} aria-label="Progreso del ZIP" className="h-2 rounded-full bg-[#F4F4F5] overflow-hidden">
                <div className="h-full bg-[#AE5730] transition-[width]" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          {status === 'error' && <p role="alert" className="text-[13px] font-semibold text-[#B91C1C] m-0">Revisa tu conexión e inténtalo de nuevo.</p>}
          {status === 'working' && (
            <p className="text-[13px] text-[#52525B] m-0 leading-snug">Mantén esta pestaña abierta. Con más de 200 fotos se descargan varios archivos, uno tras otro.</p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                abortRef.current?.abort();
                onClose();
              }}
              className="bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] font-semibold text-[13px] rounded-lg px-5 min-h-[44px]"
            >
              {status === 'working' ? 'Cancelar' : 'Cerrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
