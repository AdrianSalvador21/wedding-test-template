# 01 — Template03: Botánica Editorial

**Estado:** Approved
**Depende de:** Ninguno
**Fecha:** 2026-09-22

## Objetivo

Implementar `template-03`, un nuevo template de invitación opcional basado en el rediseño "Botánica Editorial" (canvas de diseño ya aprobado), con paridad completa de las 13 secciones existentes, y crear una boda mock de prueba (`valentina-mateo-2026`) que lo use tanto en datos locales como si llegara con ese `template.id` desde Firebase.

## Contexto

El template principal actual (`template-01`, fallback por defecto en `WeddingTemplate.tsx`) usa `components/sections/*.tsx`. Ya existe un segundo template (`template-02`, `components/sections-v2/*.tsx`) seleccionable vía `wedding.template.id`. El rediseño "Botánica Editorial" fue validado en un canvas de diseño (hero split-screen con marco en arco, monograma animado, motivos SVG botánicos dibujados a mano, scroll-reveal, countdown en vivo, RSVP interactivo) y ahora se lleva a código como un tercer template, sin tocar los dos existentes.

## Alcance

**Incluye:**
- Un nuevo `components/templates/Template03.tsx` con las 13 secciones (Hero, Countdown, Location, About, Gallery, Timeline, DressCode, GiftRegistry, Accommodation, AdultOnlyEvent, RecommendedPlaces, RSVP, Footer), seleccionable vía `wedding.template.id === 'template-03'`.
- Componentes nuevos en `components/sections-v3/*.tsx` (uno por sección) más un `ui.tsx` con helpers visuales compartidos (paleta, tipografía, divisores, motivos SVG botánicos, wrapper de reveal-on-scroll).
- Paleta de color fija del canvas (acento terracota `#B5643A`, salvia `#85906E`, papel `#FAF6EF`, tinta `#34302A`), independiente del selector de 10 temas — no conectada a `lib/themes.ts`.
- Animaciones con `framer-motion` (`whileInView`, variantes escalonadas), siguiendo el mismo patrón que `components/sections-v2/ui.tsx` (`V2Reveal`), no `IntersectionObserver` manual.
- GiftRegistryV3, AdultOnlyEventV3 y RecommendedPlacesV3 como re-skin visual de sus equivalentes V2 (mismo contrato de datos y misma lógica de `enabled`), no diseño desde cero.
- RSVPV3 conectado al thunk real `submitRSVP` (mismo flujo que `RSVP.tsx`/`RSVPV2.tsx`), no un formulario cosmético.
- Una boda mock nueva (`valentina-mateo-2026`, Valentina & Mateo, 12 dic 2026, Hacienda San Rafael - Cusco) registrada en `src/data/mockData.ts`, con `template: { id: 'template-03' }` y todas las secciones opcionales (`giftRegistry`, `adultOnlyEvent`, `recommendedPlaces`, `rsvp`) habilitadas para poder probarlas.
- Corrección del fallback mock en `src/services/weddingApi.ts` para que, cuando no exista documento en Firebase, se resuelva primero por el `id` solicitado (`getMockWeddingData(id)`) y solo si no existe se use `friends-test` como respaldo — hoy el fallback usa siempre `friends-test` sin importar el id pedido.
- Actualización de `components/WeddingTemplate.tsx`: switch de 3 vías para elegir template, y alta del nuevo id mock en la lista que activa el overlay de demostración.
- Entrada documentada en `README.md` para la nueva boda de prueba, siguiendo el formato existente.

**No incluye:**
- No se reemplaza `template-01` ni se modifica `template-02`/`sections-v2`.
- No se conecta el nuevo template al selector de 10 temas (`lib/themes.ts`); queda con paleta fija.
- No se crea un documento real en Firebase con `template.id: 'template-03'` — la ruta Firebase se deja lista en código (mismo switch, agnóstico al origen de los datos) pero no se prueba contra un documento real.
- No se agregan invitados de demo (`mockInvitations.ts`) para la boda nueva; el overlay de invitado personalizado sigue dependiendo de Firebase como hoy.
- No se rediseña la paleta ni el layout de GiftRegistry/AdultOnlyEvent/RecommendedPlaces desde cero (ver alcance: es un re-skin).

## Datos

No se introducen campos nuevos en `WeddingData` (`template?: { id: string }` ya existe en `src/types/wedding.ts`). Se añade una nueva instancia concreta:

