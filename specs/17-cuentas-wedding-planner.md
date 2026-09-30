# 17 — Atribución de bodas a cuentas de wedding planner

**Estado:** Approved
**Depende de:** SPEC 08, SPEC 16
**Fecha:** 2026-09-29

## Objetivo

Permitir que el equipo de Invyta atribuya cada boda a un wedding planner al crearla (con o sin los datos de la pareja todavía) o después, para que el planner vea y administre todas sus bodas desde una sola cuenta y el equipo pueda contar cuántas tiene atribuidas para confirmar su nivel de partner.

## Contexto

Ya se definió el modelo de precios wholesale para wedding planners (niveles Aliado / Partner / Partner Elite según volumen anual) y el material de partner para compartirles (conversación previa a este spec). Lo que faltaba era el lado operativo, y se investigó el código real (dos exploraciones de solo lectura) antes de diseñar este spec:

- **El vínculo cuenta↔boda ya es de muchos a muchos, no "una pareja = una cuenta".** Vive en `weddingOwners/{weddingId} = { emails: string[] }` (`app/api/admin/weddings/route.ts`), separado de `weddings/{id}` (que nunca guarda correo ni contraseña — spec 08). `POST /api/auth/link-weddings` ya recorre todas las `weddingOwners`, filtra las que incluyen el correo verificado de quien inicia sesión, y devuelve un **arreglo** de bodas — nunca asume una sola.
- **`app/[locale]/admin/page.tsx` ("Mis invitaciones") ya renderiza una grilla con todas las bodas de la cuenta** — es exactamente el patrón "el planner ve todas sus bodas en un login", construido en el spec 08 para el caso de una pareja con dos correos.
- **Editor, Invitados, Mesas y Confirmaciones ya se filtran por `weddingId` de la URL, nunca por el usuario de la sesión** (`services/guestService.ts`, `services/tableService.ts`, `services/rsvpService.ts`, `services/venueFixtureService.ts`). Funcionan igual sin importar cuántas bodas tenga la cuenta ni quién sea el dueño.
- **El vacío real es de atribución/identidad, no de arquitectura.** Nada distingue "este correo dueño es el wedding planner" de un segundo dueño cualquiera (una mamá, una dama de honor). El equipo no puede contar barato cuántas bodas tiene un planner, y la vista del planner es indistinguible de la de una pareja (le sale el CTA equivocado de "Crear otra boda gratis").
- **La creación de bodas con plantilla sigue siendo exclusiva del staff** (`requireAdmin` en `POST /api/admin/weddings`); confirmado explícitamente en esta sesión que eso no cambia. El único autoservicio de creación que existe hoy es el tier gratuito (`POST /api/weddings/free`, spec 16, tope de 3 por cuenta), sin relación con este flujo.
- **Caso real que motiva el alcance de este spec:** el staff quiere poder crear la boda de un cliente de un planner solo con el correo del planner —sin tener todavía los datos de la pareja— y que el planner (o el staff después) complete los nombres desde el Editor una vez que los tenga. Hoy `bride`, `groom`, `brideEmail` y `groomEmail` son obligatorios en `POST /api/admin/weddings`, lo cual bloquea ese flujo.
- **`MAX_OWNER_EMAILS = 6`** (`lib/admin-validation.ts`) es una constante preexistente del spec 08, sin relación con este spec: permite que el staff agregue contactos extra a una boda (un padre, una madrina). No se toca en este spec.

### Corrección encontrada al probar el flujo (enmienda a este spec)

Al probar con una cuenta que es dueña de una boda gratuita propia **y** planner de otra boda distinta, el botón "Crear otra boda gratis" desapareció también para su boda propia. Causa: `auth.isPlanner` es una bandera de **cuenta**, no de boda — con una sola boda donde el correo es `plannerEmail`, `isPlanner` queda en `true` para toda la cuenta, y como "Mis invitaciones" es una sola pantalla compartida, el botón se apaga en toda la vista.

