import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const RecommendedPlacesIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Pin de ubicación principal */}
      <path 
        d="M12 2C8.5 2 5.5 5 5.5 8.5C5.5 13.5 12 22 12 22S18.5 13.5 18.5 8.5C18.5 5 15.5 2 12 2Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      {/* Círculo interior del pin */}
      <circle 
        cx="12" 
        cy="8.5" 
        r="3" 
        fill="white" 
        opacity="0.9"
      />
      {/* Corazón en el centro */}
      <path 
        d="M12 9.5C12 8.5 11 8 10.5 8.5C10 9 10.5 10 12 11.5C13.5 10 14 9 13.5 8.5C13 8 12 8.5 12 9.5Z" 
        fill="currentColor"
      />
      {/* Pins secundarios más pequeños */}
      <circle 
        cx="7" 
        cy="12" 
        r="2" 
        fill="currentColor" 
        opacity="0.5"
      />
      <circle 
        cx="7" 
        cy="12" 
        r="1" 
        fill="white" 
        opacity="0.8"
      />
      
      <circle 
        cx="17" 
        cy="10" 
        r="2" 
        fill="currentColor" 
        opacity="0.5"
      />
      <circle 
        cx="17" 
        cy="10" 
        r="1" 
        fill="white" 
        opacity="0.8"
      />
      
      {/* Líneas conectoras sutiles */}
      <path 
        d="M9 10L7 12" 
        stroke="currentColor" 
        strokeWidth="1" 
        opacity="0.3"
        strokeDasharray="2,2"
      />
      <path 
        d="M15 9L17 10" 
        stroke="currentColor" 
        strokeWidth="1" 
        opacity="0.3"
        strokeDasharray="2,2"
      />
    </svg>
  );
};
