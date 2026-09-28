'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  useReactFlow,
  useNodesState,
  Controls,
  MiniMap,
  Background,
  type Node,
  type NodeTypes,
  type NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronUp, Plus } from 'lucide-react';
import { FirebaseTable, FirebaseVenueFixture } from '../../../src/types/wedding';
import { tableService } from '../../../services/tableService';
import { venueFixtureService } from '../../../services/venueFixtureService';
import { track } from '../../../lib/analytics/client';
import TableNode, { type TableNodeData } from './nodes/TableNode';
import FixtureNode, { type FixtureNodeData } from './nodes/FixtureNode';
import FixtureFormModal, { type FixtureFormValues } from './FixtureFormModal';
import styles from './plano-overrides.module.css';

const nodeTypes: NodeTypes = { table: TableNode, fixture: FixtureNode };

const tableNodeId = (id: string) => `table:${id}`;
const fixtureNodeId = (id: string) => `fixture:${id}`;

interface Props {
  weddingId: string;
  tables: FirebaseTable[];
  fixtures: FirebaseVenueFixture[];
  occupancyByTable: Map<string, number>;
  onSelectTable: (table: FirebaseTable) => void;
  onTableUpdated: (table: FirebaseTable) => void;
  onFixtureCreated: (fixture: FirebaseVenueFixture) => void;
  onFixtureUpdated: (fixture: FirebaseVenueFixture) => void;
  onFixtureDeleted: (fixtureId: string) => void;
}

