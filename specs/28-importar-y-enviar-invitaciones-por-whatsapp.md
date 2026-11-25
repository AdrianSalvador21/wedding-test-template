# 28 — Importar invitados desde archivo y enviar su invitación por WhatsApp

**Estado:** Approved
**Depende de:** SPEC 11 (analytics), SPEC 16 (tier `free` / `template`), SPEC 21 (panel y `PanelDataContext`), SPEC 27 (modo "Aparta la fecha")
**Fecha:** 2026-11-24

## Objetivo

Que la pareja de una boda con diseño pueda importar su lista de invitados desde un archivo Excel o CSV y mandar a cada invitado, con un ícono de WhatsApp, un mensaje ya escrito con su link, editable antes de enviarlo.

## Contexto

### Mercado

Investigación hecha el 2026-11-24. Se revisaron Joy, Zola, RSVPify, The Knot, Bodas.com.mx, vowww, Konfirmo, Winvite, PartyPass y Wedvite.

- **Importación.**
  - Todos usan una fila por invitación o familia, con N pases.
  - Joy, Zola y RSVPify ofrecen una plantilla descargable y una vista previa con filas válidas, con aviso y con error.
  - RSVPify acepta CSV y XLSX y deja elegir qué columna es cada dato.
  - En México el teléfono es el dato clave.
- **WhatsApp sin la API oficial.**
  - El modelo de vowww abre el WhatsApp de la pareja con el mensaje escrito, y la pareja pulsa enviar desde su propio número.
  - El link es `https://wa.me/<número>?text=<texto>`. El número va en formato internacional, sin "+".
  - Sin número, `https://wa.me/?text=<texto>` abre WhatsApp para que la persona elija el contacto.
  - En México el formato es 52 + 10 dígitos. El "521" quedó obsoleto en 2019, aunque todavía funciona.
  - Conviene que el texto tenga menos de unos 1000 caracteres.

### Estado real del código (revisado en esta sesión)

- **Lista de invitados** (`app/[locale]/admin/panel/[weddingId]/guests/page.tsx`).
  - Se dan de alta uno por uno con un formulario: nombre, correo, teléfono, número de personas del 1 al 10, idioma y mensaje.
  - Las acciones por fila son editar, eliminar, copiar link (`handleCopyLink`, línea ~187) y cambiar el estado a mano (spec 16).
  - No hay importar ni WhatsApp.
- **El teléfono** (`FirebaseGuest.phone`) es texto libre y no se normaliza en ningún lado.
- **`guestService.createGuest`** (`services/guestService.ts`) hace `addDoc`, luego genera `guestId` con `slug(nombre)-<últimos 4 dígitos de Date.now()>` y registra `activityService.log('guest_added')`. Si se usara para importar en bloque, tendría dos problemas:
  - dejaría un registro de actividad por invitado;
  - podría repetir `guestId`.
- **El link del invitado** es `/{guest.language}/wedding/{weddingId}?guest={guestId}`. `WeddingTemplate` redirige al idioma del invitado.
- **`saveTheDate.enabled`** (spec 27) indica si el link muestra hoy el save the date.
- **Las bodas gratis** no tienen link público (`InvitationNotActivated`).
- **`guestService.updateGuest`** escribe con `updateDoc`. Un guardado del formulario manual no borra campos que no manda.

## Alcance

Todo este spec aplica **solo a bodas con `tier !== 'free'`**. En una boda gratis no aparece nada nuevo.

**Incluye:**

1. **Importar invitados.** Hay un botón "Importar" junto a "Nuevo invitado" que abre un modal de 3 pasos:
   1. **Cargar:** se sube un `.xlsx` o un `.csv`, y hay un link "Descargar plantilla".
   2. **Columnas:** se detectan por su encabezado. Si una no se reconoce, la pareja elige en un selector qué dato es o "No importar".
   3. **Vista previa:** cada fila aparece como "Lista", "Con aviso" u "Omitida", con su motivo. Luego se importa.

   Reglas de la importación:
   - Máximo 500 filas.
   - Las columnas son Nombre (obligatoria), Teléfono, Personas, Idioma, Correo y Mensaje personal.
   - Los duplicados se omiten.
   - Se registra una sola entrada en la actividad reciente.
