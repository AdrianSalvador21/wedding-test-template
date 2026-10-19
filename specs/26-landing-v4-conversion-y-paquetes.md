# 26 — Landing v4: una sola historia de venta, confianza sin reseñas y comparativa de paquetes compartida

**Estado:** Approved
**Depende de:** SPEC 10, SPEC 11, SPEC 15, SPEC 16, SPEC 18, SPEC 24
**Fecha:** 2026-10-19

## Objetivo

Reestructurar la landing (`/`) en 8 secciones que vendan la invitación en el orden en que la pareja decide, con la forma de pago como garantía principal, y llevar la misma comparativa de paquetes a `/paquetes`.

## Contexto

Este spec implementa la auditoría y el diseño de alta fidelidad aprobados en la sesión del 2026-10-17 al 2026-10-19. El artefacto de referencia es https://claude.ai/artifact/ME2HtwoaQzPZubsd5EvrGX: la pestaña "Auditoría" tiene los hallazgos y la pestaña "Landing propuesta" tiene el diseño final, en escritorio y móvil, con notas de cambio por sección. **Ese diseño es la fuente de verdad visual y de copy de este spec.**

Estado real del código, revisado en esta sesión:

- **`components/LandingPage.tsx` tiene 13 secciones** y mide unos 10,600 px en escritorio y 17,400 px en móvil. Orden actual (spec 18): `Hero → PriceStrip → MesasSection → DesignGallery → HowItWorks → Features → EditorSection → AiSection → Packages → ProcessSection → FAQ → PlannerCta → FinalCta`.
- **Hay información repetida.** Hay dos secciones de proceso (`HowItWorks` y `ProcessSection`). La diferencia de quién hace los cambios se explica 4 veces (Editor, Packages, Process y FAQ). Las funciones de la invitación aparecen en `Features`, `Packages`, `AiSection` y la FAQ.
- **Mesas se contradice.** Es gratis con cualquier cuenta (spec 16), pero `PACKAGES[1].highlights` y `PACKAGES[1].groups` la presentan como ventaja "Nueva" del Personalizado. Además, la FAQ `'¿Qué es la gestión de mesas?'` termina diciendo "Es parte del Paquete Personalizado".
- **El botón principal "Crea tu invitación" abre WhatsApp** sin decirlo. En la landing hay 10 botones de acción con 8 textos distintos.
- **La forma de pago no aparece en ninguna parte del sitio.** Es $500 MXN de anticipo por transferencia y el resto al entregar. No se emite factura. Respuesta por WhatsApp en menos de una hora (datos confirmados por el usuario el 2026-10-19).
- **No hay reseñas ni bodas que se puedan mostrar.** Solo hay dos bodas entregadas, sin contacto actual. `docs/BRAND-FOUNDATIONS.md` prohíbe inventar testimonios.
- **`AiSection.tsx` usa morado (`#6D28D9`, `#F5F3FF`)**, el único color fuera de la marca.
- **`app/paquetes/page.tsx` tiene sus propias tarjetas (`PackageCard`) y su propia tabla (`COMPARISON`)** con `min-w-[640px]`, que en móvil obliga a desplazarse de lado.
- **La analítica (spec 11) es automática.** `lib/analytics/section-tracking.ts` emite `section_viewed` por cada `section[id]`. `lib/analytics/click-tracking.ts` etiqueta los clics a WhatsApp con el `id` de la sección contenedora, o con `data-track-package` / `data-track-location` si existen.
- **`FAQ_ITEMS` se consulta por texto exacto con `getFaq(...)!`** desde `app/disenos/[slug]/page.tsx` y `app/wedding-planners/page.tsx`. Borrar o renombrar una pregunta rompe esas páginas en build.
- **`PACKAGES[n].groups`, `.highlights` y `.notIncluded`** solo los usan `components/landing/Packages.tsx` y `app/paquetes/page.tsx`. `forWho` también lo usa `lib/seo-schema.ts` (`packagesSchema`, descripción del `Offer`).
- **`DESIGNS[n].tagline`** se usa en `DesignGallery.tsx` y en la lista "otros diseños" de `app/disenos/[slug]/page.tsx`.
- **`Nav.tsx` y `Footer.tsx` se comparten** con todas las páginas de marketing vía `components/marketing/PageShell.tsx`. Hoy el menú de escritorio solo aparece desde 1280 px (`xl`).

## Alcance

