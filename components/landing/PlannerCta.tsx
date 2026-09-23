'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LSolidButton } from './ui';

const WHATSAPP_LINK = 'https://wa.me/529602460590';

export default function PlannerCta() {
  return (
    <LSection tone="terracota" className="py-20">
      <LReveal className="max-w-4xl mx-auto px-6 flex flex-col items-center gap-5 text-center">
        <h2 className="text-3xl md:text-[36px]" style={fraunces}>
          ¿Eres wedding planner?
        </h2>
        <p className="text-base text-[#FBEADD] max-w-[520px]">
          Tenemos beneficios especiales para ti y para tus clientes.
        </p>
        <LSolidButton href={WHATSAPP_LINK} target="_blank" variant="ivory" className="mt-1">
          Habla con nosotros
        </LSolidButton>
        <span className="text-[13px] text-[#FBEADD]">Respuesta en menos de 24 horas</span>
      </LReveal>
    </LSection>
  );
}
