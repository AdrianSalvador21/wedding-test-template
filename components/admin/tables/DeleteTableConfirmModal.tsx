'use client';

import React, { useState } from 'react';
import { FirebaseTable } from '../../../src/types/wedding';
import { displayFont, manrope } from '../../admin/ui';

export default function DeleteTableConfirmModal({
  table,
  affectedPersonCount,
  onConfirm,
  onClose,
}: {
  table: FirebaseTable;
  affectedPersonCount: number;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>

        <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
          <h3 className="text-[19px] text-[#0A0A0A] mb-2" style={displayFont}>
            ¿Eliminar &ldquo;{table.name}&rdquo;?
          </h3>
          <p className="text-[14px] text-[#3F3F46] mb-6">
            {affectedPersonCount > 0
              ? `${affectedPersonCount} ${affectedPersonCount === 1 ? 'persona volverá' : 'personas volverán'} a "Sin mesa". Esta acción no se puede deshacer.`
              : 'Esta mesa no tiene personas asignadas. Esta acción no se puede deshacer.'}
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] font-bold text-[13px] rounded-lg px-5 py-2.5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-[#B91C1C] text-white font-bold text-[13px] rounded-lg px-5 py-2.5 disabled:opacity-50"
            >
              Eliminar mesa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