2. **Plantilla descargable** `public/plantillas/invitados-invyta.xlsx`. Trae solo la fila de encabezados y una fila de ejemplo.
3. **Normalización de teléfonos** con `lib/phone.ts`. Se aplica al importar y al guardar el formulario manual.
4. **Ícono de WhatsApp por invitado**, junto al de copiar link. Al hacer clic se abre el modal "Enviar por WhatsApp", que tiene:
   - un selector **Invitación / Save the date**. Si el modo del spec 27 está activo, viene seleccionado "Save the date"; si no, "Invitación";
   - un cuadro de texto con el mensaje prearmado en el idioma del invitado, ya con su nombre y su link, que la pareja puede editar;
   - el destinatario. Si el invitado tiene un teléfono válido, hay dos opciones: "Enviar a {teléfono}" (seleccionada por defecto) y "Elegir el contacto en WhatsApp". Si no tiene, se ve "Sin teléfono: elegirás el contacto en WhatsApp";
   - "Restaurar mensaje por defecto";
   - los botones "Cancelar" y "Abrir WhatsApp".

   Al pulsar "Abrir WhatsApp" pasan dos cosas:
   - se abre `wa.me` con el número del invitado. Se abre sin número si no tiene uno válido o si se eligió "Elegir el contacto en WhatsApp";
   - si la pareja editó el texto, se guarda **solo para ese invitado y ese tipo de mensaje**. La próxima vez que abra el modal de ese invitado verá su texto editado.

**No incluye (queda para otros specs):**

- Pegar celdas desde Excel o Google Sheets.
- Plantilla en `.csv`.
- Actualizar invitados existentes desde una importación. Los duplicados solo se omiten.
- Seguimiento de envío: enviado, abierto, respondido, la columna "Envío", los filtros y el registro de aperturas.
- Recordatorios y mensaje de cierre.
- Fecha límite de RSVP.
- Cambios en Confirmaciones.
- Plantillas de mensaje para toda la boda, editables por la pareja.
- Elegir en el modal un idioma distinto al del invitado.
- Cola de envío o envío masivo.
- WhatsApp Business API.
- Exportar a Excel o CSV.
- Grupos o etiquetas.
- La ruta vieja `app/[locale]/admin/guests/[weddingId]`.
- Reglas de Firestore.
- Bodas gratis.

## Modelo de datos

### `FirebaseGuest` (`src/types/wedding.ts`), campo nuevo opcional

```ts
// Spec 28 — mensaje de WhatsApp editado por la pareja para este invitado.
// Ausente = se usa el mensaje por defecto. Se guarda ya con el nombre y el link escritos.
whatsappMessages?: {
  invitation?: string;
  saveTheDate?: string;
};
```

Cómo se guarda:

- Se escribe al pulsar "Abrir WhatsApp", con `updateDoc` en notación de punto (`whatsappMessages.invitation`).
  - Si el texto es igual al mensaje por defecto de ese momento, se borra la clave con `deleteField()` y no se guarda nada.
  - No pasa por `guestService.updateGuest`, para no registrar actividad ni reconciliar asientos.
- "Restaurar mensaje por defecto" solo cambia el cuadro de texto. Se guarda al abrir WhatsApp, con la regla anterior.
- El mensaje guardado no se recalcula si después cambian el nombre, el link o el idioma del invitado. "Restaurar" vuelve a generarlo.

### Teléfono

`phone` se guarda en formato E.164 con "+" (por ejemplo `+523312345678`). Los teléfonos que ya estaban guardados no se migran. Se normalizan al armar el link.

