'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem } from './ui';

// Spec 14: sección de valor para "Mesas" en la landing pública, calcada en la
// estructura de AiSection.tsx (eyebrow → H2 → subtexto → mock-up/capacidades →
// confianza → CTA), con el mock-up del Plano genuinamente arrastrable en vez de
// ilustrativo-estático.
const WHATSAPP_LINK_MESAS =
  'https://wa.me/529602460590?text=Hola!%20Me%20interesa%20el%20Paquete%20Personalizado%20con%20gesti%C3%B3n%20de%20mesas%20de%20Invyta.';

type DemoStatus = 'vacia' | 'espacio' | 'completa' | 'excedida';
type DemoKind = 'table' | 'danceFloor' | 'stage';

interface DemoItem {
  id: string;
  kind: DemoKind;
  label: string;
  status?: DemoStatus;
  ratio?: string;
  defaultPos: { leftPct: number; topPct: number };
}

// Arreglo inicial: escenario arriba-centro, pista de baile al centro, y las 4
// mesas (una por cada estado de ocupación) en las cuatro esquinas restantes.
const DEMO_ITEMS: DemoItem[] = [
  { id: 'stage', kind: 'stage', label: 'Escenario', defaultPos: { leftPct: 34, topPct: 4 } },
  { id: 'dance-floor', kind: 'danceFloor', label: 'Pista de baile', defaultPos: { leftPct: 30, topPct: 38 } },
  { id: 'table-1', kind: 'table', label: 'Mesa 1', status: 'vacia', ratio: '0 / 6', defaultPos: { leftPct: 4, topPct: 10 } },
  { id: 'table-2', kind: 'table', label: 'Mesa 2', status: 'espacio', ratio: '3 / 8', defaultPos: { leftPct: 74, topPct: 10 } },
  { id: 'table-3', kind: 'table', label: 'Mesa 3', status: 'completa', ratio: '8 / 8', defaultPos: { leftPct: 4, topPct: 68 } },
  { id: 'table-4', kind: 'table', label: 'Mesa 4', status: 'excedida', ratio: '9 / 8', defaultPos: { leftPct: 74, topPct: 68 } },
];

const TABLES = DEMO_ITEMS.filter((item) => item.kind === 'table');

const STATUS_STYLE: Record<DemoStatus, { background: string; border: string; color: string }> = {
  vacia: { background: '#FFFFFF', border: '1.5px dashed rgba(33,29,25,0.28)', color: '#8A8377' },
  espacio: { background: 'rgba(124,131,99,0.14)', border: '1.5px solid #7C8363', color: '#5B6350' },
  completa: { background: 'rgba(198,102,60,0.14)', border: '1.5px solid #C6663C', color: '#AE5730' },
  excedida: { background: 'rgba(179,63,50,0.14)', border: '1.5px solid #B33F32', color: '#8C2F26' },
};

const LEGEND: { label: string; color: string; dashed?: boolean }[] = [
  { label: 'Vacía', color: '#FFFFFF', dashed: true },
  { label: 'Con espacio', color: '#7C8363' },
  { label: 'Completa', color: '#C6663C' },
  { label: 'Excedida', color: '#B33F32' },
];

const CAPABILITIES = [
  {
    title: 'Se sincroniza con tus invitados',
    text: 'Cada invitado que confirma asistencia aparece listo para asignar. No vuelves a capturar nada.',
    icon: (
      <>
        <path d="M4 4v6h6" />
        <path d="M20 20v-6h-6" />
        <path d="M20 10A8 8 0 006.3 5.3" />
        <path d="M4 14a8 8 0 0013.7 4.7" />
      </>
    ),
  },
  {
    title: 'Arrastra y suelta',
    text: 'Acomoda invitados en su mesa con un movimiento, o usa los botones +/- si prefieres no arrastrar.',
    icon: (
      <>
        <path d="M12 2v20M2 12h20" />
        <path d="M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l3 3" />
      </>
    ),
  },
  {
    title: 'Ve el estado de cada mesa',
    text: 'Un color distinto para vacía, con espacio, completa o excedida, sin abrir cada mesa una por una.',
    icon: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
  {
    title: 'De la lista al plano, en un solo lugar',
    text: 'Cambia entre la Cuadrícula y el Plano visual de tu salón, con tus mesas y objetos donde tú los coloques.',
    icon: (
      <>
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 13l9 5 9-5" />
      </>
    ),
  },
];

const GUARANTEES = [
  {
    title: 'Escala con tu boda',
    text: 'De 5 a más de 100 mesas, la Cuadrícula y el Plano se mantienen igual de rápidos y fáciles de usar.',
    icon: (
      <>
        <path d="M8 3H5a2 2 0 00-2 2v3" />
        <path d="M21 8V5a2 2 0 00-2-2h-3" />
        <path d="M3 16v3a2 2 0 002 2h3" />
        <path d="M16 21h3a2 2 0 002-2v-3" />
      </>
    ),
  },
  {
    title: 'Empieza sin costo',
    text: 'Crea tu cuenta y organiza invitados y mesas gratis. Si luego quieres tu invitación con diseño, la agregas cuando quieras.',
    icon: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="1.5" />
        <path d="M4 8l8-4 8 4" />
        <path d="M12 4v4" />
      </>
    ),
  },
  {
    title: 'Siempre al día',
    text: 'Si un invitado cambia su confirmación, su lugar se actualiza solo. No hay que revisar dos veces.',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 4.5-5" />
      </>
    ),
  },
];

