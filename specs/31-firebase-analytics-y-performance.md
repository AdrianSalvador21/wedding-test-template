# 31 — Firebase Analytics y Performance Monitoring en lugar de PostHog

**Estado:** Approved
**Depende de:** SPEC 11 (analítica con PostHog, que este spec reemplaza), SPEC 08 (login y `AuthProvider`), SPEC 17 (cuentas de wedding planner, `isPlanner`), SPEC 27 (save the date), SPEC 29 (álbum de fotos de los invitados)
**Fecha:** 2026-11-25

## Objetivo

Reemplazar PostHog por Firebase Analytics (GA4) y Firebase Performance Monitoring, con el mismo catálogo de eventos ampliado a las invitaciones reales y sin mandar nombres ni IDs de boda, para tener paneles en Firebase/GA4, conversiones en Google Ads y exportación a BigQuery.

## Contexto

### Estado real del código (revisado en esta sesión)

- **La analítica actual es PostHog (spec 11)** y está completa:
  - `lib/analytics/client.ts` carga `posthog-js` de forma diferida y expone `track`, `capturePageview`, `registerProps`, `identifyUser`, `resetAnalytics`, `setCaptureEnabled`, `setRecording`, `isNotrack`, `setNotrack`, `applyNotrackParam`, `resolveSrc` y `getSrc`.
  - `lib/analytics/events.ts` tiene el catálogo tipado `AnalyticsEventMap`, con 33 eventos (specs 11, 12, 16, 28 y 29).
  - Unos 37 puntos de llamada a `track(...)` en 21 archivos importan de `lib/analytics/client`.
  - `components/analytics/AnalyticsProvider.tsx` (montado en `app/layout.tsx`) decide el alcance por ruta, captura `$pageview`, `demo_opened` y `section_viewed`.
  - `components/analytics/AdminAnalytics.tsx` (montado en los layouts de `admin` y `login`) identifica por uid y excluye a las cuentas de `ADMIN_EMAILS`.
  - `lib/analytics/click-tracking.ts` maneja los clics a WhatsApp de Invyta (`cta_click` y la etiqueta `(ref: ...)`), `demo_click` y `site_link_click`. `lib/analytics/section-tracking.ts` maneja `section_viewed`.
  - `next.config.js` tiene el proxy `/ingest` y `skipTrailingSlashRedirect: true` (comentado como requisito de PostHog). `middleware.ts` excluye `ingest` en su `matcher`.
- **Alcance actual** (`lib/analytics/scope.ts`):
  - `resolveScope` devuelve `marketing`, `demo` (solo `/wedding/<id>` exacto con `<id>` en `DEMO_IDS`), `admin` o `null`.
  - Las invitaciones reales, su save the date (`/wedding/<id>/aparta-la-fecha`) y su álbum (`/wedding/<id>/fotos`) son `null`. Por eso `album_photo_uploaded` (`GuestAlbum.tsx:436`) hoy nunca se envía.
  - `DEMO_IDS` ya incluye cuatro demos: `template-01-demo`, `template-02-demo`, `valentina-mateo-2026` y `template-04-demo`.
  - `sanitizeUrl` solo reemplaza `/admin/panel/<id>`. `pageKey` devuelve `demo` para cualquier `/wedding/...`.
- **Firebase:** `lib/firebase.ts` inicia la app con `firebase@12.1.0` sin `measurementId`. `.env.local` ya define `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-DD5C4X81JN`, pero nada lo usa. No se usa `firebase/analytics` ni `firebase/performance`.
- **Google Ads:** `components/analytics/GoogleAdsTag.tsx` carga `gtag.js` con `NEXT_PUBLIC_GOOGLE_ADS_ID` en el mismo alcance que PostHog. Define `gtag` como función global en un script en línea. No dispara ningún evento de conversión: solo la etiqueta base.
- **Entorno:** no hay ningún uso de `NEXT_PUBLIC_VERCEL_ENV` ni de `VERCEL_ENV` en el repo.
- **Aviso de privacidad:** `app/aviso-de-privacidad/page.tsx` dice que se usa PostHog, que no hay cookies, que se graban sesiones y que no se mide nada dentro de las invitaciones.
- **Login:** solo correo y contraseña (no hay `GoogleAuthProvider`). `track('login_completed')` y `track('signup_completed')` están en `app/[locale]/login/page.tsx:115-118`.

### Invitaciones (mapa de puntos a instrumentar)

- `renderWeddingPage` (`app/[locale]/wedding/[id]/wedding-page.tsx:112`) lee `?guest=`. Después monta `WeddingPageClient` → `WeddingTemplate.tsx`.
- `WeddingTemplate.tsx` hace tres cosas:
  - Resuelve `templateId = currentWedding.template?.id || 'template-01'` (L183).
  - Muestra `SaveTheDate` en modo save the date (L173).
  - Muestra `InvitationNotActivated` en bodas `free` (L163).
- `fotos/page.tsx` monta `GuestAlbum({ weddingId, locale, guestId })`.
- **RSVP.** En las cuatro plantillas el handler es `onSubmit`. Cada una tiene una rama de demo (`isDemoMode`, sin escribir en Firestore) y un éxito real (`setIsSubmitted(true)` tras `updateGuest`):

  | Plantilla | Archivo |
  | --- | --- |
  | 01 | `components/sections/RSVP.tsx` |
  | 02 | `components/sections-v2/RSVPV2.tsx` |
  | 03 | `components/sections-v3/RSVPV3.tsx` |
  | 04 | `components/sections-v4/RSVPV4.tsx` |

  `data.attendance` (`'yes' | 'no'`) existe en las cuatro. El número de pases está en `guestCount`.
- **Interacciones** (botones con `openExternalLink` o `<a href>`):
  - **Mapas:**
    - 01: `Location.tsx`, `Accommodation.tsx` y `RecommendedPlaces.tsx`.
    - 02: `LocationV2.tsx`, `AccommodationV2.tsx` y `RecommendedPlacesV2.tsx`.
    - 03: `LocationV3.tsx`, `AccommodationV3.tsx` y `RecommendedPlacesV3.tsx`.
    - 04: `LocationV4.tsx`, `AccommodationV4.tsx` y `RecommendedPlacesV4.tsx`.
  - **Calendario:**
    - `AddToCalendarButtonV2.tsx`, solo en la plantilla 02.
    - `SaveTheDate.tsx` (`CalendarPicker`: `addToPhone` y la opción de Google).
  - **Mesa de regalos:**
    - El enlace `registry.url` está en `GiftRegistry.tsx`, `GiftRegistryV2.tsx`, `GiftRegistryV3.tsx` y `GiftRegistryV4.tsx`.
    - Los botones de copiar cuenta o CLABE están en los mismos archivos, y en `components/sections-v2/ui.tsx` (`handleCopy`) para la 02.
  - **Música:** `MusicPlayer.tsx` (`togglePlay`) y `MusicToggleV2.tsx`.
  - **Contacto con la pareja:**
    - Plantilla 01: `Footer.tsx` (`handleWhatsAppClick`).
    - Plantilla 03: `FooterV3.tsx`.
    - Plantilla 04: `FooterV4.tsx`.
    - Plantilla 02: `FooterV2.tsx` (`tel:`).
  - **Abrir el álbum:** `AlbumFab.tsx`, `StickyConfirmBarV2.tsx`, `InvitationOverlay.tsx` y `InvitationOverlayV2.tsx`.
