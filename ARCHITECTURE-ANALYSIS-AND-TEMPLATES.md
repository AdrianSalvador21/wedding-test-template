# Análisis profundo del proyecto y estrategia de Multi-Template (template-01 / template-02)

## 1) Objetivo y restricciones de producción

Este documento hace un análisis detallado del proyecto **wedding-test-template** y define una estrategia para agregar un **nuevo template visual** (`template-02`) que:

- Mantenga **exactamente la misma estructura de datos** y **las mismas secciones**.
- Mantenga **la misma funcionalidad** (invitados, RSVP, overlay, idiomas, música, imágenes).
- **NO rompa producción**:
  - No cambiar rutas existentes (por ejemplo `/[locale]/wedding/[id]`).
  - No cambiar la semántica de campos existentes en Firestore (los datos actuales deben seguir renderizando y confirmando RSVP).
  - No introducir migraciones destructivas.

Requerimiento de selección del template:

- En DB (Firestore), el documento de boda (`weddings/{weddingId}`) tendrá una key `template` como objeto, con un `id`.
- El valor de `template.id` llegará como string como `template-02`.
- Por defecto, si no existe `template` o `template.id`, se debe usar `template-01`.

---

## 2) Stack y arquitectura del runtime

### 2.1 Stack

- **Next.js**: `14.2.30` (App Router)
- **React**: 18
- **TypeScript**
- **TailwindCSS**
- **Redux Toolkit** para estado global
- **next-intl** para i18n (rutas localizadas)
- **Firebase (Firestore)** como base de datos

Archivos relevantes:

- `app/` (App Router)
- `components/` (UI por secciones)
- `src/store/` (Redux)
- `src/services/weddingApi.ts` (carga de WeddingData)
- `services/guestService.ts` (CRUD invitados)
- `services/rsvpService.ts` (CRUD rsvps, aunque no es el “source of truth” en el flujo actual)
- `lib/firebase.ts` (init Firestore)

### 2.2 Rutas críticas (contratos públicos)

- **Invitación** (pública):
  - `app/[locale]/wedding/[id]/page.tsx`
  - URL: `/{locale}/wedding/{weddingId}?guest={guestId}`

- **Admin** (UI cliente, accede directo a Firestore desde el browser):
  - Editor wedding: `app/[locale]/admin/wedding-editor/[weddingId]/page.tsx`
  - Invitados: `app/[locale]/admin/guests/[weddingId]/page.tsx`
  - Confirmaciones: `app/[locale]/admin/confirmations/[weddingId]/page.tsx`

- **API routes (Next server)** para assets locales:
  - Imágenes: `GET /api/wedding-images/[weddingId]`
  - Música: `GET /api/wedding-music/[weddingId]`

**Importante**: La invitación pública NO usa un backend custom para “wedding data”; carga desde Firestore directamente desde el cliente (ver `src/services/weddingApi.ts`).

---

## 3) Modelo de datos en Firestore (lo que existe hoy)

### 3.1 Colecciones

- `weddings`:
  - Documento: `weddings/{weddingId}`
  - Contiene `WeddingData` (estructura grande: couple/event/timeline/giftRegistry/etc.)

- `guests`:
  - Documentos auto-ID (Firestore) con:
    - `weddingId` (para filtrar por boda)
    - `guestId` (string “amigable” usado en URLs)
    - `rsvpStatus` (`pending|confirmed|declined`)
    - `rsvpConfirmation` (objeto con attending, message, dietaryRestriction, etc.)

- `rsvps`:
  - Existe `services/rsvpService.ts` usando colección `rsvps`
  - Admin confirmaciones (`app/[locale]/admin/confirmations`) **lee `rsvps`**
  - Pero el flujo del formulario RSVP de la invitación **NO escribe en `rsvps`**, escribe en `guests.rsvpConfirmation`.

### 3.2 Tipos TS (fuente de verdad en frontend)

- `src/types/wedding.ts` define:
  - `WeddingData`
  - `FirebaseGuest`
  - `FirebaseRSVP`

Observaciones importantes:

- `WeddingData` actualmente tiene `theme` (string u objeto legacy) para seleccionar un **tema**.
- `WeddingData` **no incluye** el campo `template` todavía.

### 3.3 Reglas/índices (riesgos)

Se encontró `firestore.rules.production`, pero hay inconsistencias con el código actual:

