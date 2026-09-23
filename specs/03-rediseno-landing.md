# 03 — Rediseño de la landing informativa

**Estado:** Approved
**Depende de:** Ninguno
**Fecha:** 2026-09-22

## Objetivo

Rediseñar la landing informativa que se accede desde `/` (`components/LandingPage.tsx`) aplicando el sistema visual "Romance Editorial" ya validado en el canvas de Design (`https://claude.ai/artifact/KgUyCyodxu7WqVHcHR5fZy`), modularizándola en `components/landing/*.tsx` con un hero y contenido reescritos para comunicar mejor la propuesta de valor real —incluyendo por primera vez que existen 3 diseños de invitación distintos y un bloque de "cómo funciona"—, y corrigiendo las inconsistencias de datos detectadas en `components/StructuredData.tsx`.

## Contexto

`components/LandingPage.tsx` es hoy un único archivo de ~650 líneas con todas las secciones inline (header, hero, features, panel de administración, paquetes, demo, CTA de wedding planner, footer), sin componentes compartidos ni tokens de diseño propios. Se renderiza desde `app/page.tsx` (ruta `/`) junto a `<StructuredData />`. La ruta `app/[locale]/page.tsx` (`/es`, `/en`) es algo distinto —un preview de invitación de boda con datos mock por defecto (`components/sections/*`)— y no es la landing informativa de la que habla este spec.

En esta misma sesión se generaron 3 propuestas visuales completas en un canvas de Design: "Romance Editorial" (evolución premium del estilo actual, ivory/terracota, serif Fraunces), "Lujo Noir" (negro/dorado, más dramático) y "Cálida y Cercana" (crema/salvia, bento-grid). El usuario eligió **Romance Editorial** como base.

Con el spec ya en borrador, se generó un segundo canvas de Design con 2 propuestas de **ejecución** sobre ese mismo sistema visual, ambas cubriendo la arquitectura completa de secciones de este spec (`https://claude.ai/artifact/54Q41PPrmuX7wJhEgqekUe`): "A · Escaparate Editorial" (estática, hero con 3 tarjetas de diseño abanicadas, "Cómo funciona" como línea de tiempo horizontal, galería de diseños con 3 tarjetas iguales) y "B · Vitrina Interactiva" (selector de estilo funcional en el Hero, panel de administración con tabs interactivos, galería en bento asimétrico). El usuario eligió el **artboard "A · Escaparate Editorial"** como referencia visual definitiva de este spec.

Revisión del código real hecha antes de este spec (no asumida):

- El proyecto ya tiene **3 templates de invitación en producción**: `template-01` (`components/sections/*`, spec 02), `template-02` (`components/sections-v2/*`, spec 02) y `template-03` "Botánica Editorial" (`components/sections-v3/*`, spec 01). Hay bodas mock dedicadas para cada uno en `src/data/mockData.ts`: `template-01-demo` (Sofía & Diego, sin `template.id` explícito → cae en el fallback `template-01` de `WeddingTemplate.tsx`), `template-02-demo` (Camila & Andrés, `template: { id: 'template-02' }`) y `valentina-mateo-2026` (Valentina & Mateo, `template: { id: 'template-03' }`). La landing actual **no menciona en absoluto** que existan varios diseños.
- La landing hoy enlaza un solo ejemplo, `maria-carlos-2025` (sin `template.id` explícito → también renderiza con `template-01`), en la sección "Ejemplos" (`href="/es/wedding/maria-carlos-2025"`). Es el mismo diseño que `template-01-demo`, por lo que queda redundante frente a una futura galería de los 3 diseños reales.
- `components/StructuredData.tsx` tiene **datos inconsistentes con el resto de la página**: `contactPoint.telephone` es `"+52-55-74889849"`, mientras que toda la landing (WhatsApp CTA, footer) usa `+52 960 246 0590`. El `serviceSchema.offers` declara `"price": "0"` para el Paquete Básico y `"price": "Consultar"` para el Personalizado, cuando los precios reales mostrados en pantalla son $2,000 MXN y $2,400 MXN.
- Los paquetes y sus precios ($2,000 Básico / $2,400 Personalizado MXN) siguen vigentes (confirmado por el usuario). El desglose línea-por-línea original (16+6 ítems Básico, 22 ítems Personalizado) se agrupó por categoría durante la revisión de este mismo spec por ser demasiado extenso para leerse cómodamente (ver Alcance y Decisiones) — no se perdió información, solo se consolidó.
- El texto original de "Soporte extendido (15 días pre-evento)" era incorrecto: el usuario confirmó que la ventana real de soporte/cambios pre-evento es de **7 días**, no 15 (no confundir con los 15 días de hosting post-evento, que sí siguen siendo 15).
- El panel para que la pareja edite su propia invitación (sin depender de Invyta) es un diferenciador exclusivo del **Paquete Personalizado** — en el Básico, Invyta gestiona los cambios de contenido.
- Los datos de contacto reales (`hola@invyta.me`, `+52 960 246 0590`) siguen vigentes (confirmado por el usuario).
- Las capturas `public/assets/landing/admin-boda.png` y `admin-invitados.png` (usadas en la sección de panel de administración) siguen representando el producto actual (confirmado por el usuario) y se reutilizan tal cual.
- El proyecto ya tiene el patrón de "sección + `ui.tsx` compartido con tokens propios, sin tocar `tailwind.config.ts`" en `components/sections-v2/ui.tsx` y `components/sections-v3/ui.tsx` (specs 01 y 02) — este spec sigue el mismo criterio para no afectar otras páginas que sí usan el tema global de Tailwind.

