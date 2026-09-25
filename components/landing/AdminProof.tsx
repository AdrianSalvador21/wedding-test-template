'use client';

import React from 'react';
import Image from 'next/image';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';

const panels = [
  {
    title: 'Editor de Invitación',
    image: '/assets/landing/editor-imagen.png',
    alt: 'Panel para editar la invitación de boda: textos, fotos, cronograma y código de vestimenta',
  },
  {
    title: 'Gestión de Invitados',
    image: '/assets/landing/invitados-imagen.png',
    alt: 'Panel de gestión de invitados con la lista de confirmaciones de asistencia',
  },
];

export default function AdminProof() {
  return (
    <LSection tone="white" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <h2 className="text-3xl md:text-[36px]" style={fraunces}>
            Panel de administración intuitivo
          </h2>
          <p className="text-base text-[#5A534B] max-w-[560px]">
            Controla cada aspecto de tu boda desde una interfaz moderna y fácil de usar.
          </p>
        </LReveal>
        <LStagger className="grid md:grid-cols-2 gap-8">
          {panels.map((panel) => (
            <LStaggerItem key={panel.title}>
              <LCard variant="ivory" className="p-6 flex flex-col gap-4">
                <div className="relative rounded-2xl overflow-hidden h-[400px] bg-white shadow-[0_20px_40px_rgba(43,38,34,0.1)]">
                  <Image
                    src={panel.image}
                    alt={panel.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 560px"
                    className="object-cover object-left-top"
                  />
                </div>
                <span className="text-[19px] text-[#211D19]" style={fraunces}>
                  {panel.title}
                </span>
              </LCard>
            </LStaggerItem>
          ))}
        </LStagger>
      </div>
    </LSection>
  );
}
