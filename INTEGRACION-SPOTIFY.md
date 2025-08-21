# 🎵 Integración de Música con Spotify

## 📋 **Resumen**

Se ha implementado una integración completa con Spotify que permite reproducir música de fondo en las invitaciones de boda. La funcionalidad incluye controles personalizados, autoplay inteligente, y información dinámica de canciones.

---

## 🔧 **Configuración Requerida**

### **1. Variables de Entorno**
Crea o actualiza tu archivo `.env.local`:
```bash
# Spotify Integration
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=55e5ac2b0af941119ca9b0a36b183bdf
SPOTIFY_CLIENT_SECRET=2351159e67b9438792beb082d1912069

# Development
NODE_ENV=development
NEXT_PUBLIC_USE_MOCK=true
```

### **2. Spotify App Configuration**
- **App Name**: Wedding Invitation Music
- **Client ID**: `55e5ac2b0af941119ca9b0a36b183bdf`
- **Client Secret**: `2351159e67b9438792beb082d1912069`
- **Redirect URIs**:
  - `http://localhost:3000` (desarrollo)
  - `http://localhost:3001` (desarrollo alternativo)
  - `https://tu-dominio.com` (producción)

---

## 🏗️ **Arquitectura Implementada**

### **Componentes Creados**
1. **`MusicPlayer.tsx`** - Reproductor visual con controles
2. **`useMusic.ts`** - Hook personalizado para lógica de música
3. **`spotifyApi.ts`** - Servicio para API de Spotify

### **Tipos TypeScript**
```typescript
interface MusicConfig {
  enabled: boolean;
  spotifyTrackId?: string;
  spotifyPlaylistId?: string;
  title?: string;
  artist?: string;
  autoplay?: boolean;
  volume?: number; // 0-1
  showControls?: boolean;
  startTime?: number; // Tiempo de inicio en segundos
}

// Agregado a WeddingData
interface WeddingData {
  // ... campos existentes
  music?: MusicConfig;
}
```

---

## 🎯 **Funcionalidades Implementadas**

### **✅ Reproductor de Fondo**
- **Posición**: Fixed bottom-right
- **Diseño**: Minimalista y elegante
- **Responsive**: Se adapta a móvil y desktop
- **Autoplay**: Después de interacción del usuario

### **✅ Controles Personalizados**
- **Play/Pause**: Botón circular con iconos SVG
- **Volumen**: Slider solo en desktop
- **Info**: Título y artista de la canción
- **Spotify Link**: Enlace directo a Spotify

### **✅ Integración con API**
- **Información dinámica**: Obtiene datos reales de Spotify
- **Fallback**: Usa datos mock si API falla
- **Caching**: Token de acceso se cachea automáticamente
- **Error handling**: Manejo graceful de errores

### **✅ UX Optimizada**
- **Autoplay inteligente**: Solo después de interacción
- **Indicador de carga**: Spinner mientras carga
- **Accesibilidad**: Labels y controles accesibles
- **Performance**: Lazy loading del iframe

---

## 🎵 **Configuración de Canciones**

### **Template Friends-Test (Configurado)**
```typescript
music: {
  enabled: true,
  spotifyTrackId: '4iV5W9uYEdYUVa79Axb7Rh', // "Perfect" by Ed Sheeran
  title: 'Perfect',
  artist: 'Ed Sheeran',
  autoplay: true,
  volume: 0.3,
  showControls: false,
  startTime: 0
}
```

### **Canciones Populares para Bodas (Spotify IDs)**
```typescript
// Canciones clásicas de boda
'4iV5W9uYEdYUVa79Axb7Rh' // Perfect - Ed Sheeran
'6RUKPb4LETWmmr3iAEQktW' // All of Me - John Legend  
'1zwMYTA5nlNjZxYrvBB2pW' // A Thousand Years - Christina Perri
'3BQHpFgAp4l80e1XslIjNI' // Marry Me - Train
'0y6kdSRCVQhSsHSpWvTiqm' // At Last - Etta James

// Canciones románticas modernas
'7qiZfU4dY1lWllzX7mkmht' // Thinking Out Loud - Ed Sheeran
'3Kkjo3cT83cw09VJyrLNwX' // Make You Feel My Love - Adele
'4RCWB3V8V0dignt99LZ8vH' // Can't Help Myself - Four Tops
```

---

## 🔧 **Cómo Agregar Música a Otras Bodas**

### **1. Obtener Spotify Track ID**
```bash
# Desde URL de Spotify:
# https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
# El ID es: 4iV5W9uYEdYUVa79Axb7Rh
```

