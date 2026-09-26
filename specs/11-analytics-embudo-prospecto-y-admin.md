# 11 — Analítica con PostHog: embudo del prospecto y uso del admin

**Estado:** Approved
**Depende de:** SPEC 08, SPEC 10
**Fecha:** 2026-09-25

## Objetivo

Medir con PostHog (sin cookies y con grabación de sesiones solo en marketing y demos) si los visitantes de `www.invyta.me` avanzan por el embudo landing → diseños/demos → paquetes → WhatsApp, de qué canal llegan y si los clientes con cuenta avanzan por el flujo del admin (login → editor → invitados → enviar).

## Contexto

Estado real del código, revisado el 2026-09-25 (no asumido):

**Decisión previa que este spec revierte.** El spec 10 dejó la analítica fuera ("GA4, Vercel Analytics u otra analítica implica aviso de privacidad y consentimiento") y midió solo con Search Console. Hoy Search Console solo dice cuántos llegan desde Google; no dice qué hacen después, ni cuántos llegan desde Instagram o WhatsApp, y ese es el problema. Este spec agrega la medición con un aviso de privacidad y sin cookies.

**Todas las ventas salen por WhatsApp.** Hay ocho puntos de salida con el mismo número (`529602460590`):

- `components/landing/Hero.tsx`, `Nav.tsx` (escritorio y móvil), `Packages.tsx` (dos tarjetas), `PlannerCta.tsx` y `AiSection.tsx` usan constantes `wa.me/...` escritas a mano; `Nav.tsx`, `Packages.tsx` y `PlannerCta.tsx` ni siquiera llevan mensaje.
- `app/paquetes/page.tsx`, `app/wedding-planners/page.tsx`, `app/disenos/[slug]/page.tsx`, `components/marketing/blocks.tsx` y `app/not-found.tsx` usan `whatsappUrl()` de `lib/contact.ts`.
- La conversación ocurre en WhatsApp: el sitio no puede saber quién escribió ni de dónde vino. Solo puede medir el clic y etiquetar el mensaje.

**Navegación con recarga completa.** `Nav.tsx`, `DesignGallery.tsx` y el resto de la landing usan `<a href>` y no `next/link`. Cada paso landing → `/paquetes` recarga la página, y con `persistence: 'memory'` PostHog regenera el identificador anónimo y la sesión en cada recarga (verificado en la documentación de posthog-js), lo que partiría el embudo en visitantes distintos. Por eso este spec usa `sessionStorage` (ver Decisiones).

**Demos.** Hay tres demos públicas con datos ficticios: `template-01-demo`, `template-02-demo` y `valentina-mateo-2026` (la de la plantilla `template-03`); viven en `src/data/mockData.ts` y se enlazan desde `lib/marketing-content.ts` como `/wedding/<id>`. Las invitaciones reales (`/wedding/<id>?guest=<guestId>` y `/en/...`) muestran nombres y teléfonos de invitados: **no se miden**.

**Footer de las invitaciones.** `components/WeddingTemplate.tsx` enlaza `invyta` a `https://invyta.me` (sin www y sin origen). Es un canal de retorno natural (un invitado entra al sitio desde una invitación real) y hoy no se puede atribuir.

**Auth y admin (spec 08).** `lib/auth-context.tsx` expone `status`, `user`, `isAdmin` y `weddings`; se monta en `app/[locale]/admin/layout.tsx` y en `app/[locale]/login/layout.tsx`. El operador es quien está en `ADMIN_EMAILS` (`isAdmin`). Las URLs del admin incluyen el ID de la boda (`/es/admin/wedding-editor/karen-y-juan`), que contiene nombres de la pareja.

**Middleware y proxy.** `middleware.ts` reescribe cualquier ruta sin extensión al prefijo de idioma, salvo `api`, `_next` y `assets`. Un proxy `/ingest` para PostHog necesita excluirse ahí o se reescribiría a `/es/ingest`.

**Ya existe:** `lib/site.ts` (`MARKETING_PAGES`, `NON_LOCALIZED_PATHS`), `lib/contact.ts` (`whatsappUrl`), `next.config.js` con `X-Robots-Tag`. No hay ninguna herramienta de analítica instalada ni un aviso de privacidad.

