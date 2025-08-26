import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const RSVPIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Sobre de invitación */}
      <path 
        d="M3 6C3 5 4 4 5 4H19C20 4 21 5 21 6V18C21 19 20 20 19 20H5C4 20 3 19 3 18V6Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      
      {/* Parte interior del sobre */}
      <path 
        d="M4 7V18C4 18.5 4.5 19 5 19H19C19.5 19 20 18.5 20 18V7L12 13L4 7Z" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Líneas del sobre cerrado */}
      <path 
        d="M3 6L12 13L21 6" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none"
        opacity="0.9"
      />
      
      {/* Sello decorativo */}
      <rect 
        x="16" 
        y="5" 
        width="3" 
        height="2.5" 
        rx="0.5" 
        fill="currentColor" 
        opacity="0.7"
      />
      
      {/* Corazón en el sello */}
      <path 
        d="M17.5 6.5C17.5 6 17 5.7 16.8 6C16.5 6.3 16.8 6.8 17.5 7.2C18.2 6.8 18.5 6.3 18.2 6C18 5.7 17.5 6 17.5 6.5Z" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Checkmark de confirmación */}
      <path 
        d="M8 12L10 14L16 8" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      
      {/* Decoración con puntos */}
      <circle cx="6" cy="16" r="0.5" fill="currentColor" opacity="0.5"/>
      <circle cx="8" cy="16" r="0.5" fill="currentColor" opacity="0.5"/>
      <circle cx="10" cy="16" r="0.5" fill="currentColor" opacity="0.5"/>
    </svg>
  );
};
