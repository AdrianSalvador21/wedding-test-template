import React from 'react';

// Íconos de trazo (sin emojis) para las páginas de marketing. Server Component.
const PATHS = {
  star: <path d="M12 3l2.4 5.6 6 .5-4.6 4 1.4 5.9L12 15.8 6.8 19l1.4-5.9-4.6-4 6-.5z" />,
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="M21 16l-5-5-9 9" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="13" rx="1.5" />
      <path d="M12 8v13M3 13h18M12 8c-1.5-4-6-3.5-5 0M12 8c1.5-4 6-3.5 5 0" />
    </>
  ),
  rsvp: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12l3 3 5-6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5.5a3 3 0 0 1 0 5.5M18 14.5c2 .8 3 2.6 3 5.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  doc: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M14 3v5h5M9 13h7M9 17h7" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 22, color = '#AE5730' }: { name: IconName; size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      {PATHS[name]}
    </svg>
  );
}

// Cuadro de color marfil con un ícono, para tarjetas de características.
export function IconBadge({ name }: { name: IconName }) {
  return (
    <div className="w-11 h-11 rounded-[14px] bg-[#F0E6D8] flex items-center justify-center">
      <Icon name={name} />
    </div>
  );
}
