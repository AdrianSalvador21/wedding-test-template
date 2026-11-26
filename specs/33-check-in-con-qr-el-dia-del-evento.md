# 33 — Check-in con QR el día del evento: modo hostess, llegadas en vivo y respaldo sin internet

**Estado:** Approved
**Depende de:** SPEC 16 (bodas `free`), SPEC 23 (asientos individuales), SPEC 29 (patrón de rutas de servidor con `firebase-admin`), SPEC 32 (pase del día del evento y plano de solo lectura)
**Fecha:** 2026-11-26

## Objetivo

Agregar un check-in para la entrada del salón. Las hostess abren un link sin cuenta, buscan o escanean el QR de entrada del invitado y marcan la llegada de cada persona, aunque el salón no tenga señal. El planner ve las llegadas en vivo en una sección nueva del panel.

## Contexto

Es la segunda parte de "Día del evento + check-in" (sesión del 2026-11-26), después del spec 32. El usuario pidió hacerlo todo en un solo spec, planeado a fondo.

**Mercado (investigación del 2026-11-26).** El check-in con QR ya es común en México: LUSEKI (desde $699, sin internet), PartyPass (desde $399), Invítame ($1,299), Invitado MX y VOWS. Lo que nos diferencia:

- funciona sin internet;
- varias hostess trabajan a la vez;
- se cambia la mesa en vivo desde la entrada;
- se registran invitados que llegan sin invitación;
- hay lista impresa de respaldo;
- funciona en bodas gratis, que solo usan Invitados y Mesas.

**Estado real del código, revisado en esta sesión:**

- **Lecturas.** No hay lecturas en tiempo real (`onSnapshot`) ni persistencia sin conexión de Firestore (`lib/firebase.ts` usa `getFirestore` simple). Todo se lee una vez.
- **QR.** `qrcode` (^1.5.4) ya es dependencia y lo usa `components/admin/album/AlbumQrCard.tsx` con `import('qrcode')`. No hay lector de QR con cámara.
- **Rutas de servidor.** `lib/firebase-admin.ts` expone `getAdminDb()`. `lib/serverAuth.ts` tiene `requireWeddingAccess(request, weddingId)` (dueño u operador). El álbum (spec 29) ya usa rutas públicas `app/api/album/[weddingId]/...` y de panel `app/api/panel/album/[weddingId]/...` con `runtime = 'nodejs'`.
- **El documento `weddings/{id}` lo descarga completo el sitio público** (`src/services/weddingApi.ts`). Nada secreto puede vivir ahí.
- **Asientos.** `FirebaseTableSeat` (colección `tableSeats`) tiene `tableId` por persona (`seatIndex` 0 = titular). Se crean de forma perezosa en el cliente (`seatService.getOrCreateGuestSeats`). Una invitación sin asientos usa el `guest.tableId` del spec 12.
- **Invitados.** `guestService.generateGuestId(name, …)` arma el id de la URL (`nombre-sufijo`). `getSeatedGuestCount` y `resolveGuestAttendance` están en `services/guestService.ts`.
- **Actividad.** `activityLog` (`services/activityService.ts`) alimenta el Dashboard con tipos fijos (`ActivityType`).
- **Panel.** El sidebar vive en `components/admin/panel/ui.tsx` (`NAV_ITEMS`, `PanelSection`). La sección activa se deduce en `app/[locale]/admin/panel/[weddingId]/layout.tsx` (`sectionFromPathname`).
- **Rutas sin idioma.** Las rutas públicas sin prefijo de idioma se declaran en `NON_LOCALIZED_PATHS` (`lib/site.ts`), como `/album-de-fotos`.
- **El pase (spec 32).** Vive en `components/eventDay/EventDayPass.tsx`. El plano de solo lectura es `components/eventDay/EventDayFloorPlan.tsx`.
- **Reglas de Firestore.** Siguen abiertas (`allow read/write: if true`), pendiente del spec 09.

## Alcance

**Incluye:**

### A. Activación y link de hostess (panel)

- **Sección nueva "Check-in"** en el sidebar del panel (`/{locale}/admin/panel/{weddingId}/checkin`), entre Mesas y Fotos. Existe en bodas con diseño y en bodas gratis.
- **Interruptor "Activar check-in".** Se guarda al instante con una ruta de panel, no con "Guardar cambios", porque es operación y no contenido. La primera vez genera el código secreto del link.
- **Tarjeta "Link para hostess"** con:
  - el link `https://{dominio}/check-in/{código}`;
  - "Copiar link" y "Compartir por WhatsApp";
  - un QR del link, para que las hostess lo escaneen con su cámara;
  - "Abrir modo hostess";
  - "Generar link nuevo", con confirmación. El link anterior deja de funcionar de inmediato.
- **El link funciona siempre que el check-in esté activo,** también días antes, para probarlo, **hasta las 23:59 del día siguiente a la boda** (hora CDMX). Después muestra "El check-in de esta boda ya terminó" y el panel sigue mostrando los resultados. Al desactivarlo, muestra "El check-in de esta boda está desactivado".
- **"Generar link nuevo" advierte** que si alguna hostess tiene cambios sin enviar, esos cambios ya no se podrán enviar con el link anterior.

### B. Modo hostess (pantalla pública nueva)

