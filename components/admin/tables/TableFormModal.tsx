'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FirebaseTable } from '../../../src/types/wedding';
import { displayFont, manrope } from '../../admin/ui';

export interface TableFormValues {
  name: string;
  capacity: number;
  shape: NonNullable<FirebaseTable['shape']>;
}

const SHAPES: { value: TableFormValues['shape']; label: string }[] = [
  { value: 'round', label: 'Redonda' },
  { value: 'square', label: 'Cuadrada' },
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'imperial', label: 'Imperial' },
];

// Silueta a escala de cada forma, para que se vea la diferencia antes de elegir.
function ShapePreview({ shape }: { shape: TableFormValues['shape'] }) {
  const common = { fill: '#FFFFFF', stroke: '#111111', strokeWidth: 2 } as const;
  return (
    <svg width="100%" height="72" viewBox="0 0 220 72" className="block">
      {shape === 'round' && <circle cx={110} cy={36} r={30} {...common} />}
      {shape === 'square' && <rect x={80} y={6} width={60} height={60} rx={4} {...common} />}
      {shape === 'rectangular' && <rect x={35} y={11} width={150} height={50} rx={4} {...common} />}
      {shape === 'imperial' && <rect x={10} y={21} width={200} height={30} rx={15} {...common} />}
    </svg>
  );
}

export default function TableFormModal({
  table,
  onSubmit,
  onClose,
}: {
  table: FirebaseTable | null; // null = crear
  onSubmit: (values: TableFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(table?.name || '');
  const [capacity, setCapacity] = useState(table?.capacity ?? 8);
  const [shape, setShape] = useState<TableFormValues['shape']>(table?.shape || 'round');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre es requerido.');
      return;
    }
    if (!Number.isFinite(capacity) || capacity < 1) {
      setError('La capacidad debe ser al menos 1.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({ name: name.trim(), capacity, shape });
    } catch (err) {
      console.error('Error guardando mesa:', err);
      setError('No se pudo guardar la mesa. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
      <div className="flex items-center justify-center min-h-screen pt-0 px-0 pb-0 text-center sm:pt-4 sm:px-4 sm:pb-20 sm:block sm:p-0">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white w-full h-full sm:rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full sm:h-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] text-[#0A0A0A]" style={displayFont}>
                  {table ? 'Editar mesa' : 'Nueva mesa'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-[#71717A] hover:text-[#0A0A0A] p-1 rounded-lg hover:bg-[#FAFAFA] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">Nombre de la mesa</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                    placeholder="Mesa 5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">Capacidad</label>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCapacity((c) => Math.max(1, c - 1))}
                      className="w-9 h-9 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white font-bold text-[16px]"
                      aria-label="Reducir capacidad"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={capacity}
                      onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                      className="flex-1 text-center px-3 py-2 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] font-bold focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    />
                    <button
                      type="button"
                      onClick={() => setCapacity((c) => c + 1)}
                      className="w-9 h-9 rounded-lg border border-[rgba(0,0,0,0.12)] bg-white font-bold text-[16px]"
                      aria-label="Aumentar capacidad"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">Forma</label>
                  <div className="flex flex-wrap gap-2">
                    {SHAPES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setShape(s.value)}
                        className={`flex-1 min-w-[90px] text-center text-[12.5px] font-bold px-3 py-2.5 rounded-lg border-[1.5px] transition-colors ${
                          shape === s.value
                            ? 'bg-[#111111] border-[#111111] text-white'
                            : 'bg-white border-[rgba(0,0,0,0.1)] text-[#3F3F46]'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2.5 bg-[#FAFAFA] border border-[rgba(0,0,0,0.08)] rounded-lg py-3 px-3 flex items-center justify-center">
                    <div className="w-full max-w-[220px]">
                      <ShapePreview shape={shape} />
                    </div>
                  </div>
                </div>

                {error && <p className="text-[13px] text-[#B91C1C] font-medium">{error}</p>}
              </div>
            </div>

            <div className="px-4 sm:px-6 py-4 flex justify-end gap-2.5 border-t border-[rgba(0,0,0,0.06)]">
              <button
                type="button"
                onClick={onClose}
                className="bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] font-bold text-[13px] rounded-lg px-5 py-2.5"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#111111] text-white font-bold text-[13px] rounded-lg px-5 py-2.5 disabled:opacity-50"
              >
                {table ? 'Guardar cambios' : 'Crear mesa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
