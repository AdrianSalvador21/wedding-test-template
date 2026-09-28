'use client';

import React from 'react';
import { fraunces, LSection, LReveal, LCard, LDivider, LSolidButton, LCheckIcon, LXIcon } from './ui';
import { getPackage, formatPrice, type PackageHighlight } from '../../lib/marketing-content';
import { whatsappUrl } from '../../lib/contact';

const basico = getPackage('basico');
const personalizado = getPackage('personalizado');

// Diferencia de precio calculada de PACKAGES: si cambia un precio, este texto se actualiza solo.
const priceGap = personalizado.price - basico.price;

function NewPill() {
  return (
    <span className="inline-block bg-[#E3A483] text-[#211D19] text-[10px] md:text-[11px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full mr-2 align-middle">
      Nuevo
    </span>
  );
}

function HighlightText({ highlight }: { highlight: PackageHighlight }) {
  return (
    <>
      {highlight.isNew && <NewPill />}
      {highlight.strong && <strong className="font-bold">{highlight.strong}</strong>}
      {highlight.text}
    </>
  );
}

export default function Packages() {
  return (
    <LSection id="paquetes" tone="gradient" className="py-20 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col gap-12">
        <LReveal className="flex flex-col items-center gap-3.5 text-center">
          <span className="text-[13px] font-bold tracking-[3px] uppercase text-[#AE5730]">Paquetes y precios</span>
          <h2 className="text-3xl md:text-[40px]" style={fraunces}>
            Dos paquetes, precio fijo
          </h2>
          <p className="text-base text-[#5A534B]">Sin costo extra por cada invitación que envíes.</p>
        </LReveal>

        <div className="flex flex-col gap-7 max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-7 items-start">
            {/* Paquete Básico: visualmente secundario. En móvil va después del Personalizado. */}
            <LCard
              variant="default"
              trackPackage="basico"
              className="order-2 md:order-1 md:mt-10 p-7 md:p-9 flex flex-col gap-5 shadow-[0_24px_48px_rgba(43,38,34,0.08)]"
            >
              <div className="flex flex-col gap-1.5">
                <span className="text-2xl text-[#211D19]" style={fraunces}>
                  {basico.name}
                </span>
                <div>
                  <span className="text-[44px] md:text-[52px] leading-tight text-[#211D19]" style={fraunces}>
                    {formatPrice(basico.price)}
                  </span>
                  <span className="text-base font-bold text-[#5A534B]"> {basico.currency}</span>
                </div>
                <span className="text-[15px] text-[#5A534B]">{basico.forWho}</span>
              </div>
              <LDivider />
              <ul className="flex flex-col gap-3.5">
                {basico.highlights.map((highlight) => (
                  <li key={`${highlight.strong ?? ''}${highlight.text}`} className="flex items-start gap-3">
                    <LCheckIcon color="#5B6342" className="flex-shrink-0 mt-0.5" />
                    <span className="text-[15px] text-[#4A433C] leading-snug">
                      {highlight.strong ? (
                        <>
                          <strong className="font-bold text-[#211D19]">{highlight.strong}</strong>
                          {highlight.text}
                        </>
                      ) : (
                        highlight.text
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex items-start gap-3 bg-[#FBF7F1] border border-[rgba(43,38,34,0.1)] rounded-2xl px-4 py-3.5">
                <LXIcon color="#8A837A" className="flex-shrink-0 mt-0.5" />
                <span className="text-sm text-[#5A534B] leading-relaxed">
                  <span className="font-bold text-[#211D19]">No incluye: </span>
                  {basico.notIncluded}
                </span>
              </div>
              <LSolidButton
                href={whatsappUrl('Hola, me interesa el Paquete Básico de Invyta.')}
                target="_blank"
                variant="dark"
                className="mt-1 w-full"
              >
                Elegir Básico
              </LSolidButton>
            </LCard>

            {/* Paquete Personalizado: más ancho y oscuro para que sea el primero que llame la atención. */}
            <LCard
              variant="dark"
              trackPackage="personalizado"
              className="order-1 md:order-2 relative p-7 md:p-9 flex flex-col gap-5 shadow-[0_36px_72px_rgba(33,29,25,0.3)]"
            >
              <span className="self-start md:absolute md:top-8 md:right-8 bg-[#AE5730] text-[#FBF7F1] text-xs font-extrabold tracking-wide uppercase px-4 py-2 rounded-full">
                Recomendado
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="text-2xl" style={fraunces}>
                  {personalizado.name}
                </span>
                <div>
                  <span className="text-[44px] md:text-[52px] leading-tight" style={fraunces}>
                    {formatPrice(personalizado.price)}
                  </span>
                  <span className="text-base font-bold text-[#D8CFC4]"> {personalizado.currency}</span>
                </div>
                <span className="text-[15px] text-[#D8CFC4]">
                  Solo {formatPrice(priceGap)} {personalizado.currency} más que el Básico, con panel, mesas e IA.
                </span>
              </div>
              <LDivider tone="dark" />
              <p className="text-sm font-extrabold tracking-[0.06em] uppercase text-[#E3A483]">
                Todo lo del Básico, y además
              </p>
              <ul className="flex flex-col gap-3.5">
                {personalizado.highlights.map((highlight) => (
                  <li
                    key={`${highlight.strong ?? ''}${highlight.text}`}
                    className={`flex items-start gap-3 ${
                      highlight.isNew
                        ? '-mx-3.5 px-3.5 py-3 rounded-xl bg-[rgba(227,164,131,0.12)] border border-[rgba(227,164,131,0.4)]'
                        : ''
                    }`}
                  >
                    <LCheckIcon color="#E3A483" className="flex-shrink-0 mt-0.5" />
                    <span className="text-[15px] leading-snug">
                      <HighlightText highlight={highlight} />
                    </span>
                  </li>
                ))}
              </ul>
              <LSolidButton
                href={whatsappUrl('Hola, me interesa el Paquete Personalizado de Invyta.')}
                target="_blank"
                variant="ivoryDark"
                className="mt-1 w-full"
              >
                Elegir Personalizado
              </LSolidButton>
            </LCard>
          </div>

          {/* Quién hace los cambios en cada paquete */}
          <div className="grid md:grid-cols-2 bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] overflow-hidden">
            <div className="px-7 py-5 flex flex-col gap-1">
              <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#AE5730]">Si eliges Básico</span>
              <span className="text-[15px] leading-relaxed text-[#4A433C]">
                Nos mandas los cambios y <strong>Invyta los publica por ti</strong>.
              </span>
            </div>
            <div className="px-7 py-5 flex flex-col gap-1 bg-[#FBF7F1] border-t md:border-t-0 md:border-l border-[rgba(43,38,34,0.1)]">
              <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#AE5730]">Si eliges Personalizado</span>
              <span className="text-[15px] leading-relaxed text-[#4A433C]">
                Ajustas tus datos <strong>desde tu panel</strong> cuando quieras, y nos escribes para cambios visuales.
              </span>
            </div>
          </div>
        </div>
      </div>
    </LSection>
  );
}
