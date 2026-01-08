export interface WeddingTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    light: string;
    dark: string;
    text: string;
    border: string;
    background: string;
    muted: string;
    success: string;
    warning: string;
    error: string;
  };
  gradients: {
    primary: string;
    overlay: string;
    background: string;
    accent: string;
  };
  fonts: {
    heading: {
      family: string;
      weights: number[];
      fallback: string;
    };
    body: {
      family: string;
      weights: number[];
      fallback: string;
    };
  };
  typography: {
    heroTitle: {
      mobile: string;
      desktop: string;
    };
    sectionTitle: {
      mobile: string;
      desktop: string;
    };
    subtitle: {
      mobile: string;
      desktop: string;
    };
    body: {
      mobile: string;
      desktop: string;
    };
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  patterns: {
    primary: string;
    secondary: string;
    accent: string;
    subtle: string;
  };
  spacing: {
    section: {
      mobile: string;
      desktop: string;
    };
    container: {
      mobile: string;
      desktop: string;
    };
  };
  effects: {
    blur: string;
    opacity: {
      light: number;
      medium: number;
      heavy: number;
    };
  };
}

// Tema por defecto (actual)
export const classicTheme: WeddingTheme = {
  id: 'classic',
  name: 'Classic Wedding',
  colors: {
    primary: '#8b7355',
    secondary: '#a67c5a',
    accent: '#d4af8c',
    light: '#faf8f5',
    dark: '#5a4a3a',
    text: '#6b5b4f',
    border: '#e8ddd4',
    background: '#ffffff',
    muted: '#f5f5f5',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8b7355 0%, #a67c5a 100%)',
    overlay: 'linear-gradient(135deg, rgba(139, 115, 85, 0.9) 0%, rgba(166, 124, 90, 0.8) 50%, rgba(212, 175, 140, 0.7) 100%)',
    background: 'linear-gradient(to bottom, #faf8f5 0%, #f5f1ea 100%)',
    accent: 'linear-gradient(135deg, #d4af8c 0%, #c49d7a 100%)',
  },
  fonts: {
    heading: {
      family: 'Cormorant Garamond',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
    body: {
      family: 'Lora',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
  },
  typography: {
    heroTitle: {
      mobile: 'text-4xl',
      desktop: 'text-7xl lg:text-8xl xl:text-9xl',
    },
    sectionTitle: {
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
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
    sm: '0 4px 20px rgba(139, 115, 85, 0.1)',
    md: '0 8px 30px rgba(139, 115, 85, 0.15)',
    lg: '0 12px 40px rgba(139, 115, 85, 0.2)',
    xl: '0 20px 60px rgba(139, 115, 85, 0.25)',
  },
  patterns: {
    primary: 'floral-classic-1',
    secondary: 'floral-classic-2',
    accent: 'floral-classic-3',
    subtle: 'floral-classic-4',
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

// Tema Romántico Rosa
export const romanticTheme: WeddingTheme = {
  id: 'romantic',
  name: 'Romantic Blush',
  colors: {
    primary: '#d4afb9',
    secondary: '#c9a4af',
    accent: '#f2d7d5',
    light: '#fdf7f7',
    dark: '#8b5a6b',
    text: '#7c5f66',
    border: '#e8d3d3',
    background: '#ffffff',
    muted: '#f8f4f4',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #d4afb9 0%, #c9a4af 100%)',
    overlay: 'linear-gradient(135deg, rgba(212, 175, 185, 0.9) 0%, rgba(201, 164, 175, 0.8) 50%, rgba(242, 215, 213, 0.7) 100%)',
    background: 'linear-gradient(to bottom, #fdf7f7 0%, #f8f0f0 100%)',
    accent: 'linear-gradient(135deg, #f2d7d5 0%, #e8c4c4 100%)',
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
      desktop: 'text-6xl lg:text-7xl xl:text-8xl',
    },
    sectionTitle: {
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
    },
    subtitle: {
      mobile: 'text-lg',
      desktop: 'text-xl',
    },
    body: {
      mobile: 'text-base',
      desktop: 'text-lg',
    },
  },
  shadows: {
    sm: '0 4px 20px rgba(212, 175, 185, 0.1)',
    md: '0 8px 30px rgba(212, 175, 185, 0.15)',
    lg: '0 12px 40px rgba(212, 175, 185, 0.2)',
    xl: '0 20px 60px rgba(212, 175, 185, 0.25)',
  },
  patterns: {
    primary: 'floral-romantic-1',
    secondary: 'floral-romantic-2',
    accent: 'floral-romantic-3',
    subtle: 'floral-romantic-4',
  },
  spacing: {
    section: {
      mobile: 'py-10 px-6',
      desktop: 'py-14 px-10',
    },
    container: {
      mobile: 'px-4',
      desktop: 'px-6',
    },
  },
  effects: {
    blur: 'backdrop-blur-md',
    opacity: {
      light: 0.6,
      medium: 0.75,
      heavy: 0.85,
    },
  },
};

// Tema Moderno Minimalista
export const modernTheme: WeddingTheme = {
  id: 'modern',
  name: 'Modern Minimalist',
  colors: {
    primary: '#2d3748',
    secondary: '#4a5568',
    accent: '#68d391',
    light: '#f7fafc',
    dark: '#1a202c',
    text: '#4a5568',
    border: '#e2e8f0',
    background: '#ffffff',
    muted: '#f1f5f9',
    success: '#38a169',
    warning: '#ed8936',
    error: '#e53e3e',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
    overlay: 'linear-gradient(135deg, rgba(45, 55, 72, 0.9) 0%, rgba(74, 85, 104, 0.8) 50%, rgba(104, 211, 145, 0.7) 100%)',
    background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
    accent: 'linear-gradient(135deg, #68d391 0%, #48bb78 100%)',
  },
  fonts: {
    heading: {
      family: 'Inter',
      weights: [400, 600, 700],
      fallback: 'sans-serif',
    },
    body: {
      family: 'Inter',
      weights: [400, 500, 600],
      fallback: 'sans-serif',
    },
  },
  typography: {
    heroTitle: {
      mobile: 'text-3xl',
      desktop: 'text-5xl lg:text-6xl xl:text-7xl',
    },
    sectionTitle: {
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
    },
    subtitle: {
      mobile: 'text-base',
      desktop: 'text-lg',
    },
    body: {
      mobile: 'text-sm',
      desktop: 'text-base',
    },
  },
  shadows: {
    sm: '0 4px 20px rgba(45, 55, 72, 0.08)',
    md: '0 8px 30px rgba(45, 55, 72, 0.12)',
    lg: '0 12px 40px rgba(45, 55, 72, 0.16)',
    xl: '0 20px 60px rgba(45, 55, 72, 0.2)',
  },
  patterns: {
    primary: 'geometric-modern-1',
    secondary: 'geometric-modern-2',
    accent: 'geometric-modern-3',
    subtle: 'geometric-modern-4',
  },
  spacing: {
    section: {
      mobile: 'py-8 px-4',
      desktop: 'py-12 px-8',
    },
    container: {
      mobile: 'px-4',
      desktop: 'px-6',
    },
  },
  effects: {
    blur: 'backdrop-blur-lg',
    opacity: {
      light: 0.8,
      medium: 0.9,
      heavy: 0.95,
    },
  },
};

// Tema Elegante Dorado
export const elegantTheme: WeddingTheme = {
  id: 'elegant',
  name: 'Elegant Gold',
  colors: {
    primary: '#b8860b',
    secondary: '#daa520',
    accent: '#ffd700',
    light: '#fffef7',
    dark: '#8b4513',
    text: '#704214',
    border: '#e6d690',
    background: '#ffffff',
    muted: '#faf8f0',
    success: '#22c55e',
    warning: '#f97316',
    error: '#dc2626',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #b8860b 0%, #daa520 100%)',
    overlay: 'linear-gradient(135deg, rgba(184, 134, 11, 0.9) 0%, rgba(218, 165, 32, 0.8) 50%, rgba(255, 215, 0, 0.7) 100%)',
    background: 'linear-gradient(to bottom, #fffef7 0%, #faf8f0 100%)',
    accent: 'linear-gradient(135deg, #ffd700 0%, #ffed4a 100%)',
  },
  fonts: {
    heading: {
      family: 'Crimson Text',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
    body: {
      family: 'Libre Baskerville',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
  },
  typography: {
    heroTitle: {
      mobile: 'text-4xl',
      desktop: 'text-8xl lg:text-9xl',
    },
    sectionTitle: {
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
    },
    subtitle: {
      mobile: 'text-xl',
      desktop: 'text-2xl lg:text-3xl',
    },
    body: {
      mobile: 'text-base',
      desktop: 'text-lg',
    },
  },
  shadows: {
    sm: '0 4px 20px rgba(184, 134, 11, 0.1)',
    md: '0 8px 30px rgba(184, 134, 11, 0.15)',
    lg: '0 12px 40px rgba(184, 134, 11, 0.2)',
    xl: '0 20px 60px rgba(184, 134, 11, 0.25)',
  },
  patterns: {
    primary: 'ornate-gold-1',
    secondary: 'ornate-gold-2',
    accent: 'ornate-gold-3',
    subtle: 'ornate-gold-4',
  },
  spacing: {
    section: {
      mobile: 'py-16 px-8',
      desktop: 'py-20 px-12',
    },
    container: {
      mobile: 'px-6',
      desktop: 'px-10',
    },
  },
  effects: {
    blur: 'backdrop-blur-xl',
    opacity: {
      light: 0.85,
      medium: 0.9,
      heavy: 0.95,
    },
  },
};

// Tema Luxury Champagne
export const luxuryTheme: WeddingTheme = {
  id: 'luxury',
  name: 'Luxury Champagne',
  colors: {
    primary: '#8b7d6b',     // Bronce champagne elegante
    secondary: '#a69788',   // Champagne suave
    accent: '#c8b99c',      // Champagne claro
    light: '#faf9f7',       // Champagne muy claro
    dark: '#6b5d4f',        // Marrón sofisticado
    text: '#5a4f45',        // Marrón cálido oscuro
    border: '#e6ddd4',      // Beige claro
    background: '#ffffff',   // Blanco puro
    muted: '#f7f5f2',       // Beige muy claro
    success: '#7c8471',     // Verde sage
    warning: '#b8860b',     // Dorado sutil
    error: '#a0522d',       // Sienna elegante
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8b7d6b 0%, #a69788 100%)',
    overlay: 'linear-gradient(135deg, rgba(139, 125, 107, 0.9) 0%, rgba(166, 151, 136, 0.8) 50%, rgba(200, 185, 156, 0.7) 100%)',
    background: 'linear-gradient(to bottom, #faf9f7 0%, #f7f5f2 100%)',
    accent: 'linear-gradient(135deg, #c8b99c 0%, #b8a687 100%)',
  },
  fonts: {
    heading: {
      family: 'Playfair Display',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
    body: {
      family: 'Inter',
      weights: [400, 500, 600],
      fallback: 'sans-serif',
    },
  },
  typography: {
    heroTitle: {
      mobile: 'text-4xl',
      desktop: 'text-7xl lg:text-8xl xl:text-9xl',
    },
    sectionTitle: {
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
    },
    subtitle: {
      mobile: 'text-xl',
      desktop: 'text-2xl lg:text-3xl',
    },
    body: {
      mobile: 'text-base',
      desktop: 'text-lg',
    },
  },
  shadows: {
    sm: '0 4px 20px rgba(139, 125, 107, 0.1)',
    md: '0 8px 30px rgba(139, 125, 107, 0.15)',
    lg: '0 12px 40px rgba(139, 125, 107, 0.2)',
    xl: '0 20px 60px rgba(139, 125, 107, 0.25)',
  },
  patterns: {
    primary: 'luxury-geometric-1',
    secondary: 'luxury-geometric-2',
    accent: 'luxury-ornate-1',
    subtle: 'luxury-subtle-1',
  },
  spacing: {
    section: {
      mobile: 'py-14 px-8',
      desktop: 'py-18 px-12',
    },
    container: {
      mobile: 'px-6',
      desktop: 'px-10',
    },
  },
  effects: {
    blur: 'backdrop-blur-lg',
    opacity: {
      light: 0.8,
      medium: 0.9,
      heavy: 0.95,
    },
  },
};

// Tema Premium Rose Gold
export const premiumTheme: WeddingTheme = {
  id: 'premium',
  name: 'Premium Rose Gold',
  colors: {
    primary: '#a08060',        // Champagne dorado suave y elegante
    secondary: '#c9b49a',      // Beige rosado muy suave
    accent: '#b8a687',         // Champagne dorado intermedio (más cálido y armonioso)
    light: '#fdf9f7',          // Blush muy claro
    dark: '#5d4a52',           // Marrón rosado oscuro
    text: '#4a3d42',           // Marrón cálido oscuro
    border: '#e8ddd4',         // Beige claro
    background: '#ffffff',      // Blanco puro
    muted: '#f9f5f2',          // Beige casi blanco
    success: '#7a8471',        // Verde sage suave
    warning: '#c9b49a',        // Champagne suave
    error: '#b8a687',          // Champagne dorado para error (más suave)
  },
  gradients: {
    primary: 'linear-gradient(135deg, #a08060 0%, #c9b49a 100%)',
    overlay: 'linear-gradient(135deg, rgba(160, 128, 96, 0.85) 0%, rgba(201, 180, 154, 0.75) 50%, rgba(184, 166, 135, 0.65) 100%)',
    background: 'linear-gradient(to bottom, #fdf9f7 0%, #f9f5f2 100%)',
    accent: 'linear-gradient(135deg, #b8a687 0%, #c9b49a 100%)',
  },
  fonts: {
    heading: {
      family: 'Cormorant Garamond',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
    body: {
      family: 'Crimson Text',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
  },
  typography: {
    heroTitle: {
      mobile: 'text-4xl',
      desktop: 'text-8xl lg:text-9xl xl:text-10xl',
    },
    sectionTitle: {
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
    },
    subtitle: {
      mobile: 'text-xl',
      desktop: 'text-2xl lg:text-3xl',
    },
    body: {
      mobile: 'text-base',
      desktop: 'text-lg',
    },
  },
  shadows: {
    sm: '0 4px 20px rgba(160, 128, 96, 0.12)',
    md: '0 8px 30px rgba(160, 128, 96, 0.18)',
    lg: '0 12px 40px rgba(160, 128, 96, 0.24)',
    xl: '0 20px 60px rgba(160, 128, 96, 0.30)',
  },
  patterns: {
    primary: 'premium-floral-1',
    secondary: 'premium-floral-2',
    accent: 'premium-ornate-1',
    subtle: 'premium-subtle-1',
  },
  spacing: {
    section: {
      mobile: 'py-16 px-8',
      desktop: 'py-20 px-12',
    },
    container: {
      mobile: 'px-6',
      desktop: 'px-10',
    },
  },
  effects: {
    blur: 'backdrop-blur-xl',
    opacity: {
      light: 0.85,
      medium: 0.92,
      heavy: 0.98,
    },
  },
};

// Tema Corporate Professional
export const corporateTheme: WeddingTheme = {
  id: 'corporate',
  name: 'Corporate Professional',
  colors: {
    primary: '#4a5568',        // Gris azulado profesional
    secondary: '#718096',      // Gris medio corporativo
    accent: '#6b7280',         // Gris suave profesional
    light: '#f7fafc',          // Gris muy claro
    dark: '#1a202c',           // Gris muy oscuro
    text: '#2d3748',           // Gris oscuro para texto
    border: '#e2e8f0',         // Gris claro para bordes
    background: '#ffffff',      // Blanco puro
    muted: '#f7fafc',          // Gris muy claro
    success: '#38a169',        // Verde corporativo
    warning: '#d69e2e',        // Amarillo corporativo
    error: '#e53e3e',          // Rojo corporativo
  },
  gradients: {
    primary: 'linear-gradient(135deg, #4a5568 0%, #718096 100%)',
    overlay: 'linear-gradient(135deg, rgba(74, 85, 104, 0.95) 0%, rgba(113, 128, 150, 0.9) 50%, rgba(45, 55, 72, 0.85) 100%)',
    background: 'linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%)',
    accent: 'linear-gradient(135deg, #6b7280 0%, #4a5568 100%)',
  },
  fonts: {
    heading: {
      family: 'Inter',
      weights: [400, 600, 700],
      fallback: 'sans-serif',
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
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
    },
    subtitle: {
      mobile: 'text-xl',
      desktop: 'text-2xl lg:text-3xl',
    },
    body: {
      mobile: 'text-base',
      desktop: 'text-lg',
    },
  },
  shadows: {
    sm: '0 4px 20px rgba(74, 85, 104, 0.15)',
    md: '0 8px 30px rgba(74, 85, 104, 0.20)',
    lg: '0 12px 40px rgba(74, 85, 104, 0.25)',
    xl: '0 20px 60px rgba(74, 85, 104, 0.30)',
  },
  patterns: {
    primary: 'corporate-geometric-1',
    secondary: 'corporate-geometric-2',
    accent: 'corporate-minimal-1',
    subtle: 'corporate-subtle-1',
  },
  spacing: {
    section: {
      mobile: 'py-16 px-8',
      desktop: 'py-20 px-12',
    },
    container: {
      mobile: 'px-6',
      desktop: 'px-10',
    },
  },
  effects: {
    blur: 'backdrop-blur-md',
    opacity: {
      light: 0.90,
      medium: 0.95,
      heavy: 0.98,
    },
  },
};

// Tema Special Custom One (basado en invitación beige/marrón)
export const specialCustomTheme: WeddingTheme = {
  id: 'special-custom-one',
  name: 'Special Custom',
  colors: {
    primary: '#8b7355',        // Marrón medio (igual al classic para consistencia)
    secondary: '#6b5b47',      // Marrón oscuro del texto de la invitación
    accent: '#97876af5',         // Beige dorado claro
    light: '#f8f6f2',          // Crema muy claro (fondo de la invitación)
    dark: '#4a3f35',           // Marrón muy oscuro
    text: '#6b5b47',           // Marrón oscuro para texto principal
    border: '#e8ddd4',         // Beige claro para bordes
    background: '#ffffff',      // Blanco puro
    muted: '#f5f2ed',          // Beige muy claro
    success: '#8b7355',        // Usar color primario para success
    warning: '#d4c4a8',        // Usar accent para warning
    error: '#8b5a3c',          // Marrón rojizo suave
  },
  gradients: {
    primary: 'linear-gradient(135deg, #8b7355 0%, #6b5b47 100%)',
    overlay: 'linear-gradient(135deg, rgba(139, 115, 85, 0.9) 0%, rgba(107, 91, 71, 0.85) 50%, rgba(212, 196, 168, 0.7) 100%)',
    background: 'linear-gradient(to bottom, #f8f6f2 0%, #f5f2ed 100%)',
    accent: 'linear-gradient(135deg, #d4c4a8 0%, #c4b396 100%)',
  },
  fonts: {
    heading: {
      family: 'Cormorant Garamond',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
    body: {
      family: 'Lora',
      weights: [400, 600, 700],
      fallback: 'serif',
    },
  },
  typography: {
    heroTitle: {
      mobile: 'text-4xl',
      desktop: 'text-7xl lg:text-8xl xl:text-9xl',
    },
    sectionTitle: {
      mobile: 'text-[26px]',
      desktop: 'text-[26px]',
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
    sm: '0 4px 20px rgba(107, 91, 71, 0.12)',
    md: '0 8px 30px rgba(107, 91, 71, 0.18)',
    lg: '0 12px 40px rgba(107, 91, 71, 0.24)',
    xl: '0 20px 60px rgba(107, 91, 71, 0.30)',
  },
  patterns: {
    primary: 'floral-classic-1',    // Usar los mismos SVGs que maria-y-juan
    secondary: 'floral-classic-2',  // Usar los mismos SVGs que maria-y-juan
    accent: 'floral-classic-3',     // Usar los mismos SVGs que maria-y-juan
    subtle: 'floral-classic-4',     // Usar los mismos SVGs que maria-y-juan
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

// Tema Special Custom Two (paleta cálida elegante: terracota, burgundy, bronce)
export const specialCustomTwoTheme: WeddingTheme = {
  id: 'special-custom-two',
  name: 'Elegant Warmth',
  colors: {
    primary: '#A0522D',        // Sienna elegante (terracota refinado)
    secondary: '#8B1538',      // Burgundy profundo (menos chillón que el rojo)
    accent: '#c87a10',         // Oro oscuro (bronce elegante, no amarillo chillón)
    light: '#FAF7F2',          // Lino suave (crema muy sutil)
    dark: '#754915',           // Marrón chocolate oscuro
    text: '#4A4A4A',           // Gris carbón (más legible y elegante)
    border: '#D7CCC8',         // Beige grisáceo muy sutil
    background: '#FEFEFE',     // Blanco casi puro
    muted: '#F3EDE7',          // Beige pálido muy sutil
    success: '#6B7C32',        // Verde olivo apagado (más elegante)
    warning: '#C17817',        // Bronce cálido (no naranja chillón)
    error: '#A0342C',          // Terracota oscuro para errores
  },
  gradients: {
    primary: 'linear-gradient(135deg, #d27f0e 0%, #72460af0 100%)',
    overlay: 'linear-gradient(135deg, rgba(160, 82, 45, 0.85) 0%, rgba(139, 21, 56, 0.80) 50%, rgba(184, 134, 11, 0.65) 100%)',
    background: 'linear-gradient(to bottom, #FAF7F2 0%, #F3EDE7 100%)',
    accent: 'linear-gradient(135deg, #B8860B 0%, #C17817 100%)',
  },
  fonts: {
    heading: {
      family: 'Playfair Display',
      weights: [400, 600, 700, 900],
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
      mobile: 'text-[28px]',
      desktop: 'text-[32px]',
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
    sm: '0 4px 20px rgba(160, 82, 45, 0.12)',
    md: '0 8px 30px rgba(160, 82, 45, 0.16)',
    lg: '0 12px 40px rgba(160, 82, 45, 0.20)',
    xl: '0 20px 60px rgba(160, 82, 45, 0.24)',
  },
  patterns: {
    primary: 'autumn-floral-1',    // Patrones más visibles para este tema
    secondary: 'autumn-floral-2',  
    accent: 'autumn-floral-3',     
    subtle: 'autumn-floral-4',     
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
      light: 0.75,
      medium: 0.85,
      heavy: 0.95,
    },
  },
};

// Tema Special Custom Wood (paleta natural: verde oliva, madera y oro suave)
export const specialCustomWoodTheme: WeddingTheme = {
  id: 'special-custom-wood',
  name: 'Natural Wood & Olive',
  colors: {
    primary: '#3c4b23de',        // Olive 1 - Verde oliva principal
    secondary: '#4B5E2A',      // Olive 2 - Verde oliva más oscuro
    accent: '#b29f6e',         // Soft Gold - Oro suave para acentos
    light: '#FAF8F2',          // Off-white - Fondo claro natural
    dark: '#222e19',           // Charcoal - Texto principal oscuro
    text: '#28282B',           // Charcoal para texto principal
    border: '#E8E2D5',         // Beige claro derivado del off-white
    background: '#FFFFFF',      // Blanco puro para contraste
    muted: '#F5F2EA',          // Tono intermedio entre off-white y blanco
    success: '#556B2F',        // Usar color primario para success
    warning: '#C8B27A',        // Usar accent para warning
    error: '#8B4A3C',          // Marrón rojizo suave para errores
  },
  gradients: {
    primary: 'linear-gradient(135deg, #1f2a1aed 0%, #141e03 100%)',
    overlay: 'linear-gradient(135deg, rgba(85, 107, 47, 0.9) 0%, rgba(75, 94, 42, 0.85) 50%, rgba(200, 178, 122, 0.7) 100%)',
    background: 'linear-gradient(to bottom, #FAF8F2 0%, #F5F2EA 100%)',
    accent: 'linear-gradient(135deg, #C8B27A 0%, #B8A66A 100%)',
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
      mobile: 'text-[26px]',
      desktop: 'text-[28px]',
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
    sm: '0 4px 20px rgba(85, 107, 47, 0.12)',
    md: '0 8px 30px rgba(85, 107, 47, 0.16)',
    lg: '0 12px 40px rgba(85, 107, 47, 0.20)',
    xl: '0 20px 60px rgba(85, 107, 47, 0.24)',
  },
  patterns: {
    primary: 'nature-olive-1',     // Patrones naturales para este tema
    secondary: 'nature-olive-2',   
    accent: 'nature-olive-3',      
    subtle: 'nature-olive-4',      
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

// Colección de temas disponibles
export const availableThemes = {
  classic: classicTheme,
  romantic: romanticTheme,
  modern: modernTheme,
  elegant: elegantTheme,
  luxury: luxuryTheme,
  premium: premiumTheme,
  corporate: corporateTheme,
  'special-custom-one': specialCustomTheme,
  'special-custom-two': specialCustomTwoTheme,
  'special-custom-wood': specialCustomWoodTheme,
} as const;

export type ThemeId = keyof typeof availableThemes;

// Función para obtener un tema por ID
export const getTheme = (themeId: ThemeId): WeddingTheme => {
  return availableThemes[themeId];
};

// Función para generar CSS custom properties
export const generateThemeCSS = (theme: WeddingTheme): string => {
  return `
    :root {
      /* Colores */
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-light: ${theme.colors.light};
      --color-dark: ${theme.colors.dark};
      --color-text: ${theme.colors.text};
      --color-border: ${theme.colors.border};
      --color-background: ${theme.colors.background};
      --color-muted: ${theme.colors.muted};
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};

      /* Gradientes */
      --gradient-primary: ${theme.gradients.primary};
      --gradient-overlay: ${theme.gradients.overlay};
      --gradient-background: ${theme.gradients.background};
      --gradient-accent: ${theme.gradients.accent};

      /* Tipografía */
      --font-heading: ${theme.fonts.heading.family}, ${theme.fonts.heading.fallback};
      --font-body: ${theme.fonts.body.family}, ${theme.fonts.body.fallback};

      /* Sombras */
      --shadow-sm: ${theme.shadows.sm};
      --shadow-md: ${theme.shadows.md};
      --shadow-lg: ${theme.shadows.lg};
      --shadow-xl: ${theme.shadows.xl};

      /* Efectos */
      --blur: ${theme.effects.blur};
      --opacity-light: ${theme.effects.opacity.light};
      --opacity-medium: ${theme.effects.opacity.medium};
      --opacity-heavy: ${theme.effects.opacity.heavy};
    }
  `;
}; 