## Alcance

**Incluye:**

- Nuevo `components/landing/ui.tsx`: tokens de paleta "Romance Editorial" (`#FBF7F1` ivory, `#211D19`/`#2B2622` charcoal, `#C6663C` terracota, `#7C8363` sage) como constantes propias del archivo (sin tocar `tailwind.config.ts`, mismo criterio que specs 01 y 02), y helpers compartidos (`LSection`, `LReveal`, `LStagger`, `LCard`, `LButton`, `LSolidButton`, `LDivider`, `LEyebrow`) con animaciones vía `framer-motion` (`whileInView`, mismo patrón que `V2Reveal`) respetando `prefers-reduced-motion`.
- Modularización de `components/LandingPage.tsx` en secciones bajo `components/landing/`: `Nav.tsx`, `Hero.tsx`, `HowItWorks.tsx` (nueva), `TrustStrip.tsx`, `DesignGallery.tsx` (nueva), `Features.tsx`, `AdminProof.tsx`, `Packages.tsx`, `PlannerCta.tsx`, `Footer.tsx`. `LandingPage.tsx` pasa a ser solo el contenedor que las importa y monta en orden, conservando `<StructuredData />`.
- `Hero.tsx` reescrito: nuevo headline/subheadline con una propuesta de valor concreta (ya no solo "fácil y elegante"), la franja de 3 iconos de features ya existente (página web personalizada, RSVP fácil, diseño elegante), y un mini-preview de los 3 templates (tres tarjetas pequeñas, una por diseño) en lugar de una sola foto de stock — cada tarjeta enlaza a su demo real.
- `HowItWorks.tsx` (nueva sección, ubicada justo después del Hero): 3 pasos — "Personaliza tu invitación", "Compártela por WhatsApp o link único", "Gestiona confirmaciones en tiempo real" — usando contenido y capacidades reales del producto, no genérico.
- `DesignGallery.tsx` (nueva sección "Elige tu diseño"): 3 tarjetas, una por template (`Clásico` / `Moderno` / `Botánica Editorial`), cada una con una imagen de referencia real y un CTA que abre en pestaña nueva hacia `/es/wedding/template-01-demo`, `/es/wedding/template-02-demo` y `/es/wedding/valentina-mateo-2026` respectivamente.
- 3 imágenes nuevas de referencia para `DesignGallery.tsx`, capturadas de las demos reales (no fotos de stock): `public/assets/landing/design-template-01.jpg`, `design-template-02.jpg`, `design-template-03.jpg`.
- `TrustStrip.tsx`: franja de confianza ya existente (entrega en 7 días hábiles, RSVP en tiempo real, disponible en ES/EN, hosting incluido) migrada a los nuevos helpers, mismo contenido.
- `Features.tsx` ("Todo lo que incluye tu invitación"): contenido nuevo, grid 3×2 — Cronograma y mapa del evento, Mesa de regalos y hospedaje recomendado, Código de vestimenta, Evento solo para adultos, Música en tu invitación (el/la couple elige la canción), Envíos e invitaciones ilimitadas. Reemplaza el contenido actual (Express, Sustentable, Económica, Invitaciones ilimitadas, Links personalizados, Gestión inteligente) porque, con las secciones nuevas de este spec, queda mayormente redundante: "Express" ya lo dice el Hero y la `TrustStrip`, "Links personalizados" y "Gestión inteligente" ya los explica `HowItWorks`, y "Económica" choca de tono con el posicionamiento "elegante" del Hero. El contenido nuevo son capacidades reales del producto (hoy solo visibles en la letra chica de `Packages.tsx`) que ninguna otra sección menciona todavía.
- `AdminProof.tsx`: sección de panel de administración migrada, reutilizando `admin-boda.png`/`admin-invitados.png` existentes.
- `Packages.tsx`: mismos precios ($2,000 / $2,400 MXN). El desglose se agrupa por categoría en vez de un ítem por línea — Básico: "Tu página web", "Contenido de tu boda", "Logística para invitados", "RSVP y gestión" (incluye), más un "No incluye" condensado (personalización por invitado); Personalizado: "Tu página web", "Contenido a tu medida", "Logística para invitados", "Panel de edición y gestión" (exclusivo de este paquete — la pareja edita su invitación y gestiona invitados sin depender de Invyta), "Personalización 1:1", "Soporte" (7 días antes del evento, corregido de "15 días" que era incorrecto). Cada categoría conserva toda la información original, solo consolidada en una frase en vez de listarse ítem por ítem.
- `PlannerCta.tsx`: CTA final para wedding planners con el mismo mensaje, sin el enlace duplicado a `maria-carlos-2025` (ya cubierto por `DesignGallery.tsx`).
- `Footer.tsx`: mismos datos de contacto (`hola@invyta.me`, `+52 960 246 0590`) y enlaces de navegación, con el nuevo sistema visual.
- Corrección de `components/StructuredData.tsx`: `contactPoint.telephone` pasa de `"+52-55-74889849"` a `"+52 960 246 0590"`; `serviceSchema.offers` actualiza el Paquete Básico a `"price": "2000"` y el Personalizado a `"price": "2400"` (ambos con `"priceCurrency": "MXN"`, eliminando el `priceSpecification` con `"Consultar"`).
- Verificación manual de `/` en viewport desktop y mobile: todos los CTAs (WhatsApp, anclas internas, enlaces a las 3 demos) funcionan y no hay errores de consola.

