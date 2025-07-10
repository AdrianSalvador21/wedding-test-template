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
      mobile: 'text-2xl',
      desktop: 'text-3xl lg:text-4xl',
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
      mobile: 'text-xl',
      desktop: 'text-2xl lg:text-3xl',
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
      mobile: 'text-3xl',
      desktop: 'text-5xl lg:text-6xl',
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

// Colección de temas disponibles
export const availableThemes = {
  classic: classicTheme,
  romantic: romanticTheme,
  modern: modernTheme,
  elegant: elegantTheme,
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