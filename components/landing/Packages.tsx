'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LCard, LDivider, LSolidButton, LCheckIcon, LXIcon } from './ui';
import { getPackage, formatPrice } from '../../lib/marketing-content';

const WHATSAPP_LINK = 'https://wa.me/529602460590';

const basico = getPackage('basico');
const personalizado = getPackage('personalizado');

export default function Packages() {
  return (
    <LSection id="paquetes" tone="gradient" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Paquetes diseñados para ti
          </h2>
          <p className="text-base text-[#5A534B]">Elige el paquete que mejor se adapte a tus necesidades.</p>
        </LReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          {/* Paquete Básico */}
          <LCard variant="default" trackPackage="basico" className="p-9 flex flex-col gap-5 shadow-[0_24px_48px_rgba(43,38,34,0.08)]">
            <div className="flex flex-col gap-1.5">
              <span className="text-2xl text-[#211D19]" style={fraunces}>
                {basico.name}
              </span>
              <div>
                <span className="text-[38px] text-[#211D19]" style={fraunces}>
                  {formatPrice(basico.price)}
                </span>
                <span className="text-[15px] text-[#8A837A]"> {basico.currency}</span>
              </div>
              <span className="text-sm text-[#8A837A]">{basico.forWho}</span>
            </div>
            <LDivider />
            <div className="flex flex-col gap-3.5">
              {basico.groups.map((group) => (
                <div key={group.title} className="flex items-start gap-2.5">
                  <LCheckIcon color="#7C8363" className="flex-shrink-0 mt-1" />
                  <span className="text-sm text-[#4A433C] leading-relaxed">
                    <span className="font-semibold text-[#211D19]">{group.title}: </span>
                    {group.text}
                  </span>
                </div>
              ))}
            </div>
            <LDivider />
            <div className="flex items-start gap-2.5">
              <LXIcon className="flex-shrink-0 mt-1" />
              <span className="text-sm text-[#6B655C] leading-relaxed">
                <span className="font-medium text-[#211D19]">No incluye: </span>
                {basico.notIncluded}
              </span>
            </div>
            <LSolidButton href={WHATSAPP_LINK} target="_blank" variant="dark" className="mt-2 w-full">
              Elegir Básico
            </LSolidButton>
          </LCard>

          {/* Paquete Personalizado */}
          <LCard variant="dark" trackPackage="personalizado" className="relative p-9 flex flex-col gap-5 shadow-[0_32px_64px_rgba(43,38,34,0.24)] overflow-hidden">
            <div className="absolute top-7 -right-2 bg-[#C6663C] text-[#FBF7F1] px-[18px] py-2 rounded-l-full text-xs font-bold tracking-wide uppercase">
              Recomendado
            </div>
            <div className="flex flex-col gap-1.5 mt-8 md:mt-2">
              <span className="text-2xl" style={fraunces}>
                {personalizado.name}
              </span>
              <div>
                <span className="text-[38px]" style={fraunces}>
                  {formatPrice(personalizado.price)}
                </span>
                <span className="text-[15px] text-[#D8CFC4]"> {personalizado.currency}</span>
              </div>
              <span className="text-sm text-[#D8CFC4]">{personalizado.forWho}</span>
            </div>
            <LDivider tone="dark" />
            <div className="flex flex-col gap-3.5">
              {personalizado.groups.map((group) => (
                <div
                  key={group.title}
                  className={`flex items-start gap-2.5 ${
                    group.isNew
                      ? '-mx-3.5 px-3.5 py-3.5 rounded-xl bg-[rgba(227,164,131,0.12)] border border-[rgba(227,164,131,0.4)]'
                      : ''
                  }`}
                >
                  <LCheckIcon color="#E3A483" className="flex-shrink-0 mt-1" />
                  <div className="flex flex-col gap-2 items-start">
                    {group.isNew && (
                      <span className="bg-[#E3A483] text-[#211D19] text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                        Nuevo
                      </span>
                    )}
                    <span className="text-sm leading-relaxed">
                      <span className="font-semibold">{group.title}: </span>
                      {group.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <LSolidButton href={WHATSAPP_LINK} target="_blank" variant="ivory" className="mt-2 w-full">
              Elegir Personalizado
            </LSolidButton>
          </LCard>
        </div>
      </div>
    </LSection>
  );
}
