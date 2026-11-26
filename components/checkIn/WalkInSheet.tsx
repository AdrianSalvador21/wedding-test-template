'use client';

import { useState } from 'react';
import { Check, Info, X } from 'lucide-react';
import type { CheckInSnapshot } from '../../src/types/wedding';
import { CHECKIN_MAX_PEOPLE } from '../../lib/checkIn';
import TablePicker from './TablePicker';
import { BTN_PRIMARY, BTN_SECONDARY, Modal, tableNamesOf } from './ui';

// Spec 33 — agregar a alguien que llegó sin invitación: nombre, personas (1–10) y mesa. Entra
// confirmado, con todas sus personas como llegadas y la etiqueta "Agregado en la entrada".

export default function WalkInSheet({
  view,
  onAdd,
  onClose,
}: {
  view: CheckInSnapshot;
  onAdd: (data: { name: string; count: number; tableId: string | null }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [count, setCount] = useState(1);
  const [tableId, setTableId] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const names = tableNamesOf(view);
  const valid = name.trim().length > 1;

  return (
    <Modal onClose={onClose} label="Agregar invitado">
      <div className="flex flex-col gap-[18px]">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-1">
            <h2 className="m-0 text-[22px] font-semibold text-[#0A0A0A]">Agregar invitado</h2>
            <span className="text-sm text-[#3F3F46]">Para alguien que llegó y no está en la lista.</span>
          </div>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#F4F4F5]">
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="grid gap-3.5 md:grid-cols-[minmax(0,1fr)_190px]">
          <div className="flex flex-col gap-2">
            <label htmlFor="walkin-name" className="text-sm font-semibold text-[#27272A]">
              Nombre
            </label>
            <input
              id="walkin-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 120))}
              placeholder="Nombre y apellido"
              className="h-[52px] rounded-xl border-[1.5px] border-[#111111] bg-white px-4 text-base outline-none"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#27272A]">Personas</span>
            <div className="flex h-[52px] items-center justify-between rounded-xl border border-[rgba(0,0,0,0.14)] px-1">
              <button type="button" aria-label="Quitar una persona" disabled={count <= 1} onClick={() => setCount((c) => Math.max(1, c - 1))} className="h-11 w-11 rounded-[10px] bg-[#F4F4F5] text-xl disabled:opacity-40">
                −
              </button>
              <span className="text-xl font-semibold">{count}</span>
              <button type="button" aria-label="Agregar una persona" disabled={count >= CHECKIN_MAX_PEOPLE} onClick={() => setCount((c) => Math.min(CHECKIN_MAX_PEOPLE, c + 1))} className="h-11 w-11 rounded-[10px] bg-[#F4F4F5] text-xl disabled:opacity-40">
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-[#27272A]">Mesa</span>
          {choosing ? (
            <>
              <TablePicker
                view={view}
                extraPeople={count}
                confirmLabel="Sentarlos"
                onPick={(id) => {
                  setTableId(id);
                  setChoosing(false);
                }}
              />
              <button type="button" onClick={() => { setTableId(null); setChoosing(false); }} className="h-10 self-start text-[13px] font-semibold text-[#3F3F46]">
                Dejar sin mesa
              </button>
            </>
          ) : (
            <button type="button" onClick={() => setChoosing(true)} className="flex h-[52px] items-center justify-between rounded-xl border border-[rgba(0,0,0,0.14)] bg-white px-4 text-left text-[15px]">
              <span className={tableId ? 'font-semibold text-[#0A0A0A]' : 'text-[#71717A]'}>{tableId ? names.get(tableId) : 'Sin mesa'}</span>
              <span className="text-[13px] font-semibold text-[#AE5730]">{tableId ? 'Cambiar' : 'Elegir mesa'}</span>
            </button>
          )}
        </div>

        <div className="flex items-start gap-2.5 rounded-[10px] bg-[#EFF6FF] px-3.5 py-3 text-[13px] leading-relaxed text-[#1E3A8A]">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1D4ED8]" />
          <span>
            Entra confirmado y con {count === 1 ? 'su persona marcada como llegada' : `sus ${count} personas marcadas como llegadas`}. Aparecerá en Invitados y en Mesas con la etiqueta “Agregado en la entrada”.
          </span>
        </div>

        <div className="flex flex-col-reverse gap-2.5 md:flex-row md:justify-end">
          <button type="button" onClick={onClose} className={`${BTN_SECONDARY} h-[50px]`}>
            Cancelar
          </button>
          <button type="button" disabled={!valid} onClick={() => onAdd({ name: name.trim(), count, tableId })} className={`${BTN_PRIMARY} h-[52px]`}>
            <Check className="h-[18px] w-[18px]" />
            Agregar y marcar llegada
          </button>
        </div>
      </div>
    </Modal>
  );
}