- **Ruta `/check-in/[código]`,** sin prefijo de idioma, solo en español, `noindex`, con `referrer: no-referrer`. Usa el estilo del panel (Manrope, neutros), no el del diseño de la boda.
- **La tablet es la pantalla principal** (decisión del usuario: las recepciones casi siempre usan tablet).
  - **Horizontal (≥ 768 px):** la lista va a la izquierda (440 px) y la ficha o el escáner a la derecha, sin cambiar de pantalla.
  - **Vertical:** la ficha sube como hoja sobre la lista.
  - **Celular:** las pantallas de una sola columna del canvas.
- **La pantalla no se apaga** mientras el modo hostess está abierto (Screen Wake Lock, si el navegador lo permite).
- **"Cambiar hostess":** permite cambiar el nombre de la hostess en el mismo equipo.
- **Primera vez en cada celular:** "¿Cómo te llamas?". El nombre se recuerda en ese celular y se guarda con cada acción.
- **Pantalla principal:**
  - nombres de la pareja;
  - contador "142 de 310 confirmados · +4 sin confirmar" (esperadas = personas de invitaciones confirmadas; quienes llegan sin haber confirmado se cuentan aparte, para que no pase de 100 %);
  - estado de sincronización;
  - buscador;
  - botón "Escanear QR";
  - botón "Agregar invitado";
  - filtros "Todos / Faltan / Llegaron".
- **Lista:** todas las invitaciones, incluidas las declinadas, ordenadas por apellido (ver la regla en Modelo de datos). En "Faltan" van primero las confirmadas. Cada fila muestra nombre, personas llegadas de cuántas ("2 de 3") y la mesa o mesas. Las etiquetas son "No confirmó" (pendiente), "Declinó" y "Agregado en la entrada".
- **Buscador:** sin acentos ni mayúsculas, por cualquier palabra del nombre (nombre o apellido), y también por nombre de mesa.
- **Ficha del invitado** (al tocar una fila o escanear su QR):
  - nombre y etiquetas;
  - una fila por persona con su mesa y el botón "Llegó" o "Deshacer";
  - el botón "Llegaron todos";
  - el plano de solo lectura del spec 32 con sus mesas resaltadas;
  - el botón "Cambiar mesa" por persona.
- **Cambiar mesa:** lista de mesas con su ocupación ("Mesa 7 · 8/8, llena"). Si la mesa está llena, pide confirmación ("La Mesa 7 ya está llena. ¿Moverla de todos modos?") y lo permite. El cambio se guarda en `tableSeats`, así que se ve en Mesas.
- **Agregar invitado (llegó sin invitación):**
  - se capturan el nombre, las personas (1 a 10) y la mesa, que puede quedar sin mesa. El selector de mesa muestra la ocupación y pide la misma confirmación que "Cambiar mesa" si la mesa está llena;
  - se crea una invitación nueva confirmada, con la etiqueta "Agregado en la entrada" y todas sus personas marcadas como llegadas;
  - aparece en Invitados y en Mesas con esa etiqueta.
- **Una invitación declinada que llega** se marca sin cambiar su RSVP. Se ve como "Declinó · llegó".
- **Varias hostess a la vez** con el mismo link. Cada celular recibe los cambios de los demás en 10 segundos o menos.

### C. Escaneo del QR

- **Lector con cámara** dentro del modo hostess, con la librería `qr-scanner`, cargada solo al pulsar "Escanear QR".
- **El QR contiene el link personal del invitado** (`…/wedding/{weddingId}?guest={guestId}`). El lector extrae `weddingId` y `guest`.
- **Al leer un QR válido:**
  - **Invitación de 1 persona sin llegada:** se marca sola y se muestra "Llegada marcada" con nombre, mesa, hora y "Deshacer". Decisión del usuario.
  - **Invitación de varias personas:** abre su ficha para marcar a quienes llegaron.
  - **Si ya llegaron todas sus personas:** aviso ámbar "Este QR ya se usó", con quién la marcó y a qué hora, para detectar capturas compartidas. No marca nada.
- **Escaneo continuo en tablet:** tras cada lectura la cámara sigue activa y el resultado aparece a un lado, con la lista de los últimos escaneos de ese equipo.
- **Cámara frontal o trasera.** En tablet la frontal es la predeterminada (la tablet en su base y el invitado acerca su celular). En celular, la trasera. El equipo recuerda la elección.
  - Si el QR es de otra boda: "Este QR es de otra boda".
  - Si no se encuentra al invitado: "No encontramos esta invitación. Búscala por nombre".
- **Sin permiso de cámara o sin cámara:** se muestra "Busca por nombre" y el buscador sigue funcionando.

### D. QR de entrada del invitado (y cómo se combina con el spec 32)

El QR de entrada existe siempre que el check-in esté activo, con o sin "Día del evento". Solo aparece con link personal (`?guest=`), solo en la ventana del día de la boda (00:00 a 06:00 del día siguiente, hora CDMX) y no a invitaciones declinadas. Contiene el link personal, así que con la cámara normal solo abre su invitación.

| Caso | Día del evento | Check-in | Qué ve el invitado | Botón al cerrar |
| --- | --- | --- | --- | --- |
| 1 | Apagado | Apagado | Invitación normal, como hoy. | — |
| 2 | Encendido | Apagado | Pase del spec 32, sin QR. | "Mi mesa" |
| 3 | Encendido | Encendido | Pase con "Tu QR de entrada" debajo de "Tu mesa". | "Mi pase" (ícono de QR) |
| 4 | Apagado | Encendido | Invitación normal con su bienvenida, más el botón flotante "Mi QR de entrada", que abre una hoja con el QR. | — (el botón ya está) |
| 5 | Encendido, con mesa y plano apagados | Encendido | Pase con el QR como protagonista: saludo, QR, fotos y "Ver invitación". | "Mi pase" |

