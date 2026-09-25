# 10 — SEO de lanzamiento: base técnica, páginas de intención y posicionamiento orgánico

**Estado:** Approved
**Depende de:** SPEC 03, SPEC 05
**Fecha:** 2026-09-25

## Objetivo

Corregir y completar el SEO técnico de `https://www.invyta.me` (host canónico, metadatos, sitemap, robots, datos estructurados, vista previa al compartir y rendimiento), reescribir la landing con "invitaciones digitales para boda" como término principal y publicar seis páginas indexables nuevas (tres diseños, paquetes, wedding planners y preguntas frecuentes) para que Google y Bing indexen el sitio y empiece a posicionar lo antes posible.

> **Diseño de las páginas nuevas (10 artboards, por validar con el usuario):** https://claude.ai/artifact/1jw7E218WjCRj4xWqTEAuC — `/paquetes`, las tres páginas de diseño, `/wedding-planners`, `/preguntas-frecuentes` y la página 404 en escritorio (1280 px), más `/paquetes`, `/disenos/clasico` y `/preguntas-frecuentes` en móvil (390 px). Incluye la navegación y el pie ampliados con enlaces a las páginas nuevas. Los textos del diseño son propuesta tomada de `docs/BRAND-FOUNDATIONS.md` y `Packages.tsx`; las preguntas marcadas "Nueva" en el FAQ son ejemplos de las que pide el paso 13. Una vez validado, los pasos 2 y 9 a 13 se implementan con ese diseño como referencia.
>
> **Expectativa honesta.** Nadie puede garantizar una posición ni un plazo: depende de la competencia (Bodas.com.mx, Canva, otras plataformas de invitaciones) y de la autoridad de un dominio nuevo. Este spec controla lo que sí se controla: que el sitio sea rastreable e indexable sin errores, que cada página responda a una búsqueda concreta, que el rendimiento pase los umbrales de Google y que la indexación se solicite el día del lanzamiento. Los resultados se miden en Search Console (paso 17 y siguientes), no se prometen.

## Contexto

Estado real del sitio, verificado el 2026-09-25 con `curl` sobre producción y revisando el código (no asumido):

**Host y redirecciones**

- `https://invyta.me` responde **307 (temporal)** a `https://www.invyta.me`. El host que sirve la app es `www`.
- El HTML de producción declara `canonical`, `og:url` y `og:image` con `https://invyta.me` (sin www): el canonical apunta a una URL que redirige. `app/sitemap.ts`, `public/robots.txt` y `components/StructuredData.tsx` también usan el host sin www.
- `/es` responde 307 a `/` (`localePrefix: 'as-needed'` de `middleware.ts`), pero `app/sitemap.ts` lo lista como URL propia.

**Archivos que no existen**

- `app/page.tsx` declara `/assets/landing/og-image.jpg`, `/favicon.ico`, `/favicon-16x16.png`, `/favicon-32x32.png`, `/apple-touch-icon.png`, `/safari-pinned-tab.svg` y `/assets/landing/logo.png`. En `public/` solo existe `favicon.svg`. `og-image.jpg` da 404 en producción: al compartir el enlace por WhatsApp no hay imagen.
- `public/site.webmanifest` referencia `android-chrome-192x192.png`, `android-chrome-512x512.png` y dos capturas que tampoco existen; su `theme_color` es `#d97706` (ámbar), que no es de la marca (terracota `#C6663C`).

**Rutas que fallan por el middleware**

- El `matcher` de `middleware.ts` solo excluye `api`, `_next`, `favicon.ico` y `assets`. Cualquier otro archivo de `public/` se reescribe a `/es/<archivo>` y da 404: en producción `/site.webmanifest` y `/google-site-verification.html` responden **404**. Solo `/robots.txt` y `/sitemap.xml` funcionan porque el propio middleware los deja pasar.
- `app/[locale]/page.tsx` coincide con cualquier ruta de un solo segmento que el middleware no reescribe: `/favicon.ico` responde **200 con HTML** (soft 404), y `app/[locale]/layout.tsx` no valida el idioma.
- Una página nueva como `/paquetes` se reescribiría a `/es/paquetes` y daría 404 mientras no se exente del middleware.
- No hay `app/not-found.tsx`.

**Robots, sitemap y noindex**

- `public/robots.txt` incluye `Crawl-delay` (Google lo ignora), `Allow: /es#*` (los fragmentos no existen para el rastreador) y `Disallow: /*/wedding/`, que **no** cubre `/wedding/...` sin prefijo de idioma (el patrón exige un segmento antes). Bloquear el rastreo además impide que Google vea el `noindex` de esas páginas.
- `app/sitemap.ts` lista siete URLs con `#fragmento`, que Google ignora, y usa `new Date()` como `lastModified` en cada build, lo que señala una frescura falsa.
- `app/[locale]/layout.tsx` marca todo `/[locale]/*` como `noindex`; `admin` y `login` lo heredan. Es correcto, pero no hay `X-Robots-Tag` como refuerzo.
- Las invitaciones reales (`/wedding/<id>`) heredan ese `noindex`. Las demos (`template-01-demo`, `template-02-demo`, `valentina-mateo-2026`) también, y `DesignGallery.tsx` las enlaza como `/es/wedding/...`, lo que agrega una redirección 307 a cada clic.

**Datos estructurados (`components/StructuredData.tsx`)**

