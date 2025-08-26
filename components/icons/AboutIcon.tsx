import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export const AboutIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Libro de historia abierto */}
      <path 
        d="M3 4C3 3 4 2 5 2H19C20 2 21 3 21 4V18C21 19 20 20 19 20H5C4 20 3 19 3 18V4Z" 
        fill="currentColor" 
        opacity="0.8"
      />
      
      {/* Páginas del libro */}
      <path 
        d="M4 4V18C4 18.5 4.5 19 5 19H11V3H5C4.5 3 4 3.5 4 4Z" 
        fill="white" 
        opacity="0.9"
      />
      <path 
        d="M13 3V19H19C19.5 19 20 18.5 20 18V4C20 3.5 19.5 3 19 3H13Z" 
        fill="white" 
        opacity="0.9"
      />
      
      {/* Línea central del libro */}
      <line 
        x1="12" 
        y1="3" 
        x2="12" 
        y2="19" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      
      {/* Corazones en las páginas representando la historia de amor */}
      <path 
        d="M8 8C8 7 7 6.5 6.5 7C6 7.5 6.5 8.5 8 10C9.5 8.5 10 7.5 9.5 7C9 6.5 8 7 8 8Z" 
        fill="currentColor" 
        opacity="0.7"
      />
      <path 
        d="M16 8C16 7 15 6.5 14.5 7C14 7.5 14.5 8.5 16 10C17.5 8.5 18 7.5 17.5 7C17 6.5 16 7 16 8Z" 
        fill="currentColor" 
        opacity="0.7"
      />
      
      {/* Líneas de texto simuladas */}
      <line x1="6" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="6" y1="14" x2="9" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="6" y1="16" x2="10" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      
      <line x1="14" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="14" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      <line x1="14" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="0.5" opacity="0.4"/>
      
      {/* Marcador de página decorativo */}
      <rect 
        x="11.5" 
        y="1" 
        width="1" 
        height="4" 
        fill="currentColor" 
        opacity="0.6"
      />
    </svg>
  );
};