- **Secciones:** las cuatro plantillas usan `section[id]` (`about`, `countdown`, `location`, `gift-registry`, `rsvp` y otros). `observeSections` sirve sin cambios.

### Decisiones del usuario (Fase 2)

- **PostHog se reemplaza**, no convive. Se aceptan perder las grabaciones de sesión.
- **Objetivos:** conversiones de Google Ads, paneles en Firebase/GA4, exportación a BigQuery y medición de rendimiento.
- **Cookies:** GA4 con cookies normales y aviso de privacidad actualizado. Sin banner.
- **Invitaciones reales:** sí se miden aperturas, RSVP, interacciones y álbum. Nunca con ID de boda ni `?guest=`: solo `template_id` y el tipo de página.
- **Performance:** trazas automáticas solo en marketing y demos, más tres trazas propias (RSVP, guardado del editor, subida de foto) en todos lados.
- **Entornos:** solo producción (`NEXT_PUBLIC_VERCEL_ENV === 'production'`). En otros entornos se activa a mano con `?ga_debug=1`.
- **Google Ads:** se mantiene `GoogleAdsTag.tsx`.
- **Nombres:** se usan los eventos recomendados de GA4 donde aplica (`sign_up`, `login`, `generate_lead`).
- **Corte:** primero se agrega Firebase. Al final del plan se quita PostHog, de modo que nunca hay un momento sin medición.
- **Admin:** `user_id` = uid y propiedad de usuario `account_type`.
- **Tráfico propio:** igual que hoy (`?notrack=1` y cuentas de `ADMIN_EMAILS`).
- **Una sola spec**, con el plan dividido por bloques para no mezclar áreas al implementar.

## Alcance

**Incluye:**

- **Firebase Analytics (GA4)** con `firebase/analytics`:
  - Importación diferida en tiempo ocioso y protegida con `isSupported()`.
  - Cookies propias de GA4, `allow_google_signals: false` y `page_view` manual con URL y título saneados.
  - Su propio `gtag` y `dataLayer`, aislados de `GoogleAdsTag`.
- **Activación por entorno.** Solo con `NEXT_PUBLIC_VERCEL_ENV === 'production'` y `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` definido. En cualquier entorno, `?ga_debug=1` lo activa para la pestaña con `debug_mode` (DebugView) y `?ga_debug=0` lo apaga.
- **Nuevo alcance `invitation`.** Cubre `/wedding/<id>`, `/wedding/<id>/aparta-la-fecha` y `/wedding/<id>/fotos` (con o sin `/en`) cuando `<id>` no es demo. Las subrutas de una demo pasan a ser `demo`.
- **Saneamiento de URLs** en `page_location` y `page_referrer`:
  - `/admin/panel/<id>` → `/admin/panel/:weddingId`.
  - `/wedding/<id real>` → `/wedding/:weddingId`.
  - En la consulta solo sobreviven `src`, `utm_*`, `gclid` y `vista`.
- **Título fijo** (`page_title`) en `invitation` y `admin`, para que nunca viaje un `document.title` con nombres.
- **Catálogo de eventos.**
  - Se renombran tres eventos: `signup_completed` → `sign_up`, `login_completed` → `login` y `cta_click` → `generate_lead`.
  - Se agregan `invitation_opened`, `rsvp_submitted` e `invitation_interaction`.
  - `section_viewed` y `album_photo_uploaded` se envían también en `invitation`.
- **Parámetros por defecto:**
  - `src` en todos los alcances.
  - `template_id` e `is_demo` en `invitation` y `demo`.
- **Instrumentación de interacciones** con un atributo `data-track-action` en cada control de la lista del contexto, más una rama del listener delegado existente.
- **Admin:**
  - `setUserId(uid)` y `setUserProperties({ account_type })`.
  - `setUserId(null)` y `account_type` vacío al cerrar sesión.
  - Cuentas de `ADMIN_EMAILS` excluidas igual que hoy.
- **Personalización de anuncios.** `allow_ad_personalization_signals: false` en `invitation` y `admin`. Solo marketing y demos alimentan audiencias de remarketing.
- **`GoogleAdsTag.tsx` se mantiene.** Sigue sin cargarse en `invitation` y su script deja de pisar un `gtag` existente.
- **Firebase Performance Monitoring** con `firebase/performance`:
  - Importación diferida.
  - `instrumentationEnabled` solo en `marketing` y `demo`, y se apaga al pasar a otro alcance.
  - Tres trazas propias: `rsvp_submit`, `editor_save` y `album_photo_upload`, con atributos `result` y `template_id`.
- **Aviso de privacidad reescrito:**
  - Herramientas de Google, cookies `_ga` y `_ga_<ID>`, y qué se mide en las invitaciones.
  - Desaparecen las grabaciones.
  - Se agrega un enlace "Privacidad" junto al enlace de marca en el pie de `WeddingTemplate.tsx`, `SaveTheDate.tsx` y `GuestAlbum.tsx`.
- **Retiro de PostHog:**
  - `posthog-js`, el proxy `/ingest`, `skipTrailingSlashRedirect` y `ingest` en el `matcher`.
  - Las variables `NEXT_PUBLIC_POSTHOG_*` y todo el código de grabación y `before_send`.
- **Pasos manuales:**
  - GA4: vínculo con Firebase, señales de Google, medición mejorada, dimensiones personalizadas, eventos clave, filtro de tráfico de desarrollador y retención.
  - Vercel: variables y redespliegue.
  - Google Ads: vínculo y conversiones importadas.
  - BigQuery: exportación diaria.
  - Exploraciones en GA4 que reemplazan el tablero "Embudo Invyta".

**No incluye (queda para otra iteración):**

