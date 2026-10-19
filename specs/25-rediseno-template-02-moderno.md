# 25 — Rediseño de template-02 "Moderno" (arquitectónico)

**Estado:** Approved
**Depende de:** SPEC 02 (rediseño template01/template02, origen de `sections-v2`) · sigue el patrón técnico de SPEC 19 (Template04)
**Fecha:** 2026-10-17

## Objetivo

Reescribir en su lugar `template-02` ("Moderno") para que replique exactamente el diseño aprobado en el canvas `https://claude.ai/artifact/RcKkGMWYGTYowuRhS7GKgu`, leyendo los mismos campos de `WeddingData` y guardando el RSVP con los mismos valores que hoy, de modo que cambiar una boda de `template-02` a cualquier otro template (y viceversa) siga siendo transparente.

## Contexto

Estado real del código, revisado en esta sesión (no asumido):

- `template-02` se arma en `components/templates/Template02.tsx` con 13 secciones de `components/sections-v2/*.tsx` + `ui.tsx` (tarjetas redondeadas `rounded-[22px]` sobre crema `#fbf7f1`, acento `#b79a7a`, Plus Jakarta Sans, anillos concéntricos y hoja de línea como ornamentos). Orden actual: Hero → Countdown → Location → About → Gallery → Timeline → DressCode → GiftRegistry → Accommodation → AdultOnlyEvent → RecommendedPlaces → RSVP → Footer.
- Countdown, About, Gallery y RSVP pintan patrones de fondo del selector de 10 temas vía `useThemePatterns().getBackgroundStyle(...)`.
- El template de una boda se elige solo por `wedding.template.id` en `components/WeddingTemplate.tsx`. Las herramientas de operador (`components/admin/OperatorTools.tsx` → `PATCH /api/admin/weddings/[weddingId]`) cambian únicamente `template.id`; ningún dato de la boda depende del template. Esa propiedad es la que este spec debe preservar.
- `InvitationOverlay.tsx` (bienvenida al invitado: `guest.name`, `guestCount`, `coupleMessage`, oculta el número de lugares si `selectedGuestTickets`) es **una sola** para los 4 templates y se monta desde `WeddingTemplate.tsx`.
- `MusicPlayer.tsx` es global: `WeddingTemplate.tsx` lo monta con `useWeddingMusic(...)`; guarda el `<audio>`, autoplay tras la primera interacción, `togglePlay` y dibuja su propio botón `fixed bottom-4 right-4`.
- RSVP en los 4 templates: `guestCount` es `z.enum(['1','2'])` cuando `selectedGuestTickets && showGuestsInput !== false`; `dietaryRestriction` es `z.enum(['vegetarian','glutenFree','other'])` requerido cuando `hasDiet`; el envío usa el thunk `submitRSVP`.
- Lo que el panel (`app/[locale]/admin/wedding-editor/[weddingId]/page.tsx`) edita, auditado en SPEC 19: sedes solo `name/address/mapsUrl`; un único `event.time`; `dressCode` solo `style/description`; hoteles y lugares recomendados solo `name/description/mapsUrl`; fotos vía `useWeddingImages` (no `gallery`/`couple.image`).
- Las fuentes de invitación se cargan con `@import` en `app/[locale]/invitation-fonts.css` (Plus Jakarta Sans ya está ahí).
- Los textos i18n de las secciones viven en namespaces compartidos por los 4 templates (`hero`, `location`, `rsvp`…, en `messages/es.json` y `messages/en.json`).
- No hay test runner; los scripts son `dev`, `build`, `start`, `lint`.

El diseño se validó primero en el canvas (8 pantallas: bienvenida, hero + cuenta regresiva, Nosotros + Dónde, Itinerario + Vestimenta + Galería, Regalos + Hospedaje + Lugares, Solo adultos + RSVP + Footer, RSVP enviado, escritorio hero + cuenta regresiva). En esta sesión se detectaron dos puntos del canvas que se salían del contrato de datos y se corrigen aquí (ver Decisiones): el RSVP con 1–4 personas y la opción de dieta "Ninguna".

## Alcance

**Incluye:**

