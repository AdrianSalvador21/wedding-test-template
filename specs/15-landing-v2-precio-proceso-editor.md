# 15 — Landing v2: precio arriba, panel de edición, proceso y paquetes más claros

**Estado:** Approved
**Depende de:** SPEC 03, SPEC 05, SPEC 10, SPEC 11, SPEC 14
**Fecha:** 2026-09-28

## Objetivo

Implementar en la landing pública (`/`) el diseño v2 aprobado por el usuario (precio en el primer pantallazo, ejemplo interactivo del panel de edición, sección de proceso, paquetes y FAQ reordenados), sin tocar el producto, el SEO técnico ni las otras páginas de marketing más allá de los textos que hoy contradicen ese diseño.

> **Diseño validado con el usuario:** https://claude.ai/artifact/1NMZVqix6F3B8dSQAqkAjk (canvas privado, versión escritorio 1440 px y móvil 390 px, cada una en dos tableros). Los archivos fuente están temporalmente en `docs/landing-v2-diseno/` (sin commit) y se borran en el último paso. Origen del rediseño: análisis de la landing y de competidores hecho en esta misma sesión (miboda.love, Casa Convite, LoveStory, Merrimi, Zola, Joy).

## Contexto

Estado real del código, revisado en esta sesión (no asumido):

- `components/LandingPage.tsx` renderiza hoy: `Nav → Hero → HowItWorks → TrustStrip → DesignGallery → Features → IndividualPersonalization → MesasSection → AdminProof → AiSection → Packages → PlannerCta → FAQ → Footer`. Es un árbol de componentes aparte de `app/[locale]/page.tsx` (la invitación de los invitados); este spec no toca ese segundo árbol. Todo el copy vive hardcodeado en español, sin next-intl.
- El precio aparece por primera vez en `Packages.tsx`, a unos 7,000 px del inicio en escritorio y a ~74 % del scroll en móvil. `TrustStrip.tsx` solo dice "Entrega en 7 días hábiles / Confirmaciones en tiempo real / Español e Inglés / Hosting incluido".
- `Hero.tsx` tiene tres chips ("Diseño personalizado", "Confirmación automática", "Listo en 7 días"), un H1 "Invitaciones digitales para boda", el subtítulo "Elige el estilo. Nosotros armamos tu invitación." y la descripción "Diseños listos para tu boda, con confirmación de asistencia automática y todo gestionado desde un panel simple — sin apps que descargar." El diseño v2 **conserva esos tres textos tal cual** (decisión del usuario).
- `AdminProof.tsx` muestra `editor-imagen.png` e `invitados-imagen.png`; esta última trae nombres de pila reales de invitados. Ningún otro componente usa esas dos imágenes, y `admin-boda.png`, `admin-invitados.png` y `hero.png` (1.9 MB) ya no las referencia nada en `*.ts(x)`.
- `lib/marketing-content.ts` es la fuente única de `PACKAGES`, `FAQ_ITEMS` y `DESIGNS`. `FaqItem.onLanding` solo lo lee `components/landing/FAQ.tsx`; `/preguntas-frecuentes` usa todos los ítems y `faqSchema(FAQ_ITEMS)`. `/paquetes` y `/wedding-planners` leen `PACKAGES` y `getFaq(...)` por texto exacto de la pregunta, así que **no se renombran preguntas**.
- `StructuredData.tsx` de la landing solo emite `Organization` y `WebSite`; el `FAQPage` vive únicamente en `/preguntas-frecuentes`. Cambiar qué preguntas muestra la landing no afecta el schema.
- La analítica (spec 11) es automática: `section_viewed` toma el `id` de cada `<section id>` (`lib/analytics/section-tracking.ts`) y `cta_click` toma la ubicación del contenedor más cercano (`section[id]`, `data-track-package`, `header`/`nav`, `footer`) para todo enlace a `wa.me/529602460590` (`lib/analytics/click-tracking.ts`). Los enlaces a demos del mismo sitio disparan `demo_click` solos.
- `LSection` (`components/landing/ui.tsx`) solo tiene los tonos `ivory | white | charcoal | terracota | gradient`. El diseño usa además un marfil más oscuro (`#F6EFE4`) para la sección del editor y un terracota oscuro (`#AE5730`, contraste 4.68:1 con marfil) para la banda de wedding planners. El terracota actual `#C6663C` contra marfil da 3.67:1 y no pasa AA en texto normal.
- `Nav.tsx` (compartido con las páginas de marketing) tiene 6 enlaces: Cómo funciona, Diseños, Funcionalidades, Paquetes, Wedding planners, Preguntas frecuentes.
- `PlannerCta.tsx` hoy es un botón `wa.me` con el texto "Respuesta en menos de 24 horas", una afirmación sin respaldo que el diseño elimina.
- `docs/BRAND-FOUNDATIONS.md` es la fuente de verdad de voz, hechos verificados y respuestas tipo; hoy no dice nada de revisiones, acompañamiento ni cambios visuales.

