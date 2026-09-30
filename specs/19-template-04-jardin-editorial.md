# 19 — Template04: Jardín Editorial

**Estado:** Approved
**Depende de:** Ninguno (sigue el patrón técnico de SPEC 01 — Template03)
**Fecha:** 2026-09-30

## Objetivo

Implementar `template-04`, un cuarto template de invitación opcional que replica visualmente el diseño de referencia "Jardín Editorial" (verde oliva oscuro + papel crema, tipografía Georgia, numerales romanos I–XI, fotos con marco en arco y nav inferior fijo, validado en un canvas de diseño aprobado), con paridad de las 13 secciones existentes pero reordenadas para igualar la referencia, y una boda mock nueva (`template-04-demo`) que lo use.

## Contexto

El proyecto ya tiene tres templates seleccionables vía `wedding.template.id`: `template-01` (`components/sections/*.tsx`, fallback por defecto), `template-02` (`components/sections-v2/*.tsx`) y `template-03` "Botánica Editorial" (`components/sections-v3/*.tsx`, ver SPEC 01). Se proporcionó una invitación de referencia real (capturas de pantalla de un sitio de terceros) con un lenguaje visual distinto: fondo crema/verde oliva oscuro, tipografía Georgia, numerales romanos como motivo de sección, fotos con marco en arco, y una barra de navegación inferior fija ("Inicio / Confirmar / Índice"). Ese diseño se validó primero en un canvas de diseño (claude.ai Artifact, `https://claude.ai/artifact/GdYb13yefXQCdX9QQTmbhB`) aplicado a nuestras 13 secciones y datos de una boda mock, y ahora se lleva a código como un cuarto template, sin tocar los tres existentes.

## Alcance

**Incluye:**
- Un nuevo `components/templates/Template04.tsx` con las 13 secciones (Hero, About, Countdown, Gallery, Location, Timeline, DressCode, GiftRegistry, Accommodation, AdultOnlyEvent, RecommendedPlaces, RSVP, Footer) **en este orden** — nótese que difiere del orden usado en `Template01`/`Template02`/`Template03` (que ponen Countdown y Location antes de About); este template pone primero "Nuestra historia" para igualar la referencia. Seleccionable vía `wedding.template.id === 'template-04'`.
- Componentes nuevos en `components/sections-v4/*.tsx` (uno por sección) más un `ui.tsx` con helpers visuales compartidos: `V4Reveal` (framer-motion `whileInView`, mismo patrón que `V2Reveal`/`V3Reveal`), `V4SectionHeading` (numeral romano + divisor con rombo + eyebrow, reutilizado en las secciones II a XI), y las constantes de paleta/tipografía compartidas.
- Cada sección lee exclusivamente campos de `WeddingData` que el panel de administración (`app/[locale]/admin/wedding-editor/[weddingId]/page.tsx`) ya gestiona para los templates 1-3 (pareja, `story`/`quote`, `event.*`, `accommodation`, `giftRegistry`, `adultOnlyEvent`, `rsvp`, `recommendedPlaces`, `music`, flags `hasDiet`/`hasInstagram`/etc.) — sin inventar campos nuevos ni textos que no vengan de un dato gestionable. Las fotos (Hero, About, Gallery) se resuelven con el mismo mecanismo que usan `sections-v2`/`sections-v3` (hook `useWeddingImages`, carpeta `public/assets/wedding-images/<id>/` con fallback de stock ya integrado en el propio hook) — no vía `weddingData.gallery`/`heroImage.url`/`couple.image` hardcodeados, que el dashboard no escribe para una boda real.
- Paleta de color fija del canvas (papel `#F4EFE3`, papel alterno `#EFE7D4`, tinta/verde oliva oscuro `#2E3323`, acento terracota `#B0714A`, dorado apagado `#C9A98C`/`#B7AD90` para divisores, texto secundario `#8B8F7E`), independiente del selector de 10 temas — no conectada a `lib/themes.ts` (mismo patrón que `template-03`).
- Tipografía única: Georgia (stack `Georgia, 'Times New Roman', serif`), usada tanto para titulares/cuerpo como para los eyebrows en mayúsculas espaciadas — sin cargar fuentes de Google Fonts nuevas (a diferencia de `template-03`, que sí usa una fuente web).
- Animaciones con `framer-motion` (`whileInView`, variantes escalonadas), mismo patrón que `sections-v2`/`sections-v3`, no `IntersectionObserver` manual.
- `HeroV4` con foto de fondo full-bleed (`weddingData.heroImage.url`), overlay degradado para legibilidad, marco en arco (borde CSS inset con esquinas superiores redondeadas), nombres apilados con "y" en itálica entre ellos, ubicación, fecha, indicador "Desliza".
- `AboutV4` ("I — Nuestra historia"): cita/historia desde `couple.story[locale]` con estilos mixtos (mayúsculas espaciadas + itálica) y foto en arco desde `couple.image` (fallback: `gallery[0].url`).
- `GiftRegistryV4`, `AccommodationV4`, `AdultOnlyEventV4` y `RecommendedPlacesV4` con **diseño visual propio** (no un re-skin de `sections-v2`/`sections-v3`, a diferencia de cómo se resolvió en `template-03`), manteniendo el mismo contrato de datos y la misma lógica de `enabled` que sus equivalentes.
- `RSVPV4` conectado al thunk real `submitRSVP` (mismo flujo que `RSVP.tsx`/`RSVPV2.tsx`/`RSVPV3.tsx`), no un formulario cosmético.
- Una boda mock nueva (`template-04-demo`, Renata & Joaquín, 14 nov 2026, Jardín Casa Fresno - Valle de Bravo, México) registrada en `src/data/mockData.ts`, con `template: { id: 'template-04' }`, todas las secciones opcionales habilitadas, y reutilizando assets ya existentes en `/public/assets/wedding-images/friends-test/` (`hero.jpg` para `heroImage`/`couple.image`, `gallery/image1-7` para la galería) en vez de generar imágenes nuevas.
- Actualización de `components/WeddingTemplate.tsx`: switch de 4 vías para elegir template, y alta de `'template-04-demo'` en la lista que activa el overlay de demostración.
- Entrada documentada en `README.md` para la nueva boda de prueba, siguiendo el formato existente.