Corregido: el botón ya **no** se oculta por `isPlanner`. Una cuenta puede ser planner de las bodas de sus clientes y, aparte, tener su propia boda gratuita — ambos roles conviven en la misma cuenta sin conflicto. `auth.isPlanner` se mantiene (útil para saber que la cuenta administra al menos una boda como planner), simplemente deja de usarse para condicionar este botón.

## Alcance

**Incluye:**

- Nuevo campo opcional `plannerEmail: string | null` en `weddings/{id}`.
- `POST /api/admin/weddings`: `bride`, `groom`, `brideEmail` y `groomEmail` pasan a ser opcionales de forma independiente (cada uno se puede omitir); se exige que exista al menos un correo válido entre `brideEmail`, `groomEmail` y el nuevo `plannerEmail` (opcional); si `plannerEmail` viene, se valida su formato y que no sea igual a `brideEmail` ni a `groomEmail`; todos los correos presentes se agregan a `weddingOwners/{id}.emails` en el mismo batch atómico que ya existe.
- El campo `weddingId` sigue siendo obligatorio y editable a mano por el staff; si no hay nombres de pareja para autosugerirlo, el staff lo escribe directamente (comportamiento ya existente de `slugifyWeddingNames`, que devuelve vacío de forma segura con ambos nombres en blanco).
- Pantalla de éxito de `NewWeddingModal`: cuando la boda se crea sin `bride`/`groom`, muestra un mensaje dirigido al planner en vez del mensaje actual "Hola {bride} y {groom}...".
- `GET /api/admin/weddings/[weddingId]`: agrega `plannerEmail` a la respuesta.
- `PATCH /api/admin/weddings/[weddingId]`: acepta `plannerEmail` opcional (string válido y distinto de los correos de la pareja, o `null` para quitarlo).
  - Al asignar uno nuevo: si no está ya en `weddingOwners/{id}.emails`, se agrega ahí también (rechazando con error claro si ya hay 6 correos y no cabe — mismo límite existente, sin cambiarlo).
  - Al quitarlo (`null`): se remueve ese mismo correo de `weddingOwners/{id}.emails`, revocando su acceso a esa boda.
- `components/admin/OperatorTools.tsx`:
  - `NewWeddingModal`: nuevo campo opcional "Correo del wedding planner"; `bride`/`groom`/`brideEmail`/`groomEmail` dejan de ser obligatorios en la validación del formulario (se sigue validando el formato cuando sí se llenan).
  - `SettingsModal`: mismo campo opcional, precargado desde el GET, enviado en el PATCH solo si cambió (incluyendo mandar `null` explícito para quitarlo).
- `POST /api/auth/link-weddings`: agrega `plannerEmail` a `FIELDS` y a `toWedding()`, visible tanto para admin como para el dueño no-admin (a diferencia de `ownerEmails`, que sigue siendo solo para admin).
- `lib/auth-context.tsx`: `LinkedWedding` gana `plannerEmail`; `AuthValue` gana `isPlanner` (correo de la cuenta coincide con el `plannerEmail` de alguna boda, y la cuenta no es admin).
- `app/[locale]/admin/page.tsx`: el buscador de operador (ya visible solo para admin) también compara contra `ownerEmails` y `plannerEmail`, para que el staff cuente las bodas de un planner escribiendo su correo. El botón "Crear otra boda gratis" **no** se oculta para cuentas de planner (ver corrección más abajo): una cuenta puede ser planner de las bodas de sus clientes y, aparte, tener su propia boda gratuita.

**No incluye (queda para otra iteración):**