- **Analítica de invitados para las parejas** (quién abrió y quién confirmó, visible en el panel de los novios). Sigue siendo su propio spec.
- Grabaciones de sesión o mapas de calor (Microsoft Clarity u otra herramienta).
- Banner de consentimiento y Consent Mode.
- Un proxy propio para GA4 (Google Tag Gateway, server-side tagging).
- Migrar o exportar los datos históricos de PostHog.
- Eventos de conversión disparados desde `GoogleAdsTag.tsx` (las conversiones se importan desde GA4).
- Trazas propias además de las tres (importar invitados, ZIP del álbum, IA).
- Instrumentar la galería, las redes sociales del pie, los botones que hacen scroll al RSVP y el visor de fotos del álbum.
- Firebase Remote Config, A/B Testing, Crashlytics o cualquier otro producto de Firebase.
- Consultas o tableros propios sobre BigQuery (solo se activa la exportación).
- Cambiar la etiqueta `(ref: ...)` de WhatsApp o la lógica de `src` (se conservan tal cual).

## Modelo de datos

Esta feature no introduce datos en Firestore. Cambia módulos de código, variables de entorno y el almacenamiento del navegador.

### Alcance y saneamiento (`lib/analytics/scope.ts`)

```ts
export type TrackingScope = 'marketing' | 'demo' | 'admin' | 'invitation' | null;
// 'marketing':  igual que hoy. GA4 + trazas automáticas de Performance.
// 'demo':       /wedding/<demoId> y sus subrutas (aparta-la-fecha, fotos). GA4 + trazas automáticas.
// 'admin':      /login y /admin/**. GA4 sin personalización de anuncios. Sin trazas automáticas.
// 'invitation': /wedding/<id>, /wedding/<id>/aparta-la-fecha, /wedding/<id>/fotos con <id> no demo.
//               GA4 sin personalización de anuncios. Sin trazas automáticas. Nunca GoogleAdsTag.
// null:         cualquier otra ruta: no se envía nada.

export function sanitizeUrl(value: string): string;      // rutas y URLs absolutas
export function pageTitleFor(pathname: string, scope: TrackingScope): string | null;
// null = usar document.title (marketing y demo). Valores fijos:
// invitation → 'Invitación' | 'Aparta la fecha' | 'Álbum'; admin → 'Admin' | 'Login'.

export function pageKey(pathname: string): string;
// Cambia solo esto: /wedding/<demoId>/** → 'demo'; /wedding/<id real>/** → 'invitacion'.
```

Reglas de `sanitizeUrl`:

- `/(es|en)?/admin/panel/<id>` → `/admin/panel/:weddingId` (sin cambio).
- `/(es|en)?/wedding/<id>` con `<id>` fuera de `DEMO_IDS` → `/wedding/:weddingId` (se conserva el prefijo `/en` y la subruta).
- Consulta: solo `src`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid` y `vista`. Todo lo demás se elimina (`guest`, `invitado`, `notrack`, `ga_debug`).

### Catálogo de eventos (`lib/analytics/events.ts`)

Solo cambian estas entradas. El resto del catálogo sigue igual.

```ts
// Renombrados a eventos recomendados de GA4 (mismas propiedades + method en sign_up/login)
generate_lead: { location: string; page: string; package?: 'basico' | 'personalizado' }; // antes cta_click
sign_up: { method: 'password' };                                                          // antes signup_completed
login: { method: 'password' };                                                            // antes login_completed

// Invitaciones (alcances 'invitation' y 'demo'). template_id e is_demo llegan como parámetros por defecto.
invitation_opened: { page_type: 'invitation' | 'save_the_date' | 'album'; has_guest: boolean };
rsvp_submitted: { attending: 'yes' | 'no'; guest_count: number };
invitation_interaction: {
  action: 'map' | 'calendar' | 'gift_registry' | 'gift_copy' | 'music_play' | 'contact_couple' | 'album_open';
};
```

Convenciones:

- **Valores.** GA4 no maneja booleanos. `client.ts` convierte `true`/`false` en `'true'`/`'false'` antes de `logEvent`. Esto aplica también a los eventos existentes (`edited`, `closed`, `standalone`).
- **Límites de GA4.** El nombre del evento tiene 40 caracteres como máximo y el valor de un parámetro 100. `client.ts` recorta los valores de texto a 100.
- **Parámetros por defecto** (`setDefaultEventParameters`):
  - `src` en todos los alcances.
  - `template_id` (`'template-01'` … `'template-04'`) e `is_demo` (`'true'`/`'false'`) mientras la persona está en `invitation` o `demo`.
  - Al salir de esos alcances, `template_id` e `is_demo` se limpian.
- **`page_view` manual.** Lleva `page_location` y `page_referrer` saneados, y `page_title` de `pageTitleFor` o `document.title`. Los mismos tres valores se fijan con `setDefaultEventParameters` para que todo evento posterior use la URL saneada, y no `document.location`.
- **Propiedad de usuario:** `account_type: 'couple' | 'planner'` (de `isPlanner` en `auth-context`). Solo en el admin.
- **`has_guest`:** `true` si la URL trajo `?guest=`. El valor del invitado nunca viaja.
- **`guest_count`:** número de pases (`guestCount`), entero, sin nombres.

### Atributo de interacción

```tsx
<button data-track-action="map" ...>   // o <a data-track-action="gift_registry" ...>
```

El listener delegado (`click`, fase de captura) busca `closest('[data-track-action]')` solo en `invitation` y `demo` y emite `invitation_interaction`. `music_play` solo se marca cuando el clic **inicia** la reproducción. Para eso el componente pone `data-track-action` solo mientras está pausado.

### Configuración de Firebase Analytics (valores fijos)

```ts
// antes de initializeAnalytics:
settings({ gtagName: 'invytaGtag', dataLayerName: 'invytaDataLayer' }); // aislado de GoogleAdsTag
initializeAnalytics(app, {
  config: {
    send_page_view: false,             // el proveedor manda page_view saneado en cada cambio de ruta
    allow_google_signals: false,
    debug_mode: /* solo con ?ga_debug=1 */,
  },
});
// por alcance: gtag('set', { allow_ad_personalization_signals: scope === 'marketing' || scope === 'demo' })
```

### Performance Monitoring

```ts
// lib/analytics/perf.ts
initializePerformance(app, {
  instrumentationEnabled: scope === 'marketing' || scope === 'demo', // trazas automáticas
  dataCollectionEnabled: true,                                       // trazas propias en todos lados
});
export function startTrace(name: 'rsvp_submit' | 'editor_save' | 'album_photo_upload'):
  { stop(result: 'ok' | 'error', attrs?: { template_id?: string }): void };
// No-op si Performance no está activo (entorno, notrack, isSupported). Nunca lanza errores.
```

### Variables y almacenamiento

- **Variables:**
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` se agrega a `firebaseConfig` y a `.env.local.example`.
  - `NEXT_PUBLIC_VERCEL_ENV` la expone Vercel automáticamente y no se define a mano.
  - Se eliminan `NEXT_PUBLIC_POSTHOG_KEY` y `NEXT_PUBLIC_POSTHOG_HOST`.
