'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

// Paleta fija del rediseño "Botánica Editorial" (no conectada al selector de 10 temas)
export const v3Colors = {
  accent: '#B5643A',
  sage: '#85906E',
  paper: '#FAF6EF',
  sand: '#E7DECD',
  ink: '#34302A',
  muted: '#8C8172',
};

export function V3Section({
  id,
  children,
  className = '',
  tinted = false,
  style,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tinted?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden ${tinted ? 'bg-[#F3EDE2]' : 'bg-[#FAF6EF]'} text-[#34302A] ${className}`}
      style={style}
    >
      {children}
    </section>
  );
}

const upVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0 },
};

const leftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0 },
};

const rightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  show: { opacity: 1, x: 0 },
};

export function V3Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}) {
  const variants = direction === 'left' ? leftVariants : direction === 'right' ? rightVariants : upVariants;
  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.85, ease: [0.19, 1, 0.22, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

const staggerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export function V3Stagger({
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

export function V3StaggerItem({
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

export function V3Container({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`max-w-6xl mx-auto px-6 md:px-12 ${className}`}>{children}</div>;
}

export function V3Divider({
  light = false,
  className = '',
}: {
  light?: boolean;
  className?: string;
}) {
  const lineClass = light ? 'bg-white/20' : 'bg-[#85906E]/40';
  return (
    <div className={`flex items-center gap-4 w-full max-w-[130px] mx-auto ${className}`}>
      <span className={`flex-1 h-px ${lineClass}`} />
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <ellipse
          cx="7"
          cy="7"
          rx="2.6"
          ry="5.2"
          fill="none"
          stroke={light ? '#8C8172' : '#85906E'}
          strokeWidth="1"
          transform="rotate(45 7 7)"
        />
      </svg>
      <span className={`flex-1 h-px ${lineClass}`} />
    </div>
  );
}

export function V3EyebrowTitle({
  eyebrow,
  title,
  align = 'center',
  light = false,
}: {
  eyebrow?: string;
  title: string;
  align?: 'center' | 'left';
  light?: boolean;
}) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {eyebrow && (
        <p
          className="font-jost text-[12px] font-medium tracking-[0.34em] uppercase mb-3"
          style={{ color: v3Colors.accent }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="font-cormorant italic font-medium text-4xl md:text-[42px] mb-5"
        style={{ color: light ? v3Colors.paper : v3Colors.ink }}
      >
        {title}
      </h2>
      <V3Divider light={light} className={align === 'left' ? 'mx-0' : ''} />
    </div>
  );
}

export function V3Wreath({
  size = 132,
  leafCount = 16,
  className = '',
  color = v3Colors.accent,
}: {
  size?: number;
  leafCount?: number;
  className?: string;
  color?: string;
}) {
  const leaves = Array.from({ length: leafCount }, (_, i) => Math.round((i / leafCount) * 360));
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} className={className} aria-hidden="true">
      {leaves.map((angle) => (
        <g key={angle} style={{ transform: `rotate(${angle}deg)`, transformOrigin: '60px 60px' }}>
          <ellipse cx="60" cy="9" rx="2.1" ry="6.4" fill="none" stroke={color} strokeWidth="1" opacity={0.55} />
        </g>
      ))}
    </svg>
  );
}

export function V3Monogram({
  initials,
  size = 132,
  className = '',
}: {
  initials: React.ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <div
        className="absolute inset-0 rounded-full border"
        style={{
          background: v3Colors.paper,
          borderColor: `${v3Colors.accent}59`,
          boxShadow: '0 18px 40px -18px rgba(52,48,42,0.4)',
        }}
      />
      <motion.div
        className="absolute"
        style={{ left: size * 0.055, top: size * 0.055, width: size * 0.89, height: size * 0.89 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <V3Wreath size={size * 0.89} />
      </motion.div>
      <div
        className="absolute inset-0 flex items-center justify-center font-cormorant italic"
        style={{ fontSize: size * 0.22, color: v3Colors.ink }}
      >
        {initials}
      </div>
    </div>
  );
}

export function V3Branch({
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
  const leafColor = color ?? v3Colors.sage;
  const dotColor = accentColor ?? v3Colors.accent;
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

export function V3BgMotif({
  patternId,
  tileSize = 260,
  rotate = 8,
  className = '',
}: {
  patternId: string;
  tileSize?: number;
  rotate?: number;
  className?: string;
}) {
  const s = tileSize;
  return (
    <svg className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} aria-hidden="true">
      <defs>
        <pattern id={patternId} width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`rotate(${rotate})`}>
          <path
            d={`M-10,${s * 0.62} Q${s * 0.14},${s * 0.52} ${s * 0.28},${s * 0.42} Q${s * 0.42},${s * 0.32} ${s * 0.58},${s * 0.28}`}
            stroke={v3Colors.sage}
            strokeWidth="1"
            fill="none"
            opacity=".08"
          />
          <ellipse cx={s * 0.04} cy={s * 0.58} rx="2.2" ry="5.8" fill={v3Colors.sage} opacity=".07" transform={`rotate(-50 ${s * 0.04} ${s * 0.58})`} />
          <ellipse cx={s * 0.15} cy={s * 0.5} rx="2" ry="5.2" fill={v3Colors.sage} opacity=".06" transform={`rotate(-42 ${s * 0.15} ${s * 0.5})`} />
          <ellipse cx={s * 0.26} cy={s * 0.41} rx="1.8" ry="4.6" fill={v3Colors.sage} opacity=".05" transform={`rotate(-34 ${s * 0.26} ${s * 0.41})`} />
          <circle cx={s * 0.82} cy={s * 0.14} r="1.6" fill={v3Colors.accent} opacity=".08" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

export function V3CornerFlourish({
  corner = 'top-right',
  width = 150,
  height = 100,
  opacity = 0.5,
  offset = -12,
  className = '',
}: {
  corner?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  width?: number;
  height?: number;
  opacity?: number;
  offset?: number;
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
      <V3Branch width={width} height={height} />
    </div>
  );
}

export function V3PhotoArch({
  label,
  className = '',
  archClassName = 'rounded-[260px_260px_12px_12px]',
  imageUrl,
  imageAlt,
}: {
  label: string;
  className?: string;
  archClassName?: string;
  imageUrl?: string;
  imageAlt?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        className={`h-full w-full ${archClassName} overflow-hidden flex items-center justify-center`}
        style={{ background: v3Colors.sand, color: '#A69479' }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={imageAlt || label} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-3 font-jost px-6 text-center">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <path d="M21 16l-5-5-4 4-3-3-6 6" />
            </svg>
            <span className="text-[11px] tracking-[0.14em] uppercase">{label}</span>
          </div>
        )}
      </div>
      <div
        className={`absolute -inset-3 ${archClassName} pointer-events-none`}
        style={{ border: `1px solid ${v3Colors.accent}59` }}
      />
    </div>
  );
}

export function V3Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[6px] border bg-[#FFFDF9] ${className}`}
      style={{ borderColor: `${v3Colors.accent}3D` }}
    >
      {children}
    </div>
  );
}

export function V3IconWrap({
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
      style={{ width: size, height: size, borderColor: v3Colors.accent, color: v3Colors.accent }}
    >
      {children}
    </div>
  );
}

export function V3PillButton({
  children,
  onClick,
  type = 'button',
  href,
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  href?: string;
  disabled?: boolean;
  className?: string;
}) {
  const classes = `inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-jost text-[13px] font-medium tracking-[0.12em] uppercase transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed ${className}`;
  const style: React.CSSProperties = { borderColor: v3Colors.accent, color: v3Colors.accent };

  if (href) {
    return (
      <a href={href} className={`v3-pill ${classes}`} style={style}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`v3-pill ${classes}`} style={style}>
      {children}
    </button>
  );
}

export function V3IconRings({ className = '', size = 20 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className} aria-hidden="true">
      <circle cx="8" cy="16" r="4" />
      <circle cx="16" cy="16" r="4" />
      <path d="M9 12l3-8 3 8" />
    </svg>
  );
}
