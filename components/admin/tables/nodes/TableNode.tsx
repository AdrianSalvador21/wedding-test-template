'use client';

import React from 'react';
import type { NodeProps } from 'reactflow';
import { FirebaseTable } from '../../../../src/types/wedding';
import { getOccupancyState, occupancyColor } from '../occupancy';

export interface TableNodeData {
  table: FirebaseTable;
  occupied: number;
  armed: boolean;
  touchHandlers?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

// Tamaño y radio de esquina por forma (spec 12): la misma silueta que ya se
// ve en el preview de "Nueva/editar mesa", para que la forma elegida ahí se
// reconozca en el Plano y no todas las mesas terminen viéndose iguales.
const SHAPE_GEOMETRY: Record<NonNullable<FirebaseTable['shape']>, { width: number; height: number; radius: number }> = {
  round: { width: 64, height: 64, radius: 9999 },
  square: { width: 64, height: 64, radius: 10 },
  rectangular: { width: 94, height: 56, radius: 10 },
  imperial: { width: 122, height: 42, radius: 21 },
};

export default function TableNode({ data }: NodeProps<TableNodeData>) {
  const { table, occupied, armed, touchHandlers } = data;
  const state = getOccupancyState(occupied, table.capacity);
  const colors = occupancyColor[state];
  const geometry = SHAPE_GEOMETRY[table.shape || 'round'];

  return (
    <div
      onTouchStart={touchHandlers?.onTouchStart}
      onTouchMove={touchHandlers?.onTouchMove}
      onTouchEnd={touchHandlers?.onTouchEnd}
      className="flex flex-col items-center select-none"
      style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
    >
      <div
        className="flex flex-col items-center justify-center bg-white transition-transform"
        style={{
          width: geometry.width,
          height: geometry.height,
          borderRadius: geometry.radius,
          border: `${armed ? 3 : 2}px ${state === 'empty' ? 'dashed' : 'solid'} ${armed ? '#111111' : colors.border}`,
          color: colors.text,
          boxShadow: armed ? '0 0 0 5px rgba(17,17,17,0.14), 0 10px 20px rgba(0,0,0,0.22)' : '0 1px 3px rgba(0,0,0,0.08)',
          transform: armed ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <span className="text-[9px] font-bold leading-none">
          {occupied}/{table.capacity}
        </span>
      </div>
      <span
        className="mt-1.5 max-w-[110px] text-center text-[10.5px] font-extrabold text-[#0A0A0A] bg-white/95 rounded px-1.5 py-0.5 leading-tight shadow-sm"
        style={{ wordBreak: 'break-word' }}
        title={table.name}
      >
        {table.name}
      </span>
    </div>
  );
}
