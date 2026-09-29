'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  Controls,
  MiniMap,
  Background,
  PanOnScrollMode,
  type Node,
  type NodeTypes,
  type NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronUp, Plus, Search } from 'lucide-react';
import { FirebaseGuest, FirebaseTable, FirebaseVenueFixture } from '../../../src/types/wedding';
import { tableService } from '../../../services/tableService';
import { venueFixtureService } from '../../../services/venueFixtureService';
import { getSeatedGuestCount } from '../../../services/guestService';
import { track } from '../../../lib/analytics/client';
import TableNode, { SHAPE_GEOMETRY, type TableNodeData } from './nodes/TableNode';
import FixtureNode, { type FixtureNodeData } from './nodes/FixtureNode';
import FixtureFormModal, { type FixtureFormValues } from './FixtureFormModal';
import type { PartyInput } from './seatLayout';
import styles from './plano-overrides.module.css';

const nodeTypes: NodeTypes = { table: TableNode, fixture: FixtureNode };

const tableNodeId = (id: string) => `table:${id}`;
const fixtureNodeId = (id: string) => `fixture:${id}`;

// Spec 17 — mismo canal que ya usaba la bandeja "Sin colocar" (mesas/objetos), con un
// tercer `kind: 'guest'` para arrastrar invitados directo sobre una mesa del lienzo.
type PlanoDragPayload = { kind: 'table' | 'fixture'; id: string } | { kind: 'guest'; id: string };
type ArmedItem = { kind: 'table' | 'fixture' | 'guest'; id: string };

interface Props {
  weddingId: string;
  tables: FirebaseTable[];
  fixtures: FirebaseVenueFixture[];
  guests: FirebaseGuest[];
  occupancyByTable: Map<string, number>;
  onSelectTable: (table: FirebaseTable) => void;
  onTableUpdated: (table: FirebaseTable) => void;
  onFixtureCreated: (fixture: FirebaseVenueFixture) => void;
  onFixtureUpdated: (fixture: FirebaseVenueFixture) => void;
  onFixtureDeleted: (fixtureId: string) => void;
  onAssign: (guestId: string, tableId: string | null) => Promise<void>;
}