## Alcance

**Incluye:**

- **Orden nuevo de la landing** en `components/LandingPage.tsx`: `Nav → Hero → PriceStrip → DesignGallery → HowItWorks → Features ("Qué incluye") → EditorSection → MesasSection → AiSection → Packages → ProcessSection → FAQ → PlannerCta → FinalCta → Footer`.
- **`Hero.tsx`:** se conservan H1, subtítulo y descripción actuales. Se quitan los tres chips y se agregan bajo los botones dos líneas con check: "Enlace único para compartir" y "Confirmaciones en tiempo real". El enlace secundario pasa de "Ver los diseños →" a "Ver una invitación de ejemplo →", que abre en pestaña nueva la demo de Botánica Editorial (`getDesign('botanica-editorial').demoHref`). El botón principal pasa a la variante `terracotaDark` (contraste AA).
- **`PriceStrip.tsx` (nuevo, reemplaza a `TrustStrip.tsx`):** franja blanca bajo el hero con cuatro ítems: "Desde $2,200 MXN" (precio tomado de `PACKAGES`, sin subtítulo), "Sin costo por invitado", "Entrega en 7 días hábiles" y "Hosting hasta 15 días después del evento".
- **`DesignGallery.tsx`:** título "Elige tu diseño y ábrelo en tu celular", subtítulo "Cada uno tiene una demo real: ábrela como la verían tus invitados.", y en cada tarjeta "Ver ejemplo real →" como botón con contorno más el enlace "Ver el diseño". En móvil, las tres tarjetas van en un carrusel horizontal con `scroll-snap`.
- **`HowItWorks.tsx`:** pasos "Elige tu diseño y cuéntanos tu boda", "Nosotros armamos tu invitación" y "Compártela y ve quién confirma", con el copy del diseño.
- **`Features.tsx` → sección "Qué incluye"** (mantiene `id="funcionalidades"`): título "Todo lo que tus invitados necesitan, en un solo enlace", seis tarjetas (Cronograma y mapa, Regalos y hospedaje, Código de vestimenta, Música, Historia y galería, Solo adultos) y, a un lado, una maqueta CSS "Tus confirmaciones" con datos ficticios etiquetados "Datos ficticios" (cuatro contadores y tres filas de invitados). Salen del array las tarjetas "Gestión de mesas" y "Asistente con IA", que ya tienen su propia sección.
- **`EditorSection.tsx` (nuevo, `id="editor"`):** "Exclusivo Paquete Personalizado". Formulario de ejemplo con cuatro `<input>` reales (Nombres de la pareja, Fecha y hora de la ceremonia, Lugar de la ceremonia, Dirección o enlace del mapa) y un celular con **vista previa en vivo**: lo que se escribe aparece al instante en el celular. No guarda nada. Incluye tres puntos de valor (nombres/fecha/horarios, ubicación con mapa, fotos y cronograma) y la línea "¿Quieres un cambio visual? Escríbenos por WhatsApp y lo vemos juntos."
- **`Packages.tsx`:** rediseño según el diseño v2. Tarjeta Básico más pequeña con seis viñetas cortas y su "No incluye"; tarjeta Personalizado oscura con "Recomendado", el texto calculado "Solo $400 MXN más que el Básico, con panel, mesas e IA", "Todo lo del Básico, y además" y cinco viñetas (dos con el pill "Nuevo"). Debajo, una banda de dos columnas: "Si eliges Básico: nos mandas los cambios y Invyta los publica por ti" / "Si eliges Personalizado: ajustas tus datos desde tu panel cuando quieras, y nos escribes para cambios visuales". En móvil el Personalizado va primero.
- **`ProcessSection.tsx` (nuevo, `id="proceso"`):** eyebrow "Así trabajamos", título "Sin sorpresas: así es el proceso", cuatro pasos y tres tarjetas. Pasos: 1 "Escríbenos por WhatsApp" ("Cuéntanos la fecha de tu boda y lo que imaginas para tu invitación."), 2 "Completamos juntos la información" ("Tú llenas los datos de tu boda en tu panel y nosotros nos encargamos de armar tus fotos."), 3 "Diseñamos tu invitación" ("Con tus datos y tus fotos armamos tu diseño y te compartimos la propuesta para que la revises."), 4 "Entregamos en 7 días hábiles". Tarjetas: "Revisiones ilimitadas", "Te acompañamos por WhatsApp" y "Cambios después de publicar". Sin ningún paso ni texto de pago.
- **`FAQ.tsx`:** ocho preguntas en dos columnas independientes (4 y 4) en escritorio, una columna en móvil, con la misma lógica de acordeón; la primera arranca abierta.
- **`PlannerCta.tsx`:** banda en terracota oscuro con título "¿Eres wedding planner?", texto "Una invitación y un panel de invitados por cada cliente, con el mismo cuidado y sin rehacer trabajo." y botón "Cuéntanos cuántas bodas manejas" hacia WhatsApp con el mensaje prellenado que ya usa `/wedding-planners`. Se elimina "Respuesta en menos de 24 horas".
- **`FinalCta.tsx` (nuevo, `id="contacto"`):** "Cuéntanos la fecha de tu boda y empezamos tu invitación.", subtexto "Te respondemos por WhatsApp con los paquetes y los tres diseños para verlos desde tu celular." y dos botones: "Crea tu invitación" (WhatsApp) y "Ver los diseños" (`#disenos`).
- **`Nav.tsx`:** enlaces en este orden: Diseños, Cómo funciona, Paquetes, Wedding planners, Preguntas frecuentes (se quita "Funcionalidades"). Los destinos siguen siendo los actuales (secciones con `/#...` y páginas `/paquetes`, `/wedding-planners`, `/preguntas-frecuentes`).
- **`Footer.tsx`:** el texto bajo el logo pasa a la tagline de marca "Tu boda, en una invitación que se siente tuya.".
- **`ui.tsx`:** dos tonos nuevos de `LSection`: `sand` (`#F6EFE4`) y `terracotaDark` (`#AE5730`).
- **`lib/marketing-content.ts`:** campo `highlights` en `PACKAGES` (viñetas de la landing), lista ordenada `LANDING_FAQ_QUESTIONS` que reemplaza al flag `onLanding`, y corrección de los textos que contradicen el nuevo enfoque de cambios (ver Modelo de datos).
- **`lib/site.ts`:** `lastModified` de `/`, `/paquetes` y `/preguntas-frecuentes` pasa a `2026-09-28` (hubo cambio real de contenido).
- **Limpieza:** se borran `components/landing/AdminProof.tsx`, `IndividualPersonalization.tsx`, `TrustStrip.tsx` y las cinco imágenes huérfanas de `public/assets/landing/` (`admin-boda.png`, `admin-invitados.png`, `editor-imagen.png`, `invitados-imagen.png`, `hero.png`). Se borra también `docs/landing-v2-diseno/`.
- **`docs/BRAND-FOUNDATIONS.md`:** se registran como hechos verificados las revisiones ilimitadas antes de la entrega, el acompañamiento por WhatsApp durante el proceso y "para un cambio visual, escríbenos" en el Personalizado, y se actualiza la respuesta tipo a "¿Puedo cambiar algo después?".

