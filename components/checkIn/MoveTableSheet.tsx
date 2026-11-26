'use client';

import { X } from 'lucide-react';
import type { CheckInSnapshot, CheckInSnapshotGuest } from '../../src/types/wedding';
import { personLabel } from '../../lib/checkIn';
import TablePicker from './TablePicker';
import { Modal, tableNamesOf } from './ui';

// Spec 33 — cambiar a una persona de mesa desde la entrada. Se guarda en `tableSeats`, así que se
// ve en Mesas. Mesa llena: se permite tras confirmar.

export default function MoveTableSheet({
  view,
  guest,
  seatIndex,
  onMove,
  onClose,
}: {
  view: CheckInSnapshot;
  guest: CheckInSnapshotGuest;
  seatIndex: number;
  onMove: (tableId: string | null) => void;
  onClose: () => void;
}) {
  const names = tableNamesOf(view);
  const current = guest.seats[seatIndex] ?? null;
  // Sugerencia: la mesa donde ya está el resto de su invitación.
  const suggested = guest.seats.find((id, i) => i !== seatIndex && id && id !== current) ?? null;

  return (
    <Modal onClose={onClose} label="Cambiar mesa">
      <div className="flex flex-col gap-3">
        <div className="mx-auto h-1 w-10 rounded-full bg-[#D4D4D8] md:hidden" />
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-xl font-semibold text-[#0A0A0A]">Mover a {personLabel(guest, seatIndex)}</h2>
            <span className="text-[13px] text-[#71717A]">
              {seatIndex > 0 ? `Invitación de ${guest.name} · ` : ''}ahora: {current ? names.get(current) || 'otra mesa' : 'sin mesa'}
            </span>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#F4F4F5]">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
        <TablePicker view={view} currentTableId={current} suggestedTableId={suggested} confirmLabel="Moverla" onPick={(id) => onMove(id)} />
        {current && (
          <button type="button" onClick={() => onMove(null)} className="h-11 text-sm font-semibold text-[#3F3F46]">
            Dejar sin mesa
          </button>
        )}
      </div>
    </Modal>
  );
}
