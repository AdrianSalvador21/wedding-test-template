# 🔍 Consultas Firebase - RSVP Sistema

## 📊 Estructura de Datos Simplificada

### Colección `rsvps`
Cada documento representa una confirmación de asistencia enlazada a una boda específica:

```json
{
  "id": "auto-generated-id",
  "weddingId": "friends-test",  // ← ENLACE CLAVE CON LA BODA
  "guestId": "guest-001",
  "guestName": "Juan Pérez",
  "guestEmail": "juan@email.com",
  "attending": true,
  "plusOne": {
    "attending": true,
    "name": "María García"
  },
  "dietaryRestrictions": "Vegetariano",
  "message": "¡Muy emocionados!",
  "submittedAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

## 🔧 Consultas desde Firebase Console

### Ver todas las confirmaciones de una boda específica:
```javascript
// En Firebase Console > Firestore > Consulta
// Campo: weddingId
// Operador: ==
// Valor: friends-test
```

### Ver confirmaciones que asisten:
```javascript
// Consulta compuesta:
// weddingId == "friends-test"
// AND attending == true
```

### Ver confirmaciones con acompañante:
```javascript
// weddingId == "friends-test"  
// AND plusOne.attending == true
```

## 📱 URLs de Prueba

### Para diferentes invitados:
```
http://localhost:3000/es/wedding/friends-test?guest=guest-001
http://localhost:3000/es/wedding/friends-test?guest=guest-002
http://localhost:3000/es/wedding/friends-test?guest=maria-perez
http://localhost:3000/es/wedding/friends-test?guest=juan-garcia
```

## 🎯 Flujo de Funcionamiento

1. **Invitado accede** → URL con `?guest=su-id`
2. **Sistema verifica** → Si ya confirmó antes (busca en Firebase)
3. **Si ya confirmó** → Muestra confirmación existente
4. **Si no confirmó** → Muestra formulario vacío
5. **Al enviar** → Guarda en Firebase con `weddingId` como enlace
6. **Datos guardados** → Enlazados a la boda específica

## 📊 Consultar datos programáticamente

```typescript
// Obtener todas las confirmaciones de una boda
const rsvps = await rsvpService.getWeddingRSVPs('friends-test');

// Obtener estadísticas
const stats = await rsvpService.getWeddingStats('friends-test');
console.log(`Total: ${stats.total}, Asisten: ${stats.attending}`);

// Verificar confirmación específica
const rsvp = await rsvpService.getRSVP('friends-test', 'guest-001');
```

## 🔒 Reglas de Firestore Actuales

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rsvps/{rsvpId} {
      allow read, write: if true;
    }
  }
}
```

## 📈 Dashboard de Estadísticas

Para crear un dashboard simple, puedes consultar:

```typescript
// Ejemplo de estadísticas por boda
const weddingIds = ['friends-test', 'maria-carlos-2025'];

for (const weddingId of weddingIds) {
  const stats = await rsvpService.getWeddingStats(weddingId);
  console.log(`Boda ${weddingId}:`, stats);
}
```

## 🚀 Próximos pasos

1. **Dashboard web** para ver confirmaciones
2. **Exportar a Excel** las confirmaciones  
3. **Notificaciones email** automáticas
4. **Recordatorios** para invitados que no han confirmado

---

**El sistema está listo para recibir confirmaciones y enlazarlas automáticamente con el ID de la boda! 🎉**
