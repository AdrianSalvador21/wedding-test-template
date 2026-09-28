'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';

const iconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

// Secciones que van en los dos paquetes. Mesas e IA tienen su propia sección más abajo.
const features = [
  {
    title: 'Cronograma y mapa',
    description: 'Ceremonia, recepción e itinerario con ubicación.',
    icon: (
      <svg {...iconProps}>
        <path d="M12 21s7-5.6 7-11a7 7 0 10-14 0c0 5.4 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Regalos y hospedaje',
    description: 'Tu mesa de regalos y hoteles recomendados.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13M5 12v9h14v-9M12 8c-2-4-6-3-5 0 .5 1.5 3 1.5 5 0zM12 8c2-4 6-3 5 0-.5 1.5-3 1.5-5 0z" />
      </svg>
    ),
  },
  {
    title: 'Código de vestimenta',
    description: 'Cómo esperas que vistan tus invitados.',
    icon: (
      <svg {...iconProps}>
        <path d="M8 3l-5 4 3 3 2-1v12h8V9l2 1 3-3-5-4a4 4 0 01-8 0z" />
      </svg>
    ),
  },
  {
    title: 'Música',
    description: 'La canción que suena al abrir tu invitación.',
    icon: (
      <svg {...iconProps}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    title: 'Historia y galería',
    description: 'Tu historia, tus fotos y la cuenta regresiva.',
    icon: (
      <svg {...iconProps}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="2" />
        <path d="M21 16l-5-5-8 9" />
      </svg>
    ),
  },
  {
    title: 'Solo adultos',
    description: 'Una sección clara si tu boda es sin niños.',
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0116 0" />
      </svg>
    ),
  },
];

// Datos ficticios de la maqueta "Tus confirmaciones": 44 + 12 + 4 = 60.
const stats = [
  { label: 'Total', value: 60, bg: 'bg-[#FBF7F1]', color: 'text-[#5A534B]', valueColor: 'text-[#211D19]' },
  { label: 'Confirman', value: 44, bg: 'bg-[#EEF1E6]', color: 'text-[#4E5638]', valueColor: 'text-[#4E5638]' },
  { label: 'Pendientes', value: 12, bg: 'bg-[#F6EEDC]', color: 'text-[#7A5B1E]', valueColor: 'text-[#7A5B1E]' },
  { label: 'No van', value: 4, bg: 'bg-[#F2E4DE]', color: 'text-[#8A3B22]', valueColor: 'text-[#8A3B22]' },
];

const guests = [
  { name: 'Familia Ortega', detail: '4 personas · sin restricciones', status: 'Confirmó', pill: 'bg-[#EEF1E6] text-[#4E5638]' },
  { name: 'Lucía y Marcos', detail: '2 personas · 1 vegetariano', status: 'Confirmó', pill: 'bg-[#EEF1E6] text-[#4E5638]' },
  { name: 'Tío Ramón', detail: '1 persona', status: 'Pendiente', pill: 'bg-[#F6EEDC] text-[#7A5B1E]' },
  { name: 'Carla', detail: '1 persona', status: 'No asiste', pill: 'bg-[#F2E4DE] text-[#8A3B22]' },
];

export default function Features() {
  return (
    <LSection id="funcionalidades" tone="white" border className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#AE5730]">Qué incluye</span>
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Todo lo que tus invitados necesitan, en un solo enlace
          </h2>
          <p className="text-base text-[#5A534B] max-w-[600px]">
            Y tú, una lista clara de quién viene. Estas secciones van en los dos paquetes.
          </p>
        </LReveal>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <LStagger className="grid grid-cols-2 gap-3 md:gap-4">
            {features.map((feature) => (
              <LStaggerItem key={feature.title}>
                <LCard variant="default" className="p-4 md:p-6 h-full flex flex-col gap-2.5 md:gap-3">
                  <span className="w-11 h-11 md:w-12 md:h-12 rounded-[14px] bg-[#F0E6D8] text-[#AE5730] flex items-center justify-center">
                    {feature.icon}
                  </span>
                  <span className="text-base md:text-[19px] text-[#211D19] leading-snug" style={fraunces}>
                    {feature.title}
                  </span>
                  <span className="text-[13px] md:text-sm text-[#5A534B] leading-relaxed">{feature.description}</span>
                </LCard>
              </LStaggerItem>
            ))}
          </LStagger>

          <LReveal>
            <div className="bg-[#FBF7F1] border border-[rgba(43,38,34,0.1)] rounded-3xl p-5 md:p-7 shadow-[0_24px_48px_rgba(43,38,34,0.08)] flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] md:text-base font-extrabold text-[#211D19]">Tus confirmaciones</span>
                <span className="bg-[#F0E6D8] text-[#8A5A32] text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                  Datos ficticios
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-2.5">
                {stats.map((stat) => (
                  <div key={stat.label} className={`${stat.bg} rounded-xl px-2.5 py-2 md:px-3.5 md:py-3`}>
                    <div className={`text-[9px] md:text-[11px] font-extrabold tracking-[0.08em] uppercase ${stat.color}`}>
                      {stat.label}
                    </div>
                    <div className={`text-[22px] md:text-[28px] leading-tight ${stat.valueColor}`} style={fraunces}>
                      {stat.value}
                    </div>
                  </div>
                ))}
              </div>
              <ul className="flex flex-col">
                {guests.map((guest) => (
                  <li
                    key={guest.name}
                    className="flex items-center justify-between gap-3 py-3 border-t border-[rgba(43,38,34,0.08)]"
                  >
                    <span className="text-sm md:text-[15px] font-bold text-[#211D19]">
                      {guest.name}
                      <span className="block text-xs font-medium text-[#5A534B]">{guest.detail}</span>
                    </span>
                    <span className={`${guest.pill} text-xs font-extrabold px-3 py-1.5 rounded-full whitespace-nowrap`}>
                      {guest.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </LReveal>
        </div>
      </div>
    </LSection>
  );
}
