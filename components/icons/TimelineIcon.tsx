import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const TimelineIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Reloj principal */}
      <circle 
        cx="12" 
        cy="12" 
        r="9" 
        fill="currentColor" 
        opacity="0.8"
      />
      <circle 
        cx="12" 
        cy="12" 
        r="7" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Números del reloj (12, 3, 6, 9) */}
      <circle cx="12" cy="5" r="0.5" fill="currentColor"/>
      <circle cx="19" cy="12" r="0.5" fill="currentColor"/>
      <circle cx="12" cy="19" r="0.5" fill="currentColor"/>
      <circle cx="5" cy="12" r="0.5" fill="currentColor"/>
      
      {/* Manecillas del reloj apuntando a las 2 (hora de boda típica) */}
      <path 
        d="M12 12L12 7" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      <path 
        d="M12 12L16 10" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      
      {/* Centro del reloj */}
      <circle 
        cx="12" 
        cy="12" 
        r="1" 
        fill="currentColor"
      />
      
      {/* Decoraciones de cronograma */}
      <path 
        d="M2 4L4 4L4 6L2 6Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      <path 
        d="M20 4L22 4L22 6L20 6Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      <path 
        d="M2 18L4 18L4 20L2 20Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      <path 
        d="M20 18L22 18L22 20L20 20Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      
      {/* Líneas conectoras del cronograma */}
      <path 
        d="M4 5L8 8" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        opacity="0.4"
        strokeDasharray="1,1"
      />
      <path 
        d="M20 5L16 8" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        opacity="0.4"
        strokeDasharray="1,1"
      />
    </svg>
  );
};