- **Reescritura en su lugar de las 13 secciones de `components/sections-v2/`** (mismos nombres de archivo y de componente, mismo contrato: cada sección lee `useAppSelector(selectCurrentWedding)` sin props, excepto `HeroV2` que recibe `overlayVisible`), con el lenguaje visual del canvas:
  - Tokens fijos: piedra `#F2EFEA` (fondo), papel `#FBFAF7` (superficie), tinta `#1E1C19` (texto y bandas oscuras), grafito `#57524B` (texto secundario), filete `#D9D3C9`, bronce `#7A5A3C` (acento de texto), bronce claro `#B79A7A` (solo decorativo), bronce sobre tinta `#C9A882`, gris sobre tinta `#A49C91`, filete sobre tinta `#4A4640`, campo sobre tinta `#2A2723`.
  - Tipografía: display **Bricolage Grotesque** 300–500 con tracking negativo; texto **Plus Jakarta Sans** 400–600; sobretítulos 11 px, 600, tracking `.24em`, mayúsculas.
  - Forma: radios 0–8 px en superficies, píldoras solo en botones/chips; botones de 52–56 px; filetes de 1 px; ornamento único = dos anillos entrelazados (SVG).
  - Ritmo claro/oscuro: bandas tinta solo en Cuenta regresiva, tarjeta bancaria y RSVP.
