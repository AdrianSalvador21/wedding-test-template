# 13 — Rediseño visual de Mesas, navbar del admin y cards de estadísticas

**Estado:** Approved
**Depende de:** SPEC 04, SPEC 12
**Fecha:** 2026-09-27

## Objetivo

Aplicar a la Cuadrícula y el Plano de Mesas el sistema visual explorado en el canvas de diseño, consolidar la barra superior del admin en un solo menú de cuenta, y hacer que el sidebar "Sin colocar" del Plano siempre se muestre con una flecha para colapsarlo.

> **Diseño explorado (canvas validado con el usuario):** https://claude.ai/artifact/UujMJj9V49Vne1d8TX56bs — paleta monocromática ("Dashboard Neutral", sin serif ni acentos cálidos, misma línea que ya define `components/admin/ui.tsx`), cards de mesa con puntos de asiento en vez de barra de progreso, mesas del Plano simplificadas a forma + borde de color + fracción (sin anillo decorativo), cards de estadísticas compactas de una sola línea, y una propuesta de menú de cuenta (avatar + dropdown) para reemplazar el badge+correo+botón actuales de la barra superior.

## Contexto

Estado real del código, revisado en esta sesión (no asumido):

- `components/admin/ui.tsx` ya usa la paleta "Dashboard Neutral" (`A.ink`, `A.muted`, etc., ver spec 04) — este spec no cambia esos valores de color, solo el layout de los componentes que los consumen.
- `AdminStatCard` (mismo archivo, línea ~239) hoy es una tarjeta de dos filas (ícono+etiqueta arriba, número grande de 26-30px abajo) usada en `app/[locale]/admin/tables/[weddingId]/page.tsx` (4 cards) y `app/[locale]/admin/guests/[weddingId]/page.tsx` (5 cards, grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`). Al ser un componente compartido, redibujarlo una vez alcanza ambas páginas sin tocar sus grids.
- `components/admin/AccountControls.tsx` renderiza, en escritorio (`!compact`, montado dentro de `AdminPageNav` en un wrapper `hidden md:block`): un badge "Admin" + el correo (ambos solo visibles en `hidden lg:flex`, es decir desaparecen entre 768-1024px) y un botón "Cerrar sesión" siempre visible. Es exactamente la barra que se satura en pantallas ≥1024px. El mismo componente, en `compact` (usado dentro del menú hamburguesa móvil de `AdminPageNav`, línea ~93-104), ya muestra el correo apilado + botón de forma compacta — ahí no hay saturación.
- `AdminPageNav` (mismo archivo) se usa en 4 páginas: `app/[locale]/admin/tables/[weddingId]/page.tsx`, `app/[locale]/admin/guests/[weddingId]/page.tsx`, `app/[locale]/admin/wedding-editor/[weddingId]/page.tsx` y `app/[locale]/admin/page.tsx` ("Mis invitaciones"). Cambiar `AccountControls.tsx` alcanza las 4 automáticamente.
- `components/admin/tables/TableTile.tsx` muestra una barra de progreso (`div` con `width: ${barWidth}%`) para la ocupación. El diseño la reemplaza por una fila de puntos (uno por asiento).
- `components/admin/tables/occupancy.ts` ya centraliza `getOccupancyState`, `occupancyColor` y `occupancyLabel` — es el lugar natural para agregar el cálculo de los puntos, sin duplicar lógica de estado.
- `components/admin/tables/PlanoCanvas.tsx` (línea 291-324) renderiza el sidebar "Sin colocar" **solo si** `unplacedTables.length > 0 || unplacedFixtures.length > 0`. El usuario pidió que siempre se muestre (con un estado vacío) y que se pueda colapsar con una flecha animada. El archivo no importa `framer-motion` hoy, pero el proyecto ya lo usa (`components/admin/tables/TableDetailPanel.tsx`), así que no se agrega ninguna dependencia nueva.
- `components/admin/tables/nodes/TableNode.tsx` ya dibuja cada mesa como forma + borde de color por estado + fracción centrada (sin ningún anillo decorativo) — es prácticamente el diseño final validado; este spec solo ajusta detalles menores de trazo/radio si no calzan a simple vista con el canvas, y agrega la leyenda de color junto a los controles del lienzo.

## Alcance

**Incluye:**

- **`components/admin/ui.tsx` — `AdminStatCard` compacto:** una sola línea (ícono + etiqueta a la izquierda, valor a la derecha), sin cambiar los props (`icon`, `label`, `value`, `tone`) ni los datos que recibe de `tables/[weddingId]/page.tsx` ni de `guests/[weddingId]/page.tsx`.
- **`components/admin/AccountControls.tsx` — menú de cuenta:** en el modo `!compact` (escritorio), reemplazar el badge+correo+botón por un único control (avatar circular con la inicial del correo + flecha) que al hacer clic abre un menú con: correo completo, badge "Admin" (si `auth.isAdmin`), separador y "Cerrar sesión". Se cierra al hacer clic afuera o con Escape. El modo `compact` (menú hamburguesa móvil) **no se toca**.
- **`components/admin/tables/TableTile.tsx` — puntos de asiento:** reemplaza la barra de progreso por una fila de puntos (lleno = ocupado, contorno = libre), con tope de 12 puntos (ver Modelo de datos). Se agrega una insignia pequeña con la forma de la mesa (redonda/cuadrada/rectangular/imperial) junto al nombre.
- **`components/admin/tables/occupancy.ts`:** nueva función pura `getSeatDots` que calcula los puntos a dibujar (ver Modelo de datos), para no duplicar la regla del tope de 12 en `TableTile.tsx`.
- **`components/admin/tables/PlanoCanvas.tsx` — sidebar siempre visible y colapsable:** quitar la condición `length > 0` (el sidebar se monta siempre, con un mensaje de estado vacío si no hay mesas/objetos sin colocar); agregar un botón de flecha que colapsa/expande el sidebar con una transición animada (`framer-motion`, `animate` sobre `width`/`opacity`); arranca siempre expandido, sin persistir el estado.
- **`components/admin/tables/PlanoCanvas.tsx` — leyenda del lienzo:** una leyenda pequeña (Con espacio / Completa / Excedida) anclada al lienzo, junto a los controles de zoom.
- **Armonización visual menor** (radios, espaciados, sin cambios de campos ni de lógica) en `components/admin/tables/TableFormModal.tsx`, `components/admin/tables/FixtureFormModal.tsx` y `components/admin/tables/DeleteTableConfirmModal.tsx` para que combinen con el resto del rediseño.

**No incluye (queda para otra iteración):**

- `components/admin/tables/TableDetailPanel.tsx` (el drawer de asignar invitados) **no se modifica** — el usuario confirmó que "cards de detalle" se refería solo a `AdminStatCard`, no a las filas de invitado del panel (que en el canvas llevaban un círculo con iniciales). Ese drawer sigue exactamente igual.
- El menú de cuenta dentro del menú hamburguesa móvil (`compact`) no cambia — ahí no hay saturación (ya está colapsado hoy).
- Persistir el estado colapsado/expandido del sidebar "Sin colocar" (ni en localStorage ni en Firestore) — siempre abre expandido, mismo criterio que el spec 12 ya usó para no persistir el zoom del Plano.
- Nuevos eventos de analítica: ni el colapso del sidebar ni abrir/cerrar el menú de cuenta se instrumentan — son interacciones de UI, no acciones de negocio (mismo criterio de separación que ya usa el spec 11).
- Cualquier cambio a `admin/confirmations/[weddingId]/page.tsx` — no usa `AdminPageNav`, queda fuera igual que en el spec 04.
- Rotación, redimensionado del tope de 12 puntos, o cualquier otra regla de ocupación distinta a la ya definida en `occupancy.ts` (spec 12) — este spec solo cambia cómo se **dibuja** la ocupación, no cómo se **calcula**.

## Modelo de datos

Este spec no agrega ni cambia datos persistidos en Firestore. Introduce dos piezas de estado de cliente (no persistidas) y una función pura nueva:

```ts
// components/admin/tables/PlanoCanvas.tsx — estado local, no persistido
const [trayCollapsed, setTrayCollapsed] = useState(false); // siempre arranca expandido

// components/admin/AccountControls.tsx — estado local, no persistido
const [menuOpen, setMenuOpen] = useState(false);
```

```ts
// components/admin/tables/occupancy.ts — nueva función pura
export type SeatDot = 'filled' | 'empty';

export function getSeatDots(
  occupied: number,
  capacity: number
): { dots: SeatDot[]; overflowLabel: string | null } {
  const MAX_DOTS = 12;

  if (capacity <= MAX_DOTS) {
    // Un punto por asiento. Si hay excedente (occupied > capacity, spec 12),
    // los puntos existentes se pintan llenos y el excedente se indica aparte.
    const dots: SeatDot[] = Array.from({ length: capacity }, (_, i) => (i < occupied ? 'filled' : 'empty'));
    const overflow = occupied - capacity;
    return { dots, overflowLabel: overflow > 0 ? `+${overflow}` : null };
  }

  // Mesa con capacidad > 12: se dibujan 12 puntos proporcionales a la ocupación
  // y el resto de la capacidad (no dibujada) se indica con "+N".
  const filledCount = Math.round((Math.min(occupied, capacity) / capacity) * MAX_DOTS);
  const dots: SeatDot[] = Array.from({ length: MAX_DOTS }, (_, i) => (i < filledCount ? 'filled' : 'empty'));
  return { dots, overflowLabel: `+${capacity - MAX_DOTS}` };
}
```

Convenciones:

- El color de cada punto lleno sigue usando `occupancyColor[state].bar` (o `.text`, el que dé mejor contraste como relleno de un punto de 8-9px) para no introducir una segunda paleta de estado.
- `getSeatDots` no decide el estado (`empty`/`space`/`full`/`over`) — eso lo sigue haciendo `getOccupancyState`, ya existente. `getSeatDots` solo decide cuántos puntos dibujar y si hace falta un "+N".

## Plan de implementación

1. **`AdminStatCard` compacto.** Reescribir el JSX de `AdminStatCard` en `components/admin/ui.tsx` a una sola línea (ícono+etiqueta a la izquierda, valor a la derecha), sin tocar la firma de props. Prueba manual: abrir `/admin/tables/[weddingId]` y `/admin/guests/[weddingId]`, confirmar que ambas filas de estadísticas se ven compactas y con los mismos valores que antes.
2. **Menú de cuenta en `AccountControls.tsx`.** Reemplazar el bloque `!compact` (badge+correo+botón) por el control de avatar+flecha con dropdown (correo, badge "Admin" si aplica, separador, "Cerrar sesión"); manejar apertura/cierre con clic afuera y tecla Escape; dejar el bloque `compact` intacto. Prueba manual: en escritorio, abrir el menú en cada una de las 4 páginas que usan `AdminPageNav`, confirmar que muestra el correo y el badge correctos, que "Cerrar sesión" funciona, y que el menú hamburguesa móvil no cambió.
3. **Puntos de asiento en `TableTile.tsx`.** Agregar `getSeatDots` a `components/admin/tables/occupancy.ts`; usarla en `TableTile.tsx` para reemplazar la barra de progreso por la fila de puntos (+ "+N" cuando aplique) y agregar la insignia de forma junto al nombre. Prueba manual: una mesa de capacidad 8 muestra 8 puntos; una de capacidad 20 muestra 12 puntos + "+8"; una excedida (13/12) muestra 12 puntos llenos + "+1", todo con el color de estado correcto.
4. **Sidebar "Sin colocar" siempre visible y colapsable.** En `PlanoCanvas.tsx`, quitar la condición de longitud (el sidebar se monta siempre, con mensaje de estado vacío si ambas listas están vacías); agregar el botón de flecha y el estado `trayCollapsed`; animar el ancho/opacidad con `framer-motion`. Prueba manual: con una boda sin mesas ni objetos sin colocar, el sidebar igual aparece con el mensaje vacío; la flecha colapsa y expande con una transición visible, y arrastrar un ítem al lienzo sigue funcionando después de expandir de nuevo.
5. **Leyenda del Plano.** Agregar la leyenda de color (Con espacio/Completa/Excedida) junto a los controles de zoom del lienzo en `PlanoCanvas.tsx`. Prueba manual: los colores de la leyenda coinciden con los bordes reales de las mesas en cada estado.
6. **Armonización de modales.** Ajustar radios/espaciados en `TableFormModal.tsx`, `FixtureFormModal.tsx` y `DeleteTableConfirmModal.tsx` sin tocar campos, validación ni llamadas a los servicios. Prueba manual: crear, editar y borrar una mesa y un objeto de salón siguen funcionando exactamente igual que antes.
7. **QA final y regresión.** `npm run build` sin errores nuevos; recorrer Editor de invitación → Invitados → Mesas → "Mis invitaciones" confirmando el nuevo menú de cuenta en las 4; revisar Cuadrícula y Plano de Mesas en 1440px, 768px y 390px; confirmar que el menú hamburguesa móvil no cambió.

## Criterios de aceptación

- [ ] `AdminStatCard` se ve como una sola línea (ícono + etiqueta + valor) en Mesas (4 cards) y en Invitados (5 cards), con los mismos datos que antes.
- [ ] En escritorio (≥768px), la barra superior de Mesas, Invitados, Editor de invitación y "Mis invitaciones" muestra un único control de cuenta (avatar) en vez de badge+correo+botón sueltos.
- [ ] Al hacer clic en el avatar se abre un menú con el correo, el badge "Admin" (si aplica) y "Cerrar sesión"; un clic afuera o la tecla Escape lo cierra.
- [ ] "Cerrar sesión" desde el nuevo menú sigue cerrando la sesión correctamente.
- [ ] El menú hamburguesa móvil no cambió: sigue mostrando el correo y el botón de cerrar sesión igual que hoy.
- [ ] Las tarjetas de mesa en la Cuadrícula muestran puntos de asiento (llenos = ocupados) en vez de la barra de progreso anterior.
- [ ] Una mesa con capacidad ≤ 12 muestra un punto exacto por asiento; una con capacidad > 12, o una excedida, muestra 12 puntos y un "+N" con el resto, coloreados según su estado real.
- [ ] Cada tarjeta de mesa muestra una insignia pequeña con su forma (redonda/cuadrada/rectangular/imperial).
- [ ] El sidebar "Sin colocar" del Plano siempre se muestra, incluso sin mesas ni objetos pendientes (con un mensaje de estado vacío).
- [ ] La flecha del sidebar lo colapsa/expande con una transición animada; el estado no se guarda entre recargas (siempre abre expandido).
- [ ] El Plano muestra una leyenda de color (Con espacio/Completa/Excedida) junto a los controles de zoom, y sus colores coinciden con los de las mesas reales.
- [ ] Crear, editar y borrar una mesa u objeto de salón sigue funcionando igual que antes (solo cambió el estilo de los modales).
- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.

## Decisiones tomadas y descartadas

- **Sí: "cards de detalle" = solo `AdminStatCard`.** Decisión explícita del usuario tras aclarar la ambigüedad; las filas de invitado del panel de asignación (`TableDetailPanel.tsx`), que en el canvas llevaban un círculo con iniciales, quedan fuera de este spec.
- **Sí: el menú de cuenta se cambia en el componente compartido `AccountControls.tsx`, alcanzando las 4 páginas del admin de una sola vez.** Decisión explícita del usuario; mismo criterio de "un componente compartido, un solo lugar" que ya siguió el spec 04.
- **No: no se toca el modo `compact` de `AccountControls.tsx` (menú hamburguesa móvil).** Ahí no hay saturación — ya muestra el correo y el botón de forma compacta hoy. Queda anotado como una asunción de esta sesión, reversible si el usuario pide lo contrario más adelante.
- **Sí: `framer-motion` para animar el colapso del sidebar "Sin colocar".** Ya es dependencia del proyecto (`TableDetailPanel.tsx` la usa); evita agregar una librería nueva solo para esta animación.
- **No: no se persiste el estado colapsado/expandido del sidebar.** Decisión explícita del usuario; mismo criterio que el spec 12 ya usó para no persistir el zoom/scroll del Plano.
- **Sí: tope de 12 puntos + "+N" para capacidad grande (o mesa excedida).** Decisión explícita del usuario, evita mezclar dos estilos visuales (puntos y barra) según el tamaño de la mesa.
- **No: no se agregan eventos nuevos de analítica** para el colapso del sidebar ni para abrir/cerrar el menú de cuenta — son interacciones de UI, no acciones de negocio medibles (mismo criterio que ya distingue el spec 11).
- **No: no se modifica `TableDetailPanel.tsx`.** Sin los avatares de iniciales (fuera de alcance), no queda ningún otro cambio visual pendiente ahí — ya usa la paleta neutra vigente.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Animar el ancho del sidebar "Sin colocar" puede desalinear momentáneamente el zoom/`fitView` del lienzo de `reactflow` si el contenedor se redimensiona a mitad de la transición. | La animación solo cambia el ancho del panel lateral, no dispara `fitView` de nuevo; si se nota un salto visual, disparar `reactFlow.fitView()` al terminar la transición (`onAnimationComplete` de `framer-motion`). |
| El detector de "clic afuera" del nuevo menú de cuenta podría chocar con la lógica del menú hamburguesa móvil si comparten estado. | Cada uno maneja su propio estado local (`menuOpen` en `AccountControls` es interno y no se comparte con el `menuOpen` de `AdminPageNav`); no hay superposición real porque uno vive en la rama `!compact` y el otro en `compact`. |
| El tope de 12 puntos puede sentirse arbitrario si en el futuro aparecen mesas de capacidad muy chica pero con muchas mesas en pantalla (Cuadrícula con 100+ mesas, spec 12). | No afecta el rendimiento — `getSeatDots` es O(1) respecto al tope; si el número deja de sentirse bien, es un cambio de una sola constante en `occupancy.ts`. |

## Lo que **no** está en este spec

- Cambios a `components/admin/tables/TableDetailPanel.tsx` (el drawer de asignar invitados).
- Cambios al modo `compact` de `AccountControls.tsx` (menú hamburguesa móvil).
- Persistencia del estado colapsado/expandido del sidebar "Sin colocar".
- Nuevos eventos de analítica para el colapso del sidebar o el menú de cuenta.
- Cambios a `admin/confirmations/[weddingId]/page.tsx`.
- Cualquier cambio a cómo se **calcula** la ocupación de una mesa (`getOccupancyState`, spec 12) — este spec solo cambia cómo se **dibuja**.

Cada uno de estos, si se decide hacer, va en su propio spec.
