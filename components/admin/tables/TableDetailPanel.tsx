'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useDragControls, type PanInfo } from 'framer-motion';
import { X, Search, Edit2, Trash2, GripVertical, ArrowRight } from 'lucide-react';
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
import { FirebaseGuest, FirebaseTable, FirebaseTableSeat } from '../../../src/types/wedding';
import { getSeatDisplayName } from '../../../services/seatService';
import { resolveGuestAttendance, type AttendanceStatus } from '../../../services/guestService';
import { getOccupancyState, getSeatDots } from './occupancy';
import { Avatar, StatusPill, StatusDot } from './PersonBadges';

export type TableDetailTarget = { type: 'table'; table: FirebaseTable } | { type: 'unassigned' };

interface Props {
  target: TableDetailTarget;
  guests: FirebaseGuest[];
  tables: FirebaseTable[];
  seats: FirebaseTableSeat[];
  occupancyByTable: Map<string, number>;
  onAssignSeat: (seatId: string, tableId: string | null) => Promise<void>;
  onClose: () => void;
  onEditTable?: () => void;
  onDeleteTable?: () => void;
}

const SHAPE_LABELS: Record<NonNullable<FirebaseTable['shape']>, string> = {
  round: 'Redonda',
  square: 'Cuadrada',
  rectangular: 'Rectangular',
  imperial: 'Imperial',
};

type SeatLocation = 'here' | 'elsewhere' | 'unassigned';

// Un sub-asiento ya resuelto a su invitación, su nombre a mostrar y dónde está
// realmente sentado respecto a la mesa abierta (spec 23 — visibilidad cruzada: un
// acompañante puede estar en otra mesa específica, no solo "aquí" o "sin mesa").
interface SeatRowData {
  seat: FirebaseTableSeat;
  guest: FirebaseGuest;
  displayName: string;
  status: AttendanceStatus;
  location: SeatLocation;
  elsewhereTable?: FirebaseTable;
}

function buildRow(seat: FirebaseTableSeat, guest: FirebaseGuest, table: FirebaseTable | null, tables: FirebaseTable[]): SeatRowData {
  const location: SeatLocation = !seat.tableId ? 'unassigned' : table && seat.tableId === table.id ? 'here' : 'elsewhere';
  return {
    seat,
    guest,
    displayName: getSeatDisplayName(guest, seat.seatIndex),
    status: resolveGuestAttendance(guest),
    location,
    elsewhereTable: location === 'elsewhere' ? tables.find((t) => t.id === seat.tableId) : undefined,
  };
}

// Agrupa una lista de sub-asientos por invitación, conservando el orden de `guests`
// (ya viene ordenado por fecha de creación) para que la lista no salte entre renders.
function groupByGuest(rows: SeatRowData[]) {
  const byGuestId = new Map<string, SeatRowData[]>();
  rows.forEach((row) => {
    const list = byGuestId.get(row.guest.id) || [];
    list.push(row);
    byGuestId.set(row.guest.id, list);
  });
  return Array.from(byGuestId.values()).map((groupRows) => ({
    guest: groupRows[0].guest,
    rows: groupRows.sort((a, b) => a.seat.seatIndex - b.seat.seatIndex),
  }));
}