**No incluye:**
- No se reemplaza ni modifica `template-01`, `template-02` ni `template-03`.
- No se conecta el nuevo template al selector de 10 temas (`lib/themes.ts`); queda con paleta fija.
- No se crea un documento real en Firebase con `template.id: 'template-04'` — la ruta Firebase se deja lista en código (mismo switch, agnóstico al origen de los datos) pero no se prueba contra un documento real.
- No se agrega ningún campo nuevo a `WeddingData` (p. ej. no se crea un campo `couple.parents`): la sección "Con la bendición de Dios... padres de los novios" que aparece en la invitación de referencia **se omite** — no existe en nuestro modelo de datos y no forma parte de las 13 secciones que mantienen paridad en los demás templates.
- No se agregan invitados de demo (`mockInvitations.ts`) para la boda nueva; el overlay de invitado personalizado sigue dependiendo de Firebase como hoy.
- No se rediseña `GiftRegistry`/`Accommodation`/`AdultOnlyEvent`/`RecommendedPlaces` en `template-01/02/03`; el rediseño es exclusivo de `sections-v4`.
- No se agrega ninguna barra de navegación ni overlay de índice: ningún otro template la tiene y no corresponde a ningún dato gestionable desde el dashboard; se descartó tras la primera iteración (ver Decisiones).
- No se hardcodea un array de galería propio para la boda mock: se deja `gallery: []` para igualar el comportamiento real (el dashboard no gestiona ese campo).

## Datos

No se introducen campos nuevos en `WeddingData` (`template?: { id: string }` ya existe en `src/types/wedding.ts`). Se añade una nueva instancia concreta:

```ts
// src/data/mockData.ts
export const mockWeddingTemplate04Demo: WeddingData = {
  id: 'template-04-demo',
  couple: {
    bride: { name: 'Renata', fullName: 'Renata Ibarra Solís', ... },
    groom: { name: 'Joaquín', fullName: 'Joaquín Medina Paredes', ... },
    story: { es: 'Un nuevo comienzo, lejos de prisas pero cerca de quienes amamos.', en: '...' },
    quote: { es: '...', en: '...' },
    ...
  },
  event: {
    weddingId: 'template-04-demo',
    date: '2026-11-14T17:00:00.000Z',
    time: '17:00',
    ceremonyVenue: { name: { es: 'Jardín Casa Fresno', en: 'Casa Fresno Garden' }, address: 'Camino a San Gaspar 45, Valle de Bravo, Edo. México', ... },
    receptionVenue: { name: { es: 'Jardín Casa Fresno', en: 'Casa Fresno Garden' }, ... },
    dressCode: { style: { es: 'Formal de jardín', en: 'Garden formal' }, ... },
  },
  heroImage: { url: '/assets/wedding-images/template-04-demo/hero.jpg', alt: 'Renata y Joaquín' }, // requerido por el tipo; HeroV4/AboutV4 igual resuelven la foto vía useWeddingImages()
  timeline: [ /* Ceremonia 17:00, Cóctel 18:00, Recepción 19:30, Fiesta 21:00 */ ],
  gallery: [], // el dashboard no gestiona este campo; GalleryV4 resuelve vía useWeddingImages() como V2/V3
  giftRegistry: { enabled: true, ... },
  adultOnlyEvent: { enabled: true, ... },
  recommendedPlaces: { enabled: true, ... },
  rsvp: { enabled: true, ... },
  theme: { id: 'classic' }, // no se usa para color, se mantiene por compatibilidad de tipo
  template: { id: 'template-04' },
  status: 'draft',
  languages: ['es', 'en'],
  defaultLanguage: 'es',
  isActive: true,
  ...
};
```

Se registra en el mapa existente:

```ts
export const mockWeddings: Record<string, WeddingData> = {
  ...,
  'template-04-demo': mockWeddingTemplate04Demo,
};
```

Contrato de los componentes `sections-v4/*V4.tsx`: mismo patrón que `sections-v2`/`sections-v3` — cada sección lee `useAppSelector(selectCurrentWedding)` directamente (sin props), excepto `HeroV4`, que recibe `overlayVisible: boolean` igual que `Hero`/`HeroV2`/`HeroV3`.

## Plan de implementación

