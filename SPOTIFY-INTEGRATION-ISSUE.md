# 🎵 Problema con la Integración de Spotify - Noviembre 2024

## 🚨 **Problema Identificado**

**Spotify eliminó las URLs de preview de 30 segundos** cuando se usa **Client Credentials Flow** en **noviembre de 2024**. Esto afecta a todas las aplicaciones que dependían de esta funcionalidad.

### **Síntomas:**
- ✅ Token de acceso se obtiene correctamente
- ✅ API calls devuelven 200 OK
- ✅ Metadata de las canciones se obtiene correctamente
- ❌ `preview_url` siempre retorna `null`

### **Logs Típicos:**
```
🔑 Token obtenido de Spotify
📊 Datos del track recibidos: {
  name: "Shape of You", 
  artist: "Ed Sheeran", 
  preview_url: null  // ❌ Siempre null
}
```

---

## 🔍 **Causa Raíz**

Según la comunidad de Spotify y GitHub Issues:
1. **Client Credentials Flow** ya no proporciona `preview_url`
2. **Authorization Code Flow** (requiere login del usuario) aún funciona
3. Cambio implementado por Spotify en noviembre 2024

---

## ✅ **Soluciones Disponibles**

### **1. Solución Actual (Implementada) - Audio de Demostración**
```typescript
// Mapeo de Track IDs a audio de demostración
const WEDDING_SONGS_AUDIO = {
  '4uLU6hMCjMI75M1A2tKUQC': 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  '6habFhsOp2NvshLv26DqMb': 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
  // ... más canciones
};
```

**Pros:**
- ✅ Funciona inmediatamente
- ✅ No requiere autenticación del usuario
- ✅ Perfecto para demos e invitaciones
- ✅ Controlable y predecible

**Contras:**
- ❌ No es la canción real
- ❌ Audio genérico

### **2. Authorization Code Flow (Requiere Login)**
```typescript
// Requiere implementar OAuth flow completo
const authUrl = `https://accounts.spotify.com/authorize?` +
  `response_type=code&` +
  `client_id=${clientId}&` +
  `scope=streaming&` +
  `redirect_uri=${redirectUri}`;
```

**Pros:**
- ✅ Acceso a previews reales de Spotify
- ✅ Funcionalidad completa de la API

**Contras:**
- ❌ Requiere que usuarios hagan login en Spotify
- ❌ Más complejo de implementar
- ❌ No ideal para invitaciones públicas

### **3. Web Scraping (Técnica Avanzada)**
```typescript
// Usar librerías como spotify-url-info
import { getData } from 'spotify-url-info';

const data = await getData(`https://open.spotify.com/track/${trackId}`);
```

**Pros:**
- ✅ Obtiene previews reales sin API
- ✅ No requiere autenticación

**Contras:**
- ❌ Puede romperse si Spotify cambia su web
- ❌ Viola términos de servicio potencialmente
- ❌ Menos confiable

---

## 🎯 **Recomendación para Invitaciones de Boda**

Para el caso específico de invitaciones de boda, **la Solución 1 (Audio de Demostración)** es la más práctica:

1. **Los invitados no esperan escuchar la canción exacta** - solo ambientación
2. **No requiere login** - los invitados pueden acceder directamente
3. **Funciona siempre** - sin depender de APIs externas
4. **Fácil de mantener** - controlamos el audio completamente

---

## 📋 **Estado Actual**

- ✅ **Implementado**: Audio de demostración por Track ID
- ✅ **Widget funcional**: Play/pause button minimalista
- ✅ **Autoplay**: Después de primera interacción del usuario
- ✅ **Documentado**: Explicación completa del problema

---

## 🔮 **Futuro**

Si en el futuro se requieren previews reales de Spotify:

1. **Implementar Authorization Code Flow**
2. **Usar Web Scraping con spotify-url-info**
3. **Esperar a que Spotify revierta los cambios** (poco probable)

---

## 📚 **Referencias**

- [Spotify Web API Issue #713](https://github.com/spotify/web-api/issues/713)
- [Community Discussion](https://community.spotify.com/t5/Spotify-for-Developers/Missing-Preview-URL-using-Client-Credentials/td-p/6492694)
- [Workaround Repository](https://github.com/rexdotsh/spotify-preview-url-workaround)

---

**Fecha de Actualización**: Diciembre 2024
**Estado**: Problema conocido y solucionado con audio de demostración