- **Cookies:** las de GA4 (`_ga`, `_ga_<ID>`), con dominio `.invyta.me` y la duración por defecto de GA4.
- **Navegador:**
  - Se conservan `localStorage['invyta:notrack']` y `sessionStorage['invyta:src']`.
  - Se agrega `sessionStorage['invyta:ga_debug'] = '1'`.
  - Desaparecen las claves `ph_*`.

## Plan de implementación

El plan va por bloques. Cada bloque cierra un área y no toca la del siguiente. Hasta el bloque E, PostHog sigue funcionando tal cual. Durante ese tramo, `track()` manda a los dos destinos.

### Bloque A — Base de Firebase Analytics (sin tocar invitaciones)

1. **Configuración y entorno.**
   - Agregar `measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` a `firebaseConfig` en `lib/firebase.ts`.
   - Documentar en `.env.local.example` `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` y el comportamiento de `NEXT_PUBLIC_VERCEL_ENV` y `?ga_debug=1`.
   - Crear `lib/analytics/env.ts` con `applyGaDebugParam()` (`?ga_debug=1|0` → `sessionStorage['invyta:ga_debug']`) e `isGaEnabled()`. `isGaEnabled()` es verdadero si hay Measurement ID, no hay notrack y además el entorno es producción o `ga_debug` está activo.
   - Sin efecto visible. `npm run build` compila.
2. **Alcance y saneamiento.**
   - En `lib/analytics/scope.ts`:
     - Agregar `'invitation'` a `TrackingScope`.
     - Hacer que `demoIdFromPath` acepte las subrutas `aparta-la-fecha` y `fotos`.
     - Ampliar `sanitizeUrl` con las reglas del modelo de datos.
     - Agregar `pageTitleFor` y ajustar `pageKey`.
   - Ningún consumidor reacciona aún a `'invitation'`: `AnalyticsProvider` trata cualquier alcance distinto de `marketing`, `demo` y `admin` como fuera de alcance hasta el paso 7.
   - Agregar al principio de `AnalyticsProvider` y de `GoogleAdsTag` la condición explícita `scope === 'invitation'` → igual que `null`.
   - Prueba manual con `node` sobre las funciones puras:
     - `resolveScope('/wedding/karen-y-juan/fotos')` = `invitation`.
     - `resolveScope('/en/wedding/template-04-demo/aparta-la-fecha')` = `demo`.
     - `sanitizeUrl('https://www.invyta.me/en/wedding/karen-y-juan?guest=g1&src=ig-bio')` = `https://www.invyta.me/en/wedding/:weddingId?src=ig-bio`.
     - `sanitizeUrl('/wedding/template-01-demo?invitado=Ana')` = `/wedding/template-01-demo`.
3. **Adaptador de GA4.**
   - Crear `lib/analytics/ga.ts`. Importa `firebase/analytics` de forma dinámica en tiempo ocioso, verifica `isSupported()`, llama `settings(...)` e `initializeAnalytics(...)` con la configuración fija.
   - Expone `gaEvent(name, params)`, `gaPageView({ location, referrer, title })`, `gaSetDefaults(params)`, `gaSetUser(uid | null, props)` y `gaSetAdPersonalization(on)`.
   - Convierte booleanos a texto y recorta los valores de texto a 100 caracteres.
   - Si `isGaEnabled()` es falso o `isSupported()` falla, todo es no-op. No se conecta a nada todavía.
4. **Conectar `client.ts` y renombrar eventos.**
   - En `lib/analytics/client.ts`:
     - `track()` llama también a `gaEvent`.
     - `capturePageview()` recibe el `pathname` y el `scope`, llama a `gaPageView` con los valores saneados y fija los mismos valores con `gaSetDefaults`.
     - `registerProps({ src })` llama también a `gaSetDefaults`.
   - En `events.ts`, renombrar `cta_click` → `generate_lead`, `signup_completed` → `sign_up` y `login_completed` → `login`.
   - Actualizar los tres puntos de llamada: `click-tracking.ts:65` y `app/[locale]/login/page.tsx:115` y `:118` (con `{ method: 'password' }`).
   - Prueba manual con `npm run dev` y `/?ga_debug=1`:
     - En la pestaña Network hay solicitudes a `google-analytics.com/g/collect` con `en=page_view`.
     - Un clic a WhatsApp produce `en=generate_lead`, y el evento aparece en GA4 → DebugView.
     - Sin `ga_debug`, no hay ninguna solicitud a `google-analytics.com`.
5. **Admin: usuario y anuncios.**
   - En `components/analytics/AdminAnalytics.tsx`, junto a `identifyUser`:
     - Llamar a `gaSetUser(user.uid, { account_type: isPlanner ? 'planner' : 'couple' })`.
     - Al pasar a `signedOut`, `gaSetUser(null, { account_type: '' })`.
   - En el proveedor, `gaSetAdPersonalization(scope === 'marketing' || scope === 'demo')` en cada cambio de ruta.
   - Prueba manual con `?ga_debug=1`:
     - Al iniciar sesión con una cuenta de pareja, las solicitudes llevan `uid` y `up.account_type=couple`.
     - Con una cuenta de `ADMIN_EMAILS` no se envía nada.
6. **Convivencia con `GoogleAdsTag`.**
   - En `components/analytics/GoogleAdsTag.tsx`, cambiar el script en línea para que no redefina un `gtag` existente (`window.gtag = window.gtag || function(){...}`).
   - Confirmar que el componente sigue sin cargarse en `invitation` (la condición del paso 2).
   - Prueba manual con `?ga_debug=1` y un `NEXT_PUBLIC_GOOGLE_ADS_ID` de prueba en `/`:
     - Se cargan dos `gtag/js` (uno con `id=AW-…`, otro con `id=G-…&l=invytaDataLayer`).
     - Cada `page_view` de GA4 sale una sola vez.
     - La consola no muestra errores.

### Bloque B — Invitaciones reales

7. **Proveedor con alcance `invitation`.**
   - En `AnalyticsProvider.tsx`, quitar la condición temporal del paso 2 para `invitation`.
   - En `invitation`:
     - Iniciar GA4.
     - Mandar `page_view` saneado con título fijo.
     - Desactivar la personalización de anuncios.
     - Observar `section[id]` con `observeSections`, que ya usa `pageKey` → `invitacion`.
   - En `invitation` **no** se envía nada a PostHog: `setCaptureEnabled(false)` para PostHog, con una bandera separada de la de GA4.
   - `album_photo_uploaded` empieza a llegar a GA4 sin tocar `GuestAlbum.tsx`.
   - Prueba manual con `?ga_debug=1` en `/wedding/<id real>?guest=<id>`:
     - El `page_view` tiene `dl` = `…/wedding/:weddingId` sin `guest`, y `dt=Invitación`.
     - No hay solicitudes a `/ingest` ni a `googletagmanager.com/gtag/js?id=AW-`.
