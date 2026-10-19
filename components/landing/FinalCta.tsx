'use client';

import React from 'react';
import { fraunces, LSection, LButton, LWhatsAppIcon, L_WRAP, L_EYEBROW, L_LEAD } from './ui';
import { QUOTE_WHATSAPP_MESSAGE, whatsappUrl } from '../../lib/contact';
import { RESPONSE_TIME } from '../../lib/marketing-content';

// Cierre (spec 26): mismo título, la promesa de respuesta y el número visible para quien no
// puede abrir WhatsApp Web.
export default function FinalCta() {
  return (
    <LSection id="contacto" tone="white" border className="py-16 pb-[72px] md:py-[100px] text-center">
      <div className={`${L_WRAP} flex flex-col items-center gap-5`}>
        <span className={L_EYEBROW}>Empecemos</span>
        <h2 className="text-[32px] md:text-[50px] leading-[1.12] tracking-[-0.01em] [text-wrap:balance] max-w-[820px] text-[#211D19]" style={fraunces}>
          Cuéntanos la fecha de tu boda <em className="italic text-[#C6663C]">y empezamos tu invitación.</em>
        </h2>
        <p className={`${L_LEAD} max-w-[580px]`}>
          Te respondemos en {RESPONSE_TIME} con los diseños y la disponibilidad para tu fecha.
        </p>
        <LButton href={whatsappUrl(QUOTE_WHATSAPP_MESSAGE)} external className="w-full sm:w-auto">
          <LWhatsAppIcon />
          Cotiza por WhatsApp
        </LButton>
      </div>
    </LSection>
  );
}
