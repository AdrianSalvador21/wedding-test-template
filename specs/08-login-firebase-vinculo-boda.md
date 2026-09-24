# 08 — Login con Firebase y vínculo de cada cuenta con su boda

**Estado:** Approved
**Depende de:** SPEC 07
**Fecha:** 2026-09-24

## Objetivo

Agregar inicio de sesión con correo y contraseña (Firebase Auth) a los paneles de administración, ligando cada cuenta con su boda por el correo registrado en `weddingOwners`, y permitir al operador crear invitaciones y administrar esos correos desde su propio panel.

> **Diseño validado con el usuario (20 artboards):** https://claude.ai/artifact/QgR96bPzaDZW4oJLWZYCep — acceso, verificación de correo, "Mis invitaciones" (cuenta y operador), casos sin boda y sin acceso, barra con sesión, alta de invitaciones, mensaje de WhatsApp y edición de correos. Móvil solo para el flujo de la pareja; el panel del operador es de escritorio.

## Contexto

Hoy los tres paneles (`/[locale]/admin/wedding-editor/[weddingId]`, `/admin/guests/[weddingId]`, `/admin/confirmations/[weddingId]`) se abren con solo conocer el ID de la boda. Las reglas de `firestore.rules` son `read/write: true` para `weddings` y `guests`, y ya hay dos bodas reales en producción (`karen-y-juan`, `nuriban-y-juan`, 50 invitados). Este spec agrega la identidad (quién eres y a qué boda perteneces); **no cierra las reglas de Firestore ni el servidor de IA, eso es el spec 09**. Hasta que el spec 09 se implemente, el guard de este spec controla la interfaz pero no impide que alguien escriba directo a Firestore. Se documenta así para no dar una falsa sensación de seguridad.

Revisión de código hecha antes de este spec (no asumida):

- `lib/firebase.ts` solo inicializa la app y exporta `db` y `app`; no hay `getAuth`. La dependencia `firebase ^12` ya incluye `firebase/auth`.
- `middleware.ts` solo hace i18n con `next-intl` (`localePrefix: 'as-needed'`) y su `matcher` excluye `/api`. No protege nada.
- No existe `app/[locale]/admin/page.tsx` (el índice de bodas que documenta `ADMIN_SYSTEM.md`). Se crea aquí como "Mis invitaciones".
- `firebase-admin` no está instalado, y no existen variables de cuenta de servicio. La app se despliega en Vercel (el `hosting` de `firebase.json`, que apunta a un export estático, no se usa), por lo que las rutas de servidor con runtime `nodejs` y las variables de entorno están soportadas.
- Las bodas se crean a mano en la consola de Firebase; no existe ningún campo de dueño. El documento `weddings/{id}` es de lectura pública, así que **ningún correo puede vivir ahí**.
- Ninguna regla de `firestore.rules` cubre una colección llamada `weddingOwners`; Firestore niega por defecto lo que no está listado, así que esa colección queda inaccesible para los clientes y solo la lee el servidor con el SDK admin.
- `components/admin/ui.tsx` tiene `AdminPageNav` (navegación Editor / Invitados), donde se agrega el cierre de sesión. Los paneles de admin están en español únicamente.
- Las páginas de editor e invitados hacen `saveWeddingDoc` (antes `setDoc`) al cargar; por eso el guard debe evaluarse **antes** de que el panel cargue su documento.
- **Qué necesita una boda para existir (revisado en código):** (1) el documento `weddings/<id>` con la forma que ya genera `createInitialWeddingData` (definida dentro de `wedding-editor/[weddingId]/page.tsx` y duplicada en `admin/guests/[weddingId]/page.tsx`) más `template.id` (`template-01`, `template-02` o `template-03`), nombres y fecha; (2) `weddingOwners/<id>`; (3) un ID válido: 3 a 50 caracteres `[a-zA-Z0-9\-_]`, no reservado (`admin`, `api`, `auth`, `login`, `register`, `demo`, `test`, `null`, `undefined`) y que no exista. El editor no crea bodas: si el documento no existe muestra 404. Ningún código exige `isActive` ni `status` para mostrar la invitación.
- **Fotos y música son archivos del repositorio:** `public/assets/wedding-images/<id>/` (`hero`, `couple`, `gallery/`) y `public/assets/music/<id>.mp3`, leídos por `app/api/wedding-images` y `app/api/wedding-music`. Agregarlos exige commit y despliegue por boda; el panel no puede crearlos. Sin esos archivos la invitación funciona con fotos de stock (`hooks/useWeddingImages.ts`).
- `specs/05` indica que el Paquete Básico no edita (lo hace el equipo) y el Personalizado sí. Decisión del usuario: ambos reciben las mismas pantallas, sin campo de plan.

