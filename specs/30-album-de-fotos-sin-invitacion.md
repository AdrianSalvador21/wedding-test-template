# 30 — Álbum de fotos sin invitación

**Estado:** Approved
**Depende de:** SPEC 16 (tier `free` / `template`), SPEC 22 (onboarding y boda gratis), SPEC 28 (envío por WhatsApp), SPEC 29 (álbum de fotos de los invitados)
**Fecha:** 2026-11-25

## Objetivo

Que una pareja sin invitación de Invyta pueda contratar solo el álbum de fotos, a $499 MXN, sobre su boda gratis, y compartirlo con sus invitados por QR y por links personales enviados por WhatsApp.

## Contexto

### Estado real del código (revisado en esta sesión)

- Una pareja ya puede crear sola una **boda gratis** (`tier: 'free'`) desde el onboarding del spec 22 (`components/admin/auth-ui.tsx`, `POST /api/weddings/free`). Tiene nombres, fecha, lista de invitados y mesas, pero no invitación pública.
- El álbum del spec 29 está bloqueado para las bodas gratis en cinco lugares:
  - `isAlbumEnabled` (`lib/album.ts`) exige `tier !== 'free'`.
  - La navegación del panel oculta "Fotos" si `tier === 'free'` (`components/admin/panel/ui.tsx`).
  - La página `photos` del panel muestra "El álbum de fotos está disponible para bodas con diseño." si `tier === 'free'`.
  - `PATCH /api/admin/weddings/[weddingId]` rechaza `photoAlbum.enabled` si la boda queda `free`.
  - `SettingsModal` del operador solo muestra el interruptor del álbum si `tier !== 'free'` (`albumAllowed`).
- El diseño del álbum sale de `getAlbumTheme(templateId)` (`components/album/albumThemes.ts`). Sin template, cae en el Moderno.
- Los encabezados del álbum ya funcionan sin foto de portada: el Clásico queda con su fondo oscuro y la Botánica sin el arco.
- El envío por WhatsApp del spec 28 (`WhatsAppSendModal`, `lib/whatsapp.ts`) solo existe para bodas con diseño y manda el link de la invitación.
- El precio del álbum ($399) está escrito a mano en `AlbumSalesPanel.tsx` y en `app/album-de-fotos/page.tsx`.
- El operador crea bodas con `NewWeddingModal` (`components/admin/OperatorTools.tsx`) y `POST /api/admin/weddings`, siempre con template.

### Decisiones del usuario (Fase 2)

- **Compra:** la pareja entra por su cuenta gratis y paga por WhatsApp, o escribe directo y el operador le crea la boda.
- **Precio:** $499 MXN solo; $399 MXN si la boda tiene invitación.
- **Cómo se muestra (ajuste posterior):** en público (`/album-de-fotos`) solo se ve $499, sin decir que con invitación es más barato. En el panel de una boda con invitación se ve $499 tachado y $399, con "Precio especial por tener tu invitación con Invyta.". El panel de una boda gratis muestra $499 sin nota.
- **Acceso de los invitados:** QR general y links personales.
- **Diseño:** la pareja elige uno de los 4 estilos.
- **Portada:** sin foto de portada.
- **Si les escriben directo:** el operador crea la boda.
- **Links personales:** por WhatsApp, invitado por invitado, con un mensaje ya escrito.
- **Dónde se anuncia:** en la página `/album-de-fotos`, el panel de la boda gratis, el onboarding y el banner de la landing.
- **Si después contrata la invitación:** conserva el álbum, sin crédito.
- **Venta en el panel gratis:** con una nota del precio con invitación.
- **Estilo:** la pareja lo cambia cuando quiera.

## Alcance

### Sí entra

1. **El álbum funciona en bodas gratis** cuando el operador lo activa. Aplican las mismas reglas del spec 29:
   - ventana de 3 semanas desde el día de la boda;
   - 30 fotos por invitación o por teléfono;
   - tope de 2,000 fotos por boda;
   - retención de 1 año;
   - modo abierto o cámara desechable;
   - descarga de todas las fotos, QR y visor.
