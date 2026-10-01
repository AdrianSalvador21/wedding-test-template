# 20 — Lanzamiento de template-04 "Jardín Editorial" en marketing y panel de staff

**Estado:** Approved
**Depende de:** SPEC 19 (implementa `template-04`, ya mergeado en esta rama)
**Fecha:** 2026-09-30

## Objetivo

Sumar `template-04` ("Jardín Editorial") como cuarto diseño visible en toda la comunicación pública (landing, `/disenos`, copys de conteo, sitemap) y en el panel de staff que crea bodas reales, con su foto como protagonista del Hero.

## Contexto

- SPEC 19 ya implementó el componente de template (`components/templates/Template04.tsx`, `components/sections-v4/*`) y la boda mock `template-04-demo` (rama actual, commit `4e9c553 template-04-added`). Ese spec fue exclusivamente de código de invitación; no tocó ninguna página de marketing ni el panel de staff.
- La landing y las páginas de marketing (`components/LandingPage.tsx` y afines) solo conocen tres diseños hoy, todos leídos de `DESIGNS` en `lib/marketing-content.ts` (`clasico` → `template-01`, `moderno` → `template-02`, `botanica-editorial` → `template-03`). `template-04` no aparece ahí, así que no existe ninguna tarjeta de galería, página `/disenos/[slug]` ni entrada de sitemap para él.
- El Hero de la landing (`components/landing/Hero.tsx`) muestra un collage fijo de 3 fotos superpuestas (atrás-izquierda `template-03`, centro/frente con `priority` `template-01`, atrás-derecha `template-02`). El usuario pidió explícitamente que la foto que se ve arriba de todas sea la de `template-04`, y que el collage se rediseñe para mostrar las 4 en vez de descartar una.
- Varios textos fijos mencionan la cantidad de diseños en palabras ("tres diseños", "Tres: Clásico, Moderno y Botánica Editorial", "los otros dos estilos"): `components/landing/FinalCta.tsx`, `components/landing/HowItWorks.tsx`, `app/disenos/[slug]/page.tsx` (comentario y copy) y `lib/marketing-content.ts` (dos respuestas de FAQ), además de `app/wedding-planners/page.tsx` (`STEPS`).
- El picker de staff que crea/edita bodas reales (`components/admin/OperatorTools.tsx`, `TemplatePicker`/`TEMPLATE_IMAGES`) y su validación de servidor (`lib/admin-validation.ts`, `TEMPLATE_OPTIONS`/`isTemplateId`, usado por `app/api/admin/weddings/route.ts` y `app/api/admin/weddings/[weddingId]/route.ts`) solo aceptan `template-01`/`02`/`03`. Sin agregar `template-04` ahí, **nadie puede asignar este diseño a una boda real**, aunque el componente ya exista — confirmado por lectura de las dos rutas de servidor que llaman `isTemplateId`.
- El sitemap (`app/sitemap.ts`) sale de una lista fija `MARKETING_PAGES` en `lib/site.ts` que hoy solo lista `/disenos/clasico`, `/disenos/moderno` y `/disenos/botanica-editorial`; una página `/disenos/jardin-editorial` nueva no se indexaría sin agregarla ahí.
- El asset de imagen para el nuevo diseño (`public/assets/landing/design-template-04.png`) ya existe (agregado por el usuario en esta sesión), así que no hace falta generar ningún screenshot nuevo.
- Decisiones explícitas del usuario en esta sesión: el nombre público es "Jardín Editorial" (igual que el nombre interno de SPEC 19); el orden de los 4 diseños sigue el orden de número de template (Jardín Editorial al final); los textos con conteo se actualizan con números fijos ("cuatro diseños") en vez de generalizarse pensando en un futuro 5º template — mismo patrón que se usó al sumar `template-02` y `template-03`; y el Hero se rediseña para mostrar las 4 fotos superpuestas, con `template-04` como la que queda arriba de todas, en vez de descartar una de las tres actuales.

## Alcance