1. Crear `components/sections-v4/ui.tsx`: `V4Reveal` (framer-motion `whileInView`), `V4SectionHeading` (numeral romano + divisor con rombo + eyebrow — recibe `numeral: string` y `label: string`, usado por las secciones II a XI), constantes de paleta y tipografía (`V4_COLORS`, `font-family: Georgia`). No afecta nada visible aún.
2. Crear `HeroV4.tsx`: foto de fondo full-bleed vía `weddingData.heroImage.url`, overlay degradado, marco en arco (borde CSS), nombres apilados con "y" en itálica, ubicación, fecha, "Desliza". Aún no se monta en ningún Template.
3. Crear `AboutV4.tsx` ("I — Nuestra historia"): `V4SectionHeading`, cita desde `couple.story[locale]` con spans de estilo mixto, foto en arco (`border-radius` asimétrico) desde `couple.image` con fallback a `gallery[0].url`.
4. Crear `CountdownV4.tsx` ("II — Nuestra boda"): cuenta regresiva en vivo desde `event.date`/`event.time`, banda oscura.
5. Crear `GalleryV4.tsx` ("III — Galería"): grid 2 columnas (primera celda `grid-row: span 2`) sobre `weddingData.gallery`, reutilizando `useWeddingImages` como `GalleryV2`/`GalleryV3`.
6. Crear `LocationV4.tsx` ("IV — La celebración"): fecha, venue, dirección en itálica, bloques Ceremonia/Recepción con hora grande, botón "Abrir en Maps" (`mapsUrl`).
7. Crear `TimelineV4.tsx` ("V — El plan del día"): itinerario vertical con línea conectora e íconos por punto, sobre `weddingData.timeline`.
8. Crear `DressCodeV4.tsx` ("VI — Código de vestimenta"): estilo, descripción, "Evitamos"/"Debe tener" desde `event.dressCode`.
9. Crear `GiftRegistryV4.tsx` ("VII — Mesa de regalos"): diseño propio (banda oscura, tarjeta de depósito bancario, tarjetas de registro), mismo contrato de datos (`enabled`, `message`, `registries`, `bankAccount`) que `GiftRegistry`/`GiftRegistryV2`/`GiftRegistryV3`.
10. Crear `AccommodationV4.tsx` ("VIII — Dónde hospedarse"): diseño propio (lista de tarjetas de hotel), mismo contrato que `accommodation.hotels`.
11. Crear `AdultOnlyEventV4.tsx` ("IX — Evento solo adultos"): diseño propio (banner enmarcado con ícono), mismo contrato (`enabled`, `message`).
12. Crear `RecommendedPlacesV4.tsx` ("X — Lugares recomendados"): diseño propio (lista agrupada por categoría), mismo contrato que `RecommendedPlacesConfig`.
13. Crear `RSVPV4.tsx` ("XI — Confirma tu asistencia"): toggle sí/no, stepper de acompañantes, mensaje opcional, conectado al thunk real `submitRSVP`.
14. Crear `FooterV4.tsx`: monograma, agradecimiento, hashtag, crédito.
15. Crear `components/templates/Template04.tsx` ensamblando las 13 secciones en el orden Hero→About→Countdown→Gallery→Location→Timeline→DressCode→GiftRegistry→Accommodation→AdultOnlyEvent→RecommendedPlaces→RSVP→Footer, con prop `overlayVisible`. Sin chrome adicional (sin barra de navegación ni overlay de índice).
16. Editar `components/WeddingTemplate.tsx`: extender la selección de template a 4 vías (`'template-04'` → `Template04`, `'template-03'` → `Template03`, `'template-02'` → `Template02`, cualquier otro valor/`undefined` → `Template01`) y añadir `'template-04-demo'` a la lista `isMockData` que activa el overlay de demostración.
17. Editar `src/data/mockData.ts`: agregar `mockWeddingTemplate04Demo` con `gallery: []` (sin fotos hardcodeadas: el dashboard no gestiona ese campo, se resuelve vía `useWeddingImages`) y registrarla en `mockWeddings`. Copiar `hero.jpg`/`couple.jpg` a `public/assets/wedding-images/template-04-demo/` (más una carpeta `gallery/` vacía, requerida por la API de imágenes) reutilizando el único asset de `friends-test` con estética adecuada.
18. Editar `README.md`: añadir la entrada de la boda de prueba `template-04-demo`, siguiendo el formato ya usado para las demás.
19. Verificación manual: `npm run dev`, visitar `/wedding/template-04-demo` y `/en/wedding/template-04-demo`; confirmar las 13 secciones en el nuevo orden, el marco en arco del Hero y de About, el countdown en vivo, el flujo de RSVP, y que las bodas mock existentes (incluida `valentina-mateo-2026`) siguen cargando sin cambios.

## Criterios de aceptación

- [ ] Existen `components/sections-v4/*.tsx` para las 13 secciones más `ui.tsx`, sin errores de TypeScript.
- [ ] `components/templates/Template04.tsx` renderiza las 13 secciones en el orden Hero→About→Countdown→Gallery→Location→Timeline→DressCode→GiftRegistry→Accommodation→AdultOnlyEvent→RecommendedPlaces→RSVP→Footer.
- [ ] `WeddingTemplate.tsx` selecciona `Template04` cuando `wedding.template.id === 'template-04'`, `Template03` cuando es `'template-03'`, `Template02` cuando es `'template-02'`, y `Template01` en cualquier otro caso (incluido `undefined`).
- [ ] Visitar `/wedding/template-04-demo` en local renderiza `Template04` completo con los datos de Renata & Joaquín.
- [ ] El Hero usa la foto resuelta por `useWeddingImages` (carpeta `public/assets/wedding-images/template-04-demo/`) como fondo, con el marco en arco visible y el texto legible sobre la imagen.
- [ ] `Template04.tsx` no incluye ninguna barra de navegación ni overlay de índice; ningún componente de `sections-v4` lee campos de `WeddingData` que el panel de administración no gestione para los demás templates.
- [ ] `CountdownV4` corre en vivo (actualiza cada segundo) y refleja `event.date`/`event.time` de la boda cargada.
- [ ] `RSVPV4` permite alternar sí/no, ajustar acompañantes, y el envío dispara `submitRSVP` (mock) mostrando el estado de confirmación.
- [ ] `GiftRegistryV4`, `AccommodationV4`, `AdultOnlyEventV4` y `RecommendedPlacesV4` se muestran cuando sus flags `enabled` son `true`, con un diseño visualmente distinto al de `sections-v2` y `sections-v3`.
- [ ] Toda la tipografía visible del template usa Georgia (o su stack de fallback); no se carga ninguna fuente de Google Fonts nueva para `template-04`.
- [ ] Las bodas mock existentes (incluida `valentina-mateo-2026`) siguen cargando sin error tras los cambios.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Las animaciones respetan `prefers-reduced-motion` y los controles interactivos usan elementos semánticos (`button`, `label` + `input`, `nav`).
- [ ] Por revisión de código: si una boda llegara desde Firebase con `template: { id: 'template-04' }`, el mismo switch de `WeddingTemplate.tsx` la enrutaría a `Template04` sin cambios adicionales.