Reglas de `normalizePhone(raw): { value: string | null; valid: boolean }` en `lib/phone.ts`:

1. Se quitan los espacios, guiones, puntos y paréntesis. Se recuerda si había un "+" al inicio.
2. Sin "+":
   - 10 dígitos → `+52` + número.
   - 12 dígitos que empiezan con `52` → `+` + número.
   - 13 dígitos que empiezan con `521` → `+52` + los últimos 10.
3. Con "+":
   - `+521` y 10 dígitos → `+52` + los 10.
   - `+52` y 10 dígitos → se queda igual.
   - Otra lada con 8 a 15 dígitos en total → se respeta.
4. Cualquier otro caso → `{ value: null, valid: false }`.
5. Vacío → `{ value: null, valid: true }`, porque el teléfono es opcional.

### `lib/whatsapp.ts`

- `buildDefaultWhatsAppMessage(kind: 'invitation' | 'saveTheDate', guest, wedding): string` arma el texto en `guest.language`. Si la boda no tiene inglés, siempre arma el español.
- `buildWhatsAppUrl(phone, text)` devuelve `https://wa.me/<dígitos>?text=<encodeURIComponent(text)>`. Si no hay teléfono válido, devuelve `https://wa.me/?text=…`.

Mensajes por defecto. No mencionan a Invyta.

- **Invitación ES:** `¡Hola, {nombre}! 💌\nCon mucha ilusión queremos invitarte a nuestra boda el {fecha}.\nAquí está tu invitación con todos los detalles y para confirmar tu asistencia:\n{link}\nCon cariño, {novios}`
- **Invitación EN:** `Hi {nombre}! 💌\nWe would love for you to join us at our wedding on {fecha}.\nHere is your invitation with all the details and your RSVP:\n{link}\nWith love, {novios}`
- **Save the date ES:** `¡Hola, {nombre}! Aparta la fecha: nos casamos el {fecha}. 💍\nAgrégalo a tu calendario aquí:\n{link}\nPronto te llegará la invitación formal.\n{novios}`
- **Save the date EN:** `Hi {nombre}! Save the date: we're getting married on {fecha}. 💍\nAdd it to your calendar here:\n{link}\nFormal invitation to follow.\n{novios}`

Cómo se llenan los datos:

- `{nombre}` es `guest.name`.
- `{novios}` es "{novia} & {novio}".
- `{fecha}` es la fecha larga en el idioma del invitado ("14 de marzo de 2027" / "March 14, 2027").
- `{link}` es el mismo link que copia `handleCopyLink`.
- Si la boda no tiene `event.date`, la línea que contiene `{fecha}` se quita.

### Importación (`lib/guestImport.ts`)

Los encabezados se comparan en minúsculas, sin acentos y sin espacios al inicio ni al final.

| Campo | Encabezados reconocidos |
| --- | --- |
| `name` (obligatorio) | nombre, nombres, invitado, invitados, invitacion, familia, name, guest |
| `phone` | telefono, tel, celular, cel, whatsapp, movil, phone, mobile |
| `guestCount` | personas, pases, lugares, boletos, cantidad, adultos, guests, seats, party size |
| `language` | idioma, lengua, language, lang |
| `email` | correo, correo electronico, email, e-mail, mail |
| `coupleMessage` | mensaje, mensaje personal, nota, message, note |

Validación por fila:

| Caso | Resultado |
| --- | --- |
| Nombre vacío | **Omitida** · "Sin nombre" |
| Mismo teléfono normalizado que un invitado existente o que una fila anterior del archivo | **Omitida** · "Ya existe: {nombre}" |
| Sin teléfono, y el mismo nombre (sin acentos ni mayúsculas) que un invitado existente o que una fila anterior | **Omitida** · "Ya existe: {nombre}" |
| Teléfono no válido | **Con aviso** · "Teléfono no válido, se importa sin teléfono" |
| Personas vacío | Se usa 1, sin aviso |
| Personas no numérico o fuera de 1–10 | **Con aviso** · "Personas fuera de rango, se usa 1" |
| `selectedGuestTickets` activo y la columna Personas presente | **Con aviso** en el paso 2 · "El invitado elige cuántas personas; se ignora esta columna" |
| Idioma `es`, `español` o `spanish` | `es` |
| Idioma `en`, `ingles` o `english` | `en` |
| Idioma con otro valor, o una boda sin inglés | `es`, con aviso solo si la boda tiene inglés |
| Correo sin `@` | **Con aviso** · "Correo no válido, se importa sin correo" |
| Más de 500 filas | No se puede pasar al paso 3 · "Máximo 500 invitados por importación" |

**Plantilla.** `public/plantillas/invitados-invyta.xlsx` tiene una hoja "Invitados", con la columna Teléfono en formato de texto. Su contenido:

| Nombre | Teléfono | Personas | Idioma | Correo | Mensaje |
| --- | --- | --- | --- | --- | --- |
| Familia Hernández Ruiz | 33 1234 5678 | 4 | es | hernandez@correo.com | ¡Los esperamos! |

### `ActivityType` (`services/activityService.ts`)

Se agrega `'guests_imported'`, con el mensaje `"Se importaron {n} invitados"`. El número viaja en `guestName`.

### Eventos de analytics (`lib/analytics/events.ts`)

- `guests_imported: { rows: number }`
- `guest_whatsapp_opened: { kind: 'invitation' | 'saveTheDate'; edited: boolean }`

### Archivos nuevos

| Archivo | Contenido |
| --- | --- |
| `lib/phone.ts` | `normalizePhone` |
| `lib/whatsapp.ts` | `buildDefaultWhatsAppMessage`, `buildWhatsAppUrl` |
| `lib/guestImport.ts` | lectura del archivo, detección de columnas y validación de filas (funciones puras) |
| `components/admin/guests/ImportGuestsModal.tsx` | modal de importación de 3 pasos |
| `components/admin/guests/WhatsAppSendModal.tsx` | modal "Enviar por WhatsApp" |
| `public/plantillas/invitados-invyta.xlsx` | plantilla con encabezados y una fila de ejemplo |

## Plan de implementación

Cada paso deja el proyecto compilando y el panel actual funcionando igual.

1. **Tipos y utilidades puras.**
   - Agregar `whatsappMessages?` a `FirebaseGuest`.
   - Agregar `'guests_imported'` a `ActivityType` y los 2 eventos de analytics.
   - Crear `lib/phone.ts` y `lib/whatsapp.ts`.
   - Prueba: `npm run build` sin errores. En la consola del navegador, `normalizePhone` con `3312345678`, `+52 1 33 1234 5678`, `+1 415 555 0123` y `123` da los resultados de este spec.
2. **Normalizar el teléfono en el formulario manual.**
   - En `handleSubmit` de `guests/page.tsx`, pasar `phone` por `normalizePhone`.
   - Si no es válido, mostrar bajo el campo "Teléfono no válido. Usa 10 dígitos o el formato +lada" y no guardar.
   - Si está vacío, guardar sin teléfono.
   - Prueba: guardar `33 1234 5678` deja `+523312345678`, y `123` muestra el error.
