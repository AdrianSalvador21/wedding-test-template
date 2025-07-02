'use client';

// Importamos las traducciones directamente
import esMessages from '../messages/es.json';
import enMessages from '../messages/en.json';
import { usePathname } from 'next/navigation';

export type Language = 'es' | 'en';

const messages = {
  es: esMessages,
  en: enMessages,
};

// Función para obtener un valor anidado usando notación de punto
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && current !== null && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Devuelve la clave original si no encuentra la traducción
    }
  }
  
  return current;
}

// Función para detectar el idioma desde la URL
function detectLanguageFromPath(pathname: string): Language {
  console.log('DEBUG - Ruta actual:', pathname);
  
  // Si la URL empieza con /en, es inglés
  if (pathname.startsWith('/en')) {
    console.log('DEBUG - Detectado inglés por ruta /en');
    return 'en';
  }
  // Por defecto es español
  console.log('DEBUG - Detectado español por defecto');
  return 'es';
}

// Hook para traducciones
export function useTranslations(namespace: string = '') {
  const pathname = usePathname() || '/';
  
  const currentLanguage = detectLanguageFromPath(pathname);
  const currentMessages = messages[currentLanguage] || messages['es'];
  
  const t = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const result = getNestedValue(currentMessages, fullKey);
    // Log temporal para debug
    if (fullKey.includes('timeline.2018.title')) {
      console.log('DEBUG - Buscando:', fullKey);
      console.log('DEBUG - Idioma:', currentLanguage);
      console.log('DEBUG - Resultado:', result);
      console.log('DEBUG - Mensajes disponibles:', Object.keys(currentMessages));
    }
    return result as string;
  };
  
  const raw = (key: string) => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    return getNestedValue(currentMessages, fullKey);
  };
  
  return { t, raw, currentLanguage };
}

// Función para usar sin hook (para casos donde no podemos usar hooks)
export function getTranslation(key: string, language: Language = 'es'): string {
  const currentMessages = messages[language];
  return getNestedValue(currentMessages, key) as string;
}

export { esMessages, enMessages }; 