'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fraunces, LSection, LSolidButton, LTextLink, LCheckIcon } from './ui';

const WHATSAPP_LINK_INTRO =
  'https://wa.me/529602460590?text=Hola!%20Me%20interesa%20conocer%20m%C3%A1s%20sobre%20las%20invitaciones%20digitales%20de%20Invyta.';

const chips = ['3 diseños', 'RSVP automático', 'Listo en 7 días'];

export default function Hero() {
  return (
    <LSection id="inicio" className="pt-32 pb-16 md:pt-40 md:pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-nowrap items-center gap-1.5 md:gap-2">
            {chips.map((chip) => (
              <span
                key={chip}
                className="bg-[#F0E6D8] text-[#8A5A32] text-[9px] sm:text-[10px] md:text-xs font-bold md:tracking-wide uppercase px-2 py-1 md:px-3.5 md:py-1.5 rounded-full whitespace-nowrap flex-shrink-0"
              >
                {chip}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-[54px] leading-[1.1] tracking-tight text-[#211D19]" style={fraunces}>
            Elige el estilo.
            <br />
            <span className="italic text-[#C6663C]">Nosotros armamos tu invitación.</span>
          </h1>
          <p className="text-lg text-[#5A534B] leading-relaxed max-w-[480px]">
            Tres diseños listos para tu boda, con confirmación de asistencia automática y todo gestionado desde un
            panel simple — sin apps que descargar.
          </p>
          <div className="flex flex-wrap items-center gap-6 mt-1">
            <LSolidButton href={WHATSAPP_LINK_INTRO} target="_blank" variant="terracota" className="text-base">
              Crea tu invitación
            </LSolidButton>
            <LTextLink href="#disenos">Ver los diseños →</LTextLink>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto w-full max-w-[460px]"
          style={{ height: 'clamp(360px, 46vw, 600px)' }}
        >
          <div
            className="absolute overflow-hidden rounded-[26px] border-[7px] border-white shadow-[0_24px_48px_rgba(43,38,34,0.2)]"
            style={{
              top: '5%',
              left: '2%',
              width: 'clamp(120px, 34vw, 230px)',
              height: 'clamp(220px, 66vw, 460px)',
              transform: 'rotate(-9deg)',
              zIndex: 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/landing/design-template-03.jpg"
              alt="Template Botánica Editorial"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 15%' }}
            />
          </div>
          <div
            className="absolute overflow-hidden rounded-[28px] border-[8px] border-white shadow-[0_32px_64px_rgba(43,38,34,0.26)]"
            style={{
              top: 0,
              left: '30%',
              width: 'clamp(130px, 37vw, 250px)',
              height: 'clamp(240px, 72vw, 500px)',
              transform: 'rotate(-1deg)',
              zIndex: 2,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/landing/design-template-01.jpg"
              alt="Template Clásico"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 25%' }}
            />
          </div>
          <div
            className="absolute overflow-hidden rounded-[26px] border-[7px] border-white shadow-[0_24px_48px_rgba(43,38,34,0.2)]"
            style={{
              top: '7%',
              left: '58%',
              width: 'clamp(120px, 34vw, 230px)',
              height: 'clamp(220px, 66vw, 460px)',
              transform: 'rotate(8deg)',
              zIndex: 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/landing/design-template-02.jpg"
              alt="Template Moderno"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 30%' }}
            />
          </div>
          <div
            className="absolute bg-white rounded-2xl px-4 py-3 shadow-[0_20px_40px_rgba(43,38,34,0.18)] flex items-center gap-2.5"
            style={{ bottom: '2%', left: '22%', zIndex: 3 }}
          >
            <LCheckIcon />
            <span className="text-[13px] font-bold text-[#211D19] whitespace-nowrap">3 diseños para elegir</span>
          </div>
        </motion.div>
      </div>
    </LSection>
  );
}
