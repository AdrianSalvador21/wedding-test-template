# 🔥 Configuración Completa de Firebase

## 🚀 Configuración Rápida (Desarrollo)

### 1. Instalar y configurar Firebase CLI
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Iniciar sesión en Firebase
firebase login

# Configurar proyecto (ejecutar en el directorio del proyecto)
firebase use --add
```

### 2. Desplegar reglas de desarrollo
```bash
# Opción 1: Script automatizado
node deploy-rules.js

# Opción 2: Comando directo
firebase deploy --only firestore:rules
```

### 3. ¡Listo! El admin ya debería funcionar ✅

## 📁 Archivos Creados

- `firestore.rules` - Reglas permisivas para desarrollo
- `firestore.rules.production` - Reglas seguras para producción  
- `firebase.json` - Configuración del proyecto
- `firestore.indexes.json` - Índices para optimizar consultas
- `deploy-rules.js` - Script automatizado de despliegue

## 🔐 Reglas Actuales (Desarrollo)

```javascript
// PERMISIVO - Solo para desarrollo
match /weddings/{weddingId} {
  allow read: if true;    // ✅ Cualquiera puede leer
  allow write: if true;   // ✅ Cualquiera puede escribir
}

match /rsvp/{rsvpId} {
  allow read: if true;    // ✅ Cualquiera puede leer  
  allow create, update: if true; // ✅ Cualquiera puede crear/actualizar
}
```

## 🛡️ Para Producción (Futuro)

### Cambiar a reglas seguras:
```bash
# Copiar reglas de producción
cp firestore.rules.production firestore.rules

# Desplegar
firebase deploy --only firestore:rules
```

### Reglas de producción incluyen:
- ✅ Autenticación de admin requerida
- ✅ Validación de datos
- ✅ Permisos granulares por usuario
- ✅ Logs de auditoría
- ✅ Rate limiting implícito

## 🧪 Testing con Emulador

```bash
# Iniciar emulador local
firebase emulators:start

# URLs útiles:
# - Firestore UI: http://localhost:4000
# - Firestore API: http://localhost:8080
```

## 🔧 Troubleshooting

### ❌ Error: "Permission denied"
```bash
# Verificar proyecto actual
firebase use

# Verificar reglas desplegadas
firebase firestore:rules
```

### ❌ Error: "Project not found"
```bash
# Reconfigurar proyecto
firebase use --add
```

### ❌ Error: "Firebase CLI not found"
```bash
# Reinstalar CLI
npm install -g firebase-tools
```

## 📊 Estructura de Datos del Admin

### Wedding Document
```javascript
{
  id: "test-wedding",
  isActive: true,
  couple: {
    bride: { name: "María", ... },
    groom: { name: "Carlos", ... },
    story: { es: "...", en: "..." }
  },
  event: { date: "...", time: "...", ... },
  timeline: [...],
  gallery: [...],
  // ... todos los campos del admin
}
```

## ✅ Verificar que Funciona

1. **Abrir admin**: http://localhost:3002/es/admin/wedding-editor/test-wedding
2. **Llenar formulario** en cualquier sección
3. **Hacer clic en "Guardar"** 
4. **Verificar en Firebase Console** que se guardaron los datos

## 🎯 Próximos Pasos

1. **✅ Admin funcional** - Completado
2. **🔄 Integrar con template** - Hacer que el template use datos de Firebase
3. **🔐 Autenticación** - Añadir login de admin
4. **🚀 Deploy a producción** - Hosting en Firebase

---

**¿Necesitas ayuda?** Las reglas están configuradas para ser muy permisivas durante desarrollo. Una vez que todo funcione, podremos implementar seguridad robusta para producción.