2. **Estilo del álbum** para bodas gratis:
   - la pareja elige Clásico, Moderno, Botánica o Jardín desde el panel, cuando quiera;
   - sin foto de portada.
3. **Sección "Fotos" visible en el panel de las bodas gratis:**
   - con el álbum apagado, muestra la página de venta a $499, sin mencionar el precio con invitación;
   - con el álbum activo, muestra lo mismo que en una boda con diseño, más la tarjeta "Estilo del álbum".
4. **Links personales del álbum por WhatsApp**, en la lista de invitados de una boda gratis con el álbum activo:
   - un ícono de WhatsApp por invitado;
   - un mensaje ya escrito, editable, con el link `/fotos?guest={guestId}`.
5. **Operador:**
   - **"Nueva boda":** puede crear una boda **solo álbum** (`tier: 'free'`, sin template) con el álbum ya activado y el correo de la pareja ligado;
   - **Ajustes de la boda:** permite encender y apagar el álbum en bodas gratis.
6. **Precios centralizados** en `lib/marketing-content.ts` (`ALBUM_PRICE`): `withInvitation: 399` y `standalone: 499`.
7. **Anuncio:**
   - en la página `/album-de-fotos`: los dos precios, cómo empezar sin invitación y una pregunta frecuente nueva;
   - en el banner de la landing: que no hace falta invitación, sin precio;
   - en el onboarding del spec 22: una mención en "Lo que podrás hacer".
8. **Paso a invitación:** si una boda solo álbum recibe template, el álbum y sus fotos siguen igual y toman el diseño del template. No se da crédito.

### No entra

- Pago en línea o activación automática. Se sigue pagando por WhatsApp y activa el operador.
- Foto de portada para el álbum.
- Una cuenta o marca aparte para el servicio de fotos: es la misma cuenta de Invyta.
- Cambiar el estilo del álbum en bodas con diseño: siempre usan el de su template.
- Enviar el link del álbum por WhatsApp en bodas con diseño. Ahí ya existe el botón "Comparte tus fotos" en la invitación.
- Importar invitados desde archivo en bodas gratis. El spec 28 lo deja solo para bodas con diseño.
- Crédito o reembolso de la diferencia al pasar a invitación.
- Slideshow, video y borrado automático al vencer. Siguen pendientes como en el spec 29.

## Modelo de datos

### `PhotoAlbumConfig` (`src/types/wedding.ts`), campo nuevo opcional

```ts
export interface PhotoAlbumConfig {
  enabled: boolean;
  mode: 'open' | 'disposable';
  activatedAt: string;
  uploadsClosed?: boolean;
  style?: TemplateId;   // nuevo: estilo del álbum en bodas gratis ('template-01' … 'template-04')
}
```

- Solo se usa si `tier === 'free'`. En bodas con diseño manda `template.id`.
- Si falta, el estilo es el Moderno (`'template-02'`).

### `lib/album.ts`

| Función | Cambio |
| --- | --- |
| `isAlbumEnabled(wedding)` | Ya no exige `tier !== 'free'`: basta `photoAlbum.enabled === true`. |
| `albumStyleId(wedding)` (nueva) | `tier === 'free'` → `photoAlbum.style ?? 'template-02'`; si no → `template.id`. |

### `lib/marketing-content.ts`

```ts
export const ALBUM_PRICE = { withInvitation: 399, standalone: 499 } as const;
```

Reemplaza los "$399" escritos a mano en el panel y en `/album-de-fotos`.

### `lib/whatsapp.ts`

- Nuevo tipo de mensaje `'album'` en `WhatsAppMessageKind`.
- Nueva función `buildGuestAlbumUrl(origin, weddingId, guest)` → `{origin}{/en si inglés}/wedding/{id}/fotos?guest={guestId}`, con `SITE.url` como origen.
- Texto en español:
  > ¡Hola {nombre}! Gracias por acompañarnos en nuestra boda el {fecha}. En este enlace puedes subir las fotos que tomes y ver las de todos:
  > {link}
  > Con cariño, {novios}