**Incluye:**

- **Nuevo orden de la landing** (`components/LandingPage.tsx`): `Nav → Hero → PriceStrip → TrustSection → DesignGallery → GuestJourney → PersonalizadoSection → Packages → MesasSection → FAQ → FinalCta → PlannerCta → Footer`, más `StickyCtaBar` solo en móvil.
- **Componentes nuevos** en `components/landing/`:
  - `TrustSection.tsx`
  - `GuestJourney.tsx`
  - `PersonalizadoSection.tsx`, que fusiona el editor y la IA y agrega la invitación por invitado
  - `PackagesComparison.tsx`: tabla en escritorio y selector con una tarjeta en móvil, compartido con `/paquetes`
  - `PaymentAndProcess.tsx`: bloque de pago y "Así trabajamos", compartido con `/paquetes`
  - `StickyCtaBar.tsx`
- **Componentes reescritos:** `Hero.tsx`, `PriceStrip.tsx` (solo textos), `DesignGallery.tsx`, `Packages.tsx`, `MesasSection.tsx` (versión corta), `FAQ.tsx`, `FinalCta.tsx`, `PlannerCta.tsx` (franja delgada), `Nav.tsx` y `Footer.tsx`.
- **Componentes eliminados:** `HowItWorks.tsx`, `Features.tsx`, `EditorSection.tsx`, `AiSection.tsx` y `ProcessSection.tsx`. Sus textos y lógica útiles se mudan a los componentes nuevos, según se indica en el plan.
- **`/paquetes` (`app/paquetes/page.tsx`):**
  - `PackageCard` y la tabla `COMPARISON` se reemplazan por `PackagesComparison` + `PaymentAndProcess`.
  - Se mantienen `PageHero`, el bloque gratis, "Qué necesitamos de ti" (`NEEDS`), la FAQ de precio y el `CtaBand`, con los textos alineados.
- **`lib/marketing-content.ts`:**
  - Constantes nuevas `PAYMENT`, `RESPONSE_TIME` y `PACKAGE_COMPARISON`.
  - 3 preguntas nuevas en `FAQ_ITEMS` y 4 respuestas corregidas.
  - Nuevo `LANDING_FAQ_QUESTIONS`.
  - Campos nuevos `audience` y `badge` en `DESIGNS`, con `tagline` reescrito.
  - `PACKAGES` pierde `groups`, `highlights` y `notIncluded`, y gana `tagline`.
- **SEO:**
  - El `<h1>` del hero conserva "Invitaciones digitales para boda" como primera línea, con estilo de eyebrow.
  - La meta description de `app/page.tsx` deja de afirmar "enlace único por invitado", que el Básico no incluye.
- **`docs/BRAND-FOUNDATIONS.md`:** cuatro diseños, forma de pago, sin factura, tiempo de respuesta y nuevo CTA.

**No incluye (queda para otros specs):**

- La sección "Quién está detrás de Invyta" (foto y texto del dueño). Está diseñada, pero queda oculta hasta tener el contenido.
- Un bloque de testimonios o reseñas. Se agrega cuando haya 3 o más con permiso.
- Fotos nuevas con una pareja distinta por diseño. Se usan las 4 capturas actuales de `public/assets/landing/`.
- Rediseño de `/disenos/[slug]`, `/wedding-planners` y `/preguntas-frecuentes`. Solo heredan los cambios de contenido de `lib/marketing-content.ts` y el `Nav`/`Footer` compartidos.
- El flujo "Recíbela como invitado" con demo personalizada a mano. Se descartó y el botón abre la demo directa.
- Eventos de analítica nuevos. Solo se conservan, crean y retiran ids de sección.
- Autoservicio de compra, pasarela de pago o facturación.
- Traducción de la landing al inglés.

## Modelo de datos

No hay cambios en Firestore, tipos de `src/types` ni rutas de servidor. Todo vive como contenido en `lib/marketing-content.ts`.

