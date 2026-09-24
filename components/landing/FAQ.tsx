'use client';

import React, { useState } from 'react';
import { fraunces, LSection, LReveal } from './ui';

const faqItems = [
  {
    question: '¿Tengo que diseñar mi invitación?',
    answer: 'No. Tú eliges un diseño, completamos juntos la información de tu boda, y nosotros la preparamos.',
  },
  {
    question: '¿Mis invitados necesitan descargar una aplicación?',
    answer: 'No. La invitación funciona directo desde el navegador del celular.',
  },
  {
    question: '¿Cómo reciben la invitación mis invitados?',
    answer: 'Por WhatsApp, mensaje, correo o el medio que prefieras — es un enlace único.',
  },
  {
    question: '¿Puedo saber quién confirmó?',
    answer: 'Sí. Las confirmaciones aparecen en tu panel en tiempo real.',
  },
  {
    question: '¿Puedo limitar cuántos invitados puede llevar cada persona?',
    answer:
      'Sí, en el Paquete Personalizado, que incluye invitaciones individuales con número de lugares por invitado.',
  },
  {
    question: '¿Puedo cambiar la información después de publicar?',
    answer:
      'Sí, tú editas tu invitación y gestionas tus invitados cuando quieras, sin depender de nosotros.',
  },
  {
    question: '¿Cuánto tarda la entrega?',
    answer: '7 días hábiles.',
  },
  {
    question: '¿Puedo tener mi invitación en otro idioma?',
    answer: 'Sí, en el Paquete Personalizado puedes personalizar el idioma de tu invitación, eligiendo entre español e inglés para cada uno de tus invitados.',
  },
  {
    question: '¿La IA publica cosas en mi invitación sin que yo lo sepa?',
    answer:
      'Nunca. Todo lo que genera aparece como borrador en tu editor y solo se publica cuando tú das clic en Guardar.',
  },
  {
    question: '¿La IA viene en el Paquete Básico?',
    answer:
      'No, es parte del Paquete Personalizado, junto con el panel de edición y las invitaciones individuales por invitado.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <LSection id="faq" tone="ivory" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#C6663C]">FAQ</span>
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Preguntas frecuentes
          </h2>
          <p className="text-base text-[#5A534B] max-w-[560px]">
            Todo lo que necesitas saber antes de crear tu invitación.
          </p>
        </LReveal>
        <div className="max-w-[760px] w-full mx-auto flex flex-col gap-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={item.question}
                className="bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] px-7 py-6"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 bg-transparent border-0 p-0 text-left text-[#211D19]"
                >
                  <span className="text-md font-medium" style={fraunces}>
                    {item.question}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#C6663C"
                    strokeWidth="2.4"
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div
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
      </div>
    </LSection>
  );
}