## Alcance

**Incluye:**

- Dependencia `posthog-js` cargada de forma diferida (no en el bundle inicial), sin cookies (`persistence: 'sessionStorage'`), sin autocaptura y con `person_profiles: 'identified_only'`.
- Proxy `/ingest` en `next.config.js` hacia PostHog Cloud (región US) para reducir el bloqueo por bloqueadores de anuncios, y exclusión de `/ingest` en el `matcher` del middleware.
- `lib/analytics/` con: alcance por ruta (marketing, demo, admin o ninguno), lista única de demos, saneamiento de URLs, catálogo tipado de eventos y cliente (`init`, `track`, `identify`, `reset`).
- `components/analytics/AnalyticsProvider.tsx` montado en `app/layout.tsx`: inicia PostHog solo en rutas dentro de alcance, captura `$pageview` en cada cambio de ruta y detiene la captura al salir de alcance.
- Embudo del prospecto: `cta_click` (todo clic a WhatsApp con el número de Invyta), `demo_click`, `demo_opened`, `section_viewed` (secciones con `id` de la landing y de las páginas de marketing) y `site_link_click` desde demos. La profundidad de scroll sale de `$pageleave`.
- Atribución de origen: parámetro `?src=` (y `utm_*`), guardado para la sesión y añadido a los eventos como `src`.
- Etiqueta de origen visible al final del mensaje de WhatsApp: `(ref: <página>-<ubicación>-<src>)`, agregada en el clic; los botones sin mensaje reciben el saludo por defecto.
- Grabación de sesiones solo en marketing y demos, con todos los campos enmascarados.
- Uso del admin: `identify` con el uid de Firebase (sin correo ni ID de boda), eventos `signup_completed`, `login_completed`, `email_verified`, `password_reset_requested`, `editor_saved`, `guest_added`, `guest_link_copied` y `ai_used`, más `$pageview` con la URL saneada (`/admin/<sección>/:weddingId`). Sin grabación en el admin.
- Exclusión del tráfico propio: `?notrack=1` (y `?notrack=0`) y exclusión automática de cuentas del operador (`isAdmin`) en ese dispositivo.
- Enlace del pie de las invitaciones (`WeddingTemplate.tsx`) a `https://www.invyta.me/?src=demo` en demos y `?src=invitacion` en invitaciones reales, sin medir nada dentro de ellas.
- Página `/aviso-de-privacidad` (indexable como `noindex`, fuera del sitemap) y enlace en el pie de la landing y de las páginas de marketing.
- Variables `NEXT_PUBLIC_POSTHOG_KEY` y `NEXT_PUBLIC_POSTHOG_HOST` en `.env.local.example`; sin la clave, la analítica no hace nada.
- Pasos manuales: proyecto de PostHog, variables en Vercel, cuatro visualizaciones y un tablero, enlaces con `?src=` en Instagram, WhatsApp Business y Bodas.com.mx.

**No incluye (queda para otra iteración):**

- **Analítica de invitados para las parejas** (quién abrió su invitación y quién confirmó, visible para los novios): datos por boda en Firestore, pantallas en el admin y reglas de privacidad. Va en su propio spec.
- Medir dentro de invitaciones reales (aperturas, scroll, RSVP de invitados) y medir lo que se hace dentro de las demos más allá de abrir la demo y salir al sitio o a WhatsApp.
- Banner de consentimiento de cookies (no hay cookies).
- Pruebas A/B, banderas de funciones, encuestas y cualquier otra función de PostHog.
- Google Analytics 4 y Vercel Analytics.
- Registrar el ID de boda en los eventos (ver Decisiones).
- Atribuir automáticamente cada chat de WhatsApp a una venta (el registro de ventas sigue siendo manual).
- Alertas o correos automáticos desde PostHog.
- Reglas de Firestore y seguridad de la IA (spec 09, reservado).

## Modelo de datos

Esta feature no introduce datos en Firestore. Agrega módulos de código, variables de entorno y claves de almacenamiento del navegador.