**Incluye:**

- `lib/marketing-content.ts`: nueva entrada en `DESIGNS` para `slug: 'jardin-editorial'`, `templateId: 'template-04'`, nombre "Jardín Editorial", con `h1`, `tagline`, `lead`, `metaDescription`, `signature`, `fit`, `demoHref: '/wedding/template-04-demo'`, `image: '/assets/landing/design-template-04.png'` e `imageAlt`, redactados en el mismo tono que las tres entradas existentes y basados en lo que el template realmente muestra (verde oliva oscuro + papel crema, tipografía Georgia, fotos en arco, numerales romanos — SPEC 19). Se amplían los tipos union `DesignContent['slug']` y `DesignContent['templateId']` para incluir los nuevos valores.
- `lib/marketing-content.ts`: actualizar las dos respuestas de FAQ que mencionan el conteo de diseños — `'¿Qué diseños puedo elegir?'` (de "Tres: Clásico, Moderno y Botánica Editorial" a "Cuatro: Clásico, Moderno, Botánica Editorial y Jardín Editorial") y `'¿Puedo ver cómo se ve antes de contratar?'` (de "tres demos reales" a "cuatro demos reales").
- `lib/site.ts`: nueva entrada en `MARKETING_PAGES` para `/disenos/jardin-editorial`, con `lastModified` de hoy, para que el sitemap la indexe (`isNonLocalizedPath` ya la cubre vía el prefijo `/disenos`).
- `components/landing/DesignGallery.tsx`: ajustar el grid de `md:grid-cols-3` a un layout que acomode 4 tarjetas sin dejar una huérfana sola en su fila (`md:grid-cols-2 lg:grid-cols-4`); sigue iterando `DESIGNS` sin lista propia, así que la tarjeta nueva aparece automáticamente al agregarse a `DESIGNS`.
- `components/landing/Hero.tsx`: rediseñar el collage de fotos de 3 a 4 imágenes superpuestas, siguiendo la "Propuesta A" validada en el canvas de diseño de esta sesión (`https://claude.ai/artifact/T4EYRN3QudTLf12g67aiKj`, artboard `Hero-A`) — se agrega la foto de `template-04` (`design-template-04.png`) sin rotación, al centro y como la de mayor z-index/`priority` (la que se ve "hasta arriba"), y las tres existentes (`template-01`, `template-02`, `template-03`) se conservan rotadas como capas detrás, reacomodando posiciones para que las 4 quepan sin verse amontonadas. A diferencia del mockup del canvas, **no** se agrega el chip "4 diseños para elegir" ni el badge "Nuevo diseño" sobre la foto de `template-04` (decisión explícita del usuario al aprobar la propuesta). El botón de WhatsApp, el link "Organiza tu boda gratis →" y los checks no cambian.
- `components/landing/FinalCta.tsx`: "los tres diseños" → "los cuatro diseños".
- `components/landing/HowItWorks.tsx`: "Escoge entre tres diseños..." → "Escoge entre cuatro diseños...".
- `app/disenos/[slug]/page.tsx`: actualizar el comentario `// Solo existen los tres diseños de DESIGNS.` → `// Solo existen los cuatro diseños de DESIGNS.` y el título de sección `"Conoce los otros dos estilos"` → `"Conoce los otros tres estilos"`. `generateStaticParams`, `others` y el resto de la página ya son genéricos sobre `DESIGNS` y no requieren más cambios.
- `app/wedding-planners/page.tsx`: `STEPS[0].text` ("Cada cliente escoge entre Clásico, Moderno y Botánica Editorial.") → "Cada cliente escoge entre Clásico, Moderno, Botánica Editorial y Jardín Editorial.".
- `lib/admin-validation.ts`: nueva entrada en `TEMPLATE_OPTIONS` para `id: 'template-04'`, `name: 'Jardín Editorial'`, con una descripción corta en el mismo estilo que las otras tres (verde oliva, fotos en arco, numerales romanos). `TemplateId` e `isTemplateId` heredan el nuevo valor automáticamente al derivarse de `TEMPLATE_OPTIONS`.
- `components/admin/OperatorTools.tsx`: nueva entrada en `TEMPLATE_IMAGES` para `'template-04': '/assets/landing/design-template-04.png'`, para que `TemplatePicker` (usado tanto en "Nueva invitación" como en "Editar invitación") muestre la miniatura del cuarto diseño junto a los otros tres.
- **Ampliación de alcance decidida en la sesión de `/spec-impl`** (el usuario pidió explícitamente incluirla, revirtiendo la exclusión original): `components/sections-v4/ui.tsx` gana `V4Branch`, `V4CornerFlourish` y `V4BgMotif` — los mismos tres motivos SVG decorativos (rama con hojas, floritura de esquina, patrón de fondo) que ya existen en `components/sections-v3/ui.tsx` (`V3Branch`/`V3CornerFlourish`/`V3BgMotif`), redibujados con la paleta de `v4Colors` en vez de la de `v3Colors`. Se agregan a las 11 secciones de `sections-v4` que usan `V4Section` sobre fondo plano (About, Countdown, Gallery, Location, Timeline, DressCode, GiftRegistry, Accommodation, AdultOnlyEvent, RecommendedPlaces, RSVP) y a `FooterV4`, en la misma esquina/tamaño/opacidad que su equivalente en `sections-v3` usa para la misma sección. `HeroV4` queda sin estos motivos: a diferencia de `HeroV3` (que compone sobre una columna de color plano), `HeroV4` es una foto de fondo full-bleed con overlay degradado y marco en arco (decisión de SPEC 19); una rama SVG encima de una fotografía real no tiene equivalente en ningún otro template y ensuciaría la foto. Las secciones marcadas `dark` (Countdown, GiftRegistry, Timeline) y `FooterV4` usan la variante clara de estos motivos (`light`, tonos `v4Colors.gold`/`v4Colors.paper`) en vez de la oscura, para que se vean sobre el fondo `v4Colors.ink`.
- QA manual de regresión: confirmar que las bodas mock existentes y `template-04-demo` se siguen viendo bien, que `npm run build` no rompe, y que el picker de staff permite crear/editar con `template-04`.

