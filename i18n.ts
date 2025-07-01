import { getRequestConfig } from 'next-intl/server';

export const locales = ['es', 'en'] as const;
export const defaultLocale = 'es';

export default getRequestConfig(async ({ locale }) => {
  // Manejar caso donde locale es undefined
  const validLocale = locale || defaultLocale;
  
  // Asegurar que el locale es válido
  const finalLocale = locales.includes(validLocale as any) ? validLocale : defaultLocale;
  
  return {
    locale: finalLocale,
    messages: (await import(`./messages/${finalLocale}.json`)).default
  };
});
