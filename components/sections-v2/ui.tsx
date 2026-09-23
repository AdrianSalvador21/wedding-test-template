'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

export function V2Section({
  id,
  children,
  className = '',
  style,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      className={`bg-[#fbf7f1] text-[#3b342b] ${className}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", ...style }}
    >
      {children}
    </section>
  );
}

const v2RevealVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const v2StaggerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.05,
    },
  },
};

export function V2Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      variants={v2RevealVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  );
}

export function V2Stagger({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={v2StaggerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  );
}

export function V2StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={v2RevealVariants} transition={{ duration: 0.6, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}

export function V2Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-6xl mx-auto px-6 ${className}`}>{children}</div>
  );
}

export function V2Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] border border-[#e7dccf] bg-white/80 backdrop-blur-sm shadow-[0_10px_24px_rgba(26,20,12,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

// Divisor "moderno": línea + 2 puntos geométricos (sin motivo floral).
export function V2Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <span className="w-9 h-0.5 rounded-full bg-[#e7dccf]" />
      <span className="w-[5px] h-[5px] rounded-full bg-[#b79a7a]" />
      <span className="w-[5px] h-[5px] rounded-full bg-[#b79a7a]" />
      <span className="w-9 h-0.5 rounded-full bg-[#e7dccf]" />
    </div>
  );
}

export function V2Title({
  overline,
  title,
  subtitle,
  align = 'center',
}: {
  overline?: string;
  title: string;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'left' ? 'text-left' : 'text-center'}>
      {overline && (
        <p className="text-[11px] font-bold tracking-[0.28em] uppercase text-[#b79a7a]">
          {overline}
        </p>
      )}
      <h2 className="mt-3 font-bold text-3xl md:text-4xl text-[#3b342b] tracking-tight">
        {title}
      </h2>
      <div className={align === 'left' ? 'mt-4' : 'mt-4 flex justify-center'}>
        <V2Divider />
      </div>
      {subtitle && (
        <div className="mt-5 text-base md:text-base text-[#6f6254] leading-relaxed">
          {subtitle}
        </div>
      )}
    </div>
  );
}

// Anillos concéntricos animados: ornamento geométrico propio del Hero.
export function V2Rings({ size = 220, className = '' }: { size?: number; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 260 260"
      aria-hidden="true"
      className={className}
      animate={shouldReduceMotion ? undefined : { rotate: 360 }}
      transition={shouldReduceMotion ? undefined : { duration: 90, repeat: Infinity, ease: 'linear' }}
    >
      <circle cx="130" cy="130" r="128" fill="none" stroke="#b79a7a" strokeWidth="1.5" opacity=".35" />
      <circle cx="130" cy="130" r="98" fill="none" stroke="#b79a7a" strokeWidth="1.5" opacity=".28" />
      <circle cx="130" cy="130" r="68" fill="none" stroke="#b79a7a" strokeWidth="1.5" opacity=".2" />
    </motion.svg>
  );
}

// Hoja de línea (un solo trazo, sin relleno): acento botánico minimalista y moderno.
export function V2LeafAccent({ size = 90, className = '' }: { size?: number; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.svg
      width={size}
      height={(size * 0.72)}
      viewBox="0 0 120 84"
      aria-hidden="true"
      className={className}
      animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
      transition={shouldReduceMotion ? undefined : { duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path d="M4,80 C30,70 55,50 70,20" stroke="currentColor" strokeWidth="1.2" fill="none" opacity=".7" />
      <path d="M28,58 C28,48 34,40 44,36 C44,46 38,54 28,58 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" />
      <path d="M48,34 C48,25 53,18 62,15 C62,24 57,30 48,34 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity=".6" />
    </motion.svg>
  );
}

// Badge de iniciales: monograma propio de Template02, y respaldo cuando no hay
// monogram.svg personalizado (HeroV2/FooterV2).
export function V2Monogram({
  size = 96,
  initials,
  svgUrl,
  className = '',
}: {
  size?: number;
  initials: string;
  svgUrl?: string | null;
  className?: string;
}) {
  if (svgUrl) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <img src={svgUrl} alt="Monograma de los novios" className="w-full h-full object-contain" />
      </div>
    );
  }
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#b79a7a',
        boxShadow: '0 14px 28px -12px rgba(30,22,14,.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: size * 0.27, color: '#fff', letterSpacing: '-0.01em' }}>{initials}</span>
    </div>
  );
}

export function V2PillButton({
  children,
  onClick,
  type,
  disabled,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-opacity bg-[#b79a7a] text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
