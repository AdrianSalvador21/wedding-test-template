import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const AdultOnlyIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Copa de champagne elegante */}
      <path 
        d="M8 2L8 8C8 10 10 12 12 12C14 12 16 10 16 8L16 2H8Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      
      {/* Pie de la copa */}
      <rect 
        x="11.5" 
        y="12" 
        width="1" 
        height="6" 
        fill="currentColor"
      />
      
      {/* Base de la copa */}
      <rect 
        x="9" 
        y="18" 
        width="6" 
        height="1.5" 
        rx="0.5" 
        fill="currentColor"
      />
      
      {/* Burbujas de champagne */}
      <circle cx="10" cy="6" r="0.5" fill="white" opacity="0.8"/>
      <circle cx="12" cy="4" r="0.4" fill="white" opacity="0.7"/>
      <circle cx="14" cy="7" r="0.3" fill="white" opacity="0.6"/>
      <circle cx="11" cy="8" r="0.3" fill="white" opacity="0.5"/>
      <circle cx="13" cy="5" r="0.2" fill="white" opacity="0.4"/>
      
      {/* Segunda copa (silueta) */}
      <path 
        d="M18 3L18 7C18 8.5 19 10 20 10C21 10 22 8.5 22 7L22 3H18Z" 
        fill="currentColor" 
        opacity="0.5"
      />
      <rect 
        x="19.5" 
        y="10" 
        width="0.8" 
        height="4" 
        fill="currentColor" 
        opacity="0.5"
      />
      <rect 
        x="18.5" 
        y="14" 
        width="3" 
        height="1" 
        rx="0.5" 
        fill="currentColor" 
        opacity="0.5"
      />
      
      {/* Símbolo "18+" elegante */}
      <circle 
        cx="5" 
        cy="16" 
        r="3" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none"
        opacity="0.7"
      />
      <text 
        x="5" 
        y="17" 
        fontSize="3" 
        textAnchor="middle" 
        fill="currentColor" 
        opacity="0.7"
      >
        18+
      </text>
      
      {/* Decoración con estrellas pequeñas */}
      <path d="M2 8L2.5 9L3 8L2.5 7L2 8Z" fill="currentColor" opacity="0.4"/>
      <path d="M21 1L21.5 2L22 1L21.5 0L21 1Z" fill="currentColor" opacity="0.4"/>
    </svg>
  );
};
