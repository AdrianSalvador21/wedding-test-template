'use client';

import React from 'react';
import Image from 'next/image';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';
import { DESIGNS } from '../../lib/marketing-content';

const designs = DESIGNS;

export default function DesignGallery() {
  return (
    <LSection id="disenos" tone="white" border className="py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Elige tu diseño
          </h2>
          <p className="text-base text-[#5A534B] max-w-[560px]">
            Estilos completos, cada uno con sus propias secciones, confirmación de asistencia y panel de
            administración.
          </p>
        </LReveal>
        <LStagger className="grid md:grid-cols-3 gap-7">
          {designs.map((design) => (
            <LStaggerItem key={design.templateId}>
              <LCard variant="ivory" className="overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_28px_56px_rgba(43,38,34,0.14)] hover:-translate-y-1.5">
                <div className="relative h-[300px] overflow-hidden">
                  <Image
                    src={design.image}
                    alt={design.imageAlt}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover"
                  />
                </div>
                <div className="p-7 flex flex-col gap-2.5 flex-grow">
                  <span className="text-[22px] text-[#211D19]" style={fraunces}>
                    {design.name}
                  </span>
                  <p className="text-sm text-[#5A534B] leading-relaxed flex-grow">{design.tagline}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <a href={`/disenos/${design.slug}`} className="text-sm font-bold text-[#211D19] hover:text-[#AE5730]">
                      Ver el diseño
                    </a>
                    <a
                      href={design.demoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#C6663C]"
                    >
                      Ver ejemplo real →
                    </a>
                  </div>
                </div>
              </LCard>
            </LStaggerItem>
          ))}
        </LStagger>
      </div>
    </LSection>
  );
}
