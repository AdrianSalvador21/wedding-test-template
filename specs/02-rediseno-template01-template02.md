# 02 — Rediseño de Template01 y Template02

**Estado:** Approved
**Depende de:** Ninguno
**Fecha:** 2026-09-22

## Objetivo

Aplicar a `template-01` (`components/sections/*.tsx`) y `template-02` (`components/sections-v2/*.tsx`) el sistema de diseño ya validado en el canvas de Design ("Propuesta de mejoras — Template01 y Template02", 4 artboards: `Template01-Desktop.dc.html`, `Template01-Mobile.dc.html`, `Template02-Desktop.dc.html`, `Template02-Mobile.dc.html`) — tipografía, botones, divisores, monograma/ornamento, tarjetas, acento de eyebrow y animaciones — sin tocar su estructura de secciones, su contrato de datos ni la lógica funcional existente (RSVP, temas, monograma personalizado).

## Contexto

`template-01` y `template-02` son los dos templates de producción actuales (`Template01.tsx` es el fallback por defecto en `WeddingTemplate.tsx` cuando `wedding.template?.id` no es `'template-02'` ni `'template-03'`). Ambos ya tienen bodas mock de prueba registradas: `template-01-demo` (Sofía & Diego) y `template-02-demo` (Camila & Andrés).

Tras dos rondas de iteración en el canvas de Design (`https://claude.ai/artifact/Hhip27XrfP5ax8zrn8Cx7o`), quedó aprobado un sistema visual que diferencia genuinamente a los 3 templates entre sí (ver `Notas.dc.html` del canvas, tabla "Cómo se diferencian los 3 ahora"):

- **Template01 ("Clásico")**: Cormorant Garamond en versalitas (sin itálica) para textos + Allura cursiva solo en los nombres/ampersand; botón rectangular de borde fino; divisor de doble filete con florón de 4 pétalos; monograma nuevo (sello circular fino roto por una ramita mínima de laurel, reemplaza la guirnalda cerrada y los corazones de Lucide flotantes actuales); tarjetas de borde simple sin sombra ("look impreso"); acento de hoja animado sobre cada eyebrow de sección.
- **Template02 ("Moderno")**: compromiso total con sans-serif geométrica (Manrope), sin la serif genérica del navegador que usa hoy; botón píldora sólido de alto contraste; divisor de dos puntos geométricos (sin motivo floral); anillos concéntricos con rotación lenta como ornamento del Hero; acentos de línea botánica de un solo trazo (sin relleno, estilo minimalista) como toque botánico moderno; tarjetas muy redondeadas con sombra suave (ya existe, se ajusta el radio/sombra); badge de iniciales como respaldo cuando no hay `monogram.svg` personalizado subido.

Revisión del código real hecha antes de este spec (no asumida):

- **`tailwind.config.ts`** define `colors.primary/secondary/accent/light/dark/text/border` con hex distintos a los del mockup (`primary:#8b7355` vs mockup `#8B5E34`, `accent:#d4af8c` vs mockup `#c9a86a`), y esos tokens los usan además `WeddingNotFound.tsx`, `app/[locale]/loading.tsx` y `app/[locale]/typography-test/page.tsx` — páginas fuera del alcance de este spec. Cambiar el tema global de Tailwind tendría efecto colateral en ellas.
- **`app/globals.css`** define `.font-heading{font-family:'Allura',cursive;font-size:2.6rem}` como regla CSS plana (no vía Tailwind), usada hoy solo en `Hero.tsx`, `Footer.tsx` (Template01) y `WeddingNotFound.tsx`. El tamaño fijo `2.6rem` pisa las clases responsive (`text-4xl md:text-7xl...`) que conviven con ella en el mismo `h1` de `Hero.tsx` — es el bug que señala `Notas.dc.html`.
- **`components/sections-v2/ui.tsx`** ya tiene un sistema compartido (`V2Section`, `V2Reveal`, `V2Stagger`, `V2Card`, `V2Title`, `V2PillButton`) con paleta **hardcoded** (`#b79a7a`, `#3b342b`, `#e7dccf`, `#fbf7f1`) independiente del selector de 10 temas — solo los fondos decorativos por sección usan `useThemePatterns()`/`getBackgroundStyle()`. El mockup usa prácticamente el mismo `#b79a7a`.
- **`components/sections`** (Template01) no tiene un archivo `ui.tsx` compartido — cada sección repite sus propios estilos inline/Tailwind. `RSVP.tsx` es un formulario real con `react-hook-form` + `zod`, `guestCount`, `plusOne`, restricciones dietéticas y envío a Firebase (`submitRSVP`) — mucho más completo que el toggle sí/no del mockup, que fue una simplificación de la herramienta de diseño.
- El monograma personalizado (`monogramExists`, `fetch('/assets/wedding-images/{id}/monogram.svg')`) es una función real compartida por `Hero.tsx` (T1) y `HeroV2.tsx` (T2); **no se toca su lógica de carga**, solo se decide qué se muestra cuando no existe el archivo.

