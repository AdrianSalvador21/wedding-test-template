'use client';

import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { FirebaseTable } from '../../../src/types/wedding';
import { getOccupancyState, getSeatDots, occupancyColor, occupancyLabel } from './occupancy';

// Insignia pequeña con la silueta de la mesa (spec 13) — misma familia de formas que
// ShapePreview de TableFormModal, pero a tamaño de ícono, solo para reconocer de un
// vistazo la forma elegida sin ocupar el espacio de la fracción de ocupación.
function ShapeBadge({ shape }: { shape: NonNullable<FirebaseTable['shape']> }) {
  const common = 'flex-shrink-0 border-[1.6px] border-[#9CA3AF]';
  if (shape === 'square') return <span className={`${common} w-[18px] h-[18px] rounded-[4px]`} />;
  if (shape === 'rectangular') return <span className={`${common} w-[22px] h-4 rounded-[4px]`} />;
  if (shape === 'imperial') return <span className={`${common} w-6 h-3 rounded-full`} />;
  return <span className={`${common} w-5 h-5 rounded-full`} />; // round (default)
}

export default function TableTile({
  table,
  occupied,
  selected,
  onOpen,
  onEdit,
  onDelete,
}: {
  table: FirebaseTable;
  occupied: number;
  selected?: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const state = getOccupancyState(occupied, table.capacity);
  const colors = occupancyColor[state];
  const { dots, overflowLabel } = getSeatDots(occupied, table.capacity);
  const dotColor = state === 'full' || state === 'over' ? colors.bar : '#27272A';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      className="w-[220px] min-h-[164px] rounded-2xl bg-white px-5 py-5 flex flex-col justify-between gap-3.5 cursor-pointer transition-shadow hover:shadow-md text-left"
      style={{
        border: `${selected ? 2 : state === 'empty' ? 1.5 : 1.5}px ${state === 'empty' ? 'dashed' : 'solid'} ${
          selected ? '#111111' : state === 'over' ? colors.border : 'rgba(0,0,0,0.06)'
        }`,
        background: state === 'over' ? colors.bg : '#FFFFFF',
        boxShadow: selected ? '0 0 0 3px rgba(17,17,17,0.08)' : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[15.5px] font-extrabold text-[#0A0A0A] truncate leading-snug">{table.name}</span>
        <ShapeBadge shape={table.shape || 'round'} />
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {dots.map((dot, i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={
              dot === 'filled'
                ? { background: dotColor }
                : { border: '1.3px solid #D4D4D8' }
            }
          />
        ))}
        {overflowLabel && (
          <span className="text-[10.5px] font-extrabold ml-0.5" style={{ color: colors.text }}>
            {overflowLabel}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span
          className="text-[11.5px] font-extrabold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
          style={{ background: state === 'over' ? 'rgba(185,28,28,0.1)' : state === 'full' ? 'rgba(21,128,61,0.1)' : '#F4F4F5', color: colors.text }}
        >
          {occupancyLabel[state]}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <span className="text-[12px] font-extrabold text-[#71717A]">
            {occupied}/{table.capacity}
          </span>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Editar ${table.name}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#3F3F46] hover:bg-[#FAFAFA]"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Eliminar ${table.name}`}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#9CA3AF] hover:text-[#B91C1C] hover:bg-[rgba(185,28,28,0.06)]"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