function PlanoCanvasInner({
  weddingId,
  tables,
  fixtures,
  guests,
  occupancyByTable,
  onSelectTable,
  onTableUpdated,
  onFixtureCreated,
  onFixtureUpdated,
  onFixtureDeleted,
  onAssign,
}: Props) {
  const [nodes, setNodes, onNodesChangeBase] = useNodesState([]);
  const [armedNodeId, setArmedNodeId] = useState<string | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [showFixtureForm, setShowFixtureForm] = useState(false);
  // Flujo "tocar y tocar" para colocar desde la bandeja en touch (spec 13, extendido en
  // el spec 17 a invitados): el drag-and-drop nativo (draggable/onDragStart/onDrop) nunca
  // dispara con el dedo en navegadores móviles, así que en escritorio se deja intacto y
  // en touch se reemplaza por tocar el chip para "armarlo" y luego tocar el destino
  // (el lienzo vacío para mesas/objetos, una mesa para un invitado armado).
  const [armedTrayItem, setArmedTrayItem] = useState<ArmedItem | null>(null);
  // Colapso de la bandeja "Sin colocar" (spec 13): solo de cliente, nunca persiste —
  // siempre arranca expandida, igual criterio que el Plano ya usa para no guardar zoom/scroll.
  const [trayCollapsed, setTrayCollapsed] = useState(false);
  // Spec 17 — misma idea para la bandeja nueva "Invitados sin mesa" (columna separada).
  const [guestTrayCollapsed, setGuestTrayCollapsed] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  // Mesa bajo el puntero mientras se arrastra un invitado, y si ahí caben sus personas —
  // alimenta el resaltado verde/rojo del nodo (TableNodeData.isDropTarget/isDropRejected).
  const [hoverTableId, setHoverTableId] = useState<string | null>(null);
  const [hoverValid, setHoverValid] = useState(true);
  // Breve resalte rojo tras un drop rechazado por capacidad, aunque el puntero ya se haya
  // movido (el dragover deja de reportar la mesa apenas se suelta).
  const [rejectedTableId, setRejectedTableId] = useState<string | null>(null);
  // En escritorio la bandeja es un riel vertical a la izquierda del lienzo; en móvil se
  // apila arriba como una franja horizontal para no quitarle ancho al lienzo (mismo
  // breakpoint 'md' que ya usa TableDetailPanel para su propio cambio de layout).
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const reactFlow = useReactFlow();
  const isCoarsePointerRef = useRef(false);
  const nodesRef = useRef<Node[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<FirebaseGuest[]>(guests);
  const occupancyRef = useRef<Map<string, number>>(occupancyByTable);
  const tablesRef = useRef<FirebaseTable[]>(tables);
  // Qué invitado se está arrastrando ahora mismo (si lo hay): se fija al iniciar el
  // arrastre (bandeja o un ícono ya colocado) y se limpia al soltar/cancelar. El
  // DragEvent nativo no permite leer `dataTransfer` durante `dragover` por seguridad del
  // navegador, así que esta es la única forma de saber, mientras se arrastra, si lo que
  // se mueve es un invitado (para resaltar mesas) o una mesa/objeto (comportamiento igual
  // que antes, sin resaltado).
  const draggingGuestIdRef = useRef<string | null>(null);
  const touchStateRef = useRef<{
    nodeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    dragging: boolean;
  } | null>(null);

  useEffect(() => {
    isCoarsePointerRef.current = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  }, []);

  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);
  useEffect(() => {
    occupancyRef.current = occupancyByTable;
  }, [occupancyByTable]);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  // Si el ítem armado deja de estar pendiente (se colocó/asignó por otro medio, se borró,
  // o el invitado ya tiene mesa), se desarma solo para no quedar apuntando a algo que ya
  // no aplica.
  useEffect(() => {
    if (!armedTrayItem) return;
    const stillPending =
      armedTrayItem.kind === 'table'
        ? tables.some((t) => t.id === armedTrayItem.id && (t.posX == null || t.posY == null))
        : armedTrayItem.kind === 'fixture'
          ? fixtures.some((f) => f.id === armedTrayItem.id && (f.posX == null || f.posY == null))
          : guests.some((g) => g.id === armedTrayItem.id && !g.tableId);
    if (!stillPending) setArmedTrayItem(null);
  }, [armedTrayItem, tables, fixtures, guests]);

  // Al cambiar entre bandeja lateral (escritorio) y bandeja apilada arriba (móvil) el
  // lienzo cambia de tamaño; sin volver a "ajustar a pantalla" las mesas ya colocadas
  // pueden quedar fuera del encuadre que se calculó con el tamaño anterior.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      reactFlow.fitView({ duration: 0 });
    });
    return () => cancelAnimationFrame(raf);
  }, [isDesktop, reactFlow]);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  // Actualización optimista: el estado local se pone con la posición nueva ANTES de esperar
  // a Firestore. Si no, al soltar (touch) el efecto que reconstruye los nodos volvía a pintar
  // la posición guardada anterior hasta que respondía la red, y la mesa "regresaba" y luego
  // saltaba. Si el guardado falla se revierte a la posición previa.
  const persistTablePosition = useCallback(
    async (id: string, x: number, y: number) => {
      const current = tables.find((t) => t.id === id);
      if (current) onTableUpdated({ ...current, posX: x, posY: y });
      try {
        await tableService.updateTablePosition(id, x, y);
      } catch (err) {
        if (current) onTableUpdated(current);
        throw err;
      }
    },
    [tables, onTableUpdated]
  );

  const persistFixturePosition = useCallback(
    async (id: string, x: number, y: number) => {
      const current = fixtures.find((f) => f.id === id);
      if (current) onFixtureUpdated({ ...current, posX: x, posY: y });
      try {
        await venueFixtureService.updateFixturePosition(id, x, y);
      } catch (err) {
        if (current) onFixtureUpdated(current);
        throw err;
      }
    },
    [fixtures, onFixtureUpdated]
  );

  const persistNodePosition = useCallback(
    (nodeId: string, x: number, y: number) => {
      if (nodeId.startsWith('table:')) return persistTablePosition(nodeId.slice('table:'.length), x, y);
      if (nodeId.startsWith('fixture:')) return persistFixturePosition(nodeId.slice('fixture:'.length), x, y);
      return Promise.resolve();
    },
    [persistTablePosition, persistFixturePosition]
  );

  // Spec 17 — ¿qué mesa (ya colocada) cae bajo un punto del lienzo? Mismo criterio de
  // geometría que dibuja TableNode (SHAPE_GEOMETRY): la posición de un nodo de reactflow
  // es su esquina superior-izquierda, así que el hit-test es contra ese rectángulo.
  const findTableUnderPoint = useCallback(
    (point: { x: number; y: number }): FirebaseTable | null => {
      for (const t of tablesRef.current) {
        if (t.posX == null || t.posY == null) continue;
        const geometry = SHAPE_GEOMETRY[t.shape || 'round'];
        if (point.x >= t.posX && point.x <= t.posX + geometry.width && point.y >= t.posY && point.y <= t.posY + geometry.height) {
          return t;
        }
      }
      return null;
    },
    []
  );

  // Spec 17 — asigna (o reasigna) un invitado a una mesa desde el lienzo, con el mismo
  // criterio de capacidad que ya usa TableDetailPanel: se bloquea si sus personas no caben,
  // nunca si la mesa ya estaba excedida por otra razón (reducción de capacidad, spec 12).
  const handleAssignDrop = useCallback(
    async (guestId: string, table: FirebaseTable) => {
      const guest = guestsRef.current.find((g) => g.id === guestId);
      if (!guest || guest.tableId === table.id) return;
      const occupied = occupancyRef.current.get(table.id) || 0;
      const seats = getSeatedGuestCount(guest);
      if (occupied + seats > table.capacity) {
        const id = tableNodeId(table.id);
        setRejectedTableId(id);
        window.setTimeout(() => setRejectedTableId((cur) => (cur === id ? null : cur)), 900);
        return;
      }
      await onAssign(guestId, table.id);
      track('guest_assigned_to_table', {});
    },
    [onAssign]
  );

  // Gesto de arrastre en pantallas táctiles (spec 12, ajustado tras spec 14): un
  // desplazamiento mínimo del dedo (6px) activa el arrastre al instante — igual de
  // fluido que el demo de la landing (framer-motion `drag`, sin espera artificial).
  // Antes se requería sostener 400ms sin mover más de 8px para "armarse", pero ese
  // temblor natural del dedo casi siempre superaba el umbral antes de completarse
  // el tiempo, cancelando el gesto: en la práctica las mesas casi nunca se movían.
  // El umbral de 6px sigue distinguiendo un toque corto (abre el panel de detalle,
  // vía onNodeClick/handleNodeClick) de un arrastre real, sin depender del tiempo.
  // Al arrancar siempre sobre el nodo (nunca sobre el lienzo vacío) y con
  // touchAction:'none' + stopPropagation ya puestos en TableNode/FixtureNode, no
  // compite con el pan de una sola mano del lienzo — la rama de escritorio
  // (draggable=true, arrastre nativo de react-flow) no se toca.
  const DRAG_THRESHOLD_PX = 6;
  const makeTouchHandlers = useCallback(
    (nodeId: string) => {
      if (!isCoarsePointerRef.current) return undefined;
      return {
        onTouchStart: (e: React.TouchEvent) => {
          e.stopPropagation();
          const touch = e.touches[0];
          const node = nodesRef.current.find((n) => n.id === nodeId);
          if (!node || !touch) return;
          touchStateRef.current = {
            nodeId,
            startX: touch.clientX,
            startY: touch.clientY,
            origX: node.position.x,
            origY: node.position.y,
            dragging: false,
          };
        },
        onTouchMove: (e: React.TouchEvent) => {
          const st = touchStateRef.current;
          const touch = e.touches[0];
          if (!st || st.nodeId !== nodeId || !touch) return;
          const dx = touch.clientX - st.startX;
          const dy = touch.clientY - st.startY;
          if (!st.dragging) {
            if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
            st.dragging = true;
            setArmedNodeId(nodeId);
          }
          e.stopPropagation();
          e.preventDefault();
          const zoom = reactFlow.getZoom() || 1;
          const newX = st.origX + dx / zoom;
          const newY = st.origY + dy / zoom;
          setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, position: { x: newX, y: newY } } : n)));
        },
        onTouchEnd: () => {
          const st = touchStateRef.current;
          if (!st || st.nodeId !== nodeId) return;
          const wasDragging = st.dragging;
          touchStateRef.current = null;
          setArmedNodeId(null);
          if (wasDragging) {
            const node = nodesRef.current.find((n) => n.id === nodeId);
            if (node) persistNodePosition(nodeId, node.position.x, node.position.y);
          }
        },
      };
    },
    [reactFlow, setNodes, persistNodePosition]
  );

  const isTouchDevice = isCoarsePointerRef.current;

  // Spec 17 — se arma con un dataTransfer 'guest' (bandeja o ícono ya colocado) en
  // desktop, y hereda el mismo mecanismo de armado táctil en touch.
  //
  // Contorno de color + una leve inclinación en la tarjeta mientras se arrastra: el
  // navegador solo deja fijar la imagen "fantasma" que sigue al cursor UNA vez, al llamar
  // dataTransfer.setDragImage en dragstart — no se puede volver a cambiar mientras se
  // mueve sobre una mesa, así que no es posible inclinarla solo al pasar por encima. Lo que
  // sí se logra, y da esa sensación de "tarjeta levantada" durante todo el arrastre
  // (incluida cuando pasa sobre una mesa): aplicar el estilo al elemento real justo antes
  // de capturarlo como imagen de arrastre, y revertirlo de inmediato — la tarjeta que
  // queda en su lugar (bandeja o mesa) no se ve afectada, solo la imagen que viaja con el
  // cursor. El resaltado verde/rojo de la mesa al pasar por encima (isDropTarget /
  // isDropRejected en TableNode) ya cubre el feedback dinámico de "está sobre una mesa".
  const onGuestDragStart = useCallback(
    (guestId: string) => (e: React.DragEvent) => {
      e.dataTransfer.setData('application/x-invyta-plano-item', JSON.stringify({ kind: 'guest', id: guestId }));
      draggingGuestIdRef.current = guestId;

      const el = e.currentTarget as HTMLElement;
      const prevTransform = el.style.transform;
      const prevOutline = el.style.outline;
      const prevOutlineOffset = el.style.outlineOffset;
      el.style.transform = `${prevTransform} rotate(-12deg)`.trim();
      el.style.outline = '2px solid #111111';
      el.style.outlineOffset = '2px';
      try {
        e.dataTransfer.setDragImage(el, el.offsetWidth / 2, el.offsetHeight / 2);
      } catch {
        // setDragImage puede fallar en algún navegador/dispositivo raro; el arrastre sigue
        // funcionando igual, solo sin la imagen personalizada.
      }
      requestAnimationFrame(() => {
        el.style.transform = prevTransform;
        el.style.outline = prevOutline;
        el.style.outlineOffset = prevOutlineOffset;
      });
    },
    []
  );
  const onGuestTap = useCallback(
    (guestId: string) => () => {
      setArmedTrayItem((cur) => (cur?.kind === 'guest' && cur.id === guestId ? null : { kind: 'guest', id: guestId }));
    },
    []
  );
  const guestDragHandlers = useMemo(
    () => ({ isTouchDevice, onGuestDragStart, onGuestTap }),
    [isTouchDevice, onGuestDragStart, onGuestTap]
  );

  // Reconstruye los nodos cuando cambian los datos (mesas, objetos, ocupación, invitados,
  // selección, o el resaltado de arrastre). Solo entran al lienzo las mesas/objetos con
  // posX/posY: los demás viven en la bandeja.
  useEffect(() => {
    const draggableByMouse = !isCoarsePointerRef.current;
    const nextNodes: Node[] = [];

    const partiesByTable = new Map<string, PartyInput[]>();
    guests.forEach((guest) => {
      if (!guest.tableId) return;
      const list = partiesByTable.get(guest.tableId) || [];
      list.push({ id: guest.id, name: guest.name, seats: getSeatedGuestCount(guest) });
      partiesByTable.set(guest.tableId, list);
    });

    tables.forEach((table) => {
      if (table.posX == null || table.posY == null) return;
      const id = tableNodeId(table.id);
      const data: TableNodeData = {
        table,
        occupied: occupancyByTable.get(table.id) || 0,
        parties: partiesByTable.get(table.id) || [],
        armed: armedNodeId === id,
        isDropTarget: hoverTableId === id && hoverValid,
        isDropRejected: (hoverTableId === id && !hoverValid) || rejectedTableId === id,
        touchHandlers: makeTouchHandlers(id),
        guestDragHandlers,
      };
      nextNodes.push({
        id,
        type: 'table',
        position: { x: table.posX, y: table.posY },
        data,
        draggable: draggableByMouse,
      });
    });

    fixtures.forEach((fixture) => {
      if (fixture.posX == null || fixture.posY == null) return;
      const id = fixtureNodeId(fixture.id);
      const data: FixtureNodeData = {
        fixture,
        selected: selectedFixtureId === id,
        armed: armedNodeId === id,
        getZoom: reactFlow.getZoom,
        onSelect: () => setSelectedFixtureId((current) => (current === id ? null : id)),
        onResize: async (width, height) => {
          await venueFixtureService.updateFixture(fixture.id, { width, height });
          onFixtureUpdated({ ...fixture, width, height });
        },
        onRename: async (label) => {
          await venueFixtureService.updateFixture(fixture.id, { label });
          onFixtureUpdated({ ...fixture, label });
        },
        onDelete: async () => {
          await venueFixtureService.deleteFixture(fixture.id);
          onFixtureDeleted(fixture.id);
          track('fixture_deleted', {});
        },
        touchHandlers: makeTouchHandlers(id),
      };
      nextNodes.push({
        id,
        type: 'fixture',
        position: { x: fixture.posX, y: fixture.posY },
        data,
        draggable: draggableByMouse,
      });
    });

    setNodes(nextNodes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables, fixtures, guests, occupancyByTable, armedNodeId, selectedFixtureId, hoverTableId, hoverValid, rejectedTableId, makeTouchHandlers, guestDragHandlers]);

  const unplacedTables = useMemo(() => tables.filter((t) => t.posX == null || t.posY == null), [tables]);
  const unplacedFixtures = useMemo(() => fixtures.filter((f) => f.posX == null || f.posY == null), [fixtures]);
  const unassignedGuests = useMemo(() => guests.filter((g) => !g.tableId), [guests]);
  const filteredUnassignedGuests = useMemo(() => {
    const term = guestSearch.trim().toLowerCase();
    if (!term) return unassignedGuests;
    return unassignedGuests.filter((g) => g.name.toLowerCase().includes(term));
  }, [unassignedGuests, guestSearch]);

  const handleNodeDragStop: NodeDragHandler = (_event, node) => {
    persistNodePosition(node.id, node.position.x, node.position.y);
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    // Con un invitado armado (touch), tocar una mesa lo asigna ahí en vez de abrir el panel.
    if (armedTrayItem?.kind === 'guest' && node.type === 'table') {
      const id = node.id.slice('table:'.length);
      const table = tables.find((t) => t.id === id);
      if (table) handleAssignDrop(armedTrayItem.id, table);
      setArmedTrayItem(null);
      return;
    }
    // Tocar una mesa/objeto ya colocado mientras hay una mesa/objeto armado desde la
    // bandeja cancela el armado (el usuario claramente quiso otra cosa) en vez de dejarlo
    // colgado esperando un toque en el lienzo vacío.
    if (armedTrayItem) setArmedTrayItem(null);
    if (node.type === 'table') {
      const id = node.id.slice('table:'.length);
      const table = tables.find((t) => t.id === id);
      if (table) onSelectTable(table);
    } else if (node.type === 'fixture') {
      setSelectedFixtureId((current) => (current === node.id ? null : node.id));
    }
  };

  const clearDragState = () => {
    draggingGuestIdRef.current = null;
    setHoverTableId(null);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/x-invyta-plano-item');
    clearDragState();
    if (!raw) return;
    const item = JSON.parse(raw) as PlanoDragPayload;
    const flowPos = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    if (item.kind === 'table') {
      persistTablePosition(item.id, flowPos.x, flowPos.y);
      return;
    }
    if (item.kind === 'fixture') {
      persistFixturePosition(item.id, flowPos.x, flowPos.y);
      return;
    }
    const table = findTableUnderPoint(flowPos);
    if (table) handleAssignDrop(item.id, table);
  };

  // Mientras se arrastra un invitado (bandeja o un ícono ya colocado), resalta en vivo la
  // mesa bajo el puntero: verde si caben sus personas, rojo si no. El DragEvent nativo no
  // deja leer `dataTransfer.getData` durante `dragover` (solo en `drop`), así que se usa
  // `draggingGuestIdRef` — fijado en el propio `dragstart` — para saber qué se arrastra.
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    const guestId = draggingGuestIdRef.current;
    if (!guestId) return;
    const flowPos = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    const table = findTableUnderPoint(flowPos);
    if (!table) {
      setHoverTableId((cur) => (cur === null ? cur : null));
      return;
    }
    const guest = guestsRef.current.find((g) => g.id === guestId);
    const occupied = occupancyRef.current.get(table.id) || 0;
    const seats = guest ? getSeatedGuestCount(guest) : 0;
    const valid = guest?.tableId === table.id || occupied + seats <= table.capacity;
    const id = tableNodeId(table.id);
    setHoverTableId((cur) => (cur === id ? cur : id));
    setHoverValid((cur) => (cur === valid ? cur : valid));
  };

  // Toca-y-toca para touch (ver comentario de armedTrayItem): un toque sobre el lienzo
  // vacío mientras hay una mesa/objeto armado lo coloca ahí; un invitado armado no tiene
  // "colocar en el vacío" (solo se asigna tocando una mesa), así que solo se cancela.
  const handlePaneClick = (event: React.MouseEvent) => {
    if (armedTrayItem) {
      if (armedTrayItem.kind === 'guest') {
        setArmedTrayItem(null);
        return;
      }
      const flowPos = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      if (armedTrayItem.kind === 'table') persistTablePosition(armedTrayItem.id, flowPos.x, flowPos.y);
      else persistFixturePosition(armedTrayItem.id, flowPos.x, flowPos.y);
      setArmedTrayItem(null);
      return;
    }
    setSelectedFixtureId(null);
  };

  const trayEmpty = unplacedTables.length === 0 && unplacedFixtures.length === 0;

  const renderTrayChip = (kind: 'table' | 'fixture', id: string, label: string) => {
    const isArmed = armedTrayItem?.kind === kind && armedTrayItem.id === id;
    return (
      <div
        key={id}
        draggable={!isTouchDevice}
        onDragStart={
          isTouchDevice
            ? undefined
            : (e) => e.dataTransfer.setData('application/x-invyta-plano-item', JSON.stringify({ kind, id }))
        }
        onClick={
          isTouchDevice
            ? () => setArmedTrayItem((cur) => (cur?.kind === kind && cur.id === id ? null : { kind, id }))
            : undefined
        }
        className={`flex-shrink-0 text-[12px] font-bold rounded-lg px-2.5 py-2 whitespace-nowrap transition-colors ${
          isTouchDevice ? 'cursor-pointer' : 'cursor-grab'
        } ${
          isArmed
            ? 'bg-[#111111] border border-[#111111] text-white'
            : `border border-dashed border-[rgba(0,0,0,0.16)] bg-[#FAFAFA] ${kind === 'table' ? 'text-[#0A0A0A]' : 'text-[#3F3F46]'}`
        }`}
        title={isTouchDevice ? 'Toca para elegirla y luego toca el lienzo para colocarla' : 'Arrastra al lienzo para colocarla'}
      >
        {label}
      </div>
    );
  };

  // Spec 17 — chip de invitado sin mesa: arrastrar (o, en touch, armar y tocar una mesa)
  // lo asigna. Mismo patrón visual que renderTrayChip, con el conteo de personas visible.
  const renderGuestChip = (guest: FirebaseGuest) => {
    const isArmed = armedTrayItem?.kind === 'guest' && armedTrayItem.id === guest.id;
    const seats = getSeatedGuestCount(guest);
    return (
      <div
        key={guest.id}
        draggable={!isTouchDevice}
        onDragStart={isTouchDevice ? undefined : onGuestDragStart(guest.id)}
        onDragEnd={isTouchDevice ? undefined : clearDragState}
        onClick={isTouchDevice ? onGuestTap(guest.id) : undefined}
        className={`flex items-center gap-2 rounded-lg px-2.5 py-5 transition-colors ${
          isTouchDevice ? 'cursor-pointer' : 'cursor-grab'
        } ${isArmed ? 'bg-[#111111] border border-[#111111] text-white' : 'border border-[rgba(0,0,0,0.14)] bg-white text-[#0A0A0A]'}`}
        title={isTouchDevice ? 'Toca para elegirlo y luego toca una mesa para asignarlo' : 'Arrastra sobre una mesa para asignarlo'}
      >
        <span className="flex-1 min-w-0 text-[12.5px] font-bold truncate">{guest.name}</span>
        <span className={`flex-shrink-0 text-[11px] font-semibold ${isArmed ? 'text-white/75' : 'text-[#71717A]'}`}>
          {seats === 1 ? '1 persona' : `${seats} personas`}
        </span>
      </div>
    );
  };

  const trayItems = (
    <>
      {unplacedTables.map((t) => renderTrayChip('table', t.id, t.name))}
      {unplacedFixtures.map((f) => renderTrayChip('fixture', f.id, f.label))}
    </>
  );

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0">
      {/* Bandeja de mesas/objetos sin colocar (spec 13, reubicada tras spec 17): antes era
          un riel vertical a la izquierda del lienzo, lo que dejaba la pantalla muy apretada
          en escritorio (más aún con los íconos de invitados nuevos dentro de cada mesa).
          Ahora es siempre una franja horizontal arriba del lienzo, en todos los tamaños —
          libera todo el ancho para el Plano. Se renombra a "Mesas" (con "sin colocar" como
          aclaración secundaria, solo cuando hay algo pendiente) porque ahora vive junto al
          propio lienzo de mesas, no al lado de una bandeja de invitados con la que podía
          confundirse. Conserva el mismo estado `trayCollapsed` y el mismo contenido
          (`trayItems`, el botón "+ Objeto de salón") que ya tenía como riel vertical. */}
      <div className="flex-shrink-0 bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-4 py-2.5">
          <div className="min-w-0">
            <span className="text-[13px] font-bold uppercase tracking-wide text-[#71717A]">
              Mesas
              {!trayEmpty && <span className="normal-case font-semibold text-[#9CA3AF] ml-1.5">sin colocar</span>}
            </span>
            <p className="text-[13px] font-medium text-[#9CA3AF] leading-snug mt-0.5">
              Arrastra una mesa u objeto al lienzo para colocarlo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTrayCollapsed((c) => !c)}
            aria-label={trayCollapsed ? 'Expandir bandeja de mesas' : 'Colapsar bandeja de mesas'}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#3F3F46] hover:bg-[#FAFAFA] flex-shrink-0"
          >
            <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${trayCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <motion.div
          initial={false}
          animate={{ height: trayCollapsed ? 0 : 56 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="overflow-hidden border-t border-[rgba(0,0,0,0.06)]"
        >
          <div className="h-14 flex items-center gap-2.5 px-4">
            <div className="flex-1 flex items-center gap-2 overflow-x-auto min-w-0">
              {trayEmpty ? (
                <span className="text-[12px] text-[#9CA3AF] whitespace-nowrap">Nada pendiente por acomodar</span>
              ) : (
                trayItems
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowFixtureForm(true)}
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-[#FAFAFA] border border-[rgba(0,0,0,0.12)] rounded-lg px-3 py-2 text-[12px] font-bold text-[#3F3F46]"
            >
              <Plus className="w-3.5 h-3.5" /> Objeto de salón
            </button>
          </div>
        </motion.div>
      </div>

      <div className={`flex-1 flex ${isDesktop ? 'flex-row' : 'flex-col'} gap-3 min-h-0`}>
      <div
        ref={wrapperRef}
        // React Flow necesita que ESTE div tenga un alto resuelto y concreto — si no,
        // literalmente no dibuja nada adentro (ni mesas ni sus propios controles/minimapa,
        // como confirma su propio error "needs a width and a height", reactflow.dev/error#004).
        // En escritorio, el lienzo es hijo de una fila (flex-row): ahí el alto le llega gratis
        // por stretch del cross-axis, y flex-1 solo reparte ancho — por eso ese caso siempre
        // funcionó. En móvil, el lienzo es hijo de una COLUMNA (flex-col): ahí el alto sí
        // depende de flex-grow en el eje principal, y flex-grow anidado dos niveles dentro de
        // un contenedor que solo tiene min-height (no height fijo) es exactamente el caso que
        // los navegadores resuelven de forma inconsistente — en la práctica, terminaba en 0.
        // La solución robusta es no depender de esa cadena: en móvil se le da un alto propio
        // en vh (siempre concreto, no depende de ningún ancestro) en vez de flex-1.
        //
        // El lienzo es el panel principal donde se arrastran mesas e invitados, así que debe
        // verse grande siempre (mínimo 90% del alto de pantalla), aunque eso implique scroll
        // en la página. OJO: en móvil tiene que ser `h-[90vh]` (alto FIJO), no `min-h-[90vh]`
        // — un min-height sin height, dentro de esta cadena de flex-col anidados, volvió a
        // caer en el mismo caso de "alto no resuelto" que describe el comentario de arriba, y
        // React Flow dejaba de dibujar las mesas (mostraba su propio aviso en blanco en su
        // lugar). En escritorio sí puede ser min-height: el stretch del flex-row ya le da un
        // alto concreto de por sí, así que min-h solo actúa como piso cuando hay poco espacio.
        className={`relative rounded-xl overflow-hidden border border-[rgba(0,0,0,0.08)] ${styles.controlsOverride} ${
          isDesktop ? 'flex-1 min-h-[90vh]' : 'h-[90vh]'
        }`}
      >
        {/* Aviso del flujo "toca y toca" en touch: solo aparece con algo armado desde la
            bandeja, así que en escritorio (drag-and-drop nativo, sin cambios) nunca se ve. */}
        {armedTrayItem && (
          <div className="absolute z-20 left-1/2 -translate-x-1/2 top-3 bg-[#111111] text-white text-[12px] font-bold px-3.5 py-2 rounded-lg shadow-md whitespace-nowrap">
            {armedTrayItem.kind === 'guest' ? 'Toca una mesa para asignarlo' : 'Toca el lienzo para colocarla'}
          </div>
        )}

        {/* Leyenda de color de ocupación (spec 13): mismos colores que occupancyColor,
            para leer de un vistazo el borde de cada mesa sin abrir su detalle. */}
        <div className="absolute z-10 left-3 bottom-3 flex items-center gap-3.5 bg-white border border-[rgba(0,0,0,0.12)] rounded-lg px-3.5 py-2 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#D4D4D8]" />
            <span className="text-[10.5px] font-bold text-[#71717A]">Con espacio</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#15803D]" />
            <span className="text-[10.5px] font-bold text-[#71717A]">Completa</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-[#B91C1C]" />
            <span className="text-[10.5px] font-bold text-[#71717A]">Excedida</span>
          </span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChangeBase}
          onNodeDragStop={handleNodeDragStop}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          // Diagnóstico del zoom errático original: el handler de wheel que tenía antes
          // hacía zoom con CUALQUIER evento de rueda salvo que trajera ctrlKey=true. El
          // problema es que un gesto de dos dedos "arrastrando" en trackpad (mover el
          // lienzo) también llega como evento wheel sin ctrlKey — indistinguible de girar
          // la rueda de un mouse — así que ese gesto de mover terminaba haciendo zoom en
          // vez de desplazar. El pellizco real de dos dedos sí llega con ctrlKey=true (así
          // lo sintetizan los navegadores), y ese caso nunca entraba al handler, por eso se
          // sentía "normal" solo a veces.
          //
          // Ahora se apoya en la propia distinción de react-flow entre ambos gestos:
          // - zoomOnPinch: pellizco de dos dedos (o ctrl+rueda) SÍ hace zoom.
          // - panOnScroll: el resto de gestos de rueda/trackpad (incluido arrastrar con dos
          //   dedos) solo desplazan el lienzo, nunca hacen zoom.
          // - zoomOnScroll/zoomOnDoubleClick siguen apagados: girar la rueda de un mouse o
          //   hacer doble clic no deben cambiar el zoom, solo los botones +/- o el pellizco.
          zoomOnScroll={false}
          zoomOnPinch
          zoomOnDoubleClick={false}
          panOnScroll
          panOnScrollMode={PanOnScrollMode.Free}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background gap={22} color="rgba(0,0,0,0.06)" />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap position="top-right" pannable zoomable={false} style={{ width: 140, height: 86 }} />
        </ReactFlow>
      </div>

      {/* Spec 17 — bandeja "Invitados sin mesa": separada de "Sin colocar" (son conceptos
          distintos), mismo patrón visual colapsable, siempre visible aunque esté vacía,
          espejada a la derecha del lienzo en escritorio y apilada al final en móvil. */}
      <div className={`relative flex-shrink-0 ${isDesktop ? '' : 'w-full mt-5'}`}>
        <motion.div
          initial={false}
          animate={isDesktop ? { width: guestTrayCollapsed ? 40 : 220 } : { height: guestTrayCollapsed ? 40 : 220 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className={`relative bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden ${
            isDesktop ? 'h-full' : 'w-full'
          }`}
        >
          <motion.div
            animate={{ opacity: guestTrayCollapsed ? 0 : 1 }}
            transition={{ duration: guestTrayCollapsed ? 0.1 : 0.2, delay: guestTrayCollapsed ? 0 : 0.08 }}
            className={isDesktop ? 'w-[220px] h-full flex flex-col p-3' : 'h-[220px] w-full flex flex-col p-3'}
          >
            <div className="mb-2 flex-shrink-0">
              <div className="text-[13px] font-bold uppercase tracking-wide text-[#71717A]">
                Invitados sin mesa ({unassignedGuests.length})
              </div>
              <p className="text-[13px] font-medium text-[#9CA3AF] leading-snug mt-0.5 mb-2">
                Arrastra a un invitado hacia una mesa para asignarlo.
              </p>
            </div>
            <div className="relative flex-shrink-0 mb-2">
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={guestSearch}
                onChange={(e) => setGuestSearch(e.target.value)}
                placeholder="Buscar invitado"
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-[rgba(0,0,0,0.14)] text-[12px] text-[#0A0A0A] bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
              />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1.5">
              {unassignedGuests.length === 0 ? (
                <p className="text-[12px] text-[#9CA3AF] leading-snug">Todos los invitados ya tienen mesa.</p>
              ) : filteredUnassignedGuests.length === 0 ? (
                <p className="text-[12px] text-[#9CA3AF] leading-snug">Sin resultados.</p>
              ) : (
                filteredUnassignedGuests.map(renderGuestChip)
              )}
            </div>
          </motion.div>

          <motion.div
            animate={{ opacity: guestTrayCollapsed ? 1 : 0 }}
            transition={{ duration: guestTrayCollapsed ? 0.2 : 0.1, delay: guestTrayCollapsed ? 0.08 : 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span
              className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#9CA3AF]"
              style={isDesktop ? { writingMode: 'vertical-rl', transform: 'rotate(180deg)' } : undefined}
            >
              Invitados
            </span>
          </motion.div>
        </motion.div>

        <button
          type="button"
          onClick={() => setGuestTrayCollapsed((c) => !c)}
          aria-label={guestTrayCollapsed ? 'Expandir bandeja de invitados sin mesa' : 'Colapsar bandeja de invitados sin mesa'}
          className={
            // Antes quedaba a top-3 (a la misma altura que el texto del encabezado, y
            // apenas superpuesto al borde del panel): se veía pegado tanto a la letra como
            // al panel. Ahora va en la esquina, completamente por fuera de ambos bordes.
            isDesktop
              ? 'absolute -left-3 -top-3 z-10 w-6 h-6 rounded-full bg-white border border-[rgba(0,0,0,0.14)] shadow-sm flex items-center justify-center text-[#3F3F46] hover:text-[#0A0A0A]'
              : 'absolute left-1/2 -translate-x-1/2 -top-4 z-10 w-6 h-6 rounded-full bg-white border border-[rgba(0,0,0,0.14)] shadow-sm flex items-center justify-center text-[#3F3F46] hover:text-[#0A0A0A]'
          }
        >
          {isDesktop ? (
            <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${guestTrayCollapsed ? '' : 'rotate-180'}`} />
          ) : (
            <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${guestTrayCollapsed ? 'rotate-180' : ''}`} />
          )}
        </button>
      </div>
      </div>

      {showFixtureForm && (
        <FixtureFormModal
          onClose={() => setShowFixtureForm(false)}
          onSubmit={async (values: FixtureFormValues) => {
            const id = await venueFixtureService.createFixture({
              weddingId,
              type: values.type,
              label: values.label,
              width: values.width,
              height: values.height,
            });
            onFixtureCreated({
              id,
              weddingId,
              type: values.type,
              label: values.label,
              width: values.width,
              height: values.height,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            track('fixture_created', {});
            setShowFixtureForm(false);
          }}
        />
      )}
    </div>
  );
}

export default function PlanoCanvas(props: Props) {
  return (
    <ReactFlowProvider>
      <PlanoCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