**No incluye (queda para otra iteración):**

- Sección de parejas reales, testimonios o cifras de uso: no existen todavía y no se inventan. Se retoma cuando haya clientes reales que den permiso.
- Barra fija de CTA en móvil con el precio (decisión del usuario: se evalúa con datos de analítica).
- Política de pago, anticipo y garantía de entrega en la landing: el usuario decidió no comunicarla por ahora.
- Rediseño de `/paquetes`, `/preguntas-frecuentes`, `/disenos/[slug]` y `/wedding-planners`; solo se corrigen los textos de `lib/marketing-content.ts` que contradicen el nuevo enfoque.
- Sección "Cada invitado recibe su propia invitación" (`IndividualPersonalization`): se elimina; la personalización 1:1 sigue en el bullet del Personalizado, en la FAQ y en `/paquetes`.
- QR o check-in por invitado, y cualquier cambio de producto o de precios ($2,200 y $2,600 MXN se mantienen).
- Cambios a `MesasSection.tsx` y `AiSection.tsx` (el usuario aprobó el diseño tal cual está implementado).
- Nuevos eventos de analítica: `section_viewed` y `cta_click` siguen disparándose solos.
- Traducción de la landing a next-intl.
- Gating técnico real de Mesas, IA o el editor por paquete (sigue siendo un acuerdo comercial manual, igual que en los specs 12 y 14).

