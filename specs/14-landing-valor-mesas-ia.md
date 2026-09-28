# 14 — Mesas e IA como propuesta de valor en la landing, con demo interactivo de Plano

**Estado:** Approved
**Depende de:** SPEC 12
**Fecha:** 2026-09-27

## Objetivo

Sumar a la landing pública una sección de valor para Gestión de Mesas basada en la Propuesta C (con un demo de Plano realmente arrastrable de 4 mesas, una pista de baile y un escenario) y reflejar Mesas junto al Asistente con IA como exclusivas del Paquete Personalizado en las cards de "Todo lo que incluye tu invitación", en Packages y en las FAQ.

> **Diseño explorado (canvas validado con el usuario):** https://claude.ai/artifact/T9HTz1r3n7EQ77eprn9262 — tres propuestas de la sección (A: mock-up con toggle; B: paso a paso estilo Zola/WeddingWire; C: títulos y subtítulos de B combinados con el mock-up interactivo de A, arrancando en la vista Plano), un fragmento del bullet "Nuevo" de Packages, y la propuesta de cards para "Todo lo que incluye tu invitación". La propuesta elegida para implementar es **C**, con el ajuste adicional (decidido en esta sesión) de que el Plano del mock-up sea genuinamente arrastrable en vez de ilustrativo-estático.

## Contexto

Estado real del código, revisado en esta sesión (no asumido):

- La landing pública vive en `app/page.tsx` → `components/LandingPage.tsx`, que renderiza en orden: `Nav → Hero → HowItWorks → TrustStrip → DesignGallery → IndividualPersonalization → Features → AdminProof → AiSection → Packages → PlannerCta → FAQ → Footer`. Es un árbol de componentes distinto al de `app/[locale]/page.tsx` (la plantilla de invitación que ven los invitados, con next-intl) — este spec no toca ese segundo árbol.
- `components/landing/AiSection.tsx` es la referencia de "sección de valor exclusiva" que ya funciona en producción: eyebrow "Exclusivo Paquete Personalizado", H2 con línea en cursiva color terracota, mock-up ilustrativo a la izquierda (con `useState` local para alternar tono/idioma), 4-5 tarjetas de capacidad a la derecha, fila de 3 bullets de confianza con borde superior, y CTA doble (botón de WhatsApp + link a `#paquetes`). Ninguno de estos elementos usa next-intl; todo el copy vive hardcodeado en español directamente en el componente.
- `components/landing/Features.tsx` define su propio array local `features` (6 items, cada uno con `title`, `description`, `variant: 'default' | 'dark' | 'accent'`) y lo renderiza en un grid `md:grid-cols-3` de `LCard`. Este array **no vive en `lib/marketing-content.ts`** — es local al archivo.
- `lib/marketing-content.ts` sí centraliza `PACKAGES` (con `PackageGroup { title, text, isNew? }` por paquete) y `FAQ_ITEMS` (con `{ question, answer, group, onLanding }`). El grupo `personalizado.groups` ya tiene un bullet con `isNew: true` ("Asistente con IA"), y su renderizado en `components/landing/Packages.tsx` ya sabe pintar el pill "Nuevo" + el recuadro resaltado (`rgba(227,164,131,0.12)` / borde `rgba(227,164,131,0.4)`) para cualquier grupo con `isNew: true` — no hace falta tocar `Packages.tsx`.
- No existe en el código ningún campo de paquete/tier en el modelo de datos de la boda (`src/types/wedding.ts`) ni en `lib/auth-context.tsx`. La exclusividad de la IA en el Paquete Personalizado ya funciona hoy sin gating técnico — es un acuerdo comercial que Invyta gestiona manualmente al dar de alta cada boda. Mesas seguirá exactamente el mismo criterio: la landing la presenta como exclusiva de Personalizado, sin restringir el acceso real en `app/[locale]/admin/tables/[weddingId]/page.tsx`.
- `framer-motion` ya es dependencia del proyecto y ya se usa en `components/landing/ui.tsx` (`LReveal`, `LStagger`, `LStaggerItem`) para las animaciones de scroll-reveal de toda la landing — no se agrega ninguna librería nueva para el arrastre.
- Los estados de ocupación (`vacía`, `con espacio`, `completa`, `excedida`) y su terminología son los que ya define SPEC 12 para el admin real; este spec solo los reutiliza como copy/color de ejemplo en un mock-up de marketing, no cambia su cálculo.

## Alcance

**Incluye:**