## Alcance

**Incluye:**

- Inicio de sesión, registro, recuperar contraseña y cierre de sesión con Firebase Auth (correo y contraseña), en español.
- Verificación de correo obligatoria antes de ligar o entrar a cualquier boda.
- Página `app/[locale]/login/page.tsx` con tres modos (iniciar sesión, crear cuenta, olvidé mi contraseña) y una pantalla "Verifica tu correo".
- Página `app/[locale]/admin/page.tsx` "Mis invitaciones": lista de las bodas de la cuenta con accesos a Editor e Invitados (sin enlace a Confirmaciones mientras esa pantalla no funcione; ver spec 09).
- Colección `weddingOwners/{weddingId}` con los correos de las personas dueñas, creada a mano por el operador.
- Ruta de servidor `POST /api/auth/link-weddings` que verifica el token, exige correo verificado y devuelve las bodas de la cuenta.
- Acceso del operador a todas las bodas mediante la variable de entorno `ADMIN_EMAILS`, usando la misma pantalla "Mis invitaciones" con buscador.
- Aterrizaje directo: al iniciar sesión, si la cuenta tiene una sola boda va a su editor; si tiene varias (o es operador) va a "Mis invitaciones".
- Pantalla para cuentas sin boda ligada, con reintentar, contacto por WhatsApp y cerrar sesión.
- Guard en los tres paneles de admin: sin sesión redirige al login; sin acceso a esa boda muestra "No tienes acceso".
- Correo de la sesión y botón "Cerrar sesión" en `AdminPageNav`.
- **Alta de invitaciones desde el panel del operador:** botón "Nueva invitación" en "Mis invitaciones" con un formulario mínimo (nombres de las dos personas, sus dos correos, fecha y plantilla) y un ID editable propuesto a partir de los nombres. Crea `weddings/<id>` y `weddingOwners/<id>` en una sola operación.
- Tarjeta "Invitación creada": enlace de la invitación para los invitados, enlace de entrada de la pareja y un mensaje para WhatsApp ya redactado, con "Copiar mensaje" y "Abrir en WhatsApp".
- **Editar los correos con acceso** de una boda desde su tarjeta (agregar y quitar), para corregir errores de captura sin entrar a la consola.
- **Ajustes de la invitación** desde su tarjeta del operador: cambiar la plantilla en cualquier momento y cambiar la dirección (el ID) solo mientras la invitación no tenga invitados.
- Estado vacío del operador cuando no existe ninguna invitación.
- `lib/wedding-defaults.ts` con `createInitialWeddingData` y `isValidWeddingId` como fuente única, usada por el editor, la página de invitados y la ruta de alta.
- Rutas de servidor `POST /api/admin/weddings`, `GET` y `PATCH /api/admin/weddings/[weddingId]`, y `GET`/`PUT /api/admin/weddings/[weddingId]/owners`, solo para correos de `ADMIN_EMAILS`.
- Variables `FIREBASE_SERVICE_ACCOUNT_JSON` y `ADMIN_EMAILS` en `.env.local.example`.

**No incluye (queda para otra iteración):**

- Reglas de Firestore, protección de `/api/ai/*` con el token del usuario y contadores `aiUsage` con SDK admin — spec 09.
- Corregir el origen de datos de Confirmaciones (`rsvps` vs `guests`) — spec 09. Entre tanto, "Mis invitaciones" no enlaza a esa pantalla; la ruta `/admin/confirmations/<id>` sigue existiendo y protegida por el guard.
- Inicio de sesión con Google u otros proveedores.
- Enlace de reclamo por WhatsApp (código de un solo uso) como método alterno de vínculo.
- Subida de fotos y música (siguen siendo archivos del repositorio, copiados y desplegados a mano); un spec futuro puede moverlas a Firebase Storage con subida desde el editor.
- Archivar, eliminar o duplicar invitaciones desde el panel.
- Cambiar la dirección de una invitación que ya tiene invitados, y redirigir el enlace anterior al nuevo tras un cambio.
- Renombrar las fotos y la música (archivos del repositorio con el ID en su ruta) al cambiar la dirección: se hace a mano y con despliegue.
- Que la pareja cambie la plantilla desde su propio editor.
- Correo automático a la pareja al crear la invitación (el aviso es el mensaje de WhatsApp que copia el operador).
- Campo de plan (Básico o Personalizado) en la boda.
- Capturar lugares, hora u otros datos del evento al crear (los llena la pareja o el operador desde el editor).
- Autoservicio (que la pareja cree su propia boda) y cobro.
- Distinción de plan Básico y Personalizado en los paneles.
- Cambiar correo o contraseña dentro del panel (la recuperación es por el correo de Firebase).
- Envío de invitaciones a invitados por correo.
- IDs no adivinables para bodas nuevas.
- Autenticación multifactor.

