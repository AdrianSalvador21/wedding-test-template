import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const AccommodationIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Edificio del hotel - más centrado */}
      <rect 
        x="6" 
        y="8" 
        width="12" 
        height="14" 
        rx="1" 
        fill="currentColor" 
        opacity="0.8"
      />
      
      {/* Techo del hotel */}
      <path 
        d="M5 8L12 4L19 8H5Z" 
        fill="currentColor"
      />
      
      {/* Entrada principal */}
      <rect 
        x="10" 
        y="17" 
        width="4" 
        height="5" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Ventanas del hotel - más balanceadas */}
      <rect x="8" y="10" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      <rect x="10.5" y="10" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      <rect x="12" y="10" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      <rect x="14.5" y="10" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      
      <rect x="8" y="13" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      <rect x="10.5" y="13" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      <rect x="12" y="13" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      <rect x="14.5" y="13" width="1.5" height="1.5" rx="0.3" fill="white" opacity="0.7"/>
      
      {/* Letrero del hotel */}
      <rect 
        x="9" 
        y="6" 
        width="6" 
        height="1.5" 
        rx="0.3" 
        fill="currentColor" 
        opacity="0.9"
      />
      
      {/* Estrella de calidad - centrada */}
      <path 
        d="M12 5L12.3 5.7H13L12.5 6.1L12.7 6.8L12 6.4L11.3 6.8L11.5 6.1L11 5.7H11.7L12 5Z" 
        fill="gold" 
        opacity="0.8"
      />
      
      {/* Awning/toldo sobre la entrada */}
      <path 
        d="M9 17L12 15L15 17H9Z" 
        fill="currentColor" 
        opacity="0.6"
      />
    </svg>
  );
};