## Modelo de datos

Este spec no agrega ni cambia datos persistidos en Firestore. Introduce contenido estático nuevo en `lib/marketing-content.ts` y estado de cliente efímero en `EditorSection.tsx`.

```ts
// lib/marketing-content.ts — PackageContent gana `highlights`
export interface PackageHighlight {
  text: string;      // texto normal, se renderiza después de `strong`
  strong?: string;   // arranque en negritas
  isNew?: boolean;   // pill "Nuevo" y recuadro resaltado
}

export interface PackageContent {
  // ...campos existentes sin cambios (id, name, price, currency, forWho, groups, notIncluded)
  highlights: PackageHighlight[]; // usado solo por components/landing/Packages.tsx
}

// basico.highlights
// [
//   { text: 'Página con enlace único para compartir' },
//   { text: 'Historia, cuenta regresiva, galería, cronograma y mapa' },
//   { text: 'Regalos, hospedaje, vestimenta y sección solo adultos' },
//   { text: 'Confirmación de asistencia y lista de confirmados' },
//   { text: 'Entrega en 7 días hábiles y hosting hasta 15 días después del evento' },
//   { strong: 'Invyta gestiona los cambios', text: ' de contenido' },
// ]
//
// personalizado.highlights
// [
//   { strong: 'Panel para editar tú mismo', text: ' tu invitación y gestionar invitados' },
//   { strong: 'Enlace y bienvenida por invitado', text: ', idioma ES/EN y canción' },
//   { strong: 'Gestión de mesas', text: ' con cuadrícula y plano visual', isNew: true },
//   { strong: 'Asistente con IA', text: ' para historia, traducción, itinerario y lugares', isNew: true },
//   { strong: 'Soporte extendido', text: ' durante los 7 días previos al evento' },
// ]
```

```ts
// lib/marketing-content.ts — reemplaza el flag `FaqItem.onLanding` (se elimina del tipo y de los 22 ítems)
export const LANDING_FAQ_QUESTIONS = [
  '¿Cuánto cuesta una invitación digital de boda con Invyta?',
  '¿Cuál es la diferencia entre el Paquete Básico y el Personalizado?',
  '¿Cuánto tarda la entrega?',
  '¿Puedo cambiar la información después de publicar?',
  '¿Mis invitados necesitan descargar una aplicación?',
  '¿Puedo ver cómo se ve antes de contratar?',
  '¿La IA publica cosas en mi invitación sin que yo lo sepa?',
  '¿La gestión de mesas viene en el Paquete Básico?',
];
// FAQ.tsx: LANDING_FAQ_QUESTIONS.map(getFaq), mismo patrón que PRICE_FAQ en app/paquetes/page.tsx.
```

Textos de `lib/marketing-content.ts` que cambian por contradecir el nuevo enfoque (sin renombrar ninguna pregunta):

```ts
// FAQ '¿Puedo cambiar la información después de publicar?' — respuesta nueva
'Sí. Con el Personalizado ajustas tus datos tú desde tu panel, y si quieres un cambio visual nos escribes; con el Básico, Invyta hace los cambios por ti.'

// personalizado.groups → 'Panel de edición y gestión' — texto nuevo (quita "sin depender de nosotros")
'Cambia los datos de tu invitación y controla confirmaciones e invitados cuando quieras.'
```

```ts
// components/landing/EditorSection.tsx — estado local, no persistido, no enviado a ningún servicio
interface EditorDemo {
  names: string;   // por defecto 'Sofía y Diego'
  date: string;    // por defecto 'Sábado 17 de octubre de 2026 · 5:00 p. m.'
  venue: string;   // por defecto 'Jardín Los Arcos'
  address: string; // por defecto 'Camino Real 120, Chiapa de Corzo'
}
const [demo, setDemo] = useState<EditorDemo>(DEFAULTS);
```

Convenciones:

- Cada campo del editor lleva `maxLength={48}`; un campo vacío muestra en el celular el valor por defecto en gris para que la vista previa nunca quede en blanco. Todo texto se renderiza como texto de React (sin `dangerouslySetInnerHTML`).
- El texto del celular es exactamente lo escrito, sin reemplazos ni formato de fecha.
- "Solo $400 MXN más" y "Desde $2,200 MXN" se calculan de `PACKAGES` (`personalizado.price - basico.price` y `basico.price` con `formatPrice`); no se escriben a mano.
- Los datos ficticios de la maqueta "Tus confirmaciones" (60 / 44 / 12 / 4; Familia Ortega, Lucía y Marcos, Tío Ramón, Carla) viven como constantes locales de `Features.tsx`, marcadas "Datos ficticios".

## Plan de implementación

1. **Tonos nuevos de `LSection`.** Agregar `sand` y `terracotaDark` en `components/landing/ui.tsx`, sin usarlos todavía. Prueba manual: `npm run build` pasa y la landing se ve idéntica.
2. **Contenido compartido.** En `lib/marketing-content.ts`: agregar `highlights` a los dos paquetes, exportar `LANDING_FAQ_QUESTIONS`, eliminar `onLanding` del tipo y de los 22 ítems, y aplicar las dos correcciones de texto. En `components/landing/FAQ.tsx`, sustituir el filtro `onLanding` por `LANDING_FAQ_QUESTIONS.map(getFaq)`. Prueba manual: la landing muestra ahora las 8 preguntas nuevas en ese orden; `/preguntas-frecuentes` sigue mostrando todas y con el schema `FAQPage` intacto.
3. **Hero y franja de precio.** Editar `Hero.tsx` (sin chips, dos líneas con check, enlace a la demo, botón `terracotaDark`), crear `PriceStrip.tsx`, borrar `TrustStrip.tsx` y cambiar el import en `LandingPage.tsx`. Prueba manual: H1, subtítulo y descripción idénticos a antes; el precio se ve en el primer pantallazo a 1440 px y a 390 px; el enlace secundario abre la demo en pestaña nueva.
4. **Diseños y cómo funciona.** Actualizar el copy y el estilo de tarjetas de `DesignGallery.tsx` (con carrusel `scroll-snap` en móvil) y los tres pasos de `HowItWorks.tsx`. Prueba manual: en 390 px las tres tarjetas se deslizan horizontalmente sin desbordar la página.
5. **"Qué incluye" y retiro de las capturas.** Reescribir `Features.tsx` (seis tarjetas + maqueta "Tus confirmaciones"), quitar `<AdminProof />` e `<IndividualPersonalization />` de `LandingPage.tsx` y borrar sus archivos. Prueba manual: desaparecen las capturas y la sección de ejemplos; la maqueta dice "Datos ficticios"; el orden de secciones hasta Mesas coincide con el diseño.
6. **Sección del editor.** Crear `EditorSection.tsx` con formulario y celular de vista previa en vivo, usando el tono `sand`, e insertarla en `LandingPage.tsx` antes de `<MesasSection />`. Prueba manual: escribir en cada campo cambia el celular al instante; vaciar un campo muestra el valor por defecto en gris; nada se envía a la red (pestaña Network vacía).
7. **Paquetes.** Reescribir `Packages.tsx` con `highlights`, el cálculo de la diferencia de precio, la banda "Si eliges Básico / Personalizado" y el orden móvil (Personalizado primero); conservar `data-track-package` y los mensajes de WhatsApp actuales de cada tarjeta. Prueba manual: los dos botones siguen abriendo WhatsApp con su mensaje y disparan `cta_click` con `package`.
8. **Proceso, FAQ, planners, CTA final, nav y footer.** Crear `ProcessSection.tsx` y `FinalCta.tsx`; pasar `FAQ.tsx` a dos columnas; reescribir `PlannerCta.tsx` con el tono `terracotaDark`; actualizar `Nav.tsx` y la tagline de `Footer.tsx`; dejar `LandingPage.tsx` en el orden final. Prueba manual: recorrer la landing completa comparándola con el diseño en 1440 px, 768 px y 390 px.
9. **Limpieza, fechas y documentación.** Borrar las cinco imágenes huérfanas de `public/assets/landing/`, actualizar `lastModified` en `lib/site.ts`, actualizar `docs/BRAND-FOUNDATIONS.md` y borrar `docs/landing-v2-diseno/`. Prueba manual: `git grep` de los cinco nombres de imagen y de `AdminProof|IndividualPersonalization|TrustStrip|onLanding` no devuelve nada.

