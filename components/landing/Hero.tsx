'use client';

import React from 'react';
import Image from 'next/image';
import { fraunces, LSection, LSolidButton, LTextLink, LCheckIcon } from './ui';

const WHATSAPP_LINK_INTRO =
  'https://wa.me/529602460590?text=Hola!%20Me%20interesa%20conocer%20m%C3%A1s%20sobre%20las%20invitaciones%20digitales%20de%20Invyta.';

const checks = ['Enlace único para compartir', 'Confirmaciones en tiempo real'];

export default function Hero() {
  return (
    <LSection id="inicio" className="pt-24 pb-10 md:pt-36 md:pb-12">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        {/* Entrada con CSS (globals.css), no con framer-motion: el texto y las imágenes del hero
            son visibles en el HTML inicial y no esperan a la hidratación de React (LCP). */}
        <div className="flex flex-col gap-6 hero-in-up">
          <h1 className="tracking-tight text-[#211D19]" style={fraunces}>
            <span className="block text-4xl md:text-5xl lg:text-[54px] leading-[1.1]">
              Invitaciones digitales para boda
            </span>
            <span className="block mt-3 text-2xl md:text-[28px] leading-[1.25] italic text-[#C6663C]">
              Elige el estilo. Nosotros armamos tu invitación.
            </span>
          </h1>
          <p className="text-lg text-[#5A534B] leading-relaxed max-w-[480px]">
            Diseños listos para tu boda, con confirmación de asistencia automática y todo gestionado desde un
            panel simple — sin apps que descargar.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-1">
            <LSolidButton href={WHATSAPP_LINK_INTRO} target="_blank" variant="terracotaDark" className="text-base">
              Crea tu invitación
            </LSolidButton>
            <LTextLink href="/login?mode=signup">
              Organiza tu boda gratis →
            </LTextLink>
          </div>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#4A433C]">
            {checks.map((check) => (
              <li key={check} className="flex items-center gap-2">
                <LCheckIcon color="#7C8363" className="flex-shrink-0" />
                {check}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative mx-auto w-full max-w-[480px] hero-in-left"
          style={{ height: 'clamp(380px, 50vw, 580px)' }}
        >
          <div
            className="absolute overflow-hidden rounded-[24px] border-[6px] border-white shadow-[0_20px_40px_rgba(43,38,34,0.18)]"
            style={{
              top: '10%',
              left: '-2%',
              width: 'clamp(100px, 27vw, 190px)',
              height: 'clamp(190px, 52vw, 365px)',
              transform: 'rotate(-15deg)',
              zIndex: 1,
            }}
          >
            <Image
              src="/assets/landing/design-template-03-2.png"
              alt="Invitación de boda digital con el diseño Botánica Editorial vista en el celular"
              fill
              sizes="(max-width: 768px) 32vw, 190px"
              className="object-cover"
              style={{ objectPosition: '50% 15%' }}
            />
          </div>
          <div
            className="absolute overflow-hidden rounded-[25px] border-[7px] border-white shadow-[0_22px_44px_rgba(43,38,34,0.2)]"
            style={{
              top: '0%',
              left: '12%',
              width: 'clamp(112px, 30vw, 210px)',
              height: 'clamp(212px, 57vw, 400px)',
              transform: 'rotate(-7deg)',
              zIndex: 2,
            }}
          >
            <Image
              src="/assets/landing/design-template-01.jpg"
              alt="Invitación de boda digital con el diseño Clásico vista en el celular"
              fill
              sizes="(max-width: 768px) 35vw, 210px"
              className="object-cover"
              style={{ objectPosition: '50% 25%' }}
            />
          </div>
          <div
            className="absolute overflow-hidden rounded-[24px] border-[6px] border-white shadow-[0_20px_40px_rgba(43,38,34,0.18)]"
            style={{
              top: '5%',
              left: '64%',
              width: 'clamp(102px, 27vw, 194px)',
              height: 'clamp(195px, 52vw, 372px)',
              transform: 'rotate(12deg)',
              zIndex: 1,
            }}
          >
            <Image
              src="/assets/landing/design-template-02.jpg"
              alt="Invitación de boda digital con el diseño Moderno vista en el celular"
              fill
              sizes="(max-width: 768px) 32vw, 194px"
              className="object-cover"
              style={{ objectPosition: '50% 30%' }}
            />
          </div>
          <div
            className="absolute overflow-hidden rounded-[28px] border-[8px] border-white shadow-[0_32px_64px_rgba(43,38,34,0.26)]"
            style={{
              top: '-4%',
              left: '31%',
              width: 'clamp(132px, 36vw, 250px)',
              height: 'clamp(255px, 68vw, 480px)',
              transform: 'rotate(0deg)',
              zIndex: 4,
            }}
          >
            <Image
              src="/assets/landing/design-template-04.png"
              alt="Invitación de boda digital con el diseño Jardín Editorial vista en el celular"
              fill
              sizes="(max-width: 768px) 42vw, 250px"
              priority
              className="object-cover"
              style={{ objectPosition: '50% 10%' }}
            />
          </div>
        </div>
      </div>
    </LSection>
  );
}