8. **`invitation_opened` y contexto de plantilla.**
   - Agregar en `client.ts` `setInvitationContext({ template_id, is_demo } | null)`, que llama a `gaSetDefaults`.
   - En `WeddingTemplate.tsx`, cuando hay `currentWedding` y el render no es `InvitationNotActivated`:
     - Llamar `setInvitationContext`.
     - Emitir una vez por carga `invitation_opened` con `page_type` (`'save_the_date'` si renderiza `SaveTheDate`, si no `'invitation'`) y `has_guest`.
   - En `GuestAlbum.tsx`, lo mismo con `page_type: 'album'`.
   - El proveedor llama `setInvitationContext(null)` al salir de `invitation`/`demo`.
   - Prueba manual:
     - Abrir una invitación real produce un `invitation_opened` con `ep.template_id` y `ep.page_type=invitation`.
     - `/aparta-la-fecha` lleva `save_the_date` y `/fotos` lleva `album`.
9. **`rsvp_submitted`.**
   - En los cuatro `onSubmit` (`RSVP.tsx`, `RSVPV2.tsx`, `RSVPV3.tsx`, `RSVPV4.tsx`), emitir `rsvp_submitted` con `attending: data.attendance` y `guest_count: guestCount`.
   - Se emite justo antes de `setIsSubmitted(true)` en el éxito real y en la rama de demo. Nunca en el `catch`.
   - Prueba manual: confirmar en una invitación de prueba de cada plantilla produce exactamente un `rsvp_submitted`.
10. **Interacciones: listener y mapas.**
    - En `lib/analytics/click-tracking.ts`, agregar la rama `[data-track-action]` → `invitation_interaction`. Solo aplica en `invitation` y `demo`, y cubre también `<button>`.
    - Marcar con `data-track-action="map"` los controles de mapa de los doce archivos `Location*`, `Accommodation*` y `RecommendedPlaces*` de la lista del contexto. No cambia ningún estilo ni texto.
    - Prueba manual: en una invitación de cada plantilla, el clic en "cómo llegar" produce `invitation_interaction` con `action=map`.
11. **Interacciones restantes.**
    - Marcar con `data-track-action`, sin cambiar estilos ni textos:
      - `calendar`: `AddToCalendarButtonV2.tsx` y las dos opciones de `CalendarPicker` en `SaveTheDate.tsx`.
      - `gift_registry`: los cuatro `GiftRegistry*`.
      - `gift_copy`: los botones de copiar de `GiftRegistry.tsx`, `GiftRegistryV3.tsx` y `GiftRegistryV4.tsx`, y `handleCopy` en `sections-v2/ui.tsx`.
      - `music_play`: `MusicPlayer.tsx` y `MusicToggleV2.tsx`, solo mientras están pausados.
      - `contact_couple`: el WhatsApp de `Footer.tsx`, `FooterV3.tsx` y `FooterV4.tsx`, y el `tel:` de `FooterV2.tsx`.
      - `album_open`: `AlbumFab.tsx`, `StickyConfirmBarV2.tsx`, `InvitationOverlay.tsx` e `InvitationOverlayV2.tsx`.
    - Prueba manual: cada `action` aparece al menos una vez en DebugView. Pausar la música no emite evento.

### Bloque C — Performance Monitoring

12. **Inicio y trazas automáticas.**
    - Crear `lib/analytics/perf.ts` con:
      - `initPerf(scope)`: importación diferida de `firebase/performance`, con `isGaEnabled()` como condición.
      - `setPerfScope(scope)`: `instrumentationEnabled` verdadero solo en `marketing` y `demo`.
      - `startTrace(name)`.
    - Llamarlo desde `AnalyticsProvider.tsx` en cada cambio de ruta.
    - Prueba manual con `?ga_debug=1`:
      - En `/` hay solicitudes a `firebaselogging.googleapis.com`.
      - En `/wedding/<id real>` la carga de página no genera traza automática: no sale ningún lote con la URL de la invitación.
13. **Tres trazas propias.**
    - `rsvp_submit`: envuelve la escritura en los cuatro `onSubmit` de RSVP, con `template_id`.
    - `editor_save`: envuelve `saveWeddingDoc` en `handleSave` de `app/[locale]/admin/panel/[weddingId]/editor/page.tsx`.
    - `album_photo_upload`: envuelve cada POST de `runQueue` en `GuestAlbum.tsx`.
    - Cada traza termina con `result: 'ok' | 'error'` también en el `catch`.
    - Prueba manual: cada acción produce un lote hacia `firebaselogging.googleapis.com` con el nombre de la traza.

### Bloque D — Privacidad

14. **Aviso de privacidad y enlaces.**
    - Reescribir el contenido de `app/aviso-de-privacidad/page.tsx`. Debe cubrir:
      - Herramientas: Google Analytics para Firebase y Firebase Performance Monitoring (Google, servidores en EE. UU.).
      - Cookies `_ga` y `_ga_<ID>` con su duración.
      - Qué se mide en el sitio, las demos y el admin (solo un identificador interno y el tipo de cuenta).
      - Qué se mide en las invitaciones: aperturas, confirmación sí/no y número de pases, clics en mapa, calendario, regalos, música, contacto y álbum, y fotos subidas. Nunca nombres, mensajes, teléfonos ni el ID de la boda.
      - Que no se graban sesiones.
      - Cómo desactivar la medición (`?notrack=1`) y el correo `hola@invyta.me`.
    - Agregar un enlace "Privacidad" a `/aviso-de-privacidad`, en la misma tipografía y color que el enlace de marca, junto a él en `WeddingTemplate.tsx` (L245) y `SaveTheDate.tsx` (L354). En `GuestAlbum.tsx`, ponerlo en su pie.
    - Prueba manual: los tres pies muestran el enlace y abre el aviso. El aviso no menciona PostHog ni grabaciones.

### Bloque E — Retiro de PostHog

15. **Quitar PostHog del cliente.**
    - En `lib/analytics/client.ts`, eliminar la instancia de PostHog, `initAnalytics`, `beforeSend`, `setRecording`, `whenReady` y el uso de `posthog-js`.
    - `track`, `capturePageview`, `registerProps`, `identifyUser`, `resetAnalytics` y `setCaptureEnabled` quedan como fachada sobre `ga.ts`, con la misma firma, para no tocar los 21 archivos que los importan.
    - Quitar `setRecording` de `AnalyticsProvider.tsx` y actualizar los comentarios que mencionan PostHog en `lib/analytics/*`, `components/analytics/*` y `events.ts`.
    - Prueba manual con `?ga_debug=1`: el recorrido de los pasos 4, 7 y 8 sigue produciendo los mismos eventos.