function GridIcon({ color = '#AE5730', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export default function MesasSection() {
  const [view, setView] = useState<'plano' | 'cuadricula'>('plano');
  const [resetKey, setResetKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <LSection id="mesas" tone="ivory" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12 md:gap-14">
        <LReveal className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-2.5">
            <GridIcon />
            <span className="text-xs md:text-[13px] font-bold tracking-[2.5px] md:tracking-[3px] uppercase text-[#AE5730]">
              Gratis, sin plantilla ni editor
            </span>
          </div>
          <h2 className="text-[30px] md:text-5xl leading-[1.1] tracking-tight text-[#211D19]" style={fraunces}>
            De tu lista de invitados
            <br />
            <em className="text-[#C6663C]">al plano de tu salón.</em>
          </h2>
          <p className="text-[15.5px] md:text-[17px] leading-relaxed text-[#5A534B] max-w-[560px]">
            Así de simple es organizar las mesas de tu boda: cuatro pasos, sin hojas de cálculo ni dolores de cabeza.
          </p>
        </LReveal>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 lg:items-stretch">
          {/* Mock-up: Plano genuinamente arrastrable / Cuadrícula estática */}
          <LReveal className="lg:flex-[0_0_54%] min-w-0">
            <div className="h-full bg-white border border-[rgba(33,29,25,0.1)] rounded-[20px] md:rounded-3xl p-5 md:p-7 shadow-[0_24px_48px_rgba(33,29,25,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(198,102,60,0.1)] flex items-center justify-center flex-shrink-0">
                    <GridIcon />
                  </div>
                  <span className="text-sm md:text-[15px] font-bold text-[#211D19]">Gestión de mesas</span>
                </div>
                <span className="bg-[#F0E6D8] text-[#8A5A32] text-[11px] md:text-xs font-bold px-2.5 md:px-3 py-1.5 rounded-full whitespace-nowrap">
                  Ejemplo ilustrativo
                </span>
              </div>

              <div className="h-px bg-[rgba(33,29,25,0.1)]" />

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-pressed={view === 'plano'}
                    onClick={() => setView('plano')}
                    className={`min-h-[44px] px-5 rounded-full border text-[13.5px] md:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AE5730] ${
                      view === 'plano'
                        ? 'bg-[#AE5730] border-[#AE5730] text-[#FBF7F1]'
                        : 'bg-white border-[rgba(33,29,25,0.2)] text-[#211D19] hover:border-[#AE5730]'
                    }`}
                  >
                    Plano
                  </button>
                  <button
                    type="button"
                    aria-pressed={view === 'cuadricula'}
                    onClick={() => setView('cuadricula')}
                    className={`min-h-[44px] px-5 rounded-full border text-[13.5px] md:text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AE5730] ${
                      view === 'cuadricula'
                        ? 'bg-[#AE5730] border-[#AE5730] text-[#FBF7F1]'
                        : 'bg-white border-[rgba(33,29,25,0.2)] text-[#211D19] hover:border-[#AE5730]'
                    }`}
                  >
                    Cuadrícula
                  </button>
                </div>
                {view === 'plano' && (
                  <button
                    type="button"
                    onClick={() => setResetKey((k) => k + 1)}
                    className="min-h-[44px] px-4 rounded-full text-[13px] font-semibold text-[#5A534B] hover:text-[#211D19] hover:bg-[#F4EEE6] transition-colors"
                  >
                    Restablecer
                  </button>
                )}
              </div>

              {view === 'plano' ? (
                <div
                  ref={containerRef}
                  className="relative min-h-[240px] md:min-h-[260px] border-[1.5px] border-dashed border-[rgba(33,29,25,0.28)] rounded-2xl bg-[rgba(255,255,255,0.5)] overflow-hidden"
                >
                  {DEMO_ITEMS.map((item) => (
                    <motion.div
                      key={`${item.id}-${resetKey}`}
                      drag
                      dragConstraints={containerRef}
                      dragElastic={0}
                      dragMomentum={false}
                      whileDrag={{ scale: 1.04, zIndex: 20 }}
                      className="absolute cursor-grab active:cursor-grabbing select-none"
                      style={{ left: `${item.defaultPos.leftPct}%`, top: `${item.defaultPos.topPct}%` }}
                    >
                      {item.kind === 'table' && item.status && (
                        <div
                          className="rounded-xl px-3 py-2.5 flex flex-col gap-0.5 w-[76px]"
                          style={{
                            background: STATUS_STYLE[item.status].background,
                            border: STATUS_STYLE[item.status].border,
                            color: STATUS_STYLE[item.status].color,
                          }}
                        >
                          <span className="text-[11px] font-bold">{item.label}</span>
                          <span className="text-[10px] opacity-85">{item.ratio}</span>
                        </div>
                      )}
                      {item.kind === 'danceFloor' && (
                        <div className="w-[130px] h-[92px] rounded-xl border-[1.5px] border-dashed border-[rgba(33,29,25,0.35)] flex items-center justify-center text-center px-2">
                          <span className="text-[11px] text-[#5A534B] italic">Pista de baile</span>
                        </div>
                      )}
                      {item.kind === 'stage' && (
                        <div className="w-[110px] h-[52px] rounded-xl border-[1.5px] border-dashed border-[rgba(33,29,25,0.35)] flex items-center justify-center text-center px-2">
                          <span className="text-[11px] text-[#5A534B] italic">Escenario</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 min-h-[240px] md:min-h-[260px]">
                  {TABLES.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-2xl px-4 py-4 flex flex-col gap-1 justify-center"
                      style={{
                        background: STATUS_STYLE[t.status!].background,
                        border: STATUS_STYLE[t.status!].border,
                        color: STATUS_STYLE[t.status!].color,
                      }}
                    >
                      <span className="text-sm font-bold">{t.label}</span>
                      <span className="text-[13px] opacity-85">{t.ratio}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {LEGEND.map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ background: l.color, border: l.dashed ? '1.5px dashed rgba(33,29,25,0.4)' : undefined }}
                    />
                    <span className="text-xs text-[#5A534B]">{l.label}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 text-[12.5px] md:text-[13px] leading-normal text-[#5A534B]">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7C8363" strokeWidth="2.4" className="flex-shrink-0 mt-px">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span>
                  {view === 'plano'
                    ? 'Arrastra las mesas, la pista y el escenario — ninguno sale de este recuadro. Los datos son de ejemplo.'
                    : 'Los nombres y números son de ejemplo. Tus mesas se llenan con tus invitados reales.'}
                </span>
              </div>
            </div>
          </LReveal>

          {/* Capacidades */}
          <LStagger className="flex flex-col gap-3 md:gap-3.5 lg:flex-1 min-w-0">
            {CAPABILITIES.map((cap) => (
              <LStaggerItem key={cap.title} className="lg:flex-1 flex">
                <div className="w-full flex items-start lg:items-center gap-3.5 md:gap-[18px] p-[18px] md:px-6 md:py-5 bg-white border border-[rgba(33,29,25,0.1)] rounded-[18px] md:rounded-[20px]">
                  <div className="flex-shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-[11px] md:rounded-xl bg-[rgba(198,102,60,0.1)] flex items-center justify-center">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AE5730" strokeWidth="1.8">
                      {cap.icon}
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[19px] md:text-xl text-[#211D19]" style={fraunces}>
                      {cap.title}
                    </span>
                    <span className="text-sm leading-[1.55] text-[#5A534B]">{cap.text}</span>
                  </div>
                </div>
              </LStaggerItem>
            ))}
          </LStagger>
        </div>

        {/* Confianza */}
        <LStagger className="grid md:grid-cols-3 gap-6 md:gap-10 border-t border-[rgba(33,29,25,0.1)] pt-8 md:pt-10">
          {GUARANTEES.map((item) => (
            <LStaggerItem key={item.title} className="flex flex-col gap-1.5 md:gap-2">
              <div className="flex items-center gap-2.5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AE5730" strokeWidth="1.8">
                  {item.icon}
                </svg>
                <span className="text-lg md:text-[19px] text-[#211D19]" style={fraunces}>
                  {item.title}
                </span>
              </div>
              <span className="text-sm leading-relaxed text-[#5A534B]">{item.text}</span>
            </LStaggerItem>
          ))}
        </LStagger>

        {/* CTA — spec 16: el autoservicio gratuito pasa a ser la acción principal; el Paquete
            Personalizado (diseño + editor) queda como acción secundaria hacia WhatsApp. */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-5 md:gap-8 text-center">
          <a
            href="/login?mode=signup"
            className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-full bg-[#AE5730] hover:bg-[#8F4626] text-[#FBF7F1] text-base font-semibold transition-colors"
          >
            Crear mi cuenta gratis
          </a>
          <a
            href={WHATSAPP_LINK_MESAS}
            target="_blank"
            rel="noopener noreferrer"
            className="self-center text-[15px] font-bold text-[#211D19] border-b border-[#211D19] pb-0.5 w-fit"
          >
            Quiero mi invitación con diseño →
          </a>
        </div>
      </div>
    </LSection>
  );
}
