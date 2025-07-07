'use client';

import React from 'react';
import { Sparkles, Shirt, Crown } from 'lucide-react';
import { useTranslations } from '../../lib/translations';
import { useIsMobile } from '@/lib/motion';
import { useAppSelector } from '../../src/store/hooks';
import { selectCurrentWedding } from '../../src/store/slices/weddingSlice';

const DressCode = () => {
  const { t } = useTranslations('dressCode');
  const { isMobile, isLoaded } = useIsMobile();
  const weddingData = useAppSelector(selectCurrentWedding);

  // Datos dinámicos con fallbacks
  const dressCodeData = weddingData?.event.dressCode;
  const dressCodeStyle = dressCodeData?.style || t('style.name');
  const dressCodeDescription = dressCodeData?.description || t('style.description');

  // Recomendaciones dinámicas
  const menRecommendations = dressCodeData?.recommendations?.gentlemen || [
    t('men.recommendation1'),
    t('men.recommendation2'),
    t('men.recommendation3')
  ];

  const womenRecommendations = dressCodeData?.recommendations?.ladies || [
    t('women.recommendation1'),
    t('women.recommendation2'),
    t('women.recommendation3')
  ];

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section className="py-12 bg-white">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-12">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <div className="text-xl font-medium text-accent mb-6">{dressCodeStyle}</div>
            <p className="section-subtitle max-w-2xl mx-auto">
              {dressCodeDescription}
            </p>
          </div>

          {/* Grid de sugerencias - apilado en móvil */}
          <div className="space-y-6 mb-12 max-w-sm mx-auto">
            
            {/* Estilo general */}
            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Estilo</h4>
              <p className="text-gray-600 text-sm">
                Elegante y sofisticado, perfecto para la ocasión
              </p>
            </div>

            {/* Para Damas */}
            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Damas</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {womenRecommendations.slice(0, 3).map((suggestion: string, index: number) => (
                  <p key={index}>{suggestion}</p>
                ))}
              </div>
            </div>

            {/* Para Caballeros */}
            <div className="text-center bg-gray-50 rounded-2xl p-6">
              <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                <Shirt className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Caballeros</h4>
              <div className="space-y-1 text-sm text-gray-600">
                {menRecommendations.slice(0, 3).map((suggestion: string, index: number) => (
                  <p key={index}>{suggestion}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <section className="py-12 bg-white">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="h-96 bg-gray-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones
  return (
    <section className="py-12 bg-white">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-12 animation-delay-200">
            <h2 className="section-title text-stone-600 opacity-80 mb-4">{t('title')}</h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mb-4"></div>
            <div className="text-2xl font-medium text-accent mb-6">{dressCodeStyle}</div>
            <p className="section-subtitle max-w-2xl mx-auto">
              {dressCodeDescription}
            </p>
          </div>

          {/* Contenido principal simplificado */}
          <div className="max-w-5xl mx-auto">

            {/* Grid de sugerencias - 3 columnas */}
            <div className="grid md:grid-cols-3 gap-8 mb-12 animation-delay-400">
              
              {/* Estilo general */}
              <div className="text-center bg-gray-50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Estilo</h4>
                <p className="text-gray-600 text-sm">
                  Elegante y sofisticado, perfecto para la ocasión
                </p>
              </div>

              {/* Para Damas */}
              <div className="text-center bg-gray-50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Damas</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {womenRecommendations.slice(0, 3).map((suggestion: string, index: number) => (
                    <p key={index}>{suggestion}</p>
                  ))}
                </div>
              </div>

              {/* Para Caballeros */}
              <div className="text-center bg-gray-50 rounded-2xl p-8">
                <div className="w-12 h-12 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Caballeros</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  {menRecommendations.slice(0, 3).map((suggestion: string, index: number) => (
                    <p key={index}>{suggestion}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DressCode; 