- **Botones flotantes.**
  - En los templates 01, 03 y 04, "Mi pase" o "Mi QR de entrada" va encima de "Comparte tus fotos", con el mismo apilado que "Mi mesa".
  - En Moderno va dentro de `StickyConfirmBarV2`, en el lugar de los nombres: "Mi pase · Mesa 7" o "Mi QR de entrada · Para la recepción".
- **Hoja "Tu QR de entrada" (caso 4).** Muestra el QR, el nombre y las personas, "Muéstralo en la recepción. Si no lo traes a la mano, te buscan por nombre" y "Cerrar". Usa el estilo de cada diseño, igual que el selector de calendario del spec 27.
- **Panel Check-in.** Una tarjeta explica dónde verá cada invitado su QR. Sin "Día del evento", dice que lo verán en un botón de su invitación y muestra "Ir a Día del evento". Con "Día del evento", dice que lo verán dentro de su pase.
- **Editor · "Día del evento".** En "Qué ve cada invitado en su pase" aparece la fila de solo lectura "QR de entrada · Por el check-in", con un link a Check-in. Con el check-in apagado, esa fila invita a activarlo.
- **Bodas gratis:** no tienen invitación, así que no hay pase ni QR. La hostess busca por nombre.

### E. Sin internet

- Al abrir, el modo hostess descarga la lista completa y la guarda en el celular.
- Si se cae la señal:
  - sigue buscando, mostrando fichas y marcando llegadas, cambios de mesa e invitados nuevos;
  - cada acción se guarda en una fila de pendientes en el celular;
  - el estado dice "Sin conexión · 3 cambios por enviar".
- Al volver la señal, los pendientes se envían solos, en orden. El estado vuelve a "Al día · actualizado hace 5 s".
- **Límite aceptado:** sin señal no se puede recargar ni abrir la página por primera vez, porque no hay service worker. La pantalla lo advierte: "Si no hay señal, no cierres ni recargues esta pestaña".
- **Invitado agregado sin señal:** su id se fija en el celular (`door_{opId}`). Las acciones que se hagan sobre él después (marcar, deshacer o mover) usan ese id y se envían en orden detrás de su alta.
- **Link rotado, desactivado o vencido con cambios pendientes:** los pendientes no se borran. La pantalla dice "N cambios no se pudieron enviar" y muestra a quiénes afectan, para que la hostess avise al planner.
- **Actualización sin gastar datos:** cada foto lleva una `version`. El celular la manda al pedir la siguiente, y si nada cambió el servidor responde `304` sin cuerpo. La lista completa solo se baja cuando hubo cambios. Así se evitan unos 36 MB por hora por equipo.

### F. Panel en vivo

La sección Check-in se actualiza cada 10 segundos y muestra:

- **Contadores:** personas que llegaron / esperadas, invitaciones completas, agregados en la entrada, y "Declinó · llegó".
- **Avance por mesa:** "Mesa 7 · 6 de 8 llegaron", con las mesas incompletas primero.
- **Pendientes:** confirmados que aún no llegan, con buscador.
- **Actividad:** las últimas 30 acciones ("Ana marcó la llegada de Carlos Hernández · 20:14", "Ana movió a Ana Ruiz a Mesa 9", "Luis agregó a Familia Pérez (4)").

### F2. Analítica y privacidad

- **`sanitizePath`** (`lib/analytics/scope.ts`) reemplaza `/check-in/{código}` por `/check-in/:code` antes de cualquier `page_view` o clic. El código nunca llega a Firebase Analytics.
- **Eventos nuevos** (sin datos personales):
  - `checkin_enabled` y `checkin_link_rotated`;
  - `hostess_opened`;
  - `checkin_scan`, con `result: ok | dupe | other_wedding | not_found`;
  - `checkin_arrive`, `checkin_walk_in` y `checkin_move`;
  - `checkin_offline_synced`, con el número de cambios enviados.

### G. Lista impresa de respaldo

- Botones "Imprimir por apellido" e "Imprimir por mesa" en la sección Check-in. Abren `/{locale}/admin/panel/{weddingId}/checkin/imprimir?orden=apellido|mesa`, una vista lista para imprimir o guardar como PDF.
- **Por apellido:** apellido y nombre, personas, mesa de cada persona y una casilla para marcar a mano.
- **Por mesa:** un bloque por mesa con sus personas y casillas, más un bloque "Sin mesa".
- Las dos vistas incluyen invitaciones declinadas y agregadas, con su etiqueta, y muestran la fecha y hora de impresión.

### H. Diseño

- **Canvas de diseño:** https://claude.ai/artifact/LsX2mwZckXyXXx8niHF9JJ (modo hostess, estados, sección Check-in en escritorio y celular, lista impresa y QR de entrada en el pase en los 4 diseños). **Ese canvas es la fuente de verdad visual y de copy.**

**No incluye (queda para otros specs):**

- **Service worker:** abrir o recargar el modo hostess sin señal.
- **Tiempo real con `onSnapshot`.** Se usa actualización cada 10 s.
- **Cuentas o roles de hostess,** y un link distinto por hostess.
- **Editar el nombre de un acompañante** desde la entrada.
- **Notificaciones** (WhatsApp, push) al planner o a la pareja cuando llega alguien.
- **Estadísticas después de la boda** (reporte de asistencia descargable).
- **Inglés en el modo hostess.**
- **Precio, paquetes y landing.**
- **Endurecer las reglas de Firestore** (spec 09).
- **El modo planner** (spec 34 en el roadmap).

