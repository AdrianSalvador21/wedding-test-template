# 23 — Asientos individuales por invitado y acompañante en Mesas

**Estado:** Approved
**Depende de:** SPEC 12, SPEC 13
**Fecha:** 2026-10-02

## Objetivo

Permitir que cada invitado y cada uno de sus acompañantes se pueda sentar y mover de forma independiente entre mesas distintas, en vez de mover siempre el grupo completo de la invitación.

## Contexto

Estado real del código, revisado en esta sesión (no asumido):

- **Hoy una invitación con acompañantes es un solo registro con un contador, no entidades separadas.** `FirebaseGuest` (`src/types/wedding.ts`) tiene `guestCount: number` (estimado) y, si confirmó, `rsvpConfirmation.guestCount` (real); `getSeatedGuestCount(guest)` en `services/guestService.ts` ya resuelve cuál usar. También existe `rsvpConfirmation.plusOne?.name`, un campo singular opcional usado **solo** para mostrarlo en `admin/confirmations/[weddingId]/page.tsx` — no está conectado a mesas.
- **La asignación a mesas siempre mueve el grupo completo.** `FirebaseGuest.tableId` (spec 12) es un único valor por invitación; `TableDetailPanel.tsx` muestra una fila por invitación ("Adrian Test · 3") y `wouldFit` valida la capacidad contra el grupo completo, nunca por persona.
- **El Plano ya dibuja un ícono por persona, pero no los puede separar.** `components/admin/tables/seatLayout.ts` (`computePartyLayout`) genera N íconos alrededor de la mesa para una invitación de N personas, y `TableNode.tsx` los renderiza con `PersonIcon`. Sin embargo, arrastrar cualquiera de esos íconos reasigna **la invitación completa** a otra mesa (comentario explícito en `TableNode.tsx`), y los íconos no tienen nombre propio por persona (solo repiten `guestName`).
- **Nota de discrepancia:** varios comentarios en `seatLayout.ts`, `TableNode.tsx`, `TableDetailPanel.tsx` y `PlanoCanvas.tsx` atribuyen ese renderizado por persona a "spec 17", pero `specs/17-cuentas-wedding-planner.md` trata de un tema distinto (cuentas de wedding planner). Ese código fue construido bajo un documento de diseño que no llegó a `specs/`; se trata con cuidado en el plan de implementación porque puede no encajar 100% con lo descrito aquí.
- **Decisión previa que este spec reabre a propósito:** spec 12 dejó explícito "la unidad de asignación sigue siendo la invitación/grupo, no cada persona" como fuera de alcance. Este spec es una extensión real de ese alcance ya acordado, no una corrección de algo mal hecho.
- **Referencia visual:** la captura que motivó este spec es de **otro producto** (no existe hoy en este repo ningún "Llenar Mesa" ni entradas seleccionables por acompañante) — se usa como referencia de UX a replicar, no como código existente a modificar.

## Alcance

**Incluye:**

- Nueva colección Firestore `tableSeats` (`FirebaseTableSeat`): persiste la mesa de cada "sub-asiento" de una invitación (titular + cada acompañante), permitiendo que cada uno quede en una mesa distinta.
- Generación automática y perezosa (lazy) de sub-asientos a partir de `getSeatedGuestCount(guest)`, sin script de migración aparte: al acceder a un invitado sin sub-asientos creados, se generan todos de una vez.
- Migración transparente de invitados ya sentados con el modelo anterior: si `FirebaseGuest.tableId` ya tenía valor, sus sub-asientos nuevos arrancan todos en esa misma mesa.
- Nombres de sub-asiento derivados (no persistidos ni editables): el titular usa el nombre real de la invitación; el acompañante 1 usa `rsvpConfirmation.plusOne.name` si existe; cualquier otro usa "Acompañante de {Nombre} {N}".
- Reconciliación automática cuando baja el conteo de personas de una invitación (edición de `guestCount` o de `rsvpConfirmation.guestCount`): los sub-asientos sobrantes se desasignan de su mesa automáticamente.
- `TableDetailPanel.tsx`: las listas "En esta mesa"/"Sin mesa" pasan a listar sub-asientos individuales, agrupados visualmente bajo un encabezado por invitación (nombre + checkbox "seleccionar todos"), cada fila asignable por separado (botones +/× y arrastrar/soltar).
- Filtros y contadores del panel ("Sin asignar"/"Asignados"/"Todos") recalculados por persona, no por invitación.
- `components/admin/tables/occupancy.ts` (`getOccupancyState`, `getSeatDots`) y `TableTile.tsx`: cuentan sub-asientos ocupados por mesa, no invitaciones.
- `PlanoCanvas.tsx`/`TableNode.tsx`/`seatLayout.ts`: cada mesa dibuja únicamente los íconos de las personas cuyo sub-asiento apunta a ella; arrastrar un ícono individual reasigna solo esa persona.
- Regla de capacidad: 1 sub-asiento ocupado = 1 lugar de la mesa, sin importar de qué invitación venga ni si el resto de su grupo está en otra mesa.
- `firestore.rules`: bloque para `tableSeats` con el mismo patrón permisivo que `guests`/`tables` (`allow read/write: if true`).

