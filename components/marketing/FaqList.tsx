'use client';

import React, { useId, useState } from 'react';
import { fraunces } from '../../lib/brand';
import type { FaqItem } from '../../lib/marketing-content';

// Acordeón de preguntas con la misma animación (300 ms) que el FAQ de la landing.
// Cliente por el estado de apertura, pero las respuestas están siempre en el HTML
// (altura 0 con overflow oculto), así que se renderizan en el servidor y se indexan.
export default function FaqList({ items, openFirst = false }: { items: FaqItem[]; openFirst?: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(openFirst ? 0 : null);
  const baseId = useId();

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div
            key={item.question}
            className="bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] px-6 md:px-7 py-5 md:py-6"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="flex w-full items-center justify-between gap-4 bg-transparent border-0 p-0 text-left text-[#211D19]"
            >
              <span className="text-[17px] md:text-lg font-medium leading-snug" style={fraunces}>
                {item.question}
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#AE5730"
                strokeWidth="2.4"
                className="flex-shrink-0 transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div
              id={panelId}
              role="region"
              style={{
                display: 'grid',
                gridTemplateRows: isOpen ? '1fr' : '0fr',
                transition: 'grid-template-rows 300ms ease',
              }}
            >
              <div style={{ overflow: 'hidden' }}>
                <p className="mt-4 pt-4 border-t border-[rgba(43,38,34,0.08)] text-[15px] text-[#5A534B] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