function PlanoCanvasInner({
  weddingId,
  tables,
  fixtures,
  occupancyByTable,
  onSelectTable,
  onTableUpdated,
  onFixtureCreated,
  onFixtureUpdated,
  onFixtureDeleted,
}: Props) {
  const [nodes, setNodes, onNodesChangeBase] = useNodesState([]);
  const [armedNodeId, setArmedNodeId] = useState<string | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);
  const [showFixtureForm, setShowFixtureForm] = useState(false);
  // Flujo "tocar y tocar" para colocar desde la bandeja en touch (spec 13, seguimiento):
  // el drag-and-drop nativo (draggable/onDragStart/onDrop) nunca dispara con el dedo en
  // navegadores móviles, así que en escritorio se deja intacto y en touch se reemplaza
  // por tocar el chip de la bandeja para "armarlo" y luego tocar el lienzo para soltarlo.
  const [armedTrayItem, setArmedTrayItem] = useState<{ kind: 'table' | 'fixture'; id: string } | null>(null);
  // Colapso de la bandeja "Sin colocar" (spec 13): solo de cliente, nunca persiste —
  // siempre arranca expandida, igual criterio que el Plano ya usa para no guardar zoom/scroll.
  const [trayCollapsed, setTrayCollapsed] = useState(false);
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

  // Si el ítem armado deja de estar sin colocar (se colocó por otro medio, o se borró),
  // se desarma solo para no quedar apuntando a algo que ya no está en la bandeja.
  useEffect(() => {
    if (!armedTrayItem) return;
    const stillUnplaced =
      armedTrayItem.kind === 'table'
        ? tables.some((t) => t.id === armedTrayItem.id && (t.posX == null || t.posY == null))
        : fixtures.some((f) => f.id === armedTrayItem.id && (f.posX == null || f.posY == null));
    if (!stillUnplaced) setArmedTrayItem(null);
  }, [armedTrayItem, tables, fixtures]);

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

  const persistTablePosition = useCallback(
    async (id: string, x: number, y: number) => {
      await tableService.updateTablePosition(id, x, y);
      const current = tables.find((t) => t.id === id);
      if (current) onTableUpdated({ ...current, posX: x, posY: y });
    },
    [tables, onTableUpdated]
  );

  const persistFixturePosition = useCallback(
    async (id: string, x: number, y: number) => {
      await venueFixtureService.updateFixturePosition(id, x, y);
      const current = fixtures.find((f) => f.id === id);
      if (current) onFixtureUpdated({ ...current, posX: x, posY: y });
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

  // Reconstruye los nodos cuando cambian los datos (mesas, objetos, ocupación, selección).
  // Solo entran al lienzo las mesas/objetos con posX/posY: los demás viven en la bandeja.
  useEffect(() => {
    const draggableByMouse = !isCoarsePointerRef.current;
    const nextNodes: Node[] = [];

    tables.forEach((table) => {
      if (table.posX == null || table.posY == null) return;
      const id = tableNodeId(table.id);
      const data: TableNodeData = {
        table,
        occupied: occupancyByTable.get(table.id) || 0,
        armed: armedNodeId === id,
        touchHandlers: makeTouchHandlers(id),
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
  }, [tables, fixtures, occupancyByTable, armedNodeId, selectedFixtureId, makeTouchHandlers]);

  const unplacedTables = useMemo(() => tables.filter((t) => t.posX == null || t.posY == null), [tables]);
  const unplacedFixtures = useMemo(() => fixtures.filter((f) => f.posX == null || f.posY == null), [fixtures]);

  const handleNodeDragStop: NodeDragHandler = (_event, node) => {
    persistNodePosition(node.id, node.position.x, node.position.y);
  };

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    // Tocar una mesa/objeto ya colocado mientras hay algo armado desde la bandeja
    // cancela el armado (el usuario claramente quiso otra cosa) en vez de dejarlo
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

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const raw = event.dataTransfer.getData('application/x-invyta-plano-item');
    if (!raw) return;
    const item = JSON.parse(raw) as { kind: 'table' | 'fixture'; id: string };
    const flowPos = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    if (item.kind === 'table') persistTablePosition(item.id, flowPos.x, flowPos.y);
    else persistFixturePosition(item.id, flowPos.x, flowPos.y);
  };

  // Toca-y-toca para touch (ver comentario de armedTrayItem): un toque sobre el lienzo
  // vacío mientras hay un ítem armado lo coloca ahí; sin nada armado, se comporta como
  // antes (deseleccionar el objeto de salón activo).
  const handlePaneClick = (event: React.MouseEvent) => {
    if (armedTrayItem) {
      const flowPos = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      if (armedTrayItem.kind === 'table') persistTablePosition(armedTrayItem.id, flowPos.x, flowPos.y);
      else persistFixturePosition(armedTrayItem.id, flowPos.x, flowPos.y);
      setArmedTrayItem(null);
      return;
    }
    setSelectedFixtureId(null);
  };

  // Zoom por rueda/touchpad más rápido que el default de react-flow (se sentía muy lento,
  // sobre todo con touchpad). El pellizco real de dos dedos sigue viniendo como wheel con
  // ctrlKey=true en la mayoría de navegadores: ese caso se deja intacto para zoomOnPinch.
  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      if (event.ctrlKey) return;
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;

      const { zoom } = reactFlow.getViewport();
      const ZOOM_SENSITIVITY = 0.0035;
      const factor = Math.exp(-event.deltaY * ZOOM_SENSITIVITY);
      const nextZoom = Math.min(2.5, Math.max(0.2, zoom * factor));

      const flowPoint = reactFlow.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      reactFlow.setViewport(
        { x: mouseX - flowPoint.x * nextZoom, y: mouseY - flowPoint.y * nextZoom, zoom: nextZoom },
        { duration: 0 }
      );
    },
    [reactFlow]
  );

  const trayEmpty = unplacedTables.length === 0 && unplacedFixtures.length === 0;
  const isTouchDevice = isCoarsePointerRef.current;

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

  const trayItems = (
    <>
      {unplacedTables.map((t) => renderTrayChip('table', t.id, t.name))}
      {unplacedFixtures.map((f) => renderTrayChip('fixture', f.id, f.label))}
    </>
  );

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-3 min-h-0">
      {/* Bandeja de mesas/objetos sin colocar (spec 13): siempre visible, aunque esté
          vacía, con una flecha para colapsarla. En escritorio es un riel vertical a la
          izquierda (se anima el ancho); en móvil se apila arriba del lienzo como una
          franja horizontal con scroll (se anima el alto), para no quitarle ancho al
          lienzo en pantallas angostas. El contenido real vive en un tamaño fijo para no
          reacomodarse durante la animación; el contenedor intermedio, animado por
          framer-motion, lo recorta con overflow-hidden al colapsar. La flecha vive en el
          wrapper externo (sin overflow-hidden) para no quedar cortada por ese recorte, y
          al colapsar se ve una etiqueta "Sin colocar" en vez de un espacio vacío. */}
      <div className={`relative flex-shrink-0 ${isDesktop ? '' : 'w-full mb-5'}`}>
        <motion.div
          initial={false}
          animate={isDesktop ? { width: trayCollapsed ? 40 : 190 } : { height: trayCollapsed ? 40 : 64 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className={`relative bg-white border border-[rgba(0,0,0,0.08)] rounded-xl overflow-hidden ${
            isDesktop ? 'h-full' : 'w-full'
          }`}
        >
          {isDesktop ? (
            <motion.div
              animate={{ opacity: trayCollapsed ? 0 : 1 }}
              transition={{ duration: trayCollapsed ? 0.1 : 0.2, delay: trayCollapsed ? 0 : 0.08 }}
              className="w-[190px] h-full p-3 overflow-y-auto"
            >
              <div className="text-[11px] font-bold uppercase tracking-wide text-[#71717A] mb-2">Sin colocar</div>
              {trayEmpty ? (
                <p className="text-[12px] text-[#9CA3AF] leading-snug">
                  Todavía no hay mesas ni objetos sin colocar. Lo que agregues sin posición aparece aquí.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5">{trayItems}</div>
              )}
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: trayCollapsed ? 0 : 1 }}
              transition={{ duration: trayCollapsed ? 0.1 : 0.2, delay: trayCollapsed ? 0 : 0.08 }}
              className="h-[64px] w-full flex items-center gap-2 px-3 overflow-x-auto"
            >
              <span className="flex-shrink-0 text-[10px] font-bold uppercase tracking-wide text-[#71717A]">
                Sin colocar
              </span>
              {trayEmpty ? (
                <span className="text-[11.5px] text-[#9CA3AF] whitespace-nowrap">Nada pendiente por acomodar</span>
              ) : (
                <div className="flex items-center gap-1.5">{trayItems}</div>
              )}
            </motion.div>
          )}

          {/* Etiqueta que se ve al colapsar, en vez de dejar la tira vacía. */}
          <motion.div
            animate={{ opacity: trayCollapsed ? 1 : 0 }}
            transition={{ duration: trayCollapsed ? 0.2 : 0.1, delay: trayCollapsed ? 0.08 : 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <span
              className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#9CA3AF]"
              style={isDesktop ? { writingMode: 'vertical-rl', transform: 'rotate(180deg)' } : undefined}
            >
              Sin colocar
            </span>
          </motion.div>
        </motion.div>

        <button
          type="button"
          onClick={() => setTrayCollapsed((c) => !c)}
          aria-label={trayCollapsed ? 'Expandir bandeja de sin colocar' : 'Colapsar bandeja de sin colocar'}
          className={
            isDesktop
              ? 'absolute -right-3 top-3 z-10 w-6 h-6 rounded-full bg-white border border-[rgba(0,0,0,0.14)] shadow-sm flex items-center justify-center text-[#3F3F46] hover:text-[#0A0A0A]'
              : 'absolute left-1/2 -translate-x-1/2 -bottom-4 z-10 w-6 h-6 rounded-full bg-white border border-[rgba(0,0,0,0.14)] shadow-sm flex items-center justify-center text-[#3F3F46] hover:text-[#0A0A0A]'
          }
        >
          {isDesktop ? (
            <ChevronLeft className={`w-3.5 h-3.5 transition-transform duration-200 ${trayCollapsed ? 'rotate-180' : ''}`} />
          ) : (
            <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${trayCollapsed ? 'rotate-180' : ''}`} />
          )}
        </button>
      </div>

      <div
        ref={wrapperRef}
        onWheel={handleWheel}
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
        className={`relative rounded-xl overflow-hidden border border-[rgba(0,0,0,0.08)] ${styles.controlsOverride} ${
          isDesktop ? 'flex-1 min-h-0' : 'h-[60vh]'
        }`}
      >
        <button
          type="button"
          onClick={() => setShowFixtureForm(true)}
          className="absolute z-10 left-3 top-3 inline-flex items-center gap-1.5 bg-white border border-[rgba(0,0,0,0.12)] rounded-lg px-3 py-2 text-[12px] font-bold text-[#3F3F46] shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Objeto de salón
        </button>

        {/* Aviso del flujo "toca y toca" en touch: solo aparece con algo armado desde la
            bandeja, así que en escritorio (drag-and-drop nativo, sin cambios) nunca se ve. */}
        {armedTrayItem && (
          <div className="absolute z-20 left-1/2 -translate-x-1/2 top-3 bg-[#111111] text-white text-[12px] font-bold px-3.5 py-2 rounded-lg shadow-md whitespace-nowrap">
            Toca el lienzo para colocarla
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
          onDragOver={(e) => e.preventDefault()}
          zoomOnScroll={false}
          fitView
          minZoom={0.2}
          maxZoom={2.5}
        >
          <Background gap={22} color="rgba(0,0,0,0.06)" />
          <Controls position="bottom-right" showInteractive={false} />
          <MiniMap position="top-right" pannable zoomable style={{ width: 140, height: 86 }} />
        </ReactFlow>
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