## Modelo de datos

**`weddings/{id}`: campo nuevo, público y sin secretos:**

```ts
// Spec 33 — check-in el día del evento. Ausente = desactivado.
export interface CheckInConfig {
  enabled: boolean;
  enabledAt?: string; // ISO, primera activación
}
checkIn?: CheckInConfig;
```

**`checkInAccess/{weddingId}`: colección nueva, solo la leen y escriben rutas de servidor:**

```ts
interface CheckInAccess {
  weddingId: string;
  code: string;      // 32 bytes aleatorios en base64url (crypto.randomBytes). Va en el link.
  createdAt: string;
  rotatedAt?: string; // última vez que se generó un link nuevo
}
```

**`checkIns/{weddingId}__{guestDocId}__{seatIndex}`: colección nueva, una por persona:**

```ts
interface CheckInRecord {
  weddingId: string;
  guestDocId: string;  // id del documento en `guests`
  seatIndex: number;   // 0 = titular
  arrived: boolean;    // false = se deshizo
  arrivedAt?: string;  // ISO de la última vez que se marcó como llegada
  by: string;          // nombre de la hostess
  at: string;          // ISO de la acción (para "gana la más reciente")
  updatedAt: string;   // ISO del servidor
}
```

**`checkInActivity`: colección nueva, aparte de `activityLog` para no llenar el Dashboard:**

```ts
interface CheckInActivity {
  weddingId: string;
  type: 'arrived' | 'undone' | 'moved' | 'walk_in';
  by: string;
  guestName: string;  // nombre de la persona (titular o acompañante)
  detail?: string;    // "Mesa 9", "4 personas"
  at: string;
}
```

**`guests/{id}`: campo nuevo opcional para invitados agregados en la entrada:**

```ts
addedAtDoor?: { by: string; at: string }; // Spec 33 — "Agregado en la entrada"
```

Un invitado agregado se crea así:

- el id del documento es `door_{opId}`, para que un reintento no lo duplique;
- `rsvpStatus: 'confirmed'`, con `rsvpConfirmation: { attending: true, guestCount: n, submittedAt }`;
- `guestCount: n` y `plusOneAllowed: n > 1`;
- `language` es el `defaultLanguage` de la boda;
- `guestId` se genera con la misma regla que `generateGuestId`;
- se crean sus `n` asientos con la mesa elegida.

**Acciones de la hostess.** Son la misma forma en línea y sin conexión:

```ts
type CheckInOp =
  | { opId: string; type: 'arrive' | 'undo'; guestDocId: string; seatIndex: number; at: string; by: string }
  | { opId: string; type: 'move'; guestDocId: string; seatIndex: number; tableId: string | null; at: string; by: string }
  | { opId: string; type: 'walkIn'; name: string; count: number; tableId: string | null; at: string; by: string };
```

**Foto de la boda para la hostess** (`GET /api/check-in/{código}`). Solo trae lo necesario para recibir gente: sin teléfonos, correos, mensajes ni dietas.

```ts
interface CheckInSnapshot {
  wedding: { id: string; bride: string; groom: string; date: string | null; tier: 'free' | 'template' };
  tables: Pick<FirebaseTable, 'id' | 'name' | 'capacity' | 'shape' | 'posX' | 'posY'>[];
  fixtures: Pick<FirebaseVenueFixture, 'id' | 'type' | 'label' | 'posX' | 'posY' | 'width' | 'height'>[];
  guests: {
    docId: string;
    guestId: string;
    name: string;
    status: 'confirmed' | 'pending' | 'declined';
    count: number;                    // getSeatedGuestCount
    seats: (string | null)[];         // tableId por seatIndex (asientos o guest.tableId)
    plusOneName: string | null;
    addedAtDoor: boolean;
  }[];
  checkIns: Record<string, { arrived: boolean; at: string }>; // clave `${guestDocId}__${seatIndex}`
  serverTime: string;
  version: string; // hash de lo que contiene; con If-None-Match igual, la ruta responde 304
}
```

**Lo que se guarda en el celular de la hostess** (`localStorage`):

- `invyta-checkin-name`: el nombre de la hostess.
- `invyta-checkin-cache:{código}`: el último `CheckInSnapshot`.
- `invyta-checkin-queue:{código}`: `CheckInOp[]` pendientes de enviar.

**Reglas:**

- **Gana la acción más reciente.** El servidor solo aplica `arrive`, `undo` y `move` si su `at` es más nuevo que el `at` guardado. Un `at` del futuro se recorta a la hora del servidor.
- **`walkIn` es idempotente** por `opId`.
- **Personas esperadas:** la suma de `getSeatedGuestCount` de las invitaciones con `resolveGuestAttendance === 'confirmed'`.
- **Personas que llegaron:** todas las de `checkIns` con `arrived: true`, sin importar el estado de su RSVP.
- **Llegadas huérfanas:** se ignoran al armar la foto y los conteos las llegadas de invitaciones que ya no existen (borradas en el panel) y las de un `seatIndex` mayor o igual a sus personas actuales (si bajó de 3 a 2). Las colecciones nuevas no se agregan a `firestore.rules`, porque solo las usa el servidor con `firebase-admin`.
- **Actividad:** `checkInActivity` se consulta solo por `weddingId` y se ordena en el servidor, como `activityService`, para no necesitar un índice compuesto.
- **Vencimiento:** `findAccessByCode` rechaza con `check_in_ended` después de las 23:59 del día siguiente a `event.date` (hora CDMX). Sin `event.date`, no vence.
- **Orden por apellido:** se usa el nombre sin su primera palabra ("Carlos Hernández López" → "Hernández López"; "Familia Pérez" → "Pérez"). Si hay una sola palabra, se usa esa.