## Alcance

**Incluye:**

- Nuevo `components/sections/ui.tsx`: helpers compartidos de Template01 (`T1Section`, `T1Reveal`, `T1Stagger`, `T1StaggerItem`, `T1Card`, `T1Button`/`T1SolidButton`, `T1Divider` (doble filete + florón), `T1EyebrowTitle` (con el acento de hoja animado), `T1Monogram` (sello circular + ramita, con tamaño configurable para Hero/Footer)), con animaciones vía `framer-motion` `whileInView` (mismo patrón que `V2Reveal`, no `IntersectionObserver` manual — esa técnica fue una limitación de la herramienta de diseño, no una decisión de producto) y respetando `prefers-reduced-motion`.
- Paleta nueva de Template01 aplicada **sin modificar `tailwind.config.ts`** (para no afectar `WeddingNotFound.tsx`, `loading.tsx` ni `typography-test/page.tsx`): los hex del mockup (`#8B5E34`, `#c9a86a`, `#5a4a3a`, `#faf8f5`, `#6b5b4f`, `#d9c6a8`) se aplican como constantes/clases propias dentro de `components/sections/ui.tsx` y los 13 archivos de sección, igual que ya hace `sections-v2/ui.tsx` con los suyos.
- Las 13 secciones de Template01 (`Hero`, `Countdown`, `Location`, `About`, `Gallery`, `Timeline`, `DressCode`, `GiftRegistry`, `Accommodation`, `AdultOnlyEvent`, `RecommendedPlaces`, `RSVP`, `Footer`) migradas a los nuevos helpers: mismo botón en todas partes (hoy conviven un CTA relleno translúcido en Hero y un botón outline en RSVP), mismo divisor, mismas tarjetas, eyebrow con acento de hoja.
- `Hero.tsx`/`Footer.tsx`: los corazones de Lucide flotantes se reemplazan por el nuevo `T1Monogram` (sello + ramita) y las hojas flotantes del Hero; se corrige el bug de `.font-heading` **sin tocar la regla CSS global** — el `h1` de los nombres deja de usar la clase `font-heading` y pasa a una clase/estilo propio de Template01 que solo fija `font-family: 'Allura', cursive` (sin `font-size` fijo), dejando que `text-4xl md:text-7xl...` controle el tamaño responsive como ya lo intenta hacer hoy.
- `RSVP.tsx`: se reestiliza visualmente (inputs, `<select>` custom, botón de envío, tarjeta contenedora) con los nuevos tokens — **sin tocar campos, validación (`zod`), lógica de `guestCount`/`plusOne`/dietary ni el thunk de envío**.
- `components/sections-v2/ui.tsx` actualizado: `V2Title` cambia su divisor (línea plana → dos puntos geométricos), tipografía del `h2` deja de usar `font-serif` genérico y pasa a Manrope explícito; se agregan `V2Monogram` (badge de iniciales, fallback) y helpers de acento de línea botánica y anillos animados.
- Las 13 secciones de Template02 (`HeroV2`, `CountdownV2`, `LocationV2`, `AboutV2`, `GalleryV2`, `TimelineV2`, `DressCodeV2`, `GiftRegistryV2`, `AccommodationV2`, `AdultOnlyEventV2`, `RecommendedPlacesV2`, `RSVPV2`, `FooterV2`) migradas a estos helpers actualizados.
- `HeroV2.tsx`/`FooterV2.tsx`: cuando `monogramExists` es `false`, se muestra `V2Monogram` con un badge circular sólido con las iniciales de `couple.bride.name[0]` + `couple.groom.name[0]` (mismo estilo que el mockup), en vez de no mostrar nada.
- `GalleryV2.tsx`: el botón "compartir" decorativo (`pointer-events-none`) deja de tener apariencia de botón interactivo (se recorta a una etiqueta de texto) para no prometer una acción que no existe.
- Verificación manual en `template-01-demo` y `template-02-demo` (español e inglés) tras cada bloque de cambios.