function SeatRow({
  row,
  draggableId,
  rightSlot,
}: {
  row: SeatRowData;
  draggableId?: string;
  rightSlot: React.ReactNode;
}) {
  const draggable = useDraggable({
    id: draggableId || `static:${row.seat.id}`,
    data: { seatId: row.seat.id, fromTableId: row.seat.tableId ?? null },
    disabled: !draggableId,
  });

  const dragStyle: React.CSSProperties = draggable.transform ? { opacity: 0.35 } : {};
  const muted = row.location !== 'here';

  return (
    <div
      ref={draggable.setNodeRef}
      className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg"
      style={{ ...dragStyle, background: muted ? '#FFFFFF' : '#FAFAFA', border: muted ? '1px dashed #E4E4E7' : undefined }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {draggableId && (
          <button
            type="button"
            {...draggable.listeners}
            {...draggable.attributes}
            className="text-[#D4D4D8] hover:text-[#9CA3AF] cursor-grab flex-shrink-0 touch-none"
            aria-label={`Arrastrar a ${row.displayName}`}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}
        <Avatar name={row.displayName} />
        <span className={`text-[13px] font-bold truncate ${muted ? 'text-[#9CA3AF]' : 'text-[#0A0A0A]'}`}>{row.displayName}</span>
        {row.location === 'elsewhere' && (
          <span className="flex-shrink-0 text-[10.5px] font-extrabold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#71717A] whitespace-nowrap">
            En {row.elsewhereTable?.name || 'otra mesa'}
          </span>
        )}
        {row.location !== 'elsewhere' && <StatusPill status={row.status} />}
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
      className="flex flex-col gap-2.5 rounded-lg transition-colors"
      style={{ background: isOver && !disabled ? 'rgba(17,17,17,0.04)' : 'transparent', minHeight: 40 }}
    >
      {children}
    </div>
  );
}

// Encabezado de grupo (spec 23): nombre de la invitación + cuántas de sus personas
// aparecen en esta lista. El checkbox solo actúa cuando hay una mesa abierta: en "En
// esta mesa" refleja si TODAS las filas del grupo ya están aquí (desmarcar las quita
// de golpe; marcarlo trae a las que faltan); en "Sin mesa" ninguna lo está todavía
// (marcar las asigna todas de golpe, si caben).
function GroupHeader({
  guest,
  count,
  mode,
  onToggle,
  toggleDisabled,
}: {
  guest: FirebaseGuest;
  count: number;
  mode: 'here' | 'partial' | 'unassigned' | 'readonly';
  onToggle?: () => void;
  toggleDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 px-0.5">
      {mode !== 'readonly' && (
        <input
          type="checkbox"
          checked={mode === 'here'}
          ref={(el) => {
            if (el) el.indeterminate = mode === 'partial';
          }}
          disabled={toggleDisabled}
          onChange={onToggle}
          aria-label={
            mode === 'here'
              ? `Quitar a todo el grupo de ${guest.name} de esta mesa`
              : `Sentar a todo el grupo de ${guest.name} en esta mesa`
          }
        />
      )}
      <span className="text-[13px] font-extrabold text-[#0A0A0A] truncate">{guest.name}</span>
      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#111111] text-white flex-shrink-0">{count}</span>
    </div>
  );
}

export default function TableDetailPanel({
  target,
  guests,
  tables,
  seats,
  occupancyByTable,
  onAssignSeat,
  onClose,
  onEditTable,
  onDeleteTable,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'unassigned' | 'assigned' | 'all'>('unassigned');
  const [activeDragSeatId, setActiveDragSeatId] = useState<string | null>(null);
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

  // Móvil: mientras la hoja está abierta, la página de atrás no debe poder desplazarse
  // (antes, si el dedo no caía justo en la manija, se seguía haciendo scroll afuera).
  // Solo móvil: el panel de escritorio no cambia.
  useEffect(() => {
    if (isDesktop) return;
    const { body, documentElement: html } = document;
    const prev = {
      bodyOverflow: body.style.overflow,
      htmlOverflow: html.style.overflow,
      htmlOverscroll: html.style.overscrollBehavior,
    };
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    html.style.overscrollBehavior = 'none';
    return () => {
      body.style.overflow = prev.bodyOverflow;
      html.style.overflow = prev.htmlOverflow;
      html.style.overscrollBehavior = prev.htmlOverscroll;
    };
  }, [isDesktop]);

  // Escritorio: entra deslizándose desde la derecha. Móvil: sube desde abajo (hoja inferior).
  const panelVariants = isDesktop
    ? { hidden: { x: '100%', opacity: 0.6 }, visible: { x: 0, opacity: 1 } }
    : { hidden: { y: '100%' }, visible: { y: 0 } };

  // Deslizar hacia abajo para cerrar (solo móvil): la manija visual ya existía pero no
  // estaba conectada a ningún gesto, así que el swipe hacia abajo lo interceptaba el
  // navegador como "pull to refresh" en vez de cerrar la hoja. `dragControls` limita
  // quién puede iniciar el arrastre a la manija (más abajo), para no competir con el
  // scroll normal de la lista de invitados. `dragConstraints` con bottom:0 + elástico
  // solo hacia abajo hace que, al soltar sin pasar el umbral, la hoja rebote sola de
  // vuelta a su posición (igual que un bottom sheet nativo).
  const dragControls = useDragControls();
  const handleSheetDragEnd = (_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 500) onClose();
  };

  const sensors = useSensors(
    // Solo mouse + teclado: en móvil la asignación es solo por botones/`<select>` (spec 12, Decisiones).
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor)
  );

  const table = target.type === 'table' ? target.table : null;
  const occupied = table ? occupancyByTable.get(table.id) || 0 : 0;
  const capacity = table?.capacity ?? 0;
  const state = table ? getOccupancyState(occupied, capacity) : 'empty';
  const seatDots = table ? getSeatDots(occupied, capacity) : null;
  // Spec 23 — cada persona ocupa 1 solo lugar, sin importar cuántos acompañantes traiga
  // su invitación (antes se comparaba contra el tamaño del grupo completo).
  const wouldFitOne = table ? occupied < capacity : false;

  const atTableSeats = useMemo(() => (table ? seats.filter((s) => s.tableId === table.id) : []), [seats, table]);
  const unassignedSeatsAll = useMemo(() => seats.filter((s) => !s.tableId), [seats]);

  // Confirmados/pendientes/declinados entre las personas ya sentadas aquí (heredan el
  // estado RSVP de su invitación completa — no hay RSVP por acompañante, spec 23).
  const statusBreakdown = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = { confirmed: 0, pending: 0, declined: 0 };
    atTableSeats.forEach((seat) => {
      const guest = guests.find((g) => g.id === seat.guestId);
      if (guest) counts[resolveGuestAttendance(guest)] += 1;
    });
    return counts;
  }, [atTableSeats, guests]);

  // Spec 23 — "En esta mesa" muestra el GRUPO completo de cualquier invitación con al
  // menos una persona aquí: el resto de sus personas aparece también, marcadas como "en
  // otra mesa" (con botón "Traer aquí") o "sin mesa" (con botón "+"), en vez de quedar
  // invisibles como si no existieran.
  const hereGuestIds = useMemo(() => new Set(atTableSeats.map((s) => s.guestId)), [atTableSeats]);

  const atTableGroups = useMemo(() => {
    if (!table) return [];
    const rows = guests
      .filter((g) => hereGuestIds.has(g.id))
      .flatMap((guest) =>
        seats.filter((s) => s.guestId === guest.id).map((seat) => buildRow(seat, guest, table, tables))
      );
    return groupByGuest(rows);
  }, [table, hereGuestIds, guests, seats, tables]);

  // Spec 23 — filtros "Sin asignar"/"Asignados"/"Todos": conteos siempre a nivel de toda
  // la boda, para que coincidan con lo que dice cada pill sin importar qué mesa esté
  // abierta (igual criterio que el diseño de referencia).
  const unassignedCount = unassignedSeatsAll.length;
  const assignedCount = seats.length - unassignedSeatsAll.length;
  const allCount = seats.length;
  const activeFilterCount = filter === 'unassigned' ? unassignedCount : filter === 'assigned' ? assignedCount : allCount;
  const activeFilterLabel =
    filter === 'unassigned' ? 'sin mesa' : filter === 'assigned' ? (activeFilterCount === 1 ? 'asignado' : 'asignados') : 'en total';

  // Lista de abajo: cualquier invitación que NO tenga ya a nadie en esta mesa (esas se
  // ven completas arriba, en "En esta mesa"), filtrada por la pestaña activa.
  const otherSeats = useMemo(() => {
    return seats.filter((s) => {
      if (hereGuestIds.has(s.guestId)) return false;
      if (filter === 'unassigned') return !s.tableId;
      if (filter === 'assigned') return !!s.tableId;
      return true;
    });
  }, [seats, hereGuestIds, filter]);

  const otherSeatsFiltered = useMemo(() => {
    if (!searchTerm.trim()) return otherSeats;
    const term = searchTerm.trim().toLowerCase();
    return otherSeats.filter((s) => {
      const guest = guests.find((g) => g.id === s.guestId);
      return guest ? getSeatDisplayName(guest, s.seatIndex).toLowerCase().includes(term) : false;
    });
  }, [otherSeats, guests, searchTerm]);

  const otherGroups = useMemo(() => {
    const rows = otherSeatsFiltered
      .map((seat) => {
        const guest = guests.find((g) => g.id === seat.guestId);
        return guest ? buildRow(seat, guest, table, tables) : null;
      })
      .filter((r): r is SeatRowData => r !== null);
    return groupByGuest(rows);
  }, [otherSeatsFiltered, guests, table, tables]);

  const activeSeat = activeDragSeatId ? seats.find((s) => s.id === activeDragSeatId) || null : null;
  const activeSeatGuest = activeSeat ? guests.find((g) => g.id === activeSeat.guestId) || null : null;
  const activeSeatName = activeSeat && activeSeatGuest ? getSeatDisplayName(activeSeatGuest, activeSeat.seatIndex) : null;

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { seatId: string } | undefined;
    setActiveDragSeatId(data?.seatId || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveDragSeatId(null);
    const { active, over } = event;
    if (!over || !table) return;
    const data = active.data.current as { seatId: string; fromTableId: string | null } | undefined;
    if (!data) return;

    if (over.id === 'zone:table') {
      if (data.fromTableId === table.id) return;
      if (!wouldFitOne) return; // mesa llena: no se acepta el drop
      await onAssignSeat(data.seatId, table.id);
    } else if (over.id === 'zone:unassigned') {
      if (data.fromTableId === null) return;
      await onAssignSeat(data.seatId, null);
    }
  };

  // Checkbox "todos" de un grupo en "En esta mesa" (spec 23): si todas sus personas ya
  // están aquí, desmarcar las quita a todas; si falta alguna (en otra mesa o sin mesa),
  // marcar trae a las que faltan, sin tocar a las que ya están.
  const handleToggleGroupHere = async (rows: SeatRowData[]) => {
    if (!table) return;
    const allHere = rows.every((r) => r.location === 'here');
    if (allHere) {
      await Promise.all(rows.map((row) => onAssignSeat(row.seat.id, null)));
    } else {
      await Promise.all(rows.filter((r) => r.location !== 'here').map((row) => onAssignSeat(row.seat.id, table.id)));
    }
  };
  const handleToggleGroupUnassigned = async (rows: SeatRowData[]) => {
    if (!table) return;
    await Promise.all(rows.map((row) => onAssignSeat(row.seat.id, table.id)));
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
        style={{ touchAction: 'none' }}
        onClick={onClose}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={panelVariants}
        transition={{ type: 'tween', duration: 0.28, ease: 'easeOut' }}
        drag={isDesktop ? false : 'y'}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 1 }}
        onDragEnd={isDesktop ? undefined : handleSheetDragEnd}
        className={
          isDesktop
            ? 'fixed z-40 bg-white border border-[rgba(0,0,0,0.08)] shadow-2xl flex flex-col inset-y-0 right-0 w-[420px]'
            : 'fixed z-40 bg-white border border-[rgba(0,0,0,0.08)] shadow-2xl flex flex-col inset-x-0 bottom-0 rounded-t-2xl max-h-[86vh]'
        }
        style={!isDesktop ? { overscrollBehaviorY: 'contain' } : undefined}
      >
        {/* Zona de arrastre (solo móvil): manija + header completo inician el gesto de
            deslizar hacia abajo para cerrar. Si el toque empieza en un botón (editar,
            borrar, cerrar) no se inicia arrastre, para no quitarle el clic. */}
        <div
          onPointerDown={
            isDesktop
              ? undefined
              : (e) => {
                  if ((e.target as HTMLElement).closest('button')) return;
                  dragControls.start(e);
                }
          }
          className={`flex-shrink-0 flex flex-col ${isDesktop ? '' : 'cursor-grab active:cursor-grabbing'}`}
          style={isDesktop ? undefined : { touchAction: 'none' }}
        >
        {!isDesktop && (
          <div className="flex justify-center pt-2.5 pb-1 flex-shrink-0" aria-hidden="true">
            <span className="w-9 h-1 rounded-full bg-[#D4D4D8]" />
          </div>
        )}

        <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.08)] flex flex-col gap-3.5 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {table ? (
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#9CA3AF]">
                  {table.name} &middot; {SHAPE_LABELS[table.shape || 'round']}
                </div>
              ) : (
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#9CA3AF]">Invitados</div>
              )}
              <span className="text-[19px] font-extrabold text-[#0A0A0A] truncate">{table ? table.name : 'Sin mesa'}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
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

          {table && seatDots && (
            <>
              <div className="flex items-center gap-3">
                <span className="text-[15px] font-extrabold text-[#0A0A0A]">
                  {occupied}
                  <span className="font-semibold text-[#9CA3AF]">/{capacity} personas</span>
                </span>
                <div className="flex flex-wrap items-center gap-1">
                  {seatDots.dots.map((dot, i) => (
                    <span
                      key={i}
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={dot === 'filled' ? { background: state === 'over' ? '#B91C1C' : '#111111' } : { border: '1.3px solid #D4D4D8' }}
                    />
                  ))}
                  {seatDots.overflowLabel && (
                    <span className="text-[10.5px] font-extrabold text-[#71717A] ml-0.5">{seatDots.overflowLabel}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <StatusDot status="confirmed" />
                  <span className="text-[12px] font-semibold text-[#3F3F46]">{statusBreakdown.confirmed} confirmados</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusDot status="pending" />
                  <span className="text-[12px] font-semibold text-[#3F3F46]">{statusBreakdown.pending} pendientes</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <StatusDot status="declined" />
                  <span className="text-[12px] font-semibold text-[#3F3F46]">{statusBreakdown.declined} declinados</span>
                </span>
              </div>
            </>
          )}
        </div>
        </div>

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div
            className="px-5 py-3 flex-1 overflow-y-auto flex flex-col gap-4 min-h-0"
            style={{ overscrollBehaviorY: 'contain' }}
          >
            {table && (
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-[#71717A] mb-1.5">
                  En esta mesa ({atTableSeats.length})
                </div>
                <DropZone id="zone:table">
                  {atTableGroups.length === 0 && (
                    <p className="text-[12.5px] text-[#9CA3AF] px-2 py-3">Nadie asignado todavía.</p>
                  )}
                  {atTableGroups.map(({ guest, rows }) => {
                    const hereCount = rows.filter((r) => r.location === 'here').length;
                    const headerMode = hereCount === rows.length ? 'here' : hereCount === 0 ? 'unassigned' : 'partial';
                    return (
                      <div key={guest.id} className="flex flex-col gap-1.5">
                        <GroupHeader guest={guest} count={rows.length} mode={headerMode} onToggle={() => handleToggleGroupHere(rows)} />
                        <div className="flex flex-col gap-1.5 pl-1">
                          {rows.map((row) =>
                            row.location === 'here' ? (
                              <SeatRow
                                key={row.seat.id}
                                row={row}
                                draggableId={`seat:${row.seat.id}`}
                                rightSlot={
                                  <button
                                    type="button"
                                    onClick={() => onAssignSeat(row.seat.id, null)}
                                    aria-label={`Quitar a ${row.displayName} de ${table.name}`}
                                    className="w-6 h-6 rounded-md flex items-center justify-center text-[#9CA3AF] hover:text-[#B91C1C] hover:bg-[rgba(185,28,28,0.06)] text-[15px] font-bold"
                                  >
                                    ×
                                  </button>
                                }
                              />
                            ) : row.location === 'elsewhere' ? (
                              <SeatRow
                                key={row.seat.id}
                                row={row}
                                rightSlot={
                                  <button
                                    type="button"
                                    onClick={() => wouldFitOne && onAssignSeat(row.seat.id, table.id)}
                                    disabled={!wouldFitOne}
                                    title={!wouldFitOne ? `${table.name} está completa` : undefined}
                                    aria-label={`Traer a ${row.displayName} a ${table.name}`}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[rgba(0,0,0,0.12)] bg-white text-[#0A0A0A] text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    Traer aquí <ArrowRight className="w-3 h-3" />
                                  </button>
                                }
                              />
                            ) : (
                              <SeatRow
                                key={row.seat.id}
                                row={row}
                                rightSlot={
                                  <button
                                    type="button"
                                    onClick={() => wouldFitOne && onAssignSeat(row.seat.id, table.id)}
                                    disabled={!wouldFitOne}
                                    title={!wouldFitOne ? `${table.name} está completa` : undefined}
                                    aria-label={`Sentar a ${row.displayName} en ${table.name}`}
                                    className="w-6 h-6 rounded-md flex items-center justify-center border border-[rgba(0,0,0,0.12)] bg-white text-[#0A0A0A] font-bold text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                                  >
                                    +
                                  </button>
                                }
                              />
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </DropZone>
              </div>
            )}

            <div className={table ? 'border-t border-[rgba(0,0,0,0.06)] pt-3' : ''}>
              <div className="text-[10.5px] font-extrabold uppercase tracking-wide text-[#9CA3AF] mb-0.5">Invitados</div>
              <div className="text-[17px] font-extrabold text-[#0A0A0A] mb-2.5">
                {activeFilterCount} {activeFilterLabel}
              </div>

              <div className="flex items-center gap-1.5 bg-[#FAFAFA] border border-[rgba(0,0,0,0.08)] rounded-full px-3 py-2 mb-2.5">
                <Search className="w-3.5 h-3.5 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar invitado…"
                  className="w-full bg-transparent text-[12.5px] text-[#0A0A0A] placeholder-[#9CA3AF] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1 mb-3 flex-nowrap overflow-x-auto">
                {(['unassigned', 'assigned', 'all'] as const).map((f) => {
                  const count = f === 'unassigned' ? unassignedCount : f === 'assigned' ? assignedCount : allCount;
                  const label = f === 'unassigned' ? 'Sin asignar' : f === 'assigned' ? 'Asignados' : 'Todos';
                  const active = filter === f;
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={`flex-shrink-0 px-2.5 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-colors ${
                        active ? 'bg-[#111111] text-white' : 'bg-[#FAFAFA] text-[#3F3F46] border border-[rgba(0,0,0,0.1)]'
                      }`}
                    >
                      {label} {count}
                    </button>
                  );
                })}
              </div>

              <DropZone id="zone:unassigned" disabled={!table}>
                {otherGroups.length === 0 && (
                  <p className="text-[12.5px] text-[#9CA3AF] px-2 py-3">Sin resultados.</p>
                )}
                {otherGroups.map(({ guest, rows }) => (
                  <div key={guest.id} className="flex flex-col gap-1.5">
                    <GroupHeader
                      guest={guest}
                      count={rows.length}
                      mode={!table ? 'readonly' : 'unassigned'}
                      toggleDisabled={table ? occupied + rows.length > capacity : undefined}
                      onToggle={() => handleToggleGroupUnassigned(rows)}
                    />
                    <div className="flex flex-col gap-1.5 pl-1">
                      {rows.map((row) => (
                        <SeatRow
                          key={row.seat.id}
                          row={row}
                          draggableId={table ? `seat:${row.seat.id}` : undefined}
                          rightSlot={
                            table ? (
                              row.location === 'unassigned' ? (
                                <button
                                  type="button"
                                  onClick={() => wouldFitOne && onAssignSeat(row.seat.id, table.id)}
                                  disabled={!wouldFitOne}
                                  title={!wouldFitOne ? `${table.name} está completa` : undefined}
                                  aria-label={`Agregar a ${row.displayName} a ${table.name}`}
                                  className="w-6 h-6 rounded-md flex items-center justify-center border border-[rgba(0,0,0,0.12)] bg-white text-[#0A0A0A] font-bold text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  +
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => wouldFitOne && onAssignSeat(row.seat.id, table.id)}
                                  disabled={!wouldFitOne}
                                  title={!wouldFitOne ? `${table.name} está completa` : undefined}
                                  aria-label={`Traer a ${row.displayName} a ${table.name}`}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[rgba(0,0,0,0.12)] bg-white text-[#0A0A0A] text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  Traer aquí <ArrowRight className="w-3 h-3" />
                                </button>
                              )
                            ) : (
                              <select
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) onAssignSeat(row.seat.id, e.target.value);
                                  e.target.value = '';
                                }}
                                className="text-[11.5px] font-bold border border-[rgba(0,0,0,0.14)] rounded-md px-2 py-1.5 bg-white text-[#3F3F46] focus:outline-none"
                              >
                                <option value="" disabled>
                                  Mover a mesa…
                                </option>
                                {tables.map((t) => {
                                  const tOccupied = occupancyByTable.get(t.id) || 0;
                                  const wontFit = t.id !== row.seat.tableId && tOccupied + 1 > t.capacity;
                                  return (
                                    <option key={t.id} value={t.id} disabled={wontFit}>
                                      {t.name} {wontFit ? '(no caben)' : `(${tOccupied}/${t.capacity})`}
                                    </option>
                                  );
                                })}
                              </select>
                            )
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </DropZone>
            </div>
          </div>

          <DragOverlay>
            {activeSeatName ? (
              <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-lg px-3 py-2 shadow-xl text-[13px] font-bold text-[#0A0A0A]">
                {activeSeatName}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </motion.div>
    </>
  );
}
