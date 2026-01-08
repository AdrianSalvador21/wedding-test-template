import { WeddingTheme, getTheme, ThemeId } from './themes';
import { WeddingData } from '../src/types/wedding';
import { getFloralBackgroundStyle } from './floral-patterns';
import { getLuxuryBackgroundStyle } from './floral-patterns';
import { getPremiumBackgroundStyle } from './floral-patterns';
import { getCorporateBackgroundStyle } from './floral-patterns';

// Función para crear un tema completo basado en los datos del servicio
export const createWeddingTheme = (weddingData: WeddingData): WeddingTheme => {
  const { theme } = weddingData;
  
  // Determinar el ID del tema
  let themeId: string;
  
  if (typeof theme === 'string') {
    // Nuevo formato: theme es un string directo desde Firebase
    themeId = theme;
  } else if (theme && typeof theme === 'object' && theme.id) {
    // Formato legacy: theme es un objeto con id
    themeId = theme.id;
  } else {
    // Fallback si no hay tema definido
    themeId = 'classic';
  }
  
  // Obtener el tema predefinido basado en el ID
  if (['classic', 'romantic', 'modern', 'elegant', 'luxury', 'premium', 'corporate', 'special-custom-one', 'special-custom-two', 'special-custom-wood'].includes(themeId)) {
    return getTheme(themeId as ThemeId);
  }
  
  // Si el ID no es reconocido, usar el tema classic como fallback
  console.warn(`Tema desconocido: ${themeId}. Usando tema classic como fallback.`);
  return getTheme('classic');
};

// Función para generar Google Fonts URL basado en un tema
export const generateGoogleFontsUrl = (theme: WeddingTheme): string => {
  const fonts = [];
  
  if (theme.fonts.heading.family !== 'serif' && theme.fonts.heading.family !== 'sans-serif') {
    const headingWeights = theme.fonts.heading.weights?.join(';') || '400;600;700';
    fonts.push(`${theme.fonts.heading.family.replace(' ', '+')}:wght@${headingWeights}`);
  }
  
  if (theme.fonts.body.family !== 'serif' && theme.fonts.body.family !== 'sans-serif' && 
      theme.fonts.body.family !== theme.fonts.heading.family) {
    const bodyWeights = theme.fonts.body.weights?.join(';') || '400;600;700';
    fonts.push(`${theme.fonts.body.family.replace(' ', '+')}:wght@${bodyWeights}`);
  }
  
  if (fonts.length === 0) return '';
  
  return `https://fonts.googleapis.com/css2?${fonts.map(font => `family=${font}`).join('&')}&display=swap`;
};

// Función para validar un tema
export const validateTheme = (theme: Partial<WeddingTheme>): boolean => {
  const required = ['id', 'name', 'colors', 'fonts', 'typography', 'shadows'];
  
  return required.every(field => theme[field as keyof WeddingTheme] !== undefined);
};

// Función para obtener colores de contraste
export const getContrastColor = (hexColor: string): '#ffffff' | '#000000' => {
  // Convertir hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcular luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Función para crear un patrón de color hex con opacidad
export const hexWithOpacity = (hex: string, opacity: number): string => {
  const alpha = Math.round(opacity * 255);
  return `${hex}${alpha.toString(16).padStart(2, '0')}`;
};

// Función para generar tema desde colores básicos
export const generateThemeFromColors = (
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
  name: string = 'Custom Theme'
): WeddingTheme => {
  return {
    id: 'custom',
    name,
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor,
      light: '#fafafa',
      dark: '#1a1a1a',
      text: '#333333',
      border: '#e0e0e0',
      background: '#ffffff',
      muted: '#f5f5f5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    gradients: {
      primary: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
      overlay: `linear-gradient(135deg, ${primaryColor}e6 0%, ${secondaryColor}cc 50%, ${accentColor}b3 100%)`,
      background: 'linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%)',
      accent: `linear-gradient(135deg, ${accentColor} 0%, ${secondaryColor} 100%)`,
    },
    fonts: {
      heading: {
        family: 'Playfair Display',
        weights: [400, 600, 700],
        fallback: 'serif',
      },
      body: {
        family: 'Source Sans Pro',
        weights: [400, 600, 700],
        fallback: 'sans-serif',
      },
    },
    typography: {
      heroTitle: {
        mobile: 'text-4xl',
        desktop: 'text-7xl lg:text-8xl xl:text-9xl',
      },
      sectionTitle: {
        mobile: 'text-2xl',
        desktop: 'text-4xl lg:text-5xl',
      },
      subtitle: {
        mobile: 'text-lg',
        desktop: 'text-xl lg:text-2xl',
      },
      body: {
        mobile: 'text-base',
        desktop: 'text-lg',
      },
    },
    shadows: {
      sm: `0 4px 20px ${primaryColor}1a`,
      md: `0 8px 30px ${primaryColor}26`,
      lg: `0 12px 40px ${primaryColor}33`,
      xl: `0 20px 60px ${primaryColor}40`,
    },
    patterns: {
      primary: 'custom-pattern-1',
      secondary: 'custom-pattern-2',
      accent: 'custom-pattern-3',
      subtle: 'custom-pattern-4',
    },
    spacing: {
      section: {
        mobile: 'py-12 px-8',
        desktop: 'py-16 px-12',
      },
      container: {
        mobile: 'px-6',
        desktop: 'px-8',
      },
    },
    effects: {
      blur: 'backdrop-blur-sm',
      opacity: {
        light: 0.7,
        medium: 0.8,
        heavy: 0.9,
      },
    },
  };
};