## Plan de implementación

Cada paso deja el proyecto compilando y lo existente funcionando igual.

1. **Tipos y lógica pura.**
   - Agregar `CheckInConfig` y `checkIn?` en `WeddingData`, `addedAtDoor?` en `FirebaseGuest`, y los tipos `CheckInRecord`, `CheckInActivity`, `CheckInOp` y `CheckInSnapshot` en `src/types/wedding.ts`.
   - Crear `lib/checkIn.ts` con funciones puras:
     - `checkInKey`;
     - `surnameSortKey`;
     - `normalizeSearch` y `matchesSearch` (sin acentos);
     - `applyOps(snapshot, ops)`, que devuelve la foto con los pendientes aplicados encima;
     - `parseGuestQr(text)` → `{ weddingId, guestId } | null`;
     - `countStats(snapshot)` → esperadas, llegaron, completas, agregadas y declinó-llegó.
   - Prueba: `npm run build` y un script `tsx` que revise `surnameSortKey`, `parseGuestQr` y `applyOps` con casos de ejemplo.
2. **Servidor: `lib/checkInServer.ts`.**
   - `findAccessByCode(code)`: consulta `checkInAccess` por `code` y verifica que `weddings/{id}.checkIn.enabled` sea verdadero.
   - `buildSnapshot(db, weddingId)`: lee invitados, asientos, mesas, objetos y `checkIns` en paralelo y devuelve `CheckInSnapshot`.
   - `applyOp(db, weddingId, op)`, con "gana la más reciente", y estas acciones:
     - `move` crea los asientos que falten con la misma lógica de `getOrCreateGuestSeats`, pero con `firebase-admin`;
     - `walkIn` crea el invitado, sus asientos y sus llegadas en un solo `batch`;
     - cada acción escribe su `checkInActivity`.
   - `createOrRotateCode(db, weddingId)`.
3. **Rutas del modo hostess.**
   - `GET /api/check-in/[code]` → `CheckInSnapshot`. Responde 404 `link_invalid` si el código no existe y 403 `check_in_disabled` si el check-in está apagado.
   - `POST /api/check-in/[code]/ops` con `{ ops: CheckInOp[] }` (máximo 200). Aplica en orden y devuelve los `opId` aplicados, los rechazados con su motivo y un `CheckInSnapshot` nuevo.
   - Las dos rutas usan `runtime = 'nodejs'` y `dynamic = 'force-dynamic'`.
   - `GET` acepta `If-None-Match` con la `version` y responde `304` si no cambió nada.
   - Prueba: con `curl` y un código real, la foto llega sin teléfonos ni correos. Mandar dos veces el mismo `walkIn` crea un solo invitado. Un segundo `GET` con la misma versión devuelve `304`.
4. **Rutas del panel.**
   - `GET /api/panel/check-in/[weddingId]` (`requireWeddingAccess`) → `{ enabled, link, stats, byTable, pending, activity }`.
   - `PATCH` con `{ enabled }` o `{ rotate: true }`. Al activar por primera vez crea el código. Al rotar reemplaza `code` y guarda `rotatedAt`.
5. **Sección Check-in del panel.**
   - Agregar `'checkin'` a `PanelSection`, a `NAV_ITEMS` (entre Mesas y Fotos, también en bodas gratis) y a `sectionFromPathname`.
   - Crear `app/[locale]/admin/panel/[weddingId]/checkin/page.tsx` con el interruptor, la tarjeta del link (copiar, WhatsApp, QR con `qrcode`, abrir, generar nuevo con confirmación), los contadores, el avance por mesa, los pendientes y la actividad.
   - Se actualiza cada 10 s mientras la pestaña está visible (`document.visibilityState`).
6. **Modo hostess: base.**
   - Agregar `/check-in` a `NON_LOCALIZED_PATHS`.
   - Crear `app/check-in/[code]/page.tsx` (`robots: noindex`) y `components/checkIn/HostessApp.tsx`, con:
     - la pregunta del nombre;
     - la carga de la foto y su caché;
     - el encabezado con contador y estado;
     - el buscador, los filtros y la lista;
     - la actualización cada 10 s.
   - Pantallas de link inválido, check-in desactivado y check-in terminado.
   - Diseño responsivo: celular de una columna y tablet a dos columnas (≥ 768 px) según el canvas, Screen Wake Lock y "Cambiar hostess".
   - Limpiar la ruta en `sanitizePath` y agregar los eventos de analítica.
7. **Ficha del invitado.**
   - `components/checkIn/GuestSheet.tsx`: personas con "Llegó" o "Deshacer", "Llegaron todos", etiquetas y el plano.
   - Reutiliza `EventDayFloorPlan` con un tema neutro nuevo, sin cambiar su comportamiento en el pase.
   - Cada acción se aplica en pantalla al instante y se envía con `POST …/ops`.