**No incluye (queda para otra iteración):**

- RSVP o estado de confirmación individual por acompañante: cada sub-asiento sigue heredando el mismo estado (Confirmado/Pendiente/Declinado) de la invitación completa.
- Renombrar manualmente a un acompañante desde el panel de mesas: las etiquetas quedan fijas con el formato descrito arriba.
- El botón "Auto-completar mesa" de la referencia visual.
- Restricciones alimentarias por acompañante individual: siguen siendo un dato a nivel de invitación completa, heredado por todos sus sub-asientos.
- Reglas de Firestore restrictivas por rol para `tableSeats`.
- Cambios a los formularios RSVP públicos ni a `admin/confirmations/[weddingId]/page.tsx`.
- Reglas de "sentar juntos/separados" o auto-acomodo algorítmico.

## Modelo de datos

```ts
// src/types/wedding.ts — NUEVO
export interface FirebaseTableSeat {
  id: string;
  weddingId: string;
  guestId: string; // FirebaseGuest al que pertenece este sub-asiento
  seatIndex: number; // 0 = titular, 1..N-1 = acompañantes
  tableId?: string | null; // mesa asignada a ESTA persona; ausente o null = sin mesa
  createdAt: string;
  updatedAt: string;
}

// src/types/wedding.ts — FirebaseGuest.tableId queda deprecated
export interface FirebaseGuest {
  // ...campos existentes sin cambios
  tableId?: string | null; // DEPRECATED (spec 12) — solo se lee una vez, para migrar a FirebaseTableSeat (spec 23)
}
```

Convenciones:

- **Cantidad esperada de sub-asientos por invitado** = `getSeatedGuestCount(guest)` (`services/guestService.ts`, sin cambios).
- **Nombre a mostrar**, derivado en cada render, nunca persistido: `seatIndex === 0` → `guest.name`; `seatIndex === 1` y `guest.rsvpConfirmation?.plusOne?.name` existe → ese nombre; cualquier otro `seatIndex` → `` `Acompañante de ${guest.name} ${seatIndex}` ``.
- **Generación perezosa:** `getOrCreateGuestSeats(guest)` (nuevo `services/seatService.ts`) — si no existen documentos en `tableSeats` para ese `guestId`, crea exactamente `getSeatedGuestCount(guest)` sub-asientos; si `guest.tableId` tenía valor, todos arrancan con ese `tableId`, si no, arrancan sin mesa. Debe ser idempotente (verificar existencia antes de crear) para tolerar llamadas concurrentes desde dos pestañas.
- **Reconciliación:** `reconcileGuestSeats(guest)` — cuando el nuevo `getSeatedGuestCount(guest)` es menor que los sub-asientos persistidos, los de mayor `seatIndex` se liberan (`tableId: null`) y se eliminan.
- **Colección nueva en Firestore:** `tableSeats`, mismo criterio de nombrado en plural que `tables`/`guests`.

## Plan de implementación

