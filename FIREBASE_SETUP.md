# 🔥 Configuración Firebase para RSVP

## 📋 Resumen

Este documento explica cómo configurar Firebase Firestore para que funcione la confirmación de asistencia (RSVP) en el sistema de invitaciones de boda.

## 🚀 Configuración Inicial

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita **Firestore Database**
4. Configura las reglas de seguridad (ver sección de Reglas)

### 2. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

**¿Dónde encontrar estas credenciales?**
1. En Firebase Console, ve a Project Settings (⚙️)
2. En la pestaña "General", busca "Your apps"
3. Si no tienes una app web, crea una
4. Copia los valores de `firebaseConfig`

## 🗄️ Estructura de Datos en Firestore

### Colecciones Principales

#### **`guests`** - Información de Invitados
```
/guests/{weddingId}_{guestId}
```

**Documento ejemplo:**
```json
{
  "id": "guest-001",
  "weddingId": "friends-test",
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "+1234567890",
  "plusOneAllowed": true,
  "rsvpStatus": "pending", // "pending" | "confirmed" | "declined"
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

#### **`rsvps`** - Confirmaciones de Asistencia
```
/rsvps/{rsvpId}
```

**Documento ejemplo:**
```json
{
  "id": "rsvp_12345",
  "weddingId": "friends-test",
  "guestId": "guest-001",
  "guestName": "Juan Pérez",
  "guestEmail": "juan@email.com",
  "attending": true,
  "plusOne": {
    "attending": true,
    "name": "María García"
  },
  "dietaryRestrictions": "Vegetariano",
  "message": "¡Muy emocionados por la boda!",
  "submittedAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

## 🔒 Reglas de Seguridad de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura y escritura en guests para cualquier usuario
    // En producción, deberías agregar autenticación
    match /guests/{guestId} {
      allow read, write: if true;
    }
    
    // Permitir lectura y escritura en rsvps para cualquier usuario
    // En producción, deberías agregar autenticación
    match /rsvps/{rsvpId} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ IMPORTANTE:** Estas reglas son para desarrollo. En producción, implementa autenticación adecuada.

## 🔧 Uso del Sistema RSVP

### URL de Invitación

El sistema funciona con URLs que incluyen el parámetro `guest`:

```
https://tu-dominio.com/es/wedding/friends-test?guest=guest-001
```

### Flujo de Funcionamiento

1. **Carga inicial:** El componente RSVP obtiene el `guestId` de la URL
2. **Validación:** Verifica si el invitado existe en Firestore
3. **Creación automática:** Si no existe, crea un registro temporal
4. **Pre-llenado:** Si ya confirmó, muestra la información existente
5. **Envío:** Guarda/actualiza la confirmación en Firestore

### Servicios Disponibles

El archivo `services/rsvpService.ts` incluye:

- `getGuest(weddingId, guestId)` - Obtener información del invitado
- `upsertGuest(guest)` - Crear/actualizar invitado
- `getRSVP(weddingId, guestId)` - Obtener confirmación existente
- `saveRSVP(rsvpData)` - Guardar/actualizar confirmación
- `getWeddingRSVPs(weddingId)` - Obtener todas las confirmaciones de una boda
- `validateGuest(weddingId, guestId)` - Validar invitado

## 📱 Características del RSVP

### ✅ Funcionalidades Implementadas

- **Carga automática** de información del invitado
- **Validación** de invitados existentes
- **Creación temporal** de invitados para pruebas
- **Pre-llenado** del formulario con datos existentes
- **Acompañante** (plus one) opcional
- **Restricciones dietéticas** y mensajes personalizados
- **Estados de carga** y manejo de errores
- **Confirmación visual** con detalles del RSVP
- **Actualización** de confirmaciones existentes

### 🎯 Estados del Formulario

1. **Cargando:** Spinner mientras obtiene datos del invitado
2. **Error:** Mensaje de error con opción de reintentar
3. **Formulario:** Campos pre-llenados si ya confirmó
4. **Enviando:** Indicador de carga durante envío
5. **Éxito:** Confirmación con detalles del RSVP

## 🧪 Pruebas

### URLs de Prueba

```bash
# Invitado nuevo (se crea automáticamente)
http://localhost:3000/es/wedding/friends-test?guest=guest-001

# Invitado que ya confirmó (se pre-llena el formulario)
http://localhost:3000/es/wedding/friends-test?guest=guest-002
```

### Datos de Prueba

Puedes crear invitados manualmente en Firestore Console o dejar que el sistema los cree automáticamente.

## 🚨 Solución de Problemas

### Error: "Firebase credentials not configured"
- Verifica que el archivo `.env.local` existe y tiene todas las variables
- Reinicia el servidor de desarrollo después de agregar variables

### Error: "Permission denied"
- Verifica las reglas de Firestore
- Asegúrate de que las reglas permitan lectura/escritura

### Error: "Guest not found"
- El sistema crea invitados automáticamente, pero verifica la URL
- Asegúrate de que el parámetro `guest` esté presente

## 📊 Dashboard de Administración

Para ver todas las confirmaciones, puedes usar Firebase Console o crear un dashboard personalizado usando los servicios disponibles:

```typescript
// Obtener todas las confirmaciones de una boda
const rsvps = await rsvpService.getWeddingRSVPs('friends-test');

// Obtener todos los invitados
const guests = await rsvpService.getWeddingGuests('friends-test');
```

## 🔄 Próximos Pasos

1. **Autenticación:** Implementar autenticación para mayor seguridad
2. **Dashboard:** Crear panel de administración para los novios
3. **Notificaciones:** Enviar emails de confirmación automáticos
4. **Analytics:** Estadísticas de confirmaciones
5. **Backup:** Sistema de respaldo automático

---

**¿Necesitas ayuda?** Revisa la documentación de Firebase o contacta al desarrollador.