8. **Cambiar mesa y agregar invitado.**
   - `components/checkIn/MoveTableSheet.tsx`, con la ocupación y la confirmación si la mesa está llena.
   - `components/checkIn/WalkInSheet.tsx`, con nombre, personas (1–10) y mesa o "Sin mesa".
9. **Sin internet.**
   - Fila de pendientes en `localStorage`. Las acciones que fallan por red se quedan en la fila y se reintentan cada 10 s y al evento `online`.
   - La lista que se muestra es siempre `applyOps(fotoGuardada, pendientes)`.
   - Estados "Al día", "Enviando…" y "Sin conexión · N por enviar", más el aviso de no cerrar la pestaña.
   - Si el servidor rechaza una acción porque había una más reciente, se quita de la fila sin avisar. Si la rechaza porque el link fue revocado, se muestra la pantalla de link inválido.
10. **Lector de QR.**
    - Agregar la dependencia `qr-scanner`.
    - `components/checkIn/QrScannerSheet.tsx`, que se carga solo al usarlo. Aplica las reglas de la sección C: 1 persona se marca sola, varias abren la ficha y un QR ya usado muestra el aviso. Vibra si el equipo lo permite.
    - En tablet, escaneo continuo en el panel derecho con elección de cámara frontal o trasera.
    - Mensajes para QR de otra boda, invitación no encontrada y cámara no disponible.
11. **QR de entrada del invitado (casos 3, 4 y 5 de la sección D).**
    - `components/checkIn/EntryQr.tsx` dibuja el QR del link personal del invitado (`SITE.url`, idioma y `?guest=`) con `qrcode`.
    - En `EventDayPass.tsx`, si `wedding.checkIn?.enabled`, mostrar el bloque "Tu QR de entrada" debajo de "Tu mesa", en los 4 estilos según el canvas.
    - En `WeddingTemplate.tsx`, con el check-in activo, el link personal, la ventana y "Día del evento" apagado, mostrar el botón "Mi QR de entrada" (`EventDayReopenButton` o `StickyConfirmBarV2`) y la hoja `EntryQrSheet.tsx`.
    - "Mi mesa" pasa a "Mi pase" con ícono de QR cuando el pase lleva QR.
    - En el panel: la tarjeta de dónde se ve el QR (sección Check-in) y la fila "QR de entrada" en la pestaña "Día del evento".
    - Textos en `messages/*.json` bajo `eventDay.entryQr*` y `eventDay.myPass`.
