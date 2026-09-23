'use client';

import React from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

// Paleta propia de Template01 (canvas "Clásico" aprobado). No toca tailwind.config.ts
// a propósito: esos tokens (primary/secondary/accent) los comparten WeddingNotFound.tsx,
// loading.tsx y typography-test/page.tsx, fuera del alcance de este cambio.
export const T1_COLORS = {
  primary: '#8B5E34',
  accent: '#c9a86a',
  dark: '#5a4a3a',
  paper: '#faf8f5',
  text: '#6b5b4f',
  border: '#d9c6a8',
} as const;

export function T1Section({
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
    <section id={id} className={className} style={style}>
      {children}
    </section>
  );
}

const t1RevealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function T1Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={t1RevealVariants}
      initial={shouldReduceMotion ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.7, ease: 'easeOut', delay: shouldReduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

const t1StaggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export function T1Stagger({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={shouldReduceMotion ? undefined : t1StaggerVariants}
      initial={shouldReduceMotion ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
    >
      {children}
    </motion.div>
  );
}

export function T1StaggerItem({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={t1RevealVariants}
      transition={{ duration: shouldReduceMotion ? 0 : 0.6, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// Ramita mínima de laurel: acento botánico reutilizable (eyebrow, Hero, Footer).
export function T1LeafSprig({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={(size * 15) / 22}
      viewBox="0 0 22 15"
      aria-hidden="true"
      className={className}
      style={{ display: 'block', animation: 'var(--t1-sway, none)' }}
    >
      <path d="M11,15 C11,10 11,5 11,0" stroke={T1_COLORS.accent} strokeWidth="1" fill="none" opacity=".75" />
      <path d="M11,5 C8,4 6,2 6,0 C9,0 11,2 11,5 Z" fill={T1_COLORS.accent} opacity=".6" />
      <path d="M11,5 C14,4 16,2 16,0 C13,0 11,2 11,5 Z" fill={T1_COLORS.accent} opacity=".6" />
    </svg>
  );
}

// Título de sección: ícono + título en versalitas Cormorant + doble filete con florón.
// Reemplaza el bloque repetido `.section-title` + `.title-decorative-line` de las 11
// secciones de contenido (no Hero ni Footer, que tienen su propio encabezado).
export function T1SectionTitle({
  icon,
  title,
  className = '',
}: {
  icon?: React.ReactNode;
  title: string;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <T1Reveal className={`text-center mb-12 ${className}`}>
      <motion.div
        className="flex justify-center mb-3"
        animate={shouldReduceMotion ? undefined : { rotate: [0, 4, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <T1LeafSprig size={20} />
      </motion.div>
      <div className="flex items-center justify-center mb-6">
        {icon && <span className="mr-3 opacity-80" style={{ color: T1_COLORS.accent }}>{icon}</span>}
        <h2
          className="font-semibold text-center"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'normal',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            fontSize: '1.05rem',
            color: T1_COLORS.dark,
            opacity: 0.9,
          }}
        >
          {title}
        </h2>
      </div>
      <T1Divider />
    </T1Reveal>
  );
}

// Divisor "clásico": doble filete horizontal + florón de 4 pétalos al centro.
export function T1Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} style={{ margin: '0 auto' }}>
      <span style={{ width: 56, height: 4, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, background: T1_COLORS.accent }} />
        <span style={{ position: 'absolute', left: 0, right: 0, top: 3, height: 1, background: T1_COLORS.accent }} />
      </span>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <g transform="translate(8,8)">
          <path d="M0,-1 C-2,-3 -2,-6 0,-8 C2,-6 2,-3 0,-1 Z" fill={T1_COLORS.accent} opacity=".8" />
          <path d="M0,-1 C-2,-3 -2,-6 0,-8 C2,-6 2,-3 0,-1 Z" fill={T1_COLORS.accent} opacity=".8" transform="rotate(90)" />
          <path d="M0,-1 C-2,-3 -2,-6 0,-8 C2,-6 2,-3 0,-1 Z" fill={T1_COLORS.accent} opacity=".8" transform="rotate(180)" />
          <path d="M0,-1 C-2,-3 -2,-6 0,-8 C2,-6 2,-3 0,-1 Z" fill={T1_COLORS.accent} opacity=".8" transform="rotate(270)" />
        </g>
      </svg>
      <span style={{ width: 56, height: 4, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 1, background: T1_COLORS.accent }} />
        <span style={{ position: 'absolute', left: 0, right: 0, top: 3, height: 1, background: T1_COLORS.accent }} />
      </span>
    </div>
  );
}

// Tarjeta "clásica": borde simple, sin sombra ("look impreso").
export function T1Card({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ background: '#fffdf9', border: `1px solid ${T1_COLORS.border}`, ...style }}
    >
      {children}
    </div>
  );
}

// Botón rectangular de borde fino (outline). `solid` = relleno.
export function T1Button({
  children,
  onClick,
  type = 'button',
  disabled,
  solid = false,
  className = '',
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  solid?: boolean;
  className?: string;
  href?: string;
}) {
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '13px 28px',
    fontFamily: "'Lora', serif",
    fontWeight: 500,
    fontSize: '11.5px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    textDecoration: 'none',
    border: `1.5px solid ${T1_COLORS.primary}`,
    background: solid ? T1_COLORS.primary : 'transparent',
    color: solid ? '#FFF7EC' : T1_COLORS.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background .3s ease, color .3s ease',
  };

  if (href) {
    return (
      <a href={href} className={className} style={baseStyle}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={className} style={baseStyle}>
      {children}
    </button>
  );
}

// Sello circular fino, roto por una ramita mínima de laurel — monograma nuevo de
// Template01 (Hero y respaldo de Footer), reemplaza la guirnalda/corazones anteriores.
export function T1Monogram({
  size = 120,
  initials,
  spin = true,
  className = '',
}: {
  size?: number;
  initials: string;
  spin?: boolean;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const r = size * 0.405;
  const c = size / 2;
  const circumference = 2 * Math.PI * r;
  const gap = circumference * 0.09;
  return (
    <div className={className} style={{ position: 'relative', width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
        animate={spin && !shouldReduceMotion ? { rotate: 360 } : undefined}
        transition={spin && !shouldReduceMotion ? { duration: 70, repeat: Infinity, ease: 'linear' } : undefined}
      >
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,.5)"
          strokeWidth="1"
          strokeDasharray={`${circumference - gap} ${gap}`}
          strokeDashoffset={-gap * 0.3}
        />
      </motion.svg>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${c},${c + r * 0.88})`}>
          <path d="M0,0 C-1,-6 -1,-11 0,-17" stroke={T1_COLORS.accent} strokeWidth="1" fill="none" opacity=".9" />
          <path d="M0,-3 C-4,-4 -6,-8 -5,-11 C-2,-10 1,-6 0,-3 Z" fill={T1_COLORS.accent} opacity=".8" />
          <path d="M0,-8 C4,-9 6,-13 5,-16 C2,-15 -1,-11 0,-8 Z" fill={T1_COLORS.accent} opacity=".7" />
        </g>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 500,
            fontSize: size * 0.1,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#fff',
          }}
        >
          {initials[0]}
          <span style={{ display: 'inline-block', margin: `0 ${size * 0.05}px`, fontFamily: "'Allura', cursive", fontSize: size * 0.17, color: T1_COLORS.accent, verticalAlign: '-3px' }}>
            &amp;
          </span>
          {initials[1]}
        </span>
      </div>
    </div>
  );
}
