import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const DressCodeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Traje elegante - chaqueta */}
      <path 
        d="M8 6L8 8L6 9L6 20L18 20L18 9L16 8L16 6L12 4L8 6Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      
      {/* Camisa */}
      <path 
        d="M10 8L10 20L14 20L14 8L12 7L10 8Z" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Corbatín/pajarita */}
      <path 
        d="M10 9L12 8L14 9L13 10L12 9.5L11 10L10 9Z" 
        fill="currentColor"
      />
      
      {/* Botones de la camisa */}
      <circle cx="12" cy="11" r="0.4" fill="currentColor" opacity="0.7"/>
      <circle cx="12" cy="13" r="0.4" fill="currentColor" opacity="0.7"/>
      <circle cx="12" cy="15" r="0.4" fill="currentColor" opacity="0.7"/>
      
      {/* Solapas del traje */}
      <path 
        d="M8 8L10 10L10 8L8 8Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      <path 
        d="M16 8L14 10L14 8L16 8Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      
      {/* Pañuelo del bolsillo */}
      <rect 
        x="8.5" 
        y="10" 
        width="1.5" 
        height="1" 
        fill="white" 
        opacity="0.8"
      />
    </svg>
  );
};