16. **Quitar dependencia, proxy y variables.**
    - Ejecutar `npm uninstall posthog-js`.
    - En `next.config.js`, eliminar `rewrites()` de `/ingest` y `skipTrailingSlashRedirect`.
    - En `middleware.ts`, quitar `ingest` del `matcher` y su comentario.
    - En `.env.local.example`, quitar el bloque de PostHog.
    - `rg -i posthog` fuera de `specs/` y `node_modules` no devuelve resultados.
    - Prueba manual:
      - `npm run build` compila.
      - `curl -I http://localhost:3000/ingest/static/array.js` ya no responde 200.
      - `curl -I http://localhost:3000/paquetes/` redirige a `/paquetes`.
      - `/paquetes`, `/wedding/template-01-demo` y `/admin` abren.

### Bloque F — Configuración manual y lanzamiento

17. **GA4 y Firebase (consola).**
    - Confirmar en Firebase → Configuración del proyecto → Integraciones que Google Analytics está vinculado y que el Measurement ID de la app web es el de `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`.
    - En GA4 → Administrar:
      - Desactivar las señales de Google.
      - En el flujo web, dejar la medición mejorada solo con desplazamientos. Apagar los cambios de página por historial, los clics salientes, la búsqueda, las interacciones con formularios, los videos y las descargas.
      - Retención de datos de eventos: 14 meses.
      - Activar el filtro de datos "Tráfico de desarrolladores".
    - Registrar las dimensiones personalizadas:
      - De evento: `src`, `location`, `page`, `package`, `demo_id`, `section`, `from`, `feature`, `kind`, `edited`, `mode`, `source`, `variant`, `standalone`, `style`, `closed`, `template_id`, `is_demo`, `page_type`, `has_guest`, `attending`, `action` y `method`.
      - De usuario: `account_type`.
    - Registrar las métricas personalizadas `rows`, `photos` y `guest_count`.
    - Marcar como eventos clave `generate_lead`, `sign_up` y `rsvp_submitted`.
18. **Vercel y primer despliegue.**
    - En Vercel (Production), agregar `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` y quitar `NEXT_PUBLIC_POSTHOG_KEY` y `NEXT_PUBLIC_POSTHOG_HOST`.
    - Confirmar que "Automatically expose System Environment Variables" está activo para que exista `NEXT_PUBLIC_VERCEL_ENV`.
    - Redesplegar: las variables `NEXT_PUBLIC_*` se incrustan en el build.
    - Verificar en GA4 → Tiempo real una visita de prueba en incógnito sin `notrack`: `page_view` de `/`, `generate_lead` y `invitation_opened` de una invitación de prueba.
19. **Google Ads.**
    - En GA4 → Administrar → Vínculos de Google Ads, vincular la cuenta de `NEXT_PUBLIC_GOOGLE_ADS_ID` con la publicidad personalizada activa.
    - En Google Ads, importar `generate_lead` y `sign_up` de GA4 como conversiones principales. `rsvp_submitted` no se importa.
    - Crear la audiencia "Visitó paquetes" (`page_view` con `page_location` que contiene `/paquetes`).
20. **BigQuery.**
    - En GA4 → Administrar → Vínculos de BigQuery, vincular un proyecto de Google Cloud con exportación **diaria**. Puede ser sandbox: en ese caso las tablas caducan a los 60 días.
    - Al día siguiente, confirmar que existe la tabla `events_YYYYMMDD` en el conjunto `analytics_<property_id>`.
21. **Exploraciones y seguimiento.**
    - En GA4 → Explorar, recrear los cuatro análisis del spec 11 como exploraciones de embudo y de forma libre:
      - Prospecto: `page_view` de `/` → `section_viewed` (`section = disenos`) → `demo_click` → `generate_lead`.
      - Paquetes: `page_view` de `/paquetes` → `generate_lead`.
      - `generate_lead` por `src` y por `location`.
      - Activación del admin: `login` → `editor_saved` → `guest_added` → `guest_link_copied`.
    - Agregar una quinta exploración de invitaciones: `invitation_opened` → `section_viewed` (`section = rsvp`) → `rsvp_submitted`, por `template_id`.
    - A las 48 horas, revisar en Firebase → Performance que hay datos de carga de página y de las tres trazas.
    - El proyecto de PostHog queda sin uso. Borrarlo es opcional y manual.

## Criterios de aceptación