```ts
// lib/analytics/scope.ts — decide si una ruta se mide y cómo
export type TrackingScope = 'marketing' | 'demo' | 'admin' | null;
// 'marketing': rutas de MARKETING_PAGES + '/aviso-de-privacidad' + not-found. Eventos y grabación.
// 'demo':      /wedding/<id> y /en/wedding/<id> SOLO si <id> ∈ DEMO_IDS. Eventos y grabación.
// 'admin':     /[locale]/admin/** y /[locale]/login. Eventos, SIN grabación.
// null:        cualquier otra ruta (incluidas las invitaciones reales): PostHog no se carga o se detiene.
export function resolveScope(pathname: string): TrackingScope;

// lib/analytics/demos.ts — fuente única de las demos medidas
export const DEMO_IDS = ['template-01-demo', 'template-02-demo', 'valentina-mateo-2026'] as const;
```

```ts
// lib/analytics/events.ts — catálogo de eventos (nombres en snake_case, propiedades sin datos personales)
export type AnalyticsEvent =
  // Prospecto
  | { name: 'cta_click'; props: { location: string; page: string; package?: 'basico' | 'personalizado' } }
  | { name: 'demo_click'; props: { demo_id: string; location: string } }
  | { name: 'demo_opened'; props: { demo_id: string } }
  | { name: 'section_viewed'; props: { section: string; page: string } }
  | { name: 'site_link_click'; props: { from: 'demo' | 'invitacion'; page: string } }
  // Admin (solo con sesión iniciada; identificado por uid)
  | { name: 'signup_completed' | 'login_completed' | 'email_verified' | 'password_reset_requested'; props: Record<string, never> }
  | { name: 'editor_saved' | 'guest_added' | 'guest_link_copied'; props: Record<string, never> }
  | { name: 'ai_used'; props: { feature: 'dresscode' | 'suggest' | 'place_description' } };
// Propiedades globales en todos los eventos (super properties): src ('ig-bio', 'directo', ...).
// PostHog agrega por sí mismo $current_url, $pathname, $referrer, $referring_domain y utm_*.
```

Configuración de `posthog.init` (valores fijos):

```ts
{
  api_host: '/ingest', ui_host: 'https://us.posthog.com',
  persistence: 'sessionStorage',      // sin cookies; el identificador muere al cerrar la pestaña
  autocapture: false,
  capture_pageview: false,            // el Provider captura $pageview en cada cambio de ruta
  capture_pageleave: true,            // trae la profundidad de scroll del $pageview anterior
  person_profiles: 'identified_only',
  disable_session_recording: true,    // el Provider la activa solo en 'marketing' y 'demo'
  session_recording: { maskAllInputs: true },
  before_send: sanitizeEvent,         // reemplaza el ID de boda en las URLs del admin
}
```

Convenciones:

- **Origen (`src`):** `?src=<canal>-<posición>`. Valores válidos: `ig-bio`, `ig-story`, `ig-post`, `ig-reel`, `tt-bio`, `wa-status`, `wa-catalogo`, `bodas`, `planner`, `demo`, `invitacion`. Sin `src`, se usa el sitio de referencia (`instagram`, `facebook`, `google`, `bing`, `bodas`) o `directo`. Se guarda en `sessionStorage['invyta:src']` la primera vez que aparece en la sesión.
- **Etiqueta en WhatsApp:** `(ref: <page>-<location>-<src>)`, por ejemplo `(ref: paquetes-basico-ig-bio)`. `page` es el primer segmento de la ruta (`home`, `paquetes`, `disenos-clasico`, `planners`, `faq`, `demo`), `location` sale del contenedor más cercano (`data-track-location`, `section[id]`, `nav`, `footer`, `page`) y `package` (`data-track-package`) reemplaza a `location` en las tarjetas de paquete.
- **Mensaje por defecto** (`lib/contact.ts`, `DEFAULT_WHATSAPP_MESSAGE`): "Hola! Me interesa conocer más sobre las invitaciones digitales de Invyta."
- **Saneamiento:** `/(es|en)?/admin/(wedding-editor|guests|confirmations)/<id>` → `/admin/<sección>/:weddingId` en `$current_url`, `$pathname`, `$referrer` y `$prev_pageview_pathname`.
- **Almacenamiento del navegador:** `sessionStorage` con las claves de PostHog (`ph_*`) y `invyta:src`; `localStorage['invyta:notrack'] = '1'` como interruptor del tráfico propio. Ninguna cookie.
- **Variables:** `NEXT_PUBLIC_POSTHOG_KEY` (clave pública del proyecto; sin ella todo es no-op) y `NEXT_PUBLIC_POSTHOG_HOST=/ingest`.