```ts
// src/data/mockData.ts
export const mockWeddingValentinaMateo: WeddingData = {
  id: 'valentina-mateo-2026',
  couple: { bride: { name: 'Valentina', ... }, groom: { name: 'Mateo', ... }, ... },
  event: {
    weddingId: 'valentina-mateo-2026',
    date: '2026-12-12T16:00:00.000Z',
    time: '16:00',
    ceremonyVenue: { name: { es: 'Hacienda San Rafael', en: 'San Rafael Hacienda' }, ... },
    receptionVenue: { name: { es: 'Hacienda San Rafael', en: 'San Rafael Hacienda' }, ... },
    dressCode: { ... },
  },
  timeline: [ /* Ceremonia, Cóctel, Recepción, Fiesta — igual estructura que el mockup */ ],
  gallery: [ /* placeholders o assets existentes en /public/assets */ ],
  giftRegistry: { enabled: true, ... },
  adultOnlyEvent: { enabled: true, ... },
  recommendedPlaces: { enabled: true, ... },
  rsvp: { enabled: true, ... },
  theme: { id: 'classic' }, // no se usa para color, pero se mantiene por compatibilidad de tipo
  template: { id: 'template-03' },
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
  'valentina-mateo-2026': mockWeddingValentinaMateo,
};
```

Contrato de los componentes `sections-v3/*V3.tsx`: mismo patrón que `sections-v2` — cada sección lee `useAppSelector(selectCurrentWedding)` directamente (sin props), excepto `HeroV3`, que recibe `overlayVisible: boolean` igual que `Hero`/`HeroV2`.

## Plan de implementación

1. Crear `components/sections-v3/ui.tsx`: helpers compartidos del nuevo lenguaje visual — `V3Section`, `V3Reveal` (framer-motion `whileInView`, mismo patrón que `V2Reveal`), `V3Divider`, `V3EyebrowTitle`, `V3Wreath` (corona SVG animada) y los iconos botánicos reutilizables (rama, hoja, anillos, copa, cubiertos, nota musical). No afecta nada visible aún.
2. Crear `HeroV3.tsx`: hero split-screen (placeholder de foto en arco + columna de texto) con monograma animado, nombres con entrada escalonada, CTA con scroll a `#rsvp`, y versión mobile apilada vía Tailwind responsive. Aún no se monta en ningún Template.
3. Crear `CountdownV3.tsx`: cuenta regresiva en vivo calculada desde `event.date`/`event.time`, tarjetas con los tokens del nuevo sistema.
4. Crear `AboutV3.tsx` ("Nuestra Historia"): layout foto + texto con reveal from-left/from-right, usa `couple.story[locale]`.
5. Crear `GalleryV3.tsx`: grid con hover-zoom y caption sobre `weddingData.gallery`, reutilizando `useWeddingImages` como `GalleryV2`.
6. Crear `TimelineV3.tsx`: itinerario vertical con iconos botánicos por evento, sobre `weddingData.timeline`.
7. Crear `LocationV3.tsx`, `DressCodeV3.tsx`, `AccommodationV3.tsx`: secciones individuales (no combinadas en una sola fila como el mockup) con el mismo lenguaje visual, sobre `event.ceremonyVenue`/`receptionVenue`, `event.dressCode` y `accommodation.hotels` respectivamente.
8. Crear `GiftRegistryV3.tsx`, `AdultOnlyEventV3.tsx`, `RecommendedPlacesV3.tsx`: re-skin de la lógica/estructura de sus equivalentes V2 con la paleta, tipografía y `V3Reveal` del nuevo sistema.
9. Crear `RSVPV3.tsx`: toggle sí/no, stepper de acompañantes, estado de envío, conectado al thunk real `submitRSVP`.
10. Crear `FooterV3.tsx`: monograma, agradecimiento y crédito, estilo del mockup.
11. Crear `components/templates/Template03.tsx` ensamblando las 13 secciones en el mismo orden que `Template01`/`Template02`, con prop `overlayVisible`.
12. Editar `components/WeddingTemplate.tsx`: extender la selección de template a 3 vías (`'template-03'` → `Template03`, `'template-02'` → `Template02`, cualquier otro valor / `undefined` → `Template01`) y añadir `'valentina-mateo-2026'` a la lista `isMockData` que activa el overlay de demostración.
13. Editar `src/services/weddingApi.ts`: cambiar el fallback mock fijo (`getMockWeddingData('friends-test')`) por `getMockWeddingData(id) || getMockWeddingData('friends-test')`, para que cualquier id mock registrado se sirva con sus propios datos cuando no haya documento en Firebase.
14. Editar `src/data/mockData.ts`: agregar `mockWeddingValentinaMateo` y registrarla en `mockWeddings` (y por tanto en `availableWeddingIds`).
15. Editar `README.md`: añadir la entrada de la boda de prueba `valentina-mateo-2026`, siguiendo el formato ya usado para las demás.
16. Verificación manual: `npm run dev`, visitar `/wedding/valentina-mateo-2026` y `/en/wedding/valentina-mateo-2026`; confirmar las 13 secciones, animaciones, countdown en vivo, flujo de RSVP y overlay de demo; confirmar que las bodas mock existentes (`maria-carlos-2025`, `ana-luis-2025`, `isabella-alexander-2025`, `valentina-sebastian-2025`, `roberto-patricia-2025`) siguen cargando y ahora muestran sus propios datos en vez de los de `friends-test`.

## Criterios de aceptación