```ts
// Forma de pago (fuente única: hero, TrustSection, PaymentAndProcess, FAQ, StickyCtaBar).
export const PAYMENT = {
  depositMxn: 500,          // anticipo para apartar fecha y empezar
  method: 'transferencia',
  balanceOn: 'entrega',     // el resto se paga al recibir la invitación terminada
  invoice: false,           // hoy no se emite factura
} as const;

// Promesa de respuesta por WhatsApp (texto, no número, para usarlo en frases).
export const RESPONSE_TIME = 'menos de una hora';

// Comparativa compartida por la landing y /paquetes.
// `text` solo en filas donde cada paquete tiene un valor propio en lugar de sí/no.
export interface ComparisonRow { label: string; basico: boolean; personalizado: boolean; text?: { basico: string; personalizado: string } }
export interface ComparisonGroup { title: string; rows: ComparisonRow[] }
export const PACKAGE_COMPARISON: ComparisonGroup[] = [
  { title: 'Tu invitación', rows: [/* 5 filas, todas true/true */] },
  { title: 'Después de publicar', rows: [/* "Cambios de datos" con text, y 4 filas false/true */] },
];
```

Filas exactas de `PACKAGE_COMPARISON` (iguales a las del diseño):

| Grupo | Fila | Básico | Personalizado |
| --- | --- | --- | --- |
| Tu invitación | Uno de los 4 diseños, lista en 7 días hábiles | sí | sí |
| Tu invitación | Historia, galería, cuenta regresiva, cronograma y mapa | sí | sí |
| Tu invitación | Regalos, hospedaje, vestimenta y sección solo adultos | sí | sí |
| Tu invitación | Confirmación de asistencia y lista de confirmados | sí | sí |
| Tu invitación | Revisiones ilimitadas antes de la entrega | sí | sí |
| Después de publicar | Cambios de datos | "Los hacemos por ti" | "Tú, desde tu panel" |
| Después de publicar | Enlace y bienvenida con el nombre de cada invitado | no | sí |
| Después de publicar | Lugares por invitado, idioma ES/EN y canción | no | sí |
| Después de publicar | Asistente con IA para textos y traducción | no | sí |
| Después de publicar | Soporte extendido la semana de tu boda | no | sí |

Cambios en tipos existentes:

- `PackageContent`: se eliminan `groups`, `highlights` y `notIncluded`, junto con los tipos `PackageGroup` y `PackageHighlight`. Se agrega `tagline: string`: `'Nosotros hacemos todo'` (Básico) y `'Tú tienes el control'` (Personalizado). `forWho` se queda, porque es la descripción del `Offer` en el JSON-LD. Sus textos cambian a:
  - Básico: `'Invyta arma tu invitación y hace los cambios por ti.'`
  - Personalizado: `'Tu invitación con panel para editar, una invitación por invitado y asistente con IA.'`
- `DesignContent`: se agregan `audience: string` (por ejemplo `'Jardín y hacienda'`) y `badge: string` (por ejemplo `'Fotos en arco'`). `tagline` se reescribe por tipo de boda con los textos del diseño (por ejemplo Moderno: `'Limpio y actual, para parejas que prefieren menos adorno y más aire.'`).

Cambios en `FAQ_ITEMS`. Ninguna pregunta existente se borra ni se renombra:

- **Nuevas** (grupo `'Antes de empezar'`):
  - `'¿Cómo se paga?'`. Respuesta construida con `PAYMENT`: "Por transferencia. Empiezas con $500 MXN de anticipo y pagas el resto cuando recibes tu invitación terminada. Por ahora no emitimos factura."
  - `'¿Por qué no mandar un PDF o una imagen?'`
  - `'¿Cuándo conviene enviarla?'`
- **Respuestas corregidas:**
  - `'¿Cuánto tarda la entrega?'` → "7 días hábiles desde que tenemos tu información y tus fotos."
  - `'¿Cuánto tiempo estará activa mi invitación?'` → "Está en línea hasta 15 días después de tu boda."
  - `'¿Qué es la gestión de mesas?'`: deja de decir que es del Personalizado y dice que es gratis con cualquier cuenta.
  - `'¿Mis invitados mayores sabrán usarla?'`: agrega "Para confirmar solo eligen 'Sí, ahí estaré'."
- **`LANDING_FAQ_QUESTIONS`**, en este orden: `'¿Cómo se paga?'`, `'¿Mis invitados necesitan descargar una aplicación?'`, `'¿Mis invitados mayores sabrán usarla?'`, `'¿Por qué no mandar un PDF o una imagen?'`, `'¿Cuánto tarda la entrega?'`, `'¿Puedo cambiar la información después de publicar?'`, `'¿Cuánto tiempo estará activa mi invitación?'`, `'¿Cuándo conviene enviarla?'`.

Ids de sección (analítica, spec 11):

