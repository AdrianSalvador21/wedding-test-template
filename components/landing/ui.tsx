'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

// Tokens de paleta "Romance Editorial" (ver specs/03-rediseno-landing.md).
// Uso: valores dinámicos en `style={{ color: L.terracota }}`. Las clases de
// Tailwind con estos mismos hex se escriben literales (no interpoladas) para
// que el JIT las detecte. Los tokens viven en lib/brand.ts (spec 10) para que
// también los usen los Server Components de las páginas de marketing.
import { L, fraunces, manrope } from '../../lib/brand';

export { L, fraunces, manrope };

export function LSection({
  id,
  children,
  className = '',
  tone = 'ivory',
  border = false,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: 'ivory' | 'white' | 'charcoal' | 'terracota' | 'terracotaDark' | 'sand' | 'gradient';
  border?: boolean;
  style?: React.CSSProperties;
}) {
  const toneClass = {
    ivory: 'bg-[#FBF7F1] text-[#2B2622]',
    white: 'bg-white text-[#2B2622]',
    charcoal: 'bg-[#211D19] text-[#FBF7F1]',
    terracota: 'bg-[#C6663C] text-[#FBF7F1]',
    // Contraste AA con texto marfil (4.68:1), a diferencia de #C6663C (3.67:1).
    terracotaDark: 'bg-[#AE5730] text-[#FBF7F1]',
    sand: 'bg-[#F6EFE4] text-[#2B2622]',
    gradient: 'bg-gradient-to-b from-[#FBF7F1] to-[#F3E7D8] text-[#2B2622]',
  }[tone];
  const borderClass = border ? 'border-t border-[rgba(43,38,34,0.08)]' : '';

  return (
    // scroll-mt: los saltos a `/#seccion` no quedan debajo del Nav fijo (62 px; 76 px desde lg).
    <section id={id} className={`scroll-mt-[62px] lg:scroll-mt-[76px] ${toneClass} ${borderClass} ${className}`} style={{ ...manrope, ...style }}>
      {children}
    </section>
  );
}

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const staggerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export function LReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

export function LStagger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={staggerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  );
}