**No incluye:**

- No se toca `Template03`/`components/sections-v3/*` ni el canvas "Botánica Editorial".
- No se modifica `tailwind.config.ts` ni las reglas CSS globales de `.font-heading` en `app/globals.css` (se evita el efecto colateral en `WeddingNotFound.tsx`, `loading.tsx`, `typography-test/page.tsx`).
- No se conecta ninguno de los dos templates al selector de 10 temas para su paleta de color (`lib/themes.ts`); ambos mantienen paleta propia fija, igual que hoy. Los fondos decorativos por tema (`useThemePatterns`/`getBackgroundStyle`) se conservan sin cambios.
- No se modifican campos, validación, lógica de envío ni el contrato de datos del RSVP real (`RSVP.tsx`/`RSVPV2.tsx`) — solo su apariencia.
- No se cambia el orden de las secciones ni se fusionan secciones (p. ej. Location sigue siendo ceremonia + recepción en el mismo layout de 2 tarjetas que ya existe, no se reestructura).
- No se toca la lógica de carga del monograma personalizado (`fetch('/assets/wedding-images/{id}/monogram.svg')`); solo cambia qué se renderiza cuando no existe.
- No se agregan bodas mock nuevas — se reutilizan `template-01-demo` y `template-02-demo` ya existentes para verificar.
- No se reproduce en este documento cada path SVG exacto de los artboards; la referencia visual de precisión (curvas, espaciados, tamaños) es el canvas de Design ya aprobado (`https://claude.ai/artifact/Hhip27XrfP5ax8zrn8Cx7o`), no una re-descripción textual.

## Datos

No se introducen campos nuevos en `WeddingData`. El badge de iniciales de `V2Monogram` se deriva en runtime de datos ya existentes: `weddingData.couple.bride.name[0]` + `weddingData.couple.groom.name[0]` (mismo patrón que ya usa `HeroV2` para `brideName`/`groomName` con sus fallbacks `'María'`/`'Carlos'`).

## Plan de implementación

**Bloque A — Template01**

1. Crear `components/sections/ui.tsx` con los helpers compartidos (`T1Section`, `T1Reveal`, `T1Stagger`, `T1StaggerItem`, `T1Card`, `T1Button`, `T1SolidButton`, `T1Divider`, `T1EyebrowTitle`, `T1Monogram`) usando `framer-motion` `whileInView` y respetando `prefers-reduced-motion`, con la paleta nueva (`#8B5E34`/`#c9a86a`/`#5a4a3a`/`#faf8f5`) como constantes del archivo. No se monta en ningún componente todavía — no cambia nada visible.
2. Migrar `Hero.tsx`: reemplazar corazones de Lucide flotantes por `T1Monogram` + hojas flotantes; corregir el `h1` de nombres para dejar de usar `.font-heading` (clase propia sin `font-size` fijo); unificar el CTA con `T1SolidButton`.
3. Migrar `Countdown.tsx`, `Location.tsx`, `About.tsx`, `Gallery.tsx`, `Timeline.tsx` a `T1Section`/`T1Reveal`/`T1Card`/`T1Divider`/`T1EyebrowTitle`, conservando su lógica de datos (`useAppSelector`, `useThemePatterns`, `useWeddingImages`) intacta.
4. Migrar `DressCode.tsx`, `GiftRegistry.tsx`, `Accommodation.tsx`, `AdultOnlyEvent.tsx`, `RecommendedPlaces.tsx` de la misma forma.
5. Reestilizar `RSVP.tsx`: tarjeta, inputs, `<select>` custom (con `T1EyebrowTitle`/tokens nuevos) y botón de envío con `T1SolidButton` — sin tocar el esquema `zod`, el registro de campos ni el thunk `submitRSVP`.
6. Migrar `Footer.tsx`: `T1Monogram` a tamaño reducido reemplazando la guirnalda actual; unificar tipografía y espaciados con el resto.
7. Verificación manual del Bloque A: `npm run dev`, visitar `/wedding/template-01-demo` y `/en/wedding/template-01-demo`, confirmar las 13 secciones, animaciones (incluida `prefers-reduced-motion`), y que el flujo de RSVP real sigue funcionando de punta a punta (incluye probar con `?guest=` si aplica).

