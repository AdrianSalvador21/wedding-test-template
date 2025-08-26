'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '../src/store/hooks';
import { selectCurrentWedding } from '../src/store/slices/weddingSlice';

interface WeddingImages {
  heroImage: string;
  coupleImage: string;
  galleryImages: string[];
}

export const useWeddingImages = (weddingId?: string): WeddingImages => {
  const weddingData = useAppSelector(selectCurrentWedding);
  const [images, setImages] = useState<WeddingImages>({
    heroImage: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    coupleImage: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    galleryImages: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1470219556762-1771e7f9427d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1525258370847-a2d17115dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
    ]
  });

  useEffect(() => {
    const loadWeddingImages = async () => {
      // Si hay weddingData con ID, intentar cargar imágenes personalizadas
      if (weddingData && weddingData.id) {
        const currentWeddingId = weddingId || weddingData.id;
        
        console.log('🖼️ useWeddingImages - Debug:', {
          weddingDataId: weddingData.id,
          providedWeddingId: weddingId,
          currentWeddingId: currentWeddingId
        });

        try {
          // Llamar al API para obtener las imágenes dinámicamente
          const response = await fetch(`/api/wedding-images/${currentWeddingId}`);
          
          if (response.ok) {
            const data = await response.json();
            
            console.log('🖼️ Imágenes obtenidas del API:', data);
            
            // Actualizar las imágenes con los datos del API
            setImages(prevImages => ({
              heroImage: data.heroImage || prevImages.heroImage, // Fallback a imagen por defecto
              coupleImage: data.coupleImage || prevImages.coupleImage, // Fallback a imagen por defecto
              galleryImages: data.galleryImages.length > 0 ? data.galleryImages : prevImages.galleryImages // Fallback a imágenes por defecto
            }));
          } else {
            console.log('🖼️ No se encontraron imágenes personalizadas, usando por defecto');
          }
        } catch (error) {
          console.error('🖼️ Error cargando imágenes:', error);
          // En caso de error, mantener las imágenes por defecto
        }
      }
      // Si no hay weddingData, mantener las imágenes por defecto (ya están inicializadas)
    };

    loadWeddingImages();
  }, [weddingData, weddingId]);

  return images;
};
