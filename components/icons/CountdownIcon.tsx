import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const CountdownIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Reloj principal con cuenta regresiva */}
      <circle 
        cx="12" 
        cy="13" 
        r="8" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.8"
      />
      
      {/* Círculo interior */}
      <circle 
        cx="12" 
        cy="13" 
        r="6" 
        fill="currentColor" 
        opacity="0.1"
      />
      
      {/* Números del reloj (12, 3, 6, 9) */}
      <circle cx="12" cy="7" r="0.8" fill="currentColor" opacity="0.6"/>
      <circle cx="18" cy="13" r="0.8" fill="currentColor" opacity="0.6"/>
      <circle cx="12" cy="19" r="0.8" fill="currentColor" opacity="0.6"/>
      <circle cx="6" cy="13" r="0.8" fill="currentColor" opacity="0.6"/>
      
      {/* Manecillas del reloj */}
      <path 
        d="M12 13L12 9" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
        opacity="0.9"
      />
      <path 
        d="M12 13L15 15" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
        opacity="0.9"
      />
      
      {/* Centro del reloj */}
      <circle 
        cx="12" 
        cy="13" 
        r="1" 
        fill="currentColor"
      />
      
      {/* Calendario arriba del reloj */}
      <rect 
        x="9" 
        y="2" 
        width="6" 
        height="5" 
        rx="1" 
        fill="currentColor" 
        opacity="0.8"
      />
      <rect 
        x="9.5" 
        y="2.5" 
        width="5" 
        height="4" 
        rx="0.5" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Líneas del calendario */}
      <line x1="10" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
      <line x1="10" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
      <line x1="10" y1="6" x2="14" y2="6" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
      
      {/* Anillas del calendario */}
      <rect x="10.5" y="1.5" width="0.8" height="1.5" rx="0.4" fill="currentColor" opacity="0.7"/>
      <rect x="12.7" y="1.5" width="0.8" height="1.5" rx="0.4" fill="currentColor" opacity="0.7"/>
      
      {/* Corazones decorativos flotantes */}
      <path 
        d="M4 8C4 7.5 3.7 7.2 3.5 7.4C3.2 7.6 3.4 8.1 4 8.5C4.6 8.1 4.8 7.6 4.5 7.4C4.3 7.2 4 7.5 4 8Z" 
        fill="currentColor" 
        opacity="0.5"
      />
      <path 
        d="M20 18C20 17.5 19.7 17.2 19.5 17.4C19.2 17.6 19.4 18.1 20 18.5C20.6 18.1 20.8 17.6 20.5 17.4C20.3 17.2 20 17.5 20 18Z" 
        fill="currentColor" 
        opacity="0.5"
      />
      
      {/* Estrellas pequeñas */}
      <path d="M2 15L2.3 15.7L3 15.7L2.5 16.1L2.7 16.8L2 16.4L1.3 16.8L1.5 16.1L1 15.7L1.7 15.7L2 15Z" fill="currentColor" opacity="0.4"/>
      <path d="M22 9L22.3 9.7L23 9.7L22.5 10.1L22.7 10.8L22 10.4L21.3 10.8L21.5 10.1L21 9.7L21.7 9.7L22 9Z" fill="currentColor" opacity="0.4"/>
    </svg>
  );
};