**No incluye:**

- No se cambia ninguna sección de `sections-v4/*` más allá de agregar los motivos SVG decorativos (`V4Branch`/`V4CornerFlourish`/`V4BgMotif`); no se toca su contenido, sus datos, su orden ni `Template04.tsx` — esa implementación fue resuelta y aprobada en SPEC 19.
- No se generaliza el conteo de diseños pensando en un futuro 5º template (sin `DESIGNS.length` dinámico en los textos, sin revisar si el collage del Hero tolera una 5ta foto): decisión explícita del usuario, se agrega solo `template-04` con números fijos, igual que se hizo con `template-02`/`template-03`.
- No se agrega ninguna imagen nueva de asset: `public/assets/landing/design-template-04.png` ya fue agregado por el usuario en esta sesión; no se genera ninguna variante adicional (tipo `design-template-03-2.png`) porque el Hero rediseñado reutiliza las mismas 4 imágenes que ya existen (`design-template-01.jpg`, `02.jpg`, `03.jpg`, `04.png`) en vez de recortes dedicados.
- No se cambia el orden de las 13 secciones dentro de `Template04.tsx` ni ningún dato de `mockWeddingTemplate04Demo` — eso es contenido de SPEC 19, no de este spec.
- No se traduce ningún contenido nuevo al inglés — la landing y las páginas de marketing siguen siendo solo en español, sin cambios respecto a hoy.
- No se agrega ninguna fila/columna nueva a la tabla comparativa de `/paquetes` (`COMPARISON`) ni se rediseña esa página — solo hereda automáticamente el conteo corregido de FAQ vía `getFaq`; no hubo pedido explícito de tocarla en esta sesión.
- No se agregan eventos de analítica nuevos — los links existentes (`demoHref`, `/login?mode=signup`) mantienen su instrumentación actual.