- **Orden nuevo en `Template02.tsx`:** Hero → Cuenta regresiva → Nosotros → Dónde → Itinerario → Vestimenta → Galería → Regalos → Hospedaje → Lugares → Solo adultos → RSVP → Footer. Las secciones con número (Nosotros…RSVP) muestran `01`, `02`… **calculado sobre las secciones visibles** (si una boda no tiene hoteles, Lugares pasa a ser `07`, sin huecos).
- **Detalle por sección (réplica del canvas):**
  - `HeroV2` — móvil: foto 560 px (`useWeddingImages().heroImage`), arriba a la izquierda círculo de 44 px con iniciales `B·G` o `monogram.svg` si existe, arriba a la derecha el botón de música; sello de fecha circular (día + `MES · AA`) montado sobre el borde inferior de la foto; sobretítulo con anillos + "Nos casamos"; nombres en 72 px en dos líneas con `&` en bronce; lista Fecha / Hora (`event.time`) / Lugar (`ceremonyVenue.name`, con respaldo a `receptionVenue.name`; fila oculta si no hay ninguno); botón "Confirmar asistencia" (solo si `showConfirmCta !== false`) y botón "Agregar al calendario". Escritorio (≥1024 px): hero dividido 50/50 (foto | panel) con sello de 148 px, nombres a 128 px y la misma lista en 3 columnas. Se conservan las animaciones de entrada sincronizadas con `overlayVisible`.
  - `CountdownV2` — banda tinta, sobretítulo "Cuenta regresiva", titular "Cada día nos acerca al sí.", rejilla de 4 columnas con filetes (días/horas/min/seg, segundos en bronce), línea "Para el {fecha} a las {hora}", `role="timer"`. Estado "evento pasado" con el mismo estilo de banda. Escritorio: titular 5/12 + rejilla 7/12, números a 96 px.
  - `AboutV2` — encabezado numerado "Nosotros / Nuestra historia", comilla grande en bronce + `couple.quote` en display 28 px, foto de pareja (`useWeddingImages().coupleImage`) recortada en círculo de 300 px con dos anillos alrededor y la píldora del `couple.hashtag` (si existe), luego `couple.story`.
  - `LocationV2` — encabezado "Dónde", paradas A (ceremonia) y B (recepción) unidas por línea vertical, cada una con nombre, dirección y botón "Cómo llegar" (`mapsUrl`, mismo `openExternalLink`). **Si `ceremonyVenue.name` y `receptionVenue.name` coinciden** (comparación normalizada: trim + minúsculas, en el idioma activo) se muestra una sola parada "Ceremonia y recepción" con un solo botón y el titular alterno. Una sede vacía no se dibuja (como hoy).
  - `TimelineV2` — lista con filetes: hora en display 34 px, título + descripción, ícono en círculo de 40 px (mismo mapeo `getIcon` actual); el evento con `isHighlight` lleva hora en bronce y círculo relleno bronce.
  - `DressCodeV2` — sobretítulo numerado, `dressCode.style` en display 48 px con ilustración de línea (gancho + prenda) a la derecha, filete, `dressCode.description`. Mismos respaldos i18n que hoy si faltan.
  - `GalleryV2` — carrusel horizontal con `scroll-snap` (tarjetas de 286×400 en móvil que dejan asomar la siguiente), contador `01 / N`, barra de progreso, botones anterior/siguiente de 44 px y arrastre táctil; tarjeta con el hashtag y **botón copiar**. Misma fuente de fotos (`useWeddingImages().galleryImages`) y la sección se oculta sin fotos, como hoy.
  - `GiftRegistryV2` — encabezado "Mesa de regalos / Con cariño" + `message`; registros como filas con filete (nombre en display, descripción, círculo con flecha externa); `bankAccount` como **tarjeta tinta** con banco, titular, número de cuenta y CLABE (cada uno con botón "Copiar" → estado "Copiada" en bronce durante 2 s) y `description`. Misma lógica de `enabled` y de qué campos se muestran.
  - `AccommodationV2` — tarjetas papel con nombre, descripción y enlace "Ver ubicación" (`hotel.mapsUrl`, con respaldo a la búsqueda por nombre que existe hoy).
  - `RecommendedPlacesV2` — lista numerada `01…` con filetes: nombre, descripción, flecha; misma resolución de lugares (`recommendedPlaces.places` / `accommodation.recommendedPlaces`) y mismo `showRecommendedPlaces`.
  - `AdultOnlyEventV2` — tarjeta papel con círculo "+18" y el `message`; se renderiza **justo antes del RSVP**.
  - `RSVPV2` — banda tinta, titular "¿Nos acompañas?" y saludo con `guest.name` cuando hay invitado. Asistencia como dos tarjetas-radio ("Sí, ahí estaré" / "No podré ir"); número de personas como **dos píldoras-radio 1 y 2** (solo cuando `selectedGuestTickets && showGuestsInput !== false`, igual que hoy); dieta como **tres chips-radio Vegetariano / Sin gluten / Otro** sin preselección (solo con `hasDiet`, requerido como hoy); textarea de mensaje; botón "Enviar confirmación". **Mismo esquema zod, mismos valores y mismo `submitRSVP`** — solo cambian los controles (inputs `radio` reales con `label`). Estados de carga, error y "ya confirmado" con el nuevo estilo.
  - Estado **"RSVP enviado"** (dentro de `RSVPV2`): círculo bronce con check, "¡Recibimos tu confirmación!", texto con fecha y sede existentes, resumen Asistentes / Alimentación (cada celda solo si ese dato aplica), botón "Agregar al calendario" y enlace "Ver cómo llegar" (`#location`). Si declinó: el texto actual de "lamentamos…", sin botón de calendario.
  - `FooterV2` — anillos + `couple.quote`, dos columnas (novia | novio) con "Llamar" (`tel:` del teléfono) e Instagram/Facebook respetando `hasInstagram`/`hasFacebook`, iniciales grandes "B & G", hashtag · fecha, línea de copyright (texto i18n actual).