1. **Tipos y colección base.** Agregar `FirebaseTableSeat` en `src/types/wedding.ts` y marcar `FirebaseGuest.tableId` como deprecated en un comentario. Sin efecto visible. Prueba: `npm run build` compila.
2. **Reglas de Firestore.** Agregar bloque `tableSeats` a `firestore.rules` (mismo patrón que `guests`). Prueba manual: revisión de sintaxis.
3. **Servicio de asientos.** Crear `services/seatService.ts` con `getGuestSeats(guestId)`, `getOrCreateGuestSeats(guest)` (lazy + migración desde `tableId`), `assignSeatToTable(seatId, tableId)` y `reconcileGuestSeats(guest)`. Sin efecto visible. Prueba manual: contra el proyecto de desarrollo, llamar `getOrCreateGuestSeats` sobre un invitado existente con `tableId` y confirmar en la consola de Firestore que se crean N documentos en `tableSeats` con ese mismo `tableId`.
4. **Helper de nombres.** Agregar `getSeatDisplayName(guest, seatIndex)`, función pura (en `seatService.ts`), que resuelve titular/`plusOne`/"Acompañante de X N". Sin efecto visible. Prueba manual: casos `seatIndex` 0, 1 con `plusOne.name`, 1 sin `plusOne.name`, y 2.
5. **Ocupación por persona (cálculo).** Actualizar `components/admin/tables/occupancy.ts` para que la ocupación de una mesa se calcule contando sub-asientos ocupados (nueva función `computeTableOccupancy(tableId, seats)`) en vez de invitaciones completas. Sin efecto visible todavía (nadie la llama aún). Prueba: `npm run build` compila.
6. **`TableTile` usa ocupación por persona.** Cargar `tableSeats` en `app/[locale]/admin/tables/[weddingId]/page.tsx` junto a `guests`/`tables`, y pasar el conteo por persona a `TableTile`. Prueba manual: con una invitación de prueba de 3 personas repartida manualmente entre dos mesas en Firestore, ambas tarjetas muestran su conteo real de personas, no 3 en cada una.
7. **`TableDetailPanel` — listar sub-asientos agrupados.** Reescribir las listas "En esta mesa"/"Sin mesa" para iterar sub-asientos (vía `getOrCreateGuestSeats` por cada invitación visible), agrupados bajo un encabezado por invitación (nombre + checkbox "todos") con una fila por sub-asiento. Prueba manual: abrir el panel de una invitación con 3 personas y ver el encabezado más las 3 filas.
8. **`TableDetailPanel` — asignar/mover por sub-asiento.** Los botones +/× y el arrastrar-soltar (`@dnd-kit`) pasan a operar sobre `assignSeatToTable(seatId, tableId)` en vez de `assignGuestToTable(guestId, tableId)`; el checkbox "todos" del encabezado asigna los N sub-asientos de una sola vez a la mesa abierta. Prueba manual: sentar al titular en Mesa 1 y a un acompañante en Mesa 2 por separado, recargar la página y confirmar que cada uno sigue en su mesa.
9. **Filtros por persona.** Actualizar los contadores y el filtrado "Sin asignar"/"Asignados"/"Todos" del panel para contar sub-asientos en vez de invitaciones. Prueba manual: con la invitación de 3 personas sentada parcialmente, "Sin asignar" muestra el conteo correcto de personas sueltas.
10. **Reconciliación al cambiar el conteo.** Llamar `reconcileGuestSeats(guest)` desde `guestService.updateGuest` cuando el conteo de personas baja. Prueba manual: reducir el `guestCount` de una invitación de 3 a 2 estando sus 3 sub-asientos sentados, y confirmar que el sub-asiento sobrante queda sin mesa y el contador de esa mesa baja.
11. **Plano — dibujar por sub-asiento.** Actualizar `seatLayout.ts`/`TableNode.tsx` para que cada mesa dibuje únicamente los íconos cuyo sub-asiento apunta a ella (usando `getSeatDisplayName` para el nombre), quitando el agrupamiento "todo el grupo junto" si existía. Prueba manual: la invitación repartida en dos mesas muestra un ícono en cada una, no ambos en la misma mesa.
12. **Plano — arrastrar un ícono reasigna solo esa persona.** Actualizar el handler de arrastre de íconos en `TableNode.tsx`/`PlanoCanvas.tsx` para llamar `assignSeatToTable(seatId, nuevaMesa)` en vez de mover al grupo completo. Prueba manual: arrastrar el ícono del acompañante 2 a otra mesa y confirmar que el titular y el acompañante 1 no se mueven.
13. **Migración al primer acceso.** Confirmar que al abrir `/admin/tables/[weddingId]` por primera vez tras el despliegue, cada invitado con `tableId` existente y sin sub-asientos genera sus N sub-asientos en esa misma mesa automáticamente. Prueba manual: con datos previos a este spec (invitado con `tableId`, sin `tableSeats`), abrir la página y confirmar en Firestore que aparecen sus sub-asientos en la mesa correcta.
14. **QA final y regresión.** `npm run build` sin errores nuevos; recorrer Cuadrícula y Plano con invitaciones de 1, 2 y 3+ personas, repartidas y juntas, confirmando conteos de ocupación consistentes entre ambas vistas.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos respecto al estado previo.
- [ ] Abrir el panel de una invitación con `guestCount` 3 muestra un encabezado con el nombre de la invitación y 3 filas individuales ("Titular", "Acompañante de X 1", "Acompañante de X 2", o el nombre real si `plusOne.name` existe).
- [ ] Sentar al titular en una mesa y a uno de sus acompañantes en otra mesa distinta persiste ambas asignaciones por separado; recargar la página mantiene a cada uno en su mesa.
- [ ] El checkbox "todos" del encabezado de una invitación asigna a los N sub-asientos de una sola vez a la mesa abierta.
- [ ] Los contadores "Sin asignar"/"Asignados"/"Todos" del panel reflejan personas individuales, no invitaciones.
- [ ] La ocupación de una mesa (puntos de `TableTile` y color de estado) cuenta sub-asientos ocupados, no invitaciones completas.
- [ ] El Plano dibuja, para cada mesa, solo los íconos de las personas cuyo sub-asiento apunta a ella; una invitación repartida en dos mesas muestra sus íconos separados correctamente.
- [ ] Arrastrar un ícono individual en el Plano reasigna solo a esa persona, sin mover al resto de su grupo.
- [ ] Reducir el `guestCount`/`rsvpConfirmation.guestCount` de una invitación con sub-asientos ya sentados libera automáticamente al sub-asiento sobrante de su mesa.
- [ ] Un invitado existente antes de este spec (con `tableId` pero sin `tableSeats`) genera sus sub-asientos automáticamente en esa misma mesa la primera vez que se abre la página de Mesas, sin intervención manual.
- [ ] La capacidad de una mesa se valida contra el total de sub-asientos ocupados (de cualquier invitación), no contra el número de invitaciones.

