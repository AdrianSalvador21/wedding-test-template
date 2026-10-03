'use client';

import React from 'react';
import type { NodeProps } from 'reactflow';
import { FirebaseTable } from '../../../../src/types/wedding';
import { getOccupancyState, occupancyColor } from '../occupancy';
import { computePartyLayout, type PartyInput } from '../seatLayout';
import { SeatInitialsIcon } from '../PersonBadges';

export interface TableNodeData {
  table: FirebaseTable;
  occupied: number;
  // Spec 23 — un sub-asiento individual por entrada (ya no una invitación completa):
  // seatLayout.ts dibuja un ícono por persona realmente asignada a ESTA mesa.
  parties: PartyInput[];
  armed: boolean;
  // Spec 17 — feedback visual mientras se arrastra un invitado sobre esta mesa.
  isDropTarget?: boolean;
  isDropRejected?: boolean;
  touchHandlers?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  // Spec 23 — arrastrar (o, en touch, tocar para armar) un ícono reasigna solo a ESA
  // persona (ya no a toda la invitación); reutiliza el mismo mecanismo que la bandeja.
  seatDragHandlers: {
    isTouchDevice: boolean;
    onSeatDragStart: (seatId: string) => (e: React.DragEvent) => void;
    onSeatTap: (seatId: string) => () => void;
  };
}

// Tamaño y radio de esquina por forma (spec 12): la misma silueta que ya se
// ve en el preview de "Nueva/editar mesa", para que la forma elegida ahí se
// reconozca en el Plano y no todas las mesas terminen viéndose iguales.
// Se exporta porque PlanoCanvas también la necesita para el hit-test del
// arrastrar-y-soltar de invitados (spec 17): saber si un punto del lienzo cae
// dentro del rectángulo de una mesa exige la misma geometría que usa este nodo.
export const SHAPE_GEOMETRY: Record<NonNullable<FirebaseTable['shape']>, { width: number; height: number; radius: number }> = {
  round: { width: 64, height: 64, radius: 9999 },
  square: { width: 64, height: 64, radius: 10 },
  rectangular: { width: 94, height: 56, radius: 10 },
  imperial: { width: 122, height: 42, radius: 21 },
};

export default function TableNode({ data }: NodeProps<TableNodeData>) {
  const { table, occupied, parties, armed, isDropTarget, isDropRejected, touchHandlers, seatDragHandlers } = data;
  const state = getOccupancyState(occupied, table.capacity);
  const colors = occupancyColor[state];
  const geometry = SHAPE_GEOMETRY[table.shape || 'round'];

  const layout = computePartyLayout({
    shape: table.shape || 'round',
    width: geometry.width,
    height: geometry.height,
    parties,
    capacity: table.capacity,
  });

  const ringShadow = isDropTarget
    ? '0 0 0 5px rgba(21,128,61,0.12), 0 0 0 2.5px #15803D'
    : isDropRejected
      ? '0 0 0 5px rgba(185,28,28,0.1), 0 0 0 2.5px #B91C1C'
      : armed
        ? '0 0 0 5px rgba(17,17,17,0.14), 0 10px 20px rgba(0,0,0,0.22)'
        : '0 1px 3px rgba(0,0,0,0.08)';
  const ringScale = armed ? 'scale(1.08)' : isDropTarget ? 'scale(1.06)' : isDropRejected ? 'scale(0.96)' : 'scale(1)';

  return (
    <div
      onTouchStart={touchHandlers?.onTouchStart}
      onTouchMove={touchHandlers?.onTouchMove}
      onTouchEnd={touchHandlers?.onTouchEnd}
      // `nopan`: react-flow solo lo pone en nodos draggable; en touch los dejamos
      // draggable=false (arrastre manual), y sin esta clase el pan del lienzo se
      // llevaba el toque antes de que el arrastre de la mesa pudiera arrancar.
      className="nopan flex flex-col items-center select-none"
      style={{ touchAction: 'none', WebkitTouchCallout: 'none', WebkitUserSelect: 'none' }}
    >
      <div
        className="relative flex flex-col items-center justify-center bg-white transition-transform"
        style={{
          width: geometry.width,
          height: geometry.height,
          borderRadius: geometry.radius,
          border: `${armed ? 3 : 2}px ${state === 'empty' ? 'dashed' : 'solid'} ${armed ? '#111111' : colors.border}`,
          color: colors.text,
          boxShadow: ringShadow,
          transform: ringScale,
          transition: 'box-shadow .15s, transform .15s',
        }}
      >
        <span className="text-[9px] font-bold leading-none z-10">
          {occupied}/{table.capacity}
        </span>

        {layout.seats.map((seat) => (
          <div
            key={seat.seatId}
            title={seat.guestName}
            draggable={!seatDragHandlers.isTouchDevice}
            onDragStart={(e) => {
              e.stopPropagation();
              seatDragHandlers.onSeatDragStart(seat.seatId)(e);
            }}
            onClick={
              seatDragHandlers.isTouchDevice
                ? (e) => {
                    e.stopPropagation();
                    seatDragHandlers.onSeatTap(seat.seatId)();
                  }
                : undefined
            }
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Reasignar a ${seat.guestName}`}
            className="absolute nopan"
            style={{
              left: `calc(50% + ${seat.x}px)`,
              top: `calc(50% + ${seat.y}px)`,
              transform: 'translate(-50%, -50%)',
              cursor: seatDragHandlers.isTouchDevice ? 'pointer' : 'grab',
              touchAction: 'none',
              filter: 'drop-shadow(0 0 0 1.5px #fff)',
            }}
          >
            <SeatInitialsIcon name={seat.guestName} size={layout.iconSize} color={colors.text} />
          </div>
        ))}

        {layout.overflowSeats > 0 && (
          <div
            className="absolute flex items-center justify-center rounded-full font-extrabold text-white"
            style={{ right: -6, bottom: -2, width: 20, height: 20, fontSize: 9, background: '#111111' }}
          >
            +{layout.overflowSeats}
          </div>
        )}
      </div>
      <span
        className="max-w-[110px] text-center text-[10.5px] font-extrabold text-[#0A0A0A] bg-white/95 rounded px-1.5 py-0.5 leading-tight shadow-sm"
        // Spec 17 — separación calculada, no fija: garantiza que ningún ícono (sin
        // importar cuántos grupos tenga la mesa) quede encima del nombre, sea cual sea
        // el ángulo donde caiga su ancla.
        style={{ wordBreak: 'break-word', marginTop: layout.labelClearance }}
        title={table.name}
      >
        {table.name}
      </span>
    </div>
  );
}
