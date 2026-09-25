// Tokens de la marca "Romance Editorial" (ver specs/03-rediseno-landing.md).
// Viven aquí, sin 'use client', para que los Server Components de las páginas de
// marketing (spec 10) y los componentes cliente de la landing usen los mismos valores.

export const L = {
  ivory: '#FBF7F1',
  charcoal: '#211D19',
  charcoalSoft: '#2B2622',
  terracota: '#C6663C',
  terracotaDark: '#AE5730',
  sage: '#7C8363',
  muted: '#5A534B',
};

// Las variables --font-fraunces y --font-manrope las define next/font en app/layout.tsx.
export const fraunces = { fontFamily: 'var(--font-fraunces), serif' };
export const manrope = { fontFamily: 'var(--font-manrope), sans-serif' };
