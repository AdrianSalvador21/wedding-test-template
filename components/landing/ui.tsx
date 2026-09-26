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
  tone?: 'ivory' | 'white' | 'charcoal' | 'terracota' | 'gradient';
  border?: boolean;
  style?: React.CSSProperties;
}) {
  const toneClass = {
    ivory: 'bg-[#FBF7F1] text-[#2B2622]',
    white: 'bg-white text-[#2B2622]',
    charcoal: 'bg-[#211D19] text-[#FBF7F1]',
    terracota: 'bg-[#C6663C] text-[#FBF7F1]',
    gradient: 'bg-gradient-to-b from-[#FBF7F1] to-[#F3E7D8] text-[#2B2622]',
  }[tone];
  const borderClass = border ? 'border-t border-[rgba(43,38,34,0.08)]' : '';

  return (
    <section id={id} className={`${toneClass} ${borderClass} ${className}`} style={{ ...manrope, ...style }}>
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
