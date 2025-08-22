'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';
import { useThemePatterns } from '../../lib/theme-context';

const About = () => {
  const { t } = useTranslations('about');
  const currentWedding = useAppSelector(selectCurrentWedding);
  const couple = useAppSelector(selectCouple);
  const { getBackgroundStyle } = useThemePatterns();

  // Datos dinámicos de la boda
  const story = couple?.story || t('story'); // Fallback a traducción si no hay datos

  return (
    <section 
      id="about" 
      className="bg-gray-50 relative overflow-hidden"
      style={{
        ...getBackgroundStyle(1, '200px'),
        backgroundSize: '1273px 845px'
      }}
    >
      <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-12 py-12">
        {/* Título principal - manteniendo estilo original */}
        <div className="text-center mb-12">
          <h2 className="section-title text-stone-600 opacity-90 mb-4">
            {t('title')}
          </h2>
          <div className="w-16 h-0.5 bg-accent mx-auto"></div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Cita romántica - centrada y elegante */}
          <div className="text-center mb-16">
            <blockquote className="text-xl md:text-2xl font-heading italic text-stone-600 leading-relaxed max-w-4xl mx-auto">
              &ldquo;{couple?.quote || 'El amor no es solo mirarse el uno al otro, sino mirar juntos en la misma dirección.'}&rdquo;
            </blockquote>
          </div>

          {/* Layout mejorado: imagen más prominente sin overlay molesto */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Imagen de la pareja - SIN overlay blanco */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-lg shadow-lg group">
                <Image
                  src={couple?.image || currentWedding?.gallery?.[0]?.url || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                  alt={`${couple?.bride.name || 'Novia'} y ${couple?.groom.name || 'Novio'}`}
                  width={800}
                  height={1000}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
                {/* Solo una sombra sutil interior para darle profundidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
              </div>
            </div>

            {/* Contenido de la historia - mejor spacing */}
            <div className="order-1 lg:order-2 space-y-6">
              <div className="space-y-4 text-gray-700 leading-relaxed text-base lg:text-lg">
                <p className="font-body">
                  {story}
                </p>
              </div>
              
              {/* Elemento decorativo sutil */}
              <div className="flex items-center space-x-3 pt-4">
                <div className="w-12 h-0.5 bg-accent"></div>
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <div className="w-12 h-0.5 bg-accent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 