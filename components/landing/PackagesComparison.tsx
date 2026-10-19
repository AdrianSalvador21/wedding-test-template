'use client';

import React, { useState } from 'react';
import { fraunces, manrope, LButton } from './ui';
import { whatsappUrl } from '../../lib/contact';
import {
  PACKAGE_COMPARISON,
  formatPrice,
  getPackage,
  type ComparisonRow,
  type PackageContent,
} from '../../lib/marketing-content';

// Comparativa compartida por la landing y /paquetes (spec 26). Desde md es una tabla con la
// columna del Personalizado oscura; en móvil, un selector con una sola tarjeta.
// Cada botón vive dentro de un contenedor con `data-track-package` (analítica, spec 11).

type PackageId = PackageContent['id'];

const basico = getPackage('basico');
const personalizado = getPackage('personalizado');
const priceGap = personalizado.price - basico.price;

const PLAN: Record<PackageId, { pkg: PackageContent; cta: string; message: string; recommended: boolean }> = {
  basico: {
    pkg: basico,
    cta: 'Elegir Básico',
    message: 'Hola, me interesa el Paquete Básico de Invyta.',
    recommended: false,
  },
  personalizado: {
    pkg: personalizado,
    cta: 'Elegir Personalizado',
    message: 'Hola, me interesa el Paquete Personalizado de Invyta.',
    recommended: true,
  },
};

// Línea de cambio bajo la tarjeta móvil: invita a ver el otro paquete.
const SWITCH: Record<PackageId, { text: string; button: string; to: PackageId }> = {
  personalizado: { text: '¿Prefieres que nosotros hagamos todo?', button: 'Ver Básico', to: 'basico' },
  basico: {
    text: `Por ${formatPrice(priceGap)} más: tu panel, una invitación para cada invitado, IA y soporte extendido.`,
    button: 'Ver Personalizado',
    to: 'personalizado',
  },
};

const shortName = (pkg: PackageContent) => pkg.name.replace('Paquete ', '');

function CheckGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function DashGlyph({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" className={className}>
      <path d="M6 12h12" />
    </svg>
  );
}

// ---------- Escritorio: tabla ----------

function TableCell({ row, id }: { row: ComparisonRow; id: PackageId }) {
  const dark = id === 'personalizado';
  if (row.text) {
    return <span className={`text-sm font-bold ${dark ? 'text-[#E3A483]' : ''}`}>{row.text[id]}</span>;
  }
  if (row[id]) {
    return (
      <span
        className={`inline-flex w-[26px] h-[26px] rounded-full items-center justify-center ${
          dark ? 'bg-[rgba(227,164,131,0.16)] text-[#E3A483]' : 'bg-[#EEF1E6] text-[#5B6342]'
        }`}
      >
        <CheckGlyph className="w-[15px] h-[15px]" />
        <span className="sr-only">Incluido</span>
      </span>
    );
  }
  return (
    <span className="text-xl text-[#C9C1B6]">
      <span aria-hidden="true">—</span>
      <span className="sr-only">No incluido</span>
    </span>
  );
}

const cell = 'px-[22px] py-[15px] border-b align-middle text-center';
const lightBorder = 'border-[rgba(43,38,34,0.1)]';
const darkCol = 'bg-[#211D19] text-[#FBF7F1] border-[rgba(251,247,241,0.1)]';

function HeadCell({ id }: { id: PackageId }) {
  const { pkg, recommended } = PLAN[id];
  return (
    <th
      scope="col"
      className={`px-[22px] pt-[30px] pb-6 border-b align-top text-center font-normal ${
        recommended ? darkCol : lightBorder
      }`}
    >
      {recommended && (
        <span className="inline-block bg-[#AE5730] text-[#FBF7F1] text-[11px] font-extrabold tracking-[0.08em] uppercase px-[11px] py-[5px] rounded-full mb-2.5">
          Recomendado
        </span>
      )}
      <span className="block text-2xl" style={fraunces}>
        {shortName(pkg)}
      </span>
      <span className="block mt-1.5 text-[46px] leading-[1.05]" style={fraunces}>
        {formatPrice(pkg.price)}
        <small className={`text-sm font-extrabold ${recommended ? 'text-[#CFC6BA]' : 'text-[#6B6359]'}`} style={manrope}>
          {' '}
          {pkg.currency}
        </small>
      </span>
      <span className={`block mt-1 text-[13.5px] font-semibold ${recommended ? 'text-[#CFC6BA]' : 'text-[#6B6359]'}`}>
        {pkg.tagline}
      </span>
    </th>
  );
}