export function LStaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div className={className} variants={revealVariants} transition={{ duration: 0.6, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

export function LCard({
  children,
  className = '',
  variant = 'default',
  trackPackage,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'accent' | 'ivory';
  // Marca la tarjeta como un paquete para la analítica (spec 11: `data-track-package`).
  trackPackage?: 'basico' | 'personalizado';
}) {
  const variantClass = {
    default: 'bg-white border border-[rgba(43,38,34,0.1)] text-[#2B2622]',
    dark: 'bg-[#211D19] text-[#FBF7F1]',
    accent: 'bg-[#C6663C] text-[#FBF7F1]',
    ivory: 'bg-[#FBF7F1] border border-[rgba(43,38,34,0.08)] text-[#2B2622]',
  }[variant];

  return (
    <div data-track-package={trackPackage} className={`rounded-2xl ${variantClass} ${className}`}>
      {children}
    </div>
  );
}

export function LDivider({ className = '', tone = 'light' }: { className?: string; tone?: 'light' | 'dark' }) {
  const color = tone === 'dark' ? 'bg-[rgba(251,247,241,0.15)]' : 'bg-[rgba(43,38,34,0.1)]';
  return <div className={`h-px w-full ${color} ${className}`} />;
}

export function LEyebrow({
  children,
  withRule = false,
  tone = 'terracota',
  className = '',
}: {
  children: React.ReactNode;
  withRule?: boolean;
  tone?: 'terracota' | 'ivory';
  className?: string;
}) {
  const textClass = tone === 'terracota' ? 'text-[#C6663C]' : 'text-[#FBF7F1]';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {withRule && <span className="w-8 h-px bg-[#C6663C]" />}
      <span className={`text-[13px] font-bold tracking-[3px] uppercase ${textClass}`}>{children}</span>
    </div>
  );
}

export function LSolidButton({
  children,
  href,
  onClick,
  target,
  variant = 'terracota',
  className = '',
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  target?: string;
  variant?: 'dark' | 'terracota' | 'terracotaDark' | 'ivory' | 'ivoryDark';
  className?: string;
}) {
  const variantClass = {
    dark: 'bg-[#211D19] text-[#FBF7F1] hover:bg-[#171310]',
    terracota: 'bg-[#C6663C] text-[#FBF7F1] hover:bg-[#AE5730] shadow-[0_12px_28px_rgba(198,102,60,0.3)]',
    ivory: 'bg-[#FBF7F1] text-[#C6663C] hover:bg-[#F3E7D8]',
    // Variantes de las páginas de marketing (spec 10): contraste AA con texto pequeño.
    terracotaDark: 'bg-[#AE5730] text-[#FBF7F1] hover:bg-[#8F4524] shadow-[0_12px_28px_rgba(198,102,60,0.3)]',
    ivoryDark: 'bg-[#FBF7F1] text-[#AE5730] hover:bg-[#F3E7D8]',
  }[variant];
  const classes = `inline-flex items-center justify-center rounded-full px-8 py-4 text-[15px] font-semibold transition-colors ${variantClass} ${className}`;

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        onClick={onClick}
        className={classes}
      >
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

export function LTextLink({
  children,
  href,
  target,
  className = '',
}: {
  children: React.ReactNode;
  href: string;
  target?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      className={`text-[15px] font-bold text-[#211D19] border-b border-[#211D19] pb-0.5 w-fit ${className}`}
    >
      {children}
    </a>
  );
}

// ---------- Landing v4 (spec 26) ----------

// Contenedor y tipografía comunes de las secciones de la landing v4.
export const L_WRAP = 'max-w-[1260px] mx-auto px-5 md:px-10';
export const L_EYEBROW = 'text-[12.5px] font-extrabold tracking-[0.2em] uppercase text-[#AE5730]';
export const L_H2 = 'text-[31px] md:text-[42px] leading-[1.12] tracking-[-0.01em] [text-wrap:balance]';
export const L_LEAD = 'text-base md:text-[17.5px] leading-[1.6] text-[#4A433C]';

type LButtonVariant = 'primary' | 'outline' | 'dark' | 'light';

const lButtonVariant: Record<LButtonVariant, string> = {
  primary:
    'border-transparent bg-[#AE5730] text-[#FBF7F1] shadow-[0_12px_26px_rgba(174,87,48,0.28)] hover:bg-[#9A4B28] hover:-translate-y-px',
  outline: 'border-[#211D19] text-[#211D19] bg-transparent hover:bg-[#211D19] hover:text-[#FBF7F1]',
  dark: 'border-transparent bg-[#211D19] text-[#FBF7F1] hover:bg-[#171310]',
  light: 'border-transparent bg-[#FBF7F1] text-[#211D19] hover:bg-white',
};

// Botón de la landing v4: un solo estilo (pastilla, extra-bold) en cuatro variantes.
export function LButton({
  children,
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  children: React.ReactNode;
  href: string;
  external?: boolean;
  variant?: LButtonVariant;
  size?: 'md' | 'sm';
  className?: string;
}) {
  const sizeClass = size === 'sm' ? 'px-[18px] py-[11px] text-sm' : 'px-7 py-4 text-base';
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`inline-flex items-center justify-center gap-2.5 rounded-full border-[1.5px] font-extrabold leading-none whitespace-nowrap transition-[transform,background-color,color] duration-150 ${sizeClass} ${lButtonVariant[variant]} ${className}`}
    >
      {children}
    </a>
  );
}

export function LWhatsAppIcon({ className = 'w-[19px] h-[19px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={`flex-shrink-0 ${className}`}>
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2a8.2 8.2 0 01-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 001.8-1.2 2.2 2.2 0 00.1-1.3c0-.1-.2-.2-.5-.3z" />
    </svg>
  );
}

// Burbuja de chat (contorno): acompaña textos de respuesta por WhatsApp.
export function LChatIcon({ className = 'w-[22px] h-[22px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M21 12a8 8 0 01-11.6 7.1L3 21l1.9-5.4A8 8 0 1121 12z" />
    </svg>
  );
}

export function LCheckIcon({ className = '', color = '#C6663C' }: { className?: string; color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function LXIcon({ className = '', color = '#B5453B' }: { className?: string; color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export function LClockIcon({ className = '', color = '#C6663C' }: { className?: string; color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

export function LGlobeIcon({ className = '', color = '#C6663C' }: { className?: string; color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 4 6 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6-4-9s1.5-6.3 4-9z" />
    </svg>
  );
}

export function LHostingIcon({ className = '', color = '#C6663C' }: { className?: string; color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18" />
    </svg>
  );
}
