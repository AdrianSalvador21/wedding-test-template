'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Check, Copy } from 'lucide-react';

// Template02 "Moderno" (spec 25): retícula editorial, filetes de 1 px, display Bricolage
// Grotesque sobre texto Plus Jakarta Sans y ritmo piedra/tinta. Paleta fija, no conectada al
// selector de temas (mismo criterio que template-03/04).
export const V2_COLORS = {
  stone: '#F2EFEA',
  paper: '#FBFAF7',
  white: '#FFFFFF',
  ink: '#1E1C19',
  graphite: '#57524B',
  rule: '#D9D3C9',
  bronze: '#7A5A3C',
  bronzeLight: '#B79A7A',
  bronzeOnInk: '#C9A882',
  mutedOnInk: '#A49C91',
  lightOnInk: '#D9D3C9',
  ruleOnInk: '#4A4640',
  fieldOnInk: '#2A2723',
} as const;

export const V2_FONTS = {
  display: "'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif",
  body: "'Plus Jakarta Sans', sans-serif",
} as const;

export type V2Tone = 'stone' | 'paper' | 'ink';

const toneStyles: Record<V2Tone, React.CSSProperties> = {
  stone: { backgroundColor: V2_COLORS.stone, color: V2_COLORS.ink },
  paper: { backgroundColor: V2_COLORS.paper, color: V2_COLORS.ink },
  ink: { backgroundColor: V2_COLORS.ink, color: V2_COLORS.stone },
};

export function V2Section({
  id,
  tone = 'stone',
  bordered = false,
  children,
  className = '',
  style,
}: {
  id?: string;
  tone?: V2Tone;
  bordered?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      className={`relative overflow-hidden scroll-mt-6 ${className}`}
      style={{
        fontFamily: V2_FONTS.body,
        ...toneStyles[tone],
        ...(bordered ? { borderTop: `1px solid ${V2_COLORS.rule}` } : {}),
        ...style,
      }}
    >
      {children}
    </section>
  );
}

export function V2Container({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`relative mx-auto w-full max-w-[1200px] px-6 md:px-12 ${className}`}>{children}</div>;
}

// Sobretítulo: número (opcional) + filete + etiqueta en mayúsculas espaciadas.
export function V2Overline({
  number,
  label,
  onInk = false,
  className = '',
}: {
  number?: string;
  label: string;
  onInk?: boolean;
  className?: string;
}) {
  const color = onInk ? V2_COLORS.bronzeOnInk : V2_COLORS.bronze;
  return (
    <p
      className={`m-0 flex items-center gap-[10px] text-[11px] font-semibold uppercase tracking-[0.24em] ${className}`}
      style={{ color }}
    >
      {number && <span>{number}</span>}
      <span aria-hidden="true" className="inline-block h-px w-6" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </p>
  );
}

export const v2DisplayStyle = (size: number, weight = 400, tracking = -0.035): React.CSSProperties => ({
  fontFamily: V2_FONTS.display,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: `${tracking}em`,
  lineHeight: size >= 60 ? 0.92 : size >= 36 ? 1.02 : 1.15,
});

// Encabezado de sección: sobretítulo numerado + titular display (+ texto opcional).
export function V2SectionHeading({
  number,
  overline,
  title,
  children,
  onInk = false,
  titleSize = 40,
  titleWeight = 400,
}: {
  number?: string;
  overline: string;
  title?: string;
  children?: React.ReactNode;
  onInk?: boolean;
  titleSize?: number;
  titleWeight?: number;
}) {
  return (
    <header className="flex flex-col gap-[14px]">
      <V2Overline number={number} label={overline} onInk={onInk} />
      {title && (
        <h2 className="m-0 whitespace-pre-line" style={v2DisplayStyle(titleSize, titleWeight)}>
          {title}
        </h2>
      )}
      {children}
    </header>
  );
}

// Retícula de escritorio: encabezado 5/12 + contenido 7/12 desde 1024 px; en móvil apila.
// Animación de entrada: el encabezado aparece primero y cada bloque del contenido después, en
// cascada (mismo patrón que template-03/04).
export function V2SectionLayout({
  heading,
  children,
  className = '',
  align = 'start',
}: {
  heading: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end';
}) {
  return (
    <div
      className={`flex flex-col gap-9 lg:grid lg:grid-cols-12 lg:gap-16 ${align === 'end' ? 'lg:items-end' : 'lg:items-start'} ${className}`}
    >
      <V2Reveal className="lg:col-span-5">{heading}</V2Reveal>
      <V2Stagger className="flex min-w-0 flex-col gap-9 lg:col-span-7">
        {React.Children.toArray(children)
          .filter(Boolean)
          .map((child, index) => (
            <V2StaggerItem key={index} className="flex min-w-0 flex-col">
              {child}
            </V2StaggerItem>
          ))}
      </V2Stagger>
    </div>
  );
}

// Ornamento propio de Template02: dos anillos entrelazados.
export function V2Rings({
  width = 56,
  height,
  strokeWidth = 1.2,
  color = 'currentColor',
  double = false,
  className = '',
  style,
}: {
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  double?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={width}
      height={height ?? (width * 32) / 56}
      viewBox="0 0 56 32"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      className={className}
      style={style}
    >
      <circle cx="20" cy="16" r="13" />
      <circle cx="36" cy="16" r="13" />
      {double && (
        <>
          <circle cx="20" cy="16" r="9" />
          <circle cx="36" cy="16" r="9" />
        </>
      )}
    </svg>
  );
}

type V2ButtonVariant = 'primary' | 'secondary' | 'inverse' | 'inverseOutline' | 'accent';

