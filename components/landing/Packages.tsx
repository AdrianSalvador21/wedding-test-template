'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LCard, LDivider, LSolidButton, LCheckIcon, LXIcon } from './ui';

const WHATSAPP_LINK = 'https://wa.me/529602460590';

const basicoGroups = [
  {
    title: 'Tu página web',
    text: 'Página tipo plantilla, enlace único para compartir, dominio/hosting incluido hasta 15 días después del evento, entrega en 7 días hábiles.',
  },
  {
    title: 'Contenido de tu boda',
    text: 'Bienvenida, cuenta regresiva, detalles del evento, nuestra historia, galería de fotos, cronograma y código de vestimenta.',
  },
  {
    title: 'Logística para invitados',
    text: 'Mesa de regalos, hospedaje recomendado y sección de solo adultos.',
  },
  {
    title: 'Confirmación y gestión',
    text: 'Formulario de confirmación y gestión de invitados confirmados.',
  },
];

const basicoNoIncluye =
  'Personalización por invitado (URL, mensaje, idioma, boletos o canción individuales).';

const personalizadoGroups = [
  {
    title: 'Tu página web',
    text: 'Completamente personalizada, enlace único para redes, dominio/hosting incluido, entrega rápida en 7 días hábiles.',
  },
  {
    title: 'Contenido a tu medida',
    text: 'Bienvenida personalizada, cuenta regresiva dinámica, detalles completos, nuestra historia, galería profesional, cronograma detallado y código de vestimenta elegante.',
  },
  {
    title: 'Logística para invitados',
    text: 'Mesa de regalos integrada, hospedaje recomendado y sección solo adultos.',
  },
  {
    title: 'Panel de edición y gestión',
    text: 'Cambia tu invitación y controla confirmaciones e invitados cuando quieras, sin depender de nosotros.',
  },
  {
    title: 'Personalización 1:1',
    text: 'URL y bienvenida únicas por invitado, idioma (ES/EN) y canción en la invitación.',
  },
  {
    title: 'Soporte',
    text: 'Extendido, 7 días antes del evento.',
  },
];

export default function Packages() {
  return (
    <LSection id="paquetes" tone="gradient" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Paquetes diseñados para ti
          </h2>
          <p className="text-base text-[#5A534B]">Elige el paquete que mejor se adapte a tus necesidades.</p>
        </LReveal>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          {/* Paquete Básico */}
          <LCard variant="default" className="p-9 flex flex-col gap-5 shadow-[0_24px_48px_rgba(43,38,34,0.08)]">
            <div className="flex flex-col gap-1.5">
              <span className="text-2xl text-[#211D19]" style={fraunces}>
                Paquete Básico
              </span>
              <div>
                <span className="text-[38px] text-[#211D19]" style={fraunces}>
                  $2,000
                </span>
                <span className="text-[15px] text-[#8A837A]"> MXN</span>
              </div>
              <span className="text-sm text-[#8A837A]">Perfecto para bodas tradicionales</span>
            </div>
            <LDivider />
            <div className="flex flex-col gap-3.5">
              {basicoGroups.map((group) => (
                <div key={group.title} className="flex items-start gap-2.5">
                  <LCheckIcon color="#7C8363" className="flex-shrink-0 mt-1" />
                  <span className="text-sm text-[#4A433C] leading-relaxed">
                    <span className="font-semibold text-[#211D19]">{group.title}: </span>
                    {group.text}
                  </span>
                </div>
              ))}
            </div>
            <LDivider />
            <div className="flex items-start gap-2.5">
              <LXIcon className="flex-shrink-0 mt-1" />
              <span className="text-sm text-[#6B655C] leading-relaxed">
                <span className="font-medium text-[#211D19]">No incluye: </span>
                {basicoNoIncluye}
              </span>
            </div>
            <LSolidButton href={WHATSAPP_LINK} target="_blank" variant="dark" className="mt-2 w-full">
              Elegir Básico
            </LSolidButton>
          </LCard>

          {/* Paquete Personalizado */}
          <LCard variant="dark" className="relative p-9 flex flex-col gap-5 shadow-[0_32px_64px_rgba(43,38,34,0.24)] overflow-hidden">
            <div className="absolute top-7 -right-2 bg-[#C6663C] text-[#FBF7F1] px-[18px] py-2 rounded-l-full text-xs font-bold tracking-wide uppercase">
              Recomendado
            </div>
            <div className="flex flex-col gap-1.5 mt-8 md:mt-2">
              <span className="text-2xl" style={fraunces}>
                Paquete Personalizado
              </span>
              <div>
                <span className="text-[38px]" style={fraunces}>
                  $2,400
                </span>
                <span className="text-[15px] text-[#D8CFC4]"> MXN</span>
              </div>
              <span className="text-sm text-[#D8CFC4]">Experiencia completamente personalizada</span>
            </div>
            <LDivider tone="dark" />
            <div className="flex flex-col gap-3.5">
              {personalizadoGroups.map((group) => (
                <div key={group.title} className="flex items-start gap-2.5">
                  <LCheckIcon color="#E3A483" className="flex-shrink-0 mt-1" />
                  <span className="text-sm leading-relaxed">
                    <span className="font-semibold">{group.title}: </span>
                    {group.text}
                  </span>
                </div>
              ))}
            </div>
            <LSolidButton href={WHATSAPP_LINK} target="_blank" variant="ivory" className="mt-2 w-full">
              Elegir Personalizado
            </LSolidButton>
          </LCard>
        </div>
      </div>
    </LSection>
  );
}