## Modelo de datos

Un solo documento nuevo, creado a mano en Firestore (consola de Firebase → Firestore Database):

```js
// weddingOwners/{weddingId}  — mismo ID que weddings/{weddingId}
{
  emails: ["persona1@correo.com", "persona2@correo.com"], // array de strings
}
```

Convenciones:

- El ID del documento es exactamente el ID de la boda (`weddingOwners/karen-y-juan`).
- Los correos se escriben en minúsculas y sin espacios. El servidor compara en minúsculas de ambos lados, así que mayúsculas accidentales no impiden el vínculo.
- No se guardan `uid`: el vínculo se evalúa en cada carga a partir del correo verificado de la sesión, por lo que la cuenta puede registrarse antes o después de que el operador cree el documento.
- La colección no tiene regla en `firestore.rules`; los clientes no pueden leerla ni escribirla. Solo el servidor con `firebase-admin`.

Contrato de la ruta de servidor:

```ts
// POST /api/auth/link-weddings
// Header: Authorization: Bearer <ID token de Firebase Auth>
// 200 → { email: string, isAdmin: boolean, weddings: [{ id: string, title: string, date: string, ownerEmails?: string[] }] }
//        (ownerEmails solo llega para el operador, para mostrar y editar los correos con acceso)
// 500 → { error: 'server_error' }
// 401 → { error: 'unauthenticated' }        // sin token o token inválido
// 403 → { error: 'email_not_verified' }     // correo sin verificar
```

`title` se arma como `"<persona 2> y <persona 1>"` con `couple.bride.name` y `couple.groom.name`; `date` es `event.date`.

Contrato del alta (solo operador, misma verificación de token y `ADMIN_EMAILS`):

```ts
// POST /api/admin/weddings
// Header: Authorization: Bearer <ID token>
// Body: { bride: string, groom: string, brideEmail: string, groomEmail: string,
//         date: 'YYYY-MM-DD', templateId: 'template-01' | 'template-02' | 'template-03', weddingId: string }
// 201 → { id: string }
// 400 → { error: 'invalid_input', field: string }   // ID inválido/reservado, correo inválido, fecha, plantilla
// 401 → { error: 'unauthenticated' }   403 → { error: 'not_admin' }
// 409 → { error: 'wedding_exists' }    // ya existe weddings/<id>

// GET /api/admin/weddings/[weddingId] → 200 { id: string, templateId: TemplateId, guestCount: number }
// PATCH /api/admin/weddings/[weddingId]
// Body: { templateId?: TemplateId, newWeddingId?: string }   // al menos uno
// 200 → { id: string }                    // id es el nuevo si cambió
// 400 → { error: 'invalid_input', field: string }   404 → { error: 'not_found' }
// 409 → { error: 'has_guests', guestCount: number } | { error: 'wedding_exists' }

// GET /api/admin/weddings/[weddingId]/owners → 200 { emails: string[] }
// PUT /api/admin/weddings/[weddingId]/owners
// Body: { emails: string[] }           // 1 a 6, minúsculas, sin duplicados
// 200 → { emails: string[] }   404 → { error: 'not_found' }
```

Lo que escribe el alta, en una operación atómica (`WriteBatch` con `create`, de modo que un ID existente falla sin escribir nada):

```js
// weddings/{weddingId} = createInitialWeddingData(weddingId), con:
//   couple.bride.name = bride      // "persona 2" en el editor
//   couple.groom.name = groom      // "persona 1" en el editor
//   event.date = '<date>T16:00:00.000Z'   // mismo formato que el editor
//   template = { id: templateId }
//   (theme queda en { id: 'classic' }, status 'draft', hasEnglish sin definir)
// weddingOwners/{weddingId} = { emails: [brideEmail, groomEmail] }   // en minúsculas
```

Lo que hace el cambio de dirección (`newWeddingId`), en una transacción: cuenta `guests` con `weddingId == <id>` (si hay alguno responde 409 `has_guests` sin tocar nada), crea `weddings/<nuevo>` con el mismo contenido (`id` y `event.weddingId` actualizados, conserva `aiUsage` e `i18nMeta`) y `weddingOwners/<nuevo>` con los mismos correos, y elimina los dos documentos anteriores. Si el ID nuevo ya existe responde 409 `wedding_exists`. Cambiar la plantilla solo actualiza `template.id` y `updatedAt`.