- Rol "planner" real distinto de `isAdmin` — hoy `isAdmin` sigue siendo binario (ve todo) o no (ve solo lo propio); un planner es simplemente una cuenta normal cuyo correo aparece en varias `weddingOwners`/`plannerEmail`. Un rol con permisos propios solo hace falta si se construye autoservicio de creación, que tampoco está en este spec.
- Autoservicio de creación de bodas con plantilla para planners — confirmado explícitamente por el usuario: la creación sigue siendo exclusiva de `requireAdmin`. El único autoservicio existente (`POST /api/weddings/free`, tier gratuito, tope de 3) no cambia y no está pensado para este caso de negocio.
- Extender `OwnersModal` para marcar cuál de los correos ya listados es el del planner — decisión explícita del usuario: el flujo soportado es asignar `plannerEmail` desde `NewWeddingModal` (al crear) o `SettingsModal` (después). Una boda que ya tenía el correo del planner agregado a mano por `OwnersModal` antes de este spec se corrige re-ligándolo desde `SettingsModal`.
- Colección `planners/{email}` o cualquier portal propio para planners — con el volumen actual (negociado a mano, un puñado de partners) el conteo se resuelve con el buscador de operador extendido.
- Reglas de Firestore restrictivas por rol (spec 09, sigue pendiente) — `plannerEmail` queda con el mismo nivel de exposición que el resto de `weddings/{id}` hoy (`allow read/write: if true`).
- Eventos de analítica nuevos — es una acción interna de staff, no parte del embudo de conversión pública que instrumentan los specs 11 y 16.
- Autosugerencia de `weddingId` cuando no hay nombres de pareja — el staff lo escribe a mano en ese caso; el campo ya es editable.
- Cambiar el límite `MAX_OWNER_EMAILS = 6` — se mantiene igual, sin relación con este spec.

## Modelo de datos

```ts
// src/types/wedding.ts — extensión no rompiente del documento de boda
export interface WeddingData {
  // ...campos existentes sin cambios
  plannerEmail?: string | null; // NUEVO — correo del wedding planner atribuido a esta boda, si aplica
}
```

Convenciones:

- Ausente o `null` = boda sin planner atribuido (pareja normal); sin cambio de comportamiento respecto a hoy.
- Cuando `plannerEmail` existe, siempre debe estar también en `weddingOwners/{id}.emails` — las dos escrituras se mantienen sincronizadas por las rutas de servidor (creación y PATCH), nunca por el cliente directamente.
- `couple.bride.name`/`couple.bride.email` y sus equivalentes de `groom` pueden quedar en `''` (el valor por defecto de `createInitialWeddingData`) cuando la boda se crea solo con `plannerEmail`; el título mostrado en "Mis invitaciones" cae al `id` de la boda mientras tanto (comportamiento ya existente de `toWedding()`, sin cambios).

Contrato ampliado de creación:

```ts
// POST /api/admin/weddings
// Body: { bride?: string, groom?: string, brideEmail?: string, groomEmail?: string,
//          plannerEmail?: string, date: string, templateId: TemplateId, weddingId: string }
// Reglas nuevas:
//  - date, templateId, weddingId: igual que hoy, obligatorios.
//  - bride/groom (nombre) y brideEmail/groomEmail: cada uno opcional de forma independiente.
//  - Debe haber al menos un correo válido entre brideEmail, groomEmail y plannerEmail
//    (400 { error: 'invalid_input', field: 'owners' } si ninguno viene).
//  - Si plannerEmail viene: debe ser un correo válido (400 field: 'plannerEmail') y distinto
//    de brideEmail y de groomEmail (400 field: 'plannerEmail').
// weddingOwners/{id}.emails = todos los correos presentes (bride/groom/planner), sin duplicados.
```

Contrato ampliado de ajustes:

```ts
// GET /api/admin/weddings/[weddingId] → agrega plannerEmail: string | null a la respuesta.

// PATCH /api/admin/weddings/[weddingId]
// Body agrega: plannerEmail?: string | null
//  - string válido y distinto de los correos de bride/groom del documento: se guarda en
//    weddings/{id} y se agrega a weddingOwners/{id}.emails si no estaba
//    (400 { error: 'owners_limit' } si ya hay 6 correos y no cabe).
//  - null: se quita de weddings/{id} y también se remueve ese mismo correo de
//    weddingOwners/{id}.emails (revoca el acceso de esa boda para ese correo).
```