- **Se conservan:** `inicio` (Hero), `precio` (PriceStrip), `disenos`, `paquetes`, `mesas`, `faq`, `contacto` (FinalCta) y `planners`.
- **Nuevos:** `confianza`, `experiencia-invitado` y `personalizado`.
- **Se retiran:** `como-funciona`, `funcionalidades`, `editor`, `ia` y `proceso`.

## Plan de implementación

Cada paso deja la landing y `/paquetes` compilando y navegables.

1. **Contenido nuevo sin quitar nada.** En `lib/marketing-content.ts`:
   - Agregar `PAYMENT`, `RESPONSE_TIME`, `PACKAGE_COMPARISON` y los tipos de comparativa.
   - Agregar las 3 preguntas nuevas y corregir las 4 respuestas.
   - Reemplazar `LANDING_FAQ_QUESTIONS`.
   - Agregar `tagline` a `PACKAGES` y `audience`/`badge` a `DESIGNS`, y reescribir `DESIGNS[n].tagline`.
   - Prueba: `npm run build` sin errores. `/preguntas-frecuentes`, `/disenos/clasico` y `/wedding-planners` cargan y muestran las respuestas corregidas.
2. **Comparativa y pago compartidos.**
   - Crear `PackagesComparison.tsx`. En escritorio es una tabla con columna Personalizado oscura, badge "Recomendado", botón principal terracota en el Personalizado y botón de contorno en el Básico. En móvil (`< md`) es el selector Personalizado/Básico con una sola tarjeta: arranca en Personalizado y las filas no incluidas se ven en gris y tachadas. Abajo va la línea de cambio ("Por $300 más: …" / "¿Prefieres que nosotros hagamos todo?"), con la diferencia calculada de `PACKAGES`. Cada botón vive dentro de un contenedor con `data-track-package="basico" | "personalizado"`.
   - Crear `PaymentAndProcess.tsx` con el bloque "Así pagas" (desde `PAYMENT`) y "Así trabajamos" en 3 pasos (textos del diseño).
   - Reescribir `Packages.tsx` (id `paquetes`) para usar los dos.
   - Prueba: la sección de paquetes de la landing se ve como en el diseño a 1440 px y a 390 px, y el selector móvil cambia de paquete.
3. **`/paquetes` con la comparativa compartida.**
   - Reemplazar `PackageCard` y `COMPARISON` por `PackagesComparison` + `PaymentAndProcess`.
   - Agregar `'¿Cómo se paga?'` como primera pregunta de `PRICE_FAQ`.
   - Cambiar el chip "Hosting hasta 15 días después del evento" por "En línea hasta 15 días después de tu boda".
   - Actualizar el `CtaBand` a texto "Te respondemos en menos de una hora con la disponibilidad para tu fecha." y botón "Cotiza por WhatsApp".
   - Eliminar de `PACKAGES` los campos `groups`, `highlights` y `notIncluded` y sus tipos, que ya no tienen consumidores. Actualizar los textos de `forWho`.
   - Prueba: `npm run build` sin errores. `/paquetes` sin desplazamiento horizontal a 390 px. El JSON-LD de `/paquetes` sigue exponiendo `price: 1100` y `price: 1400`.
4. **Nav y Footer compartidos.**
   - `Nav.tsx`: enlaces `Diseños` (`/#disenos`), `Cómo funciona` (`/#experiencia-invitado`), `Precios` (`/paquetes`), `Planners` (`/wedding-planners`), `Preguntas` (`/preguntas-frecuentes`) y `Entrar` (`/login`), más el botón "Cotiza por WhatsApp" (`whatsappUrl` con el mensaje del hero). El menú de escritorio aparece desde `lg` (1024 px) en lugar de `xl`.
   - `Footer.tsx`: "Paquetes" → "Precios" y "Preguntas frecuentes" → "Preguntas".
   - Prueba: el estado activo sigue marcando la página correcta en `/paquetes`, `/wedding-planners` y `/preguntas-frecuentes`.