- **Bienvenida (overlay) solo para template-02:** `InvitationOverlay.tsx` conserva toda su lógica de datos (invitado de Firebase, invitado demo, `allowedGuests`, `specialMessage`, `selectedGuestTickets`) y recibe una prop nueva `templateId`; cuando es `'template-02'` delega el render a `components/sections-v2/InvitationOverlayV2.tsx` (fondo tinta, anillos, "Una invitación para", nombre del invitado en display 52 px, píldora "Hemos reservado N lugares", mensaje de los novios, botón "Abrir invitación", nombres y fecha arriba). Los demás templates siguen viendo el overlay actual sin cambios.
- **Botón de música integrado en el hero de 02:** el audio, el autoplay, la canción demo y `togglePlay` siguen dentro de `MusicPlayer.tsx`; se expone su estado (`isPlaying`, `toggle`, `available`) por un contexto nuevo (`components/MusicControlContext.tsx`) que `WeddingTemplate.tsx` provee alrededor del template y del reproductor. Para `template-02`, `MusicPlayer` no dibuja su botón flotante y `HeroV2` dibuja el botón de 44 px (arriba a la derecha); al salir del hero ese mismo botón pasa a `position: fixed` arriba a la derecha con fondo sólido. `aria-label` "Pausar música" / "Reproducir música". Los templates 01/03/04 conservan el botón flotante actual.
- **Barra fija "Confirmar":** píldora inferior (nombres + "7 nov · faltan N días" + botón "Confirmar" → `#rsvp`) que aparece al salir del hero y se oculta cuando la sección RSVP está en pantalla; respeta `showConfirmCta !== false`. En escritorio, centrada con ancho máx. 520 px.
- **"Agregar al calendario":** `lib/calendar.ts` genera un `.ics` (VEVENT) con título i18n "Boda de {novia} & {novio}", inicio = el mismo instante que usa la cuenta regresiva (`new Date(event.date)`), fin = inicio + 6 h fijas, ubicación = nombre + dirección de la sede de recepción (respaldo: ceremonia), y se descarga como Blob. Lo usan el hero y el estado "RSVP enviado".
- **Barra de navegación de escritorio** (`components/sections-v2/DesktopNavV2.tsx`, solo ≥1024 px, no fija): anillos + nombres a la izquierda, anclas numeradas a las secciones **visibles** y botón "Confirmar asistencia" (si `showConfirmCta !== false`). En móvil no existe.
- **Escritorio del resto de secciones (derivado del móvil, sin maquetas nuevas):** <768 px = diseño móvil con márgenes de 24 px; ≥768 px = contenedor máx. 1200 px con márgenes de 48 px; ≥1024 px = encabezado de sección (número, sobretítulo, titular) en la columna izquierda 5/12 y contenido en 7/12; tarjetas de hospedaje y paradas de "Dónde" en 2 columnas; galería con tarjetas de 360×500; RSVP con el formulario en 7/12. Mismos tokens y tipografía.
- **Fuente:** agregar Bricolage Grotesque (`opsz,wght@12..96,300;400;500`) a `app/[locale]/invitation-fonts.css`, mismo mecanismo que las fuentes actuales.
- **i18n:** namespace nuevo `template02` en `messages/es.json` y `messages/en.json` con todos los textos nuevos del diseño (titulares, sobretítulos, botones, estados, título del .ics). Los namespaces compartidos no se modifican, para no cambiar textos de 01/03/04.
- **Mock `template-02-demo`** (`src/data/mockData.ts`): completar solo con campos que el panel edita — `giftRegistry.bankAccount` (banco, titular, cuenta, CLABE, descripción), un segundo registro (Liverpool), `adultOnlyEvent: { enabled: true, message }`, `recommendedPlaces` (3 lugares con `name/description/mapsUrl`), `showRecommendedPlaces: true`, `selectedGuestTickets: true`, `hasDiet: true`, `showConfirmCta: true`, y `mapsUrl` en ambas sedes y en el hotel (que hoy no lo tienen). Se quitan del mock los campos que el panel no escribe (`distance/price/phone/amenities` del hotel, `coordinates/description/features` de sedes cuando no sean exigidos por el tipo; donde el tipo los exige, valor vacío), igual que se hizo con `template-04-demo`.

**No incluye:**

- Ningún campo nuevo, renombrado o con valores nuevos en `WeddingData`, `FirebaseGuest`, `FirebaseRSVP` ni en Firestore. `src/types/wedding.ts` no se toca.
- Cambios visuales o de comportamiento en `template-01`, `template-03` o `template-04` (incluidos su overlay de bienvenida, su botón de música y sus textos i18n).
- Ampliar el RSVP a más de 2 personas o agregar la opción de dieta "Ninguna" (se descartaron por romper la transparencia entre templates).
- Conectar template-02 al selector de 10 temas: deja de usar `getBackgroundStyle`; `theme.id` se queda en los datos sin efecto en 02.
- Lightbox de galería a pantalla completa (no está dibujado en el canvas).
- Maquetas nuevas en el canvas para el escritorio de las secciones restantes.
- Cambios al panel de administración, a `OperatorTools` o a las rutas de API.
- Cambios a las capturas/imágenes de marketing de `/disenos/moderno` (pueden quedar desactualizadas; ver Riesgos).

