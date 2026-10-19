'use client';

import React from 'react';
import { fraunces, LSection, LChatIcon, L_WRAP, L_EYEBROW, L_LEAD } from './ui';
import { PAYMENT, RESPONSE_TIME, depositLabel } from '../../lib/marketing-content';

// Confianza sin reseñas (spec 26): la forma de pago es la garantía principal. Cuando haya 3 o más
// reseñas con permiso se suman aquí, en otro spec. Las cifras salen de PAYMENT y RESPONSE_TIME.

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  className: 'w-[22px] h-[22px]',
};

const guarantees: { big?: string; icon?: React.ReactNode; title: string; text: string }[] = [
  {
    big: depositLabel,
    title: `de anticipo por ${PAYMENT.method}`,
    text: 'Con eso apartamos tu fecha y empezamos a armar tu invitación.',
  },
  {
    icon: (
      <svg {...iconProps}>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: 'Pagas el resto al verla lista',
    text: 'Revisas tu invitación terminada en tu celular y entonces liquidas.',
  },
  {
    icon: (
      <svg {...iconProps}>
        <path d="M4 4v6h6M20 20v-6h-6M20 10A8 8 0 006.3 5.3M4 14a8 8 0 0013.7 4.7" />
      </svg>
    ),
    title: 'Revisiones ilimitadas',
    text: 'Pide los ajustes que necesites antes de la entrega. Sin límite.',
  },
  {
    icon: <LChatIcon />,
    title: `Respuesta en ${RESPONSE_TIME}`,
    text: 'Te acompañamos por WhatsApp de la primera pregunta a la entrega.',
  },
];

export default function TrustSection() {
  return (
    <LSection id="confianza" tone="white" className="py-[60px] md:py-[88px]">
      <div className={`${L_WRAP} grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-8 md:gap-16 items-center`}>
        <div className="flex flex-col gap-3.5 max-w-[720px]">
          <span className={L_EYEBROW}>Sin riesgo para empezar</span>
          <h2 className="text-[31px] md:text-[40px] leading-[1.12] tracking-[-0.01em] [text-wrap:balance] text-[#211D19]" style={fraunces}>
            Empiezas con {depositLabel}.{' '}
            <em className="italic text-[#C6663C]">El resto, cuando ya la viste terminada.</em>
          </h2>
          <p className={L_LEAD}>
            Sabemos que es tu boda y que pagar por adelantado a alguien que no conoces da desconfianza. Por eso
            trabajamos así.
          </p>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 border border-[rgba(43,38,34,0.1)] rounded-3xl overflow-hidden">
          {guarantees.map((item, index) => (
            <li
              key={item.title}
              className={`p-5 md:px-[26px] md:pt-[26px] md:pb-7 flex flex-col gap-2.5 border-[rgba(43,38,34,0.1)] ${
                index < guarantees.length - 1 ? 'border-b' : ''
              } ${index % 2 === 0 ? 'md:border-r' : ''} ${index < 2 ? 'md:border-b' : 'md:border-b-0'}`}
            >
              {item.big ? (
                <span className="text-[34px] leading-none text-[#AE5730]" style={fraunces}>
                  {item.big}
                </span>
              ) : (
                <span className="w-11 h-11 rounded-[13px] bg-[#EEF1E6] text-[#5B6342] flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <h3 className="text-[21px] leading-[1.2] text-[#211D19]" style={fraunces}>
                {item.title}
              </h3>
              <p className="text-[14.5px] leading-[1.5] text-[#6B6359]">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </LSection>
  );
}
