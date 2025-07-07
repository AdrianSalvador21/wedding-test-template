import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8b7355',
        secondary: '#a67c5a', 
        accent: '#d4af8c',
        light: '#faf8f5',
        dark: '#5a4a3a',
        text: '#6b5b4f',
        border: '#e8ddd4',
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8b7355 0%, #a67c5a 100%)',
        'gradient-overlay': 'linear-gradient(135deg, rgba(139, 115, 85, 0.9) 0%, rgba(166, 124, 90, 0.8) 50%, rgba(212, 175, 140, 0.7) 100%)',
      },
      boxShadow: {
        'elegant': '0 4px 20px rgba(139, 115, 85, 0.1)',
        'elegant-md': '0 8px 30px rgba(139, 115, 85, 0.15)',
        'elegant-lg': '0 12px 40px rgba(139, 115, 85, 0.2)',
      },
      animation: {
        'bounce-gentle': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