## Datos

Este spec no introduce ninguna estructura de datos nueva de `WeddingData` ni toca Firestore. Amplía dos tipos union ya existentes:

```ts
// lib/marketing-content.ts
export interface DesignContent {
  slug: 'clasico' | 'moderno' | 'botanica-editorial' | 'jardin-editorial';
  templateId: 'template-01' | 'template-02' | 'template-03' | 'template-04';
  // ... resto de campos sin cambios
}
```

```ts
// lib/admin-validation.ts
export const TEMPLATE_OPTIONS = [
  { id: 'template-01', name: 'Clásico', description: '...' },
  { id: 'template-02', name: 'Moderno', description: '...' },
  { id: 'template-03', name: 'Botánica Editorial', description: '...' },
  { id: 'template-04', name: 'Jardín Editorial', description: 'Verde oliva y papel crema, fotos en arco y numerales romanos.' },
] as const;
// TemplateId e isTemplateId se derivan de este arreglo, sin cambios de código aparte.
```

## Plan de implementación

1. **`lib/marketing-content.ts` — nueva entrada en `DESIGNS`.** Ampliar los tipos `slug`/`templateId` y agregar el objeto de `jardin-editorial` con todos sus campos (`h1`, `tagline`, `lead`, `metaDescription`, `signature`, `fit`, `demoHref: '/wedding/template-04-demo'`, `image: '/assets/landing/design-template-04.png'`, `imageAlt`) al final del arreglo. Prueba manual: `getDesign('jardin-editorial')` devuelve el objeto nuevo.
2. **`lib/marketing-content.ts` — corregir conteo en FAQ.** Actualizar las respuestas de `'¿Qué diseños puedo elegir?'` y `'¿Puedo ver cómo se ve antes de contratar?'` con los textos del Alcance. Prueba manual: la landing y `/preguntas-frecuentes` muestran los textos nuevos.
3. **`lib/site.ts` — sitemap.** Agregar `{ path: '/disenos/jardin-editorial', title: 'Invitación digital de boda jardín editorial', lastModified: '2026-09-30' }` a `MARKETING_PAGES`. Prueba manual: `app/sitemap.ts` incluye la URL nueva.
4. **`app/disenos/[slug]/page.tsx` — habilitar la ruta nueva.** Actualizar el comentario y el título "Conoce los otros dos estilos" → "los otros tres estilos". Como `generateStaticParams`/`others`/`getDesign` ya son genéricos sobre `DESIGNS`, no requiere más cambios. Prueba manual: `/disenos/jardin-editorial` renderiza completo (hero, features, fit, comparativa de paquetes, FAQ, "conoce los otros tres estilos" con las tres tarjetas restantes).
5. **`components/landing/DesignGallery.tsx` — grid de 4.** Cambiar `md:grid-cols-3 md:gap-7` a un layout de 4 (`md:grid-cols-2 lg:grid-cols-4`), manteniendo el carrusel horizontal en móvil sin cambios. Prueba manual: en escritorio ancho se ven las 4 tarjetas sin una huérfana sola en su fila; en móvil el carrusel desliza por las 4.
6. **`components/landing/Hero.tsx` — collage de 4 fotos (Propuesta A).** Agregar la cuarta imagen (`design-template-04.png`), sin rotación y al centro, como la de mayor z-index/tamaño (la que queda encima de todas), reacomodando posición/rotación de las 3 existentes para que las 4 quepan sin verse amontonadas ni tapar el H1 en escritorio ni en móvil. Sin chip "4 diseños para elegir" ni badge "Nuevo diseño". Prueba manual: en `/` (escritorio y móvil) se ven las 4 fotos superpuestas, la de `template-04` claramente arriba/al frente, sin overflow horizontal y sin ningún chip/badge nuevo.
7. **Copy de conteo en `FinalCta.tsx`, `HowItWorks.tsx`, `wedding-planners/page.tsx`.** Aplicar los tres cambios de texto exactos del Alcance. Prueba manual: los tres textos dicen "cuatro"/listan los 4 diseños con Jardín Editorial incluido.
8. **`lib/admin-validation.ts` — cuarta opción de template.** Agregar la entrada `template-04` a `TEMPLATE_OPTIONS` con nombre y descripción cortos. Prueba manual: `isTemplateId('template-04')` devuelve `true`.
9. **`components/admin/OperatorTools.tsx` — miniatura del picker.** Agregar `'template-04': '/assets/landing/design-template-04.png'` a `TEMPLATE_IMAGES`. Prueba manual: en el panel de staff, tanto "Nueva invitación" como "Editar invitación" muestran las 4 tarjetas de `TemplatePicker`, incluida "Jardín Editorial" con su miniatura.
10. **`components/sections-v4/ui.tsx` — motivos SVG decorativos.** Agregar `V4Branch`, `V4CornerFlourish` y `V4BgMotif`, calcados de `V3Branch`/`V3CornerFlourish`/`V3BgMotif` pero con `v4Colors` (y una variante `light` con tonos `gold`/`paper` para fondos oscuros). Prueba manual: los tres componentes se exportan y no rompen la build; aún no se ven en ningún template (no están montados todavía).
11. **Montar los motivos en `sections-v4/*`.** Agregar `<V4CornerFlourish>`/`<V4BgMotif>` a `AboutV4`, `CountdownV4` (`light`), `GalleryV4`, `LocationV4`, `TimelineV4` (`light`), `DressCodeV4`, `GiftRegistryV4` (`light`), `AccommodationV4`, `AdultOnlyEventV4`, `RecommendedPlacesV4` y `RSVPV4` (solo en sus estados "enviado" y de formulario, igual que `RSVPV3`), y dos `<V4Branch>` espejados en `FooterV4` (agregando `relative overflow-hidden` al `<footer>`). `HeroV4` no cambia. Prueba manual: visitar `/wedding/template-04-demo` y confirmar que cada sección muestra su floritura de esquina/patrón de fondo sutil, sin afectar la legibilidad del contenido ni el flujo de RSVP.
12. **QA de regresión completa.** `npm run build` sin errores nuevos. Recorrido manual: landing completa (Hero con 4 fotos, galería con 4 tarjetas, FAQ y copys actualizados), `/disenos/jardin-editorial` y las otras tres rutas de diseño, `/wedding-planners`, sitemap (`/sitemap.xml` en dev) incluye la URL nueva, y el panel de staff crea una boda de prueba con `template-04` confirmando que `app/api/admin/weddings/route.ts` la acepta; las bodas mock existentes (`template-01-demo`, `template-02-demo`, `valentina-mateo-2026`, `template-04-demo`) siguen cargando sin error.