const buttonVariantStyles: Record<V2ButtonVariant, React.CSSProperties> = {
  primary: { backgroundColor: V2_COLORS.ink, color: V2_COLORS.stone, border: `1px solid ${V2_COLORS.ink}` },
  secondary: { backgroundColor: 'transparent', color: V2_COLORS.ink, border: `1px solid ${V2_COLORS.ink}` },
  inverse: { backgroundColor: V2_COLORS.stone, color: V2_COLORS.ink, border: `1px solid ${V2_COLORS.stone}` },
  inverseOutline: { backgroundColor: 'transparent', color: V2_COLORS.stone, border: `1px solid ${V2_COLORS.ruleOnInk}` },
  accent: { backgroundColor: V2_COLORS.bronzeOnInk, color: V2_COLORS.ink, border: `1px solid ${V2_COLORS.bronzeOnInk}` },
};

// Clases/estilos de botón reutilizables también en <a>.
export function v2ButtonProps(variant: V2ButtonVariant, size: 'lg' | 'md' | 'sm' = 'lg', extraClass = '') {
  const height = size === 'lg' ? 'h-14' : size === 'md' ? 'h-[52px]' : 'h-11';
  return {
    className: `inline-flex items-center justify-center gap-[10px] rounded-full px-6 text-[15px] font-semibold no-underline transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${height} ${extraClass}`,
    style: { fontFamily: V2_FONTS.body, ...buttonVariantStyles[variant] } as React.CSSProperties,
  };
}

export function V2Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  children,
  style,
  type = 'button',
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V2ButtonVariant; size?: 'lg' | 'md' | 'sm' }) {
  const props = v2ButtonProps(variant, size, className);
  return (
    <button type={type} {...rest} className={props.className} style={{ ...props.style, ...style }}>
      {children}
    </button>
  );
}

// Botón de copiar con estado "Copiada" durante 2 s.
export function V2CopyButton({
  value,
  label,
  copiedLabel,
  ariaLabel,
  onInk = false,
  iconOnly = false,
}: {
  value: string;
  label: string;
  copiedLabel: string;
  ariaLabel: string;
  onInk?: boolean;
  iconOnly?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const idle: React.CSSProperties = onInk
    ? { border: `1px solid ${V2_COLORS.ruleOnInk}`, color: V2_COLORS.stone, backgroundColor: 'transparent' }
    : { border: `1px solid ${V2_COLORS.rule}`, color: V2_COLORS.ink, backgroundColor: 'transparent' };
  const done: React.CSSProperties = onInk
    ? { border: `1px solid ${V2_COLORS.bronzeOnInk}`, color: V2_COLORS.ink, backgroundColor: V2_COLORS.bronzeOnInk }
    : { border: `1px solid ${V2_COLORS.bronze}`, color: V2_COLORS.white, backgroundColor: V2_COLORS.bronze };

  const Icon = copied ? Check : Copy;

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? copiedLabel : ariaLabel}
      className={`inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors ${iconOnly ? 'w-11' : 'px-[14px]'}`}
      style={{ fontFamily: V2_FONTS.body, ...(copied ? done : idle) }}
    >
      <Icon className="h-[15px] w-[15px]" aria-hidden="true" strokeWidth={copied ? 2 : 1.7} />
      {!iconOnly && <span aria-live="polite">{copied ? copiedLabel : label}</span>}
    </button>
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

// Con "reducir movimiento" activo no hay desplazamiento: solo un fundido corto, para que la
// entrada siga existiendo sin mover el contenido.
const v2FadeVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const V2_EASE = [0.19, 1, 0.22, 1] as const;
const V2_VIEWPORT = { once: true, margin: '0px 0px -80px 0px' } as const;

const motionTags = {
  div: motion.div,
  li: motion.li,
  ol: motion.ol,
  ul: motion.ul,
  article: motion.article,
  dl: motion.dl,
} as const;

type V2MotionTag = keyof typeof motionTags;

export function V2Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: V2MotionTag;
  style?: React.CSSProperties;
}) {
  const reduceMotion = useReducedMotion();
  const Tag = motionTags[as] as typeof motion.div;
  return (
    <Tag
      className={className}
      style={style}
      variants={reduceMotion ? v2FadeVariants : v2RevealVariants}
      initial="hidden"
      whileInView="show"
      viewport={V2_VIEWPORT}
      transition={reduceMotion ? { duration: 0.3, delay } : { duration: 0.8, ease: V2_EASE, delay }}
    >
      {children}
    </Tag>
  );
}

export function V2Stagger({
  children,
  className = '',
  as = 'div',
  style,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: V2MotionTag;
  style?: React.CSSProperties;
} & Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style' | 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'>) {
  const Tag = motionTags[as] as typeof motion.div;
  return (
    <Tag
      {...(rest as Record<string, unknown>)}
      className={className}
      style={style}
      variants={v2StaggerVariants}
      initial="hidden"
      whileInView="show"
      viewport={V2_VIEWPORT}
    >
      {children}
    </Tag>
  );
}

export function V2StaggerItem({
  children,
  className = '',
  as = 'div',
  style,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  as?: V2MotionTag;
  style?: React.CSSProperties;
} & Omit<React.HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style' | 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'>) {
  const reduceMotion = useReducedMotion();
  const Tag = motionTags[as] as typeof motion.div;
  return (
    <Tag
      {...(rest as Record<string, unknown>)}
      className={className}
      style={style}
      variants={reduceMotion ? v2FadeVariants : v2RevealVariants}
      transition={reduceMotion ? { duration: 0.3 } : { duration: 0.8, ease: V2_EASE }}
    >
      {children}
    </Tag>
  );
}
