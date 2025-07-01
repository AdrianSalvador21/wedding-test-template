'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { motion as framerMotion, MotionProps } from 'framer-motion';

interface ConditionalMotionProps extends MotionProps {
  children: ReactNode;
  fallback?: keyof JSX.IntrinsicElements;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
}

// Hook para detectar móvil una sola vez
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLoaded(true);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, isLoaded };
};

// Componente Motion condicional
export const Motion: React.FC<ConditionalMotionProps> = ({ 
  children, 
  fallback = 'div',
  className,
  onClick,
  style,
  ...motionProps 
}) => {
  const { isMobile, isLoaded } = useIsMobile();

  // Mostrar loading mientras detecta el dispositivo
  if (!isLoaded) {
    return React.createElement(fallback, { 
      className,
      style: { opacity: 0 }
    }, children);
  }

  // En móvil, usar elemento HTML normal sin animaciones
  if (isMobile) {
    return React.createElement(fallback, {
      className,
      style,
      onClick,
    }, children);
  }

  // En desktop, usar Framer Motion normal
  return React.createElement(framerMotion.div, {
    className,
    onClick,
    style,
    ...motionProps
  }, children);
};

// Versión simplificada para secciones
export const MotionSection: React.FC<ConditionalMotionProps> = (props) => {
  return <Motion {...props} fallback="section" />;
};

// Versión para divs
export const MotionDiv: React.FC<ConditionalMotionProps> = (props) => {
  return <Motion {...props} fallback="div" />;
}; 