- Texto en inglés:
  > Hi {nombre}! Thank you for celebrating our wedding with us on {fecha}. Use this link to upload the photos you take and see everyone's:
  > {link}
  > With love, {novios}

### Rutas API (cambios)

| Ruta | Cambio |
| --- | --- |
| `GET /api/album/[weddingId]` | `templateId` pasa a ser `albumStyleId(wedding)`. En una boda gratis no se busca foto de portada. |
| `PATCH /api/panel/album/[weddingId]` | Acepta `{ style }` (uno de los 4 `TemplateId`) solo si `tier === 'free'`. Si no, 409 `style_locked`. Se puede en cualquier fase menos `'expired'`. |
| `POST /api/admin/weddings` | Acepta `albumOnly: true`. Crea la boda con `tier: 'free'`, sin template, con `photoAlbum: { enabled: true, mode: 'open', activatedAt, style: 'template-02' }` y los correos en `weddingOwners`. Con `albumOnly` no se pide `templateId`. |
| `PATCH /api/admin/weddings/[weddingId]` | Deja de rechazar `photoAlbum.enabled` en bodas gratis. |

### Eventos de analytics (`lib/analytics/events.ts`)

- `album_activation_cta_click` gana `{ standalone: boolean }`.
- `album_style_changed: { style: TemplateId }`.
- El envío por WhatsApp reutiliza el evento del spec 28, con `kind: 'album'`.

## Experiencia

### Panel de una boda gratis

- **Navegación:** "Fotos" aparece también en las bodas gratis.
- **Álbum apagado:** `AlbumSalesPanel`, con `standalone`:
  - el precio grande dice $499 y el botón "Activar mi álbum · $499";
  - el paso "Lo activamos" dice "$499";
  - en la venta de una boda gratis no se usa "Comparte tus fotos desde tu invitación". Se dice "Tus invitados entran con el QR de las mesas o con el link que les mandes por WhatsApp.";
  - el mensaje de WhatsApp a Invyta dice que la pareja quiere el álbum sin invitación.
  - el texto principal suma "No necesitas invitación con nosotros.";
  - las preguntas frecuentes empiezan con "¿Necesito tener mi invitación con Invyta?" (`ALBUM_STANDALONE_PANEL_FAQ`).
- **Diseño:** canvas `https://claude.ai/artifact/EKcCEpukK3Honn2oDjDFqx`.
- **Álbum activo:**
  - todo lo del spec 29 (compartir, modo, fechas, QR, galería);
  - la tarjeta **"Estilo del álbum"** muestra 4 opciones con su miniatura (Clásico, Moderno, Botánica, Jardín) y la elegida marcada. Al elegir otra se guarda (`PATCH { style }`) y el aviso dice "Listo. Tu álbum ya se ve con el estilo {nombre}.";
  - la tarjeta del QR descarga el diseño con el estilo elegido.

### Lista de invitados de una boda gratis con el álbum activo

- **Cada invitado** tiene un ícono de WhatsApp: "Enviar link del álbum".
- **El modal** reutiliza `WhatsAppSendModal` con `kind: 'album'`, el texto de arriba ya escrito y editable, y el teléfono del invitado si lo tiene.
- **Con el álbum apagado** no aparece el ícono.

### Página del invitado (`/fotos`)

- **Es la misma página del spec 29**, con el estilo elegido.
- **Sin invitación:** no hay botón para volver a la invitación ni referencias a ella.

### Operador

- **`NewWeddingModal`** tiene arriba un selector "Tipo": "Con invitación" o "Solo álbum de fotos".
  - **Con "Solo álbum de fotos":** se oculta el selector de template y se crea la boda gratis con el álbum activo.
  - **El mensaje de bienvenida** que se copia al final dice que entren a su panel, sección Fotos.
- **`SettingsModal`:** el interruptor del álbum aparece también en bodas gratis.

### Anuncio