**Código (verificable con `npm run build && npm run start`, `?ga_debug=1` y la pestaña Network):**

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.
- [ ] `rg -i posthog` fuera de `specs/` y `node_modules` no devuelve resultados, y `posthog-js` no está en `package.json`.
- [ ] Ninguna página hace solicitudes a `/ingest` ni a dominios `posthog.com`.
- [ ] Sin `?ga_debug=1` y fuera de producción, ninguna página hace solicitudes a `google-analytics.com` ni a `firebaselogging.googleapis.com`.
- [ ] Sin `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`, ninguna página hace solicitudes a `google-analytics.com`, incluso con `?ga_debug=1`, y no hay errores en la consola.
- [ ] Con `?ga_debug=1`, cada cambio de ruta en marketing, demos, admin e invitaciones produce exactamente un `en=page_view`.
- [ ] En `/wedding/<id real>?guest=<id>`, `/wedding/<id real>/aparta-la-fecha` y `/wedding/<id real>/fotos?guest=<id>`, ninguna solicitud a `google-analytics.com` contiene el ID de la boda, el valor de `guest` ni la palabra `guest=`. Esto aplica a `dl`, `dr`, `dt` y a todos los `ep.*`.
- [ ] En el admin, ninguna solicitud a `google-analytics.com` contiene el ID de boda. `dl` sale como `/admin/panel/:weddingId/...`.
- [ ] En una demo, `dl` conserva el ID de la demo y se elimina `?invitado=`.
- [ ] `dt` vale `Invitación`, `Aparta la fecha` o `Álbum` en las tres rutas de invitación real.
- [ ] Al abrir una invitación real, su save the date y su álbum, se emite un solo `invitation_opened` en cada página, con `ep.page_type` correcto, `ep.template_id` de la boda y `ep.has_guest`.
- [ ] Una boda `free` que muestra `InvitationNotActivated` no emite `invitation_opened`.
- [ ] Confirmar asistencia en cada una de las cuatro plantillas emite exactamente un `rsvp_submitted` con `ep.attending` y `epn.guest_count`. Un error de escritura no lo emite.
- [ ] Cada `action` de `invitation_interaction` (`map`, `calendar`, `gift_registry`, `gift_copy`, `music_play`, `contact_couple`, `album_open`) se emite al menos una vez desde los controles listados. Pausar la música no emite nada.
- [ ] Subir una foto desde `/wedding/<id real>/fotos` emite `album_photo_uploaded`.
- [ ] `section_viewed` se emite en una invitación real con `ep.page=invitacion`.
- [ ] Un clic a WhatsApp de Invyta emite `generate_lead` con `location` y `page`, y el mensaje sigue terminando en `(ref: ...)`.
- [ ] `/?src=ig-bio` hace que los eventos posteriores de la pestaña lleven `ep.src=ig-bio`.
- [ ] Iniciar sesión emite `login` y registrarse emite `sign_up`, ambos con `ep.method=password`.
- [ ] Con una cuenta de pareja, las solicitudes llevan `uid` y `up.account_type=couple`. Con una de planner llevan `up.account_type=planner`. Ninguna lleva el correo.
- [ ] Con una cuenta de `ADMIN_EMAILS`, y con `?notrack=1` en cualquier ruta, no hay solicitudes a `google-analytics.com` ni a `firebaselogging.googleapis.com`. `?notrack=0` las reactiva.
- [ ] Tras cerrar sesión, la siguiente solicitud a GA4 no lleva `uid`.
- [ ] Las solicitudes de `invitation` y `admin` llevan `npa=1` (sin personalización de anuncios). Las de marketing y demos no.
- [ ] `googletagmanager.com/gtag/js?id=AW-` no se carga en ninguna ruta de invitación real. Sí se carga en `/` cuando hay `NEXT_PUBLIC_GOOGLE_ADS_ID`.
- [ ] Con `GoogleAdsTag` y GA4 activos en `/`, no hay errores en la consola y cada evento de GA4 sale una sola vez.
- [ ] Las trazas automáticas de Performance salen en `/` y en una demo, y no salen en invitaciones reales ni en el admin.
- [ ] `rsvp_submit`, `editor_save` y `album_photo_upload` se envían una vez por acción, con `result`.
- [ ] Tras navegar por la landing con `?ga_debug=1`, `document.cookie` contiene `_ga` y no hay claves `ph_*` en `localStorage` ni en `sessionStorage`.
- [ ] `/aviso-de-privacidad` no menciona PostHog ni grabaciones y describe cookies, herramientas y qué se mide en invitaciones.
- [ ] El pie de una invitación real, de su save the date y de su álbum tiene el enlace "Privacidad".
- [ ] `curl -I /paquetes/` redirige a `/paquetes`.
- [ ] Lighthouse móvil en `/` con GA4 y Performance activos mantiene rendimiento de 85 o más, LCP de 2.5 s o menos y CLS de 0.1 o menos (criterios del spec 10).

**Lanzamiento (verificable en Firebase, GA4, Google Ads, BigQuery y Vercel):**

- [ ] `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` está en Vercel (Production), las variables de PostHog ya no están y el despliegue posterior envía eventos a GA4 → Tiempo real.
- [ ] En GA4, las señales de Google están desactivadas, la medición mejorada solo tiene desplazamientos y el filtro "Tráfico de desarrolladores" está activo.
- [ ] Las dimensiones y métricas personalizadas del paso 17 están registradas.
- [ ] `generate_lead`, `sign_up` y `rsvp_submitted` son eventos clave.
- [ ] GA4 está vinculado con Google Ads, y `generate_lead` y `sign_up` aparecen como conversiones importadas.
- [ ] La tabla `events_YYYYMMDD` existe en BigQuery al día siguiente del vínculo.
- [ ] Las cinco exploraciones del paso 21 existen y muestran datos de al menos una visita de prueba.
- [ ] Firebase → Performance muestra datos de carga de página y de las tres trazas propias.

## Decisiones tomadas y descartadas