function ComparisonTable() {
  return (
    <div className="hidden md:block bg-white border border-[rgba(43,38,34,0.1)] rounded-[28px] shadow-[0_30px_60px_rgba(43,38,34,0.08)] overflow-hidden">
      <table className="w-full border-separate border-spacing-0 text-[15px] text-[#211D19]">
        <caption className="sr-only">Comparativa entre el Paquete Básico y el Paquete Personalizado</caption>
        <thead>
          <tr>
            <td className={`px-[22px] pb-6 border-b ${lightBorder} w-[46%]`} />
            <HeadCell id="basico" />
            <HeadCell id="personalizado" />
          </tr>
        </thead>
        <tbody>
          {PACKAGE_COMPARISON.map((group) => (
            <React.Fragment key={group.title}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={2}
                  className={`px-[22px] py-2.5 border-b ${lightBorder} bg-[#FBF7F1] text-left text-[11.5px] font-extrabold tracking-[0.14em] uppercase text-[#AE5730]`}
                >
                  {group.title}
                </th>
                <td className="px-[22px] py-2.5 border-b border-[rgba(251,247,241,0.1)] bg-[#2A2521]" />
              </tr>
              {group.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className={`${cell} ${lightBorder} !text-left w-[46%] font-semibold text-[#4A433C]`}>
                    {row.label}
                  </th>
                  <td className={`${cell} ${lightBorder}`}>
                    <TableCell row={row} id="basico" />
                  </td>
                  <td className={`${cell} ${darkCol}`}>
                    <TableCell row={row} id="personalizado" />
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td className="px-[22px] pt-6 pb-7 text-left text-[13.5px] font-semibold text-[#6B6359]">
              En línea hasta 15 días después de tu boda.
            </td>
            {(['basico', 'personalizado'] as const).map((id) => (
              <td key={id} className={`px-[22px] pt-6 pb-7 text-center ${id === 'personalizado' ? 'bg-[#211D19]' : ''}`}>
                <div data-track-package={id}>
                  <LButton
                    href={whatsappUrl(PLAN[id].message)}
                    external
                    variant={PLAN[id].recommended ? 'primary' : 'outline'}
                    className="w-full max-w-[240px]"
                  >
                    {PLAN[id].cta}
                  </LButton>
                </div>
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ---------- Móvil: selector + una tarjeta ----------

function MobileCard({ id }: { id: PackageId }) {
  const { pkg, recommended, cta, message } = PLAN[id];
  const dark = recommended;
  return (
    <div
      aria-live="polite"
      className={`mt-3.5 rounded-3xl px-5 py-6 flex flex-col gap-3.5 border ${
        dark
          ? 'bg-[#211D19] text-[#FBF7F1] border-[#211D19] shadow-[0_26px_50px_rgba(33,29,25,0.28)]'
          : 'bg-white text-[#211D19] border-[rgba(43,38,34,0.1)] shadow-[0_22px_44px_rgba(43,38,34,0.09)]'
      }`}
    >
      <div className="flex justify-between items-start gap-2.5">
        <span className="text-2xl leading-[1.1]" style={fraunces}>
          {shortName(pkg)}
        </span>
        {recommended && (
          <span className="bg-[#AE5730] text-[#FBF7F1] text-[10.5px] font-extrabold tracking-[0.08em] uppercase px-2.5 py-[5px] rounded-full whitespace-nowrap">
            Recomendado
          </span>
        )}
      </div>
      <span className="text-[44px] leading-none" style={fraunces}>
        {formatPrice(pkg.price)}
        <small className={`text-sm font-extrabold ${dark ? 'text-[#CFC6BA]' : 'text-[#6B6359]'}`} style={manrope}>
          {' '}
          {pkg.currency}
        </small>
      </span>
      <span className={`-mt-1.5 text-[14.5px] font-semibold ${dark ? 'text-[#CFC6BA]' : 'text-[#6B6359]'}`}>{pkg.tagline}</span>
      {PACKAGE_COMPARISON.map((group) => (
        <React.Fragment key={group.title}>
          <span
            className={`pt-3 border-t text-[11px] font-extrabold tracking-[0.14em] uppercase ${
              dark ? 'text-[#E3A483] border-[rgba(251,247,241,0.12)]' : 'text-[#AE5730] border-[rgba(43,38,34,0.1)]'
            }`}
          >
            {group.title}
          </span>
          <ul className="flex flex-col gap-[11px]">
            {group.rows.map((row) => {
              const included = row.text ? true : row[id];
              return (
                <li
                  key={row.label}
                  className={`grid grid-cols-[22px_1fr] gap-2.5 items-start text-[14.5px] leading-[1.4] ${
                    included ? '' : 'text-[#8A837A]'
                  }`}
                >
                  <span
                    className={`w-[22px] h-[22px] rounded-full flex items-center justify-center ${
                      !included
                        ? 'border-[1.5px] border-[#D8D0C4] text-[#C2B9AD]'
                        : dark
                          ? 'bg-[rgba(227,164,131,0.16)] text-[#E3A483]'
                          : 'bg-[#EEF1E6] text-[#5B6342]'
                    }`}
                  >
                    {included ? <CheckGlyph className="w-[13px] h-[13px]" /> : <DashGlyph className="w-[13px] h-[13px]" />}
                  </span>
                  <span>
                    <span className={included ? '' : 'line-through decoration-[rgba(138,131,122,0.5)]'}>{row.label}</span>
                    {!included && <span className="sr-only"> (no incluido)</span>}
                    {row.text && (
                      <span className={`block text-[12.5px] font-extrabold ${dark ? 'text-[#E3A483]' : 'text-[#AE5730]'}`}>
                        {row.text[id]}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </React.Fragment>
      ))}
      <div data-track-package={id} className="mt-1">
        <LButton href={whatsappUrl(message)} external variant={recommended ? 'primary' : 'outline'} className="w-full">
          {cta}
        </LButton>
      </div>
    </div>
  );
}

function MobileSelector() {
  // Arranca en el Personalizado, el paquete recomendado.
  const [selected, setSelected] = useState<PackageId>('personalizado');
  const options: { id: PackageId; detail: string }[] = [
    { id: 'personalizado', detail: `${formatPrice(personalizado.price)} · Recomendado` },
    { id: 'basico', detail: formatPrice(basico.price) },
  ];
  const change = SWITCH[selected];

  return (
    <div className="md:hidden">
      <div role="group" aria-label="Elegir paquete" className="grid grid-cols-2 gap-1 bg-white border border-[rgba(43,38,34,0.1)] rounded-[20px] p-1">
        {options.map((option) => {
          const pressed = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={pressed}
              onClick={() => setSelected(option.id)}
              className={`rounded-2xl px-2 py-2.5 flex flex-col items-center gap-px ${
                pressed ? 'bg-[#211D19] text-[#FBF7F1]' : 'text-[#4A433C]'
              }`}
            >
              <b className="text-[14.5px] font-extrabold">{shortName(PLAN[option.id].pkg)}</b>
              <span className={`text-[12.5px] font-bold ${pressed ? 'text-[#E3A483]' : 'text-[#6B6359]'}`}>{option.detail}</span>
            </button>
          );
        })}
      </div>
      <MobileCard id={selected} />
      <p className="mt-3.5 text-center text-sm leading-[1.5] text-[#4A433C]">
        {change.text}{' '}
        <button
          type="button"
          onClick={() => setSelected(change.to)}
          className="ml-1 font-extrabold text-sm text-[#AE5730] border-b-[1.5px] border-current"
        >
          {change.button}
        </button>
      </p>
    </div>
  );
}

export default function PackagesComparison() {
  return (
    <div>
      <ComparisonTable />
      <MobileSelector />
    </div>
  );
}
