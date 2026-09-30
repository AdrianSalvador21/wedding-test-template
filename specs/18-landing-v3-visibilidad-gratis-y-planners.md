# 18 — Landing v3: visibilidad del modo gratis y mensaje real de wedding planners

**Estado:** Approved
**Depende de:** SPEC 14, SPEC 15, SPEC 16, SPEC 17
**Fecha:** 2026-09-30

## Objetivo

Reordenar y aligerar la comunicación de la landing pública y de las páginas de marketing relacionadas para que el modo gratuito de invitados y mesas sea visible desde el primer scroll y el mensaje de wedding planner refleje el panel real de múltiples bodas por cuenta, sin mostrar nunca precios de invitaciones en ese mensaje.

## Contexto

Investigación hecha en esta sesión (código real, sin asumir), leyendo `components/LandingPage.tsx` y sus 13 secciones, `app/wedding-planners/page.tsx`, `app/paquetes/page.tsx`, `app/preguntas-frecuentes/page.tsx` y `lib/marketing-content.ts`:

- **La landing pública (`components/LandingPage.tsx`) tiene 13 secciones de contenido en un solo scroll**, sin paginar ni colapsar nada: `Hero → PriceStrip → DesignGallery → HowItWorks → Features → EditorSection → MesasSection → AiSection → Packages → ProcessSection → FAQ → PlannerCta → FinalCta`. `EditorSection` y `AiSection` (specs 15/14) son demos interactivas completas (inputs editables, tabs, generador de texto en vivo), cada una del tamaño de una sección propia.
- **El modo gratuito (spec 16) se comunica en un solo lugar de esas 13 secciones**: dentro de `MesasSection.tsx` (la sección #7), vía un eyebrow ("Gratis, sin plantilla ni editor"), una viñeta de confianza ("Empieza sin costo") y el botón "Crear mi cuenta gratis" → `/login?mode=signup`. No aparece en `Hero.tsx`, ni en `Nav.tsx` (que hoy no tiene ningún enlace hacia `/login`, solo un botón de WhatsApp), ni en `PriceStrip.tsx`, ni en `FinalCta.tsx`. Alguien que no llega a hacer scroll hasta la sección 7 nunca se entera de que existe un plan gratis.
- **El orden actual antepone dos secciones "Exclusivo Paquete Personalizado" (`EditorSection`, `AiSection`) al CTA gratis de `MesasSection`**, así que quien navega linealmente ve primero un discurso 100% de pago antes de conocer que organizar invitados y mesas no cuesta nada.
- **`Hero.tsx` tiene un único CTA de conversión (WhatsApp "Crea tu invitación") y un link secundario hacia una demo de diseño** (`DEMO_HREF = getDesign('botanica-editorial')!.demoHref`). Ningún elemento del Hero apunta a `/login`.
- **`lib/marketing-content.ts` tiene una contradicción real con el spec 16**: `PACKAGES[0].notIncluded` (Paquete Básico) dice literalmente que ese paquete "No incluye: Personalización por invitado (...), el asistente con IA ni la gestión de mesas." Como esa cadena se renderiza tal cual en `app/paquetes/page.tsx` (`PackageCard`), la página de precios da a entender que hay que comprar el Personalizado para tener mesas — cuando en realidad organizar invitados y mesas ya es gratis con cualquier cuenta, sin comprar ningún paquete (spec 16). La única pregunta de la FAQ que sí lo aclara (`'¿La gestión de mesas viene en el Paquete Básico?'`) no se muestra en `/paquetes`, solo en la landing y en `/preguntas-frecuentes`.
- **La pregunta `'¿Cuánto cuesta una invitación digital de boda con Invyta?'` (la primera que mostraría cualquier buscador) tampoco menciona el modo gratis**, solo los dos precios de paquete.
- **`app/paquetes/page.tsx` no menciona el modo gratuito en ningún punto**: quien llega directo a esa URL (nav "Paquetes", SEO) nunca ve que organizar invitados y mesas es gratis; solo ve la comparativa Básico/Personalizado.
- **El mensaje de wedding planner (landing y página dedicada) no refleja el spec 17.** `components/landing/PlannerCta.tsx` dice "Una invitación y un panel de invitados por cada cliente, con el mismo cuidado y sin rehacer trabajo." y `app/wedding-planners/page.tsx` vende un proceso 100% manual por WhatsApp ("Cuéntanos cuántas bodas manejas"), sin mencionar que ya existe un panel real donde el planner ve **todas** sus bodas con un solo inicio de sesión (`plannerEmail`, "Mis invitaciones" filtrando por correo — spec 17). La funcionalidad ya se construyó; el copy no se actualizó.
- **`app/wedding-planners/page.tsx` tiene además una sección de precios públicos** (`Section tone="white"` con `PACKAGES.map(...)`, mostrando $2,200/$2,600 MXN, líneas 133-163) que no encaja con cómo se vende hoy a los planners: el usuario confirmó en esta sesión que el convenio con cada wedding planner se negocia de forma personal (niveles Aliado/Partner/Partner Elite por volumen, ya definidos fuera de este spec), así que anclar el precio público de una invitación individual en esa página es ruido, no ayuda a la negociación.
- **`app/preguntas-frecuentes/page.tsx` no tiene código propio que tocar**: renderiza `FAQ_ITEMS` agrupado (`groupFaq`), así que cualquier corrección de texto en `lib/marketing-content.ts` se refleja ahí automáticamente.

## Alcance

**Incluye:**

- **`components/landing/Nav.tsx`:** nuevo link "Inicia sesión" (`href: '/login'`) agregado al arreglo `links`, después de "Preguntas frecuentes" y antes del botón de WhatsApp — aparece igual en el menú de escritorio y en el menú móvil, porque ambos ya iteran el mismo arreglo.
- **`components/landing/Hero.tsx`:** el link secundario "Ver una invitación de ejemplo →" (que usa `DEMO_HREF`) se reemplaza por un link "Organiza tu boda gratis →" hacia `/login?mode=signup`. El botón principal de WhatsApp ("Crea tu invitación") no cambia. Se elimina la constante `DEMO_HREF` y el import de `getDesign` (quedan sin uso); la demo de diseño se sigue viendo más abajo, en `DesignGallery` (cada tarjeta ya tiene su propio link "Ver ejemplo real →").
- **`components/LandingPage.tsx`:** reordenar el JSX para que `MesasSection` se renderice justo después de `PriceStrip`, antes de `DesignGallery`. Nuevo orden: `Hero → PriceStrip → MesasSection → DesignGallery → HowItWorks → Features → EditorSection → AiSection → Packages → ProcessSection → FAQ → PlannerCta → FinalCta`. Ningún componente de sección cambia de contenido por este paso, solo su posición en el árbol.
- **`lib/marketing-content.ts` — corrección de la contradicción de mesas:**
  - `PACKAGES[0].notIncluded` (Básico) cambia de `'Personalización por invitado (URL, mensaje, idioma, boletos o canción individuales), el asistente con IA ni la gestión de mesas.'` a `'Personalización por invitado (URL, mensaje, idioma, boletos o canción individuales) ni el asistente con IA. La gestión de mesas es gratis con cualquier cuenta, sin necesidad de este paquete.'`
  - `FAQ_ITEMS`, pregunta `'¿Cuánto cuesta una invitación digital de boda con Invyta?'`: la respuesta pasa a abrir mencionando el modo gratis antes del precio de los paquetes: `'Organizar tus invitados y mesas es gratis, sin comprar ningún paquete: crea tu cuenta y úsalo de inmediato. Si además quieres tu invitación con diseño, el Paquete Básico cuesta $2,200 MXN y el Personalizado $2,600 MXN. No hay costo extra por cada invitación que envíes.'`
  - `FAQ_ITEMS`, pregunta `'¿Puedo contratar Invyta si soy wedding planner?'`: la respuesta pasa a mencionar el panel de múltiples bodas: `'Sí. Cada boda tiene su propia invitación y su propio panel, y ves todas las bodas de tus clientes desde una sola cuenta, con un solo inicio de sesión. Cuéntanos cuántas bodas manejas y te explicamos cómo lo organizamos.'` Sin mención de precio (ya no la tenía).
- **`app/paquetes/page.tsx`:** nuevo bloque corto entre `PageHero` y la sección de tarjetas de paquetes, mencionando que organizar invitados y mesas es gratis, con un link hacia `/login?mode=signup`. Reutiliza el patrón visual ya existente en la página (`Chip`/tarjeta simple), sin rediseñar el resto de la página ni tocar la tabla comparativa.
- **`components/landing/PlannerCta.tsx`:** el párrafo bajo el título cambia de "Una invitación y un panel de invitados por cada cliente, con el mismo cuidado y sin rehacer trabajo." a `'Todas las bodas de tus clientes en una sola cuenta: entra una vez y ve cada invitación, sus invitados y sus mesas, sin rehacer trabajo.'` El botón ("Cuéntanos cuántas bodas manejas" → WhatsApp) no cambia. Sin mención de precio.
- **`app/wedding-planners/page.tsx`:**
  - Se **elimina por completo la sección "Paquetes y precios"** (el `Section tone="white"` que mapea `PACKAGES` con `formatPrice`, líneas ~133-163) y los imports que quedan sin uso (`PACKAGES`, `formatPrice`). El convenio con cada planner se negocia de forma personal (niveles por volumen, fuera de este spec); esta página no vuelve a mostrar el precio público de una invitación individual.
  - `PageHero.intro` cambia de "Una invitación para cada cliente, con el mismo cuidado y sin rehacer trabajo." a `'Una invitación para cada cliente y un panel donde ves todas tus bodas con un solo inicio de sesión, sin rehacer trabajo.'`
  - `REASONS[1]` (hoy `{ icon: 'users', title: 'Gestión de invitados', text: '...' }`) se reemplaza y se mueve a la primera posición del arreglo, como el diferenciador principal: `{ icon: 'users', title: 'Todas tus bodas, un solo login', text: 'Entra a tu cuenta y ve cada boda de tus clientes: su invitación, sus invitados confirmados y sus mesas, todo junto.' }`. Las otras tres tarjetas (`'Una invitación por cliente'`, `'Tiempos claros'`, `'Atención directa'`) se conservan tal cual, sin precios.
  - El resto de la página (`STEPS`, `CLIENT_GETS`, `PLANNER_FAQ`, `CtaBand` final) no cambia de estructura; `PLANNER_FAQ` hereda automáticamente la respuesta nueva de `'¿Puedo contratar Invyta si soy wedding planner?'` desde `lib/marketing-content.ts`.
- **`components/landing/EditorSection.tsx` — recorte de copy:**
  - El párrafo bajo el H2 pasa de dos oraciones ("Desde tu panel editas nombres, fecha, lugares, cronograma y fotos. Para tus datos no dependes de nadie.") a una: `'Desde tu panel editas nombres, fecha, lugares, cronograma y fotos, sin depender de nadie.'`
  - Los tres `points` (título + descripción) se mantienen, sin recortar (ya son de una sola oración cada uno).
  - Los dos elementos de cierre ("¿Quieres un cambio visual? Escríbenos por WhatsApp..." y el link "Ver Paquete Personalizado →") se consolidan en un solo párrafo con un solo link, en vez de párrafo + link apilados.
- **`components/landing/AiSection.tsx` — recorte de copy:**
  - El párrafo bajo el H2 pasa de tres oraciones a dos: `'Responde tres preguntas y el editor redacta tu historia en español e inglés. También traduce, arma tu itinerario y sugiere lugares para tus invitados.'` (se quita "Tú decides qué se queda.", ya cubierto por la viñeta de confianza "Tú tienes el control" más abajo en la misma sección).
  - El arreglo `capabilities` pasa de 5 a 4 tarjetas: se quita `'Código de vestimenta'` (ya se muestra como tarjeta en `Features.tsx`, sección anterior de la misma página — es redundante repetirlo aquí). Las otras cuatro (`'Historia de amor'`, `'Traducción a inglés'`, `'Itinerario sugerido'`, `'Hoteles y lugares cerca'`) se mantienen igual.

**No incluye (queda para otra iteración):**

- Cualquier cambio a `components/landing/MesasSection.tsx` más allá de su posición en `LandingPage.tsx` — su contenido interno (mock-up arrastrable, capacidades, confianza, CTA) ya quedó bien resuelto en el spec 16 y no se toca.
- Cambios de diseño visual (colores, tipografía, componentes de `ui.tsx`) — este spec es de estructura y contenido, reutiliza los componentes ya existentes.
- Rediseño de `app/preguntas-frecuentes/page.tsx` o de su agrupación por temas — hereda las correcciones de texto de `lib/marketing-content.ts` sin cambios de código propio.
- Cambiar la tabla comparativa (`COMPARISON`) de `app/paquetes/page.tsx` para agregar una fila o columna de "Gratis" — se resuelve con el bloque corto nuevo, no con una comparación de tres columnas; una comparación de tres niveles es una decisión de diseño más grande para otro spec si se decide.
- Cualquier flujo de autoservicio de creación de bodas para wedding planners, o portal propio para ellos — confirmado que sigue sin cambiar (spec 17: la creación de bodas con plantilla sigue siendo exclusiva del staff).
- Mostrar en `/wedding-planners` los niveles de partner (Aliado/Partner/Partner Elite) ni ningún precio wholesale — ese convenio se sigue negociando por WhatsApp de forma personal, fuera de esta página.
- Traducción de la landing o de las páginas de marketing a inglés — siguen siendo en español únicamente, sin cambios respecto a hoy.
- Eventos de analítica nuevos — los CTAs que cambian de posición o de texto (Hero, Nav) mantienen sus `href` de siempre (`/login`, `/login?mode=signup`), que ya están instrumentados según el spec 16 donde aplica; no se agregan eventos nuevos en este spec.
- Agregar una nueva pregunta a la FAQ dedicada solo al modo gratis — la pregunta existente `'¿La gestión de mesas viene en el Paquete Básico?'` ya lo explica bien; duplicarla iría en contra del objetivo de aligerar contenido.

## Modelo de datos

Este spec no introduce ninguna estructura de datos nueva ni toca Firestore, rutas de servidor o tipos de `src/types`. Es exclusivamente contenido, orden de secciones y enlaces dentro de componentes de marketing ya existentes (`components/landing/*`, `app/wedding-planners`, `app/paquetes`, `lib/marketing-content.ts`).

## Plan de implementación

1. **Nav — link "Inicia sesión".** Agregar `{ href: '/login', label: 'Inicia sesión' }` al arreglo `links` de `components/landing/Nav.tsx`, después de "Preguntas frecuentes". Prueba manual: el link aparece en el nav de escritorio y en el menú móvil, en todas las páginas de marketing que usan `Nav`/`PageShell`.
2. **Hero — CTA gratis en vez del link de demo.** En `components/landing/Hero.tsx`, reemplazar el `LTextLink` de "Ver una invitación de ejemplo →" por uno hacia `/login?mode=signup` con texto "Organiza tu boda gratis →"; quitar `DEMO_HREF` y el import de `getDesign`. Prueba manual: el Hero muestra el botón de WhatsApp igual que antes y, junto a él, el nuevo link gratis; clic navega a `/login` abierto en "Crea tu cuenta" (spec 16, `?mode=signup` ya soportado).
3. **Reordenar `MesasSection` en `LandingPage.tsx`.** Mover el `<MesasSection />` para que quede entre `<PriceStrip />` y `<DesignGallery />`. Prueba manual: el scroll de la landing muestra el bloque de mesas (con su eyebrow "Gratis, sin plantilla ni editor" y su CTA) como tercera sección, antes de Diseños.
4. **Corregir la contradicción de mesas en `lib/marketing-content.ts`.** Actualizar `PACKAGES[0].notIncluded` y las respuestas de `'¿Cuánto cuesta una invitación digital de boda con Invyta?'` y `'¿Puedo contratar Invyta si soy wedding planner?'` con los textos exactos del Alcance. Prueba manual: `/paquetes` (tarjeta del Básico), la landing (FAQ) y `/preguntas-frecuentes` muestran los textos nuevos; ninguna otra pregunta ni el resto de `PACKAGES` cambia.
5. **Callout de modo gratis en `/paquetes`.** Agregar el bloque corto nuevo entre `PageHero` y la sección de tarjetas, con link a `/login?mode=signup`. Prueba manual: entrar directo a `/paquetes` (sin pasar por la landing) deja ver que organizar invitados y mesas es gratis, antes de llegar a los precios de los paquetes.
6. **`PlannerCta.tsx` — nuevo mensaje.** Actualizar el párrafo con el texto exacto del Alcance. Prueba manual: la sección de la landing ya no dice "una invitación y un panel... por cada cliente", dice "todas las bodas... en una sola cuenta".
7. **`wedding-planners/page.tsx` — quitar precios, subir el panel multi-boda.** Eliminar la sección "Paquetes y precios" y sus imports (`PACKAGES`, `formatPrice`); actualizar `PageHero.intro`; reemplazar y reordenar `REASONS` según el Alcance. Prueba manual: `/wedding-planners` ya no muestra ningún precio en MXN en ninguna parte de la página; la primera tarjeta de "Por qué Invyta" habla del panel de todas las bodas.
8. **Recorte de copy en `EditorSection.tsx` y `AiSection.tsx`.** Aplicar los textos acortados del Alcance en ambos componentes, y quitar la tarjeta "Código de vestimenta" del arreglo `capabilities` de `AiSection`. Prueba manual: ambas secciones se ven un poco más cortas en el scroll (una oración menos cada una; `AiSection` con 4 tarjetas de capacidades en vez de 5), sin perder ninguna funcionalidad interactiva (tabs, inputs, selector de tono/idioma siguen igual).
9. **QA de regresión completa.** `npm run build` sin errores nuevos. Recorrido manual: landing completa de arriba a abajo confirmando el nuevo orden y que el CTA gratis aparece en Hero, Nav y la sección de mesas (ahora en tercer lugar); `/paquetes` muestra el callout gratis y ya no contradice el spec 16; `/wedding-planners` sin ningún precio y con el panel multi-boda como primer argumento; `/preguntas-frecuentes` y la FAQ de la landing muestran las respuestas corregidas; `/disenos/[slug]` (que también lee `getFaq`/`DESIGNS`) sigue funcionando sin cambios.

## Criterios de aceptación

- [ ] El Nav (escritorio y móvil, en la landing y en todas las páginas de marketing) muestra un link "Inicia sesión" hacia `/login`.
- [ ] El Hero de la landing muestra un link "Organiza tu boda gratis →" hacia `/login?mode=signup`, junto al botón de WhatsApp existente; el link anterior hacia la demo de diseño ya no está ahí (la demo se sigue pudiendo abrir desde la sección Diseños).
- [ ] El orden de secciones de la landing es `Hero → PriceStrip → MesasSection → DesignGallery → HowItWorks → Features → EditorSection → AiSection → Packages → ProcessSection → FAQ → PlannerCta → FinalCta`.
- [ ] La tarjeta del Paquete Básico en `/paquetes` y en la landing ya no dice que "no incluye" la gestión de mesas; en su lugar aclara que mesas es gratis con cualquier cuenta.
- [ ] La respuesta de `'¿Cuánto cuesta una invitación digital de boda con Invyta?'` (landing y `/preguntas-frecuentes`) menciona el modo gratis antes de los precios de los paquetes.
- [ ] La respuesta de `'¿Puedo contratar Invyta si soy wedding planner?'` (landing, `/preguntas-frecuentes` y `/wedding-planners`) menciona que se ven todas las bodas del planner desde una sola cuenta.
- [ ] `/paquetes` tiene un bloque visible, antes de las tarjetas de precio, que dice que organizar invitados y mesas es gratis, con un link a `/login?mode=signup`.
- [ ] `PlannerCta.tsx` en la landing dice "todas las bodas de tus clientes en una sola cuenta", no "una invitación... por cada cliente".
- [ ] `/wedding-planners` no muestra ningún precio en MXN en ninguna parte de la página.
- [ ] La primera tarjeta de "Por qué Invyta" en `/wedding-planners` es sobre ver todas las bodas del planner con un solo inicio de sesión.
- [ ] `EditorSection` y `AiSection` mantienen toda su interactividad (tabs, inputs, selector de tono/idioma) con los párrafos acortados según el Alcance; `AiSection` muestra 4 tarjetas de capacidades, no 5.
- [ ] `npm run build` no introduce errores nuevos.
- [ ] Ninguna otra pregunta de `FAQ_ITEMS`, ningún otro campo de `PACKAGES`, y ninguna otra sección de `DesignGallery`, `HowItWorks`, `Features`, `Packages`, `ProcessSection`, `FAQ` o `FinalCta` cambia de contenido respecto a antes de este spec.

## Decisiones tomadas y descartadas

- **Auditoría completa (landing + `/wedding-planners` + `/paquetes` + `/preguntas-frecuentes`), en vez de solo la landing:** decisión explícita del usuario, tras ver que la contradicción de mesas y el mensaje de planner desactualizado viven fuera de la landing (en `lib/marketing-content.ts` y en `/wedding-planners`), no solo dentro de ella.
- **Doble corrección de visibilidad del gratis — CTA en Hero/Nav y reordenar `MesasSection`:** decisión explícita del usuario, combinando ambas opciones en vez de elegir solo una. El CTA en Hero/Nav da una salida inmediata desde el primer scroll; mover `MesasSection` antes de `EditorSection`/`AiSection` evita que el visitante reciba dos secciones "Exclusivo Paquete Personalizado" seguidas antes de enterarse de que existe un camino gratis.
- **El Hero reemplaza el link de demo por el CTA gratis, en vez de agregar un tercer elemento:** decisión explícita del usuario. Evita saturar la primera pantalla con tres llamados a la acción; la demo de diseño sigue siendo accesible un scroll más abajo, en `DesignGallery`, sección que además ahora queda justo después de `MesasSection`.
- **El Nav agrega solo un link de texto "Inicia sesión", sin tocar el botón de WhatsApp ni agregar un segundo botón:** decisión explícita del usuario. Mantiene el CTA de mayor intención (contacto directo) como la acción principal del nav, y dar una salida de bajo compromiso hacia el login sin competir visualmente con ese botón.
- **Recortar copy dentro de `EditorSection`/`AiSection`, en vez de consolidar o eliminar secciones completas:** decisión explícita del usuario. Reduce el peso de lectura sin arriesgar quitar contenido que ya demuestra valor real del Paquete Personalizado (specs 14/15); es el cambio de menor riesgo entre las opciones planteadas.
- **Corregir la contradicción "mesas no incluida en el Básico":** decisión explícita del usuario. El texto actual de `PACKAGES[0].notIncluded` es factualmente incorrecto desde que se implementó el spec 16 (mesas ya es gratis, independiente de cualquier paquete); dejarlo así confunde a cualquiera que llegue directo a `/paquetes` sin pasar por la landing.
- **Sin nueva pregunta de FAQ dedicada al modo gratis:** decisión de esta sesión, para no sumar contenido cuando el objetivo explícito es aligerar; la pregunta `'¿La gestión de mesas viene en el Paquete Básico?'` ya cubre el caso, y las dos respuestas corregidas (costo general, wedding planner) refuerzan el mensaje sin duplicar una pregunta.
- **`/wedding-planners` pierde su sección de precios públicos por completo:** decisión explícita del usuario, corrigiendo el plan original de este spec (que no la incluía). El convenio con cada wedding planner se negocia de forma personal según volumen (niveles ya definidos fuera de este spec), así que anclar ahí el precio público de una invitación individual ($2,200/$2,600 MXN) no ayuda a esa negociación y se retira.
- **El nuevo mensaje de planner (landing y `/wedding-planners`) nunca menciona precio, ni el público ni el wholesale:** decisión explícita del usuario. Todo el énfasis nuevo va sobre la funcionalidad real ya construida (una cuenta, todas las bodas del planner) en vez de sobre números.
- **La tarjeta líder de "Por qué Invyta" en `/wedding-planners` pasa a ser el panel multi-boda, reemplazando y reordenando la tarjeta genérica "Gestión de invitados":** decisión explícita del usuario ("dar énfasis en la gestión de múltiples bodas para ellos"), en vez de agregar una quinta tarjeta que rompería la cuadrícula de 4 columnas.
- **Sin cambios a la tabla comparativa de `/paquetes` (columna o fila "Gratis"):** decisión de esta sesión. Agregar una tercera columna a una tabla ya diseñada para dos paquetes es un cambio de layout más grande que el callout corto elegido; si se decide una comparación de tres niveles, es una decisión de diseño para otro spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Mover `MesasSection` antes de `DesignGallery` cambia la primera impresión de la landing (antes empezaba con diseños/paquete pagado, ahora con el gancho gratis) y podría bajar la intención de compra inmediata de quien ya llegaba decidido a pagar | Aceptado, es el cambio pedido explícitamente; el botón de WhatsApp del Hero y del Nav siguen siendo la primera acción visible para quien ya viene decidido, el reordenamiento no los quita ni los mueve |
| Quitar el link de demo del Hero reduce en un clic la visibilidad de la demo real de diseño para quien no baja hasta `DesignGallery` | Aceptado; `DesignGallery` queda justo después de `MesasSection`, a un scroll corto del Hero, y cada tarjeta de diseño tiene su propio "Ver ejemplo real →" |
| Acortar `capabilities` de `AiSection` de 5 a 4 (quitando "Código de vestimenta") podría hacer parecer que la IA no ayuda con vestimenta | Mitigado: esa misma función ya se muestra como tarjeta en `Features.tsx`, la sección inmediatamente anterior en la misma página, así que la capacidad sigue comunicada, solo no repetida |
| Actualizar `PACKAGES[0].notIncluded` y dos respuestas de `FAQ_ITEMS` toca contenido que también consumen `/paquetes`, `/wedding-planners`, `/disenos/[slug]` y `/preguntas-frecuentes` vía las mismas funciones (`getPackage`, `getFaq`) | El paso 4 y el criterio de aceptación correspondiente verifican explícitamente las páginas que comparten esa fuente única; ninguna otra pregunta ni campo de `PACKAGES` se toca |
| Quitar la sección de precios de `/wedding-planners` dejaría a un planner sin ninguna cifra de referencia antes de escribir por WhatsApp, alargando la primera conversación | Aceptado, es el resultado buscado: el convenio se negocia de forma personal según volumen: mostrar el precio público de una invitación individual no aplica a esa negociación y podía anclar mal la conversación |

## Lo que **no** está en este spec

- Cambios de contenido dentro de `MesasSection.tsx` (solo cambia su posición).
- Rediseño visual (colores, tipografía, componentes de `ui.tsx`).
- Rediseño de código propio en `/preguntas-frecuentes` (hereda las correcciones de texto sin cambios de código).
- Tabla comparativa de tres niveles (Gratis/Básico/Personalizado) en `/paquetes`.
- Autoservicio de creación de bodas o portal propio para wedding planners.
- Niveles de partner (Aliado/Partner/Partner Elite) o cualquier precio wholesale visibles en `/wedding-planners`.
- Traducción de la landing o páginas de marketing a inglés.
- Eventos de analítica nuevos.
- Pregunta de FAQ nueva dedicada al modo gratis.

Cada uno de estos, si se decide hacer, va en su propio spec.
