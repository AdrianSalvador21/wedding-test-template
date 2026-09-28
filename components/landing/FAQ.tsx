'use client';

import React, { useState } from 'react';
import { fraunces, LSection, LReveal } from './ui';
import { LANDING_FAQ_QUESTIONS, getFaq } from '../../lib/marketing-content';

const faqItems = LANDING_FAQ_QUESTIONS.map(getFaq);
const half = Math.ceil(faqItems.length / 2);
const columns = [faqItems.slice(0, half), faqItems.slice(half)];

export default function FAQ() {
  // Una pregunta abierta a la vez; la primera arranca abierta (diseño v2).
  const [openQuestion, setOpenQuestion] = useState<string | null>(faqItems[0]?.question ?? null);

  return (
    <LSection id="faq" tone="ivory" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#AE5730]">Preguntas frecuentes</span>
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Lo que casi todas las parejas preguntan
          </h2>
        </LReveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4 items-start max-w-[1100px] w-full mx-auto">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-col gap-4">
              {column.map((item) => {
                const isOpen = openQuestion === item.question;
                const panelId = `faq-${columnIndex}-${faqItems.indexOf(item)}`;
                return (
                  <div
                    key={item.question}
                    className="bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] px-6 py-5"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenQuestion(isOpen ? null : item.question)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="flex w-full items-center justify-between gap-4 bg-transparent border-0 p-0 text-left text-[#211D19]"
                    >
                      <span className="text-[17px] font-medium leading-snug" style={fraunces}>
                        {item.question}
                      </span>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#AE5730"
                        strokeWidth="2.4"
                        aria-hidden="true"
                        className="flex-shrink-0 transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <div
                      id={panelId}
                      style={{
                        display: 'grid',
                        gridTemplateRows: isOpen ? '1fr' : '0fr',
                        transition: 'grid-template-rows 300ms ease',
                      }}
                    >
                      <div style={{ overflow: 'hidden' }}>
                        <p className="mt-4 pt-4 border-t border-[rgba(43,38,34,0.08)] text-sm text-[#5A534B] leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="text-center">
          <a href="/preguntas-frecuentes" className="text-[15px] font-bold text-[#AE5730] hover:text-[#8E4222]">
            Ver todas las preguntas →
          </a>
        </div>
      </div>
    </LSection>
  );
}
