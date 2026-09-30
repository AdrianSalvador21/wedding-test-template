'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

// Paleta fija del rediseño "Jardín Editorial" (no conectada al selector de 10 temas)
export const v4Colors = {
  paper: '#F4EFE3',
  paperAlt: '#EFE7D4',
  ink: '#2E3323',
  accent: '#B0714A',
  gold: '#C9A98C',
  goldLine: '#B7AD90',
  muted: '#8B8F7E',
  body: '#3A3830',
};

export function V4Section({
  id,
  children,
  className = '',
  tinted = false,
  dark = false,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tinted?: boolean;
  dark?: boolean;
  style?: React.CSSProperties;
}) {
  const bg = dark ? v4Colors.ink : tinted ? v4Colors.paperAlt : v4Colors.paper;
  const color = dark ? v4Colors.paper : v4Colors.ink;
  return (
    <section
      id={id}
      className={`relative overflow-hidden font-georgia ${className}`}
      style={{ background: bg, color, ...style }}
    >
      {children}
    </section>
  );
}

const upVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export function V4Reveal({
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
      variants={upVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export function V4Stagger({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
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

export function V4StaggerItem({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={upVariants} transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}>
      {children}
    </motion.div>
  );
}

export function V4Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`max-w-5xl mx-auto px-6 md:px-12 ${className}`}>{children}</div>;
}

export function V4Divider({
  light = false,
  className = '',
}: {
  light?: boolean;
  className?: string;
}) {
  const lineColor = light ? 'rgba(244,239,227,.3)' : v4Colors.goldLine;
  const diamondColor = light ? v4Colors.gold : v4Colors.accent;
  return (
    <div className={`flex items-center justify-center gap-2 w-full max-w-[110px] mx-auto ${className}`}>
      <span className="flex-1 h-px" style={{ background: lineColor }} />
      <span
        className="w-[7px] h-[7px] border"
        style={{ borderColor: diamondColor, transform: 'rotate(45deg)' }}
      />
      <span className="flex-1 h-px" style={{ background: lineColor }} />
    </div>
  );
}

export function V4SectionHeading({
  numeral,
  eyebrow,
  title,
  light = false,
  align = 'center',
}: {
  numeral?: string;
  eyebrow: string;
  title?: string;
  light?: boolean;
  align?: 'center' | 'left';
}) {
  const wrap = align === 'center' ? 'text-center' : 'text-left';
  return (
    <div className={wrap}>
      {numeral && (
        <p
          className="text-[13px] tracking-[0.1em] mb-3"
          style={{ color: light ? v4Colors.gold : v4Colors.accent }}
        >
          {numeral}
        </p>
      )}
      <V4Divider light={light} className={align === 'left' ? 'mx-0' : ''} />
      <p
        className="mt-4 text-[11px] font-sans tracking-[0.22em] uppercase"
        style={{ color: light ? v4Colors.gold : v4Colors.muted }}
      >
        {eyebrow}
      </p>
      {title && (
        <h2
          className="mt-2 text-3xl md:text-4xl font-normal uppercase tracking-wide"
          style={{ color: light ? v4Colors.paper : v4Colors.ink }}
        >
          {title}
        </h2>
      )}
    </div>
  );
}

export function V4Card({
  children,
  className = '',
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={`border ${className}`}
      style={{
        borderColor: dark ? 'rgba(244,239,227,.3)' : 'rgba(43,42,34,.18)',
        background: dark ? 'transparent' : v4Colors.paper,
      }}
    >
      {children}
    </div>
  );
}

export function V4IconWrap({
  children,
  className = '',
  size = 52,
}: {
  children: React.ReactNode;
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`rounded-full border flex items-center justify-center ${className}`}
      style={{ width: size, height: size, borderColor: v4Colors.accent, color: v4Colors.ink }}
    >
      {children}
    </div>
  );
}

export function V4Button({
  children,
  onClick,
  type = 'button',
  href,
  disabled = false,
  variant = 'outline',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  href?: string;
  disabled?: boolean;
  variant?: 'outline' | 'solid' | 'solid-light';
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px] font-sans tracking-[0.2em] uppercase transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed';
  const styles: Record<string, React.CSSProperties> = {
    outline: { border: `1px solid ${v4Colors.ink}`, color: v4Colors.ink },
    solid: { background: v4Colors.ink, color: v4Colors.paper, border: `1px solid ${v4Colors.ink}` },
    'solid-light': { background: v4Colors.paper, color: v4Colors.ink, border: `1px solid ${v4Colors.paper}` },
  };
  if (href) {
    return (
      <a href={href} className={`${base} hover:opacity-75 ${className}`} style={styles[variant]}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} hover:opacity-75 ${className}`} style={styles[variant]}>
      {children}
    </button>
  );
}

export function V4PhotoArch({
  imageUrl,
  imageAlt,
  label,
  className = '',
}: {
  imageUrl?: string;
  imageAlt?: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{ borderRadius: '9999px 9999px 4px 4px', background: v4Colors.paperAlt }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={imageAlt || label} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center px-6 text-center">
          <span className="text-[11px] font-sans tracking-[0.14em] uppercase" style={{ color: v4Colors.muted }}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
}