El ID propuesto en el formulario es un slug de los nombres (sin acentos, minúsculas, "persona 2 y persona 1"), editable; ejemplo `maria-y-carlos`.

Estados de sesión en el cliente (`lib/auth-context.tsx`): `loading`, `signedOut`, `unverified`, `noWeddings`, `ready` y `error` (falla de red o del servidor al consultar las bodas ligadas; la pantalla ofrece Reintentar). `refresh({ silent: true })` actualiza la lista sin mostrar la pantalla de carga, para refrescar tras crear una invitación o editar correos.

Variables de entorno (solo servidor, sin prefijo `NEXT_PUBLIC_`):

```
FIREBASE_SERVICE_ACCOUNT_JSON=  # JSON de la cuenta de servicio, en una sola línea
ADMIN_EMAILS=                   # correos del operador separados por coma
```

## Plan de implementación

1. **Prerrequisitos manuales (sin código).** En la consola de Firebase: habilitar el proveedor "Correo electrónico/contraseña" (Authentication → Sign-in method), agregar `localhost` y el dominio de producción a los dominios autorizados, generar una clave privada de cuenta de servicio (Project settings → Service accounts) y guardarla en `.env.local` junto con `ADMIN_EMAILS`. Actualizar `.env.local.example` con ambas variables sin valores. La app se despliega en Vercel: agregar `ADMIN_EMAILS` y `FIREBASE_SERVICE_ACCOUNT_JSON` en Vercel → Settings → Environment Variables (marcadas como Sensitive, en los entornos que apliquen) y **redesplegar**, porque las variables nuevas solo llegan a despliegues nuevos. Pegar el JSON de la clave sin reformatearlo (el `private_key` trae `\n` como texto y `JSON.parse` los convierte). Confirmar que `NEXT_PUBLIC_FIREBASE_*` y `OPENAI_API_KEY` ya existen en Vercel. Registrar como dominios autorizados de Firebase Auth el dominio de producción y `localhost`.
2. `npm install firebase-admin` y crear `lib/firebase-admin.ts`, que inicializa una sola vez el SDK admin con `FIREBASE_SERVICE_ACCOUNT_JSON` y exporta `getAdminAuth()` y `getAdminDb()` (de forma perezosa, para que el build no exija la variable); falla con un mensaje claro si falta la variable. Verificar que `npm run build` compila; si Next 14 no empaqueta `firebase-admin`, agregarlo a `experimental.serverComponentsExternalPackages` en `next.config.js`.
3. Crear `lib/serverAuth.ts` (verificación del token, `ADMIN_EMAILS`, `requireAdmin`) y `app/api/auth/link-weddings/route.ts` (`runtime = 'nodejs'`): valida el token con `adminAuth.verifyIdToken`, exige `email_verified`, lee todos los documentos de `weddingOwners` y compara correos en minúsculas; si el correo está en `ADMIN_EMAILS` devuelve todas las bodas de `weddings`. Prueba manual: `curl` sin token responde 401.
4. En `lib/firebase.ts` agregar `getAuth(app)` (`languageCode = 'es'`) y exportar `auth`. Crear `lib/contact.ts` con el número de WhatsApp que ya usa la landing (`529602460590`) sin modificar la landing.
5. Crear `lib/auth-context.tsx` con `AuthProvider` y `useAuth()`: escucha `onAuthStateChanged`, llama a `link-weddings` con el ID token, resuelve el estado de sesión, expone `signOut`, `refresh` y `resendVerification`. Crear `app/[locale]/admin/layout.tsx` que monta el provider. Sin efecto visible todavía.
6. Crear `app/[locale]/login/page.tsx` (con su propio `AuthProvider`): modos iniciar sesión, crear cuenta (contraseña mínima de 8 caracteres) y recuperar contraseña; al crear cuenta envía la verificación; pantalla "Verifica tu correo" con "Ya verifiqué", "Reenviar correo" (espera de 60 s) y "Cerrar sesión"; errores de Firebase traducidos al español. Aterrizaje: si existe `?next=` y pertenece a una boda de la cuenta va ahí; si no, una boda va al editor y varias van a `/admin`. Prueba manual: registrar, verificar, iniciar sesión.
7. Crear `app/[locale]/admin/page.tsx` "Mis invitaciones": tarjetas con título, fecha e ID y botones Editor e Invitados (el enlace a Confirmaciones se quitó porque la pantalla no funciona hasta el spec 09); para operador, buscador por nombre o ID y etiqueta "Admin". Estado `noWeddings`: "Todavía no tienes una invitación ligada a tu cuenta", muestra el correo usado, con botones Reintentar, Escribirnos por WhatsApp (mensaje prellenado con el correo) y Cerrar sesión.
8. Crear `components/admin/AuthGuard.tsx` y aplicarlo a los tres paneles: cada `page.tsx` renombra su componente actual a `...Content` y exporta un default que envuelve el contenido con `AuthGuard` (así el documento no se carga ni se escribe antes de pasar el guard). Sin sesión redirige a `/[locale]/login?next=<ruta>`; sin correo verificado muestra "Verifica tu correo"; sin acceso a esa boda muestra "No tienes acceso a esta boda" con enlace a Mis invitaciones.
9. En `AdminPageNav` (`components/admin/ui.tsx`) mostrar el correo de la sesión y el botón "Cerrar sesión" (en móvil no existía un menú compacto: se agrega uno con botón de menú, según el diseño, con los enlaces, el correo y "Cerrar sesión"). También agrega el enlace "Mis invitaciones" para operadores y cuentas con más de una boda.
10. **Fuente única de la boda vacía.** Crear `lib/wedding-defaults.ts` con `createInitialWeddingData` y `isValidWeddingId` (movidas sin cambios desde `wedding-editor/[weddingId]/page.tsx`) y hacer que el editor y `admin/guests/[weddingId]/page.tsx` las importen en lugar de sus copias. Refactor sin cambio de comportamiento; verificar que el editor y los invitados siguen abriendo una boda.
11. Crear `POST /api/admin/weddings`: verifica token y `ADMIN_EMAILS`, valida cuerpo e ID con `isValidWeddingId`, y escribe `weddings/<id>` y `weddingOwners/<id>` en un `WriteBatch` con `create` (409 si ya existe). Prueba manual: sin token responde 401; con una cuenta que no es operador responde 403.
12. En `/admin` (solo operador): botón "Nueva invitación" y modal con el formulario del diseño (nombres, correos, fecha, plantilla, dirección editable con slug propuesto, errores por campo, "Usar <id>-2" ante ID repetido). Al éxito, tarjeta "Invitación creada" con los dos enlaces y el mensaje para WhatsApp ("Copiar mensaje", "Abrir en WhatsApp", "Crear otra", "Ir al editor"). Estado vacío cuando no hay invitaciones.
13. Crear `PUT /api/admin/weddings/[weddingId]/owners` y el modal "Correos con acceso" desde la tarjeta del operador (quitar, agregar, validar formato, mínimo un correo).
14. Crear `GET` y `PATCH /api/admin/weddings/[weddingId]` y el modal "Ajustes de la invitación" (botón de engrane en la tarjeta del operador): selector de plantilla (el mismo del alta, extraído a un componente compartido) y campo de dirección deshabilitado con explicación cuando la invitación ya tiene invitados; al cambiar la dirección avisa que fotos y música con el ID anterior se renombran a mano. Prueba manual: cambiar plantilla, cambiar dirección sin invitados, e intentar cambiarla en una boda con invitados (409).
15. **Puesta en marcha (antes de desplegar).** Crear `weddingOwners/karen-y-juan` y `weddingOwners/nuriban-y-juan` con los correos reales (desde el panel del operador con "Correos con acceso" si ya está desplegado en un entorno de prueba, o en la consola), y configurar `ADMIN_EMAILS` en el entorno de producción. Verificar el flujo completo con una cuenta de prueba de cada boda, con la cuenta del operador y creando una invitación de prueba. Avisar a las parejas que ahora inician sesión. Recién entonces desplegar.
16. `npm run build` (o `tsc --noEmit`) sin nuevos errores de tipos respecto al estado previo.