## Criterios de aceptación

- [ ] `/` renderiza sus secciones en este orden: Hero, franja de precio, Diseños, Cómo funciona, Qué incluye, Editor, Mesas, IA, Paquetes, Así trabajamos, FAQ, Wedding planners, CTA final, Footer.
- [ ] El H1, el subtítulo y la descripción del hero son idénticos a los actuales; los tres chips ya no existen; bajo los botones aparecen "Enlace único para compartir" y "Confirmaciones en tiempo real".
- [ ] El enlace "Ver una invitación de ejemplo →" abre la demo de Botánica Editorial en pestaña nueva y dispara `demo_click`.
- [ ] La franja de precio muestra "Desde $2,200 MXN" con el valor leído de `PACKAGES` y no contiene el texto "Precio fijo" ni "letra chica".
- [ ] El precio es visible sin hacer scroll adicional al hero en 1440×900 y dentro de los primeros 1,100 px en 390 px de ancho.
- [ ] No queda en la landing ninguna sección, texto o imagen de parejas reales, testimonios o cifras de uso.
- [ ] Ningún texto de la landing contiene "te confirmamos disponibilidad" ni "Respuesta en menos de 24 horas".
- [ ] "Qué incluye" muestra seis tarjetas y la maqueta "Tus confirmaciones" con la etiqueta "Datos ficticios"; no hay nombres reales de invitados en ninguna parte de la landing.
- [ ] En la sección del editor, escribir en Nombres, Fecha, Lugar o Dirección actualiza el celular en el mismo instante; con un campo vacío el celular muestra el valor por defecto; el límite de 48 caracteres se respeta; la pestaña Network no registra ninguna petición al escribir.
- [ ] La sección del editor incluye la línea "¿Quieres un cambio visual? Escríbenos por WhatsApp y lo vemos juntos." y ese enlace dispara `cta_click` con `location: 'editor'`.
- [ ] La tarjeta del Personalizado muestra "Solo $400 MXN más que el Básico" calculado de `PACKAGES`; cambiar un precio en `lib/marketing-content.ts` actualiza la landing sin editar ningún componente.
- [ ] En 390 px, la tarjeta del Personalizado aparece antes que la del Básico.
- [ ] "Así trabajamos" tiene cuatro pasos (el tercero es "Diseñamos tu invitación") y tres tarjetas ("Revisiones ilimitadas", "Te acompañamos por WhatsApp", "Cambios después de publicar"); no menciona pagos, anticipos ni retrasos.
- [ ] La FAQ de la landing muestra las 8 preguntas de `LANDING_FAQ_QUESTIONS` en ese orden, en dos columnas en escritorio; `/preguntas-frecuentes` sigue mostrando las 22 y su `FAQPage` sigue con todas.
- [ ] La respuesta de "¿Puedo cambiar la información después de publicar?" coincide con el texto nuevo tanto en la landing como en `/preguntas-frecuentes`.
- [ ] El botón de wedding planners abre WhatsApp con el mensaje "Hola, soy wedding planner y quiero saber cómo trabajan con Invyta." y dispara `cta_click` con `location: 'planners'`.
- [ ] El CTA final abre WhatsApp desde "Crea tu invitación" con `location: 'contacto'`, y "Ver los diseños" baja a `#disenos`.
- [ ] `section_viewed` se dispara para `editor`, `proceso` y `contacto` además de las secciones existentes (`funcionalidades`, `mesas`, `ia`, `paquetes`, `faq`, `planners`, etc.), sin cambios en `lib/analytics/events.ts`.
- [ ] El nav muestra Diseños, Cómo funciona, Paquetes, Wedding planners y Preguntas frecuentes, y ya no muestra "Funcionalidades"; los enlaces funcionan desde `/`, `/paquetes` y `/preguntas-frecuentes`.
- [ ] El footer muestra "Tu boda, en una invitación que se siente tuya.".
- [ ] Los botones de acción principal y la banda de wedding planners usan el terracota oscuro `#AE5730` con texto marfil (contraste ≥ 4.5:1).
- [ ] No hay desbordamiento horizontal de la página en 390 px, 768 px ni 1440 px.
- [ ] Con `prefers-reduced-motion: reduce` las nuevas secciones no animan (usan `LReveal`/`LStagger` existentes).
- [ ] `AdminProof.tsx`, `IndividualPersonalization.tsx`, `TrustStrip.tsx`, las cinco imágenes de `public/assets/landing/` y `docs/landing-v2-diseno/` ya no existen, y `git grep` de esos nombres no devuelve referencias.
- [ ] `lib/site.ts` tiene `lastModified: '2026-09-28'` para `/`, `/paquetes` y `/preguntas-frecuentes`, y `/sitemap.xml` lo refleja.
- [ ] `docs/BRAND-FOUNDATIONS.md` registra las revisiones ilimitadas, el acompañamiento por WhatsApp y el cambio visual por WhatsApp del Personalizado.
- [ ] `npm run build` y `npm run lint` terminan sin errores nuevos respecto al estado previo, y el `<title>`, la meta descripción, el canonical y los JSON-LD de `/` no cambian.

