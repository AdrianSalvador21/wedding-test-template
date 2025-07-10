'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WeddingTheme, ThemeId, getTheme, generateThemeCSS, classicTheme } from './themes';

interface ThemeContextType {
  currentTheme: WeddingTheme;
  themeId: ThemeId;
  setTheme: (themeId: ThemeId) => void;
  applyTheme: (theme: WeddingTheme) => void;
  isMobile: boolean;
  getResponsiveValue: (mobileValue: string, desktopValue: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: ThemeId;
  weddingTheme?: WeddingTheme; // Tema personalizado desde el servicio
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'classic',
  weddingTheme,
}) => {
  const [themeId, setThemeId] = useState<ThemeId>(initialTheme);
  const [currentTheme, setCurrentTheme] = useState<WeddingTheme>(
    getTheme(initialTheme)
  );
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Aplicar tema personalizado del servicio si existe
  useEffect(() => {
    if (weddingTheme) {
      setCurrentTheme(weddingTheme);
      applyTheme(weddingTheme);
    }
  }, [weddingTheme]);

  // Función para aplicar un tema
  const applyTheme = (theme: WeddingTheme) => {
    const css = generateThemeCSS(theme);
    
    // Remover estilo anterior si existe
    const existingStyle = document.getElementById('theme-variables');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Aplicar nuevo estilo
    const styleElement = document.createElement('style');
    styleElement.id = 'theme-variables';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
    
    // Cargar Google Fonts si es necesario
    loadGoogleFonts(theme);
  };

  // Función para cargar Google Fonts
  const loadGoogleFonts = (theme: WeddingTheme) => {
    const fontsToLoad = [
      theme.fonts.heading.family,
      theme.fonts.body.family,
    ];
    
    fontsToLoad.forEach(fontFamily => {
      const existingLink = document.querySelector(`link[href*="${fontFamily.replace(' ', '+')}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@400;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    });
  };

  // Función para cambiar tema
  const setTheme = (newThemeId: ThemeId) => {
    const newTheme = getTheme(newThemeId);
    setThemeId(newThemeId);
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };

  // Función para obtener valor responsivo
  const getResponsiveValue = (mobileValue: string, desktopValue: string): string => {
    return isMobile ? mobileValue : desktopValue;
  };

  // Aplicar tema inicial al montar
  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  const contextValue: ThemeContextType = {
    currentTheme,
    themeId,
    setTheme,
    applyTheme,
    isMobile,
    getResponsiveValue,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook para usar el contexto de temas
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Hook para obtener clases CSS basadas en el tema
export const useThemeClasses = () => {
  const { currentTheme, isMobile } = useTheme();
  
  return {
    // Colores
    primary: 'text-[var(--color-primary)]',
    secondary: 'text-[var(--color-secondary)]',
    accent: 'text-[var(--color-accent)]',
    background: 'bg-[var(--color-background)]',
    muted: 'bg-[var(--color-muted)]',
    border: 'border-[var(--color-border)]',
    
    // Gradientes
    gradientPrimary: 'bg-[var(--gradient-primary)]',
    gradientOverlay: 'bg-[var(--gradient-overlay)]',
    gradientBackground: 'bg-[var(--gradient-background)]',
    gradientAccent: 'bg-[var(--gradient-accent)]',
    
    // Tipografía
    fontHeading: 'font-[var(--font-heading)]',
    fontBody: 'font-[var(--font-body)]',
    
    // Tamaños de texto responsivos
    heroTitle: isMobile ? currentTheme.typography.heroTitle.mobile : currentTheme.typography.heroTitle.desktop,
    sectionTitle: isMobile ? currentTheme.typography.sectionTitle.mobile : currentTheme.typography.sectionTitle.desktop,
    subtitle: isMobile ? currentTheme.typography.subtitle.mobile : currentTheme.typography.subtitle.desktop,
    body: isMobile ? currentTheme.typography.body.mobile : currentTheme.typography.body.desktop,
    
    // Sombras
    shadowSm: 'shadow-[var(--shadow-sm)]',
    shadowMd: 'shadow-[var(--shadow-md)]',
    shadowLg: 'shadow-[var(--shadow-lg)]',
    shadowXl: 'shadow-[var(--shadow-xl)]',
    
    // Espaciado
    sectionSpacing: isMobile ? currentTheme.spacing.section.mobile : currentTheme.spacing.section.desktop,
    containerSpacing: isMobile ? currentTheme.spacing.container.mobile : currentTheme.spacing.container.desktop,
    
    // Efectos
    blur: currentTheme.effects.blur,
  };
};

// Utility para generar clases CSS dinámicas
export const getThemeUtilities = (theme: WeddingTheme) => {
  return {
    colors: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      accent: theme.colors.accent,
      light: theme.colors.light,
      dark: theme.colors.dark,
      text: theme.colors.text,
      border: theme.colors.border,
      background: theme.colors.background,
      muted: theme.colors.muted,
      success: theme.colors.success,
      warning: theme.colors.warning,
      error: theme.colors.error,
    },
    gradients: {
      primary: theme.gradients.primary,
      overlay: theme.gradients.overlay,
      background: theme.gradients.background,
      accent: theme.gradients.accent,
    },
    fonts: {
      heading: `${theme.fonts.heading.family}, ${theme.fonts.heading.fallback}`,
      body: `${theme.fonts.body.family}, ${theme.fonts.body.fallback}`,
    },
    shadows: {
      sm: theme.shadows.sm,
      md: theme.shadows.md,
      lg: theme.shadows.lg,
      xl: theme.shadows.xl,
    },
  };
}; 