'use client';

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';
import { getFloralBackgroundStyle } from '../../lib/floral-patterns';

const About = () => {
  const { t } = useTranslations('about');
  const currentWedding = useAppSelector(selectCurrentWedding);
  const couple = useAppSelector(selectCouple);

  // Datos dinámicos de la boda
  const specialMoments = currentWedding?.specialMoments || [];
  const relationshipStats = currentWedding?.relationshipStats;
  const story = couple?.story || t('story'); // Fallback a traducción si no hay datos
  const quote = couple?.quote || t('quote'); // Fallback a traducción si no hay datos

  return (
    <section 
      id="about" 
      className="py-12 bg-gray-50 relative overflow-hidden"
      style={getFloralBackgroundStyle(1, '200px')}
    >
      <div className="container mx-auto px-4">
        {/* Título principal */}
        <div className="text-center mb-12">
          <h2 className="section-title text-stone-600 opacity-80 mb-4">
            {t('title')}
          </h2>
          <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
          <p className="section-subtitle text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Historia principal - Layout imagen izquierda, contenido derecha */}
          <div className="grid lg:grid-cols-5 gap-12 items-center mb-12">
            {/* Imagen de la pareja - 2 columnas */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <Image
                  src={currentWedding?.gallery?.[0]?.url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"}
                  alt={`${couple?.bride.name || 'Novia'} y ${couple?.groom.name || 'Novio'}`}
                  width={600}
                  height={800}
                  className="object-cover w-full h-full"
                />
                {/* Overlay suave para difuminar */}
                <div className="absolute inset-0 bg-white bg-opacity-10"></div>
              </div>
            </div>

            {/* Contenido de la historia - 3 columnas */}
            <div className="lg:col-span-3 space-y-8">
              {/* Historia de la pareja */}
              <div className="space-y-4 text-gray-700 leading-relaxed text-base">
                <p>
                  {story}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 