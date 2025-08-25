// Helper functions to handle bilingual data migration
export function getBilingualText(field: string | { es: string; en: string }, language: 'es' | 'en' = 'es'): string {
  if (typeof field === 'string') {
    // Legacy format - return as is for now
    return field;
  }
  
  if (field && typeof field === 'object' && field.es && field.en) {
    // New bilingual format
    return field[language] || field.es;
  }
  
  return '';
}

export function getBilingualArray(field: string[] | { es: string[]; en: string[] }, language: 'es' | 'en' = 'es'): string[] {
  if (Array.isArray(field)) {
    // Legacy format - return as is for now
    return field;
  }
  
  if (field && typeof field === 'object' && field.es && field.en) {
    // New bilingual format
    return field[language] || field.es;
  }
  
  return [];
}

export function detectLanguageFromUrl(): 'es' | 'en' {
  if (typeof window === 'undefined') {
    return 'es'; // Default for SSR
  }
  
  const url = window.location.href;
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for explicit language parameter
  const langParam = urlParams.get('lang');
  if (langParam === 'en' || langParam === 'es') {
    return langParam as 'es' | 'en';
  }
  
  // Check URL path for language indicator
  if (url.includes('/en/') || url.includes('/en?')) {
    return 'en';
  }
  
  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('en')) {
    return 'en';
  }
  
  // Default to Spanish
  return 'es';
}

export function getUserLanguage(): 'es' | 'en' {
  return detectLanguageFromUrl();
}
