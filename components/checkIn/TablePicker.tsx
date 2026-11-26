'use client';

import { useMemo, useState } from 'react';
import { Search, TriangleAlert } from 'lucide-react';
import type { CheckInSnapshot } from '../../src/types/wedding';
import { normalizeSearch, tableOccupancy } from '../../lib/checkIn';
import { BTN_SECONDARY, BTN_WARN, Badge } from './ui';

// Spec 33 — elegir mesa desde la entrada (cambiar mesa o agregar invitado). Muestra la ocupación;
// una mesa llena se permite con confirmación ("La Mesa 3 ya está llena…").

export default function TablePicker({
  view,
  currentTableId,
  suggestedTableId,
  extraPeople = 1,
  confirmLabel,
  onPick,
}: {
  view: CheckInSnapshot;
  currentTableId?: string | null;
  suggestedTableId?: string | null;
  extraPeople?: number; // personas que se van a sentar (1 al mover, N al agregar)
  confirmLabel: string;
  onPick: (tableId: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [full, setFull] = useState<{ id: string; name: string; occ: number; cap: number } | null>(null);
  const occupancy = useMemo(() => tableOccupancy(view), [view]);

  const tables = useMemo(() => {
    const q = normalizeSearch(query);
    return view.tables
      .filter((t) => t.id !== currentTableId && (!q || normalizeSearch(t.name).includes(q)))
      .sort((a, b) => (a.id === suggestedTableId ? -1 : b.id === suggestedTableId ? 1 : a.name.localeCompare(b.name, 'es', { numeric: true })));
  }, [view.tables, query, currentTableId, suggestedTableId]);

  const pick = (id: string, name: string, occ: number, cap: number) => {
    if (cap > 0 && occ + extraPeople > cap) setFull({ id, name, occ, cap });
    else onPick(id);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <label className="flex h-[46px] items-center gap-2.5 rounded-xl border border-[rgba(0,0,0,0.14)] bg-white px-3.5">
        <Search className="h-[17px] w-[17px] text-[#71717A]" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar mesa" aria-label="Buscar mesa" className="min-w-0 flex-1 bg-transparent text-[15px] outline-none" />
      </label>
      <div className="flex max-h-[42vh] flex-col gap-2 overflow-y-auto md:grid md:max-h-[300px] md:grid-cols-2">
        {tables.map((t) => {
          const occ = occupancy.get(t.id) || 0;
          const cap = t.capacity || 0;
          const free = cap - occ;
          const isFull = cap > 0 && occ + extraPeople > cap;
          const selected = full?.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={selected}
              onClick={() => pick(t.id, t.name, occ, cap)}
              className={`flex min-h-[60px] items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-left ${
                selected ? 'border-2 border-[#B45309] bg-[#FFFBEB]' : isFull ? 'border border-[#FDE68A] bg-[#FFFBEB]' : 'border border-[rgba(0,0,0,0.1)] bg-white'
              }`}
            >
              <span className="flex flex-col gap-0.5">
                <span className={`text-[15px] font-semibold ${isFull ? 'text-[#78350F]' : 'text-[#0A0A0A]'}`}>{t.name}</span>
                <span className={`text-[13px] ${isFull ? 'text-[#78350F]' : 'text-[#71717A]'}`}>
                  {occ} de {cap}
                  {cap > 0 && !isFull ? ` · ${free} ${free === 1 ? 'lugar libre' : 'lugares libres'}` : ''}
                </span>
              </span>
              {t.id === suggestedTableId ? <Badge tone="acc">Con su invitación</Badge> : isFull ? <Badge tone="warn">Llena</Badge> : null}
            </button>
          );
        })}
        {tables.length === 0 && <p className="py-2 text-[13px] text-[#71717A]">No hay mesas{query ? ' con ese nombre' : ''}.</p>}
      </div>
      {full && (
        <div role="alert" className="flex flex-col gap-2.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3.5">
          <span className="flex items-start gap-2 text-sm font-semibold text-[#78350F]">
            <TriangleAlert className="mt-px h-[18px] w-[18px] flex-shrink-0 text-[#B45309]" />
            La {full.name} ya está llena ({full.occ} de {full.cap}). ¿{confirmLabel} de todos modos?
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setFull(null)} className={`${BTN_SECONDARY} h-[46px] text-sm`}>
              Cancelar
            </button>
            <button type="button" onClick={() => onPick(full.id)} className={`${BTN_WARN} h-[46px]`}>
              {confirmLabel} de todos modos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
