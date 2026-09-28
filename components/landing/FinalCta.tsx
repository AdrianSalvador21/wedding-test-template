'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LSolidButton } from './ui';

const WHATSAPP_LINK = 'https://wa.me/529602460590';

export default function FinalCta() {
  return (
    <LSection id="contacto" tone="ivory" className="py-20 md:py-24">
      <LReveal className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-5 text-center">
        <h2 className="text-3xl md:text-[44px] leading-[1.12] tracking-tight text-[#211D19]" style={fraunces}>
          Cuéntanos la fecha de tu boda y empezamos tu invitación.
        </h2>
        <p className="text-base md:text-lg text-[#5A534B] max-w-[560px] leading-relaxed">
          Te respondemos por WhatsApp con los paquetes y los tres diseños para verlos desde tu celular.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-1.5 w-full sm:w-auto">
          <LSolidButton href={WHATSAPP_LINK} target="_blank" variant="terracotaDark">
            Crea tu invitación
          </LSolidButton>
          <a
            href="#disenos"
            className="inline-flex items-center justify-center rounded-full border-[1.5px] border-[#211D19] px-8 py-[14px] text-[15px] font-semibold text-[#211D19] transition-colors hover:bg-[#211D19] hover:text-[#FBF7F1]"
          >
            Ver los diseños
          </a>
        </div>
      </LReveal>
    </LSection>
  );
}
