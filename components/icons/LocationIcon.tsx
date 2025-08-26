import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const LocationIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Iglesia/Capilla */}
      <path 
        d="M4 20H20V12L16 8H8L4 12V20Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      {/* Techo de la iglesia */}
      <path 
        d="M3 12L12 6L21 12H18L12 8L6 12H3Z" 
        fill="currentColor"
      />
      {/* Torre del campanario */}
      <rect 
        x="10" 
        y="2" 
        width="4" 
        height="8" 
        fill="currentColor" 
        opacity="0.9"
      />
      {/* Cruz en la torre */}
      <rect 
        x="11.5" 
        y="1" 
        width="1" 
        height="4" 
        fill="currentColor"
      />
      <rect 
        x="10.5" 
        y="2" 
        width="3" 
        height="1" 
        fill="currentColor"
      />
      {/* Puerta principal */}
      <path 
        d="M10 20V16C10 15 11 14 12 14C13 14 14 15 14 16V20H10Z" 
        fill="white" 
        opacity="0.9"
      />
      {/* Ventanas laterales */}
      <path 
        d="M6 16C6 15 7 14 8 14C9 14 10 15 10 16V18H6V16Z" 
        fill="white" 
        opacity="0.7"
      />
      <path 
        d="M14 16C14 15 15 14 16 14C17 14 18 15 18 16V18H14V16Z" 
        fill="white" 
        opacity="0.7"
      />
      {/* Campana en la torre */}
      <circle 
        cx="12" 
        cy="6" 
        r="1" 
        fill="gold" 
        opacity="0.8"
      />
    </svg>
  );
};
