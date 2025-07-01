// Función para scroll suave a secciones
export const scrollToSection = (sectionId: string) => {
  if (typeof window !== 'undefined') {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
};

// Función para abrir enlaces externos
export const openExternalLink = (url: string) => {
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}; 