**No incluye:**

- No se toca `app/[locale]/page.tsx` (renderiza un preview de template de boda con datos mock por defecto; no es la landing informativa de este spec).
- No se modifica `tailwind.config.ts` ni ninguna paleta global de Tailwind.
- No se agrega internacionalización a la landing; sigue siendo solo en español, igual que hoy (`app/page.tsx` no tiene variante `/en`).
- No se agregan testimonios ni cifras de clientes — no hay datos reales disponibles y se evita inventar prueba social falsa.
- No se cambian los precios de los paquetes ni las capacidades reales que incluyen — solo se reagrupa cómo se listan (ver Alcance) y se corrige el dato de "15 días" → "7 días" de soporte pre-evento.
- No se toman capturas nuevas del panel de administración; se reutilizan `admin-boda.png`/`admin-invitados.png` ya existentes.
- No se modifican `Template01`/`Template02`/`Template03` ni sus bodas mock (`template-01-demo`, `template-02-demo`, `valentina-mateo-2026`); solo se enlazan desde la landing.
- No se cambia el número de WhatsApp ni el email de contacto — se confirmaron vigentes.
- No se implementa un selector de diseño dentro del flujo de compra/creación real; `DesignGallery.tsx` es una vitrina de ejemplos con enlaces a demos existentes, no un flujo funcional de elección de template.
- No se reproduce en este documento cada valor exacto de color/espaciado del canvas; la referencia visual de precisión es el artboard **"A · Escaparate Editorial"** del segundo canvas de Design (`https://claude.ai/artifact/54Q41PPrmuX7wJhEgqekUe`), no una re-descripción textual. El primer canvas (`https://claude.ai/artifact/KgUyCyodxu7WqVHcHR5fZy`) sigue siendo la referencia de dónde salió el sistema de color/tipografía "Romance Editorial" en sí.

