'use client';

import { useState, useEffect, useRef } from 'react';
import { MusicConfig } from '../src/types/wedding';
import { useTheme } from '../lib/theme-context';

interface MusicPlayerProps {
  music: MusicConfig;
  className?: string;
}

export default function MusicPlayer({ music, className = '' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTheme } = useTheme();

  // Sistema de audio: Prioriza archivos locales, fallback a Spotify
  useEffect(() => {
    const setupAudio = async () => {
      console.log('🎵 Configurando audio para:', music.title, 'by', music.artist);

      // 1️⃣ PRIORIDAD: Archivo local MP3
      if (music.fileName) {
        const localUrl = `/assets/music/${music.fileName}`;
        console.log('🎵 Usando archivo local:', localUrl);
        console.log('🎶 Tipo: Archivo MP3 local de alta calidad');
        setPreviewUrl(localUrl);
        return;
      }

      // 2️⃣ FALLBACK: Sistema Spotify (solo si no hay fileName)
      if (!music.spotifyTrackId) {
        console.log('⚠️ No hay archivo local ni Track ID, usando audio de prueba');
        setPreviewUrl('https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3');
        return;
      }

      console.log('🔗 Track ID:', music.spotifyTrackId);

      // Mapeo de canciones para audio de demostración elegante para bodas
      const WEDDING_SONGS_AUDIO = {
        '0tgVpDi06FyKpA1z0VMD4v': 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', // Perfect - Ed Sheeran - Piano romántico
        '4uLU6hMCjMI75M1A2tKUQC': 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', // Never Gonna Give You Up - Música suave
        '6habFhsOp2NvshLv26DqMb': 'https://file-examples.com/storage/fe86c86b9e66b2b8c5c8b37/2017/11/file_example_MP3_700KB.mp3', // Someone Like You - Piano clásico
        '2takcwOaAZWiXQijPHIx7B': 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', // Time After Time - Música romántica
        '5ChkMS8OtdzJeqyybCc9R5': 'https://file-examples.com/storage/fe86c86b9e66b2b8c5c8b37/2017/11/file_example_MP3_700KB.mp3', // Lovely - Música suave
        '7qiZfU4dY1lWllzX7mPBI3': 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3', // Shape of You - Kalimba relajante
      };

      // Si el cliente quiere preview real de Spotify (sin login)
      if (music.useRealSpotify) {
        try {
          console.log('🎯 Intentando obtener preview real de Spotify (sin login)...');
          console.log('⚠️ Preview real requiere implementación adicional (spotify-url-info)');
          
          // Por ahora, usar demo pero marcar como intento de Spotify
          const demoUrl = WEDDING_SONGS_AUDIO[music.spotifyTrackId as keyof typeof WEDDING_SONGS_AUDIO] 
            || 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';
          
          setPreviewUrl(demoUrl);
          console.log('🎶 Usando audio de demostración (preview real requiere librería adicional)');
          
        } catch (error) {
          console.error('❌ Error obteniendo preview de Spotify:', error);
          // Fallback a demo
          const demoUrl = WEDDING_SONGS_AUDIO[music.spotifyTrackId as keyof typeof WEDDING_SONGS_AUDIO] 
            || 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';
          setPreviewUrl(demoUrl);
        }
      } else {
        // Usar audio de demostración directamente
        console.log('🎶 Usando audio de demostración elegante');
        const demoUrl = WEDDING_SONGS_AUDIO[music.spotifyTrackId as keyof typeof WEDDING_SONGS_AUDIO] 
          || 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';
        
        setPreviewUrl(demoUrl);
        console.log('🎵 Audio configurado:', demoUrl);
        console.log('🎶 Tipo: Audio de demostración elegante para bodas');
        console.log('📝 Para usar archivo local, agregar fileName al config');
      }
    };

    setupAudio();
  }, [music.fileName, music.spotifyTrackId, music.title, music.artist, music.useRealSpotify]);

  // URL de audio
  const getAudioUrl = () => {
    return previewUrl || 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3';
  };

  // Detectar primera interacción del usuario
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      
      // Iniciar reproducción automáticamente después de la primera interacción
      if (music.autoplay && audioRef.current) {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((error) => {
          console.log('Autoplay prevented:', error);
        });
      }
      
      // Remover listeners
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };

    if (!userInteracted) {
      document.addEventListener('click', handleFirstInteraction, { passive: true });
      document.addEventListener('keydown', handleFirstInteraction, { passive: true });
      document.addEventListener('touchstart', handleFirstInteraction, { passive: true });
      document.addEventListener('scroll', handleFirstInteraction, { passive: true });
    }

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [userInteracted, music.autoplay]);

  // Configurar audio cuando se carga el componente
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = music.volume || 0.3;
      audioRef.current.loop = true; // Loop para que se repita
    }
  }, [music.volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  // Solo mostrar si la música está habilitada
  if (!music.enabled || !music.spotifyTrackId) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Audio element oculto */}
      <audio
        ref={audioRef}
        src={getAudioUrl()}
        preload="auto"
        onEnded={() => setIsPlaying(false)}
        onError={(e) => {
          console.error('Error loading Spotify preview, trying fallback...', e);
          // Si falla el preview de Spotify, usar fallback
          if (audioRef.current && audioRef.current.src.includes('p.scdn.co')) {
            audioRef.current.src = 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav';
          }
        }}
      />

                {/* Botón de música minimalista con colores del tema */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 backdrop-blur-sm rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-105 group"
            style={{
              backgroundColor: `${currentTheme.colors.background}f2`, // 95% opacity
              borderColor: currentTheme.colors.border,
              boxShadow: currentTheme.shadows.md,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = currentTheme.shadows.lg;
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.light}f2`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = currentTheme.shadows.md;
              e.currentTarget.style.backgroundColor = `${currentTheme.colors.background}f2`;
            }}
            title={isPlaying ? 'Pausar música' : 'Reproducir música'}
          >
            {isPlaying ? (
              // Icono de pausa con color del tema y efecto hover
              <svg 
                className="w-5 h-5 transition-colors duration-300" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: currentTheme.colors.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = currentTheme.colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentTheme.colors.primary;
                }}
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              // Icono de nota musical con color del tema y efecto hover
              <svg 
                className="w-5 h-5 transition-colors duration-300" 
                fill="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: currentTheme.colors.primary }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = currentTheme.colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = currentTheme.colors.primary;
                }}
              >
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            )}
          </button>


    </div>
  );
}