## Decisiones tomadas y descartadas

- **Canvas de diseño previo (Artifact) antes de escribir el spec**: se replicó primero el lenguaje visual en un canvas (`https://claude.ai/artifact/GdYb13yefXQCdX9QQTmbhB`) sobre nuestras 13 secciones y datos mock, se corrigió con feedback del usuario (hero con foto real + marco en arco, orden de secciones, tipografía Georgia, nav inferior fijo) y se aprobó antes de convertirlo en spec de implementación — mismo flujo que se usó para `template-03`.
- **Omitir la sección "Padres/Bendición" de la referencia**: no existe en nuestro modelo de datos (`WeddingData` no tiene `couple.parents`) y no es una de las 13 secciones con paridad en los demás templates. Añadirla habría requerido tocar un tipo compartido por los 4 templates para una sola sección visual. Descartado por decisión explícita del usuario.
- **Orden de secciones propio para `template-04` (About antes de Countdown)**: se decidió igualar exactamente el orden de la referencia en vez de mantener el orden de `Template01/02/03` (Countdown y Location antes de About), porque el usuario pidió una réplica fiel del diseño. Se documenta explícitamente para que no se lea como una inconsistencia entre templates.
- **`GiftRegistry`/`Accommodation`/`AdultOnlyEvent`/`RecommendedPlaces` con diseño propio, no re-skin de V2/V3**: decisión explícita del usuario, a diferencia del patrón usado en `template-03` (que sí las re-skinó desde V2). Se mantiene el mismo contrato de datos/lógica de `enabled` en los 4 casos para no duplicar reglas de negocio, solo cambia el marcado/estilos.
- **Sin barra de navegación ni overlay de índice (revertido tras la primera iteración)**: se implementó inicialmente como pieza transversal (`IndexNavV4`) y se retiró por pedido explícito del usuario — no aporta ningún dato gestionable desde el dashboard, ningún otro template la tiene, y el diseño debe funcionar sobre "nuestros datos y como nosotros lo gestionamos", no agregar UI nueva ajena a ese modelo.
- **`gallery: []` en la boda mock, sin curar una lista propia de fotos de stock**: primera iteración usó un array de `GalleryImage[]` con URLs de Unsplash elegidas a mano; se corrigió porque el dashboard nunca escribe ese campo para una boda real (confirmado leyendo `app/[locale]/admin/wedding-editor/[weddingId]/page.tsx`), así que mantenerlo hardcodeado desalineaba la demo del comportamiento real. `GalleryV4` ya prioriza `weddingData.gallery` y cae a `useWeddingImages()` igual que `GalleryV2`/`GalleryV3`; con el array vacío, la demo usa exactamente el mismo mecanismo (carpeta de archivos + fallback de stock del propio hook) que tendría una boda real sin fotos configuradas.
- **Se eliminó `couple.image` del mock**: no es un campo que el editor gestione ni que ningún `sections-v*` lea para renderizar (todos usan `useWeddingImages`); mantenerlo sugería una fuente de datos que no existe en producción.
- **Auditoría completa contra `app/[locale]/admin/wedding-editor/[weddingId]/page.tsx` (9 tabs: Pareja, Evento, Lugares, Cronograma, Hoteles Recomendados, Lugares Recomendados, Regalos, Social, Solo adultos)**: se leyó el editor completo campo por campo y se corrigieron 4 secciones que mostraban contenido sin UI para editarlo:
  - `DressCodeV4`: la pestaña "Evento" solo edita `dressCode.style`/`dressCode.description`; se quitaron `recommendations.ladies/gentlemen` y `colors.recommended/avoid` (no tienen campo en el editor). Vuelve a ser idéntico en alcance a `DressCodeV3`.
  - `AccommodationV4`: la pestaña "Hoteles Recomendados" solo edita `name`/`description`/`mapsUrl` por hotel; se quitaron `price`/`distance` (sin UI). Se usa `hotel.mapsUrl` si existe, con fallback a búsqueda por nombre.
  - `RecommendedPlacesV4`: la pestaña "Lugares Recomendados" solo edita `name`/`description`/`mapsUrl` por lugar; se quitó el agrupado por `category` y el badge de `distance` (ninguno de los dos es editable — `category` solo existe porque el tipo lo exige, no hay selector en el dashboard).
  - `LocationV4`: no existe `ceremony.time`/`reception.time` por separado (solo un `event.time` único en la pestaña "Evento") ni descripción de venue editable (la pestaña "Lugares" solo tiene `name`/`address`/`mapsUrl`); se rediseñó para mostrar dos tarjetas (ceremonia + recepción) con esos tres campos, igual que `LocationV3`.
  - El mock `mockWeddingTemplate04Demo` se recortó para no incluir datos en campos que el dashboard no puede escribir (coordinates de venue, features, recommendations/colors de dressCode, price/distance/phone/amenities de hoteles, category/priceRange/distance/coordinates de lugares) — donde el tipo exige el campo mantiene un valor vacío en vez de contenido inventado.