12. **Etiqueta en Invitados y Mesas.** Mostrar "Agregado en la entrada" cuando `addedAtDoor` exista, en la lista de invitados (`components/admin/guests/`) y en Mesas (`PersonBadges.tsx`).
13. **Lista impresa.**
    - `app/[locale]/admin/panel/[weddingId]/checkin/imprimir/page.tsx`, con `?orden=apellido|mesa`, estilos `@media print` y un botón "Imprimir".

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos.
- [ ] Una boda sin el campo `checkIn` se ve exactamente igual que antes en el sitio, el pase y el panel, salvo la entrada "Check-in" del sidebar.
- [ ] El sidebar muestra "Check-in" entre Mesas y Fotos, en bodas con diseño y en bodas gratis.
- [ ] Activar el check-in en el panel crea el link y lo muestra con "Copiar link", "Compartir por WhatsApp", QR y "Abrir modo hostess".
- [ ] Ninguna lectura del documento `weddings/{id}` desde el sitio público contiene el código del link.
- [ ] Con el check-in activo, `/check-in/{código}` abre el modo hostess sin pedir cuenta, en cualquier fecha.
- [ ] Con el check-in desactivado, el mismo link muestra "El check-in de esta boda está desactivado".
- [ ] Después de "Generar link nuevo", el link anterior muestra la pantalla de link inválido y el nuevo funciona.
- [ ] La primera vez en un celular se pide el nombre de la hostess, y no se vuelve a pedir al recargar.
- [ ] La lista muestra todas las invitaciones, incluidas las declinadas, con las etiquetas "No confirmó", "Declinó" y "Agregado en la entrada" donde corresponda.
- [ ] Buscar "hernandez" encuentra a "Carlos Hernández", y buscar "mesa 7" encuentra a quienes están en la Mesa 7.
- [ ] La foto que recibe el modo hostess no incluye teléfonos, correos, mensajes ni restricciones de dieta.
- [ ] En la ficha, "Llegó" marca a una persona y el contador sube en 1. "Deshacer" la regresa.
- [ ] "Llegaron todos" marca a todas las personas de la invitación.
- [ ] Marcar la llegada de una invitación declinada no cambia su RSVP en Confirmaciones, y se ve como "Declinó · llegó".
- [ ] La ficha muestra el plano con las mesas de esa invitación resaltadas cuando están colocadas.
- [ ] "Cambiar mesa" a una mesa con lugar la cambia, y se ve en Mesas al recargar el panel.
- [ ] "Cambiar mesa" a una mesa llena pide confirmación y, al confirmar, la cambia.
- [ ] "Agregar invitado" crea una invitación confirmada con la etiqueta "Agregado en la entrada", con sus personas marcadas como llegadas, que aparece en Invitados y en Mesas.
- [ ] Con dos celulares en el mismo link, una llegada marcada en uno aparece en el otro en 10 segundos o menos.
- [ ] Un cambio de mesa hecho en Mesas aparece en el modo hostess en 10 segundos o menos.
- [ ] Con el modo avión activado, la hostess puede buscar, marcar llegadas, cambiar mesas y agregar invitados, y el estado dice "Sin conexión · N por enviar".
- [ ] Al quitar el modo avión, los pendientes se envían solos, aparecen en el panel y el estado vuelve a "Al día".
- [ ] Mandar dos veces la misma acción de "Agregar invitado" (reintento) crea una sola invitación.
- [ ] Si dos hostess marcan y deshacen a la misma persona, queda el estado de la acción más reciente.
- [ ] "Escanear QR" abre la cámara. Leer el QR de entrada de un invitado de esta boda abre su ficha.
- [ ] Leer un QR de otra boda muestra "Este QR es de otra boda".
- [ ] Negar el permiso de cámara muestra "Busca por nombre" y el buscador sigue funcionando.
- [ ] Con el check-in activo, el pase del día del evento muestra "Tu QR de entrada" en los 4 diseños, y escanearlo con la cámara normal abre la invitación de ese invitado.
- [ ] Con el check-in apagado, el pase no muestra ningún QR.
- [ ] Con el check-in activo y "Día del evento" apagado, el día de la boda el link personal muestra la invitación normal con su bienvenida y el botón "Mi QR de entrada", que abre la hoja con el QR en los 4 diseños.
- [ ] Con los dos activos, al cerrar el pase el botón dice "Mi pase". Con solo "Día del evento" activo, dice "Mi mesa".
- [ ] Con "Día del evento" activo, la mesa y el plano apagados y el check-in activo, el pase muestra el saludo, el QR, fotos y "Ver invitación".
- [ ] Fuera de la ventana del día de la boda, en el link general o en una invitación declinada, no aparece ningún QR ni el botón "Mi QR de entrada".
- [ ] La sección Check-in del panel muestra llegaron / esperadas, el avance por mesa, los pendientes y la actividad con el nombre de la hostess, y se actualiza sola cada 10 s.
- [ ] "Imprimir por apellido" e "Imprimir por mesa" abren vistas que se imprimen en hojas carta sin cortar filas, con casillas para marcar a mano.
- [ ] En una boda gratis, el check-in funciona por nombre y no hay QR en ningún lado.
- [ ] El Dashboard no muestra las acciones de check-in en su actividad.
- [ ] En una tablet horizontal, la lista y la ficha o el escáner se ven lado a lado. En vertical, la ficha sube como hoja.
- [ ] Escanear el QR de una invitación de 1 persona la marca sola y muestra "Deshacer". Escanear una de varias abre su ficha.
- [ ] Escanear el QR de una invitación que ya llegó completa muestra "Este QR ya se usó", con quién la marcó y a qué hora, y no marca nada.
- [ ] En tablet, después de un escaneo la cámara sigue activa, y se puede cambiar entre cámara frontal y trasera.
- [ ] A las 00:00 del segundo día después de la boda, el link de hostess muestra "El check-in de esta boda ya terminó" y el panel sigue mostrando los resultados.
- [ ] Ningún evento de Firebase Analytics contiene el código del link (la ruta llega como `/check-in/:code`).
- [ ] Sin cambios en 10 s, la ruta de la foto responde `304` y el celular no vuelve a descargar la lista.
- [ ] Después de "Generar link nuevo", un equipo con cambios pendientes muestra "N cambios no se pudieron enviar" con los nombres afectados.
- [ ] Borrar un invitado con llegadas marcadas no cambia los conteos de los demás, y sus llegadas desaparecen del panel.
- [ ] "Agregado en la entrada" se ve en Invitados y en Mesas.
- [ ] "Cambiar hostess" permite escribir otro nombre, y las siguientes llegadas quedan con ese nombre.

## Decisiones tomadas y descartadas

