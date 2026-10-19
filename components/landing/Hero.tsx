'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { fraunces, manrope, LSection, LButton, LCheckIcon, LWhatsAppIcon, L_WRAP, L_EYEBROW, L_LEAD } from './ui';
import { QUOTE_WHATSAPP_MESSAGE, whatsappUrl } from '../../lib/contact';
import { LANDING_DESIGNS, RESPONSE_TIME, depositLabel } from '../../lib/marketing-content';

// Hero v4 (spec 26): la keyword de SEO se queda dentro del <h1> como primera línea con estilo de
// eyebrow; la promesa es el resto del título. Un teléfono con selector de diseño.

// Invitado de la tarjeta flotante, uno por diseño, para que el cambio se note.
const GUESTS = ['Familia Ortega', 'Lucía y Marcos', 'Carlos', 'Familia Ríos'];

const guarantees = [`Empiezas con ${depositLabel} de anticipo`, 'El resto, al recibirla terminada', 'Revisiones ilimitadas'];

export default function Hero() {
  const [selected, setSelected] = useState(0);
  // Cuenta los cambios de diseño: como `key` de la tarjeta, repite su animación en cada cambio.
  const [changes, setChanges] = useState(0);
  const design = LANDING_DESIGNS[selected];

  const choose = (index: number) => {
    if (index === selected) return;
    setSelected(index);
    setChanges((n) => n + 1);
  };

  return (
    <LSection id="inicio" className="overflow-hidden pt-[90px] pb-10 lg:pt-[140px] lg:pb-14">
      <div className={L_WRAP}>
        <div className="grid grid-cols-1 [grid-template-areas:'head'_'vis'_'body'] lg:grid-cols-[1.08fr_0.92fr] lg:grid-rows-[1fr_auto_auto_1fr] lg:[grid-template-areas:'._vis'_'head_vis'_'body_vis'_'._vis'] lg:gap-x-14 items-center">
          {/* Entrada con CSS (globals.css), no con framer-motion: el texto y la imagen del hero
              son visibles en el HTML inicial y no esperan a la hidratación de React (LCP). */}
          <div className="[grid-area:head] lg:self-end hero-in-up">
            <h1 className="flex flex-col gap-3 lg:gap-[18px] text-[#211D19]">
              <span className={L_EYEBROW}>Invitaciones digitales para boda</span>
              <span className="text-[33px] lg:text-[54px] leading-[1.05] tracking-[-0.01em] [text-wrap:balance]" style={fraunces}>
                Tu invitación de boda, lista en 7 días.{' '}
                <em className="block italic text-[#C6663C]">Y tú sabes quién viene.</em>
              </span>
            </h1>
          </div>

          <div className="[grid-area:vis] mt-[26px] lg:mt-0 hero-in-left">
            <div className="relative flex flex-col items-center gap-[18px]">
              <div
                aria-hidden="true"
                className="absolute top-[44px] lg:top-[34px] left-1/2 -translate-x-1/2 w-[92%] lg:w-[84%] aspect-[1/1.12] rounded-[999px_999px_28px_28px] bg-[linear-gradient(180deg,#F0E6D8_0%,#F5EEE4_100%)]"
              />
              <div className="relative z-[1] w-[62%] max-w-[290px] lg:w-[290px] aspect-[9/18.8] bg-[#1A1714] rounded-[34px] lg:rounded-[44px] p-[7px] lg:p-2.5 shadow-[0_40px_70px_rgba(43,38,34,0.28),0_6px_14px_rgba(43,38,34,0.12)]">
                <span
                  aria-hidden="true"
                  className="absolute z-[2] top-[13px] lg:top-[18px] left-1/2 -translate-x-1/2 w-14 h-4 lg:w-[84px] lg:h-[22px] rounded-full bg-[#1A1714]"
                />
                <div className="relative w-full h-full overflow-hidden rounded-[28px] lg:rounded-[35px] bg-[#2E3326]">
                  <Image
                    src={design.image}
                    alt={`Invitación con el diseño ${design.name} vista en el celular`}
                    fill
                    sizes="(max-width: 1024px) 62vw, 290px"
                    priority
                    className="object-cover object-top"
                  />
                </div>
              </div>

              <div
                key={changes}
                className={`absolute z-[3] left-0 bottom-[12%] lg:-left-[4%] lg:bottom-[16%] bg-white rounded-[13px] lg:rounded-2xl shadow-[0_18px_38px_rgba(43,38,34,0.18)] px-[11px] py-[9px] lg:px-3.5 lg:py-3 flex gap-2.5 items-center text-[11.5px] lg:text-[13px] leading-[1.3] ${
                  changes === 0 ? 'lp-pop' : 'lp-pop-again'
                }`}
              >
                <span className="w-7 h-7 lg:w-[34px] lg:h-[34px] rounded-full bg-[#EEF1E6] text-[#5B6342] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <b className="block text-xs lg:text-[13.5px] text-[#211D19]">{GUESTS[selected]}</b>
                  <span className="text-[#5B6342] font-bold">confirmó · 4 personas</span>
                </div>
              </div>
              <div className="absolute z-[3] right-0 top-[20%] lg:-right-[2%] lg:top-[22%] bg-white rounded-[13px] lg:rounded-2xl shadow-[0_18px_38px_rgba(43,38,34,0.18)] px-[11px] py-[9px] lg:px-3.5 lg:py-3 flex flex-col items-start gap-0.5 leading-[1.3]">
                <small className="text-[11.5px] font-bold text-[#6B6359]">Confirmados</small>
                <span className="text-2xl lg:text-[30px] leading-none text-[#211D19]" style={fraunces}>
                  44
                  <small className="text-[13px]" style={manrope}>
                    {' '}
                    / 60
                  </small>
                </span>
                <div className="h-1.5 w-[84px] lg:w-[120px] bg-[#F0E6D8] rounded-[9px] overflow-hidden mt-1.5">
                  <i className="block h-full w-[73%] bg-[#7C8363] rounded-[9px]" />
                </div>
              </div>

              <div
                role="group"
                aria-label="Ver diseño"
                className="relative z-[1] flex flex-wrap justify-center gap-1.5 bg-white border border-[rgba(43,38,34,0.1)] rounded-full p-[5px] shadow-[0_8px_20px_rgba(43,38,34,0.07)]"
              >
                {LANDING_DESIGNS.map((item, index) => (
                  <button
                    key={item.slug}
                    type="button"
                    aria-pressed={index === selected}
                    onClick={() => choose(index)}
                    className={`rounded-full px-2.5 py-[7px] text-[12.5px] lg:px-3.5 lg:py-2 lg:text-[13.5px] font-bold transition-colors ${
                      index === selected ? 'bg-[#211D19] text-[#FBF7F1]' : 'text-[#4A433C] hover:text-[#211D19]'
                    }`}
                  >
                    {item.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="[grid-area:body] lg:self-start flex flex-col gap-[18px] lg:gap-[22px] mt-[26px] lg:mt-[22px] hero-in-up">
            <p className={`${L_LEAD} max-w-[500px]`}>
              Elige uno de nuestros cuatro diseños y nosotros la armamos. Tus invitados la abren desde WhatsApp y
              confirman en un toque; tú ves la lista en tiempo real.
            </p>
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-[26px] sm:gap-y-3.5">
              <LButton href={whatsappUrl(QUOTE_WHATSAPP_MESSAGE)} external className="w-full sm:w-auto">
                <LWhatsAppIcon />
                Cotiza por WhatsApp
              </LButton>
              <a
                href="#disenos"
                className="self-center sm:self-auto font-extrabold text-[15.5px] text-[#211D19] border-b-[1.5px] border-current pb-0.5"
              >
                Ábrela como invitado →
              </a>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm font-semibold text-[#6B6359] -mt-1 sm:-mt-2">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#3E9B6B] shadow-[0_0_0_4px_rgba(62,155,107,0.16)] flex-shrink-0" />
              Te respondemos en {RESPONSE_TIME}.
            </div>
            <ul className="flex flex-col gap-[9px] sm:flex-row sm:flex-wrap sm:gap-x-[22px] sm:gap-y-2.5 text-[14.5px] font-bold text-[#4A433C]">
              {guarantees.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <LCheckIcon color="#7C8363" className="flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </LSection>
  );
}
