'use client';

import React from 'react';
import { fraunces, LSection, L_WRAP, L_EYEBROW, L_H2, L_LEAD } from './ui';
import { LANDING_FAQ_QUESTIONS, RESPONSE_TIME, getFaq } from '../../lib/marketing-content';
import { whatsappUrl } from '../../lib/contact';

const faqItems = LANDING_FAQ_QUESTIONS.map(getFaq);

const QUESTION_MESSAGE = 'Hola! Tengo una pregunta sobre Invyta.';

// FAQ v4 (spec 26): columna izquierda fija con la salida a WhatsApp y las 8 preguntas a la derecha.
// <details> nativo: las respuestas están en el HTML inicial y se abren sin JavaScript.
export default function FAQ() {
  return (
    <LSection id="faq" className="py-16 md:py-24">
      <div className={`${L_WRAP} grid grid-cols-1 md:grid-cols-[0.8fr_1.2fr] gap-7 md:gap-16 items-start`}>
        <div className="md:sticky md:top-[110px] flex flex-col gap-[18px]">
          <span className={L_EYEBROW}>Preguntas frecuentes</span>
          <h2 className={`${L_H2} text-[#211D19]`} style={fraunces}>
            Lo que casi todas las parejas preguntan
          </h2>
          <p className={L_LEAD}>¿No está tu pregunta? Escríbenos y te respondemos en {RESPONSE_TIME}.</p>
          <a
            href={whatsappUrl(QUESTION_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start font-extrabold text-[15.5px] text-[#AE5730] border-b-[1.5px] border-current pb-0.5"
          >
            Pregúntanos por WhatsApp →
          </a>
        </div>
        <div className="flex flex-col gap-3">
          {faqItems.map((item, index) => (
            <details
              key={item.question}
              open={index === 0}
              className="group bg-white border border-[rgba(43,38,34,0.1)] rounded-2xl md:rounded-[18px] px-4 md:px-[22px] transition-shadow duration-200 open:shadow-[0_14px_30px_rgba(43,38,34,0.07)]"
            >
              <summary className="list-none [&::-webkit-details-marker]:hidden cursor-pointer flex justify-between items-center gap-4 py-4 md:py-[19px] text-[16.5px] md:text-[18.5px] leading-[1.3] text-[#211D19]" style={fraunces}>
                <span>{item.question}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                  className="w-5 h-5 text-[#AE5730] flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className="pt-3.5 pb-5 border-t border-[rgba(43,38,34,0.1)] text-[15px] leading-[1.6] text-[#4A433C]">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </LSection>
  );
}
