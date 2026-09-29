'use client';

import React from 'react';

interface PersonIconProps {
  size: number;
  color: string;
  className?: string;
}

// Ícono de persona a medida (spec 17): silueta simple en un solo color — cabeza + cuerpo
// en domo, sin degradados. Se dibuja una vez por asiento ocupado alrededor de cada mesa
// del Plano (components/admin/tables/nodes/TableNode.tsx), con el color de estado de
// ocupación que ya usa el borde de la mesa (occupancyColor).
export default function PersonIcon({ size, color, className }: PersonIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
      <circle cx="12" cy="7.4" r="3.8" />
      <path d="M12 12.4c-4.1 0-7.3 3.5-7.3 8 0 .4.3.7.7.7h13.2c.4 0 .7-.3.7-.7 0-4.5-3.2-8-7.3-8z" />
    </svg>
  );
}