## Datos

No se introducen tipos ni estructuras de datos globales nuevas (`WeddingData` no cambia). El contenido de cada sección de la landing vive como constantes locales dentro de su propio archivo en `components/landing/`, mismo patrón que usan hoy `components/sections/*.tsx` (sin un `content.json` centralizado, al no haber necesidad de reutilizar este contenido fuera de la landing).

Forma de los datos locales de `DesignGallery.tsx`, a modo de referencia:

```ts
const designs = [
  {
    id: 'template-01',
    name: 'Clásico',
    description: 'Serif elegante, monograma en sello y detalles botánicos mínimos.',
    demoHref: '/es/wedding/template-01-demo',
    image: '/assets/landing/design-template-01.jpg',
  },
  {
    id: 'template-02',
    name: 'Moderno',
    description: 'Sans-serif geométrica, anillos concéntricos y acentos de línea botánica.',
    demoHref: '/es/wedding/template-02-demo',
    image: '/assets/landing/design-template-02.jpg',
  },
  {
    id: 'template-03',
    name: 'Botánica Editorial',
    description: 'Hero en arco, motivos botánicos dibujados a mano y countdown en vivo.',
    demoHref: '/es/wedding/valentina-mateo-2026',
    image: '/assets/landing/design-template-03.jpg',
  },
];
```

## Plan de implementación

1. Crear `components/landing/ui.tsx` con los tokens de paleta "Romance Editorial" y los helpers (`LSection`, `LReveal`, `LStagger`, `LCard`, `LButton`, `LSolidButton`, `LDivider`, `LEyebrow`) usando `framer-motion` y respetando `prefers-reduced-motion`. No se monta en ningún componente todavía — no cambia nada visible.
2. Capturar las 3 imágenes nuevas de referencia: `npm run dev`, visitar `/es/wedding/template-01-demo`, `/es/wedding/template-02-demo` y `/es/wedding/valentina-mateo-2026`, y guardar una captura representativa de cada hero en `public/assets/landing/design-template-01.jpg`, `design-template-02.jpg` y `design-template-03.jpg`.
3. Crear `components/landing/Nav.tsx` y `components/landing/Footer.tsx`, migrando el header y footer actuales con los nuevos helpers/tokens, mismo contenido, enlaces y datos de contacto.
4. Crear `components/landing/Hero.tsx`: nuevo headline/subheadline, franja de 3 iconos de features existente, y el mini-preview de los 3 templates (usa las imágenes del paso 2, cada tarjeta enlaza a su demo).
5. Crear `components/landing/HowItWorks.tsx` (nueva sección, 3 pasos).
6. Crear `components/landing/TrustStrip.tsx`, migrando el contenido existente de la franja de confianza.
7. Crear `components/landing/DesignGallery.tsx` (nueva sección "Elige tu diseño"), reutilizando las imágenes del paso 2.
8. Crear `components/landing/Features.tsx` ("Todo lo que incluye tu invitación") con el nuevo contenido de 6 tarjetas en grid 3×2 (ver Alcance).
9. Crear `components/landing/AdminProof.tsx`, migrando la sección de panel de administración con `admin-boda.png`/`admin-invitados.png` existentes.
10. Crear `components/landing/Packages.tsx`, con los mismos precios y el desglose agrupado por categoría (ver Alcance), incluyendo la corrección de "15 días" a "7 días" de soporte pre-evento.
11. Crear `components/landing/PlannerCta.tsx`, migrando el CTA de wedding planner sin el enlace duplicado a `maria-carlos-2025`.
12. Reescribir `components/LandingPage.tsx` para que monte `Nav`, `Hero`, `HowItWorks`, `TrustStrip`, `DesignGallery`, `Features`, `AdminProof`, `Packages`, `PlannerCta`, `Footer` en ese orden, conservando `<StructuredData />`.
13. Corregir `components/StructuredData.tsx`: teléfono y precios de `offers` (ver Alcance), revisando que los anchors (`#funcionalidades`, `#paquetes`, `#ejemplos` o los que resulten del nuevo markup) del `breadcrumbSchema` sigan apuntando a secciones existentes.
14. Verificación manual: `npm run dev`, visitar `/` en viewport desktop y mobile, probar todos los CTAs (WhatsApp, anclas internas, enlaces a las 3 demos) y confirmar ausencia de errores de consola.
15. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.

