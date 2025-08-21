'use client';

import { useState, useEffect, useCallback } from 'react';
import { MusicConfig } from '../types/wedding';

export interface UseMusicReturn {
  isPlaying: boolean;
  volume: number;
  isLoaded: boolean;
  trackInfo: {
    title?: string;
    artist?: string;
    image?: string;
  } | null;
  error: string | null;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  canAutoplay: boolean;
}

export function useMusic(music: MusicConfig): UseMusicReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(music.volume || 0.3);
  const [isLoaded, setIsLoaded] = useState(false);
  const [trackInfo, setTrackInfo] = useState<{ title?: string; artist?: string; image?: string } | null>(null);
  const [error] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);

  // Detectar si el usuario ha interactuado (necesario para autoplay)
  const canAutoplay = userInteracted && (music.autoplay || false);

  // Usar información de la configuración directamente (sin API por ahora)
  useEffect(() => {
    if (!music.enabled) return;

    // Usar la información proporcionada en la configuración
    setTrackInfo({
      title: music.title,
      artist: music.artist
    });
    
    setIsLoaded(true);
  }, [music.enabled, music.title, music.artist]);

  // Detectar primera interacción del usuario
  useEffect(() => {
    const handleFirstInteraction = () => {
      setUserInteracted(true);
      
      // Auto-reproducir si está habilitado
      if (music.autoplay && !isPlaying) {
        setIsPlaying(true);
      }

      // Remover listeners después de la primera interacción
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
  }, [userInteracted, music.autoplay, isPlaying]);

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
    if (!userInteracted) {
      setUserInteracted(true);
    }
  }, [userInteracted]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  // Marcar como cargado cuando se obtiene la información de la canción
  useEffect(() => {
    if (trackInfo || error) {
      setIsLoaded(true);
    }
  }, [trackInfo, error]);

  return {
    isPlaying,
    volume,
    isLoaded,
    trackInfo,
    error,
    togglePlay,
    setVolume,
    canAutoplay,
  };
}