3. **Modal "Enviar por WhatsApp".**
   - Crear `WhatsAppSendModal` y agregar el ícono de WhatsApp, con `aria-label="Enviar por WhatsApp"`, junto al de copiar link en la tabla de escritorio y en las tarjetas de móvil.
   - Al abrir, el selector toma "Save the date" si `saveTheDate?.enabled`, y si no, "Invitación". El cuadro de texto muestra `guest.whatsappMessages[kind]` si existe, y si no, el mensaje por defecto.
   - Cambiar el selector carga el texto de ese tipo: el guardado del invitado o el por defecto. Lo que se haya escrito en el otro tipo y todavía no se haya enviado se pierde, sin aviso.
   - El contador de caracteres avisa a partir de 1000.
   - El destinatario es un par de opciones (`role="radio"`) que solo aparece si el teléfono es válido. Siempre arranca en "Enviar a {teléfono}". La elección no se guarda y no cambia `guest.phone`.
   - "Abrir WhatsApp" hace tres cosas: abre `buildWhatsAppUrl` con `window.open(url, '_blank')`, guarda o borra `whatsappMessages[kind]` según la regla del modelo de datos y actualiza `setGuests`. Después cierra el modal.
   - Manda `track('guest_whatsapp_opened', { kind, edited })`.
   - Prueba:
     - Un invitado con teléfono abre `wa.me/52…` con el texto.
     - Uno sin teléfono abre `wa.me/?text=…`.
     - Si se edita, se envía y se vuelve a abrir el modal, aparece el texto editado.
     - Otro invitado sigue viendo el mensaje por defecto.
4. **Lectura y validación de la importación (sin interfaz).**
   - Agregar SheetJS desde su CDN oficial (`https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`) y cargarlo con `import()` dinámico solo dentro del modal.
   - Crear `lib/guestImport.ts` con tres funciones:
     - `parseFile(file)`, para `.xlsx` y `.csv`, leyendo el texto formateado de las celdas (`raw: false`);
     - `detectColumns(headers)`;
     - `validateRows(rows, mapping, existingGuests, wedding)`.
   - Prueba: `npm run build` sin errores. SheetJS queda en un chunk aparte y no en el bundle inicial de la Lista.
5. **Modal de importación, guardado en bloque y plantilla.**
   - Crear `ImportGuestsModal` con sus 3 pasos (Cargar, Columnas y Vista previa) y el botón "Importar" (secundario) junto a "Nuevo invitado".
   - Agregar `guestService.importGuests(weddingId, rows)`:
     - Usa `writeBatch` y `doc(collection(db, 'guests'))`.
     - Pone `guestId = slug(nombre)-<primeros 6 caracteres del id del documento en minúsculas>`.
     - Pone `rsvpStatus: 'pending'` y `plusOneAllowed: false`.
     - Registra una sola actividad `guests_imported`.
   - Al terminar, agrega los nuevos invitados a `setGuests` y muestra "Se importaron {n} invitados · {m} omitidos".
   - Dejar `public/plantillas/invitados-invyta.xlsx` y enlazarlo desde el paso Cargar.
   - Prueba:
     - Importar la plantilla sin cambios crea a "Familia Hernández Ruiz" con un link que funciona.
     - Importarla otra vez la deja "Omitida · Ya existe".

## Criterios de aceptación

**General**

- [ ] `npm run build` termina sin errores de tipos ni de lint nuevos.
- [ ] En una boda `free` no aparecen el botón "Importar" ni el ícono de WhatsApp.

**Importar**

- [ ] El paso Cargar acepta `.xlsx` y `.csv`, y no tiene ningún cuadro para pegar texto.
- [ ] "Descargar plantilla" baja un `.xlsx` con los encabezados Nombre, Teléfono, Personas, Idioma, Correo y Mensaje, y una sola fila de ejemplo.
- [ ] Importar un `.xlsx` y un `.csv` crea los invitados con su nombre, teléfono, personas, idioma, correo y mensaje.
- [ ] Un archivo con los encabezados "Invitado", "Celular" y "Pases" se reconoce solo, sin tocar el paso 2.
- [ ] Un encabezado desconocido aparece en el paso 2 con un selector para elegir qué dato es o "No importar".
- [ ] La segunda vez que se importa el mismo archivo, todas sus filas quedan como "Omitida · Ya existe" y no se crea ningún duplicado.
- [ ] Con un archivo de 501 filas no se puede importar, y aparece "Máximo 500 invitados por importación".
- [ ] Importar 150 filas deja una sola entrada, "Se importaron 150 invitados", en la actividad reciente del Dashboard.
- [ ] Cada invitado importado tiene un `guestId` único, y su link abre su invitación con su nombre.

