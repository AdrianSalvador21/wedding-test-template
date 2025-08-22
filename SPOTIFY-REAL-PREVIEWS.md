# 🎵 Implementación de Previews Reales de Spotify

## 🎯 **Opción: Spotify Web Playback SDK**

Para obtener **previews reales de 30 segundos** de canciones específicas solicitadas por clientes:

### **Implementación:**

```typescript
// 1. Cargar SDK de Spotify
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://sdk.scdn.co/spotify-player.js';
  script.async = true;
  document.body.appendChild(script);

  window.onSpotifyWebPlaybackSDKReady = () => {
    const player = new window.Spotify.Player({
      name: 'Wedding Invitation Player',
      getOAuthToken: cb => { cb(token); },
      volume: 0.3
    });
    
    player.connect();
  };
}, []);

// 2. Reproducir canción específica
const playSpecificSong = async (trackId: string) => {
  await fetch(`https://api.spotify.com/v1/me/player/play`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      uris: [`spotify:track:${trackId}`],
      position_ms: 0 // Empezar desde el inicio
    })
  });
};
```

### **Flujo para Cliente:**

1. **Cliente solicita**: "Quiero 'Perfect' de Ed Sheeran"
2. **Tú obtienes el Track ID**: `0tgVpDi06FyKpA1z0VMD4v`
3. **Actualizas el mock data**:
   ```typescript
   music: {
     enabled: true,
     spotifyTrackId: '0tgVpDi06FyKpA1z0VMD4v',
     title: 'Perfect',
     artist: 'Ed Sheeran',
     useRealSpotify: true // Nueva opción
   }
   ```

### **Pros:**
- ✅ **Preview real de 30 segundos** de la canción exacta
- ✅ **Calidad de audio original** de Spotify
- ✅ **Cualquier canción** disponible en Spotify

### **Contras:**
- ❌ **Requiere que invitados tengan Spotify Premium**
- ❌ **Login obligatorio** - experiencia más compleja
- ❌ **Dependiente de Spotify** - si falla, no funciona

---

## 🎯 **Opción: Web Scraping (Técnica)**

Para obtener previews **sin requerir login**:

```typescript
// Usar spotify-url-info para scraping
import { getData } from 'spotify-url-info';

const getSpotifyPreview = async (trackId: string) => {
  try {
    const data = await getData(`https://open.spotify.com/track/${trackId}`);
    return data.preview; // URL del preview de 30 segundos
  } catch (error) {
    return null; // Fallback a audio de demostración
  }
};
```

### **Pros:**
- ✅ **Preview real** de la canción exacta
- ✅ **No requiere login** de invitados
- ✅ **Funciona con cualquier canción**

### **Contras:**
- ❌ **Puede romperse** si Spotify cambia su web
- ❌ **Zona gris legal** - scraping
- ❌ **Menos confiable** que API oficial

---

## 🎯 **Opción: Híbrida (RECOMENDADA)**

**Combinar ambas estrategias**:

```typescript
const MusicPlayer = ({ music }) => {
  const [audioSource, setAudioSource] = useState('demo');
  
  useEffect(() => {
    const setupMusic = async () => {
      if (music.useRealSpotify) {
        // Intentar obtener preview real
        const realPreview = await getSpotifyPreview(music.spotifyTrackId);
        if (realPreview) {
          setPreviewUrl(realPreview);
          setAudioSource('spotify');
          return;
        }
      }
      
      // Fallback a audio de demostración
      const demoUrl = WEDDING_SONGS_AUDIO[music.spotifyTrackId];
      setPreviewUrl(demoUrl);
      setAudioSource('demo');
    };
    
    setupMusic();
  }, [music]);
  
  return (
    <div>
      {/* Widget igual - mismo diseño */}
      <button onClick={togglePlay}>🎵</button>
      
      {/* Indicador opcional */}
      {audioSource === 'spotify' && (
        <small>♪ Preview de Spotify</small>
      )}
    </div>
  );
};
```

---

## 💼 **Para tu Negocio:**

### **Flujo Recomendado:**

1. **Cliente solicita canción específica**
2. **Tú ofreces dos opciones**:
   - 🎵 **Premium**: Preview real de Spotify (requiere login de invitados)
   - 🎶 **Estándar**: Audio de demostración elegante (sin login)

3. **Implementas según la elección**:
   ```typescript
   // Configuración por cliente
   music: {
     enabled: true,
     spotifyTrackId: '0tgVpDi06FyKpA1z0VMD4v',
     title: 'Perfect',
     artist: 'Ed Sheeran',
     useRealSpotify: false, // true para Premium, false para Estándar
   }
   ```

### **Ventajas:**
- ✅ **Flexibilidad total** - cada cliente elige
- ✅ **Dos niveles de servicio** - más opciones de pricing
- ✅ **Siempre funciona** - fallback garantizado

---

## 🚀 **¿Implementamos la Opción Híbrida?**

Puedo implementar esto ahora mismo si quieres ofrecer ambas opciones a tus clientes.