- **`components/landing/MesasSection.tsx` (nuevo):** sección completa siguiendo la Propuesta C — eyebrow "Exclusivo Paquete Personalizado", H2 "De tu lista de invitados / *al plano de tu salón.*", subtexto, toggle "Plano" / "Cuadrícula" (arranca en **Plano**), 4 tarjetas de capacidad, fila de 3 bullets de confianza, y CTA (botón de WhatsApp + link a `#paquetes`), todo con los tokens de `lib/brand.ts` / `components/landing/ui.tsx` (sin paleta nueva).
- **Demo de Plano genuinamente arrastrable:** dentro de la vista "Plano" del mock-up, 4 mesas de ejemplo (una por cada estado de ocupación: vacía, con espacio, completa, excedida) + 1 "Pista de baile" (posición inicial central) + 1 "Escenario" (posición inicial superior) se pueden arrastrar libremente con mouse y con touch, acotados a no salir del rectángulo punteado de la demo. No se puede agregar, quitar ni editar ningún elemento — solo moverlos.
- **Botón "Restablecer"** dentro del mock-up del Plano, que regresa los 6 elementos a su posición inicial sin recargar la página.
- **Vista "Cuadrícula" reducida a las mismas 4 mesas** (mismos 4 estados de ocupación) que el Plano, en vez de las 6 anteriores, para que ambas vistas representen la misma demo.
- **`components/LandingPage.tsx`:** insertar `<MesasSection />` entre `<AdminProof />` y `<AiSection />`.
- **`lib/marketing-content.ts` — Packages:** agregar el grupo `{ title: 'Gestión de mesas', text: '...', isNew: true }` a `personalizado.groups`, antes de "Asistente con IA"; actualizar `basico.notIncluded` para mencionar también la gestión de mesas.
- **`lib/marketing-content.ts` — FAQ:** agregar dos `FaqItem` en un nuevo grupo `"Gestión de mesas"`, calcados del patrón ya usado para la IA — uno visible en la landing (`onLanding: true`, sobre la exclusividad del paquete) y otro solo en `/preguntas-frecuentes` (`onLanding: false`, sobre qué es la función).
- **`components/landing/Features.tsx`:** agregar dos cards al array local `features` — "Gestión de mesas" (`variant: 'dark'`) y "Asistente con IA" (`variant: 'accent'`) — al inicio del array; bajar las 6 cards existentes a `variant: 'default'`; cambiar el grid de `md:grid-cols-3` a `md:grid-cols-4` (8 cards, 2 filas parejas de 4 en desktop).

**No incluye (queda para otra iteración):**

- Gating técnico real en el admin para restringir el acceso a Mesas según el paquete de la boda — sigue sin existir ningún campo de paquete/tier en el modelo de datos; es, y seguirá siendo, un acuerdo comercial gestionado manualmente (mismo criterio que la IA hoy).
- Pan o zoom del lienzo del demo de la landing, o cualquier otro comportamiento del Plano real de `reactflow` del admin (minimapa, fitView, `posX`/`posY` persistidos) — el demo de marketing solo permite arrastrar objetos dentro de un área fija.
- Persistir las posiciones que el visitante mueve en el demo, en localStorage o en cualquier otro lado — siempre inicia en su arreglo por defecto en cada carga de página.
- Agregar, quitar o editar mesas/objetos dentro del demo de la landing.
- Cualquier cambio a `components/admin/tables/*` o al Plano/Cuadrícula reales del panel admin — este spec solo toca la landing pública.
- Traducción de la landing a next-intl — el copy sigue hardcodeado en español, igual que el resto de `components/landing/*`.
- Nuevos eventos de analítica — `section_viewed` y `cta_click` siguen disparándose solos (por `id` de `<LSection>` y por cualquier link `wa.me`, ver `lib/analytics/section-tracking.ts` y `click-tracking.ts`), sin tocar `lib/analytics/events.ts`.

## Modelo de datos

Este spec no agrega ni cambia datos persistidos en Firestore. Introduce contenido estático nuevo en `lib/marketing-content.ts` y `components/landing/Features.tsx`, y estado de cliente efímero (no persistido) dentro de `MesasSection.tsx`:

```ts
// lib/marketing-content.ts — nuevo grupo en personalizado.groups, antes de "Asistente con IA"
{
  title: 'Gestión de mesas',
  text: 'Cuadrícula y plano visual de tu salón: arrastra a tus invitados confirmados a su mesa y ve la ocupación de un vistazo.',
  isNew: true,
}

// lib/marketing-content.ts — dos FaqItem nuevos, grupo "Gestión de mesas"
{
  question: '¿La gestión de mesas viene en el Paquete Básico?',
  answer: 'No, es parte del Paquete Personalizado, junto con el panel de edición, el asistente con IA y las invitaciones individuales por invitado.',
  group: 'Gestión de mesas',
  onLanding: true,
}
{
  question: '¿Qué es la gestión de mesas?',
  answer: 'Organiza a tus invitados confirmados en mesas desde una vista de cuadrícula o un plano visual de tu salón, con arrastrar y soltar. Es parte del Paquete Personalizado.',
  group: 'Gestión de mesas',
  onLanding: false,
}
```

```ts
// components/landing/Features.tsx — array local `features`, dos entradas nuevas al inicio,
// las 6 existentes bajan a variant: 'default'
{ title: 'Gestión de mesas', description: 'Cuadrícula y plano visual de tu salón, sincronizados con tus invitados confirmados.', variant: 'dark' }
{ title: 'Asistente con IA', description: 'Redacta tu historia, traduce a inglés y sugiere itinerario y lugares cercanos.', variant: 'accent' }
```

```ts
// components/landing/MesasSection.tsx — estado local, no persistido
type DemoStatus = 'vacia' | 'espacio' | 'completa' | 'excedida';
type DemoKind = 'table' | 'danceFloor' | 'stage';

interface DemoItem {
  id: string;
  kind: DemoKind;
  label: string;              // "Mesa 1", "Pista de baile", "Escenario"
  status?: DemoStatus;        // solo para kind: 'table'
  ratio?: string;             // "0 / 6", solo para kind: 'table'
  defaultPos: { leftPct: number; topPct: number }; // posición inicial dentro del contenedor
}

const [view, setView] = useState<'plano' | 'cuadricula'>('plano');
const [resetKey, setResetKey] = useState(0); // al incrementar, remonta los motion.div y los regresa a su posición inicial
```

Convenciones:

- Las 4 mesas del demo cubren un estado de ocupación cada una: `vacia` (0/6), `espacio` (3/8), `completa` (8/8), `excedida` (9/8) — mismos colores/textos que la leyenda ya usada en las propuestas del canvas (`#7C8363` con espacio, `#C6663C` completa, `#B33F32` excedida, contorno punteado vacía).
- Arreglo inicial del demo (porcentajes dentro del contenedor punteado): Escenario arriba-centro, Pista de baile al centro, y las 4 mesas en las cuatro esquinas restantes (dos flanqueando el escenario, dos flanqueando la pista por debajo).
- Cada elemento arrastrable es un `motion.div` con `drag`, `dragConstraints={containerRef}`, `dragElastic={0}` y `dragMomentum={false}` — esto acota el arrastre al contenedor sin escribir clamping manual, y funciona con mouse y touch sin código adicional.
- "Restablecer" incrementa `resetKey`; cada `motion.div` usa `key={`${item.id}-${resetKey}`}`, forzando un remount que descarta el offset de arrastre acumulado y vuelve a `defaultPos`.
- Ningún dato de este componente se envía a Firestore, a `localStorage` ni a analítica más allá de los eventos ya automáticos (`section_viewed`, `cta_click`).

## Plan de implementación