## Plan de implementación

1. **Campo `plannerEmail` en el tipo.** Agregar `plannerEmail?: string | null` a `WeddingData` en `src/types/wedding.ts`. Sin efecto visible. Prueba: `npm run build` compila.
2. **`POST /api/admin/weddings`: correos opcionales + `plannerEmail`.** Quitar la obligatoriedad individual de `bride`, `groom`, `brideEmail`, `groomEmail`; exigir al menos un correo válido entre `brideEmail`/`groomEmail`/`plannerEmail`; validar `plannerEmail` con `isValidEmail` y que sea distinto de los otros dos; incluirlo en `normalizeEmailList(..., 1, 3)`; asignar `couple.bride.name`/`groom.name` solo cuando vienen; guardar `wedding.plannerEmail`. Prueba manual: crear una boda con solo `plannerEmail` + fecha + plantilla + `weddingId` manual → se crea con `weddingOwners.emails = [plannerEmail]` y nombres de pareja vacíos; crear una boda normal (bride+groom, sin planner) sigue funcionando exactamente igual que hoy; crear una boda sin ningún correo es rechazada.
3. **`NewWeddingModal`: campo de planner + validación relajada + mensaje de éxito bifurcado.** Agregar el campo opcional "Correo del wedding planner"; quitar del formulario la obligatoriedad de nombre/correo de bride y groom (se conserva la validación de formato cuando sí se llenan); si `bride`/`groom` quedan vacíos, la pantalla de éxito muestra un mensaje dirigido al planner en vez de "Hola {bride} y {groom}...". Prueba manual: crear una boda solo-planner desde el modal y confirmar que la pantalla de éxito muestra el mensaje de planner.
4. **`GET`/`PATCH /api/admin/weddings/[weddingId]`: leer y escribir `plannerEmail`.** El `GET` agrega `plannerEmail` a la respuesta. El `PATCH` acepta `plannerEmail` (string válido y distinto de bride/groomEmail, o `null`): al asignar, agrega el correo a `weddingOwners/{id}.emails` si falta (rechaza si ya hay 6 y no cabe); al quitar (`null`), remueve ese mismo correo de `weddingOwners/{id}.emails`. Ambas ramas del PATCH (con y sin rename) llevan `plannerEmail`, igual que ya llevan `template`. Prueba manual: asignar un planner a una boda existente y confirmarlo en `weddingOwners`; quitarlo después y confirmar que desaparece de ahí también.
5. **`SettingsModal`: editar `plannerEmail` de una boda existente.** Campo "Correo del wedding planner", precargado del GET, enviado en el PATCH solo si cambió (incluye mandar `null` explícito para quitarlo). Prueba manual: agregar, cambiar y quitar el `plannerEmail` de una boda ya creada desde Ajustes.
6. **`link-weddings` expone `plannerEmail`.** Agregar `'plannerEmail'` a `FIELDS` y devolverlo en `toWedding()` para ambas ramas (admin y no-admin). Prueba manual: inspeccionar la respuesta JSON con una cuenta normal dueña de una boda con planner y confirmar que trae el campo.
7. **`isPlanner` en el contexto de auth.** `LinkedWedding` gana `plannerEmail`; `AuthValue` gana `isPlanner` (`!isAdmin && weddings.some(w => w.plannerEmail === email)`), calculado en `load()`. Prueba manual: iniciar sesión con el correo de un planner y confirmar `auth.isPlanner === true`.
8. **"Mis invitaciones": búsqueda por planner.** Extender `filtered` (ya solo visible para admin) para matchear también `ownerEmails` y `plannerEmail`. Prueba manual: como staff, buscar el correo del planner en "Mis invitaciones" devuelve sus bodas.
9. **QA de regresión.** `npm run build` sin errores nuevos; crear una boda normal (bride+groom, sin planner) y confirmar que no cambia nada; crear una boda solo-planner, iniciar sesión con ese correo, confirmar acceso a Editor/Invitados/Mesas igual que cualquier cuenta; completar los nombres de la pareja desde el Editor y confirmar que el título deja de mostrar el `id` y pasa a mostrar los nombres en "Mis invitaciones".