## Plan de implementación

1. **Dependencia y variables.** `npm install posthog-js` y agregar `NEXT_PUBLIC_POSTHOG_KEY=` y `NEXT_PUBLIC_POSTHOG_HOST=/ingest` (con comentario) a `.env.local.example`. Sin efecto visible. Verificar que `npm run build` compila.
2. **Proxy `/ingest`.** En `next.config.js`: `skipTrailingSlashRedirect: true` y `rewrites()` con `/ingest/static/:path*` y `/ingest/array/:path*` → `https://us-assets.i.posthog.com/...` y `/ingest/:path*` → `https://us.i.posthog.com/:path*`. En `middleware.ts`, agregar `ingest` a la exclusión del `matcher`. Prueba manual con `npm run dev`: `curl -I http://localhost:3000/ingest/static/array.js` responde 200 (no 404) y `/paquetes`, `/wedding/template-01-demo` y `/es/admin` siguen abriendo.
3. **Alcance y demos.** Crear `lib/analytics/demos.ts` y `lib/analytics/scope.ts` (`resolveScope`, `sanitizePath`). Sin efecto visible. Prueba manual con `node`/consola: `resolveScope('/paquetes')` = `marketing`; `resolveScope('/en/wedding/template-02-demo')` = `demo`; `resolveScope('/wedding/karen-y-juan')` = `null`; `resolveScope('/es/admin/guests/karen-y-juan')` = `admin`.
4. **Cliente y catálogo.** Crear `lib/analytics/events.ts` y `lib/analytics/client.ts` con `initAnalytics()` (importa `posthog-js` de forma dinámica en `requestIdleCallback`, sale sin hacer nada si falta la clave o si `invyta:notrack` está activo), `track()` tipado, `identifyUser(uid)`, `resetAnalytics()` y `setRecording(on)`. Sin efecto visible.
5. **Proveedor y pageviews.** Crear `components/analytics/AnalyticsProvider.tsx` (`'use client'`) y montarlo en `app/layout.tsx` dentro de `<body>`. Lee `usePathname()`, aplica `resolveScope`, inicia PostHog en `marketing`/`demo`/`admin`, captura `$pageview` por cambio de ruta, activa la grabación solo en `marketing` y `demo`, y en `null` detiene captura y grabación. Procesa `?notrack=1|0` y `?src=` en la primera carga. Prueba manual (con una clave de prueba en `.env.local`): en `/` aparece `$pageview` en la pestaña Network hacia `/ingest/`; en `/wedding/karen-y-juan` no hay ninguna solicitud a `/ingest/`.
6. **Clics de WhatsApp y demos.** En `lib/analytics/click-tracking.ts`, un único listener delegado (`click` y `auxclick`, fase de captura) que: (a) si el `href` empieza con `https://wa.me/529602460590`, calcula `page` y `location`, emite `cta_click` y reescribe el `href` agregando la etiqueta `(ref: ...)` al parámetro `text` (con `DEFAULT_WHATSAPP_MESSAGE` si no hay mensaje; sin duplicar la etiqueta); (b) si apunta a una demo de `DEMO_IDS`, emite `demo_click`. Agregar `DEFAULT_WHATSAPP_MESSAGE` en `lib/contact.ts` y `data-track-package="basico|personalizado"` en las dos tarjetas de `components/landing/Packages.tsx` y de `app/paquetes/page.tsx`. Ningún otro botón cambia. Prueba manual: clic en cada botón de WhatsApp de `/` y `/paquetes` abre un chat cuyo mensaje termina en `(ref: ...)`; un enlace `wa.me` de otro número no se toca.
7. **Secciones vistas y demo abierta.** En el Provider, un `IntersectionObserver` (umbral 0.4, una vez por sección y página) sobre `main section[id]` en `marketing` que emite `section_viewed`, y `demo_opened` con `demo_id` al entrar a una ruta de demo. Prueba manual: bajar por la landing genera un `section_viewed` por cada sección con `id`; abrir `/wedding/template-01-demo` genera un `demo_opened`.
8. **Pie de las invitaciones.** En `components/WeddingTemplate.tsx`, cambiar el enlace `invyta` a `https://www.invyta.me/?src=demo` si el ID está en `DEMO_IDS` y a `?src=invitacion` en cualquier otro caso. Sin ningún evento dentro de las invitaciones reales. Prueba manual: abrir una demo y una invitación real y revisar el `href` del pie; en el sitio, `site_link_click` se emite desde la demo con `src` correcto.
9. **Admin: identidad y exclusión.** Crear `components/analytics/AdminAnalytics.tsx` y montarlo en `app/[locale]/admin/layout.tsx` y `app/[locale]/login/layout.tsx` dentro de `AuthProvider`: con `status` `ready` o `noWeddings` y `isAdmin` en `false`, `identifyUser(user.uid)`; con `isAdmin` en `true`, fija `invyta:notrack` en ese dispositivo y no identifica; al pasar a `signedOut`, `resetAnalytics()`; al pasar de `unverified` a `ready`/`noWeddings`, emite `email_verified`. Prueba manual: iniciar sesión con una cuenta de pareja identifica por uid; con una cuenta de `ADMIN_EMAILS` no se envía nada.
10. **Admin: eventos de acción.** Emitir `signup_completed`, `login_completed` y `password_reset_requested` en el `submit` de `app/[locale]/login/page.tsx` tras cada operación exitosa; `editor_saved` tras `saveWeddingDoc` en `handleSave` del editor; `guest_added` en `handleSubmit` de `app/[locale]/admin/guests/[weddingId]/page.tsx` solo al crear (no al editar); `guest_link_copied` en `handleCopyLink`; y `ai_used` en `handleGenerateDresscode`, `handleSuggest` y `handleGeneratePlaceDescription`. Prueba manual: cada acción produce un evento con `uid` y la URL saneada.
11. **Aviso de privacidad.** Crear `app/aviso-de-privacidad/page.tsx` (Server Component, `robots: { index: false }`, con `PageShell`) con: qué se mide y para qué, la herramienta (PostHog, servidores en EE. UU.), que no se usan cookies y qué se guarda en la pestaña, que las grabaciones enmascaran los campos y solo se hacen en las páginas públicas y en las demos, que no se mide nada dentro de las invitaciones de los invitados, cómo se identifican las cuentas del admin (solo un identificador interno), cómo desactivar la medición (`?notrack=1`) y el correo `hola@invyta.me` para dudas o solicitudes de acceso, rectificación, cancelación u oposición. Agregar `/aviso-de-privacidad` a `NON_LOCALIZED_PATHS` (sin agregarla a `MARKETING_PAGES`) y el enlace en `Footer.tsx` de la landing y en el pie de `PageShell.tsx`. Prueba manual: abre en `/aviso-de-privacidad` sin redirección y no aparece en `/sitemap.xml`.
12. **Despliegue y configuración manual.** Crear el proyecto en PostHog Cloud (región US) y copiar la clave pública; agregar `NEXT_PUBLIC_POSTHOG_KEY` y `NEXT_PUBLIC_POSTHOG_HOST` en Vercel (Production) y **redesplegar** (las variables `NEXT_PUBLIC_*` se incrustan en el build). Verificar en PostHog → Activity → Live events que llegan `$pageview` y `cta_click` de una visita real de prueba (usar una ventana de incógnito sin `notrack`).
13. **Visualizaciones y enlaces con origen (manual).** En PostHog crear cuatro visualizaciones y un tablero "Embudo Invyta": (a) embudo de prospecto: `$pageview` de `/` → `section_viewed` con `section = disenos` → `demo_click` → `cta_click`; (b) embudo de paquetes: `$pageview` de `/paquetes` → `cta_click`; (c) `cta_click` por `src` y por `location`; (d) activación del admin: `login_completed` → `$pageview` de `/admin/wedding-editor/:weddingId` → `editor_saved` → `guest_added` → `guest_link_copied`. Poner `https://www.invyta.me/?src=ig-bio` en la biografía de Instagram, `?src=wa-catalogo` en WhatsApp Business y `?src=bodas` en el perfil de Bodas.com.mx. Abrir `?notrack=1` en cada dispositivo propio.
14. **Seguimiento a los 14 días (manual).** Anotar en este spec: visitantes, porcentaje que ve la sección de diseños, clics en demos, clics a WhatsApp y su `src`, y en qué paso cae más gente; mirar al menos 10 grabaciones y anotar qué se repite.

