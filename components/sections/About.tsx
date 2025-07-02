'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Heart, Star, Home, Sparkles } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding, selectCouple } from '../../src/store/slices/weddingSlice';

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
    <section id="about" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Título principal */}
        <div className="text-center mb-16">
          <h2 className="section-title text-stone-600 opacity-80 mb-4">
            {t('title')}
          </h2>
          <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Historia principal - Layout imagen izquierda, contenido derecha */}
          <div className="grid lg:grid-cols-5 gap-12 items-center mb-16">
            {/* Imagen de la pareja - 2 columnas */}
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
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
              {/* Título de la sección */}
              <div className="flex items-center space-x-3">
                <Heart className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-semibold text-gray-600">
                  {t('specialMoments')}
                </h3>
              </div>

              {/* Historia de la pareja */}
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  {story}
                </p>
              </div>

              {/* Estadísticas de la relación */}
              <div className="grid grid-cols-2 gap-8 pt-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">
                    {relationshipStats?.yearsTogther || '6+'}
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">
                    {t('stats.years')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">
                    ∞
                  </div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">
                    {t('stats.adventures')}
                  </div>
                </div>
              </div>

              {/* Cita romántica */}
              <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-accent">
                <p className="text-lg italic text-gray-700 text-center">
                  {quote}
                </p>
              </div>
            </div>
          </div>

          {/* Momentos Especiales */}
          <div className="mt-20">
            <h3 className="section-title text-stone-600 opacity-80 text-center mb-4">
              {t('specialMoments')}
            </h3>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-12"></div>

            <div className="grid md:grid-cols-3 gap-8">
              {specialMoments.length > 0 ? (
                specialMoments.map((moment, index) => {
                  // Iconos dinámicos basados en el índice o año
                  const getIcon = (index: number) => {
                    switch (index) {
                      case 0: return <Star className="w-8 h-8 text-accent" />;
                      case 1: return <Home className="w-8 h-8 text-accent" />;
                      case 2: return <Sparkles className="w-8 h-8 text-accent" />;
                      default: return <Heart className="w-8 h-8 text-accent" />;
                    }
                  };

                  return (
                    <div key={moment.year} className="text-center">
                      <div className="mb-6">
                        <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                          {getIcon(index)}
                        </div>
                        <div className="text-2xl font-bold text-accent mb-2">{moment.year}</div>
                        <h4 className="text-xl font-semibold text-gray-600 mb-3">
                          {moment.title}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {moment.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback a datos estáticos si no hay datos dinámicos
                <>
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-2xl font-bold text-accent mb-2">2018</div>
                      <h4 className="text-xl font-semibold text-gray-600 mb-3">
                        Primer Encuentro
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Nos conocimos en una cafetería del centro
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <Home className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-2xl font-bold text-accent mb-2">2021</div>
                      <h4 className="text-xl font-semibold text-gray-600 mb-3">
                        Nuestra Primera Casa
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Comenzamos a vivir juntos
                      </p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-accent" />
                      </div>
                      <div className="text-2xl font-bold text-accent mb-2">2024</div>
                      <h4 className="text-xl font-semibold text-gray-600 mb-3">
                        La Propuesta
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Carlos le pidió matrimonio a María en la playa
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 