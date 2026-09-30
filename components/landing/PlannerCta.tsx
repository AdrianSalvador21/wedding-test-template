'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LSolidButton } from './ui';
import { whatsappUrl } from '../../lib/contact';

// Mismo mensaje que el botón de /wedding-planners, para que la analítica de ambos sea comparable.
const PLANNER_MESSAGE = 'Hola, soy wedding planner y quiero saber cómo trabajan con Invyta.';

export default function PlannerCta() {
  return (
    <LSection id="planners" tone="terracotaDark" className="py-16 md:py-20">
      <LReveal className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-12">
        <div className="flex flex-col gap-3 max-w-[640px]">
          <h2 className="text-3xl md:text-[38px] leading-[1.12] tracking-tight" style={fraunces}>
            ¿Eres wedding planner?
          </h2>
          <p className="text-base md:text-lg text-[#FBEADD] leading-relaxed">
            Todas las bodas de tus clientes en una sola cuenta: entra una vez y ve cada invitación, sus invitados y
            sus mesas, sin rehacer trabajo.
          </p>
        </div>
        <LSolidButton href={whatsappUrl(PLANNER_MESSAGE)} target="_blank" variant="ivoryDark" className="flex-shrink-0">
          Cuéntanos cuántas bodas manejas
        </LSolidButton>
      </LReveal>
    </LSection>
  );
}
