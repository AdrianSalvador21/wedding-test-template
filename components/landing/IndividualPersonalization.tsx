'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';

const examples = [
  { name: 'Juan & María', seats: '2 lugares' },
  { name: 'Carlos', seats: '1 lugar' },
  { name: 'The Smith Family', seats: '4 lugares' },
];

export default function IndividualPersonalization() {
  return (
    <LSection id="personalizacion" tone="white" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#C6663C]">
            Exclusivo Paquete Personalizado
          </span>
          <h2 className="text-3xl md:text-[36px]" style={fraunces}>
            Cada invitado recibe su propia invitación
          </h2>
          <p className="text-base text-[#5A534B] max-w-[560px]">
            Cada invitado puede recibir su propio enlace, con el número de lugares que le corresponden y la
            información que necesita.
          </p>
          <span className="mt-1 inline-flex items-center bg-[#F0E6D8] text-[#8A5A32] text-xs font-bold px-3.5 py-1.5 rounded-full">
            Ejemplo ilustrativo — no son clientes reales de Invyta
          </span>
        </LReveal>
        <LStagger className="grid md:grid-cols-3 gap-6">
          {examples.map((example) => (
            <LStaggerItem key={example.name}>
              <LCard variant="ivory" className="p-7 h-full flex flex-col gap-3.5">
                <div className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C6663C" strokeWidth="2.2">
                    <path d="M9 17H7a5 5 0 0 1 0-10h2M15 7h2a5 5 0 0 1 0 10h-2M8 12h8" />
                  </svg>
                  <span className="text-[13px] text-[#8A837A]">Enlace personalizado</span>
                </div>
                <span className="text-2xl text-[#211D19]" style={fraunces}>
                  {example.name}
                </span>
                <span className="self-start bg-[rgba(198,102,60,0.12)] text-[#C6663C] text-[13px] font-bold px-3.5 py-1.5 rounded-full">
                  {example.seats}
                </span>
              </LCard>
            </LStaggerItem>
          ))}
        </LStagger>
      </div>
    </LSection>
  );
}