## Criterios de aceptación

- [ ] `DESIGNS` en `lib/marketing-content.ts` tiene 4 entradas, incluida `slug: 'jardin-editorial'` / `templateId: 'template-04'`, con todos los campos de `DesignContent` llenos.
- [ ] `components/landing/DesignGallery.tsx` muestra 4 tarjetas de diseño en la landing, sin una tarjeta huérfana sola en su fila en escritorio.
- [ ] El Hero de la landing (`/`) muestra un collage de 4 fotos superpuestas, con la foto de `template-04` visiblemente arriba/al frente de las otras 3, sin ningún chip "4 diseños para elegir" ni badge "Nuevo diseño".
- [ ] `sections-v4/ui.tsx` exporta `V4Branch`, `V4CornerFlourish` y `V4BgMotif`; se ven montados (floritura de esquina y/o patrón de fondo sutil) en las 11 secciones de `template-04` que van sobre `V4Section` y en `FooterV4`; `HeroV4` no los usa.
- [ ] `/disenos/jardin-editorial` renderiza sin error 404, con su propio `h1`, demo real (`/wedding/template-04-demo`) y sección "Conoce los otros tres estilos" mostrando Clásico, Moderno y Botánica Editorial.
- [ ] Las respuestas de FAQ `'¿Qué diseños puedo elegir?'` y `'¿Puedo ver cómo se ve antes de contratar?'` mencionan los 4 diseños/4 demos, en la landing y en `/preguntas-frecuentes`.
- [ ] `components/landing/FinalCta.tsx`, `components/landing/HowItWorks.tsx` y `app/wedding-planners/page.tsx` (`STEPS[0]`) mencionan "cuatro" diseños e incluyen "Jardín Editorial" en la lista de nombres.
- [ ] `lib/site.ts` (`MARKETING_PAGES`) incluye `/disenos/jardin-editorial`; el sitemap generado en `/sitemap.xml` la lista.
- [ ] El panel de staff (`components/admin/OperatorTools.tsx`, tanto "Nueva invitación" como "Editar invitación") muestra 4 opciones en `TemplatePicker`, incluida "Jardín Editorial" con su miniatura (`design-template-04.png`).
- [ ] `lib/admin-validation.ts`: `isTemplateId('template-04')` devuelve `true` y `TEMPLATE_OPTIONS` tiene 4 elementos.
- [ ] Crear o editar una boda real desde el panel de staff con `template-04` seleccionado se guarda correctamente (la validación de servidor en `app/api/admin/weddings/route.ts` / `[weddingId]/route.ts` acepta el valor).
- [ ] `npm run build` no introduce errores nuevos.
- [ ] Ninguna otra sección de la landing (`PriceStrip`, `MesasSection`, `Features`, `EditorSection`, `AiSection`, `Packages`, `ProcessSection`, `PlannerCta`), ninguna otra pregunta de `FAQ_ITEMS`, ni ningún campo de `PACKAGES` cambia de contenido respecto a antes de este spec.