1. **Esqueleto de `MesasSection.tsx`.** Crear el archivo con el encabezado de la Propuesta C (eyebrow, H2, subtexto) y el toggle "Plano"/"Cuadrícula" (arranca en Plano), mostrando por ahora las 4 mesas de ejemplo de forma estática (sin arrastre) en ambas vistas, más las 4 tarjetas de capacidad, la fila de confianza y el CTA. Prueba manual: la sección se ve completa y el toggle cambia entre las dos vistas estáticas.
2. **Arrastre real en el Plano.** Convertir las 4 mesas + "Pista de baile" + "Escenario" en `motion.div` con `drag`, `dragConstraints` apuntando a un `ref` del contenedor punteado, `dragElastic={0}`, `dragMomentum={false}`, usando las posiciones iniciales definidas en el modelo de datos. Prueba manual: en desktop (mouse) y en un emulador táctil, cada uno de los 6 elementos se puede arrastrar y ninguno sale del rectángulo de la demo.
3. **Botón "Restablecer".** Agregar el botón dentro del mock-up del Plano; al hacer clic incrementa `resetKey` y los 6 elementos vuelven a su posición inicial. Prueba manual: mover varios elementos, dar clic en "Restablecer", confirmar que todos regresan exactamente a su posición inicial.
4. **Insertar la sección en la landing.** Agregar `<MesasSection />` en `components/LandingPage.tsx` entre `<AdminProof />` y `<AiSection />`. Prueba manual: la sección aparece en el lugar correcto del flujo; al hacer clic en el botón de WhatsApp se dispara `cta_click` con `location: 'mesas'` sin haber tocado ningún archivo de analítica.
5. **Bullet "Nuevo" en Packages.** Agregar el grupo "Gestión de mesas" a `personalizado.groups` en `lib/marketing-content.ts`, antes de "Asistente con IA"; actualizar `basico.notIncluded`. Prueba manual: la tarjeta Personalizado de `Packages.tsx` muestra el nuevo bullet con el pill "Nuevo" y el recuadro resaltado; la tarjeta Básico menciona la exclusión.
6. **FAQ de Mesas.** Agregar las dos preguntas nuevas (grupo "Gestión de mesas") a `FAQ_ITEMS` en `lib/marketing-content.ts`. Prueba manual: la landing muestra solo la pregunta con `onLanding: true`; `/preguntas-frecuentes` muestra ambas, agrupadas bajo "Gestión de mesas".
7. **Cards de "Todo lo que incluye tu invitación".** En `components/landing/Features.tsx`, agregar las 2 cards nuevas al inicio del array `features` (variantes `dark` y `accent`), bajar las 6 existentes a `default`, y cambiar el grid a `md:grid-cols-4`. Prueba manual: la sección muestra 8 cards en 2 filas parejas de 4 en desktop, con las 2 nuevas visualmente destacadas; en móvil siguen apilándose en una columna.
8. **QA final y regresión.** `npm run build` sin errores nuevos; recorrer la landing completa en 1440px, 768px y 390px verificando: el toggle Plano/Cuadrícula, el arrastre de los 6 elementos (mouse y touch emulado) sin que ninguno salga del contenedor, el botón "Restablecer", las 8 cards de Features, el bullet "Nuevo" de Packages, y las 2 preguntas nuevas de FAQ en sus filtros correctos.

## Criterios de aceptación

- [ ] `MesasSection.tsx` existe y se renderiza en `/` entre la sección de capturas del admin y la sección de IA, con el eyebrow, H2, subtexto y CTA de la Propuesta C.
- [ ] El toggle del mock-up arranca mostrando la vista Plano; al hacer clic en "Cuadrícula" cambia a esa vista, y viceversa.
- [ ] En la vista Plano, las 4 mesas, la Pista de baile y el Escenario se pueden arrastrar con mouse; en un emulador táctil, también con touch.
- [ ] Ningún elemento arrastrable puede salir del rectángulo punteado de la demo, en ninguna dirección.
- [ ] No existe ninguna forma de agregar, quitar o editar mesas/objetos en el demo — solo moverlos.
- [ ] El botón "Restablecer" regresa los 6 elementos exactamente a su posición inicial sin recargar la página.
- [ ] La vista Cuadrícula muestra las mismas 4 mesas (mismos 4 estados de ocupación) que la vista Plano.
- [ ] El botón de WhatsApp de `MesasSection` y el link a `#paquetes` funcionan; `section_viewed` (`section: 'mesas'`) y `cta_click` (`location: 'mesas'`) se disparan solos, sin cambios en `lib/analytics/events.ts`.
- [ ] La tarjeta "Paquete Personalizado" de `Packages.tsx` muestra el bullet "Gestión de mesas" con el pill "Nuevo", en el mismo estilo que "Asistente con IA".
- [ ] El texto de "no incluye" de la tarjeta "Paquete Básico" menciona explícitamente que la gestión de mesas no está incluida.
- [ ] La landing muestra la pregunta "¿La gestión de mesas viene en el Paquete Básico?"; `/preguntas-frecuentes` muestra esa pregunta y además "¿Qué es la gestión de mesas?", ambas agrupadas bajo "Gestión de mesas".
- [ ] La sección "Todo lo que incluye tu invitación" muestra 8 cards en un grid de 4 columnas en desktop (2 filas parejas), con "Gestión de mesas" (oscura) y "Asistente con IA" (terracota) al inicio.
- [ ] En móvil (390px), las 8 cards de Features se apilan en una columna sin overflow horizontal.
- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.

## Decisiones tomadas y descartadas