- `sameAs` apunta a `facebook.com/invyta`, `instagram.com/invyta` y `twitter.com/invyta`, perfiles no verificados; el Instagram real es `https://www.instagram.com/invyta.me`.
- `WebSite.potentialAction` (`SearchAction`) apunta a `/search`, que no existe.
- `foundingDate: 2024` y "plataforma líder" no están verificados (`docs/BRAND-FOUNDATIONS.md`: "solo se afirma lo que el producto hace hoy").
- `FAQPage` trae cuatro preguntas que no aparecen en el FAQ visible (`components/landing/FAQ.tsx` tiene 10 distintas). Google exige que el marcado coincida con el contenido visible.
- `BreadcrumbList` usa URLs con `#fragmento`.

**Contenido y rendimiento de la landing**

- Una sola URL. El único `<h1>` es "Elige el estilo. Nosotros armamos tu invitación." y no contiene el término de búsqueda.
- Las imágenes son `<img>` con PNG/JPG sin `next/image` (`Hero.tsx`, `DesignGallery.tsx`, `AdminProof.tsx`).
- Las fuentes Fraunces y Manrope entran con `@import url('https://fonts.googleapis.com/...')` en `app/globals.css` (línea 4), que bloquea el render.
- `app/layout.tsx` es un Client Component (`'use client'`, con `DataInitializer`): no puede exportar `metadata`, `viewport` ni `verification`.
- Los datos de diseños, paquetes y FAQ viven dentro de `DesignGallery.tsx`, `Packages.tsx` y `FAQ.tsx`; las páginas nuevas y el marcado necesitan la misma fuente.
- No hay ninguna herramienta de medición ni verificación real de Search Console. `public/google-site-verification.html` es un archivo genérico que no verifica nada (y da 404).

**Lo que no cambia:** las invitaciones públicas (`/wedding/<id>` y `/en/wedding/<id>`, incluida la versión en inglés para invitados), los paneles de admin, el login, las rutas `/api/*` y el editor. Solo se les agrega refuerzo de `noindex`.

**Fuentes de contenido (fuente única de verdad):** voz, precios y contacto salen de `docs/BRAND-FOUNDATIONS.md`; el detalle de paquetes, de `components/landing/Packages.tsx`; WhatsApp, de `lib/contact.ts`. Ningún texto nuevo afirma testimonios, cifras de clientes ni "líder".

## Alcance

**Incluye:**

- Host canónico `https://www.invyta.me` en canonical, `og:url`, sitemap, robots y datos estructurados, con una constante única en `lib/site.ts`.
- `app/layout.tsx` como Server Component (con `metadataBase`, etiquetas de verificación de Google y Bing por variable de entorno y `viewport`), y fuentes con `next/font` en lugar de `@import`.
- Ajuste de `middleware.ts` para que los archivos con extensión, los íconos y las páginas de marketing no pasen por la reescritura de idioma; validación del idioma en `app/[locale]/layout.tsx` y `app/not-found.tsx`.
- Imagen para compartir 1200x630, favicon, ícono Apple e íconos 192/512 generados en código con `next/og` (paleta de marca), y corrección de `public/site.webmanifest`.
- Metadatos de la landing (title, description, canonical, Open Graph, Twitter Card) sin `keywords` y sin `hreflang`.
- `app/robots.ts` y `app/sitemap.ts` dinámicos que reemplazan a `public/robots.txt` y al sitemap actual; solo URLs canónicas, indexables y con respuesta 200.
- Refuerzo `X-Robots-Tag: noindex, nofollow` en `next.config.js` para invitaciones, demos, admin, login, `invitation`, `typography-test`, `demo` y `/api/*`.
- Datos estructurados reescritos con solo hechos verificados: `Organization`, `WebSite`, `BreadcrumbList` por página, `Service` con `Offer` en `/paquetes` y `FAQPage` en `/preguntas-frecuentes`.
- `lib/marketing-content.ts` como fuente única de diseños, paquetes y FAQ, usada por la landing y por las páginas nuevas.
- Reescritura on-page de la landing: `<h1>` con el término principal, jerarquía de encabezados, texto alternativo descriptivo, `next/image` con dimensiones y `priority` en la imagen principal, navegación y pie con enlaces reales a las páginas nuevas y al Instagram.
- Seis páginas indexables nuevas: `/disenos/clasico`, `/disenos/moderno`, `/disenos/botanica-editorial`, `/paquetes`, `/wedding-planners` y `/preguntas-frecuentes`, cada una con título, descripción, `<h1>`, canonical, migas de pan, enlaces internos y contenido propio.
- Redirección `/disenos` → `/#disenos` y de `/favicon.ico` → `/icon`.
- Medición de rendimiento con Lighthouse móvil y corrección de hallazgos de LCP y CLS en las siete URLs.
- Pasos manuales de lanzamiento (fuera del código): redirección permanente del apex en Vercel, variables de entorno, Search Console, Bing Webmaster, envío del sitemap, solicitud de indexación por URL y enlaces desde Instagram, WhatsApp Business y Bodas.com.mx.

**No incluye (queda para otra iteración):**

