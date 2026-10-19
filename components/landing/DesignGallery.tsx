'use client';

import React from 'react';
import Image from 'next/image';
import { fraunces, LSection, LButton, L_WRAP, L_EYEBROW, L_H2, L_LEAD } from './ui';
import { LANDING_DESIGNS } from '../../lib/marketing-content';

// Galería v4 (spec 26): un solo botón por tarjeta, que abre la demo real en otra pestaña, y cada
// diseño descrito por tipo de boda (`audience`, `tagline`) en lugar de por tipografía.
export default function DesignGallery() {
  return (
    <LSection id="disenos" className="py-16 md:py-24">
      <div className={L_WRAP}>
        <div className="flex flex-col items-center gap-3.5 max-w-[720px] mx-auto text-center">
          <span className={L_EYEBROW}>Diseños</span>
          <h2 className={`${L_H2} text-[#211D19]`} style={fraunces}>
            Cuatro diseños. <em className="italic text-[#C6663C]">Ábrelos como los verán tus invitados.</em>
          </h2>
          <p className={L_LEAD}>Cada uno es una invitación real que puedes abrir desde tu celular ahora mismo.</p>
        </div>

        {/* En móvil: carrusel horizontal con snap. Desde md: cuadrícula. */}
        <ul className="mt-9 md:mt-[52px] flex gap-3.5 overflow-x-auto snap-x snap-mandatory -mx-5 px-5 pb-[18px] pt-1 scroll-px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:px-0 md:pb-0 md:pt-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-[22px] md:overflow-visible">
          {LANDING_DESIGNS.map((design) => (
            <li
              key={design.slug}
              className="group flex-[0_0_78%] snap-start bg-white border border-[rgba(43,38,34,0.1)] rounded-3xl overflow-hidden flex flex-col transition-[transform,box-shadow] duration-200 md:hover:-translate-y-1 hover:shadow-[0_26px_50px_rgba(43,38,34,0.13)]"
            >
              <div className="relative aspect-[4/4.6] overflow-hidden bg-[#F0E6D8]">
                <Image
                  src={design.image}
                  alt={design.imageAlt}
                  fill
                  sizes="(max-width: 768px) 78vw, (max-width: 1024px) 45vw, 280px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span className="absolute top-3.5 left-3.5 bg-[rgba(251,247,241,0.94)] text-[#211D19] text-[11.5px] font-extrabold tracking-[0.04em] px-[11px] py-1.5 rounded-full">
                  {design.badge}
                </span>
              </div>
              <div className="px-[22px] pt-[22px] pb-6 flex flex-col gap-2 flex-1">
                <span className="text-xs font-extrabold tracking-[0.12em] uppercase text-[#7C8363]">{design.audience}</span>
                <h3 className="text-[25px] leading-[1.12] text-[#211D19]" style={fraunces}>
                  {design.name}
                </h3>
                <p className="text-[14.5px] leading-[1.5] text-[#6B6359] flex-1">{design.tagline}</p>
                <LButton href={design.demoHref} external variant="outline" size="sm" className="mt-3 w-full">
                  Ábrela como invitado ↗
                </LButton>
                <a href={`/disenos/${design.slug}`} className="mt-1 text-center text-[13.5px] font-bold text-[#AE5730] hover:text-[#8E4222]">
                  Ver detalles
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p className="md:hidden mt-1.5 text-center text-[12.5px] font-bold text-[#6B6359]">Desliza para ver los cuatro →</p>
      </div>
    </LSection>
  );
}
