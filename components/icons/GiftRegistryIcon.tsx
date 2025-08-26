import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const GiftRegistryIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Anillos de boda entrelazados */}
      <circle 
        cx="9" 
        cy="10" 
        r="5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.8"
      />
      <circle 
        cx="15" 
        cy="10" 
        r="5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.8"
      />
      
      {/* Diamantes en los anillos */}
      <path 
        d="M9 7L9.5 8L9 9L8.5 8Z" 
        fill="currentColor"
      />
      <path 
        d="M15 7L15.5 8L15 9L14.5 8Z" 
        fill="currentColor"
      />
      
      {/* Corazones decorativos */}
      <path 
        d="M12 16C12 15 11 14.5 10.5 15C10 15.5 10.5 16.5 12 18C13.5 16.5 14 15.5 13.5 15C13 14.5 12 15 12 16Z" 
        fill="currentColor" 
        opacity="0.7"
      />
      
      {/* Pequeños corazones flotantes */}
      <circle cx="6" cy="6" r="0.8" fill="currentColor" opacity="0.5"/>
      <circle cx="18" cy="6" r="0.8" fill="currentColor" opacity="0.5"/>
      <circle cx="5" cy="14" r="0.6" fill="currentColor" opacity="0.4"/>
      <circle cx="19" cy="14" r="0.6" fill="currentColor" opacity="0.4"/>
      
      {/* Texto decorativo "LOVE" simulado con puntos */}
      <circle cx="8" cy="20" r="0.4" fill="currentColor" opacity="0.6"/>
      <circle cx="10" cy="20" r="0.4" fill="currentColor" opacity="0.6"/>
      <circle cx="14" cy="20" r="0.4" fill="currentColor" opacity="0.6"/>
      <circle cx="16" cy="20" r="0.4" fill="currentColor" opacity="0.6"/>
    </svg>
  );
};