- Versión de la landing en inglés y `hreflang` (mercado: solo español México). Las invitaciones en inglés para invitados (`/en/wedding/<id>`) se mantienen tal cual.
- Blog o guías de contenido (cuándo enviar la invitación, cómo pedir confirmaciones, etc.): es un trabajo de redacción propio y va en su spec.
- Google Analytics 4, Vercel Analytics u otra analítica en el sitio (implica aviso de privacidad y consentimiento). Se mide solo con Search Console y Bing Webmaster.
- Perfil de Google Business Profile, compra de enlaces, directorios masivos y cualquier táctica de enlaces artificiales.
- Indexar las demos o las invitaciones reales (siguen `noindex`).
- Logo oficial vectorizado como archivo (el wordmark de los íconos y de la imagen para compartir se reconstruye en código; ver Riesgos).
- Perfil de TikTok en `sameAs` (la cuenta aún no existe; se agrega cuando exista).
- `llms.txt` y cualquier optimización específica para buscadores con IA.
- Cambios de diseño de la landing más allá del `<h1>`, los textos y las imágenes.
- Reglas de Firestore y seguridad de la IA (spec 09, reservado).

## Modelo de datos

Esta feature no introduce datos en Firestore. Agrega tres módulos de constantes y contenido en el repositorio.

```ts
// lib/site.ts — fuente única del host y de los datos de marca
export const SITE = {
  url: 'https://www.invyta.me',          // host canónico, sin barra final
  name: 'Invyta',
  locale: 'es_MX',
  email: 'hola@invyta.me',
  phone: '+52 960 246 0590',              // el enlace wa.me sigue en lib/contact.ts
  themeColor: '#C6663C',
  social: { instagram: 'https://www.instagram.com/invyta.me' }, // TikTok: pendiente
} as const;

export const absoluteUrl = (path: string) => `${SITE.url}${path === '/' ? '' : path}`;

// Rutas que NO pasan por el middleware de idioma (páginas de marketing y archivos generados)
export const NON_LOCALIZED_PATHS = [
  '/', '/paquetes', '/wedding-planners', '/preguntas-frecuentes', '/disenos',
  '/icon', '/apple-icon', '/opengraph-image', '/icons',
] as const;

// Páginas indexables: de aquí salen el sitemap y los enlaces internos
export interface MarketingPage { path: string; title: string; lastModified: string /* YYYY-MM-DD */ }
export const MARKETING_PAGES: MarketingPage[] = [/* una entrada por página, se agrega en cada paso */];
```

```ts
// lib/marketing-content.ts — fuente única de contenido, usada por la landing y por las páginas nuevas
export interface DesignContent {
  slug: 'clasico' | 'moderno' | 'botanica-editorial';
  templateId: 'template-01' | 'template-02' | 'template-03';
  name: string; tagline: string; description: string;
  demoHref: string;   // sin prefijo de idioma: '/wedding/template-01-demo' (evita la redirección 307)
  image: string;      // '/assets/landing/design-template-01.jpg', etc.
}
export interface PackageContent {
  id: 'basico' | 'personalizado'; name: string;
  price: 2200 | 2600; currency: 'MXN';   // fuente única del precio: landing, /paquetes y schema
  forWho: string; groups: { title: string; text: string }[]; notIncluded?: string;
}
export interface FaqItem { question: string; answer: string; group: string; onLanding: boolean }
```

Variables de entorno (solo servidor, sin prefijo `NEXT_PUBLIC_`; si faltan, la etiqueta no se emite):

```
GOOGLE_SITE_VERIFICATION=   # contenido de la meta google-site-verification (opcional si se usa DNS)
BING_SITE_VERIFICATION=     # contenido de la meta msvalidate.01 (opcional si se importa desde Search Console)
```

Convenciones:

- Todas las URLs absolutas salen de `absoluteUrl()`; ninguna cadena `https://invyta.me` queda en el código.
- Títulos ≤ 60 caracteres, descripciones ≤ 155, un solo `<h1>` por página.
- `lastModified` del sitemap es una fecha fija por página (la del último cambio real de contenido), nunca `new Date()`.
- Sin ningún dato personal de parejas en las páginas de marketing (regla heredada del kit de marca: la captura `invitados-imagen.png` no se usa).

Mapa de páginas y término principal (hipótesis: sin datos de volumen; se ajusta con Search Console):

| URL | Título propuesto (≤ 60) | Término principal |
| --- | --- | --- |
| `/` | Invitaciones digitales para boda \| Invyta (41) | invitaciones digitales para boda |
| `/paquetes` | Precios de invitaciones digitales para boda \| Invyta (52) | precio de invitaciones digitales para boda |
| `/disenos/clasico` | Invitación digital de boda clásica \| Invyta (45) | invitación digital de boda clásica |
| `/disenos/moderno` | Invitación digital de boda moderna \| Invyta (44) | invitación digital de boda moderna |
| `/disenos/botanica-editorial` | Invitación digital de boda botánica editorial \| Invyta (56) | invitación de boda botánica digital |
| `/wedding-planners` | Invitaciones digitales para wedding planners \| Invyta (53) | invitaciones digitales para wedding planners |
| `/preguntas-frecuentes` | Preguntas frecuentes de invitaciones digitales \| Invyta (55) | cómo funcionan las invitaciones digitales de boda |

Descripción de la landing (142 caracteres): "Invitaciones digitales para boda con enlace único por invitado, confirmación en tiempo real y entrega en 7 días hábiles. Desde $2,200 MXN." Las demás descripciones se redactan en la implementación con el mismo límite.

## Plan de implementación