- Las reglas hablan de `match /rsvp/{rsvpId}` (singular), pero el código usa colección `rsvps`.
- Además, gran parte del flujo admin e invitación se ejecuta desde cliente. En producción real, esto requiere:
  - reglas públicas para `weddings` (al menos lectura)
  - reglas para `guests` para permitir lectura por guestId (en el flujo actual, el invitado se busca por query con `where('guestId'=='...')`)

Esto es un **punto de auditoría**: si en producción funciona hoy, entonces la configuración real de reglas puede diferir.

---

## 4) Flujo de datos end-to-end (invitation runtime)

### 4.1 Render de invitación

1. Route: `app/[locale]/wedding/[id]/page.tsx`
   - Lee `weddingId` desde params.
   - Lee `guestId` desde `searchParams.guest`.
   - Renderiza `WeddingPageClient`.

2. `components/WeddingPageClient.tsx`
   - `useEffect` → dispatch de Redux: `fetchWeddingData({ weddingId, guestId })`.
   - Renderiza `WeddingTemplate`.

3. `src/store/slices/weddingSlice.ts`
   - `fetchWeddingData` llama a `weddingApi.getById(weddingId, guestId)`.

4. `src/services/weddingApi.ts`
   - Primero intenta `getWeddingFromFirebase`:
     - `getDoc(doc(db,'weddings',weddingId))`
     - Valida “basic info” (bride/groom/date)
     - Si ok: retorna `WeddingData`.
   - Si no existe/está vacío: en dev puede usar mock.

5. `components/WeddingTemplate.tsx`
   - Lee `currentWedding` desde Redux.
   - Calcula tema con `createWeddingTheme(currentWedding)`.
   - Renderiza un conjunto fijo de secciones:
     - `Hero`, `Countdown`, `Location`, `About`, `Gallery`, `Timeline`, `DressCode`, `GiftRegistry`, `Accommodation`, `AdultOnlyEvent`, `RecommendedPlaces`, `RSVP`, `Footer`.
   - Si hay `guestId`, busca el invitado en Firestore (via `guestService.getGuestByGuestId`) para:
     - validar idioma
     - mostrar `InvitationOverlay`

### 4.2 Idiomas

- La ruta es `/{locale}/...`.
- Algunos campos de `WeddingData` son bilingües `{es,en}`.
- Los componentes generalmente **seleccionan** el idioma usando `params.locale`.
- En `WeddingTemplate`, si el invitado (`guest.language`) difiere del locale actual:
  - hace `router.replace` a la URL en el idioma correcto.

### 4.3 Imágenes y música (assets)

- `useWeddingImages` llama a `GET /api/wedding-images/{weddingId}`.
  - El API inspecciona `public/assets/wedding-images/{weddingId}/...`.
  - Soporta:
    - `hero.*`
    - `couple.*`
    - `gallery/*`

- `useWeddingMusic` llama a `GET /api/wedding-music/{weddingId}`.
  - Si existe `public/assets/music/{weddingId}.mp3`, crea config de `MusicConfig`.

Este patrón es importante para templates nuevos: no debe cambiar rutas de assets.

---

## 5) Flujo de invitados e invitaciones (Guest IDs)

### 5.1 `guestId` vs `id`

En `FirebaseGuest` hay dos identificadores:

- `id`: ID real del documento en Firestore (auto-id)
- `guestId`: string generado para usarse en URL (`?guest=...`)

`services/guestService.ts`:

- `createGuest` crea documento y luego genera `guestId` (basado en nombre + timestamp corto) y lo guarda.
- `getGuestByGuestId(guestId, weddingId)` hace query con:
  - `where('guestId'=='...')`
  - `where('weddingId'=='...')`

**Contrato**: no se debe romper el uso de `guestId` como query-param ni su búsqueda.

### 5.2 Overlay personalizado

`components/InvitationOverlay.tsx`:

- Si `guestInfo` real existe, usa:
  - `guestInfo.name`
  - `guestInfo.guestCount` como `allowedGuests`
  - `guestInfo.coupleMessage`
- Caso demo/mock: usa `getMockInvitation()`.

Este overlay depende del `currentWedding` y el tema/patrones.

---

## 6) RSVP en producción: “source of truth” real (hallazgo crítico)

Hay dos mecanismos coexistiendo:

- `services/rsvpService.ts` guarda en colección **`rsvps`**.
- Pero `components/sections/RSVP.tsx` (form público) NO usa `rsvpService`.