## Decisiones tomadas y descartadas

- **Sí: sub-asientos persistidos en una colección nueva (`tableSeats`), no derivados solo en memoria.** Es la única forma de que cada acompañante quede en una mesa distinta de forma durable entre sesiones y recargas. Decisión explícita del usuario.
- **Sí: generación perezosa (lazy) al primer acceso, sin script de migración aparte.** Evita un paso de despliegue manual y mantiene la compatibilidad con los invitados que ya tenían `tableId` del modelo anterior (spec 12). Decisión explícita del usuario.
- **Sí: nombres de acompañante fijos ("Acompañante de {Nombre} {N}", usando `plusOne.name` para el primero si existe), no editables en esta versión.** Decisión explícita del usuario; renombrar manualmente queda como posible mejora de otro spec.
- **Sí: estado RSVP heredado de la invitación completa, no por persona.** Introducir confirmación individual exigiría rediseñar el flujo público de RSVP, fuera de alcance. Decisión explícita del usuario.
- **Sí: reducir el conteo de una invitación desasigna automáticamente al sub-asiento sobrante, sin alerta manual.** Evita que queden "fantasmas" ocupando capacidad en una mesa sin que el admin lo note. Decisión explícita del usuario.
- **Sí: restricciones alimentarias heredadas de la invitación completa.** Hoy no existe ese dato a nivel de persona individual; pedirlo ahora sería un cambio de RSVP, no de mesas. Decisión explícita del usuario.
- **No: botón "Auto-completar mesa" de la referencia visual.** Se descarta de este spec; queda documentado para una iteración futura si se pide. Decisión explícita del usuario.
- **No: reglas de Firestore restrictivas por rol para `tableSeats`.** Mismo criterio que specs 12/13 (`allow read/write: if true`); endurecer reglas es un cambio transversal, no de esta feature.
- **Se reabre, a propósito, la decisión de spec 12** ("la unidad de asignación sigue siendo la invitación/grupo, no cada persona"). Se documenta aquí como una extensión real de alcance ya acordada con el usuario, no como corrección de un error del spec 12.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El renderizado actual de íconos por persona en el Plano fue construido bajo un documento de diseño que referencia "spec 17" pero no corresponde a ningún spec real en el repo; puede no coincidir exactamente con lo descrito aquí. | Revisar `seatLayout.ts`/`TableNode.tsx` con cuidado en los pasos 11-12 antes de asumir su comportamiento actual; ajustar según lo que el código realmente hace, no según el comentario. |
| La migración lazy (`getOrCreateGuestSeats`) podría crear sub-asientos duplicados si dos pestañas/admins abren la misma boda al mismo tiempo antes de que termine la primera migración. | `getOrCreateGuestSeats` debe verificar existencia real en Firestore antes de crear, no solo contar en memoria, para ser idempotente ante llamadas concurrentes. |
| Con bodas grandes (100+ mesas, ya señalado en spec 12), `tableSeats` puede tener varias veces más documentos que `guests`, aumentando el costo de lectura de la página de Mesas. | Se acepta el mismo patrón sin paginar que ya usan specs 12/13; revisar si se vuelve un problema de rendimiento en una iteración futura. |

## Lo que **no** está en este spec

- RSVP o estado de confirmación individual por acompañante.
- Renombrar manualmente a un acompañante desde el panel de mesas.
- El botón "Auto-completar mesa".
- Restricciones alimentarias por acompañante individual.
- Reglas de Firestore restrictivas por rol para `tableSeats`.
- Cambios a los formularios RSVP públicos ni a `admin/confirmations/[weddingId]/page.tsx`.
- Reglas de "sentar juntos/separados" o auto-acomodo algorítmico.

Cada uno de estos, si se decide hacer, va en su propio spec.
