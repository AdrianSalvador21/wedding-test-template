'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';

const designs = [
  {
    id: 'template-01',
    name: 'Clásico',
    description: 'Serif elegante, monograma en sello y detalles botánicos mínimos.',
    demoHref: '/es/wedding/template-01-demo',
    image: '/assets/landing/design-template-01.jpg',
  },
  {
    id: 'template-02',
    name: 'Moderno',
    description: 'Sans-serif geométrica, anillos concéntricos y acentos de línea botánica.',
    demoHref: '/es/wedding/template-02-demo',
    image: '/assets/landing/design-template-02.jpg',
  },
  {
    id: 'template-03',
    name: 'Botánica Editorial',
    description: 'Hero en arco, motivos botánicos dibujados a mano y countdown en vivo.',
    demoHref: '/es/wedding/valentina-mateo-2026',
    image: '/assets/landing/design-template-03.jpg',
  },
];

export default function DesignGallery() {
  return (
    <LSection id="disenos" tone="white" border className="py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Elige tu diseño
          </h2>
          <p className="text-base text-[#5A534B] max-w-[560px]">
            Tres estilos completos, cada uno con sus propias 13 secciones, RSVP y panel de administración.
          </p>
        </LReveal>
        <LStagger className="grid md:grid-cols-3 gap-7">
          {designs.map((design) => (
            <LStaggerItem key={design.id}>
              <LCard variant="ivory" className="overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_28px_56px_rgba(43,38,34,0.14)] hover:-translate-y-1.5">
                <div className="h-[300px] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.image}
                    alt={`Vista previa del template ${design.name}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-7 flex flex-col gap-2.5 flex-grow">
                  <span className="text-[22px] text-[#211D19]" style={fraunces}>
                    {design.name}
                  </span>
                  <p className="text-sm text-[#5A534B] leading-relaxed flex-grow">{design.description}</p>
                  <a
                    href={design.demoHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm font-bold text-[#C6663C]"
                  >
                    Ver ejemplo real →
                  </a>
                </div>
              </LCard>
            </LStaggerItem>
          ))}
        </LStagger>
      </div>
    </LSection>
  );
}