## Decisiones tomadas y descartadas

- **Sí: seguir el diseño v2 aprobado como fuente de verdad visual y de copy.** El usuario lo revisó sección por sección y pidió ajustes que ya están incorporados.
- **Sí: conservar título, subtítulo y descripción del hero actuales.** Decisión explícita del usuario ("no modifiques los textos de arriba"). Consecuencia: la descripción sigue diciendo "todo gestionado desde un panel simple", cuando el Paquete Básico no incluye panel de edición; el usuario lo conoce y lo acepta.
- **Sí: eliminar las capturas del panel y sustituirlas por la maqueta con datos ficticios.** Quita el riesgo de exponer nombres reales y permite mostrar el editor sin depender de capturas que envejecen.
- **Sí: eliminar `IndividualPersonalization`.** Decisión explícita del usuario; el diseño no la incluye y la personalización 1:1 sigue visible en Paquetes.
- **No: sección de parejas reales.** Decisión explícita del usuario: no existen y no se inventará nada.
- **No: comunicar política de pago, anticipo ni garantía por retraso.** Decisión explícita del usuario; el paso 3 pasa a "Diseñamos tu invitación" y la tarjeta de retrasos se reemplaza por acompañamiento por WhatsApp.
- **Sí: "Revisiones ilimitadas", "Te acompañamos por WhatsApp" y "para un cambio visual, escríbenos"** como compromisos de negocio, decididos por el usuario en esta sesión y registrados en `docs/BRAND-FOUNDATIONS.md` para que redes, WhatsApp y Bodas.com.mx no los contradigan.
- **Sí: quitar "te confirmamos disponibilidad" y "Respuesta en menos de 24 horas".** Decisión explícita del usuario ("claramente estamos disponibles") y afirmación sin respaldo, respectivamente.
- **Sí: vista previa en vivo en el editor de ejemplo.** Decisión explícita del usuario sobre la opción estática; costo bajo (cuatro cadenas en estado local, sin persistencia ni red).
- **No: barra fija de CTA en móvil.** Decisión explícita del usuario; se evalúa con datos de analítica antes de agregarla.
- **Sí: solo corregir en `/paquetes` y `/preguntas-frecuentes` los textos que contradicen el diseño.** Decisión explícita del usuario; evita un rediseño paralelo de páginas que no se tocaron en el diseño.
- **Sí: borrar las cinco imágenes huérfanas y `docs/landing-v2-diseno/`.** Decisión explícita del usuario; siguen en el historial de git.
- **Sí: actualizar `docs/BRAND-FOUNDATIONS.md`.** Decisión explícita del usuario.
- **Sí: `highlights` como campo nuevo de `PACKAGES` en vez de escribir las viñetas dentro de `Packages.tsx`.** Asunción de esta sesión: mantiene precios y textos de paquetes en la fuente única; las viñetas cortas solo las usa la landing y `/paquetes` sigue leyendo `groups`.
- **Sí: `LANDING_FAQ_QUESTIONS` en lugar del flag `onLanding`.** Asunción de esta sesión: permite fijar el orden del diseño (precio primero) y reutiliza el patrón de `PRICE_FAQ` de `/paquetes`. Las preguntas se reutilizan con su texto actual; el diseño mostraba versiones abreviadas, pero renombrarlas rompería `getFaq(...)` en otras páginas y cambiaría el schema.
- **Sí: mantener los `id` de secciones que continúan** (`funcionalidades`, `faq`, `paquetes`, `mesas`, `ia`, `planners`, `como-funciona`, `disenos`) y agregar `editor`, `proceso` y `contacto`. Asunción de esta sesión: conserva la continuidad de las métricas `section_viewed` del spec 11.
- **Sí: el botón de planners de la landing va a WhatsApp con mensaje prellenado**, no a `/wedding-planners` como en el prototipo. Asunción de esta sesión: conserva la medición `cta_click` de esa ubicación; la página de planners sigue enlazada desde el nav y el footer.
- **Sí: terracota oscuro `#AE5730` en botones principales y banda de planners.** Asunción de esta sesión, basada en el hallazgo de contraste de la marca (el `#C6663C` da 3.67:1 con marfil).
- **Sí: mantener `basico.notIncluded` con su texto actual** en la tarjeta de la landing, aunque el diseño lo abreviaba. Asunción de esta sesión: es el mismo texto que usa `/paquetes`.
- **Sí: el primer punto del Personalizado dice "Panel para editar tú mismo tu invitación y gestionar invitados" sin "sin depender de nosotros".** Asunción de esta sesión, coherente con que los cambios visuales se piden por WhatsApp.
- **No: cambios a `MesasSection.tsx` y `AiSection.tsx`.** El usuario aprobó ambas tal como están implementadas.
- **No: barra de números de "Parejas reales" con marcadores `[N]` en producción.** Los marcadores del diseño eran solo para el lienzo; nunca se publican textos con corchetes.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Quitar `onLanding` toca 22 ítems y un error dejaría la landing con un número de preguntas distinto de ocho, o rompería `getFaq` en `/paquetes`, `/wedding-planners` o `/disenos/[slug]` al no encontrar una pregunta. | El paso 2 deja el sitio funcional por sí solo; el criterio de aceptación exige exactamente 8 preguntas y `/preguntas-frecuentes` con las 22, y `npm run build` prerenderiza esas páginas, así que fallaría al leer una pregunta inexistente. |
| La descripción del hero seguirá prometiendo "panel simple" para el Paquete Básico, que no lo incluye. | Riesgo aceptado por el usuario; la tarjeta del Básico y la banda comparativa de Paquetes aclaran quién edita, y queda registrado aquí para revisarlo con datos de conversión. |
| Los compromisos nuevos (revisiones ilimitadas, cambios visuales por WhatsApp) pueden generar carga operativa si muchos clientes los usan. | Son decisión de negocio del usuario; se documentan en `docs/BRAND-FOUNDATIONS.md` para poder ajustarlos en un solo lugar si hace falta. |
| La vista previa en vivo con `maxLength={48}` puede desbordar el celular con textos largos sin espacios. | El celular usa `overflow-wrap: anywhere` y altura fija con `overflow: hidden`; se prueba pegando 48 caracteres seguidos. |
| Quitar "Funcionalidades" del nav y renombrar la sección puede dejar enlaces externos a `/#funcionalidades` sin contexto. | El `id="funcionalidades"` se conserva en "Qué incluye", así que esos enlaces siguen llevando a una sección válida. |
| Perder la medición de `cta_click` de planners si el botón enlazara a la página en vez de a WhatsApp. | Decisión de dejarlo en WhatsApp con mensaje prellenado; se cubre en un criterio de aceptación. |
| Un salto de layout (CLS) por las secciones nuevas o por la fuente Fraunces en los títulos. | Las secciones nuevas no cargan imágenes propias y reutilizan las fuentes ya cargadas; el hero conserva su animación CSS y su imagen con `priority`, como hoy. |

## Lo que **no** está en este spec

- Sección de parejas reales, testimonios o cifras de uso.
- Barra fija de CTA en móvil.
- Política de pago, anticipo o garantía en la landing.
- Rediseño de `/paquetes`, `/preguntas-frecuentes`, `/disenos/[slug]` o `/wedding-planners`.
- La sección "Cada invitado recibe su propia invitación".
- QR o check-in por invitado, y cualquier cambio de producto o de precios.
- Cambios a `MesasSection.tsx` o `AiSection.tsx`.
- Nuevos eventos de analítica.
- Traducción de la landing a next-intl.
- Gating técnico real de Mesas, IA o el editor por paquete.

Cada uno de estos, si se decide hacer, va en su propio spec.