## Modelo de datos

No aplica. Este spec no introduce ni modifica estructuras persistidas: todas las secciones leen los campos que ya leen hoy los 4 templates, y el RSVP guarda exactamente el mismo objeto (`attending`, `guestCount` ∈ {1,2} o el del invitado, `dietaryRestriction` ∈ {`vegetarian`,`glutenFree`,`other`}, `message`) por el mismo `submitRSVP`.

Estructuras nuevas solo de UI/código (no persistidas):

```ts
// components/MusicControlContext.tsx
interface MusicControl {
  available: boolean;   // hay música configurada y el <audio> existe
  isPlaying: boolean;
  toggle: () => void;   // delega en el togglePlay de MusicPlayer
}

// components/sections-v2/sections.ts — una sola fuente para numeración y nav de escritorio
type V2SectionKey =
  | 'about' | 'location' | 'timeline' | 'dresscode' | 'gallery'
  | 'gifts' | 'accommodation' | 'places' | 'rsvp';
function getVisibleSectionsV2(wedding: WeddingData, galleryCount: number):
  { key: V2SectionKey; number: string /* '01'… */; anchorId: string }[];

// lib/calendar.ts
function buildWeddingIcs(wedding: WeddingData, locale: 'es' | 'en'): string;
function downloadIcs(filename: string, ics: string): void;
```

`getVisibleSectionsV2` replica exactamente las condiciones de visibilidad que ya aplica cada sección (p. ej. Galería sin fotos, Regalos con `enabled === false`, Lugares con `showRecommendedPlaces === false`), para que número y nav nunca apunten a una sección oculta.

## Plan de implementación

Cada paso deja la app compilando; mientras dure el trabajo, template-02 puede verse mezclado (secciones nuevas y viejas), lo cual es aceptable porque se entrega en un solo despliegue.

