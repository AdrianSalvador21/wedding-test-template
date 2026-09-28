'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { FirebaseVenueFixture } from '../../../src/types/wedding';
import { displayFont, manrope } from '../../admin/ui';

export interface FixtureFormValues {
  type: FirebaseVenueFixture['type'];
  label: string;
  width: number;
  height: number;
}

const TYPES: { value: FirebaseVenueFixture['type']; label: string; defaultLabel: string; w: number; h: number }[] = [
  { value: 'dance_floor', label: 'Pista de baile', defaultLabel: 'Pista de baile', w: 200, h: 140 },
  { value: 'bar', label: 'Barra', defaultLabel: 'Barra', w: 120, h: 60 },
  { value: 'stage', label: 'Escenario', defaultLabel: 'Escenario', w: 200, h: 90 },
  { value: 'entrance', label: 'Entrada', defaultLabel: 'Entrada', w: 100, h: 60 },
  { value: 'custom', label: 'Personalizado', defaultLabel: '', w: 140, h: 90 },
];

export default function FixtureFormModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (values: FixtureFormValues) => Promise<void>;
  onClose: () => void;
}) {
  const [type, setType] = useState<FirebaseVenueFixture['type']>('dance_floor');
  const [label, setLabel] = useState(TYPES[0].defaultLabel);
  const [width, setWidth] = useState(TYPES[0].w);
  const [height, setHeight] = useState(TYPES[0].h);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectType = (value: FirebaseVenueFixture['type']) => {
    const preset = TYPES.find((t) => t.value === value)!;
    setType(value);
    setWidth(preset.w);
    setHeight(preset.h);
    if (!label || TYPES.some((t) => t.defaultLabel === label)) setLabel(preset.defaultLabel);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('La etiqueta es requerida.');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({ type, label: label.trim(), width, height });
    } catch (err) {
      console.error('Error creando objeto de salón:', err);
      setError('No se pudo crear el objeto. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={manrope}>
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]" onClick={onClose}></div>

        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] text-[#0A0A0A]" style={displayFont}>
                  Nuevo objeto del salón
                </h3>
                <button type="button" onClick={onClose} className="text-[#71717A] hover:text-[#0A0A0A] p-1 rounded-lg hover:bg-[#FAFAFA]">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">Tipo</label>
                  <div className="flex flex-wrap gap-2">
                    {TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => selectType(t.value)}
                        className={`text-[12px] font-bold px-3 py-2 rounded-lg border-[1.5px] ${
                          type === t.value ? 'bg-[#111111] border-[#111111] text-white' : 'bg-white border-[rgba(0,0,0,0.1)] text-[#3F3F46]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">Etiqueta</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    placeholder="Pista de baile"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">Ancho (px)</label>
                    <input
                      type="number"
                      min={60}
                      value={width}
                      onChange={(e) => setWidth(parseInt(e.target.value, 10) || 60)}
                      className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#27272A] mb-1.5">Alto (px)</label>
                    <input
                      type="number"
                      min={60}
                      value={height}
                      onChange={(e) => setHeight(parseInt(e.target.value, 10) || 60)}
                      className="w-full px-3.5 py-2.5 border border-[rgba(0,0,0,0.14)] rounded-lg text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                    />
                  </div>
                </div>

                {error && <p className="text-[13px] text-[#B91C1C] font-medium">{error}</p>}
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end gap-2.5 border-t border-[rgba(0,0,0,0.06)]">
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
                Crear objeto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