- **Sí: reemplazar PostHog por Firebase Analytics (GA4).** Decisión explícita del usuario. Da paneles junto al resto del proyecto en Firebase, vínculo nativo con Google Ads y exportación gratuita a BigQuery. **No:** convivir con PostHog (dos fuentes de verdad) ni mandar a GA4 solo un subconjunto.
- **Sí: perder las grabaciones de sesión.** Decisión explícita del usuario. GA4 no las tiene. **No:** Microsoft Clarity ni conservar PostHog solo para grabar en este spec.
- **Sí: cookies de GA4 con aviso de privacidad, sin banner.** Decisión explícita del usuario. Revierte el criterio "sin cookies" del spec 11. **No:** Consent Mode con almacenamiento denegado (datos modelados y peores para Ads) ni banner (fricción en el hero).
- **Sí: medir invitaciones reales sin IDs.** Decisión explícita del usuario. Se mide apertura, RSVP sí/no y número de pases, interacciones y fotos. Solo con `template_id` y `page_type`. **No:** ID de boda legible ni con hash. Se pierde separar por boda, pero ningún nombre de pareja ni de invitado viaja a GA4.
- **Sí: sanear por lista permitida de parámetros de consulta.** Es más seguro que una lista de prohibidos: un parámetro nuevo con datos personales no se filtra por accidente.
- **Sí: `page_title` fijo en invitaciones y admin.** `document.title` puede llevar nombres (las demos ya los llevan en su metadata). Así no depende de cómo se escriba la metadata en el futuro.
- **Sí: `send_page_view: false` y `page_view` manual, con `page_location` fijado por defecto.** GA4 no tiene `before_send`: si no se fija `page_location`, cada evento mandaría `document.location` con el ID y el `?guest=`. **No:** la medición mejorada de cambios de página por historial.
- **Sí: medición mejorada solo con desplazamientos.** Reemplaza el `$pageleave` de PostHog para la profundidad de lectura. **No:** clics salientes (mandarían el `wa.me` con el teléfono de la pareja), formularios ni descargas.
- **Sí: eventos recomendados de GA4 donde aplica.** Son `sign_up`, `login` y `generate_lead`, porque GA4 y Google Ads los reconocen en sus reportes. Se renombran en el catálogo, no con un mapa en el adaptador, porque PostHog desaparece y no hay historia que conservar. **No:** renombrar el resto del catálogo, que no tiene equivalente recomendado.
- **Sí: la fachada `track()` conserva su firma.** Los ~37 puntos de llamada de 21 archivos no se tocan, salvo los tres renombrados. Así el bloque E es un cambio interno de `client.ts`.
- **Sí: mantener `GoogleAdsTag.tsx`.** Decisión explícita del usuario. Sigue fuera de las invitaciones reales. **Sí:** las conversiones de Ads se importan desde GA4 (`generate_lead`, `sign_up`). Como `GoogleAdsTag` no dispara conversiones propias, no hay doble conteo. **No:** `rsvp_submitted` como conversión de Ads, porque es actividad de invitados y no de clientes.
- **Sí: `gtag` y `dataLayer` propios para Firebase (`invytaGtag`, `invytaDataLayer`).** El script de `GoogleAdsTag` define `gtag` global y podría pisar el envoltorio de Firebase. Aislarlos cuesta una descarga más de `gtag.js` (se verifica con Lighthouse). **No:** compartir un solo `gtag`.
- **Sí: sin personalización de anuncios en invitaciones y admin (`npa=1`); señales de Google apagadas.** Los invitados y los clientes en su panel no deben entrar en audiencias de remarketing. Solo marketing y demos alimentan audiencias.
- **Sí: medir dentro de las demos igual que en las invitaciones.** Los componentes son los mismos. Los datos son ficticios, y ver cómo un prospecto usa una demo es útil. Se distinguen con `is_demo`. El spec 11 lo había dejado fuera. Esto lo amplía.
- **Sí: interacciones con `data-track-action` y el listener delegado.** Son ~25 controles repartidos en cuatro plantillas, y un atributo por control no cambia el diseño. El atributo deja explícito qué se mide. **No:** deducir la acción por patrón de URL en `openExternalLink` (las URLs de regalos son arbitrarias y hay botones sin URL) ni un `track()` en cada handler.
- **Sí: Performance con trazas automáticas solo en marketing y demos.** Decisión explícita del usuario. El SDK guarda la URL de la página y de las peticiones sin permitir sanearla. **Sí:** tres trazas propias (`rsvp_submit`, `editor_save`, `album_photo_upload`) en todos lados, con nombre fijo y sin IDs.
- **Sí: solo producción, con `?ga_debug=1` como interruptor de prueba.** Decisión explícita del usuario. `.env.local` ya tiene el Measurement ID, así que sin esta condición el desarrollo local llenaría los reportes. Lo enviado con `ga_debug` va con `debug_mode` y se excluye con el filtro de desarrolladores.
- **Sí: `user_id` = uid y `account_type`.** Decisión explícita del usuario. **No:** correo, ID de boda ni `wedding_tier`.
- **Sí: exclusión del tráfico propio igual que hoy.** Decisión explícita del usuario. Con `notrack` o una cuenta de operador no se carga el SDK. **No:** `traffic_type=internal`.
- **Sí: quitar PostHog al final del plan (bloque E).** Decisión explícita del usuario. Hasta el bloque E, `track()` manda a los dos. El primer despliegue a producción ocurre en el paso 18, ya sin PostHog y con las variables de Firebase, así que nunca hay un despliegue sin medición. **No:** periodo en paralelo de 14 días ni quitarlo primero.
- **Sí: quitar `skipTrailingSlashRedirect`.** Su comentario lo liga al proxy de PostHog. Al quitarlo se recupera la redirección estándar de `/ruta/` → `/ruta`, y el criterio de `/paquetes/` lo verifica.
- **Sí: enlace "Privacidad" en los pies de invitación, save the date y álbum.** Ahora se mide a los invitados, y el aviso debe estar a su alcance. Va junto al enlace de marca, con su misma tipografía, sin otro cambio de diseño.
- **Sí: una sola spec, con bloques A–F.** Decisión explícita del usuario. El plan separa base, invitaciones, rendimiento, privacidad, retiro y consola para no mezclar áreas al implementar. **No:** dividir en tres specs.
- **No: proxy propio para GA4.** No es necesario para el lanzamiento y se pierde parte del tráfico con bloqueadores (ver Riesgos).

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Sin el proxy `/ingest`, los bloqueadores de anuncios y Brave bloquean GA4 y Performance: se cuentan menos visitas que con PostHog | Los números son una muestra. Los `generate_lead` se contrastan con los chats reales de WhatsApp. Un proxy propio (Google Tag Gateway) queda fuera de alcance |
| Cookies sin banner: el aviso no cumple la ley aplicable (LFPDPPP en México) o un invitado de otro país exige consentimiento | El aviso describe lo que el sistema hace realmente, pero no es asesoría legal. Revisarlo con un profesional antes de invertir en publicidad de pago |
| Un nombre o ID se filtra a GA4 por una ruta nueva o un parámetro nuevo | Lista permitida de parámetros, título fijo y `page_location` por defecto. Los criterios revisan `dl`, `dr`, `dt` y `ep.*` en las tres rutas de invitación y en el admin |
| `GoogleAdsTag` y Firebase compiten por `gtag` y duplican o pierden eventos | `gtag` y `dataLayer` propios para Firebase, y `window.gtag \|\| ...` en `GoogleAdsTag`. Un criterio verifica un solo `page_view` sin errores |
| Dos `gtag.js` y el SDK de Performance empeoran el LCP | Importación diferida en tiempo ocioso. El criterio de Lighthouse del spec 10 se repite con todo activo |
| `NEXT_PUBLIC_VERCEL_ENV` no está expuesta en el proyecto de Vercel y producción no mide nada | El paso 18 la confirma. El criterio de Tiempo real lo detecta en el primer despliegue |
| `isSupported()` falla en el navegador integrado de Instagram o WhatsApp y esas visitas no se cuentan | No-op silencioso: el sitio nunca se rompe. Se acepta la pérdida |
| Se superan las 50 dimensiones personalizadas de evento en GA4 estándar | Hoy son 23. Agregar dimensiones nuevas exige revisar la cuenta en cada spec que agregue parámetros |
| La exportación a BigQuery en sandbox borra las tablas a los 60 días | Se documenta en el paso 20. Habilitar facturación si se quiere historia larga |
| Las trazas automáticas de Performance siguen activas tras una navegación de cliente desde marketing hacia el admin | `setPerfScope` apaga `instrumentationEnabled` en cada cambio de ruta. El criterio lo verifica en el admin |
| Se pierde la historia de PostHog | Aceptado: la migración de datos queda fuera de alcance y el proyecto de PostHog puede quedar sin borrar |
| GA4 muestrea o umbraliza las exploraciones con poco tráfico | Se leen conteos absolutos. BigQuery tiene los eventos crudos |

## Lo que **no** está en este spec

- Analítica de invitados para las parejas (quién abrió y quién confirmó, visible en su panel).
- Grabaciones de sesión o mapas de calor.
- Banner de consentimiento y Consent Mode.
- Proxy propio para GA4 o server-side tagging.
- Migración de los datos de PostHog.
- Eventos de conversión propios en `GoogleAdsTag.tsx`.
- Trazas propias adicionales (importar invitados, ZIP, IA).
- Instrumentación de galería, redes sociales, scroll al RSVP y visor de fotos.
- Remote Config, A/B Testing, Crashlytics u otros productos de Firebase.
- Consultas y tableros sobre BigQuery.
- Cambios en la etiqueta `(ref: ...)` y en la lógica de `src`.

Cada uno de estos, si se decide hacer, va en su propio spec.