## Criterios de aceptación

- [ ] `components/landing/ui.tsx` existe con los tokens y helpers "Romance Editorial"; ninguna sección de `components/landing/` usa colores hardcodeados fuera de ese archivo.
- [ ] `components/LandingPage.tsx` ya no contiene JSX de secciones inline; solo importa y monta los componentes de `components/landing/*.tsx` junto a `<StructuredData />`.
- [ ] El Hero muestra un headline distinto al actual ("Tu invitación digital de boda, fácil y elegante") y un mini-preview de los 3 templates, cada uno enlazando a su demo (`/es/wedding/template-01-demo`, `/es/wedding/template-02-demo`, `/es/wedding/valentina-mateo-2026`).
- [ ] Existe una sección "Cómo funciona" con 3 pasos, visible entre el Hero y la franja de confianza.
- [ ] Existe una sección "Elige tu diseño" con 3 tarjetas (una por template), cada una con imagen propia y enlace a su demo correspondiente en pestaña nueva.
- [ ] La sección "Todo lo que incluye tu invitación" (`Features.tsx`) muestra las 6 tarjetas nuevas (Cronograma y mapa, Mesa de regalos y hospedaje, Código de vestimenta, Evento solo para adultos, Música en tu invitación, Envíos ilimitados) y ya no muestra el contenido anterior (Express, Sustentable, Económica, Links personalizados, Gestión inteligente).
- [ ] Las 3 imágenes `public/assets/landing/design-template-01.jpg`, `design-template-02.jpg` y `design-template-03.jpg` existen y se muestran correctamente en `DesignGallery.tsx`.
- [ ] La sección de Paquetes muestra los mismos precios (Básico $2,000 MXN, Personalizado $2,400 MXN) con el desglose agrupado por categoría (ver Alcance); "Panel de edición y gestión" aparece solo en Personalizado, no en Básico; el texto de soporte dice "7 días antes del evento", no "15 días".
- [ ] `components/StructuredData.tsx` — `contactPoint.telephone` es `"+52 960 246 0590"` y `serviceSchema.offers` muestra `"2000"`/`"2400"` como precios en vez de `"0"`/`"Consultar"`.
- [ ] El Footer nuevo muestra `hola@invyta.me` y `+52 960 246 0590` como datos de contacto.
- [ ] La landing ya no enlaza directamente a `maria-carlos-2025` (queda reemplazado por `DesignGallery.tsx`).
- [ ] Todas las animaciones nuevas respetan `prefers-reduced-motion` (se pueden desactivar sin romper el layout).
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.
- [ ] Visitar `/` en desktop y mobile no muestra errores de consola y todos los CTAs (WhatsApp, anclas, enlaces a las 3 demos) funcionan.

## Decisiones tomadas y descartadas

