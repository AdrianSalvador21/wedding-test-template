'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';

// Sin pagos, anticipos ni promesas de retraso en la landing (spec 15).
const steps = [
  {
    title: 'Escríbenos por WhatsApp',
    text: 'Cuéntanos la fecha de tu boda y lo que imaginas para tu invitación.',
  },
  {
    title: 'Completamos juntos la información',
    text: 'Tú llenas los datos de tu boda en tu panel y nosotros nos encargamos de armar tus fotos.',
  },
  {
    title: 'Diseñamos tu invitación',
    text: 'Con tus datos y tus fotos armamos tu diseño y te compartimos la propuesta para que la revises.',
  },
  {
    title: 'Entregamos en 7 días hábiles',
    text: 'Compartes el enlace y ves llegar las confirmaciones.',
  },
];

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

const promises = [
  {
    title: 'Revisiones ilimitadas',
    text: 'Pide los ajustes que necesites antes de la entrega; no hay límite de revisiones.',
    icon: (
      <svg {...iconProps}>
        <path d="M4 4v6h6M20 20v-6h-6M20 10A8 8 0 006.3 5.3M4 14a8 8 0 0013.7 4.7" />
      </svg>
    ),
  },
  {
    title: 'Te acompañamos por WhatsApp',
    text: 'Resuelves tus dudas por WhatsApp durante todo el proceso, de la primera pregunta a la entrega.',
    icon: (
      <svg {...iconProps}>
        <path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z" />
      </svg>
    ),
  },
  {
    title: 'Cambios después de publicar',
    text: 'Con el Personalizado ajustas tus datos (nombres, fecha, lugares y fotos) desde tu panel, y para un cambio visual nos escribes. Con el Básico, nosotros hacemos los cambios por ti.',
    icon: (
      <svg {...iconProps}>
        <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" />
      </svg>
    ),
  },
];

export default function ProcessSection() {
  return (
    <LSection id="proceso" tone="white" border className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#AE5730]">Así trabajamos</span>
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Sin sorpresas: así es el proceso
          </h2>
        </LReveal>

        <LStagger className="grid md:grid-cols-4 gap-6 md:gap-7">
          {steps.map((step, index) => (
            <LStaggerItem key={step.title} className="flex gap-4 md:flex-col md:gap-2.5 items-start">
              <span
                className="text-[30px] md:text-[34px] leading-none text-[#AE5730] w-6 md:w-auto flex-shrink-0"
                style={fraunces}
              >
                {index + 1}
              </span>
              <div className="flex flex-col gap-1.5 md:gap-2.5">
                <h3 className="text-lg md:text-xl text-[#211D19] leading-snug" style={fraunces}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5A534B]">{step.text}</p>
              </div>
            </LStaggerItem>
          ))}
        </LStagger>

        <LStagger className="grid md:grid-cols-3 gap-4 md:gap-5 items-stretch">
          {promises.map((item) => (
            <LStaggerItem key={item.title} className="h-full">
              <LCard variant="default" className="h-full p-5 md:p-6 flex gap-4 md:flex-col md:gap-3 items-start !rounded-[20px]">
                <span className="w-11 h-11 md:w-12 md:h-12 rounded-[14px] bg-[#F0E6D8] text-[#AE5730] flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-[17px] md:text-[19px] text-[#211D19]" style={fraunces}>
                    {item.title}
                  </h3>
                  <p className="text-[13px] md:text-sm leading-relaxed text-[#5A534B]">{item.text}</p>
                </div>
              </LCard>
            </LStaggerItem>
          ))}
        </LStagger>
      </div>
    </LSection>
  );
}