**Teléfonos**

- [ ] `3312345678`, `52 33 1234 5678`, `+52 1 33 1234 5678` y `521 33 1234 5678` se guardan como `+523312345678`.
- [ ] `+1 415 555 0123` se guarda como `+14155550123`, y `123` queda como "Teléfono no válido".
- [ ] El formulario manual no guarda un teléfono no válido y muestra el error bajo el campo.

**WhatsApp**

- [ ] Cada fila de la Lista (en escritorio y en móvil) tiene el ícono de WhatsApp junto al de copiar link.
- [ ] El modal se abre con "Invitación" seleccionado cuando el save the date está apagado, y con "Save the date" cuando está activo.
- [ ] A un invitado con idioma `en`, en una boda con inglés, el modal le muestra el mensaje en inglés. A uno con `es`, en español.
- [ ] El mensaje prearmado ya trae el nombre del invitado, la fecha de la boda y su link personal.
- [ ] Con teléfono válido, "Abrir WhatsApp" abre `https://wa.me/<número>?text=…` con el texto del cuadro.
- [ ] Sin teléfono válido, "Abrir WhatsApp" abre `https://wa.me/?text=…`, y el modal dice "Sin teléfono: elegirás el contacto en WhatsApp".
- [ ] Con teléfono válido, el modal muestra "Enviar a {teléfono}" seleccionado y la opción "Elegir el contacto en WhatsApp". Si se elige la segunda, "Abrir WhatsApp" abre `https://wa.me/?text=…`.
- [ ] Al volver a abrir el modal, el destinatario vuelve a "Enviar a {teléfono}", y `guest.phone` no cambió.
- [ ] Si se edita el mensaje y se pulsa "Abrir WhatsApp", al volver a abrir el modal de ese invitado aparece el texto editado.
- [ ] Editar el mensaje de un invitado no cambia el mensaje que ven los demás invitados.
- [ ] Si se edita el mensaje y se pulsa "Cancelar", al volver a abrir el modal aparece el texto anterior.
- [ ] "Restaurar mensaje por defecto" vuelve a poner el texto prearmado. Si después se pulsa "Abrir WhatsApp", desaparece el mensaje guardado de ese invitado.
- [ ] Editar al invitado desde el formulario manual no borra `whatsappMessages`.

## Decisiones tomadas y descartadas

- **Sí: se simplificó el spec después de revisar el diseño.** Decisión del usuario. Quedaron fuera la fecha límite, el seguimiento, los recordatorios, los cambios en Confirmaciones, el pegado desde Excel y las plantillas de mensaje de toda la boda.
- **Sí: solo bodas con diseño.** Decisión del usuario. Las bodas gratis no tienen link y tampoco ven la importación.
- **Sí: se importa solo desde un archivo `.xlsx` o `.csv`.** Decisión del usuario.
  - **No:** pegar celdas.
  - **Sí: SheetJS 0.20.x desde `cdn.sheetjs.com`**, cargado con `import()` solo en el modal. El paquete `xlsx` de npm se quedó en 0.18.5, que tiene vulnerabilidades conocidas (CVE-2023-30533, CVE-2024-22363).