- **Sí: Propuesta C como base** (títulos/subtítulos de B + mock-up interactivo de A, arrancando en Plano). Decisión explícita del usuario tras comparar las tres propuestas en el canvas de diseño.
- **Sí: el Plano del mock-up es genuinamente arrastrable** (no ilustrativo-estático como en el canvas inicial). Pedido explícito del usuario en esta sesión, para que el demo se sienta como una prueba real del producto.
- **Sí: `drag` + `dragConstraints` de framer-motion**, no lógica manual de pointer events. Ya es dependencia del proyecto (usada en `components/landing/ui.tsx`); resuelve el acotamiento y el soporte táctil sin código propio adicional.
- **No: sin pan/zoom del lienzo del demo.** Decisión explícita del usuario — el demo solo permite arrastrar los 6 elementos dentro de un área fija, no replica el Plano real de `reactflow` del admin.
- **Sí: reducir la Cuadrícula del mock-up a las mismas 4 mesas que el Plano.** Decisión explícita del usuario, para que ambas vistas representen la misma demo desde dos ángulos.
- **Sí: una mesa por cada estado de ocupación (vacía/con espacio/completa/excedida).** Decisión explícita del usuario — sigue demostrando los 4 colores de la leyenda con el mínimo de mesas posible.
- **Sí: botón "Restablecer".** Decisión explícita del usuario — bajo costo de implementación (solo reinicia estado local vía remount), evita que el demo quede desordenado durante la misma visita.
- **No: no se persisten las posiciones arrastradas** (ni en `localStorage` ni en Firestore). Decisión explícita del usuario — es un demo ilustrativo y efímero, no una herramienta real.
- **Sí: se quita el objeto "Barra" del mock-up y se reemplaza por "Escenario".** Pedido explícito del usuario; el demo ahora modela exactamente 4 mesas + Pista de baile + Escenario, sin "Barra".
- **Sí: Mesas se presenta como exclusiva del Paquete Personalizado** en la sección nueva, en Packages, en las FAQ y en las cards de Features — mismo tratamiento que ya recibe el Asistente con IA, aunque hoy no exista gating técnico real en el admin (ni para Mesas ni para IA); es, y sigue siendo, un acuerdo comercial gestionado manualmente.
- **Sí: se incluye el cambio de `Features.tsx` en esta misma spec** (en vez de una spec separada). Decisión explícita del usuario tras preguntarle si prefería separarlo.
- **Sí: el array `features` de `Features.tsx` se sigue editando localmente en ese archivo**, sin moverlo a `lib/marketing-content.ts` — es una decisión de alcance menor para no tocar la fuente centralizada de precios/paquetes por un cambio que no la necesita.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Arrastrar con el dedo en móvil podría interferir con el scroll de la página si el gesto empieza sobre un elemento arrastrable. | `framer-motion` ya maneja el `touch-action` de los elementos con `drag` internamente; se verifica explícitamente en el paso de QA final con un emulador táctil. |
| El botón "Restablecer" vía remount (cambiar `key`) hace que los elementos reaparezcan sin una transición de entrada suave. | Es un demo educativo de marketing, no un componente de producto — una reaparición instantánea sin animación es aceptable y no afecta la funcionalidad. |
| Si `dragConstraints` mide el contenedor antes de que las fuentes de Google Fonts terminen de cargar, el área acotada podría calcularse con un tamaño distinto al final. | El contenedor tiene una altura mínima fija (`min-height`) independiente de las fuentes, y `framer-motion` recalcula `dragConstraints` en cada arrastre nuevo, no solo al montar. |
| Ampliar el grid de Features a 4 columnas podría verse desbalanceado si en el futuro se agrega o quita una sola card (dejando un número impar). | Documentado aquí como una razón para, si se vuelve a tocar `features`, mantener el total en un múltiplo de 4 en desktop o volver a 3 columnas — no requiere ninguna acción ahora porque el total queda en 8. |

## Lo que **no** está en este spec

- Gating técnico real en el admin para restringir el acceso a Mesas según el paquete de la boda.
- Pan o zoom del lienzo del demo, o cualquier otro comportamiento del Plano real de `reactflow` (minimapa, fitView, posiciones persistidas).
- Persistencia de las posiciones que el visitante mueve en el demo.
- Agregar, quitar o editar mesas/objetos dentro del demo de la landing.
- Cambios a `components/admin/tables/*` o al Plano/Cuadrícula reales del panel admin.
- Traducción de la landing a next-intl.
- Nuevos eventos de analítica.

Cada uno de estos, si se decide hacer, va en su propio spec.