- **Tipografía única (Georgia, stack de sistema) en vez de una pareja serif+sans como en `template-03`**: así se ve la referencia real, y evita agregar una dependencia de fuente web nueva para este template.
- **Paleta fija del canvas, no conectada al selector de 10 temas**: mismo criterio que `template-03` — respeta el diseño aprobado tal cual.
- **Mock `template-04-demo` con datos placeholder genéricos (Renata & Joaquín)**: decisión explícita del usuario, siguiendo el mismo patrón de nomenclatura que `template-01-demo`/`template-02-demo` (id = `template-0N-demo`) en vez del patrón `pareja-año` usado en `valentina-mateo-2026`.
- **Reutilizar assets ya existentes de `friends-test` para `heroImage`/`couple.image`/`gallery` de la boda mock nueva, en vez de generar imágenes nuevas**: mismo criterio que SPEC 01 ("placeholders o assets existentes en `/public/assets`"); se descartó usar fotos de otras carpetas de assets (`karen-y-juan`, `nuriban-y-juan`) por ser fotografías personales casuales de personas identificables que no encajan con la estética editorial de bodas del template.
- **RSVPV4 conectado al thunk real `submitRSVP`, animaciones con `framer-motion` (`whileInView`)**: mismas convenciones que `template-03`, confirmadas explícitamente por el usuario para mantener consistencia con el resto del proyecto.

## Riesgos

- **No hay prueba end-to-end contra un documento real de Firebase** con `template.id: 'template-04'`; la cobertura de ese camino se limita a que el switch en `WeddingTemplate.tsx` sea agnóstico al origen de los datos (mock o Firebase), verificado por lectura de código.
- **Reutilización de una sola foto real (`friends-test/hero.jpg` copiada a `template-04-demo/hero.jpg` y `couple.jpg`)** en los datos mock: es una limitación de datos de la boda demo, no del componente — con una boda real (más fotos disponibles en su propia carpeta) cada sección usaría una imagen distinta sin cambios de código. La galería de la demo, al quedar `gallery: []`, mostrará el fallback de stock ya integrado en `useWeddingImages` (mismo que usarían `template-01-demo`/`template-02-demo` si no tuvieran carpeta de galería propia) — esas fotos de stock son responsabilidad de ese hook compartido, no de `template-04`.
- **Alcance grande (13 secciones nuevas + componente de navegación nuevo)**: si el tiempo de implementación se dispara, se puede entregar en tandas (p. ej. Hero+About+Countdown+RSVP primero, resto después), porque cada sección es un archivo independiente y `Template04` no se monta en producción hasta que `WeddingTemplate.tsx` lo selecciona explícitamente vía `template.id`.