// Función universal para obtener patrones de fondo según el tema
export const getThemeBackgroundStyle = (
  themeId: string | undefined,
  patternNumber: number | string,
  size: string = '400px'
) => {
  // Si es el tema luxury, usar patrones luxury
  if (themeId === 'luxury') {
    // Mapear números de patrón a nombres de patrones luxury
    const luxuryPatternMap: Record<number, string> = {
      1: 'luxury-geometric-1',
      2: 'luxury-geometric-2',
      3: 'luxury-ornate-1',
      4: 'luxury-subtle-1',
      5: 'luxury-geometric-1', // Repetir para más variedad
    };
    
    const patternName = typeof patternNumber === 'number' 
      ? luxuryPatternMap[patternNumber] || 'luxury-geometric-1'
      : patternNumber;
    
    return getLuxuryBackgroundStyle(patternName, size);
  }
  
  // Si es el tema premium, usar patrones premium
  if (themeId === 'premium') {
    // Mapear números de patrón a nombres de patrones premium
    const premiumPatternMap: Record<number, string> = {
      1: 'premium-floral-1',
      2: 'premium-floral-2',
      3: 'premium-ornate-1',
      4: 'premium-subtle-1',
      5: 'premium-floral-1', // Repetir para más variedad
    };
    
    const patternName = typeof patternNumber === 'number' 
      ? premiumPatternMap[patternNumber] || 'premium-floral-1'
      : patternNumber;
    
    return getPremiumBackgroundStyle(patternName, size);
  }

  // Si es el tema corporate, usar patrones corporate
  if (themeId === 'corporate') {
    // Mapear números de patrón a nombres de patrones corporate
    const corporatePatternMap: Record<number, string> = {
      1: 'corporate-geometric-1',
      2: 'corporate-geometric-2',
      3: 'corporate-minimal-1',
      4: 'corporate-subtle-1',
      5: 'corporate-geometric-1', // Repetir para más variedad
    };
    
    const patternName = typeof patternNumber === 'number' 
      ? corporatePatternMap[patternNumber] || 'corporate-geometric-1'
      : patternNumber;
    
    return getCorporateBackgroundStyle(patternName, size);
  }
  
  // Si es el tema special-custom-one, usar los mismos patrones que classic (floral)
  if (themeId === 'special-custom-one') {
    const floralPatternNumber = typeof patternNumber === 'string' 
      ? parseInt(patternNumber) || 1
      : patternNumber;
    
    return getFloralBackgroundStyle(floralPatternNumber as 1 | 2 | 3 | 4 | 5, size);
  }
  
  // Si es el tema special-custom-two, usar patrones florales más visibles
  if (themeId === 'special-custom-two') {
    const floralPatternNumber = typeof patternNumber === 'string' 
      ? parseInt(patternNumber) || 1
      : patternNumber;
    
    // Usar patrones florales con mayor opacidad para este tema cálido
    return getFloralBackgroundStyle(floralPatternNumber as 1 | 2 | 3 | 4 | 5, size);
  }
  
  // Si es el tema special-custom-wood, usar patrones florales naturales
  if (themeId === 'special-custom-wood') {
    const floralPatternNumber = typeof patternNumber === 'string' 
      ? parseInt(patternNumber) || 1
      : patternNumber;
    
    // Usar patrones florales con tonos naturales para el tema wood
    return getFloralBackgroundStyle(floralPatternNumber as 1 | 2 | 3 | 4 | 5, size);
  }
  
  // Para todos los demás temas, usar patrones florales
  const floralPatternNumber = typeof patternNumber === 'string' 
    ? parseInt(patternNumber) || 1
    : patternNumber;
  
  return getFloralBackgroundStyle(floralPatternNumber as 1 | 2 | 3 | 4 | 5, size);
}; 