- **Sí: una sola plantilla `.xlsx`, con encabezados y una fila de ejemplo.** Decisión del usuario. **No:** una plantilla `.csv`, porque la carga ya acepta `.csv`.
- **Sí: las columnas Nombre, Teléfono, Personas, Idioma, Correo y Mensaje**, detectadas solas y corregibles a mano. Decisión del usuario.
- **Sí: los duplicados se avisan y se omiten.** Decisión del usuario. Nunca se sobrescribe a alguien que ya confirmó.
- **Sí: el teléfono se guarda en E.164, con México por defecto, y se respetan otras ladas.** Decisión del usuario. Se aplica al importar y en el formulario manual.
- **Sí: una sola entrada de actividad por importación.** Decisión del usuario.
- **Sí: `guestId` con los primeros 6 caracteres del id del documento al importar.** El sufijo de `Date.now()` se puede repetir en una escritura en bloque.
- **Sí: solo un ícono de WhatsApp que abre un modal con el mensaje prearmado.** Decisión del usuario. **No:** un botón cuya acción cambia según el estado del invitado. **No:** el modal de plantillas de toda la boda.
- **Sí: el ícono va junto al de copiar link.** Decisión del usuario. Copiar link sirve para mandar el link por otro medio.
- **Sí: el selector Invitación / Save the date, con el valor inicial según el modo del spec 27.** Decisión del usuario.
- **Sí: el idioma del mensaje es el del invitado.** Decisión del usuario. **No:** elegir el idioma en el modal.
- **Sí: lo que se edita se guarda solo para ese invitado y ese tipo de mensaje, al pulsar "Abrir WhatsApp".** Decisión del usuario. **No:** guardarlo como texto base de toda la boda.
  - **Sí: se guarda el texto ya escrito, no una plantilla con variables.** Es lo que la pareja vio y editó.
  - **Sí: si el texto es igual al por defecto, no se guarda.** Así el invitado sigue recibiendo el mensaje por defecto si cambian la fecha o los nombres.
- **Sí: el destinatario es el número del invitado o, si no tiene, el contacto que elija la pareja.** Decisión del usuario.
- **Sí: aunque el invitado tenga teléfono, se puede elegir "Elegir el contacto en WhatsApp" para ese envío.** Decisión del usuario. Sirve cuando el número guardado no es al que quieren mandar (por ejemplo, una familia en la que escribe otra persona). **No:** guardar la elección ni cambiar el teléfono del invitado desde el modal.
- **Sí: sin seguimiento de envío.** Decisión del usuario. No se registra nada al enviar, salvo el mensaje editado.
- **Sí: los mensajes por defecto no mencionan a Invyta.** Decisión del usuario. El mensaje sale del número de la pareja.
- **No: la ruta vieja `admin/guests/[weddingId]`.** El menú del panel ya no la usa.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| WhatsApp restringe el número de la pareja si manda muchos mensajes iguales en poco tiempo. | El envío es de uno en uno, y el nombre hace distinto cada texto. |
| Un mensaje guardado queda desactualizado si cambian la fecha, el nombre o el idioma del invitado. | El modal muestra el texto guardado tal cual, y "Restaurar mensaje por defecto" lo regenera. |
| Al cambiar el selector se pierde lo que se escribió en el otro tipo. | Se acepta. Lo editado solo se guarda al enviar. |
| Excel convierte los teléfonos largos en notación científica (`3.31E+09`). | Se lee el texto formateado de la celda, y la plantilla trae la columna Teléfono con formato de texto. |
| SheetJS pesa unos 400 KB. | Se carga con `import()` dinámico solo al abrir el modal de importación. |
| Un texto muy largo corta la URL de `wa.me` en algunos navegadores. | El contador de caracteres avisa a partir de 1000. |
| Las reglas de Firestore están abiertas, así que cualquiera puede escribir `whatsappMessages`. | Se acepta. Es el mismo riesgo que ya tienen los demás campos del invitado. |

## Lo que **no** está en este spec

- Pegar celdas y la plantilla `.csv`.
- Actualizar invitados existentes desde una importación.
- Seguimiento de envío, recordatorios y mensaje de cierre.
- Fecha límite de RSVP.
- Cambios en Confirmaciones.
- Plantillas de mensaje para toda la boda, y elegir el idioma en el modal.
- Cola de envío, envío masivo y WhatsApp Business API.
- Exportar, y grupos o etiquetas.
- La ruta vieja `admin/guests/[weddingId]`, las reglas de Firestore y las bodas gratis.

Cada uno de estos, si se decide hacer, va en su propio spec.