1. **Fuente y tokens.** Agregar Bricolage Grotesque a `app/[locale]/invitation-fonts.css`. Reescribir `components/sections-v2/ui.tsx`: constantes `V2_COLORS`/`V2_FONTS`, `V2Section` (fondo piedra/papel/tinta por prop, sin patrones de tema), `V2Container` (24 px móvil, máx. 1200 px escritorio), `V2SectionHeading` (número + sobretítulo + titular, variante clara/oscura, layout 5/12 en ≥1024 px), `V2Rings` (anillos entrelazados), `V2Button` (primario tinta, secundario contorno, variantes sobre tinta), `V2CopyButton` (copiar → "Copiada" 2 s), y se conservan `V2Reveal`/`V2Stagger` respetando `prefers-reduced-motion`. Prueba: `npm run build`.
2. **i18n.** Agregar el namespace `template02` a `messages/es.json` y `messages/en.json` con todos los textos nuevos. Prueba: build.
3. **Utilidades.** Crear `lib/calendar.ts` (`buildWeddingIcs`, `downloadIcs`) y `components/sections-v2/sections.ts` (`getVisibleSectionsV2`).
4. **Música.** Crear `components/MusicControlContext.tsx`; `MusicPlayer.tsx` publica `isPlaying`/`toggle` en el contexto y acepta `showFloatingButton` (default `true`). En `WeddingTemplate.tsx`, envolver template + reproductor en el provider y pasar `showFloatingButton={templateId !== 'template-02'}`. Prueba: en 01/03/04 el botón flotante funciona igual que antes.
5. **Overlay.** Crear `components/sections-v2/InvitationOverlayV2.tsx` (solo vista, recibe los valores ya resueltos y `onClose`); `InvitationOverlay.tsx` recibe `templateId` y delega cuando es `'template-02'`; `WeddingTemplate.tsx` pasa `templateId` en ambos usos (invitado real y demo).
6. **Hero.** Reescribir `HeroV2.tsx` (móvil y escritorio, sello de fecha, monograma o iniciales, botón de música con el contexto y su versión fija al salir del hero, CTA confirmar, botón calendario).
7. **Cuenta regresiva.** Reescribir `CountdownV2.tsx` (banda tinta, rejilla, estado pasado, escritorio 5/7).
8. **Nosotros y Dónde.** Reescribir `AboutV2.tsx` y `LocationV2.tsx` (paradas A/B, regla de sede única).
9. **Itinerario, Vestimenta y Galería.** Reescribir `TimelineV2.tsx`, `DressCodeV2.tsx` y `GalleryV2.tsx` (carrusel scroll-snap, contador, progreso, copiar hashtag).
10. **Regalos, Hospedaje, Lugares y Solo adultos.** Reescribir `GiftRegistryV2.tsx` (tarjeta bancaria con copiar), `AccommodationV2.tsx`, `RecommendedPlacesV2.tsx` y `AdultOnlyEventV2.tsx`.
11. **RSVP.** Reescribir el marcado de `RSVPV2.tsx` con tarjetas/píldoras/chips radio sin tocar el esquema zod, `onSubmit` ni `submitRSVP`; nuevo estado "RSVP enviado" con resumen, calendario y "Ver cómo llegar".
12. **Footer.** Reescribir `FooterV2.tsx`.
13. **Ensamblado.** Reescribir `Template02.tsx`: nuevo orden, números desde `getVisibleSectionsV2`, `DesktopNavV2` arriba (≥1024 px), `StickyConfirmBarV2` (nuevo archivo en `sections-v2/`, `IntersectionObserver` sobre `#hero` y `#rsvp`).
14. **Mock.** Completar y recortar `mockWeddingTemplate02Demo` en `src/data/mockData.ts` según Alcance.
15. **Limpieza.** Borrar de `sections-v2/ui.tsx` lo que quede sin uso (`V2LeafAccent`, `V2Divider`, `V2Card` viejos) y confirmar que ningún archivo de `sections-v2` importa `useThemePatterns`.
16. **QA manual.** `npm run lint` y `npm run build`. Recorrer `/es/wedding/template-02-demo` y `/en/wedding/template-02-demo` a 390 px, 768 px y 1440 px contra cada pantalla del canvas; con `?guest=` de un invitado real de Firebase de prueba (si hay) o el overlay demo; enviar un RSVP mock con y sin `selectedGuestTickets`/`hasDiet`; descargar el `.ics`; probar música (autoplay tras interacción, pausa desde el hero y desde el botón fijo). **Prueba de transparencia:** en local cambiar temporalmente `template.id` de `template-02-demo` a `template-01/03/04` y el de `template-04-demo` a `template-02`, y comprobar que todas las secciones con datos se ven en ambos sentidos; revertir esos cambios temporales.

## Criterios de aceptación