## Criterios de aceptación

- [ ] Una cuenta nueva puede registrarse con correo y contraseña, recibe el correo de verificación y, tras verificarlo, entra.
- [ ] Una cuenta con correo sin verificar no llega a ningún panel; ve "Verifica tu correo" con "Ya verifiqué" y "Reenviar correo".
- [ ] "Olvidé mi contraseña" envía el correo de recuperación de Firebase y permite entrar con la contraseña nueva.
- [ ] Con `weddingOwners/<id>` que contiene su correo (aunque esté escrito con mayúsculas), la cuenta iniciada con correo verificado aterriza directo en `/[locale]/admin/wedding-editor/<id>`.
- [ ] Una cuenta con dos bodas ligadas aterriza en "Mis invitaciones", con ambas tarjetas.
- [ ] El operador (correo en `ADMIN_EMAILS`, verificado) ve todas las bodas en "Mis invitaciones", con buscador y etiqueta "Admin", y puede abrir cualquiera.
- [ ] Una cuenta sin ninguna boda ligada ve "Todavía no tienes una invitación ligada a tu cuenta", con su correo, Reintentar, WhatsApp con mensaje prellenado y Cerrar sesión.
- [ ] Después de que el operador crea `weddingOwners/<id>` con ese correo, "Reintentar" liga la boda sin cerrar sesión ni registrarse otra vez.
- [ ] Abrir `/[locale]/admin/wedding-editor/<id>`, `/admin/guests/<id>` o `/admin/confirmations/<id>` sin sesión redirige al login y, tras entrar, regresa a esa ruta si la boda pertenece a la cuenta.
- [ ] Una cuenta con sesión que abre la URL de una boda que no es suya ve "No tienes acceso a esta boda" y el panel no carga ni escribe el documento.
- [ ] `POST /api/auth/link-weddings` sin token responde 401 y con correo sin verificar responde 403.
- [ ] `AdminPageNav` muestra el correo de la sesión y "Cerrar sesión" cierra la sesión y regresa al login.
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` no aparece en ningún archivo de `app/[locale]/**` ni en componentes cliente; solo se lee en `lib/firebase-admin.ts`.
- [ ] Las invitaciones públicas (`/[locale]/wedding/<id>?guest=...`) siguen abriendo sin sesión.
- [ ] "Nueva invitación" solo aparece para el operador; una cuenta de pareja no la ve.
- [ ] Crear una invitación con nombres, dos correos, fecha y plantilla genera `weddings/<id>` y `weddingOwners/<id>`, y muestra la tarjeta "Invitación creada".
- [ ] La pareja creada entra con cualquiera de los dos correos (verificado), aterriza directo en el editor de esa invitación y ve sus nombres, la fecha y la plantilla ya cargados.
- [ ] Un ID que ya existe responde 409 sin escribir nada, y el formulario ofrece "Usar <id>-2".
- [ ] Un ID reservado (`admin`, `login`, `demo`, etc.), demasiado corto o con caracteres inválidos, y un correo mal escrito, se rechazan con mensaje por campo.
- [ ] `POST /api/admin/weddings` sin token responde 401 y con una cuenta que no es operador responde 403.
- [ ] "Copiar mensaje" copia el texto con el enlace de entrada y los correos de la pareja; "Abrir en WhatsApp" abre `wa.me` con ese mensaje.
- [ ] La invitación pública recién creada abre sin sesión, con fotos de stock, en la plantilla elegida.
- [ ] "Correos con acceso" permite agregar y quitar correos, exige al menos uno, y quien fue quitado pierde el acceso en su siguiente inicio de sesión.
- [ ] Desde "Ajustes" el operador cambia la plantilla de una invitación y la invitación pública se ve con la plantilla nueva.
- [ ] Una invitación sin invitados permite cambiar su dirección: el enlace nuevo abre la invitación, los correos con acceso se conservan y el editor de la pareja abre bajo el ID nuevo.
- [ ] Una invitación con al menos un invitado no permite cambiar la dirección (campo deshabilitado con la explicación) y `PATCH` con `newWeddingId` responde 409 `has_guests` sin modificar nada.
- [ ] Un ID nuevo que ya existe, reservado o inválido se rechaza con mensaje por campo y no modifica nada.
- [ ] `GET` y `PATCH /api/admin/weddings/[weddingId]` sin token responden 401 y con una cuenta que no es operador responden 403.
- [ ] Con cero invitaciones el operador ve el estado vacío con "Crear la primera invitación".
- [ ] El editor y la página de invitados usan `createInitialWeddingData` de `lib/wedding-defaults.ts` y siguen abriendo las bodas existentes sin cambios.
- [ ] `karen-y-juan` y `nuriban-y-juan` tienen su `weddingOwners` y sus parejas pueden entrar antes del despliegue.
- [ ] `npm run build` (o `tsc --noEmit`) no introduce nuevos errores de tipos respecto al estado previo.

## Decisiones tomadas y descartadas

- **Firebase Auth con correo y contraseña:** decisión explícita del usuario ("ocupemos Firebase para eso"). Sin Google en esta iteración.
- **Vínculo por correo en `weddingOwners/{weddingId}`:** decisión explícita del usuario; el operador ya crea la boda a mano en Firestore y agrega el correo ahí.
- **No en `weddings/{id}`:** ese documento es de lectura pública; poner ahí los correos los expondría a cualquiera. Una colección aparte no tiene regla y queda cerrada a los clientes.
- **Solo con correo verificado:** sin verificación, cualquiera podría registrar el correo de otra pareja y quedarse con su boda.
- **El vínculo lo hace el servidor con `firebase-admin`, no el navegador:** el cliente no puede leer `weddingOwners`, y confiar en el navegador para decidir la propiedad no sería confiable.
- **No se guardan `uid`:** el vínculo se evalúa en cada carga por el correo verificado. Permite registrarse antes o después de que el operador cree el documento. El spec 09 podrá usar `request.auth.token.email` y `email_verified` en las reglas leyendo `weddingOwners` con `get()`, sin campo público.
- **Comparación en minúsculas leyendo todos los `weddingOwners`:** tolera mayúsculas y errores de captura de consola; con decenas o cientos de bodas el costo es pequeño. Se revisa cuando crezca.
- **Enlace de reclamo por WhatsApp descartado por ahora:** funciona con cualquier correo, pero exige una herramienta para generar códigos de un solo uso. Si el correo no coincide, el respaldo es que el operador agregue el correo real a `emails`.
- **Ambos paquetes con las mismas pantallas, sin campo de plan:** decisión explícita del usuario; evita un cambio de modelo no contemplado.
- **Acceso del operador con `ADMIN_EMAILS`:** decisión explícita del usuario. Solo el dueño del servidor puede cambiar la lista (variable de entorno); nadie puede volverse admin editando Firestore. Reutiliza "Mis invitaciones" en vez de un panel de admin aparte.
- **`ADMIN_EMAILS` y la clave de servicio como variables de entorno de Vercel, no como datos de Firestore:** con las reglas abiertas cualquiera podría escribirse como admin en una colección; una variable solo la controla quien controla el despliegue. Cambiar de operador implica cambiar la variable y redesplegar.
- **Login en `app/[locale]/login`, no dentro de `admin`:** es la puerta de entrada de cuentas aún sin boda; el guard de `admin/*` la redirige ahí.
- **Guard antes de cargar el panel (envoltorio `AuthGuard`), no dentro del componente:** el editor y la gestión de invitados escriben el documento al cargar; el guard evita esa escritura para quien no tiene acceso.
- **Dividir en spec 08 (identidad) y spec 09 (reglas y servidor):** decisión explícita del usuario. Cerrar las reglas de golpe es el paso más riesgoso con dos bodas reales; primero se instala la identidad sin romper nada.
- **Alta de invitaciones desde el panel del operador con ruta de servidor:** decisión del usuario ("me serviría muchísimo"). Es la misma infraestructura del vínculo (`firebase-admin`, `ADMIN_EMAILS`); crear `weddings` y `weddingOwners` juntos elimina los errores de captura de la consola.
- **Formulario mínimo (nombres, correos, fecha, plantilla):** decisión del usuario. Descartado capturar plan o lugares al crear: el plan no se usa en ningún lado y los lugares los llena la pareja desde el editor.
- **ID = slug de los nombres, editable, sin sufijo aleatorio:** decisión del usuario. Descartados el sufijo aleatorio y el ID totalmente aleatorio. El ID sigue siendo adivinable, igual que los actuales; ese riesgo baja cuando el spec 09 cierre las reglas de Firestore.
- **Fotos y música siguen manuales:** decisión del usuario. Son archivos del repositorio (`public/assets`) y el panel no puede escribirlos en un despliegue. La solución de fondo es Firebase Storage con subida desde el editor, en un spec propio. Mientras tanto la invitación nueva usa fotos de stock.
- **Entrega con tarjeta y mensaje de WhatsApp, sin correo automático:** decisión del usuario. Es tu canal habitual y no requiere un servicio de correo; el correo de Firebase solo cubre verificación y recuperación de contraseña.
- **Editar correos con acceso desde el panel (propuesta del spec, por confirmar):** no fue pedido explícitamente. Se incluye porque un error de captura del correo es el fallo más probable del vínculo, y sin esto el operador vuelve a la consola.
- **Cambiar la plantilla siempre, la dirección solo sin invitados:** decisión del usuario. Descartados cambiar siempre (con y sin redirección) y no cambiar nunca. Cada invitado ya recibió un enlace con el ID; moverlos rompería esos enlaces.
- **Cambio de dirección con una transacción que crea los documentos nuevos y elimina los anteriores:** el ID es la llave del documento, no se puede renombrar en sitio. La transacción hace que un invitado agregado a media operación no quede huérfano.
- **Sin redirección desde el ID anterior:** con cero invitados nadie tiene el enlace viejo; una colección de alias solo se justificaría si se permitiera cambiar con invitados.
- **Alta atómica con `WriteBatch` y `create`:** si el ID existe, falla sin escribir nada; evita una boda sin `weddingOwners` o al revés.
- **Fecha con hora fija `T16:00:00.000Z`:** mismo formato que ya escribe el editor; la hora real del evento la edita la pareja en "Hora del evento".
- **`createInitialWeddingData` extraída a `lib/wedding-defaults.ts`:** hoy vive duplicada en el editor y en la página de invitados; una tercera copia en el servidor las haría divergir.
- **Migración manual previa al despliegue:** el operador crea `weddingOwners` de las dos bodas reales antes de desplegar; se deja como paso 10 y como criterio de aceptación.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El guard es de interfaz: quien conozca la configuración pública de Firebase aún puede leer o escribir directo en Firestore hasta el spec 09 | Se documenta arriba; el spec 09 cierra las reglas y verifica el token en `/api/ai/*` |
| Las parejas reales quedan bloqueadas si se despliega sin su `weddingOwners` | Paso 10 y criterio de aceptación; avisar a las parejas antes |
| Error de captura del correo en la consola, o la pareja se registra con otro | Pantalla de cuenta sin boda con Reintentar y WhatsApp prellenado; el operador corrige `emails` y la pareja pulsa Reintentar |
| Los correos de verificación y recuperación llegan a spam (remitente por defecto de Firebase) | "Reenviar correo" con espera de 60 s; indicar que revisen spam; personalizar plantillas en la consola |
| Fuga de la clave de cuenta de servicio | Solo en variable de entorno de servidor, sin `NEXT_PUBLIC_`, nunca en el repositorio (`.env.local` está en `.gitignore`) |
| Toma de la cuenta del operador da acceso a todas las bodas | Exigir correo verificado; recomendar verificación en dos pasos en esa cuenta de correo |
| `firebase-admin` no empaqueta bien con Next 14 | Paso 2 verifica el build y externaliza el paquete si hace falta |
| Los despliegues de vista previa de Vercel (`*.vercel.app`) no pueden iniciar sesión: Firebase Auth exige dominios autorizados y no admite comodines | Probar el login en producción o en un dominio fijo; agregar a mano una URL de vista previa solo cuando haga falta |
| Las variables `ADMIN_EMAILS` y `FIREBASE_SERVICE_ACCOUNT_JSON` no llegan al despliegue (Vercel las aplica solo a despliegues nuevos, y por entorno) | Paso 1 y paso 14: redesplegar y verificar con la cuenta del operador en producción |
| Error de captura en los correos al crear una invitación | "Correos con acceso" permite corregirlos; la tarjeta de éxito los muestra antes de mandar el mensaje |
| Una invitación recién creada es pública apenas existe (con fotos de stock y campos vacíos) si su enlace se comparte antes de que esté lista | El operador comparte el enlace de invitados solo cuando la pareja terminó; publicar o no la invitación queda fuera de este spec |
| Bodas creadas antes del spec 09 siguen con IDs adivinables y reglas abiertas | Se cierra en el spec 09; el ID editable sin sufijo fue decisión explícita |
| Se cambia la dirección y ya existían fotos o música copiadas al repositorio con el ID anterior | El modal avisa antes de guardar; renombrar `public/assets/wedding-images/<id>/` y `music/<id>.mp3` y desplegar es manual |
| El operador cambia la plantilla mientras la pareja tiene el editor abierto con la anterior: al guardar ella, la plantilla vuelve a su valor previo | Aceptado; la pareja recarga y el operador repite el cambio. Cambiar la plantilla suele hacerse antes de entregar el acceso |
| Cualquiera puede crear cuentas (registro abierto) | Las cuentas sin boda no acceden a nada; se acota en un spec futuro si se abusa |

## Lo que **no** está en este spec

- Reglas de Firestore, `firebase-admin` para `aiUsage` y protección de `/api/ai/*` (spec 09).
- Corregir Confirmaciones (`rsvps` vs `guests`).
- Google u otros proveedores de inicio de sesión.
- Enlace de reclamo por WhatsApp.
- Subida de fotos y música (Firebase Storage).
- Archivar, eliminar o duplicar invitaciones.
- Correo automático a la pareja al crearla.
- Campo de plan (Básico o Personalizado).
- Autoservicio y cobro.
- Distinción de plan Básico y Personalizado.
- Cambiar correo o contraseña desde el panel.
- Correos a invitados.
- IDs no adivinables para bodas nuevas.
- Autenticación multifactor.

Cada uno de estos, si se decide hacer, va en su propio spec.