5. **Hero y franja de precio.**
   - Reescribir `Hero.tsx` (id `inicio`):
     - `<h1>` con primera línea "Invitaciones digitales para boda" en estilo eyebrow, luego "Tu invitación de boda, lista en 7 días." y "Y tú sabes quién viene." en itálica terracota.
     - Párrafo del diseño.
     - Botón "Cotiza por WhatsApp" con ícono de WhatsApp.
     - Enlace "Ábrela como invitado →" a `#disenos`.
     - Línea "Te respondemos en menos de una hora." desde `RESPONSE_TIME`.
     - Tres garantías: anticipo de $500 desde `PAYMENT`, resto al recibirla terminada, revisiones ilimitadas.
     - Visual: un teléfono con selector de diseño (Jardín, Clásico, Moderno, Botánica, que cambian la imagen de `DESIGNS[n].image`) y dos tarjetas flotantes ("Familia Ortega confirmó · 4 personas" y "Confirmados 44 / 60").
     - Se elimina el enlace "Organiza tu boda gratis →". El acceso gratis queda en `MesasSection` y en "Entrar" del Nav.
   - `PriceStrip.tsx`: "Hosting hasta 15 días después del evento" → "En línea hasta 15 días después de tu boda".
   - Prueba: a 390 px el teléfono aparece antes del párrafo.
6. **TrustSection.** Crear `TrustSection.tsx` (id `confianza`) con el título "Empiezas con $500. El resto, cuando ya la viste terminada." y 4 garantías: $500 de anticipo por transferencia, pagas el resto al verla lista, revisiones ilimitadas y respuesta en menos de una hora. Las cifras salen de `PAYMENT` y `RESPONSE_TIME`. Insertarla después de `PriceStrip`.
7. **DesignGallery.** Reescribir (id `disenos`):
   - Orden Jardín Editorial, Clásico, Moderno, Botánica Editorial.
   - Cada tarjeta lleva imagen con `badge`, `audience`, nombre, `tagline`, un solo botón "Ábrela como invitado ↗" (a `demoHref`, nueva pestaña) y el enlace secundario "Ver detalles" (a `/disenos/{slug}`).
   - En móvil se conserva el carrusel con snap y se agrega "Desliza para ver los cuatro →".
8. **GuestJourney.** Crear `GuestJourney.tsx` (id `experiencia-invitado`, fondo oscuro) con los 4 pasos del diseño: WhatsApp, invitación, confirmación y tu lista. El invitado de ejemplo es "Carlos". El botón "Ábrela como invitado" abre la demo de Jardín Editorial (`getDesign('jardin-editorial').demoHref`), con la nota "La bienvenida con nombre es del Paquete Personalizado." Va después de `DesignGallery`.
9. **PersonalizadoSection.**
   - Crear `PersonalizadoSection.tsx` (id `personalizado`) con tres pestañas accesibles (`role="tablist"`, flechas izquierda/derecha):
     - "Edita tu invitación": editor en vivo, reusando la lógica de `EditorSection`.
     - "Una para cada invitado": nombre, lugares e idioma, que actualizan la vista previa y la URL.
     - "Escribe con IA": selector de tono y ES/EN, reusando los textos de `AiSection`, con acento terracota en lugar de morado.
   - Cada pestaña tiene sus 3 viñetas y la etiqueta "Solo en Personalizado".
   - Eliminar `EditorSection.tsx` y `AiSection.tsx`.
   - Prueba: las tres demos responden al escribir y no queda ningún `#6D28D9` en `components/landing/`.
10. **MesasSection corta.** Reescribir `MesasSection.tsx` (id `mesas`) con la etiqueta "Gratis, con cualquier cuenta", el título "¿Todavía no decides tu invitación? Organiza tus invitados y mesas hoy.", 3 viñetas, el botón "Crear cuenta gratis" (`/login?mode=signup`) y un plano estático de ejemplo con leyenda de 4 estados. Se retira la demo arrastrable. Moverla después de `Packages`.
11. **FAQ, cierre y planners.**
    - `FAQ.tsx` (id `faq`): columna izquierda fija con título, texto "¿No está tu pregunta? Escríbenos y te respondemos en menos de una hora." y enlace "Pregúntanos por WhatsApp →". Columna derecha con las 8 preguntas de `LANDING_FAQ_QUESTIONS`, la primera abierta.
    - `FinalCta.tsx` (id `contacto`, fondo blanco): eyebrow "Empecemos", título actual, texto con `RESPONSE_TIME`, botón "Cotiza por WhatsApp" con ícono y la píldora "¿Prefieres agregarnos tú? +52 960 246 0590" (desde `SITE.phone`).
    - `PlannerCta.tsx` (id `planners`) pasa a franja delgada con el mismo mensaje y botón.
