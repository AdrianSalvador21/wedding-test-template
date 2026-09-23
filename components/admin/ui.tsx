'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';

// Tokens de paleta "Dashboard Neutral" (blanco / negro / grises, sin serif ni
// acentos cálidos) — ver specs/04-rediseno-paneles-admin.md, decisión tomada
// tras la propuesta A ("Romance Editorial", la misma paleta de la landing)
// porque en un panel de trabajo esa calidez lee como decorativa y compite con
// la legibilidad de datos densos. Uso: valores dinámicos en
// `style={{ color: A.ink }}`. Las clases de Tailwind con estos mismos hex se
// escriben literales (no interpoladas) para que el JIT las detecte, y viven
// únicamente en este archivo.
export const A = {
  canvas: '#FAFAFA',
  surface: '#FFFFFF',
  ink: '#0A0A0A',
  inkSoft: '#27272A',
  body: '#3F3F46',
  muted: '#71717A',
  faint: '#9CA3AF',
  border: '#D4D4D8',
  accent: '#111111',
  success: '#15803D',
  pending: '#475569',
  danger: '#B91C1C',
};

// Antes tipografiado en Fraunces (serif); ahora solo peso/tracking sobre
// Manrope — se mantiene el nombre `displayFont` (no `fraunces`) para que el
// código no sugiera una fuente que ya no se usa.
export const displayFont = { fontWeight: 800, letterSpacing: '-0.01em' };
export const manrope = { fontFamily: "'Manrope', sans-serif" };

// Navegación entre los paneles de una misma boda (Editor de invitación /
// Gestión de invitados), para poder compartir un enlace y que la otra
// persona pueda saltar al otro panel sin editar la URL a mano.
export function AdminPageNav({
  weddingId,
  locale,
  active,
}: {
  weddingId: string;
  locale: string;
  active: 'editor' | 'guests';
}) {
  const linkClass = (isActive: boolean) =>
    `text-sm px-3.5 py-1.5 rounded-lg font-semibold transition-colors ${
      isActive ? 'bg-[#F4F4F5] text-[#0A0A0A]' : 'text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#FAFAFA]'
    }`;

  return (
    <nav className="flex items-center gap-1" style={manrope}>
      <a href={`/${locale}/admin/wedding-editor/${weddingId}`} className={linkClass(active === 'editor')}>
        Editor de invitación
      </a>
      <a href={`/${locale}/admin/guests/${weddingId}`} className={linkClass(active === 'guests')}>
        Invitados
      </a>
    </nav>
  );
}

export function AdminTopBar({
  backHref,
  backLabel,
  title,
  meta,
  actions,
}: {
  backHref?: string;
  backLabel?: string;
  title: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className="bg-white border-b border-[rgba(0,0,0,0.08)] px-4 sm:px-10 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      style={manrope}
    >
      <div>
        {backHref && (
          <a
            href={backHref}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9CA3AF] hover:text-[#3F3F46] transition-colors mb-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6}>
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </a>
        )}
        <div className="text-[20px] sm:text-[24px] text-[#0A0A0A] leading-tight" style={displayFont}>
          {title}
        </div>
        {meta && <div className="flex flex-wrap items-center gap-2 mt-2">{meta}</div>}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}

const pillToneClass: Record<string, string> = {
  active: 'text-[#15803D] bg-[rgba(21,128,61,0.1)]',
  complete: 'text-[#15803D] bg-[rgba(21,128,61,0.1)]',
  confirmed: 'text-[#15803D] bg-[rgba(21,128,61,0.1)]',
  draft: 'text-[#3F3F46] bg-[#F4F4F5]',
  pending: 'text-[#475569] bg-[rgba(71,85,105,0.08)]',
  incomplete: 'text-[#475569] bg-[rgba(71,85,105,0.08)]',
  declined: 'text-[#B91C1C] bg-[rgba(185,28,28,0.08)]',
};

export function AdminStatusPill({
  tone = 'draft',
  children,
  className = '',
}: {
  tone?: 'active' | 'complete' | 'confirmed' | 'draft' | 'pending' | 'incomplete' | 'declined';
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${pillToneClass[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function AdminSidebarNavItem({
  icon: Icon,
  label,
  active,
  complete,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  complete: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-left transition-colors ${
        active ? 'bg-[#F4F4F5] text-[#0A0A0A] font-bold' : 'text-[#3F3F46] hover:bg-[#FAFAFA] font-semibold'
      }`}
    >
      <Icon className="h-[18px] w-[18px] flex-shrink-0" />
      <span className="flex-1">{label}</span>
      {complete ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth={3}>
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <span className="w-3.5 h-3.5 rounded-full border-[1.5px] border-[#D4D4D8] flex-shrink-0" />
      )}
    </button>
  );
}

export function AdminSectionChip({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 flex-shrink-0 text-[13px] px-3.5 py-2 rounded-full border whitespace-nowrap transition-colors ${
        active
          ? 'bg-[#111111] text-white border-[#111111] font-bold'
          : 'bg-[#FAFAFA] text-[#3F3F46] border-[rgba(0,0,0,0.1)] font-semibold'
      }`}
    >
      <Icon className="h-[14px] w-[14px]" />
      {label}
    </button>
  );
}

export function AdminStatCard({
  icon: Icon,
  label,
  value,
  tone = 'ink',
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: 'ink' | 'success' | 'pending' | 'accent';
}) {
  const toneColor: Record<string, string> = {
    ink: '#0A0A0A',
    success: '#15803D',
    pending: '#475569',
    accent: '#0A0A0A',
  };
  return (
    <div className="bg-white border border-[rgba(0,0,0,0.08)] rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#71717A]">
        <Icon className="h-[15px] w-[15px]" style={{ color: toneColor[tone] }} />
        {label}
      </div>
      <div className="text-[26px] sm:text-[30px] mt-1.5" style={{ ...displayFont, color: toneColor[tone] }}>
        {value}
      </div>
    </div>
  );
}

export function AdminToggle({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative flex-shrink-0 rounded-full transition-colors"
      style={{ background: checked ? A.accent : '#E4E4E7', height: '26px', width: '44px' }}
    >
      <span
        className="absolute top-[3px] rounded-full bg-white shadow transition-transform"
        style={{ width: '20px', height: '20px', left: '3px', transform: checked ? 'translateX(18px)' : 'translateX(0)' }}
      />
    </button>
  );
}

export function AdminButton({
  children,
  onClick,
  type = 'button',
  variant = 'solid',
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'ghost' | 'dashed';
  disabled?: boolean;
  className?: string;
}) {
  const variantClass = {
    solid: 'bg-[#111111] text-white border border-transparent hover:bg-black',
    ghost: 'bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA]',
    dashed: 'bg-transparent text-[#3F3F46] border border-dashed border-[rgba(0,0,0,0.18)] hover:bg-[rgba(0,0,0,0.03)]',
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg px-5 py-2.5 min-h-[44px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantClass} ${className}`}
      style={manrope}
    >
      {children}
    </button>
  );
}

export function AdminCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`bg-white border border-[rgba(0,0,0,0.08)] rounded-xl ${className}`}>{children}</div>;
}