### **2. Agregar a Mock Data**
```typescript
export const mockWeddingExample: WeddingData = {
  // ... otros campos
  music: {
    enabled: true,
    spotifyTrackId: '4iV5W9uYEdYUVa79Axb7Rh',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    autoplay: true,
    volume: 0.3,
    showControls: false, // true para mostrar reproductor completo
    startTime: 0
  },
  // ... resto de campos
};
```

### **3. Configuraciones Recomendadas**

#### **Música Ambiente (Recomendado)**
```typescript
music: {
  enabled: true,
  spotifyTrackId: 'TRACK_ID',
  autoplay: true,
  volume: 0.2, // Volumen bajo para ambiente
  showControls: false, // Solo controles mínimos
  startTime: 30 // Empezar en el coro
}
```

#### **Reproductor Completo**
```typescript
music: {
  enabled: true,
  spotifyTrackId: 'TRACK_ID',
  autoplay: false, // Usuario decide cuándo reproducir
  volume: 0.5,
  showControls: true, // Mostrar reproductor completo de Spotify
  startTime: 0
}
```

#### **Playlist de Boda**
```typescript
music: {
  enabled: true,
  spotifyPlaylistId: 'PLAYLIST_ID',
  title: 'Nuestra Playlist de Boda',
  autoplay: true,
  volume: 0.3,
  showControls: false
}
```

---

## 🧪 **Testing**

### **URLs de Prueba**
```bash
# Con música habilitada
http://localhost:3001/wedding/friends-test
http://localhost:3001/wedding/friends-test?guest=guest-001

# Verificar que aparece el reproductor en bottom-right
# Verificar que funciona el botón play/pause
# Verificar que se puede ajustar volumen (desktop)
```

### **Casos de Prueba**
1. **✅ Autoplay después de interacción**
2. **✅ Controles responsive**
3. **✅ Fallback si Spotify API falla**
4. **✅ Información dinámica de canciones**
5. **✅ Compatible con todos los temas**

---

## 🚀 **Deployment en Producción**

### **Vercel Configuration**
```bash
# Variables de entorno en Vercel
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=55e5ac2b0af941119ca9b0a36b183bdf
SPOTIFY_CLIENT_SECRET=2351159e67b9438792beb082d1912069
NEXT_PUBLIC_USE_MOCK=true
NODE_ENV=production
```

### **Consideraciones de Producción**
- **CORS**: Spotify embeds funcionan en cualquier dominio
- **HTTPS**: Requerido para autoplay en la mayoría de navegadores
- **Performance**: Iframe se carga lazy
- **Cache**: Headers optimizados para assets
- **Mobile**: Funciona en iOS y Android

---

## ⚠️ **Limitaciones y Consideraciones**

### **Autoplay**
- **Navegadores modernos** bloquean autoplay sin interacción del usuario
- **Solución implementada**: Autoplay se activa después del primer click/scroll/touch
- **iOS Safari**: Puede requerir interacción adicional

### **Spotify Free vs Premium**
- **Spotify Free**: Funciona con anuncios
- **Spotify Premium**: Experiencia completa sin interrupciones
- **No login requerido**: Los embeds funcionan sin autenticación del usuario

### **Rate Limits**
- **Spotify API**: 100 requests por minuto
- **Caching implementado**: Token se reutiliza por 1 hora
- **Fallback**: Usa datos mock si API no está disponible

---

## 🎯 **Próximos Pasos**

### **Mejoras Futuras**
1. **Playlist automática**: Reproducir múltiples canciones
2. **Sincronización**: Música que cambie según la sección
3. **Preferencias de usuario**: Guardar volumen en localStorage
4. **Analytics**: Tracking de reproducción
5. **Crossfade**: Transiciones suaves entre canciones

### **Dashboard Integration**
- Agregar campo de música en dashboard de configuración
- Selector de canciones desde Spotify
- Preview de canciones antes de guardar
- Validación de IDs de Spotify

---

## 📱 **Experiencia de Usuario**

### **Desktop**
- Reproductor flotante en bottom-right
- Controles completos (play/pause/volume)
- Información de canción visible
- Enlace directo a Spotify

### **Mobile**
- Reproductor compacto
- Solo botón play/pause
- Información mínima
- Touch-friendly

### **Accesibilidad**
- Labels descriptivos en todos los controles
- Keyboard navigation
- Screen reader compatible
- Contraste adecuado

---

*La integración está lista para usar. Solo necesitas configurar las variables de entorno y agregar configuración de música a los templates que desees.*
