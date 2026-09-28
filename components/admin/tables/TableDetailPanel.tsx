'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Edit2, Trash2, GripVertical } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  KeyboardSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { FirebaseGuest, FirebaseTable } from '../../../src/types/wedding';
import { getSeatedGuestCount } from '../../../services/guestService';
import { getOccupancyState } from './occupancy';

export type TableDetailTarget = { type: 'table'; table: FirebaseTable } | { type: 'unassigned' };

interface Props {
  target: TableDetailTarget;
  guests: FirebaseGuest[];
  tables: FirebaseTable[];
  occupancyByTable: Map<string, number>;
  onAssign: (guestId: string, tableId: string | null) => Promise<void>;
  onClose: () => void;
  onEditTable?: () => void;
  onDeleteTable?: () => void;
}

function GuestRow({
  guest,
  draggableId,
  rightSlot,
}: {
  guest: FirebaseGuest;
  draggableId?: string;
  rightSlot: React.ReactNode;
}) {
  const draggable = useDraggable({
    id: draggableId || `static:${guest.id}`,
    data: { guestId: guest.id, fromTableId: guest.tableId ?? null },
    disabled: !draggableId,
  });

  const style: React.CSSProperties = draggable.transform
    ? { opacity: 0.35 }
    : {};

  return (
    <div
      ref={draggable.setNodeRef}
      style={style}
      className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[#FAFAFA]"
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {draggableId && (
          <button
            type="button"
            {...draggable.listeners}
            {...draggable.attributes}
            className="text-[#D4D4D8] hover:text-[#9CA3AF] cursor-grab flex-shrink-0 touch-none"
            aria-label={`Arrastrar a ${guest.name}`}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}
        <span className="text-[13px] font-bold text-[#0A0A0A] truncate">
          {guest.name} <span className="font-semibold text-[#71717A]">· {getSeatedGuestCount(guest)}</span>
        </span>
      </div>
      <div className="flex-shrink-0">{rightSlot}</div>
    </div>
  );
}

function DropZone({ id, children, disabled }: { id: string; children: React.ReactNode; disabled?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-1.5 rounded-lg transition-colors"
      style={{ background: isOver && !disabled ? 'rgba(17,17,17,0.04)' : 'transparent', minHeight: 40 }}
    >
      {children}
    </div>
  );
}

export default function TableDetailPanel({
  target,
  guests,
  tables,
  occupancyByTable,
  onAssign,
  onClose,
  onEditTable,
  onDeleteTable,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDragGuestId, setActiveDragGuestId] = useState<string | null>(null);
  // Se inicializa ya con el valor real (el panel solo se monta del lado del cliente, tras un
  // clic) para que la primera animación use la dirección correcta desde el primer frame.
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Escritorio: entra deslizándose desde la derecha. Móvil: sube desde abajo (hoja inferior).
  const panelVariants = isDesktop
    ? { hidden: { x: '100%', opacity: 0.6 }, visible: { x: 0, opacity: 1 } }
    : { hidden: { y: '100%' }, visible: { y: 0 } };

  const sensors = useSensors(
    // Solo mouse + teclado: en móvil la asignación es solo por botones/`<select>` (spec 12, Decisiones).
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const table = target.type === 'table' ? target.table : null;
  const occupied = table ? occupancyByTable.get(table.id) || 0 : 0;
  const capacity = table?.capacity ?? 0;
  const canAddMore = table ? occupied < capacity : false;
  const state = table ? getOccupancyState(occupied, capacity) : 'empty';

  const atTableGuests = useMemo(
    () => (table ? guests.filter((g) => g.tableId === table.id) : []),
    [guests, table]
  );

  const unassignedGuests = useMemo(() => {
    const list = guests.filter((g) => !g.tableId);
    if (!searchTerm.trim()) return list;
    const term = searchTerm.trim().toLowerCase();
    return list.filter((g) => g.name.toLowerCase().includes(term));
  }, [guests, searchTerm]);

  const activeGuest = activeDragGuestId ? guests.find((g) => g.id === activeDragGuestId) || null : null;

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { guestId: string } | undefined;
    setActiveDragGuestId(data?.guestId || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragGuestId(null);
    const { active, over } = event;
    if (!over || !table) return;
    const data = active.data.current as { guestId: string; fromTableId: string | null } | undefined;
    if (!data) return;

    if (over.id === 'zone:table') {
      if (data.fromTableId === table.id) return;
      if (!canAddMore) return; // mesa en su límite: no se acepta el drop (spec 12)
      await onAssign(data.guestId, table.id);
    } else if (over.id === 'zone:unassigned') {
      if (data.fromTableId === null) return;
      await onAssign(data.guestId, null);
    }
  };

  return (
    <>
      {/* Scrim: oscurece el resto de la pantalla mientras el panel está abierto (escritorio y móvil) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/45 z-30"
        onClick={onClose}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={panelVariants}
        transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
        className={
          isDesktop
            ? 'fixed z-40 bg-white border border-[rgba(0,0,0,0.08)] shadow-2xl flex flex-col inset-y-0 right-0 w-[400px]'
            : 'fixed z-40 bg-white border border-[rgba(0,0,0,0.08)] shadow-2xl flex flex-col inset-x-0 bottom-0 rounded-t-2xl max-h-[82vh]'
        }
      >
        {!isDesktop && (
          <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0">
            <span className="w-9 h-1 rounded-full bg-[#D4D4D8]" />
          </div>
        )}

        <div className="px-5 py-3.5 border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-extrabold text-[#0A0A0A]">
              {table ? table.name : 'Sin mesa'}
            </span>
            {table && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#3F3F46]">
                {occupied}/{capacity}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {table && onEditTable && (
              <button type="button" onClick={onEditTable} className="w-7 h-7 rounded-lg bg-[#FAFAFA] flex items-center justify-center">
                <Edit2 className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>
            )}
            {table && onDeleteTable && (
              <button type="button" onClick={onDeleteTable} className="w-7 h-7 rounded-lg bg-[#FAFAFA] flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>
            )}
            <button type="button" onClick={onClose} className="w-7 h-7 rounded-lg bg-[#FAFAFA] flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-[#71717A]" />
            </button>
          </div>
        </div>

        {table && (
          <div className="px-5 pt-3 pb-1 flex-shrink-0">
            <div className="h-1.5 rounded-full bg-[#F4F4F5] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0}%`,
                  background: state === 'over' ? '#B91C1C' : '#111111',
                }}
              />
            </div>
          </div>
        )}

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="px-5 py-3 flex-1 overflow-y-auto flex flex-col gap-4 min-h-0">
            {table && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#71717A] mb-1.5">
                  En esta mesa ({atTableGuests.length})
                </div>
                <DropZone id="zone:table">
                  {atTableGuests.length === 0 && (
                    <p className="text-[12.5px] text-[#9CA3AF] px-2 py-3">Nadie asignado todavía.</p>
                  )}
                  {atTableGuests.map((guest) => (
                    <GuestRow
                      key={guest.id}
                      guest={guest}
                      draggableId={`guest:${guest.id}`}
                      rightSlot={
                        <button
                          type="button"
                          onClick={() => onAssign(guest.id, null)}
                          aria-label={`Quitar a ${guest.name} de ${table.name}`}
                          className="w-6 h-6 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-[#B91C1C] hover:bg-[rgba(185,28,28,0.06)] text-[15px] font-bold"
                        >
                          ×
                        </button>
                      }
                    />
                  ))}
                </DropZone>
              </div>
            )}

            <div className={table ? 'border-t border-[rgba(0,0,0,0.06)] pt-3 flex-1 flex flex-col min-h-0' : 'flex-1 flex flex-col min-h-0'}>
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#71717A] mb-1.5 flex-shrink-0">
                Sin mesa ({guests.filter((g) => !g.tableId).length})
              </div>
              <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-[rgba(0,0,0,0.08)] rounded-lg px-2.5 py-1.5 mb-2 flex-shrink-0">
                <Search className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar invitado…"
                  className="w-full bg-transparent text-[12.5px] text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none"
                />
              </div>
              <div className="flex-1 overflow-y-auto min-h-0">
                <DropZone id="zone:unassigned" disabled={!table}>
                  {unassignedGuests.length === 0 && (
                    <p className="text-[12.5px] text-[#9CA3AF] px-2 py-3">Sin resultados.</p>
                  )}
                  {unassignedGuests.map((guest) =>
                    table ? (
                      <GuestRow
                        key={guest.id}
                        guest={guest}
                        draggableId={`guest:${guest.id}`}
                        rightSlot={
                          <button
                            type="button"
                            onClick={() => canAddMore && onAssign(guest.id, table.id)}
                            disabled={!canAddMore}
                            title={!canAddMore ? `${table.name} está en su capacidad máxima` : undefined}
                            aria-label={`Agregar a ${guest.name} a ${table.name}`}
                            className="w-6 h-6 rounded-md flex items-center justify-center border border-[rgba(0,0,0,0.12)] bg-white text-[#0A0A0A] font-bold text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            +
                          </button>
                        }
                      />
                    ) : (
                      <GuestRow
                        key={guest.id}
                        guest={guest}
                        rightSlot={
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) onAssign(guest.id, e.target.value);
                              e.target.value = '';
                            }}
                            className="text-[11.5px] font-bold border border-[rgba(0,0,0,0.14)] rounded-md px-2 py-1.5 bg-white text-[#3F3F46] focus:outline-none"
                          >
                            <option value="" disabled>
                              Mover a mesa…
                            </option>
                            {tables.map((t) => {
                              const tOccupied = occupancyByTable.get(t.id) || 0;
                              const full = tOccupied >= t.capacity;
                              return (
                                <option key={t.id} value={t.id} disabled={full}>
                                  {t.name} {full ? '(llena)' : `(${tOccupied}/${t.capacity})`}
                                </option>
                              );
                            })}
                          </select>
                        }
                      />
                    )
                  )}
                </DropZone>
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeGuest ? (
              <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg px-3 py-2 shadow-xl text-[13px] font-bold text-[#0A0A0A]">
                {activeGuest.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </motion.div>
    </>
  );
}
