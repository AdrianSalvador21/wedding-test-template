'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '../src/store/hooks';
import { selectCurrentWedding } from '../src/store/slices/weddingSlice';
import { MusicConfig } from '../src/types/wedding';

interface WeddingMusicResult {
  music: MusicConfig | null;
  hasCustomMusic: boolean;
}

export const useWeddingMusic = (weddingId?: string): WeddingMusicResult => {
  const weddingData = useAppSelector(selectCurrentWedding);
  const [music, setMusic] = useState<MusicConfig | null>(null);
  const [hasCustomMusic, setHasCustomMusic] = useState(false);



  useEffect(() => {
    const loadWeddingMusic = async () => {
      // Usar weddingId proporcionado como parámetro O el ID del weddingData
      const currentWeddingId = weddingId || weddingData?.id;
      
      console.log('🎵 useWeddingMusic - Debug:', {
        providedWeddingId: weddingId,
        weddingDataId: weddingData?.id,
        currentWeddingId: currentWeddingId,
        hasWeddingData: !!weddingData
      });
      
      // Si no hay ningún ID disponible, no cargar música
      if (!currentWeddingId) {
        console.log('🎵 No hay ID disponible, no cargar música');
        setMusic(null);
        setHasCustomMusic(false);
        return;
      }
      
      try {
        // Llamar al API para verificar si existe música personalizada
        const response = await fetch(`/api/wedding-music/${currentWeddingId}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (process.env.NODE_ENV === 'development') {
            console.log('🎵 Música obtenida del API:', data);
          }
          
          if (data.hasMusic) {
            // Crear configuración de música con el archivo personalizado
            const customMusic: MusicConfig = {
              enabled: true,
              fileName: data.fileName,
              title: 'Música de Boda',
              artist: 'Personalizada',
              autoplay: true,
              volume: 0.4,
              showControls: true,
              startTime: 0 // Empezar desde el segundo 5 del track
            };
            
            setMusic(customMusic);
            setHasCustomMusic(true);
            
            if (process.env.NODE_ENV === 'development') {
              console.log('🎵 Usando música personalizada:', data.musicUrl);
            }
          } else {
            // Usar música por defecto del wedding data si existe
            if (weddingData && weddingData.music && weddingData.music.enabled) {
              setMusic(weddingData.music);
              setHasCustomMusic(false);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('🎵 Usando música por defecto del wedding data');
              }
            } else {
              setMusic(null);
              setHasCustomMusic(false);
              
              if (process.env.NODE_ENV === 'development') {
                console.log('🎵 No hay música configurada');
              }
            }
          }
        } else {
          // En caso de error del API, usar música por defecto
          if (weddingData && weddingData.music && weddingData.music.enabled) {
            setMusic(weddingData.music);
            setHasCustomMusic(false);
          } else {
            setMusic(null);
            setHasCustomMusic(false);
          }
        }
      } catch (error) {
        console.error('🎵 Error cargando música:', error);
        
        // En caso de error, usar música por defecto
        if (weddingData && weddingData.music && weddingData.music.enabled) {
          setMusic(weddingData.music);
          setHasCustomMusic(false);
        } else {
          setMusic(null);
          setHasCustomMusic(false);
        }
      }
    };

    loadWeddingMusic();
  }, [weddingData, weddingId]);

  return { music, hasCustomMusic };
};