## Criterios de aceptación

**Código (verificable con `npm run build && npm run start` y la pestaña Network):**

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.
- [ ] Sin `NEXT_PUBLIC_POSTHOG_KEY`, ninguna página hace solicitudes a `/ingest` ni a dominios `posthog.com`, y no hay errores en la consola.
- [ ] Con la clave, `/` genera solicitudes a `/ingest/...` y ninguna solicitud directa del navegador a un dominio `posthog.com`.
- [ ] En `/wedding/<id real>`, `/en/wedding/<id real>?guest=<id>` y cualquier otra ruta fuera de `resolveScope`, no se carga el script de PostHog y no hay solicitudes a `/ingest`.
- [ ] Al abrir cada una de las tres demos (`template-01-demo`, `template-02-demo`, `valentina-mateo-2026`) se emite un `demo_opened` con su `demo_id`.
- [ ] Tras navegar por la landing, `/paquetes` y una demo, `document.cookie` no contiene ninguna cookie de PostHog (`ph_*`) y `localStorage` no contiene claves `ph_*`.
- [ ] Navegar de `/` a `/paquetes` con clic (recarga completa) conserva el mismo `distinct_id` en ambas solicitudes.
- [ ] Cada botón de WhatsApp de la landing y de las páginas de marketing emite un `cta_click` con `location` y `page`, y su `href` resultante termina en `(ref: ...)`; los botones sin mensaje llevan `DEFAULT_WHATSAPP_MESSAGE` antes de la etiqueta.
- [ ] Un enlace `https://wa.me/` con otro número no emite `cta_click` ni cambia su `href`.
- [ ] Un clic a un enlace de demo emite `demo_click` con su `demo_id`.
- [ ] Al abrir `/?src=ig-bio`, todos los eventos posteriores de la sesión llevan `src = ig-bio` y la etiqueta de WhatsApp termina en `ig-bio)`.
- [ ] Bajar por la landing emite un `section_viewed` por cada `section[id]`, una sola vez por sección y visita.
- [ ] `/?notrack=1` deja de enviar eventos, persiste tras recargar y en otra pestaña, y `/?notrack=0` los reactiva.
- [ ] En el admin, iniciar sesión con una cuenta de `ADMIN_EMAILS` no envía eventos; con una cuenta de pareja se hace `identify` con el uid y ningún evento contiene el correo.
- [ ] Ningún evento del admin contiene el ID de boda: las URLs salen como `/admin/<sección>/:weddingId` en `$current_url`, `$pathname` y `$referrer`.
- [ ] Tras cerrar sesión, el siguiente evento usa un `distinct_id` anónimo nuevo.
- [ ] Solo se emite la grabación (solicitudes a `/ingest/s/`) en rutas `marketing` y `demo`; en `/es/admin/*` y `/es/login` no hay ninguna.
- [ ] Al escribir un texto de prueba en un campo del formulario de RSVP de una demo, ese texto no aparece en la carga de la grabación.
- [ ] `editor_saved`, `guest_added` (solo al crear), `guest_link_copied` y `ai_used` se emiten una vez por acción y con `feature` correcto en `ai_used`.
- [ ] `/aviso-de-privacidad` responde 200 sin redirección, lleva `noindex`, no aparece en `/sitemap.xml` (que sigue listando exactamente las siete URLs del spec 10) y está enlazada desde el pie de la landing y de las páginas de marketing.
- [ ] Lighthouse móvil en `/` con la analítica activa mantiene rendimiento de 85 o más, LCP de 2.5 s o menos y CLS de 0.1 o menos (criterios del spec 10).
- [ ] El enlace `invyta` del pie de una demo termina en `?src=demo` y el de una invitación real en `?src=invitacion`, ambos con `https://www.invyta.me`.