En su lugar, el formulario RSVP:

1. Lee `guestId` desde URL.
2. Obtiene al invitado con `guestService.getGuestByGuestId(guestId,weddingId)`.
3. Si `guest.rsvpConfirmation` ya existe, se considera “submitted”.
4. Al enviar, construye `rsvpConfirmation` y hace:
   - `guestService.updateGuest(targetGuest.id, { rsvpStatus, rsvpConfirmation })`

Conclusión:

- En el flujo público actual, la confirmación se persiste en:
  - `guests/{docId}.rsvpConfirmation`
  - `guests/{docId}.rsvpStatus`

Riesgo:

- El admin de confirmaciones (`admin/confirmations`) lee la colección `rsvps`.
- Si producción hoy funciona con confirmaciones, hay dos posibilidades:
  - A) producción realmente sí escribe a `rsvps` por otro camino (no visto aquí), o
  - B) el panel de confirmaciones está desalineado con el flujo real.

Para la estrategia de `template-02`, esto importa por una razón: **no podemos romper el formulario RSVP**. El template nuevo debe reutilizar exactamente la misma lógica o invocar los mismos servicios de forma equivalente.

---

## 7) Sistema de “tema” vs “template” (diferencia conceptual)

### 7.1 Tema (`theme`)

El proyecto ya tiene un sistema robusto de **temas** (colores, fonts, gradientes, patrones) que se selecciona desde `WeddingData.theme`.

- `createWeddingTheme(weddingData)` mapea `theme.id` o `theme` string a un `WeddingTheme`.
- `ThemeProvider` aplica CSS variables al `document.head` y `body`.

Esto controla estilos globales, pero NO cambia la estructura del layout de secciones.

### 7.2 Template (nuevo requerimiento)

Lo que se pide ahora es un **template** que:

- Use las **mismas secciones y la misma data**.
- Mantenga funcionalidades.
- Pero cambie el **diseño / layout**.

En la implementación actual, el “template” real es el componente:

- `components/WeddingTemplate.tsx`

Por lo tanto, agregar `template-02` implica:

- Mantener `WeddingTemplate` como “entry” único, o introducir un selector dentro de `WeddingTemplate`.
- Crear un nuevo set de componentes o wrappers que rendericen lo mismo con otra presentación.

---

## 8) Estrategia para agregar `template-02` sin romper nada

### 8.1 Requisitos técnicos

- Selección por DB:
  - `weddings/{weddingId}.template = { id: 'template-02' }`
- Default:
  - Si falta `template` o `template.id` → usar `template-01`.
- Compatibilidad hacia atrás:
  - Las bodas existentes NO tienen `template`.
  - Deben renderizar igual que hoy.

### 8.2 Punto de integración recomendado

El lugar más seguro para seleccionar template es **en el componente que ya actúa como Template Root**:

- `components/WeddingTemplate.tsx`

Motivos:

- Ya tiene control de:
  - `ThemeProvider`
  - overlays
  - orden de secciones
  - música
  - lookup invitado
- No toca rutas.
- No toca la forma en que se cargan los datos.

### 8.3 Diseño propuesto: Template Registry + Selector

Definir un selector simple:

- `templateId = currentWedding.template?.id ?? 'template-01'`

Luego, tener un registro de templates:

- `template-01`: el layout existente (lo que hoy ya está)
- `template-02`: nuevo layout

Opciones de implementación:

#### Opción A (mínima, recomendada): mantener un “wrapper” único

- Mantener `WeddingTemplate` como componente principal.
- Dentro, reemplazar el bloque de secciones por algo así:
  - `const TemplateComponent = templates[templateId] ?? templates['template-01']`
  - `<TemplateComponent ... />`

Donde `TemplateComponent` renderiza:

- EXACTAMENTE las mismas secciones
- o las mismas secciones con wrappers diferentes

Ventajas:

- No se duplican hooks de guest/language/music.
- Un solo sitio controla overlays y player.

#### Opción B: templates como “skin” sobre secciones

- Mantener las secciones, pero que cada sección lea un `TemplateContext` (ej: clases, layout variants).
- Reduce duplicación pero exige refactor amplio en secciones.

Dado que hay producción y el requerimiento es “no romper”, **Opción A** es la más segura.

### 8.4 ¿Cómo hacer `template-02` sin duplicar lógica?