- **Base visual "Romance Editorial" (no "Lujo Noir" ni "Cálida y Cercana")**: decisión explícita del usuario — evolución del estilo actual con menor riesgo de marca, en vez de un giro completo de identidad.
- **Modularizar en `components/landing/*.tsx` con un `ui.tsx` compartido, en vez de mantener todo en `LandingPage.tsx`**: decisión explícita del usuario; sigue el mismo patrón ya usado por `sections/`, `sections-v2/` y `sections-v3/` (specs 01 y 02).
- **Mostrar los 3 templates con una galería/selector dedicado, no solo mencionarlo en texto**: decisión explícita del usuario — es una ventaja competitiva real que hoy no se comunica en absoluto.
- **Sin testimonios ni cifras de clientes**: decisión explícita del usuario; no hay datos reales disponibles y se evita inventar prueba social falsa.
- **`maria-carlos-2025` se retira como demo enlazado desde la landing**: usa el mismo diseño que `template-01-demo` (ambos sin `template.id` explícito, ambos caen en el fallback `template-01`), por lo que queda redundante frente a la nueva `DesignGallery.tsx`.
- **Precios de paquetes sin cambios**: confirmados vigentes por el usuario.
- **Desglose de paquetes agrupado por categoría (no ya un ítem por línea)**: decisión explícita del usuario tras ver el artboard con las demás secciones nuevas — 16+6 y 22 ítems sueltos por tarjeta eran demasiado extensos para leerse. Se agrupó en 4 categorías (Básico) y 6 (Personalizado), sin quitar ninguna capacidad real, solo consolidando la redacción.
- **"Panel de edición y gestión" exclusivo del Paquete Personalizado**: decisión explícita del usuario — es el diferenciador que justifica el precio mayor; en el Básico, Invyta gestiona los cambios de contenido por la pareja.
- **Corrección "15 días" → "7 días" de soporte pre-evento**: dato incorrecto detectado por el usuario (no confundir con los 15 días de hosting post-evento, que sí son correctos y no cambiaron).
- **Capturas nuevas y reales para `DesignGallery.tsx` en vez de reutilizar `hero.png`**: `hero.png` es una foto de stock genérica, no una captura de ningún template real; se decide capturar las 3 demos existentes para que la vitrina sea honesta con lo que el producto realmente entrega.
- **Capturas del panel de administración se reutilizan tal cual**: confirmadas vigentes por el usuario.
- **Corrección de `components/StructuredData.tsx` (teléfono y precios del schema SEO)**: inconsistencia real detectada durante la revisión de código, no una decisión de diseño — se corrige para que el schema no contradiga el contenido visible de la página.
- **Nueva sección "Cómo funciona"**: propuesta del asistente tras análisis de mercado (competidores del sector siempre reducen la fricción de "¿esto es complicado?" con un bloque de 3 pasos); aprobada por el usuario.
- **Contenido de `Features.tsx` reemplazado (no solo reestilizado)**: al revisar el artboard "A · Escaparate Editorial" ya con `HowItWorks`, `TrustStrip` y `DesignGallery` en la misma página, el usuario notó que el contenido original (Express, Sustentable, Económica, Invitaciones ilimitadas, Links personalizados, Gestión inteligente) quedaba mayormente redundante con esas secciones nuevas, y que "Económica" contradecía el tono "elegante" del Hero. Se decidió reemplazarlo por 6 capacidades reales del producto que hoy solo aparecen en la letra chica de `Packages.tsx` (cronograma/mapa, mesa de regalos/hospedaje, código de vestimenta, evento solo adultos, música en la invitación, envíos ilimitados) — mismo criterio de "no inventar nada" que el resto del spec, solo reorganiza contenido real ya existente en el producto.
- **Sin internacionalización de la landing**: mantiene el comportamiento actual (`app/page.tsx` no tiene variante `/en`); fuera de alcance de este spec.
- **Sin cambios a `app/[locale]/page.tsx`**: es una ruta distinta (preview de template de boda con datos por defecto), no la landing informativa que pidió el usuario.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Deriva visual entre el canvas de Design (`.dc.html`) y el código real (Tailwind/React) | No se considera defecto si el resultado es visualmente equivalente aunque no sea pixel-perfect contra el canvas (mismo criterio que specs 01 y 02). |
| Las capturas de `DesignGallery.tsx` dependen del contenido actual de `template-01-demo`/`template-02-demo`/`valentina-mateo-2026`, que podría cambiar a futuro | Son imágenes estáticas, no un iframe en vivo; si el contenido de esas bodas mock cambia sustancialmente, las capturas deben regenerarse en un spec futuro. |
| Alcance grande (10 componentes de sección nuevos + `ui.tsx` + `StructuredData`) | El plan de implementación deja el sistema funcional en cada paso (pasos 1–11 no montan nada hasta el paso 12), por lo que se puede pausar y retomar sin dejar la landing rota a medio camino. |

## Lo que NO está en este spec

- Internacionalización de la landing (`/en`).
- Testimonios o prueba social con cifras.
- Cambios a `app/[locale]/page.tsx`, a `Template01`/`Template02`/`Template03` o a sus bodas mock.
- Un flujo real de selección de template dentro de la creación de una invitación (la galería de la landing es solo una vitrina de ejemplos).
- Cambios a `tailwind.config.ts` o a la paleta global de Tailwind.

Cada uno de estos, si se decide hacer, va en su propio spec.