## Criterios de aceptación

- [ ] Crear una boda desde `NewWeddingModal` con solo correo de planner (sin bride/groom) genera `weddings/{id}` con `plannerEmail` guardado, nombres de pareja vacíos, y `weddingOwners/{id}.emails = [plannerEmail]`.
- [ ] Crear una boda normal (bride+groom, sin planner) funciona exactamente igual que antes de este spec.
- [ ] Intentar crear una boda sin ningún correo (ni bride, ni groom, ni planner) es rechazado con un error claro.
- [ ] Intentar asignar un `plannerEmail` igual al correo de la novia o el novio es rechazado, tanto en creación como en Ajustes.
- [ ] Iniciar sesión con el correo del planner muestra sus bodas en "Mis invitaciones", con `auth.isPlanner === true`. El botón "Crear otra boda gratis" se sigue mostrando (una cuenta de planner puede también tener su propia boda gratuita).
- [ ] El planner puede abrir Editor, Invitados y Mesas de cada una de sus bodas, y completar los nombres de la pareja desde el Editor; el título en "Mis invitaciones" pasa de mostrar el `id` a mostrar los nombres tras guardar.
- [ ] Desde Ajustes, asignar un `plannerEmail` a una boda ya existente lo agrega también a `weddingOwners`; quitarlo (dejarlo vacío) lo remueve de `weddingOwners`, y esa cuenta deja de ver esa boda en su próximo inicio de sesión.
- [ ] Si `weddingOwners` de una boda ya tiene 6 correos, intentar agregar un `plannerEmail` adicional es rechazado con un error claro, sin guardar nada a medias.
- [ ] El buscador de operador en "Mis invitaciones" encuentra las bodas de un planner escribiendo su correo.
- [ ] Una cuenta normal (pareja, sin planner) no ve ningún cambio: sigue el CTA de boda gratis, `isPlanner` es `false`.
- [ ] `POST /api/auth/link-weddings` incluye `plannerEmail` en cada boda de su respuesta, visible tanto para admin como para el dueño no-admin.
- [ ] `npm run build` no introduce errores de tipos nuevos.

## Decisiones tomadas y descartadas