**Bloque B — Template02**

8. Editar `components/sections-v2/ui.tsx`: `V2Title` cambia su divisor a dos puntos geométricos y su `h2` deja `font-serif` genérico por Manrope explícito; agregar `V2Monogram` (badge de iniciales + variante SVG cuando sí hay `monogram.svg`), helper de acento de línea botánica (hoja de un solo trazo) y anillos concéntricos animados.
9. Migrar `HeroV2.tsx`: usar `V2Monogram` como respaldo cuando `monogramExists` es `false` (mostrando iniciales); agregar anillos concéntricos animados y el acento de línea botánica; mantener intacto el tratamiento de imagen ya correcto (foto a sangre completa en desktop con overlay oscuro, foto que se desvanece hacia el fondo crema en mobile).
10. Migrar `CountdownV2.tsx`, `LocationV2.tsx`, `AboutV2.tsx`, `GalleryV2.tsx`, `TimelineV2.tsx` al `V2Title`/`V2Card` actualizados.
11. Migrar `DressCodeV2.tsx`, `GiftRegistryV2.tsx`, `AccommodationV2.tsx`, `AdultOnlyEventV2.tsx`, `RecommendedPlacesV2.tsx` de la misma forma; en `GalleryV2.tsx` además recortar el botón "compartir" decorativo a una etiqueta no interactiva.
12. Reestilizar `RSVPV2.tsx` con los tokens actualizados — sin tocar su lógica de envío.
13. Migrar `FooterV2.tsx`: `V2Monogram` con el mismo fallback de iniciales que el Hero.
14. Verificación manual del Bloque B: `npm run dev`, visitar `/wedding/template-02-demo` y `/en/wedding/template-02-demo`, confirmar las 13 secciones, el fallback de iniciales (esta boda no tiene `monogram.svg` subido), animaciones y RSVP real de punta a punta.

**Cierre**

15. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.
16. Revisión cruzada: confirmar que `Template03` y las páginas fuera de alcance (`WeddingNotFound.tsx`, `loading.tsx`, `typography-test/page.tsx`) no cambiaron de aspecto (ningún archivo fuera de `components/sections/*`, `components/sections-v2/*` debería aparecer en el diff, salvo los dos `ui.tsx`).

## Criterios de aceptación

- [ ] `components/sections/ui.tsx` existe con los helpers de Template01 y las 13 secciones + `Footer.tsx` lo usan, sin errores de TypeScript.
- [ ] `Hero.tsx` y `Footer.tsx` ya no importan `Heart` de `lucide-react` ni usan la clase `.font-heading`; los nombres de la pareja escalan correctamente en mobile/desktop (sin el tamaño fijo `2.6rem` peleando con las clases responsive).
- [ ] Existe un solo lenguaje de botón en Template01 (mismo componente `T1SolidButton`/`T1Button` reusado en Hero, RSVP y el resto de CTAs).
- [ ] `RSVP.tsx` conserva exactamente los mismos campos, validación `zod` y llamada a `submitRSVP` que antes del cambio — solo cambia su apariencia (verificable enviando un RSVP de prueba en `template-01-demo`).
- [ ] `components/sections-v2/ui.tsx` — `V2Title` ya no usa `font-serif` genérico ni el divisor de línea plana; existe `V2Monogram`.
- [ ] Visitar `/wedding/template-02-demo` (sin `monogram.svg` subido) muestra el badge de iniciales en Hero y Footer en vez de no mostrar nada.
- [ ] `RSVPV2.tsx` conserva su lógica de envío intacta; solo cambia su apariencia.
- [ ] El botón "compartir" de `GalleryV2.tsx` ya no tiene apariencia de botón clickeable.
- [ ] `tailwind.config.ts` no cambió; `WeddingNotFound.tsx`, `app/[locale]/loading.tsx` y `app/[locale]/typography-test/page.tsx` no aparecen en el diff.
- [ ] Todas las animaciones nuevas respetan `prefers-reduced-motion` (se pueden desactivar sin romper el layout).
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Visitar `/wedding/template-01-demo` y `/wedding/template-02-demo` (español e inglés) muestra las 13 secciones de cada template con el nuevo sistema visual, sin errores de consola.

