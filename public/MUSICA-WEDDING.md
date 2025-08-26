# 🎵 Sistema de Música Dinámico para Bodas

## 🎯 Cómo Funciona

El sistema de música dinámico carga automáticamente archivos de música personalizados para cada boda desde la carpeta `public/assets/music/`.

### 📁 Estructura de Archivos

Para cada boda, coloca un archivo MP3 con el ID de la boda:

```
public/assets/music/
├── [weddingId].mp3          # Archivo de música para la boda
├── friends-test.mp3         # Ejemplo: música para friends-test
├── maria-carlos-2025.mp3    # Ejemplo: música para maria-carlos-2025
└── ana-luis-2024.mp3        # Ejemplo: música para ana-luis-2024
```

### 🎶 Formato de Archivo

#### **Archivo de Música** (`[weddingId].mp3`)
- **Ubicación**: `public/assets/music/[weddingId].mp3`
- **Uso**: Música de fondo para el template de la boda
- **Formato**: MP3 (recomendado)
- **Calidad**: 128-320 kbps
- **Duración**: 3-5 minutos recomendado
- **Volumen**: Normalizado, no muy alto

## 🔄 Comportamiento del Sistema

### ✅ **Si existe archivo de música personalizada:**
- Carga `[weddingId].mp3` desde `public/assets/music/`
- Muestra el reproductor de música en el template
- Configuración automática: volumen 50%, controles visibles, sin autoplay

### ❌ **Si NO existe archivo personalizada:**
- Usa la música configurada en los datos de la boda (si existe)
- Si no hay música configurada, no muestra reproductor
- Fallback a sistema Spotify si está configurado

## 📝 Ejemplo Práctico

Para una boda con ID `friends-test`:

```
public/assets/music/friends-test.mp3
```

El sistema:
1. **Detecta** automáticamente el archivo
2. **Configura** el reproductor con título "Música de Boda"
3. **Muestra** controles de reproducción en el template
4. **Permite** al usuario reproducir/pausar la música

## 🚀 Implementación Técnica

### API Endpoint
- **Ruta**: `/api/wedding-music/[weddingId]`
- **Función**: Verifica si existe el archivo de música
- **Respuesta**: 
  ```json
  {
    "hasMusic": true,
    "musicUrl": "/assets/music/friends-test.mp3",
    "fileName": "friends-test.mp3"
  }
  ```

### Hook Personalizado
- **`useWeddingMusic()`**: Hook que maneja la carga dinámica
- **Prioridad**: Archivo personalizado > Música configurada > Sin música
- **Fallback**: Sistema robusto con múltiples niveles

### Componentes Afectados
- **WeddingTemplate.tsx**: Usa `useWeddingMusic()` hook
- **MusicPlayer.tsx**: Recibe configuración dinámica
- **Sistema existente**: Compatible con configuración actual

## 💡 Ventajas

- ✅ **Automático**: No requiere configuración manual
- ✅ **Fallback**: Siempre funciona con sistema existente
- ✅ **Personalizado**: Cada boda puede tener su música única
- ✅ **Optimizado**: Solo carga cuando existe el archivo
- ✅ **Compatible**: No rompe funcionalidad existente

## 🔧 Para Desarrolladores

El hook `useWeddingMusic(weddingId?)` retorna:

```typescript
interface WeddingMusicResult {
  music: MusicConfig | null;     // Configuración de música
  hasCustomMusic: boolean;       // Si usa archivo personalizado
}
```

### Configuración Automática
```typescript
const customMusic: MusicConfig = {
  enabled: true,
  fileName: "friends-test.mp3",
  title: "Música de Boda",
  artist: "Personalizada",
  autoplay: false,
  volume: 0.5,
  showControls: true,
  startTime: 0
}
```

## 📋 Lista de Verificación

Para agregar música a una boda:

- [ ] Archivo MP3 de buena calidad (128-320 kbps)
- [ ] Nombre del archivo: `[weddingId].mp3`
- [ ] Ubicación: `public/assets/music/`
- [ ] Duración apropiada (3-5 minutos)
- [ ] Volumen normalizado

## 🎵 Recomendaciones de Música

### Géneros Apropiados:
- **Instrumental**: Piano, cuerdas, acústico
- **Clásico**: Música clásica ligera
- **Jazz**: Jazz suave, bossa nova
- **Pop**: Versiones instrumentales de canciones populares
- **Ambiente**: Música ambiental, new age

### Evitar:
- Música con letra muy prominente
- Géneros muy específicos (metal, rap, etc.)
- Volúmenes muy altos
- Archivos de mala calidad

**¡El sistema está listo para usar! Solo necesitas colocar archivos MP3 en la carpeta correspondiente.** 🎉
