'use client';

import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { FirebaseTable, FirebaseVenueFixture } from '../../src/types/wedding';

// Spec 32 — plano del salón de solo lectura para el pase del invitado. SVG ligero (sin reactflow):
// usa las mismas coordenadas que el Plano del panel (posX/posY = esquina superior izquierda) y la
// misma silueta por forma que SHAPE_GEOMETRY de components/admin/tables/nodes/TableNode.tsx.
//
// Salones con muchas mesas: si al meter todo el salón en el ancho disponible una mesa mediría menos
// de MIN_TABLE_PX, el plano abre "Cerca de tu mesa" (encuadre en las mesas de la invitación) y
// aparece el control "Cerca de tu mesa / Todo el salón". Con pocas mesas no hay control.

const GEOMETRY: Record<NonNullable<FirebaseTable['shape']>, { width: number; height: number; radius: number }> = {
  round: { width: 64, height: 64, radius: 32 },
  square: { width: 64, height: 64, radius: 10 },
  rectangular: { width: 94, height: 56, radius: 10 },
  imperial: { width: 122, height: 42, radius: 21 },
};

const TABLE_UNITS = 64; // lado de una mesa redonda/cuadrada en unidades del Plano
const MIN_TABLE_PX = 36; // por debajo de esto, el salón completo ya no se lee
const NEAR_TABLE_PX = 46; // tamaño de una mesa en "Cerca de tu mesa"
const PAD = 28;

export interface FloorPlanTheme {
  frame?: string; // borde del salón; ausente = sin marco
  frameFill?: string;
  fixtureFill: string;
  fixtureStroke: string;
  fixtureText: string;
  fixtureRadius?: number;
  labelFont: string;
  tableFill: string;
  tableStroke: string;
  tableText: string;
  numberFont: string;
  numberItalic?: boolean;
  highlightFill: string;
  highlightText: string;
  highlightRing: string;
  ringDash?: string;
  youLabel: string; // color del rótulo "TU MESA"; '' = sin rótulo (Moderno usa leyenda aparte)
  // Control "Cerca de tu mesa / Todo el salón"
  segTrack: CSSProperties;
  segActive: CSSProperties;
  segIdle: CSSProperties;
  hint: CSSProperties;
}

export interface FloorPlanLabels {
  aria: string;
  you: string;
  near: string;
  whole: string;
  nearHint: string;
  wholeHint: string;
}

// "Mesa 7" → "7"; cualquier otro nombre se muestra completo, con letra más chica si es largo.
function shortLabel(name: string): string {
  const match = /^mesa\s*(\d+)$/i.exec(name.trim());
  return match ? match[1] : name.trim();
}