1. **Constantes de sitio.** Crear `lib/site.ts` con `SITE`, `absoluteUrl`, `NON_LOCALIZED_PATHS` y `MARKETING_PAGES` (con solo `/`). Sin efecto visible. Verificar que `npm run build` compila.
2. **Middleware, idioma válido y 404 real.** En `middleware.ts`, cambiar el `matcher` para excluir cualquier ruta con extensión de archivo y hacer que las rutas de `NON_LOCALIZED_PATHS` salten el middleware de idioma. En `app/[locale]/layout.tsx`, llamar a `notFound()` si el idioma no es `es` o `en`. Crear `app/not-found.tsx` (404 real, `noindex`, con enlaces a la landing y a WhatsApp; diseño: artboard `/not-found (404)`). Prueba manual con `npm run dev`: `/wedding/template-01-demo`, `/en/wedding/template-01-demo`, `/es/admin`, `/es/login` y `/api/wedding-images/friends-test` siguen abriendo; `/archivo-inexistente.txt` y `/ruta-inexistente` dan 404.
3. **Layout raíz de servidor y fuentes.** Mover `DataInitializer` de `app/layout.tsx` a `src/components/providers/DataInitializer.tsx` (con `'use client'`) y dejar `app/layout.tsx` como Server Component con `metadataBase: new URL(SITE.url)`, `verification` (Google y Bing desde las variables de entorno) y `viewport`. Quitar el `@import` de `app/globals.css` (línea 4), cargar Fraunces y Manrope con `next/font/google` (variables `--font-fraunces` y `--font-manrope`) y actualizar `fraunces` y `manrope` en `components/landing/ui.tsx` y la regla de la línea 731 de `app/globals.css`. Antes de reemplazar, hacer `grep -rn "Fraunces\|Manrope"` en todo el repositorio para no dejar referencias sueltas. Prueba manual: landing, editor y gestión de invitados se ven igual que antes.
4. **Íconos y vista previa en código.** Crear `lib/og-brand.tsx` (fondo marfil `#FBF7F1`, terracota `#C6663C`, tinta `#211D19`, wordmark "invyta" en Fraunces SemiBold cargada desde un archivo local en `app/_fonts/`), `app/icon.tsx` (32x32), `app/apple-icon.tsx` (180x180), `app/opengraph-image.tsx` (1200x630 con el nombre, el tagline "Tu boda, en una invitación que se siente tuya." y "Invitaciones digitales para boda") y `app/icons/[size]/route.tsx` (192 y 512, PNG). Corregir `public/site.webmanifest` (íconos `/icons/192` y `/icons/512`, sin capturas inexistentes, `theme_color` `#C6663C`) y eliminar `public/google-site-verification.html`. Agregar en `next.config.js` la redirección permanente `/favicon.ico` → `/icon`. Prueba manual: abrir `/icon`, `/apple-icon`, `/opengraph-image`, `/icons/192`, `/icons/512` y `/site.webmanifest`.
5. **Metadatos de la landing.** Reescribir `metadata` en `app/page.tsx`: título y descripción del mapa de páginas, `alternates.canonical: '/'`, Open Graph y Twitter Card con la imagen de `opengraph-image`, sin `keywords`, sin `alternates.languages`, sin `creator`/`site` de Twitter y sin la lista de íconos que apunta a archivos inexistentes (los íconos salen de las convenciones del paso 4). Prueba manual: `curl -s http://localhost:3000 | grep -E "canonical|og:|twitter:"` muestra solo `www.invyta.me`.
6. **Robots, sitemap y `X-Robots-Tag`.** Crear `app/robots.ts` (permite `/`; bloquea `/api/`, `/admin/`, `/*/admin/`, `/login`, `/*/login`, `/*?guest=`, `/demo/`, `/typography-test/`; sin `Crawl-delay`; `sitemap` con `absoluteUrl('/sitemap.xml')`; no bloquea `/wedding/` ni `/*/wedding/`) y reescribir `app/sitemap.ts` para derivarlo de `MARKETING_PAGES` con `lastModified` fijo. Eliminar `public/robots.txt`. En `next.config.js` agregar `X-Robots-Tag: noindex, nofollow` para `/:locale/wedding/:path*`, `/wedding/:path*`, `/:locale/admin/:path*`, `/admin/:path*`, `/:locale/login`, `/login`, `/:locale/invitation`, `/:locale/demo`, `/:locale/typography-test` y `/api/:path*`, conservando los encabezados de seguridad actuales. Prueba manual: `curl -I` a una demo muestra el encabezado.
7. **Contenido compartido.** Crear `lib/marketing-content.ts` con los tres diseños, los dos paquetes y las 10 preguntas actuales del FAQ (`onLanding: true`), copiados sin cambiar texto ni precios. Hacer que `DesignGallery.tsx`, `Packages.tsx` y `FAQ.tsx` los importen; los `demoHref` pasan a `/wedding/<id>` sin prefijo. Refactor sin cambio visual; verificar que la landing se ve y funciona igual.
8. **Datos estructurados.** Crear `lib/seo-schema.ts` (constructores de `Organization`, `WebSite`, `BreadcrumbList`, `Service` con `Offer` y `FaqPage`) y `components/seo/JsonLd.tsx` (Server Component que serializa y escapa `<`). Reescribir `components/StructuredData.tsx` para la landing con solo `Organization` (nombre, URL, logo `absoluteUrl('/icons/512')`, `contactPoint` con correo y teléfono, `areaServed: 'MX'`, `sameAs` solo con Instagram) y `WebSite` (sin `SearchAction`). Quitar `foundingDate`, "líder", `Service` genérico y el `FAQPage` desalineado. Prueba manual: pegar el HTML en el Rich Results Test o en validator.schema.org sin errores.
9. **Landing on-page.** En `components/landing/Hero.tsx`, `<h1>` con el término principal ("Invitaciones digitales para boda" seguido de la promesa actual como segunda línea, sin cambiar el diseño); revisar la jerarquía `h1` → `h2` de todas las secciones; reemplazar los `<img>` de `Hero.tsx`, `DesignGallery.tsx` y `AdminProof.tsx` por `next/image` con `width`, `height`, `sizes` y `alt` descriptivo, con `priority` solo en la imagen principal; en `Nav.tsx` y `Footer.tsx`, enlaces a `/paquetes`, `/wedding-planners` y `/preguntas-frecuentes` (navegación del diseño: Cómo funciona, Diseños, Paquetes, Wedding planners y Preguntas frecuentes; "Funcionalidades" sigue como sección de la landing), y en el pie las columnas Producto, Diseños y Contacto con el Instagram y el correo. Los enlaces a secciones pasan a `/#id` para funcionar también desde las páginas nuevas. Prueba manual: `curl -s http://localhost:3000 | grep -c "<h1"` da 1 y los anclajes siguen funcionando.
10. **Estructura de páginas de marketing y `/paquetes`.** Crear `components/marketing/PageShell.tsx` (Nav y Footer de la landing, migas de pan, contenedor de contenido y bloque final con CTA a WhatsApp) y `app/paquetes/page.tsx` (Server Component): comparativa de los dos paquetes desde `PackageContent`, qué incluye y qué no incluye cada uno, tiempos de entrega, hosting hasta 15 días después del evento, JSON-LD `Service` con dos `Offer` (2200 y 2600 MXN) y `BreadcrumbList`. Agregarla a `MARKETING_PAGES`. Diseño: artboards `/paquetes` (escritorio y móvil), con tarjetas de paquete, tabla comparativa, "Qué necesitamos de ti" y tres preguntas de precio. Prueba manual: abre en `/paquetes`, aparece en `/sitemap.xml`.
11. **Páginas de diseño.** Crear `app/disenos/[slug]/page.tsx` con `generateStaticParams` para los tres slugs de `DesignContent`: descripción del estilo, para qué tipo de boda encaja, qué contiene (secciones reales del producto), imagen de `public/assets/landing/design-template-0X.jpg`, enlace a la demo (`/wedding/<id>`) y CTA. Cada una con su `generateMetadata` y `BreadcrumbList`. Diseño: artboards `/disenos/clasico` (escritorio y móvil), `/disenos/moderno` y `/disenos/botanica-editorial`; la primera tarjeta de "Qué incluye" es propia de cada diseño (su elemento distintivo), y el texto "¿Para qué tipo de boda es?" es único por página para no duplicar contenido. Agregar la redirección `/disenos` → `/#disenos` en `next.config.js` y las tres URLs a `MARKETING_PAGES`.
12. **`/wedding-planners`.** Crear `app/wedding-planners/page.tsx` con el mensaje aparte de `docs/BRAND-FOUNDATIONS.md` (una invitación por cliente, panel de invitados, tiempos claros, atención por WhatsApp), sin inventar cifras ni casos. Diseño: artboard `/wedding-planners` (cuatro razones, cuatro pasos y los dos paquetes con enlace a `/paquetes`). Agregarla a `MARKETING_PAGES`.
13. **`/preguntas-frecuentes`.** Crear `app/preguntas-frecuentes/page.tsx` con las 10 preguntas actuales más al menos 8 nuevas agregadas a `lib/marketing-content.ts` con `onLanding: false` (por ejemplo: cuándo enviar la invitación, qué información necesito para empezar, cómo confirman mis invitados, qué pasa después del evento), agrupadas por tema, con respuestas verificadas contra `docs/BRAND-FOUNDATIONS.md` y `Packages.tsx`. JSON-LD `FAQPage` generado desde la misma lista visible. Diseño: artboards `/preguntas-frecuentes` (escritorio con índice de temas y móvil con chips de temas). Agregarla a `MARKETING_PAGES`.
14. **Enlaces internos y sitemap final.** Verificar que cada página nueva enlaza a al menos tres de las otras y que la landing enlaza a las seis; completar `MARKETING_PAGES` (siete entradas) y confirmar que `/sitemap.xml` lista exactamente esas siete URLs, todas con 200 y sin redirección.
15. **Medir y corregir rendimiento.** Con Lighthouse móvil (por ejemplo, con la herramienta de Chrome DevTools) en las siete URLs de un `next build && next start`, registrar SEO, accesibilidad, mejores prácticas, rendimiento, LCP y CLS. Corregir los hallazgos que impidan cumplir los criterios de aceptación (tamaño de imágenes, `priority`, `sizes`, cambios de diseño por fuentes o por animaciones `LReveal` que oculten contenido de la carga inicial). Ejecutar `npm run build` sin nuevos errores de tipos ni de lint.
16. **Despliegue y configuración manual en Vercel.** Desplegar. En Vercel → Domains, cambiar la redirección de `invyta.me` a `www.invyta.me` de 307 a **308 (permanente)**. Si se usará verificación por etiqueta, agregar `GOOGLE_SITE_VERIFICATION` y `BING_SITE_VERIFICATION` en Vercel → Environment Variables y **redesplegar** (las variables nuevas solo llegan a despliegues nuevos). Verificar en producción con `curl -I` la redirección, `robots.txt`, `sitemap.xml`, `X-Robots-Tag` de una invitación real y de una demo, y los íconos.
17. **Search Console y Bing (manual).** Crear la propiedad de dominio `invyta.me` en Google Search Console (verificación por registro TXT en el DNS; si no es posible, propiedad de prefijo de URL `https://www.invyta.me/` con la etiqueta). Enviar `https://www.invyta.me/sitemap.xml`. Con "Inspección de URL" → "Solicitar indexación" en cada una de las siete URLs. Importar el sitio en Bing Webmaster Tools desde Search Console y enviar el sitemap allí también.
18. **Enlaces externos (manual).** Poner `https://www.invyta.me` como enlace en la biografía de Instagram (`@invyta.me`), en WhatsApp Business (sitio web) y en el perfil de Bodas.com.mx, y agregar el enlace de TikTok en la biografía cuando la cuenta exista. Luego agregar TikTok a `SITE.social` y a `sameAs` en un cambio aparte.
19. **Seguimiento a los 14 y 28 días (manual).** En Search Console → Indexación de páginas, registrar cuántas de las siete URLs figuran como "Indexada" y las consultas con impresiones; ajustar títulos y descripciones según las consultas reales (el mapa de páginas es una hipótesis) y anotar los cambios en este spec.

