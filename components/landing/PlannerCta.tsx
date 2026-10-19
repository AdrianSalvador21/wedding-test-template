'use client';

import React from 'react';
import { fraunces, LSection, LButton, L_WRAP } from './ui';
import { whatsappUrl } from '../../lib/contact';

// Mismo mensaje que el botón de /wedding-planners, para que la analítica de ambos sea comparable.
const PLANNER_MESSAGE = 'Hola, soy wedding planner y quiero saber cómo trabajan con Invyta.';

// Franja delgada arriba del pie (spec 26): los planners ya tienen su propia página.
export default function PlannerCta() {
  return (
    <LSection id="planners" className="!bg-[#8E4222] !text-[#FBF7F1]">
      <div className={`${L_WRAP} flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-7`}>
        <div>
          <h2 className="text-2xl leading-[1.12]" style={fraunces}>
            ¿Eres wedding planner?
          </h2>
          <p className="mt-1 text-[15px] text-[#FBEADD]">Todas las bodas de tus clientes en una sola cuenta, sin rehacer trabajo.</p>
        </div>
        <LButton href={whatsappUrl(PLANNER_MESSAGE)} external variant="light" size="sm" className="w-full sm:w-auto">
          Cuéntanos cuántas bodas manejas
        </LButton>
      </div>
    </LSection>
  );
}