- [ ] Existen `components/sections-v3/*.tsx` para las 13 secciones más `ui.tsx`, sin errores de TypeScript.
- [ ] `components/templates/Template03.tsx` renderiza las 13 secciones en el mismo orden que `Template01`/`Template02`.
- [ ] `WeddingTemplate.tsx` selecciona `Template03` cuando `wedding.template.id === 'template-03'`, `Template02` cuando es `'template-02'`, y `Template01` en cualquier otro caso (incluido `undefined`).
- [ ] Visitar `/wedding/valentina-mateo-2026` en local renderiza `Template03` completo con los datos de Valentina & Mateo.
- [ ] `CountdownV3` corre en vivo (actualiza cada segundo) y refleja `event.date`/`event.time` de la boda cargada.
- [ ] `RSVPV3` permite alternar sí/no, ajustar acompañantes, y el envío dispara `submitRSVP` (mock) mostrando el estado de confirmación.
- [ ] `GiftRegistryV3`, `AdultOnlyEventV3` y `RecommendedPlacesV3` se muestran cuando sus flags `enabled` son `true` en los datos de la boda de prueba.
- [ ] `src/services/weddingApi.ts` resuelve el mock por el `id` solicitado antes de caer a `friends-test`.
- [ ] Las bodas mock existentes (`maria-carlos-2025`, `ana-luis-2025`, `isabella-alexander-2025`, `valentina-sebastian-2025`, `roberto-patricia-2025`, `friends-test`) siguen cargando sin error tras el cambio de fallback.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Las animaciones respetan `prefers-reduced-motion` y los controles interactivos usan elementos semánticos (`button`, `label` + `input`).
- [ ] Por revisión de código: si una boda llegara desde Firebase con `template: { id: 'template-03' }`, el mismo switch de `WeddingTemplate.tsx` la enrutaría a `Template03` sin cambios adicionales (no depende de que los datos sean mock).

## Decisiones tomadas y descartadas

- **Template opcional (`template-03`) en vez de reemplazar `template-01`**: menor riesgo — ninguna boda existente sin `template.id` explícito cambia de aspecto. Descartado: sobrescribir `Template01.tsx`.
- **Paridad completa de 13 secciones en vez del núcleo de 8 del mockup**: consistencia con `Template01`/`Template02` y con lo que `WeddingTemplate.tsx` espera poder mostrar de cualquier boda.
- **Paleta fija del canvas en vez de conectarla al sistema de 10 temas**: respeta el diseño ya aprobado tal cual; conectarlo a `lib/themes.ts` habría exigido reinterpretar 10 paletas sobre un layout que no fue diseñado para eso.
- **GiftRegistry/AdultOnlyEvent/RecommendedPlaces como re-skin de V2, no diseño nuevo**: esas 3 secciones no estaban en el canvas original; reusar su lógica reduce el riesgo de romper contratos de datos y acelera la implementación.
- **Animaciones con `framer-motion` (`whileInView`) en vez de `IntersectionObserver` manual**: el mockup del canvas usó `IntersectionObserver` por una limitación de esa herramienta de diseño; el código real ya tiene el patrón `V2Reveal`, así que `Template03` sigue esa convención existente en vez de introducir una técnica nueva al proyecto.
- **RSVPV3 conectado al thunk real `submitRSVP`, no un formulario cosmético**: mantiene paridad funcional con `RSVP.tsx`/`RSVPV2.tsx`.
- **Corregir el fallback de `weddingApi.ts` (buscar por `id` antes de usar `friends-test`)**: es un bug preexistente — hoy cualquier boda sin documento en Firebase muestra siempre el contenido de `friends-test` con el id sustituido, lo cual contradice lo que el propio `README.md` documenta (bodas con temas romantic/modern/luxury/premium/corporate distintos). Corregirlo es necesario para que `valentina-mateo-2026` se sirva con sus propios datos, y de paso alinea el comportamiento real con la documentación existente.

## Riesgos

- **Cambio de comportamiento visible en bodas mock existentes**: al corregir el fallback de `weddingApi.ts`, `maria-carlos-2025`, `ana-luis-2025`, etc. dejarán de mostrar el contenido de `friends-test` (con el id sustituido) y pasarán a mostrar su propio contenido registrado en `mockWeddings`. Es el comportamiento correcto y documentado, pero es un efecto observable más allá de lo mínimo pedido — se señala explícitamente para que no sorprenda en revisión.
- **No hay prueba end-to-end contra un documento real de Firebase** con `template.id: 'template-03'`; la cobertura de ese camino se limita a que el switch en `WeddingTemplate.tsx` sea agnóstico al origen de los datos (mock o Firebase), verificado por lectura de código, no por una prueba real contra Firebase.
- **Alcance grande (13 secciones nuevas)**: si el tiempo de implementación se dispara, se puede entregar en tandas (p. ej. Hero+Countdown+RSVP primero, resto después) sin romper lo ya construido, porque cada sección es un archivo independiente y `Template03` no se monta en producción hasta que `WeddingTemplate.tsx` lo selecciona explícitamente vía `template.id`.
