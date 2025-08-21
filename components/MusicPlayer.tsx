'use client';

import { useState, useEffect, useRef } from 'react';
import { MusicConfig } from '../src/types/wedding';
import { spotifyApi } from '../src/services/spotifyApi';

interface MusicPlayerProps {
  music: MusicConfig;
  className?: string;
}

export default function MusicPlayer({ music, className = '' }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Obtener preview URL real de Spotify
  useEffect(() => {
    const fetchPreviewUrl = async () => {
      if (!music.spotifyTrackId) {
        setPreviewUrl('https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3');
        return;
      }

      try {
        console.log('🎵 Obteniendo preview de Spotify para:', music.title, 'by', music.artist);
        console.log('🔗 Track ID:', music.spotifyTrackId);
        
        // Usar la API real de Spotify para obtener el preview URL
        const response = await spotifyApi.getTrack(music.spotifyTrackId);
        
        if (response.success && response.data && response.data.preview_url) {
          setPreviewUrl(response.data.preview_url);
          console.log('✅ Preview URL obtenido de Spotify:', response.data.preview_url);
          console.log('🎵 Reproduciendo:', response.data.name, 'by', response.data.artists[0]?.name);
        } else {
          console.warn('⚠️ No hay preview disponible para este track en Spotify');
          console.warn('⚠️ Respuesta de Spotify:', response);
          // Fallback con audio de prueba
          setPreviewUrl('https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3');
        }
      } catch (error) {
        console.error('❌ Error obteniendo preview de Spotify:', error);
        // Fallback en caso de error
        setPreviewUrl('https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3');
      }
    };

    fetchPreviewUrl();
  }, [music.spotifyTrackId, music.title, music.artist]);

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

      {/* Botón de música minimalista */}
      <button
        onClick={togglePlay}
        className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105"
        title={isPlaying ? 'Pausar música' : 'Reproducir música'}
      >
        {isPlaying ? (
          // Icono de pausa
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        ) : (
          // Icono de nota musical
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        )}
      </button>


    </div>
  );
}