12. **Orden final y barra móvil.**
    - Ajustar `LandingPage.tsx` al orden del Alcance.
    - Eliminar `HowItWorks.tsx`, `Features.tsx` y `ProcessSection.tsx`.
    - Crear `StickyCtaBar.tsx`: solo `< md`, fija abajo, con "Desde $1,100 MXN" y "$500 para empezar · resto al entregar" desde `PACKAGES` y `PAYMENT`, y el botón "Cotizar" a WhatsApp. Aparece cuando el hero sale de pantalla (IntersectionObserver) y respeta `env(safe-area-inset-bottom)`.
13. **SEO y documentación.**
    - `app/page.tsx`: meta description sin "enlace único por invitado" (por ejemplo "Invitaciones digitales para boda: tus invitados confirman desde WhatsApp y tú ves la lista en tiempo real. Lista en 7 días hábiles. Desde $1,100 MXN.", de 155 caracteres o menos).
    - `docs/BRAND-FOUNDATIONS.md`: cuatro diseños, sección de pago ($500 de anticipo, resto al entregar, sin factura), respuesta en menos de una hora y CTA "Cotiza por WhatsApp".

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos.
- [ ] La landing renderiza exactamente estas secciones, en este orden: `inicio`, `precio`, `confianza`, `disenos`, `experiencia-invitado`, `personalizado`, `paquetes`, `mesas`, `faq`, `contacto`, `planners`.
- [ ] No existen en el repo `HowItWorks.tsx`, `Features.tsx`, `EditorSection.tsx`, `AiSection.tsx` ni `ProcessSection.tsx`, y nada los importa.
- [ ] El `<h1>` de `/` contiene el texto "Invitaciones digitales para boda" y la promesa "Tu invitación de boda, lista en 7 días".
- [ ] El hero muestra "Te respondemos en menos de una hora." y la garantía del anticipo de $500 bajo el botón "Cotiza por WhatsApp".
- [ ] El selector de diseño del hero cambia la imagen del teléfono entre los 4 diseños.
- [ ] A 390 px de ancho, el teléfono del hero aparece antes del párrafo descriptivo.
- [ ] Todos los botones de WhatsApp de la landing y del Nav dicen "Cotiza por WhatsApp", "Cotizar" (barra móvil), "Elegir Básico", "Elegir Personalizado", "Pregúntanos por WhatsApp →" o "Cuéntanos cuántas bodas manejas". No queda ninguno con "Crea tu invitación".
- [ ] La cifra $500 aparece en hero, `TrustSection`, `PaymentAndProcess`, FAQ y `StickyCtaBar`, y en el código solo está escrita en `PAYMENT.depositMxn`.
- [ ] Cada tarjeta de `DesignGallery` tiene un solo botón "Ábrela como invitado ↗" que abre la demo real en una pestaña nueva.
- [ ] `GuestJourney` muestra 4 pasos con el invitado "Carlos". Su botón abre la demo de Jardín Editorial.
- [ ] Las 3 pestañas de `PersonalizadoSection` funcionan con clic y con flechas del teclado. El editor y la invitación por invitado actualizan la vista previa al escribir, y la IA cambia de texto por tono y por idioma.
- [ ] No queda ningún `#6D28D9` ni `#F5F3FF` en `components/landing/`.
- [ ] A 1024 px o más, `PackagesComparison` es una tabla con las 10 filas de `PACKAGE_COMPARISON`, y el botón del Personalizado es terracota sólido mientras el del Básico es de contorno.
- [ ] Por debajo de 768 px, `PackagesComparison` muestra el selector con una sola tarjeta que arranca en Personalizado, y al elegir Básico las 4 filas no incluidas se ven tachadas.
- [ ] Los clics en "Elegir Básico" y "Elegir Personalizado" (landing y `/paquetes`) se etiquetan con `basico` / `personalizado` vía `data-track-package`.
- [ ] Mesas no aparece como ventaja del Personalizado en la landing ni en `/paquetes`. La FAQ `'¿Qué es la gestión de mesas?'` dice que es gratis con cualquier cuenta.
- [ ] `MesasSection` está después de `Packages`, sin demo arrastrable, con el botón "Crear cuenta gratis" a `/login?mode=signup`.
- [ ] La FAQ de la landing muestra las 8 preguntas de `LANDING_FAQ_QUESTIONS` en el orden definido.
- [ ] `/preguntas-frecuentes` muestra las 3 preguntas nuevas.
- [ ] `/disenos/[slug]` y `/wedding-planners` siguen cargando sus FAQ sin errores.
- [ ] `FinalCta` muestra la píldora con el número "+52 960 246 0590" legible sobre fondo blanco.
- [ ] `StickyCtaBar` solo aparece por debajo de 768 px y después de pasar el hero. No tapa el contenido final del footer.
- [ ] `/paquetes` usa `PackagesComparison` y `PaymentAndProcess`. Su primera pregunta de precio es "¿Cómo se paga?" y no tiene desplazamiento horizontal a 390 px.
- [ ] El JSON-LD de `/paquetes` expone `price: 1100` y `price: 1400`, con las descripciones nuevas de `forWho`.
- [ ] El Nav muestra Diseños, Cómo funciona, Precios, Planners, Preguntas y Entrar, más el botón "Cotiza por WhatsApp", y el menú de escritorio es visible desde 1024 px.
- [ ] La meta description de `/` no contiene "enlace único por invitado".
- [ ] `docs/BRAND-FOUNDATIONS.md` menciona cuatro diseños, el anticipo de $500 con el resto al entregar, que no se emite factura y la respuesta en menos de una hora.
- [ ] No existe en la landing ninguna sección de "Quién está detrás" ni de testimonios.