## Decisiones tomadas y descartadas

- **Nombre público "Jardín Editorial", igual al nombre interno de SPEC 19:** decisión explícita del usuario, consistente con cómo `template-03` se llama "Botánica Editorial" tanto interna como públicamente.
- **Orden de los 4 diseños por número de template (Jardín Editorial al final):** decisión explícita del usuario; es el orden menos disruptivo, ya que `DESIGNS`, la galería, `/disenos` y el picker de staff simplemente agregan una cuarta entrada al final sin reordenar las tres existentes.
- **Rediseñar el Hero para mostrar las 4 fotos superpuestas, en vez de quitar una:** decisión explícita del usuario tras plantear la alternativa de quitar `template-01`; prefirió expandir el collage a 4 imágenes con `template-04` arriba de todas, sobre reducir la variedad visual del Hero a 3 de 4 diseños disponibles.
- **Sin generalizar el conteo de diseños pensando en un futuro 5º template:** decisión explícita del usuario. Aunque mencionó que podrían sumarse más templates sin fecha definida, se prefirió repetir el mismo patrón manual usado para `template-02`/`template-03` en vez de invertir en generalización especulativa (los números en palabras en español, como "tres"/"cuatro", no se prestan a interpolación simple desde `DESIGNS.length`); si se confirma un 5º template real, ese spec futuro repite este mismo tipo de cambios acotados.
- **Incluir el panel de staff (`lib/admin-validation.ts`, `OperatorTools.tsx`) en este spec, no en uno aparte:** decisión explícita del usuario, tras confirmarse por lectura de código que sin este cambio ninguna boda real puede asignarse a `template-04` — el diseño quedaría solo como demo pública, nunca vendible.
- **Reutilizar las 4 imágenes ya existentes (`design-template-0{1..4}`) en el Hero rediseñado, sin generar recortes dedicados nuevos:** el asset `design-template-04.png` ya fue agregado por el usuario en esta sesión; no hay pedido de generar variantes adicionales como la `-2` que existe solo para `template-03`.
- **`/paquetes` no se toca más allá de heredar el texto corregido de FAQ vía `getFaq`:** no hubo pedido explícito de rediseñar esa página en esta sesión; se mantiene fuera de alcance, igual que se decidió no tocar su tabla comparativa en SPEC 18.
- **Hero y galería: Propuesta A de las dos exploradas en el canvas de diseño, sin el chip ni el badge del mockup:** decisión explícita del usuario tras revisar ambas propuestas (`https://claude.ai/artifact/T4EYRN3QudTLf12g67aiKj`) — Propuesta A ("cuarteto igualitario": collage de 4 fotos con trato visual parejo, galería en 4 columnas iguales) en vez de la Propuesta B ("Jardín Editorial protagonista"); el chip "4 diseños para elegir" y el badge "Nuevo diseño" que sí llevaba el mockup de la Propuesta A se descartan explícitamente para el código final.
- **Agregar motivos SVG decorativos a `sections-v4` (revirtiendo la exclusión original de este spec):** decisión explícita del usuario durante `/spec-impl`, pese a que la primera versión de este spec lo marcaba fuera de alcance por pertenecer a SPEC 19. Se implementa calcando el patrón ya usado en `sections-v3` (`V3Branch`/`V3CornerFlourish`/`V3BgMotif`) con la paleta de `template-04`, en vez de inventar un lenguaje decorativo nuevo, para mantener consistencia entre templates. Se excluye `HeroV4` de estos motivos por decisión de diseño de esta sesión (no de SPEC 19): su composición es una foto de fondo full-bleed, sin una columna de color plano equivalente a la de `HeroV3` donde montar la rama SVG.
- **Implementar sobre la rama actual (`spec-19-template-04-jardin-editorial`), sin crear `spec-20-lanzamiento-template-04-jardin-editorial`:** decisión explícita del usuario al invocar `/spec-impl`, por tratarse de trabajo directamente continuo sobre lo que SPEC 19 dejó en esa misma rama.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El collage de 4 fotos en el Hero puede verse amontonado o tapar el H1 en pantallas angostas, al agregar una capa más sobre un layout pensado para 3 | El paso 6 exige probar manualmente escritorio y móvil antes de dar el criterio por cumplido; si no cabe bien, se ajustan tamaños/posiciones de las 4 capas, no se vuelve a 3 fotos (decisión ya tomada) |
| Ampliar `DESIGNS` de 3 a 4 sin ajustar el grid de `DesignGallery.tsx` podría dejar una tarjeta sola en su fila | El paso 5 cambia explícitamente el grid a un breakpoint de 4 columnas (`lg:grid-cols-4`) antes de dar el criterio por cumplido |
| Agregar `template-04` a `TEMPLATE_OPTIONS` sin revisar las rutas de servidor podría dejar el picker mostrando la opción pero el guardado fallando si `isTemplateId` no reconociera el valor | Mitigado: `TemplateId`/`isTemplateId` se derivan automáticamente de `TEMPLATE_OPTIONS` (no hay una lista separada que sincronizar a mano), confirmado por lectura de `lib/admin-validation.ts` |
| Los textos con números fijos ("cuatro diseños") requieren tocar 5 archivos distintos (`marketing-content.ts`, `FinalCta.tsx`, `HowItWorks.tsx`, `disenos/[slug]/page.tsx`, `wedding-planners/page.tsx`); es fácil olvidar alguno | El paso 7 y el criterio de aceptación correspondiente los listan explícitamente uno por uno |

## Lo que **no** está en este spec

- Cambios al componente `Template04.tsx` o a `sections-v4/*` (SPEC 19, ya implementado).
- Generalización del conteo de diseños para un futuro 5º template.
- Generación de assets de imagen nuevos (`design-template-04.png` ya existe).
- Cambios a `Template04.tsx` o a los datos de `mockWeddingTemplate04Demo`.
- Traducción de la landing o páginas de marketing a inglés.
- Fila/columna nueva en la tabla comparativa de `/paquetes`.
- Eventos de analítica nuevos.

Cada uno de estos, si se decide hacer, va en su propio spec.