export function hasPlacedTables(tables: FirebaseTable[], ids: string[]): boolean {
  return tables.some((t) => ids.includes(t.id) && t.posX != null && t.posY != null);
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function bounds(boxes: Box[]) {
  const minX = Math.min(...boxes.map((b) => b.x));
  const minY = Math.min(...boxes.map((b) => b.y));
  const maxX = Math.max(...boxes.map((b) => b.x + b.w));
  const maxY = Math.max(...boxes.map((b) => b.y + b.h));
  return { minX, minY, maxX, maxY };
}

export default function EventDayFloorPlan({
  tables,
  fixtures,
  highlightedTableIds,
  theme,
  labels,
}: {
  tables: FirebaseTable[];
  fixtures: FirebaseVenueFixture[];
  highlightedTableIds: string[];
  theme: FloorPlanTheme;
  labels: FloorPlanLabels;
}) {
  // Ancho real disponible: decide si el salón completo se lee o hace falta acercar.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setContainerWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [view, setView] = useState<'near' | 'whole' | null>(null); // null = la que toque por tamaño
  const reduce = useReducedMotion();

  const placedTables = tables.filter((t) => t.posX != null && t.posY != null);
  const placedFixtures = fixtures.filter((f) => f.posX != null && f.posY != null);
  if (placedTables.length === 0) return null;

  const tableBox = (t: FirebaseTable): Box => {
    const g = GEOMETRY[t.shape || 'round'];
    return { x: t.posX as number, y: t.posY as number, w: g.width, h: g.height };
  };
  const all = bounds([
    ...placedTables.map(tableBox),
    ...placedFixtures.map((f) => ({ x: f.posX as number, y: f.posY as number, w: f.width, h: f.height })),
  ]);
  const baseW = all.maxX - all.minX + PAD * 2;
  // Espacio arriba para el rótulo "TU MESA" (~20 px de pantalla a la escala del salón completo).
  const labelRoom = containerWidth > 0 ? (20 * baseW) / containerWidth : 20;
  const whole = {
    x: all.minX - PAD,
    y: all.minY - PAD - labelRoom,
    w: baseW,
    h: all.maxY - all.minY + PAD * 2 + labelRoom,
  };

  const highlighted = new Set(highlightedTableIds);
  const ownTables = placedTables.filter((t) => highlighted.has(t.id));
  const firstHighlighted = ownTables[0];

  // ¿Se lee el salón completo en este ancho?
  const wholeTablePx = containerWidth > 0 ? (TABLE_UNITS * containerWidth) / whole.w : Infinity;
  const crowded = ownTables.length > 0 && wholeTablePx < MIN_TABLE_PX;
  const activeView = crowded ? view ?? 'near' : 'whole';

  // "Cerca de tu mesa": encuadre casi cuadrado centrado en las mesas de la invitación (todas, si
  // hay personas en varias), del tamaño que deja cada mesa en ~NEAR_TABLE_PX, sin salirse del salón.
  let vb = whole;
  if (activeView === 'near' && firstHighlighted) {
    const own = bounds(ownTables.map(tableBox));
    const targetW = (TABLE_UNITS * containerWidth) / NEAR_TABLE_PX;
    const w = Math.min(whole.w, Math.max(targetW, own.maxX - own.minX + PAD * 4));
    const h = Math.min(whole.h, Math.max(w * 0.95, own.maxY - own.minY + PAD * 4 + 40));
    const cx = (own.minX + own.maxX) / 2;
    const cy = (own.minY + own.maxY) / 2;
    const x = Math.min(Math.max(cx - w / 2, whole.x), whole.x + whole.w - w);
    const y = Math.min(Math.max(cy - h / 2, whole.y), whole.y + whole.h - h);
    vb = { x, y, w, h };
  }

  // Textos en px de pantalla, convertidos a unidades del plano según la escala de la vista.
  const scale = containerWidth > 0 ? containerWidth / vb.w : 1;
  const px = (value: number) => value / scale;

  return (
    <div ref={wrapRef} className="flex w-full flex-col gap-3">
      {crowded && (
        <div role="group" aria-label={labels.aria} className="grid grid-cols-2 gap-1 p-1" style={theme.segTrack}>
          {(['near', 'whole'] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={activeView === v}
              data-track-action={v === 'near' ? 'event_day_plan_near' : 'event_day_plan_whole'}
              onClick={() => setView(v)}
              className="h-10 cursor-pointer border-0"
              style={activeView === v ? theme.segActive : theme.segIdle}
            >
              {v === 'near' ? labels.near : labels.whole}
            </button>
          ))}
        </div>
      )}
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        role="img"
        aria-label={labels.aria}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      >
        {theme.frame && (
          <rect x={whole.x + 1} y={whole.y + 1} width={whole.w - 2} height={whole.h - 2} fill={theme.frameFill || 'none'} stroke={theme.frame} vectorEffect="non-scaling-stroke" />
        )}

        {placedFixtures.map((f) => {
          const label = (f.label || '').toUpperCase();
          const fit = (f.width - 10) / Math.max(label.length, 1) / 0.68;
          const fontSize = Math.min(fit, px(10), 16);
          return (
            <g key={f.id}>
              <rect
                x={f.posX}
                y={f.posY}
                width={f.width}
                height={f.height}
                rx={theme.fixtureRadius ?? 0}
                fill={theme.fixtureFill}
                stroke={theme.fixtureStroke}
                strokeDasharray={f.type === 'dance_floor' ? '4 4' : undefined}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={(f.posX as number) + f.width / 2}
                y={(f.posY as number) + f.height / 2 + fontSize * 0.35}
                textAnchor="middle"
                fontFamily={theme.labelFont}
                fontSize={fontSize}
                letterSpacing={fontSize * 0.12}
                fill={theme.fixtureText}
              >
                {label}
              </text>
            </g>
          );
        })}

        {placedTables.map((t) => {
          const g = GEOMETRY[t.shape || 'round'];
          const own = highlighted.has(t.id);
          const x = t.posX as number;
          const y = t.posY as number;
          const label = shortLabel(t.name);
          const fontSize = label.length <= 3 ? 24 : Math.max(9, Math.min(14, (g.width - 8) / label.length / 0.55));
          return (
            <g key={t.id} opacity={own ? 1 : 0.6}>
              {own && (
                // Pulso único al abrir el pase: el anillo llega desde afuera para señalar su mesa.
                <motion.rect
                  initial={reduce ? false : { opacity: 0, scale: 1.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  x={x - 7}
                  y={y - 7}
                  width={g.width + 14}
                  height={g.height + 14}
                  rx={g.radius + 7}
                  fill="none"
                  stroke={theme.highlightRing}
                  strokeWidth={1.5}
                  strokeDasharray={theme.ringDash}
                  vectorEffect="non-scaling-stroke"
                />
              )}
              <rect
                x={x}
                y={y}
                width={g.width}
                height={g.height}
                rx={g.radius}
                fill={own ? theme.highlightFill : theme.tableFill}
                stroke={own ? theme.highlightFill : theme.tableStroke}
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
              <text
                x={x + g.width / 2}
                y={y + g.height / 2 + fontSize * 0.34}
                textAnchor="middle"
                fontFamily={theme.numberFont}
                fontStyle={theme.numberItalic ? 'italic' : undefined}
                fontWeight={own ? 600 : 400}
                fontSize={fontSize}
                fill={own ? theme.highlightText : theme.tableText}
              >
                {label}
              </text>
            </g>
          );
        })}

        {firstHighlighted && theme.youLabel && (
          <text
            x={(firstHighlighted.posX as number) + GEOMETRY[firstHighlighted.shape || 'round'].width / 2}
            y={(firstHighlighted.posY as number) - 7 - px(6)}
            textAnchor="middle"
            fontFamily={theme.labelFont}
            fontSize={px(11)}
            letterSpacing={px(1.6)}
            fill={theme.youLabel}
          >
            {labels.you.toUpperCase()}
          </text>
        )}
      </svg>
      {crowded && (
        <p className="m-0" style={theme.hint}>
          {activeView === 'near' ? labels.nearHint : labels.wholeHint}
        </p>
      )}
    </div>
  );
}
