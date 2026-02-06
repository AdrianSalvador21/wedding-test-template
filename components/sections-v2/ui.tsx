'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';

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
      style={style}
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
      className={`rounded-[28px] border border-[#e7dccf] bg-white/80 backdrop-blur-sm shadow-[0_12px_30px_rgba(26,20,12,0.08)] ${className}`}
    >
      {children}
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
        <p className="text-[11px] tracking-[0.28em] uppercase text-[#8a7c6b]">
          {overline}
        </p>
      )}
      <h2 className="mt-3 font-serif font-light text-3xl md:text-4xl text-[#3b342b]">
        {title}
      </h2>
      <div className={align === 'left' ? 'mt-4' : 'mt-4 flex justify-center'}>
        <div className="h-px w-24 bg-[#d7c2a5]" />
      </div>
      {subtitle && (
        <div className="mt-5 text-base md:text-base text-[#6f6254] leading-relaxed">
          {subtitle}
        </div>
      )}
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
