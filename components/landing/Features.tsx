'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';

const features = [
  {
    title: 'Cronograma y mapa',
    description: 'Ceremonia, recepción e itinerario del día en un mapa interactivo.',
    variant: 'dark' as const,
  },
  {
    title: 'Mesa de regalos y hospedaje',
    description: 'Recomendaciones de hospedaje y tu mesa de regalos, en un solo lugar.',
    variant: 'default' as const,
  },
  {
    title: 'Código de vestimenta',
    description: 'Indícales a tus invitados exactamente cómo vestir para tu evento.',
    variant: 'default' as const,
  },
  {
    title: 'Evento solo para adultos',
    description: 'Sección dedicada cuando tu boda es una celebración sin niños.',
    variant: 'default' as const,
  },
  {
    title: 'Música en tu invitación',
    description: 'Elige la canción que suena mientras tus invitados la abren.',
    variant: 'accent' as const,
  },
  {
    title: 'Envíos ilimitados',
    description: 'Comparte tu invitación con cuantos invitados necesites, sin costo extra.',
    variant: 'default' as const,
  },
];

export default function Features() {
  return (
    <LSection id="funcionalidades" tone="ivory" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Todo lo que incluye tu invitación
          </h2>
          <p className="text-base text-[#5A534B] max-w-[600px]">
            Más allá del diseño: cada sección pensada para que tus invitados tengan toda la información, y tú, cero
            cabos sueltos.
          </p>
        </LReveal>
        <LStagger className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <LStaggerItem key={feature.title}>
              <LCard variant={feature.variant} className="p-7 h-full flex flex-col gap-2.5">
                <span
                  className={`text-[21px] ${
                    feature.variant === 'default' ? 'text-[#211D19]' : ''
                  }`}
                  style={fraunces}
                >
                  {feature.title}
                </span>
                <span
                  className={`text-sm ${
                    feature.variant === 'dark' ? 'text-[#D8CFC4]' : feature.variant === 'accent' ? 'text-[#FBEADD]' : 'text-[#5A534B]'
                  }`}
                >
                  {feature.description}
                </span>
              </LCard>
            </LStaggerItem>
          ))}
        </LStagger>
      </div>
    </LSection>
  );
}