## Decisiones tomadas y descartadas

- **Sí: el diseño del artefacto (pestaña "Landing propuesta") es la fuente de verdad visual y de copy.** El usuario lo revisó e iteró antes de pedir el spec (tabla móvil, invitado "Carlos", número visible y sección del equipo oculta).
- **Sí: el alcance es la landing y `/paquetes`.** Decisión del usuario. `/disenos`, `/wedding-planners` y `/preguntas-frecuentes` solo heredan el contenido compartido.
- **Sí: una comparativa compartida (`PackagesComparison`) para la landing y `/paquetes`.** Decisión del usuario. Evita que las dos páginas vuelvan a divergir y resuelve la tabla de `/paquetes`, que en móvil obliga a desplazarse de lado.
- **Sí: en móvil, selector con una sola tarjeta en lugar de tabla.** Decisión del usuario tras ver la tabla apretada a 390 px. **No:** dos tarjetas apiladas. Alargan la sección y repiten las 5 filas comunes.
- **Sí: crear componentes nuevos y borrar los que quedan sin uso.** Decisión del usuario. No se deja código muerto.
- **Sí: Mesas baja al lugar 7, en versión corta y sin demo arrastrable.** Decisión del usuario. **Revierte el orden del spec 18**, que la había subido al tercer lugar. La meta de la landing es vender paquetes, y un producto gratis antes de los diseños canibalizaba la venta. Mesas queda como red de captura para quien todavía no compra.
- **Sí: el hero quita "Organiza tu boda gratis →" y vuelve a tener un enlace a los diseños.** Esto **revierte la decisión del spec 18** sobre el hero. El acceso gratis se mantiene en `MesasSection` y en "Entrar" del Nav.
- **Sí: la forma de pago es la garantía principal.** Sustituye la prueba social, que todavía no existe ($500 de anticipo y el resto al entregar, confirmado por el usuario).
- **No: bloque de testimonios ni contador de bodas.** Hay solo dos bodas sin contacto y cero reseñas. BRAND-FOUNDATIONS prohíbe inventar. Se agrega en otro spec con 3 o más reseñas con permiso.
- **No (por ahora): sección "Quién está detrás".** Decisión del usuario. Queda oculta en el diseño hasta tener foto y texto reales.
- **Sí: "Ábrela como invitado" abre la demo directa.** Decisión del usuario. **No:** el botón que pedía la demo por WhatsApp para responder a mano con un enlace personalizado, porque genera trabajo manual por cada prospecto.
- **Sí: la keyword "Invitaciones digitales para boda" se queda dentro del `<h1>`, con estilo de eyebrow.** Decisión del usuario, para no perder el trabajo de SEO del spec 10 al cambiar la promesa visible. **No:** dejarla solo como eyebrow fuera del H1.
- **Sí: quitar Mesas como ventaja del Personalizado y corregir su FAQ.** Decisión del usuario. Es gratis para todos (spec 16), así que presentarla como razón para pagar $300 más era contradictorio.
- **Sí: datos nuevos en `lib/marketing-content.ts` (`PAYMENT`, `RESPONSE_TIME`, `PACKAGE_COMPARISON`).** Decisión del usuario. El $500 aparece en 5 lugares y debe vivir en uno solo, siguiendo la convención del spec 10. Los textos propios de cada sección siguen en su componente, como hoy.
- **Sí: conservar los ids de sección que siguen existiendo, crear 3 nuevos y retirar 5.** Decisión del usuario, para no romper la serie histórica de `section_viewed` y de los clics etiquetados por sección.
- **Sí: Nav nuevo en todas las páginas de marketing, con el menú de escritorio desde 1024 px.** Decisión del usuario. Las etiquetas cortas caben y las laptops pequeñas dejan de ver la hamburguesa.
- **Sí: actualizar `docs/BRAND-FOUNDATIONS.md`.** Decisión del usuario. Hoy dice "tres diseños" y no tiene la forma de pago.
- **Sí: no se borra ni se renombra ninguna pregunta de `FAQ_ITEMS`; solo se agregan y se corrigen respuestas.** Decisión de esta sesión. `/disenos/[slug]` y `/wedding-planners` las buscan por texto exacto con `getFaq(...)!`.
- **Sí: `DESIGNS[n].tagline` se reescribe por tipo de boda, y se agregan `audience` y `badge`.** Decisión de esta sesión, alineada con el hallazgo de la auditoría (describir por tipo de boda, no por tipografía). El cambio también se ve en la lista "otros diseños" de `/disenos/[slug]`, lo que se considera una mejora coherente.
- **Sí: `PACKAGES` conserva `forWho` (JSON-LD) y gana `tagline` (UI).** Decisión de esta sesión. Separa la frase corta de la tarjeta de la descripción del `Offer` para buscadores.
- **Sí: `PriceStrip` se conserva con su id `precio`.** El diseño final la mantiene debajo del hero. Solo cambia "Hosting" por "En línea".
- **Sí: `StickyCtaBar` solo en la landing y solo en móvil, a partir de que el hero sale de pantalla.** Así no duplica el botón del hero en el primer pantallazo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Bajar Mesas al lugar 7 y quitar el enlace gratis del hero podría reducir los registros gratis (spec 16). | La meta acordada es vender paquetes. `section_viewed` de `mesas` y los clics a `/login?mode=signup` ya se miden, así que se puede comparar antes y después. "Entrar" sigue en el Nav. |
| Cambiar el H1 visible podría afectar el posicionamiento orgánico de "invitaciones digitales para boda". | La keyword se queda dentro del `<h1>`. Title, meta description y JSON-LD siguen con la keyword. |
| Borrar los campos `groups`/`highlights`/`notIncluded` rompe cualquier consumidor no detectado. | En esta sesión solo se encontraron `Packages.tsx` y `app/paquetes/page.tsx`, ambos reescritos. `npm run build` lo detectaría. |
| Renombrar o borrar por error una pregunta de `FAQ_ITEMS` rompe `/disenos/[slug]` o `/wedding-planners` (`getFaq(...)!` devuelve `undefined`). | Regla explícita de solo agregar y corregir respuestas. Hay un criterio de aceptación que verifica que esas páginas cargan. |
| Las capturas actuales solo muestran dos parejas, y el selector del hero puede parecer repetitivo. | Aceptado. Las fotos nuevas por diseño quedan fuera de alcance. Las pantallas sí cambian de diseño, tipografía y color. |
| La promesa "menos de una hora" no se cumple de noche. | `RESPONSE_TIME` es una sola constante. Si hace falta agregar horario, se cambia en un solo lugar. |
| `StickyCtaBar` puede tapar el último contenido o el footer en móvil. | Se agrega padding inferior equivalente a la altura de la barra al final de la página, y la barra respeta `safe-area-inset-bottom`. |

## Lo que **no** está en este spec

- Sección "Quién está detrás de Invyta".
- Bloque de testimonios, reseñas o contador de bodas.
- Fotos nuevas por diseño.
- Rediseño de `/disenos/[slug]`, `/wedding-planners` y `/preguntas-frecuentes` (solo heredan contenido, Nav y Footer).
- Demo personalizada atendida a mano por WhatsApp.
- Eventos de analítica nuevos.
- Autoservicio de compra, pasarela de pago o facturación.
- Traducción al inglés.

Cada uno de estos, si se decide hacer, va en su propio spec.