- **`/album-de-fotos`:**
  - **Precio:** solo $499 MXN, pago único, "Se agrega a tu invitación de Invyta o funciona solo…" y el enlace "Cómo empezar sin invitación".
  - **Sección "¿No tienes invitación con nosotros?":** crea tu cuenta gratis (link a `/admin`) o escríbenos por WhatsApp.
  - **Pregunta frecuente nueva** en `ALBUM_FAQ`: "¿Puedo contratar el álbum sin invitación?" Respuesta: "Sí. Crea tu cuenta gratis, entra a la sección Fotos y escríbenos por WhatsApp para activarlo. Cuesta $499 MXN, pago único."
  - **Descripción de la página** (metadata) actualizada con ambos precios.
- **Banner de la landing (`AlbumBanner`):** suma "No necesitas tener tu invitación con nosotros." Sigue sin precio.
- **Onboarding (`auth-ui.tsx`):** en "Lo que podrás hacer", una tercera característica: "Álbum de fotos de tus invitados", "Tus invitados suben sus fotos con un QR. Es un extra que activas cuando quieras."

## Plan de implementación

1. **Datos y lógica.** `style` en `PhotoAlbumConfig`, `isAlbumEnabled` sin el tier, `albumStyleId`, `ALBUM_PRICE`, tipo `'album'` y `buildGuestAlbumUrl` en `lib/whatsapp.ts`, y los eventos nuevos.
   - Prueba: `npm run build` sin errores. Una boda gratis con `photoAlbum.enabled` da fase `'open'` el día de la boda. `albumStyleId` da `'template-02'` sin `style`, y el `template.id` en una boda con diseño.
2. **API.**
   - `GET /api/album` usa `albumStyleId`.
   - `PATCH /api/panel/album` acepta `style`.
   - `PATCH /api/admin/weddings` deja activar el álbum en bodas gratis.
   - `POST /api/admin/weddings` acepta `albumOnly`.
   - Prueba: con una boda gratis de prueba, activar el álbum desde la API de operador responde 200, y `PATCH { style: 'template-04' }` responde 200. En una boda con diseño, `PATCH { style }` responde 409 `style_locked`.
3. **Operador.** Selector "Tipo" en `NewWeddingModal` e interruptor del álbum en `SettingsModal` para bodas gratis.
   - Prueba: crear una boda "Solo álbum" la deja gratis, con el álbum activo y el correo ligado. La pareja la ve en "Mis invitaciones".
4. **Panel de la boda gratis.** "Fotos" en la navegación, `AlbumSalesPanel` con `standalone` ($499 y la nota), y la tarjeta "Estilo del álbum".
   - Prueba: una boda gratis sin álbum ve la venta a $499. Con el álbum activo ve el panel completo. Al cambiar el estilo cambian `/fotos` y el QR con diseño.
5. **Links personales.** Ícono de WhatsApp en la lista de invitados de una boda gratis con el álbum activo, con `WhatsAppSendModal` en `kind: 'album'`.
   - Prueba: el mensaje trae el nombre, la fecha y `https://www.invyta.me/wedding/{id}/fotos?guest={guestId}`. Al abrir ese link, `/fotos` saluda al invitado y le atribuye sus fotos.
6. **Anuncio.** Precios centralizados en el panel y en `/album-de-fotos`, la sección y la pregunta frecuente nuevas, la frase del banner y la característica del onboarding.
   - Prueba: `npm run build` y `npm run lint` sin errores, y ningún "$399" escrito a mano fuera de `ALBUM_PRICE`.

## Criterios de aceptación