## Decisiones tomadas y descartadas

- **Un solo spec combinado (no dos separados)**: decisión explícita del usuario al confirmar el alcance — se prioriza tener todo el trabajo trackeado en un solo documento. Mitigación del riesgo de tamaño: el plan de implementación se divide en dos bloques independientes (A = Template01, B = Template02) que pueden implementarse y verificarse por separado, cada uno dejando el sistema funcional.
- **Adoptar los hex exactos del mockup en vez de los actuales de `tailwind.config.ts`**: decisión explícita del usuario. Se implementa **sin modificar `tailwind.config.ts`** (que es compartido con `WeddingNotFound.tsx`, `loading.tsx` y `typography-test/page.tsx`, fuera de alcance) — los nuevos hex viven como constantes propias en `components/sections/ui.tsx`, igual que `sections-v2/ui.tsx` ya hace con los suyos. Esto cumple la decisión del usuario sin el efecto colateral que tendría cambiar el tema global de Tailwind.
- **Fallback de iniciales en `V2Monogram`**: decisión explícita del usuario. Se deriva de `couple.bride.name`/`couple.groom.name` ya existentes, sin tocar la lógica de `monogramExists`.
- **Sistema completo del mockup (no solo los fixes puntuales de `Notas.dc.html`)**: decisión explícita del usuario — se portan tipografía, botón, divisor, monograma, tarjeta, eyebrow y animación en las 13 secciones de cada template, no solo la lista acotada de bugs.
- **`RSVP.tsx`/`RSVPV2.tsx` se reestilizan pero no se reescriben**: son formularios reales conectados a Firebase con validación `zod` (guestCount, plusOne, restricciones dietéticas) mucho más completos que el toggle sí/no del mockup del canvas, que fue una simplificación de la herramienta de diseño, no la funcionalidad real a implementar.
- **Animaciones con `framer-motion` (`whileInView`), no `IntersectionObserver` manual**: mismo criterio que el spec de Template03 — los artboards usaron `IntersectionObserver` por una limitación de la herramienta de diseño; el código real sigue el patrón `V2Reveal` ya existente.
- **No tocar `.font-heading` en `app/globals.css`**: esa regla también la usa `WeddingNotFound.tsx`, fuera de alcance. Se resuelve el bug de tamaño fijo cambiando qué clase usa `Hero.tsx`/`Footer.tsx`, no la regla global.
- **El divisor de dos puntos y el sello circular/ramita de laurel no se reproducen aquí path por path**: el canvas de Design (`https://claude.ai/artifact/Hhip27XrfP5ax8zrn8Cx7o`, artboards `Template01-Desktop.dc.html`/`Template01-Mobile.dc.html`/`Template02-Desktop.dc.html`/`Template02-Mobile.dc.html`) es la referencia visual exacta a seguir durante la implementación.

## Riesgos

- **Alcance grande (26 archivos de sección + 2 `ui.tsx`)**: si el tiempo se dispara, se puede entregar el Bloque A (Template01) completo y verificado antes de empezar el Bloque B (Template02), porque cada bloque deja el sistema funcional por separado (ver plan de implementación).
- **Cambio visual en `RSVP.tsx`/`RSVPV2.tsx` sin tocar su lógica**: el mayor riesgo de regresión es tocar accidentalmente `register()`, el resolver de `zod` o las condiciones de `guestCount`/`plusOne` al reestilizar — se mitiga verificando un envío de RSVP real de punta a punta en ambas demos antes de cerrar cada bloque.
- **`.font-heading` compartido con `WeddingNotFound.tsx`**: si en la migración de `Hero.tsx`/`Footer.tsx` se decide por error tocar la regla CSS global en vez de solo dejar de usarla ahí, `WeddingNotFound.tsx` cambiaría de aspecto sin haber sido pedido — se señala explícitamente en el plan y en los criterios de aceptación.
- **Deriva visual entre el mockup `.dc.html` y el código real**: los artboards usan tipografía/SVG que puede requerir ajuste fino al pasarlos a Tailwind/React (line-height, unidades). No se considera un defecto si el resultado es visualmente equivalente aunque no sea pixel-perfect contra el canvas.