## Criterios de aceptación

**Código (verificable con `npm run build && npm run start` y `curl`):**

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.
- [ ] Las siete URLs (`/`, `/paquetes`, `/disenos/clasico`, `/disenos/moderno`, `/disenos/botanica-editorial`, `/wedding-planners`, `/preguntas-frecuentes`) responden 200 sin redirección.
- [ ] Cada una de las siete URLs tiene exactamente un `<h1>`, un `<title>` único de 60 caracteres o menos, una `meta description` única de 155 caracteres o menos y un `<link rel="canonical">` con su propia URL en `https://www.invyta.me`.
- [ ] El `<h1>` de la landing contiene "invitaciones digitales para boda".
- [ ] Ninguna respuesta HTML de las siete URLs ni de `/sitemap.xml` ni de `/robots.txt` contiene `https://invyta.me` sin www.
- [ ] El HTML de las siete URLs no contiene `hreflang`, `keywords` ni las cadenas `facebook.com/invyta`, `twitter.com/invyta`, `SearchAction`, `foundingDate` ni "líder".
- [ ] `/sitemap.xml` lista exactamente esas siete URLs, ninguna con `#`, ninguna con `/es` ni `/en`, con `lastModified` fijo y no la fecha del build.
- [ ] `/robots.txt` no contiene `Crawl-delay`, referencia `Sitemap: https://www.invyta.me/sitemap.xml`, bloquea `/api/`, `/admin/` y `/*?guest=`, y no bloquea `/wedding/`.
- [ ] Una invitación real, una demo y su versión `/en/wedding/<id>` devuelven el encabezado `X-Robots-Tag: noindex, nofollow`, siguen abriendo igual que antes y `/en/wedding/<id>` sigue mostrando la invitación en inglés.
- [ ] `/es/admin/wedding-editor/<id>`, `/es/login` y `/api/wedding-images/<id>` devuelven `X-Robots-Tag: noindex, nofollow`, y el login, el editor, la gestión de invitados y las rutas `/api/*` funcionan como antes.
- [ ] `/opengraph-image` responde 200 `image/png` de 1200x630; `/icon`, `/apple-icon`, `/icons/192` y `/icons/512` responden 200 `image/png`; `/favicon.ico` redirige a `/icon`.
- [ ] `/site.webmanifest` responde 200 con JSON válido, `theme_color` `#C6663C` y todos sus íconos responden 200.
- [ ] Una URL inexistente y un archivo inexistente (`/ruta-inexistente`, `/archivo-inexistente.txt`) responden 404 (no 200 con HTML).
- [ ] `public/robots.txt` y `public/google-site-verification.html` ya no existen en el repositorio.
- [ ] Todos los bloques JSON-LD son válidos en el Rich Results Test o en validator.schema.org sin errores; `sameAs` contiene únicamente `https://www.instagram.com/invyta.me`.
- [ ] El `FAQPage` de `/preguntas-frecuentes` tiene exactamente las mismas preguntas que las visibles en esa página, y la landing no emite `FAQPage`.
- [ ] Los precios de `/paquetes`, del marcado `Offer` y de la sección Paquetes de la landing salen de la misma constante y son 2200 y 2600 MXN.
- [ ] Cada página nueva tiene al menos 350 palabras de texto visible en `<main>` y enlaza a al menos tres de las otras seis páginas.
- [ ] La landing no contiene `<img>` sin `width`, `height` y `alt`, y la imagen principal usa `priority`.
- [ ] El sitio no hace solicitudes a `fonts.googleapis.com` ni a `fonts.gstatic.com` en tiempo de ejecución.
- [ ] La landing, el editor y la gestión de invitados se ven con las mismas tipografías que antes del cambio de fuentes.
- [ ] Lighthouse móvil, en las siete URLs: SEO 100, accesibilidad de 90 o más, mejores prácticas de 90 o más, rendimiento de 85 o más, LCP de 2.5 s o menos y CLS de 0.1 o menos. Si una página no lo cumple, el spec registra la causa y la corrección pendiente.

