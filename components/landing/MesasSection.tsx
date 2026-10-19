'use client';

import React from 'react';
import { fraunces, LSection, LButton, LCheckIcon, L_WRAP } from './ui';

// Mesas gratis, versión corta (spec 26): va después de Paquetes como opción para quien todavía no
// compra su invitación. El plano es un ejemplo estático; la demo arrastrable del spec 14 se retiró.

const points = [
  'Plano de tu salón con arrastrar y soltar',
  'Ocupación de cada mesa de un vistazo',
  'Si después contratas tu invitación, quien confirma aparece listo para sentar',
];

type Status = 'vacia' | 'espacio' | 'completa' | 'excedida';

const STATUS_STYLE: Record<Status, string> = {
  vacia: 'border-dashed border-[#C9C1B6] text-[#8A837A]',
  espacio: 'border-[#7C8363] bg-[#EEF1E6] text-[#4E5638]',
  completa: 'border-[#C6663C] bg-[#FBEADD] text-[#8E4222]',
  excedida: 'border-[#B33F32] bg-[#F6E1DB] text-[#8A3B22]',
};

const TABLES: { label: string; ratio: string; status: Status; left: string; top: string }[] = [
  { label: 'Mesa 1', ratio: '0/8', status: 'vacia', left: '7%', top: '10%' },
  { label: 'Mesa 2', ratio: '5/8', status: 'espacio', left: '73%', top: '10%' },
  { label: 'Mesa 3', ratio: '8/8', status: 'completa', left: '7%', top: '64%' },
  { label: 'Mesa 4', ratio: '6/8', status: 'espacio', left: '73%', top: '64%' },
  { label: 'Mesa 5', ratio: '9/8', status: 'excedida', left: '40%', top: '70%' },
];

const ZONES = [
  { label: 'Escenario', style: { left: '34%', top: '8%', width: '32%', height: '14%' } },
  { label: 'Pista de baile', style: { left: '32%', top: '38%', width: '36%', height: '24%' } },
];

const LEGEND: { label: string; dot: string }[] = [
  { label: 'Vacía', dot: 'border-[1.5px] border-dashed border-[#A79E92]' },
  { label: 'Con espacio', dot: 'bg-[#7C8363]' },
  { label: 'Completa', dot: 'bg-[#C6663C]' },
  { label: 'Excedida', dot: 'bg-[#B33F32]' },
];

const objectBase = 'absolute flex flex-col items-center justify-center text-center text-[11.5px] font-extrabold leading-[1.2]';

export default function MesasSection() {
  return (
    <LSection id="mesas" tone="white" className="py-14 md:py-20">
      <div className={L_WRAP}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-14 items-center bg-[#FBF7F1] border border-[rgba(43,38,34,0.1)] rounded-3xl md:rounded-[32px] p-6 md:p-11">
          <div className="flex flex-col gap-4">
            <span className="self-start bg-[#EEF1E6] text-[#5B6342] text-xs font-extrabold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full">
              Gratis, con cualquier cuenta
            </span>
            <h2 className="text-[27px] md:text-[34px] leading-[1.12] tracking-[-0.01em] [text-wrap:balance] text-[#211D19]" style={fraunces}>
              ¿Todavía no decides tu invitación?{' '}
              <em className="italic text-[#C6663C]">Organiza tus invitados y mesas hoy.</em>
            </h2>
            <ul className="flex flex-col gap-2.5">
              {points.map((point) => (
                <li key={point} className="flex gap-2.5 items-center text-[15px] font-semibold text-[#4A433C]">
                  <LCheckIcon color="#7C8363" className="flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-1.5">
              <LButton href="/login?mode=signup" variant="dark">
                Crear cuenta gratis
              </LButton>
            </div>
          </div>

          <div>
            <div
              role="img"
              aria-label="Ejemplo de plano de mesas"
              className="relative aspect-[1.25/1] bg-white border border-[rgba(43,38,34,0.1)] rounded-[22px] shadow-[0_20px_40px_rgba(43,38,34,0.08)] overflow-hidden"
            >
              <div className="absolute inset-3.5 border-[1.5px] border-dashed border-[rgba(43,38,34,0.18)] rounded-[14px] bg-[radial-gradient(rgba(43,38,34,0.08)_1px,transparent_1px)] bg-[length:18px_18px]" />
              {ZONES.map((zone) => (
                <div
                  key={zone.label}
                  className={`${objectBase} border-[1.5px] border-dashed border-[rgba(43,38,34,0.18)] rounded-xl text-[#6B6359] italic font-semibold`}
                  style={zone.style}
                >
                  {zone.label}
                </div>
              ))}
              {TABLES.map((table) => (
                <div
                  key={table.label}
                  className={`${objectBase} w-[20%] aspect-square rounded-full border-2 ${STATUS_STYLE[table.status]}`}
                  style={{ left: table.left, top: table.top }}
                >
                  {table.label}
                  <small className="text-[10.5px] font-bold opacity-80">{table.ratio}</small>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3.5 mt-3 text-[12.5px] font-bold text-[#6B6359]">
              {LEGEND.map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <i className={`w-[11px] h-[11px] rounded-full inline-block ${item.dot}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LSection>
  );
}