- [ ] Una boda gratis muestra "Fotos" en el panel.
- [ ] Sin álbum, la boda gratis ve la venta a $499, sin mencionar el precio con invitación.
- [ ] Una boda con diseño ve la venta con $499 tachado y $399.
- [ ] `/album-de-fotos` solo muestra $499 y no menciona el precio con invitación.
- [ ] El operador puede encender el álbum en una boda gratis desde los ajustes de la boda.
- [ ] El operador puede crear una boda "Solo álbum de fotos", que queda gratis, sin template, con el álbum activo y el correo ligado.
- [ ] En una boda gratis con el álbum activo, `/fotos` funciona con el QR general y con `?guest=`, con las mismas reglas del spec 29: ventana, 30 por invitación o teléfono, tope de 2,000, modos, revelado y cierre.
- [ ] La pareja de una boda gratis puede cambiar el estilo del álbum en cualquier fase menos `'expired'`, y `/fotos` y el QR con diseño lo reflejan.
- [ ] En una boda con diseño no aparece la tarjeta "Estilo del álbum", y la API responde 409 `style_locked` si se intenta.
- [ ] En la lista de invitados de una boda gratis con el álbum activo, cada invitado tiene "Enviar link del álbum" por WhatsApp, con el mensaje editable y su link personal. Con el álbum apagado, no aparece.
- [ ] Si una boda solo álbum recibe template, conserva el álbum y sus fotos, y `/fotos` pasa al diseño del template.
- [ ] `/album-de-fotos` muestra ambos precios, la sección "¿No tienes invitación con nosotros?" y la pregunta frecuente nueva.
- [ ] El banner de la landing dice que no hace falta invitación, sin precio.
- [ ] El onboarding de cuenta nueva menciona el álbum de fotos en "Lo que podrás hacer".
- [ ] Los precios del álbum salen solo de `ALBUM_PRICE`.

## Decisiones tomadas y descartadas

- **Sí: el álbum solo vive sobre la boda gratis.** Ya existe con nombres, fecha, invitados y dueño, y la pareja la crea sola. No hace falta otro tipo de cuenta ni otro modelo de datos.
  - **No:** un tier nuevo (`'album'`). Habría que tocar todos los lugares que distinguen `free` y `template`.
- **Sí: $499 solo y $399 con invitación.** Decisión del usuario: premia comprar los dos, y el álbum solo puede ser la puerta de entrada a la invitación.
  - **Sí: el precio público es $499; los $399 solo se ven dentro del panel de una boda con invitación, con $499 tachado.** Decisión posterior del usuario.
  - **No:** anunciar en público (ni en el panel gratis) que con invitación cuesta menos.
- **Sí: pago por WhatsApp y activación del operador**, igual que en el spec 29. Pago en línea queda para un spec propio.
- **Sí: el operador puede crear la boda solo álbum.** Para quien escribe directo por WhatsApp sin haberse registrado.
- **Sí: la pareja elige entre los 4 estilos y lo cambia cuando quiera.** Solo cambia cómo se ve; las fotos no se tocan.
  - **No:** foto de portada. Decisión del usuario; los encabezados ya funcionan sin ella.
- **Sí: links personales por WhatsApp, invitado por invitado.** Reutiliza el modal del spec 28 con otro mensaje.
  - **No:** importar invitados desde archivo en bodas gratis. Sigue siendo de las bodas con diseño.
- **Sí: al pasar a invitación conserva el álbum, sin crédito.** Decisión del usuario. Es la misma boda, así que no hay que migrar nada.
- **Sí: se anuncia en `/album-de-fotos`, el panel gratis, el onboarding y el banner de la landing.** Decisión del usuario. El banner sigue sin precio, como en el spec 29.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Alguien se activa el álbum en una boda gratis escribiendo `photoAlbum.enabled` desde el cliente, porque las reglas de `weddings` están abiertas. | Igual que en el spec 29: se acepta por ahora y se cierra junto con el endurecimiento de las reglas. Ahora aplica también a bodas gratis, que cualquiera puede crear. |
| Abuso: cuentas gratis que se activan el álbum sin pagar y suben fotos. | El tope de 2,000 fotos, la ventana de 3 semanas y el límite por teléfono acotan el costo de cada boda. Se revisa el número de álbumes activos contra los pagos registrados. |
| La pareja cambia el estilo después de imprimir el QR con diseño. | El QR apunta a la misma URL y sigue funcionando. Solo el arte impreso queda con el estilo anterior. |
| Las bodas gratis pueden no tener `couple.*.name` completos. | `POST /api/weddings/free` y el operador ya exigen ambos nombres. |
| La boda gratis no tiene idioma de invitación. | El link y el mensaje usan el `language` del invitado, igual que en el spec 28, y español por defecto. |

## Lo que **no** está en este spec

- Pago en línea y activación automática.
- Foto de portada del álbum.
- Importación de invitados en bodas gratis.
- Slideshow, videos y borrado automático de fotos al vencer.
