'use client';

import React, { useState } from 'react';
import { displayFont, manrope } from '../ui';

// Spec 29 — confirma el borrado de una foto del álbum (nunca con confirm()).
export default function DeletePhotoModal({
  thumbUrl,
  caption,
  onConfirm,
  onClose,
}: {
  thumbUrl: string;
  caption: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleConfirm = async () => {
    setFailed(false);
    try {
      setIsDeleting(true);
      await onConfirm();
    } catch {
      setFailed(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>

        <div role="dialog" aria-modal="true" aria-labelledby="delete-photo-title" className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
          <div className="flex gap-4 items-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbUrl} alt="" className="w-[72px] h-[72px] rounded-[10px] object-cover flex-shrink-0 bg-[#F4F4F5]" />
            <div className="flex flex-col gap-1.5 min-w-0">
              <h3 id="delete-photo-title" className="text-[18px] text-[#0A0A0A] m-0" style={displayFont}>
                ¿Borrar esta foto?
              </h3>
              <p className="text-[14px] text-[#3F3F46] m-0 leading-snug">Se eliminará del álbum y de la descarga. No se puede deshacer.</p>
              <span className="text-xs font-semibold text-[#71717A] truncate">{caption}</span>
            </div>
          </div>
          <p className="text-[13px] text-[#52525B] m-0">Si solo no quieres que la vean los invitados, mejor ocúltala.</p>
          {failed && (
            <p role="alert" className="text-[13px] font-semibold text-[#B91C1C] m-0">
              No pudimos borrar la foto. Inténtalo de nuevo.
            </p>
          )}
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] font-semibold text-[13px] rounded-lg px-5 min-h-[44px]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-[#B91C1C] text-white font-semibold text-[13px] rounded-lg px-5 min-h-[44px] disabled:opacity-50"
            >
              {isDeleting ? 'Borrando…' : 'Borrar foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
