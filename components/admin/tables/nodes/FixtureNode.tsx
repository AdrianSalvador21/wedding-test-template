'use client';

import React, { useRef, useState } from 'react';
import type { NodeProps } from 'reactflow';
import { FirebaseVenueFixture } from '../../../../src/types/wedding';

export interface FixtureNodeData {
  fixture: FirebaseVenueFixture;
  selected: boolean;
  armed: boolean;
  getZoom: () => number;
  onSelect: () => void;
  onResize: (width: number, height: number) => void;
  onRename: (label: string) => void;
  onDelete: () => void;
  touchHandlers?: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
}

type Corner = 'nw' | 'ne' | 'sw' | 'se';

export default function FixtureNode({ data }: NodeProps<FixtureNodeData>) {
  const { fixture, selected, armed, getZoom, onSelect, onResize, onRename, onDelete, touchHandlers } = data;
  const [size, setSize] = useState({ width: fixture.width, height: fixture.height });
  const [isRenaming, setIsRenaming] = useState(false);
  const [labelDraft, setLabelDraft] = useState(fixture.label);
  const dragRef = useRef<{ corner: Corner; startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Mantiene el tamaño local sincronizado si cambia desde fuera (otra pestaña, etc.)
  React.useEffect(() => {
    setSize({ width: fixture.width, height: fixture.height });
  }, [fixture.width, fixture.height]);

  const startResize = (corner: Corner) => (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    dragRef.current = { corner, startX: e.clientX, startY: e.clientY, startW: size.width, startH: size.height };

    const onMove = (ev: MouseEvent) => {
      const st = dragRef.current;
      if (!st) return;
      const zoom = getZoom() || 1;
      const dx = (ev.clientX - st.startX) / zoom;
      const dy = (ev.clientY - st.startY) / zoom;
      const grows = { nw: [-dx, -dy], ne: [dx, -dy], sw: [-dx, dy], se: [dx, dy] } as const;
      const [gw, gh] = grows[st.corner];
      setSize({ width: Math.max(60, Math.round(st.startW + gw)), height: Math.max(60, Math.round(st.startH + gh)) });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      const st = dragRef.current;
      dragRef.current = null;
      if (st) {
        setSize((current) => {
          onResize(current.width, current.height);
          return current;
        });
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // `nodrag`: clase especial de react-flow — su detección de arrastre de nodo (XYDrag)
  // escucha pointerdown directo en el DOM y busca esta clase antes de decidir si arranca
  // el drag, sin pasar por la burbuja de eventos de React, así que un simple
  // e.stopPropagation() en el onMouseDown no alcanzaba para evitar que la mesa/objeto se
  // moviera en vez de redimensionarse.
  const handleClass =
    'nodrag absolute w-3.5 h-3.5 rounded bg-white border-2 border-[#111111] z-10';

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onTouchStart={touchHandlers?.onTouchStart}
      onTouchMove={touchHandlers?.onTouchMove}
      onTouchEnd={touchHandlers?.onTouchEnd}
      // `nopan`: ver TableNode — sin esto el pan del lienzo gana el toque en móvil.
      className="nopan relative flex items-center justify-center select-none"
      style={{
        width: size.width,
        height: size.height,
        border: `2px dashed ${selected || armed ? '#111111' : 'rgba(0,0,0,0.22)'}`,
        borderRadius: 10,
        background: 'rgba(17,17,17,0.03)',
        transform: armed ? 'scale(1.05)' : 'scale(1)',
        boxShadow: armed ? '0 10px 20px rgba(0,0,0,0.18)' : undefined,
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {isRenaming ? (
        <input
          autoFocus
          value={labelDraft}
          onChange={(e) => setLabelDraft(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={() => {
            setIsRenaming(false);
            if (labelDraft.trim() && labelDraft !== fixture.label) onRename(labelDraft.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="nodrag text-[11px] font-bold text-center bg-white border border-[rgba(0,0,0,0.2)] rounded px-1.5 py-0.5 w-[90%]"
        />
      ) : (
        <span className="text-[11px] font-bold uppercase tracking-wide text-[#3F3F46] px-2 text-center">
          {fixture.label}
        </span>
      )}

      {selected && (
        <>
          <div className={handleClass} style={{ left: -7, top: -7, cursor: 'nwse-resize' }} onMouseDown={startResize('nw')} />
          <div className={handleClass} style={{ right: -7, top: -7, cursor: 'nesw-resize' }} onMouseDown={startResize('ne')} />
          <div className={handleClass} style={{ left: -7, bottom: -7, cursor: 'nesw-resize' }} onMouseDown={startResize('sw')} />
          <div className={handleClass} style={{ right: -7, bottom: -7, cursor: 'nwse-resize' }} onMouseDown={startResize('se')} />

          <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 flex gap-1.5 whitespace-nowrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsRenaming(true);
              }}
              className="nodrag text-[9px] font-bold bg-white border border-[rgba(0,0,0,0.12)] rounded px-1.5 py-0.5 text-[#3F3F46]"
            >
              Renombrar
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="nodrag text-[9px] font-bold bg-white border border-[rgba(0,0,0,0.12)] rounded px-1.5 py-0.5 text-[#B91C1C]"
            >
              Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