- [ ] `git diff` no muestra cambios en `src/types/wedding.ts`, en las rutas `app/api/**`, en `components/admin/**` ni en `components/sections/`, `sections-v3/`, `sections-v4/`, `Template01/03/04.tsx`.
- [ ] `npm run build` y `npm run lint` terminan sin errores nuevos respecto al estado previo.
- [ ] `Template02.tsx` renderiza el orden Hero → Cuenta regresiva → Nosotros → Dónde → Itinerario → Vestimenta → Galería → Regalos → Hospedaje → Lugares → Solo adultos → RSVP → Footer.
- [ ] Los números de sección son consecutivos sobre las secciones visibles (verificado quitando hoteles en el mock local: Lugares pasa a `07`) y la nav de escritorio solo enlaza secciones visibles.
- [ ] A 390 px, cada sección de `/es/wedding/template-02-demo` coincide con su pantalla del canvas en colores, tipografía (Bricolage Grotesque en display, Plus Jakarta Sans en texto), jerarquía, espaciado y ornamentos, con dos excepciones documentadas: RSVP con píldoras 1/2 y dieta sin "Ninguna".
- [ ] A 1440 px, el hero y la cuenta regresiva coinciden con la pantalla de escritorio del canvas (más el botón de música) y el resto de secciones sigue la regla 5/12 + 7/12 con contenedor de máx. 1200 px; a 768 px no hay scroll horizontal.
- [ ] Ningún archivo de `components/sections-v2/` importa `useThemePatterns` ni lee `theme`.
- [ ] Con `?guest=` (o el overlay demo), template-02 muestra la bienvenida nueva con nombre del invitado, "Hemos reservado N lugares" (oculto si `selectedGuestTickets`) y mensaje de los novios; con template-01/03/04 se ve el overlay anterior sin cambios.
- [ ] En template-02 no aparece el botón flotante inferior de `MusicPlayer`; el botón del hero pausa/reproduce la misma canción demo, y al bajar del hero el control sigue disponible fijo arriba a la derecha. En 01/03/04 el botón flotante sigue igual.
- [ ] La barra "Confirmar" aparece al salir del hero, se oculta con el RSVP en pantalla, lleva a `#rsvp`, y no existe cuando `showConfirmCta === false`.
- [ ] "Agregar al calendario" (hero y estado enviado) descarga un `.ics` válido que abre en Google Calendar / Calendario de iOS con título, fecha/hora iguales a la cuenta regresiva y la sede.
- [ ] Si ambas sedes tienen el mismo nombre, "Dónde" muestra una sola parada con un solo botón.
- [ ] Copiar hashtag, número de cuenta y CLABE pone el valor en el portapapeles y muestra "Copiada" ~2 s.
- [ ] El RSVP envía por `submitRSVP` un objeto con las mismas claves y valores posibles que antes (`guestCount` ∈ {1,2}, `dietaryRestriction` ∈ {`vegetarian`,`glutenFree`,`other`}); las validaciones requeridas siguen dependiendo de `selectedGuestTickets`/`showGuestsInput`/`hasDiet` exactamente como hoy.
- [ ] Prueba de transparencia (paso 16) superada: la misma boda se ve completa con `template.id` 02 ↔ 01/03/04 sin tocar ningún dato.
- [ ] Todos los controles son elementos semánticos (`button`, `a`, `input type=radio` + `label`, `textarea` + `label`), los botones de solo ícono tienen `aria-label`, los objetivos táctiles miden ≥44 px y el texto cumple 4.5:1 (grafito y bronce sobre piedra, `#A49C91`/`#C9A882` sobre tinta).
- [ ] Las animaciones respetan `prefers-reduced-motion`.
- [ ] El mock `template-02-demo` muestra todas las secciones (incluidas tarjeta bancaria, solo adultos y lugares) y no contiene campos que el panel no pueda escribir, salvo los exigidos por el tipo con valor vacío.

## Decisiones tomadas y descartadas

- **Reescribir `sections-v2` en su lugar, no crear un `template-05`.** Decisión explícita del usuario ("modifiquemos el template 02"). Consecuencia aceptada: todas las bodas que ya usan template-02 cambian de look al desplegar, sin migración porque no hay datos que migrar.
- **Transparencia entre templates como restricción dura.** Ningún dato nuevo ni valor nuevo; por eso se corrigieron dos puntos del canvas:
  - *RSVP 1–4 personas → se mantiene 1 o 2.* Todos los templates validan `guestCount` como `'1' | '2'`; abrirlo solo en 02 haría que el mismo invitado pudiera confirmar distinto según el template. Decisión explícita del usuario.
  - *Dieta "Ninguna" → se quita.* El enum actual es `vegetarian | glutenFree | other`; un valor `none` sería un dato nuevo que los paneles y los otros templates no entienden. Decisión explícita del usuario.