**Lanzamiento (verificable en producción y en las consolas):**

- [ ] `curl -I https://invyta.me` responde 308 a `https://www.invyta.me/`.
- [ ] La propiedad de Search Console está verificada y el sitemap figura como "Correcto" con siete páginas descubiertas.
- [ ] Las siete URLs tienen solicitud de indexación enviada en la Inspección de URL.
- [ ] El sitio está importado en Bing Webmaster Tools con el sitemap enviado.
- [ ] `https://www.invyta.me` es el enlace de la biografía de Instagram `@invyta.me`, del perfil de WhatsApp Business y del perfil de Bodas.com.mx.
- [ ] Seguimiento (no bloquea el cierre del spec): a los 14 y 28 días queda anotado en este spec el número de URLs indexadas y las cinco consultas con más impresiones.

## Decisiones tomadas y descartadas

- **Sí: `https://www.invyta.me` como host canónico.** Decisión explícita del usuario; es lo que Vercel ya sirve. El canonical actual apuntaba a una URL que redirige. **No:** el apex sin www, que exigiría invertir la redirección en Vercel.
- **Sí: apex con redirección 308.** Un 307 es temporal y Google consolida las señales más lento con redirecciones temporales.
- **Sí: solo español México en la landing; el `/en/wedding/<id>` se mantiene.** Decisión explícita del usuario. **No:** landing en inglés ni `hreflang`, que hoy apuntaban a `/es` y `/en` (una redirección y una demo antigua).
- **Sí: "invitaciones digitales para boda" como término principal.** Decisión explícita del usuario; es hipótesis, no dato de volumen. "Invitación web" queda como término secundario en el cuerpo y en la voz de marca. Se valida con Search Console.
- **Sí: seis páginas nuevas (tres diseños, paquetes, wedding planners y preguntas frecuentes).** Decisión explícita del usuario. Una sola URL no puede posicionar para búsquedas distintas (precio, estilo, planners); cada página apunta a una intención.
- **Sí: páginas de marketing fuera de `app/[locale]/`, con exención del middleware.** Bajo `[locale]` se duplicarían en `/en/...` y heredarían el `noindex` del layout.
- **Sí: `/preguntas-frecuentes` con las 10 preguntas actuales más al menos 8 nuevas.** Evita una página que sea copia del FAQ de la landing. La landing conserva sus 10 preguntas.
- **Sí: `FAQPage` solo en `/preguntas-frecuentes`.** Debe coincidir con el contenido visible, y Google ya no muestra resultados enriquecidos de FAQ para sitios de este tipo; el marcado se conserva por coherencia y por otros buscadores. **No:** el `FAQPage` actual de cuatro preguntas que no existen en pantalla.
- **Sí: solo hechos verificados en el marcado y en los textos.** `sameAs` solo con el Instagram real, precios desde `PackageContent`, correo y teléfono del documento de marca. **No:** `foundingDate`, "líder", `SearchAction`, perfiles de Facebook y X inventados, `AggregateRating` ni reseñas (no hay testimonios reales).
- **No: la meta `keywords`.** Google y Bing la ignoran; solo le muestra la estrategia a la competencia.
- **Sí: `X-Robots-Tag` además de la meta `noindex`, y dejar de bloquear `/wedding/` en `robots.txt`.** Google solo lee un `noindex` si puede rastrear la URL; combinar `Disallow` con `noindex` deja URLs indexadas sin descripción si alguien las enlaza. Los enlaces personales (`?guest=`) siguen bloqueados.
- **Sí: demos y demás invitaciones siguen `noindex`.** Tienen nombres ficticios y duplican contenido; las páginas de diseño son su representación indexable.
- **Sí: `app/robots.ts` y `app/sitemap.ts` en lugar de archivos estáticos.** El host sale de una sola constante y el sitemap se deriva de `MARKETING_PAGES`, así no se puede listar una página que no existe. **No:** `new Date()` como `lastModified` (señala una frescura falsa en cada build).
- **Sí: imagen para compartir, favicon e íconos generados en código con `next/og`.** Decisión explícita del usuario. Evita depender de archivos exportados a mano. El wordmark queda reconstruido, no es el archivo oficial (ver Riesgos).
- **Sí: fuentes con `next/font`.** El `@import` de Google Fonts bloquea el render y agrega una conexión externa que perjudica el LCP.
- **Sí: `app/layout.tsx` como Server Component.** Es la única forma de exportar `metadata`, `viewport` y `verification` desde la raíz. `DataInitializer` conserva su comportamiento como componente cliente.
- **Sí: Search Console y Bing sin cookies como única medición.** Decisión explícita del usuario. **No:** GA4 (exige aviso de privacidad y consentimiento) ni Vercel Analytics en este spec.
- **Sí: pasos manuales de lanzamiento en el plan.** Decisión explícita del usuario; para un dominio nuevo, solicitar la indexación y conseguir los primeros enlaces pesa tanto como el código.
- **No: compra de enlaces o directorios masivos.** Riesgo de penalización manual que costaría más de lo que aporta.
- **No: `llms.txt` ni optimización para buscadores con IA.** Sin evidencia de efecto medible; se puede evaluar después.
- **No: blog en este spec.** Es un flujo de redacción continua; va en su propio spec cuando las siete URLs estén indexadas.
- **Implementación: íconos y imagen para compartir en runtime `edge`.** `@vercel/og` en runtime Node falla en Windows (`Invalid URL` al resolver sus propios archivos) y rompía `npm run build` local; en `edge` funciona y es el modo documentado para `next/og`. Las rutas son dinámicas y llevan `Cache-Control` inmutable.
- **Implementación: los `@import` de Google Fonts de las plantillas de invitación se movieron de `app/globals.css` a `app/[locale]/invitation-fonts.css`.** Sin eso, la landing seguía descargando Cormorant, Lora, Jost, Allura y Plus Jakarta que solo usan las invitaciones. Las invitaciones cargan las mismas fuentes que antes.
- **Implementación: la entrada del hero de la landing es una animación CSS (`hero-in-up`, `hero-in-left`) y no `framer-motion`.** Con `framer-motion` el texto salía con `opacity: 0` en el HTML inicial y esperaba la hidratación: LCP de 11.8 s a 2.6 s en móvil con CPU 4x. El efecto visual es el mismo.
- **Implementación: la navegación de escritorio pasa al breakpoint `xl` (1280 px).** Con seis enlaces y el botón no cabe entre 768 y 1279 px; por debajo de `xl` se usa el menú móvil.
- **Implementación: variantes de botón `terracotaDark` y `ivoryDark` para las páginas nuevas.** El texto claro sobre `#C6663C` da 3.66:1 y no cumple AA; `#AE5730` sí. La landing conserva sus botones actuales.
- **Numeración 10 y no 09.** Los specs 07 y 08 reservan el "spec 09" para reglas de Firestore y seguridad de la IA; se deja libre para no romper esas referencias.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| No se logra posicionar "muy rápido": dominio nuevo frente a Bodas.com.mx, Canva y otras plataformas | El spec no promete plazos; se apunta a búsquedas de intención específica (precio, estilo, planners), se solicita la indexación el día del lanzamiento y se mide en Search Console a los 14 y 28 días |
| Los términos del mapa de páginas son hipótesis sin datos de volumen | Paso 19 ajusta títulos y descripciones con las consultas reales de Search Console |
| El cambio de `matcher` del middleware rompe rutas existentes (`/wedding`, `/en/wedding`, `admin`, `login`, `api`) | El paso 2 exige la prueba manual de esas rutas antes de continuar; el criterio de aceptación las repite |
| El cambio de fuentes altera la tipografía de la landing, el editor o los invitados | Paso 3 exige `grep` previo y verificación visual de las tres pantallas |
| Dejar de bloquear `/wedding/` en robots permite rastrear invitaciones reales | El `X-Robots-Tag` y la meta `noindex` las excluyen del índice; las invitaciones no están enlazadas desde páginas públicas y los enlaces `?guest=` siguen bloqueados; se verifica el encabezado con un ID real en producción |
| El wordmark generado con `next/og` no es el logo oficial vectorizado | Aceptado por decisión del usuario; un spec futuro reemplaza los íconos por el archivo oficial exportado del kit de marca |
| Textos nuevos que afirmen algo que el producto no hace | Solo se usan `docs/BRAND-FOUNDATIONS.md`, `Packages.tsx` y `lib/contact.ts` como fuente; el usuario revisa el texto de cada página antes de aprobar |
| Contenido duplicado entre el FAQ de la landing y `/preguntas-frecuentes` | La página añade al menos 8 preguntas nuevas y las agrupa por tema; el `FAQPage` vive solo en la página |
| Google tarda en consolidar el cambio de 307 a 308 y de canonical sin www | Es esperado; el sitemap y el canonical ya coinciden con el host final desde el primer rastreo |
| Las variables de verificación no llegan al despliegue (Vercel solo las aplica a despliegues nuevos) | Paso 16 exige redesplegar; alternativa sin código: verificación por DNS de la propiedad de dominio |
| El enlace de Instagram indicado no coincide con la cuenta real | Verificar a mano que `https://www.instagram.com/invyta.me` abre el perfil antes de dejarlo en `sameAs` |
| Las animaciones de aparición (`LReveal`) ocultan contenido hasta la hidratación y afectan LCP o la lectura del rastreador | Paso 15 mide LCP y CLS; si es necesario, la imagen y el texto principal de la landing salen visibles desde el HTML inicial |

## Lo que **no** está en este spec

- Landing en inglés y `hreflang` (las invitaciones en inglés de `/en/wedding/<id>` no cambian).
- Blog y guías de contenido.
- Google Analytics 4, Vercel Analytics o cualquier analítica con cookies.
- Google Business Profile, compra de enlaces y directorios masivos.
- Indexar demos o invitaciones reales.
- Logo oficial vectorizado en los íconos y en la imagen para compartir.
- Perfil de TikTok en `sameAs` (se agrega cuando la cuenta exista).
- `llms.txt` y optimización para buscadores con IA.
- Rediseño de la landing más allá del `<h1>`, los textos y las imágenes.
- Reglas de Firestore y seguridad de la IA (spec 09).

Cada uno de estos, si se decide hacer, va en su propio spec.