Regla: NO copiar/pegar lógica de negocio.

- La lógica de negocio (guest lookup, RSVP submission, translations, theme, assets) debe permanecer en:
  - `WeddingTemplate` (root)
  - secciones actuales

Para `template-02`:

- Reusar las mismas secciones cuando sea posible.
- Cambiar el diseño con:
  - wrappers
  - layout grid
  - spacing
  - fondos
  - componentes nuevos solo “presentacionales”

Ejemplo de estrategia práctica:

- `template-02` crea un nuevo componente root:
  - `components/templates/template-02/Template02.tsx`
- Ese componente internamente renderiza:
  - `<Hero />` etc.
  - pero con wrappers y contenedores diferentes.

Sin tocar:

- `RSVP.tsx`
- `InvitationOverlay.tsx`
- `guestService`
- `weddingApi`

### 8.5 Cambios de datos (DB) y typing

Agregar el campo de datos:

- Firestore (nuevo campo opcional):
  - `template: { id: 'template-02' }`

Typing (TypeScript):

- En `WeddingData` agregar opcional:
  - `template?: { id: 'template-01' | 'template-02' | string }`

Esto es retrocompatible: es opcional.

### 8.6 Admin editor (sin romper)

Actualmente el admin editor crea un `createInitialWeddingData` sin campo `template`.

Para soportar default:

- No es necesario escribir `template` para que el frontend use default.
- Opcionalmente, se puede agregar UI para seleccionar template.

Estrategia incremental:

1. Primero: soportar lectura y render por `template.id` (sin tocar admin).
2. Luego: agregar selector en admin (sin migrar datos existentes).

### 8.7 Checklist de “no romper producción”

- Mantener `app/[locale]/wedding/[id]/page.tsx` intacto.
- Mantener query param `?guest=` intacto.
- Mantener `guestService.getGuestByGuestId` intacto.
- Mantener persistencia RSVP en `guests.rsvpConfirmation` intacta (o, si se corrige, hacerlo compatible).
- Mantener orden de secciones y anchors (`id="rsvp"`, etc.) si hay deep links.
- Mantener APIs `/api/wedding-images/*` y `/api/wedding-music/*`.

---

## 9) Recomendación de implementación (pasos)

### Fase 1: Introducir soporte de template en runtime

- Actualizar `WeddingData` type para incluir `template?: { id: string }`.
- Agregar selector en `WeddingTemplate`:
  - `templateId = currentWedding.template?.id ?? 'template-01'`
- Implementar `Template01` (wrapper que renderiza exactamente lo actual).
- Mantener `WeddingTemplate` con overlays + music + guest lookup, y delegar el layout de secciones.

### Fase 2: Crear `template-02`

- Crear un nuevo root presentacional que:
  - use las mismas secciones
  - cambie wrappers/layout
  - si requiere estilos específicos, encapsular clases o usar nuevas utilidades CSS

### Fase 3: Admin selector (opcional)

- Agregar en el tab “Configuración” o similar:
  - selector `template-01 / template-02`
- Persistir en `weddings/{id}.template = { id: 'template-02' }`.

---

## 10) Riesgos y puntos a resolver antes de desplegar

- **RSVP dual storage** (`guests` vs `rsvps`):
  - Si el panel de confirmaciones es crítico en producción, hay que alinear fuentes.
  - Recomendación: documentar cuál es el source-of-truth real y, si se migra, hacerlo sin romper compatibilidad.

- **Reglas de Firestore**:
  - El código depende de queries públicas por `guestId`.
  - Asegurar que reglas permiten lo necesario (o mover lecturas/escrituras a API server con validación).

- **i18n + redirección por idioma**:
  - `WeddingTemplate` redirige si `guest.language` difiere.
  - `template-02` no debe duplicar esa lógica; debe seguir ocurriendo en el root.

- **Assets por weddingId**:
  - `template-02` debe consumir los mismos hooks (`useWeddingImages`, `useWeddingMusic`) o sus APIs.

---

## 11) Conclusión

- El proyecto ya tiene un sistema fuerte de “tema”.
- El nuevo requerimiento de “template” se debe implementar como **variantes de layout** controladas por `wedding.template.id`.
- El sitio más seguro para integrar el selector es el root `WeddingTemplate`.
- `template-01` debe ser el comportamiento actual.
- `template-02` debe ser puramente presentacional, reutilizando secciones y lógica para garantizar no romper producción.
