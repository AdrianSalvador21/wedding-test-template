'use client';

import React from 'react';
import Image from 'next/image';
import { fraunces, LSection, LReveal, LStagger, LStaggerItem, LCard } from './ui';
import { DESIGNS } from '../../lib/marketing-content';

const designs = DESIGNS;

export default function DesignGallery() {
  return (
    <LSection id="disenos" tone="ivory" className="py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#AE5730]">Diseños</span>
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Elige tu diseño y ábrelo en tu celular
          </h2>
          <p className="text-base text-[#5A534B] max-w-[560px]">
            Cada uno tiene una demo real: ábrela como la verían tus invitados.
          </p>
        </LReveal>
        {/* En móvil: carrusel horizontal con snap. Desde md: tres columnas. */}
        <LStagger className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 pb-3 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 md:gap-7 md:overflow-visible">
          {designs.map((design) => (
            <LStaggerItem key={design.templateId} className="w-[270px] flex-shrink-0 snap-start md:w-auto">
              <LCard variant="default" className="overflow-hidden flex flex-col h-full transition-all hover:shadow-[0_28px_56px_rgba(43,38,34,0.14)] md:hover:-translate-y-1.5">
                <div className="relative h-[300px] md:h-[360px] overflow-hidden">
                  <Image
                    src={design.image}
                    alt={design.imageAlt}
                    fill
                    sizes="(max-width: 768px) 270px, 380px"
                    className="object-cover"
                  />
                </div>
                <div className="p-5 md:p-7 flex flex-col gap-2.5 flex-grow">
                  <span className="text-[22px] md:text-[26px] text-[#211D19]" style={fraunces}>
                    {design.name}
                  </span>
                  <p className="text-sm text-[#5A534B] leading-relaxed flex-grow md:min-h-[70px]">{design.tagline}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <a
                      href={design.demoHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full border-[1.5px] border-[#211D19] px-5 py-3 text-[15px] font-bold text-[#211D19] transition-colors hover:bg-[#211D19] hover:text-[#FBF7F1]"
                    >
                      Ver ejemplo real →
                    </a>
                    <a href={`/disenos/${design.slug}`} className="text-[15px] font-bold text-[#AE5730] hover:text-[#8E4222]">
                      Ver el diseño
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
