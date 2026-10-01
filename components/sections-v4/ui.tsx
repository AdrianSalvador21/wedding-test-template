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

export function V4Branch({
  className = '',
  mirrored = false,
  width = 230,
  height = 150,
  color,
  accentColor,
  style,
}: {
  className?: string;
  mirrored?: boolean;
  width?: number;
  height?: number;
  color?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}) {
  const leafColor = color ?? v4Colors.muted;
  const dotColor = accentColor ?? v4Colors.accent;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 230 150"
      fill="none"
      className={className}
      style={{ ...(mirrored ? { transform: 'scaleX(-1)' } : undefined), ...style }}
      aria-hidden="true"
    >
      <path d="M0,138 C42,118 74,88 112,68 C150,48 188,28 226,10" stroke={leafColor} strokeWidth="1.3" opacity=".5" />
      <ellipse cx="18" cy="130" rx="3.4" ry="9.5" fill={leafColor} opacity=".4" transform="rotate(-58 18 130)" />
      <ellipse cx="40" cy="115" rx="3.1" ry="8.7" fill={leafColor} opacity=".42" transform="rotate(-52 40 115)" />
      <ellipse cx="62" cy="99" rx="2.9" ry="8" fill={leafColor} opacity=".4" transform="rotate(-46 62 99)" />
      <ellipse cx="84" cy="84" rx="2.7" ry="7.3" fill={leafColor} opacity=".38" transform="rotate(-40 84 84)" />
      <ellipse cx="106" cy="70" rx="2.4" ry="6.6" fill={leafColor} opacity=".36" transform="rotate(-34 106 70)" />
      <ellipse cx="128" cy="56" rx="2.2" ry="6" fill={leafColor} opacity=".33" transform="rotate(-28 128 56)" />
      <ellipse cx="150" cy="43" rx="2" ry="5.4" fill={leafColor} opacity=".3" transform="rotate(-22 150 43)" />
      <ellipse cx="172" cy="30" rx="1.8" ry="4.8" fill={leafColor} opacity=".27" transform="rotate(-16 172 30)" />
      <ellipse cx="196" cy="18" rx="1.6" ry="4.2" fill={leafColor} opacity=".24" transform="rotate(-10 196 18)" />
      <circle cx="50" cy="108" r="1.6" fill={dotColor} opacity=".5" />
      <circle cx="118" cy="63" r="1.4" fill={dotColor} opacity=".45" />
    </svg>
  );
}

export function V4CornerFlourish({
  corner = 'top-right',
  width = 150,
  height = 100,
  opacity = 0.5,
  offset = -12,
  light = false,
  className = '',
}: {
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width?: number;
  height?: number;
  opacity?: number;
  offset?: number;
  light?: boolean;
  className?: string;
}) {
  const positions: Record<string, React.CSSProperties> = {
    'top-left': { left: offset, top: offset },
    'top-right': { right: offset, top: offset, transform: 'scaleX(-1)' },
    'bottom-left': { left: offset, bottom: offset, transform: 'scaleY(-1)' },
    'bottom-right': { right: offset, bottom: offset, transform: 'scaleX(-1) scaleY(-1)' },
  };
  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ ...positions[corner], opacity }} aria-hidden="true">
      <V4Branch
        width={width}
        height={height}
        color={light ? v4Colors.gold : undefined}
        accentColor={light ? v4Colors.gold : undefined}
      />
    </div>
  );
}

export function V4BgMotif({
  patternId,
  tileSize = 260,
  rotate = 8,
  light = false,
  className = '',
}: {
  patternId: string;
  tileSize?: number;
  rotate?: number;
  light?: boolean;
  className?: string;
}) {
  const s = tileSize;
  const leafColor = light ? v4Colors.gold : v4Colors.muted;
  const dotColor = light ? v4Colors.gold : v4Colors.accent;
  const strength = light ? 1.3 : 1;
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} aria-hidden="true">
      <defs>
        <pattern id={patternId} width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rotate})`}>
          <path
            d={`M-10,${s * 0.62} Q${s * 0.14},${s * 0.52} ${s * 0.28},${s * 0.42} Q${s * 0.42},${s * 0.32} ${s * 0.58},${s * 0.28}`}
            stroke={leafColor}
            strokeWidth="1"
            fill="none"
            opacity={0.08 * strength}
          />
          <ellipse cx={s * 0.04} cy={s * 0.58} rx="2.2" ry="5.8" fill={leafColor} opacity={0.07 * strength} transform={`rotate(-50 ${s * 0.04} ${s * 0.58})`} />
          <ellipse cx={s * 0.15} cy={s * 0.5} rx="2" ry="5.2" fill={leafColor} opacity={0.06 * strength} transform={`rotate(-42 ${s * 0.15} ${s * 0.5})`} />
          <ellipse cx={s * 0.26} cy={s * 0.41} rx="1.8" ry="4.6" fill={leafColor} opacity={0.05 * strength} transform={`rotate(-34 ${s * 0.26} ${s * 0.41})`} />
          <circle cx={s * 0.82} cy={s * 0.14} r="1.6" fill={dotColor} opacity={0.08 * strength} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
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
