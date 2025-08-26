import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const GalleryIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Marco de foto principal */}
      <rect 
        x="3" 
        y="5" 
        width="14" 
        height="12" 
        rx="2" 
        fill="currentColor" 
        opacity="0.8"
      />
      <rect 
        x="4" 
        y="6" 
        width="12" 
        height="10" 
        rx="1" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Imagen dentro del marco (montañas y sol) */}
      <path 
        d="M4 14L7 10L10 12L16 8V15H4V14Z" 
        fill="currentColor" 
        opacity="0.6"
      />
      <circle 
        cx="13" 
        cy="9" 
        r="1.5" 
        fill="gold" 
        opacity="0.8"
      />
      
      {/* Marco de foto secundario (superpuesto) */}
      <rect 
        x="7" 
        y="9" 
        width="14" 
        height="12" 
        rx="2" 
        fill="currentColor" 
        opacity="0.6"
      />
      <rect 
        x="8" 
        y="10" 
        width="12" 
        height="10" 
        rx="1" 
        fill="white" 
        opacity="0.8"
      />
      
      {/* Imagen en el segundo marco (corazón) */}
      <path 
        d="M14 15C14 14 13 13.5 12.5 14C12 14.5 12.5 15.5 14 17C15.5 15.5 16 14.5 15.5 14C15 13.5 14 14 14 15Z" 
        fill="currentColor" 
        opacity="0.7"
      />
      
      {/* Clips decorativos */}
      <rect 
        x="6" 
        y="4" 
        width="2" 
        height="3" 
        rx="1" 
        fill="currentColor" 
        opacity="0.7"
      />
      <rect 
        x="16" 
        y="8" 
        width="2" 
        height="3" 
        rx="1" 
        fill="currentColor" 
        opacity="0.7"
      />
      
      {/* Pequeños corazones flotantes */}
      <circle cx="19" cy="6" r="0.5" fill="currentColor" opacity="0.5"/>
      <circle cx="21" cy="8" r="0.5" fill="currentColor" opacity="0.5"/>
      <circle cx="20" cy="4" r="0.5" fill="currentColor" opacity="0.5"/>
    </svg>
  );
};