**Lanzamiento (verificable en PostHog y en Vercel):**

- [ ] `NEXT_PUBLIC_POSTHOG_KEY` está en Vercel (Production) y el despliegue posterior a agregarla envía eventos.
- [ ] PostHog → Live events muestra `$pageview` y `cta_click` de una visita de prueba con su `src`.
- [ ] Existen las cuatro visualizaciones y el tablero "Embudo Invyta", cada una con datos de al menos una visita de prueba.
- [ ] `https://www.invyta.me/?src=ig-bio` es el enlace de la biografía de Instagram; `?src=wa-catalogo` el de WhatsApp Business; `?src=bodas` el de Bodas.com.mx.
- [ ] Seguimiento (no bloquea el cierre del spec): a los 14 días queda anotado el resultado del paso 14.

## Decisiones tomadas y descartadas

- **Sí: PostHog Cloud (región US).** Embudos, eventos y grabaciones en una sola herramienta con plan gratuito; con poco tráfico, ver 10 sesiones enseña más que un embudo con 10 visitas. **No:** GA4 (embudos rígidos, sin grabaciones, pide banner de cookies), Vercel Web Analytics (eventos y embudos requieren plan Pro) ni eventos propios en Firestore (habría que construir el tablero).
- **Sí: `persistence: 'sessionStorage'` y no `'memory'`.** El usuario eligió "sin cookies, solo en memoria"; se ajusta porque con `memory` el identificador se regenera en cada carga completa y la landing navega con `<a href>`, así que el embudo entre páginas no existiría (verificado en la documentación de posthog-js). `sessionStorage` no es una cookie, no viaja al servidor y se borra al cerrar la pestaña, así que conserva el criterio de no seguir a la persona entre visitas. **No:** `localStorage` ni cookies (seguimiento entre sesiones y banner).
- **Sí: sin banner de consentimiento, con aviso de privacidad.** Decisión explícita del usuario. La medición no usa cookies ni identifica a los visitantes; el aviso explica qué se mide (ver Riesgos sobre revisión legal). **No:** banner (fricción en el hero y medirías solo a quien lo acepta).
- **Sí: `autocapture: false` y eventos explícitos.** El catálogo es corto, cada evento tiene una pregunta de negocio y no se llena el proyecto de clics sin significado. **No:** autocaptura.
- **Sí: `person_profiles: 'identified_only'`.** Los visitantes anónimos no crean perfiles; solo las cuentas del admin se identifican.
- **Sí: proxy `/ingest` del propio dominio.** Los bloqueadores de anuncios filtran los dominios de PostHog; el proxy recupera buena parte de esas visitas. **No:** llamar directo a `us.i.posthog.com`.
- **Sí: un listener de clic delegado en lugar de editar los ocho botones de WhatsApp.** Los botones están repartidos en componentes cliente y servidor y con enlaces escritos a mano; un solo punto evita omisiones y no toca el diseño. Solo se agregó `data-track-package` en las tarjetas de paquetes porque `section[id]` no las distingue.
- **Sí: etiqueta de origen visible `(ref: ...)` al final del mensaje de WhatsApp.** Decisión explícita del usuario; es la única forma de saber de dónde vino un chat, porque la conversación no pasa por el sitio. **No:** solo contar clics (no se relaciona un chat con su origen) ni un formulario propio (más fricción y cambia el flujo de venta).
- **Sí: solo marketing y las tres demos. Nunca invitaciones reales.** Muestran nombres y teléfonos de invitados. Las demos son tres (`valentina-mateo-2026` es la de `template-03`).
- **Sí: grabación de sesiones en marketing y demos, con campos enmascarados; nunca en el admin.** Decisión explícita del usuario. El admin muestra nombres, correos y teléfonos de invitados.
- **Sí: identificar solo con el uid de Firebase.** Decisión explícita del usuario. **No:** correo (dato personal a un tercero que ya tienes en Firebase) ni ID de boda (contiene los nombres de la pareja); a cambio, no se pueden separar las bodas de un mismo planner.
- **Sí: sanear el ID de boda en las URLs del admin.** El ID viaja en `$current_url` y `$pathname`; se reemplaza en `before_send`.
- **Sí: excluir el tráfico propio con `?notrack=1` y con las cuentas del operador.** Sin eso, las visitas del creador dominarían los datos mientras no haya clientes. `localStorage['invyta:notrack']` es un interruptor propio del dispositivo, no seguimiento.
- **Sí: `demo_opened` solo como conteo, no como paso del embudo por persona.** Si el enlace de la demo se abre en una pestaña nueva, `sessionStorage` no se comparte y el `distinct_id` cambia. Se compara el conteo de `demo_click` contra `demo_opened`.
- **Sí: el enlace de las invitaciones al sitio lleva `?src=`.** Mide el retorno desde invitaciones sin medir nada dentro de ellas; el ID de boda no viaja.
- **Sí: `/aviso-de-privacidad` con `noindex`.** Es una página obligada por la medición, no de captación.
- **No: analítica de invitados para las parejas en este spec.** Decisión explícita del usuario tras dividirla: son datos por boda en Firestore, pantallas nuevas del admin y reglas de privacidad; toca cuatro áreas.
- **No: A/B, banderas de funciones ni encuestas de PostHog.** No hay tráfico para que sirvan.
- **Sí: no-op sin clave.** El desarrollo local y las ramas de vista previa no envían datos.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Los bloqueadores de anuncios y los navegadores con protección (Brave, Firefox estricto) reducen las visitas contadas | El proxy `/ingest` recupera parte; los números son una muestra, no un total. Los clics a WhatsApp se contrastan con los chats reales |
| Con poco tráfico los porcentajes del embudo son ruido (3 de 10 no es 30 %) | Se leen las grabaciones y los conteos absolutos; el paso 14 pide mirar al menos 10 sesiones |
| El texto del aviso de privacidad no cumple la ley aplicable (LFPDPPP en México) | El aviso lo redacta este spec con lo que el sistema hace realmente, pero no es asesoría legal: revisarlo con un profesional antes de invertir en publicidad de pago |
| Reescribir el `href` en el clic falla en algún navegador o en el navegador integrado de Instagram | Se prueba en Chrome móvil y en el navegador de Instagram; sin JavaScript o antes de la hidratación el enlace funciona sin etiqueta (se pierde solo la atribución) |
| La etiqueta `(ref: ...)` visible en el chat confunde o molesta a los prospectos | Es corta y al final del mensaje; si genera fricción se cambia el formato sin tocar el resto |
| Las grabaciones capturan datos personales de una demo o de páginas públicas | `maskAllInputs`, las demos usan datos ficticios y el admin y las invitaciones reales no se graban; el criterio de aceptación verifica el enmascarado |
| El `distinct_id` cambia entre pestañas (demo en pestaña nueva, apertura desde WhatsApp) y el embudo se ve más corto | Documentado en Decisiones; se comparan conteos de eventos además del embudo |
| Superar el plan gratuito de PostHog (eventos y grabaciones por mes) | Sin autocaptura y con eventos acotados el volumen es bajo; verificar los límites vigentes en la cuenta al crear el proyecto |
| Un cambio futuro de `next.config.js` o del `matcher` rompe el proxy `/ingest` sin que se note | El criterio de aceptación verifica solicitudes a `/ingest`; el paso 12 confirma eventos en Live events tras cada despliegue |
| `posthog-js` empeora el LCP o el CLS | Carga diferida con `requestIdleCallback`; el criterio de Lighthouse del spec 10 se repite con la analítica activa |

## Lo que **no** está en este spec

- Analítica de invitados para las parejas (aperturas y confirmaciones visibles para los novios).
- Medición dentro de invitaciones reales y dentro de las demos más allá de abrirlas y salir al sitio o a WhatsApp.
- Banner de consentimiento de cookies.
- Pruebas A/B, banderas de funciones y encuestas.
- GA4 y Vercel Analytics.
- El ID de boda en los eventos.
- Atribución automática de cada chat de WhatsApp a una venta.
- Alertas automáticas desde PostHog.
- Reglas de Firestore y seguridad de la IA (spec 09).

Cada uno de estos, si se decide hacer, va en su propio spec.
