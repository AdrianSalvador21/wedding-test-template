# 🔥 Configuración de Firebase para Invitaciones de Boda

## 📋 Pasos para configurar Firebase

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Iniciar sesión en Firebase
```bash
firebase login
```

### 3. Configurar el proyecto
```bash
# En el directorio del proyecto
firebase use --add
# Selecciona tu proyecto de Firebase
```

### 4. Desplegar las reglas de Firestore
```bash
# Opción 1: Usar el script automatizado
node deploy-rules.js

# Opción 2: Comando directo
firebase deploy --only firestore:rules
```

### 5. Desplegar los índices (opcional pero recomendado)
```bash
firebase deploy --only firestore:indexes
```

## 🔐 Reglas de Firestore Configuradas

### Colección `weddings`
- ✅ **Lectura pública**: Los invitados pueden ver las invitaciones
- ✅ **Escritura abierta**: El admin puede crear/editar (⚠️ temporal)
- ✅ **Creación libre**: Se pueden crear nuevas bodas

### Colección `rsvp`
- ✅ **Lectura pública**: Para mostrar estadísticas
- ✅ **Escritura libre**: Los invitados pueden confirmar asistencia
- ❌ **No eliminación**: Solo admin puede eliminar

### Colección `guests`
- ✅ **Lectura pública**: Información básica de invitados
- ✅ **Escritura admin**: Solo admin modifica invitados

## ⚠️ IMPORTANTE para Producción

### Seguridad Recomendada
```javascript
// En lugar de: allow write: if true;
// Usar autenticación:
allow write: if request.auth != null && request.auth.token.admin == true;
```

### Variables de Entorno
Crea un archivo `.env.local` con tu configuración:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

## 🧪 Testing con Emulador (Desarrollo)

### Iniciar emulador
```bash
firebase emulators:start
```

### URLs del emulador
- **Firestore**: http://localhost:8080
- **Admin UI**: http://localhost:4000
- **Hosting**: http://localhost:5000

## 🚀 Comandos Útiles

```bash
# Ver proyecto actual
firebase use

# Cambiar proyecto
firebase use otro-proyecto

# Ver reglas actuales
firebase firestore:rules

# Desplegar todo
firebase deploy

# Solo reglas
firebase deploy --only firestore:rules

# Solo hosting
firebase deploy --only hosting
```

## 📊 Estructura de Datos

### Documento Wedding
```javascript
{
  id: "maria-carlos-2025",
  isActive: true,
  couple: { ... },
  event: { ... },
  timeline: [...],
  // ... resto de campos del admin
}
```

### Documento RSVP
```javascript
{
  id: "guest-123",
  weddingId: "maria-carlos-2025",
  guestName: "Juan Pérez",
  email: "juan@email.com",
  status: "confirmed", // confirmed, declined, pending
  numberOfGuests: 2,
  dietaryRestrictions: "Vegetariano",
  message: "¡Felicidades!",
  createdAt: "2025-01-15T10:30:00Z"
}
```

## 🔧 Troubleshooting

### Error: "Permission denied"
- Verifica que las reglas estén desplegadas
- Confirma que el proyecto esté configurado correctamente

### Error: "Project not found"
- Ejecuta `firebase use --add` y selecciona el proyecto correcto

### Error: "Firebase CLI not found"
- Instala Firebase CLI: `npm install -g firebase-tools`