- **Overlay de bienvenida: variante solo para 02, sin duplicar lógica.** `InvitationOverlay` sigue resolviendo los datos del invitado (real o demo) y solo delega el render. Descartado: rediseñarlo para todos (cambiaría el look de 01/03/04) o no tocarlo (el diseño lo incluye). Decisión explícita del usuario.
- **Música integrada en el hero de 02, conservando la funcionalidad actual.** Decisión explícita del usuario. El audio y el autoplay siguen en `MusicPlayer`; solo se expone su control por contexto para no tener dos `<audio>`. Fuera del hero el botón queda fijo arriba a la derecha (descartado: dentro de la barra Confirmar, porque desaparecería con `showConfirmCta === false`).
- **Barra de navegación de escritorio: sí, solo ≥1024 px.** Decisión explícita del usuario, revirtiendo para este template el criterio de SPEC 19 (que la descartó en template-04). Se limita a anclas a secciones visibles y al CTA existente: no muestra ningún dato nuevo.
- **Mejoras de UX incluidas:** "Agregar al calendario", barra fija "Confirmar", sede única = una parada, copiar hashtag. Decisión explícita del usuario; todas usan datos existentes.
- **Paleta fija, sin patrones del tema.** Mismo criterio que template-03/04; decisión explícita del usuario. `theme.id` sigue en los datos, sin efecto en 02.
- **Orden de secciones del canvas.** Decisión explícita del usuario: lo logístico (Dónde, Itinerario, Vestimenta) va junto, la galería funciona como pausa antes de Regalos, y "Solo adultos" queda junto al RSVP, donde afecta la decisión.
- **Escritorio derivado del móvil con reglas en este spec, sin maquetas nuevas.** Decisión explícita del usuario; solo el hero y la cuenta regresiva tienen pantalla de escritorio en el canvas.
- **Numeración dinámica sobre secciones visibles**, con una sola función (`getVisibleSectionsV2`) para números y nav, en vez de números fijos con huecos (p. ej. saltar de 06 a 08 cuando no hay hoteles).
- **Textos nuevos en un namespace `template02`**, no editando los namespaces compartidos, para no cambiar los títulos de 01/03/04.
- **`.ics` con el mismo instante que la cuenta regresiva y 6 h de duración fija.** Coherente con lo que ya muestra la invitación; `ceremony/reception.duration` no se usa porque el panel no los edita.
- **Sin lightbox de galería.** Se mencionó en las notas del canvas pero no está dibujado; se deja fuera para que la implementación sea exactamente lo diseñado.
- **Completar el mock `template-02-demo`.** Decisión explícita del usuario, para que la demo pública muestre el diseño completo y se pueda verificar cada sección; solo con campos que el panel edita.
- **Bricolage Grotesque cargada igual que las demás fuentes de invitación** (`@import` en `invitation-fonts.css`), no con `next/font`, para seguir el mecanismo existente de las plantillas.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Todas las bodas reales con template-02 cambian de look al desplegar, incluidas algunas a pocos días del evento. | Revisar en Firestore cuántas bodas activas usan `template-02` antes de desplegar y avisar a esas parejas; el cambio no toca sus datos, así que un rollback del despliegue las devuelve al diseño anterior. |
| `event.date` se guarda como ISO en UTC; el `.ics` y la cuenta regresiva usan ese mismo instante, que puede no coincidir con la hora local escrita en `event.time`. | Se mantiene la misma interpretación que la cuenta regresiva actual (no empeora nada); se verifica con el mock en el paso 16. Corregir zonas horarias es otro spec. |
| El contexto de música depende de que `MusicPlayer` siga montado junto al template; un cambio futuro en `WeddingTemplate.tsx` podría dejar el botón del hero sin control. | `available: false` oculta el botón cuando no hay reproductor; el criterio de aceptación de música se revisa en el paso 16. |
| Bricolage Grotesque añade una descarga de fuente más a todas las invitaciones (el `@import` es global a `[locale]`). | Cargar solo los pesos 300/400/500 con `display=swap`; aceptado, igual que las fuentes de los otros templates. |
| `getVisibleSectionsV2` puede desincronizarse de las condiciones reales de cada sección y numerar o enlazar una sección oculta. | Las secciones usan las mismas condiciones (o la misma función) para decidir si renderizan; el criterio de numeración se verifica quitando hoteles en local. |
| Las capturas de marketing de `/disenos/moderno` y de la landing mostrarán el diseño anterior. | Fuera de alcance; se anota para un spec de marketing posterior. |