- **Sí: todo en un solo spec, planeado a fondo.** Decisión del usuario, para no dejar huecos entre las piezas. **No:** partir el modo sin internet y la lista impresa en otro spec.
- **Sí: link de hostess sin cuenta, con código secreto, revocable.** Decisión del usuario. **No:** pedir cuenta a cada hostess el día de la boda. **No:** que solo lo use quien administra la boda.
- **Sí: el código vive en `checkInAccess`, fuera de `weddings/{id}`.** El sitio público descarga ese documento completo, así que ahí cualquiera lo vería.
- **Sí: el modo hostess lee y escribe solo por rutas de servidor.** Así el código protege de verdad y la hostess no recibe datos personales. **No:** leer Firestore directo desde la pantalla de la hostess.
- **Sí: escanear QR y buscar por nombre.** Decisión del usuario. El buscador cubre a quien no trae su celular.
- **Sí: llegada por persona, con "Llegaron todos".** Decisión del usuario. Usa los asientos del spec 23.
- **Sí: sección nueva "Check-in" en el panel.** Decisión del usuario. Es operación en vivo, no contenido del Editor.
- **Sí: funciona sin internet mientras la pestaña siga abierta.** Decisión del usuario. **No:** service worker en este spec, porque cachear los archivos de Next sin una librería es frágil.
- **Sí: actualización cada 10 s.** Decisión del usuario. **No:** tiempo real con `onSnapshot`, porque exige abrir lecturas en Firestore o autenticar a la hostess.
- **Sí: el QR de entrada depende solo del check-in, no de "Día del evento".** Decisión del usuario al revisar el diseño. Con el pase va dentro de él. Sin el pase va en un botón flotante "Mi QR de entrada", como el de fotos, que abre una hoja. **No:** obligar a encender "Día del evento" para tener QR. **No:** un pase mínimo que aparezca aunque la pareja lo haya apagado.
- **Sí: "Mi pase" cuando el pase lleva QR y "Mi mesa" cuando no.** Decisión del usuario.
- **Sí: lista impresa por apellido y por mesa.** Decisión del usuario.
- **Sí: la lista incluye a todas las invitaciones, también las declinadas.** Decisión del usuario.
- **Sí: la hostess puede deshacer, ver mesa y plano, cambiar mesa y agregar invitados.** Decisión del usuario.
- **Sí: el link funciona siempre que el check-in esté activo.** Decisión del usuario, para poder probarlo antes.
- **Sí: también en bodas gratis, sin QR.** Decisión del usuario. Es un gancho para planners que solo usan Mesas.
- **Sí: una mesa llena se permite con aviso.** Decisión del usuario.
- **Sí: el invitado agregado lleva nombre, personas y mesa, entra confirmado y llegado.** Decisión del usuario.
- **Sí: la hostess escribe su nombre una vez por celular.** Decisión del usuario.
- **Sí: llegar no cambia el RSVP de quien declinó.** Decisión del usuario.
- **Sí: gana la acción más reciente, e invitado agregado idempotente por `opId`.** Es lo más simple que resuelve varias hostess y reintentos sin señal.
- **Sí: `checkInActivity` aparte de `activityLog`.** Una boda de 300 personas generaría cientos de entradas y taparía la actividad del Dashboard.
- **Sí: `qr-scanner` para la cámara.** `BarcodeDetector` no existe en Safari de iPhone. **No:** `html5-qrcode`, que pesa más y trae su propia interfaz.
- **Sí: el modo hostess solo en español y con el estilo del panel.** Lo usa el personal del evento, no los invitados.
- **Sí: la tablet es la pantalla principal, a dos columnas.** Decisión del usuario. Las recepciones casi siempre usan tablet.
- **Sí: escanear a 1 persona la marca sola, y a varias abre la ficha.** Decisión del usuario. Es rápido sin perder precisión.
- **Sí: aviso de QR ya usado.** Detecta capturas compartidas sin bloquear a nadie.
- **Sí: el link vence a las 23:59 del día siguiente a la boda.** Decisión del usuario. Así no queda una lista de invitados abierta para siempre.
- **Sí: versión y 304 en la foto.** Pedir la lista completa cada 10 s gastaría unos 36 MB por hora por equipo con mala señal.
- **Sí: limpiar `/check-in/{código}` en la analítica.** Sin eso, el código llegaría a Google en cada `page_view`.
- **Sí: "apellido" = el nombre sin su primera palabra.** El modelo solo tiene un campo `name`. Es una aproximación aceptada.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Las reglas de Firestore siguen abiertas, así que alguien con acceso directo podría leer `checkInAccess`. | Se acepta hasta el spec 09. El código nunca viaja en documentos que descarga el sitio público. |
| El link de hostess se reenvía a alguien que no debería tenerlo. | "Generar link nuevo" revoca el anterior al instante. Desactivar el check-in también lo apaga. |
| Relojes distintos entre celulares desordenan "gana la más reciente". | El servidor recorta los `at` del futuro a su propia hora. Los conflictos reales (dos hostess con la misma persona en el mismo minuto) son raros y se ven en la actividad. |
| La hostess recarga la página sin señal y pierde el modo. | Aviso visible de no recargar. Los pendientes se quedan en `localStorage` y se envían al volver a abrir con señal. |
| `localStorage` lleno o bloqueado (modo privado). | Se trabaja en memoria y se avisa: "Este navegador no guarda cambios sin conexión; mantén la señal". |
| La cámara no funciona fuera de HTTPS. | Producción usa HTTPS y `localhost` cuenta como seguro. En otro caso se muestra "Busca por nombre". |
| Bodas con más de 400 invitaciones hacen pesada la foto cada 10 s. | La foto solo trae campos mínimos (unos 100 KB con 400 invitaciones). Si crece, en otro spec se puede pedir solo lo que cambió desde `serverTime`. |
| Cambiar mesa desde la entrada choca con un cambio hecho en Mesas al mismo tiempo. | Gana el más reciente por `at`, y el modo hostess se actualiza en 10 s. |
| Quien tiene el link ve el `guestId` de cada invitación, y con él podría abrir su invitación personal. | Se acepta. Hace falta para reconocer el QR. El link vence después de la boda, se puede rotar y solo se comparte con el personal. |
| Un invitado agregado a mano en la entrada ensucia la lista de la pareja. | Lleva la etiqueta "Agregado en la entrada" en Invitados y Mesas, así que se puede revisar o borrar después. |

## Lo que **no** está en este spec

- Service worker para abrir o recargar sin señal.
- Tiempo real con `onSnapshot`.
- Cuentas de hostess y un link por hostess.
- Editar nombres de acompañantes desde la entrada.
- Notificaciones de llegada.
- Reporte de asistencia después de la boda.
- Inglés en el modo hostess.
- Precio, paquetes y landing.
- Reglas de Firestore.
- Modo planner.

Cada uno de estos, si se decide hacer, va en su propio spec.

## Siguientes pasos (roadmap)

1. **Diseño del spec 33.** Canvas del modo hostess, la sección Check-in, la lista impresa y el QR en el pase. Después, marcar este spec como Approved y correr `/spec-impl 33-check-in-con-qr-el-dia-del-evento`.
2. **Spec 34 — Modo planner.** Planeación al final, a partir de la investigación del 2026-11-26 (ver el roadmap del spec 32).
