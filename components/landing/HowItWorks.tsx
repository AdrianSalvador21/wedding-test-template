'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem } from './ui';

const steps = [
  {
    number: '01',
    title: 'Personaliza tu invitación',
    description: 'Elige uno de los 3 diseños y cuéntanos fecha, lugares, cronograma y fotos de tu boda.',
    accent: false,
  },
  {
    number: '02',
    title: 'Comparte por WhatsApp',
    description: 'Cada invitado recibe su propio enlace, listo para abrir desde el celular sin instalar nada.',
    accent: false,
  },
  {
    number: '03',
    title: 'Gestiona confirmaciones',
    description: 'Ve quién confirmó, cuántos boletos y restricciones alimentarias desde un solo panel.',
    accent: true,
  },
];

export default function HowItWorks() {
  return (
    <LSection id="como-funciona" tone="white" border className="py-20 border-b">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#C6663C]">Cómo funciona</span>
          <h2 className="text-3xl md:text-[36px]" style={fraunces}>
            De la idea a la confirmación, en 3 pasos
          </h2>
        </LReveal>
        <LStagger className="relative grid md:grid-cols-3 gap-10">
          <div className="hidden md:block absolute top-7 left-[16.6%] w-2/3 h-px bg-[repeating-linear-gradient(90deg,rgba(198,102,60,0.4)_0_10px,transparent_10px_20px)]" />
          {steps.map((step) => (
            <LStaggerItem key={step.number} className="relative flex flex-col items-center gap-4 text-center">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center text-xl relative z-10 ${
                  step.accent ? 'bg-[#C6663C] text-[#FBF7F1]' : 'bg-[#211D19] text-[#FBF7F1]'
                }`}
                style={fraunces}
              >
                {step.number}
              </div>
              <span className="text-xl text-[#211D19]" style={fraunces}>
                {step.title}
              </span>
              <p className="text-sm text-[#5A534B] leading-relaxed max-w-[280px]">{step.description}</p>
            </LStaggerItem>
          ))}
        </LStagger>
      </div>
    </LSection>
  );
}