- **Campo `plannerEmail` en `weddings/{id}`, no una colección `planners/{email}` aparte:** decisión de esta sesión. Con el volumen actual (negociado a mano) alcanza para contar y filtrar; una colección aparte es la iteración natural si se construye un portal self-serve.
- **Bride/groom (nombre y correo) pasan a ser opcionales de forma independiente, exigiendo al menos un correo entre bride/groom/planner:** decisión explícita del usuario. El caso real es que el staff cree la boda con solo el correo del planner, sin esperar los datos de la pareja, y que se completen después desde el Editor.
- **`weddingId` se sigue escribiendo a mano cuando no hay nombres para autosugerir:** decisión de esta sesión, sin cambio de código — el campo ya es editable manualmente y `slugifyWeddingNames('', '')` ya devuelve vacío de forma segura.
- **Quitar `plannerEmail` también revoca el acceso (se remueve de `weddingOwners`):** decisión explícita del usuario. "Destaggear" a un planner significa que deja de administrar esa boda, no solo que deja de contar para su volumen.
- **`plannerEmail` no puede coincidir con `brideEmail`/`groomEmail`:** decisión explícita del usuario. Evita una auto-atribución sin sentido con una validación barata, igual que las demás validaciones de este formulario.
- **El límite de 6 correos por boda (`MAX_OWNER_EMAILS`) no cambia:** aclarado en esta sesión — es una constante preexistente del spec 08, sin relación con este spec (permite que el staff agregue contactos extra como un padre o una madrina). Si agregar un planner lo excede (caso raro, ya que bride+groom+planner son solo 3), se rechaza con el mismo patrón de error que ya existe para ese límite.
- **No se extiende `OwnersModal` para marcar cuál correo ya listado es el planner:** decisión explícita del usuario, derivada de que el flujo real es asignar el planner desde `NewWeddingModal` al crear. Una boda que ya tenía el correo del planner agregado a mano por `OwnersModal` antes de este spec se corrige re-ligándolo desde `SettingsModal`.
- **La creación de bodas con plantilla se mantiene exclusiva del staff (`requireAdmin`):** confirmado explícitamente por el usuario en esta sesión. Ni una pareja ni un planner tienen, en este spec, ningún botón ni ruta para crear una boda con plantilla.
- **Sin evento de analítica nuevo:** decisión de esta sesión. Es una acción interna del staff (crear/etiquetar), no parte del embudo de conversión pública que instrumentan los specs 11 y 16.
- **Revertido tras probar el flujo — el botón "Crear otra boda gratis" no se oculta por `isPlanner`:** decisión explícita del usuario, corrigiendo la decisión original de este spec. Una cuenta puede ser planner de las bodas de sus clientes y, aparte, tener su propia boda gratuita; ocultar el botón para toda cuenta marcada como planner bloqueaba ese caso legítimo. `auth.isPlanner` sigue existiendo como dato de la cuenta, solo deja de condicionar este botón.
- **Mensaje de éxito de `NewWeddingModal` se bifurca cuando no hay pareja:** decisión de esta sesión, para no mostrarle al staff un mensaje de WhatsApp "Hola {bride} y {groom}..." con nombres vacíos cuando la boda se creó solo con el correo del planner.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El staff usa `OwnersModal` (en vez de los modales nuevos) para agregar el correo de un planner, dejando `plannerEmail` sin llenar y rompiendo el conteo en silencio | Aceptado como proceso, no como código: el staff usa siempre `NewWeddingModal`/`SettingsModal` para planners; si ocurre, se corrige re-ligando desde `SettingsModal`, que sincroniza ambos campos |
| Una boda queda con `plannerEmail` pero sin nombres de pareja por mucho tiempo, mostrando el `id` como título en "Mis invitaciones" | Aceptado; mismo criterio de degradación ya usado en `toWedding()`. El planner o el staff completa los nombres desde el Editor cuando tenga la información |
| Quitar `plannerEmail` revoca acceso incluso si esa boda era la única forma en que el planner podía entrar a ayudar con esa pareja | Aceptado, es el comportamiento pedido explícitamente: "destaggear" es una acción deliberada del staff y reversible (se puede volver a asignar) |
| `firestore.rules` sigue en `allow read/write: if true`; nada nuevo impide que un cliente lea/escriba `plannerEmail` directo, fuera de las rutas de servidor | Riesgo preexistente desde el spec 08, pendiente del spec 09; no se agrava porque `plannerEmail` tiene la misma exposición que el resto de `weddings/{id}` hoy |

## Lo que **no** está en este spec

- Rol "planner" real distinto de `isAdmin`.
- Autoservicio de creación de bodas con plantilla para planners.
- Extender `OwnersModal` para marcar un correo existente como planner.
- Colección `planners/{email}` o portal propio para planners.
- Reglas de Firestore restrictivas por rol (spec 09).
- Eventos de analítica nuevos.
- Autosugerencia de `weddingId` cuando no hay nombres de pareja.
- Cambiar el límite `MAX_OWNER_EMAILS = 6`.

Cada uno de estos, si se decide hacer, va en su propio spec.
