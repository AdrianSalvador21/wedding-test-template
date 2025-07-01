'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Star, Home, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/lib/motion';

const About = () => {
  const t = useTranslations('about');
  const { isMobile, isLoaded } = useIsMobile();

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section className="py-20 bg-white">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">{t('title')}</h2>
            <p className="section-subtitle">
              {t('subtitle')}
            </p>
          </div>

          {/* Historia simplificada para móvil */}
          <div className="space-y-12">
            
            {/* Imagen de la pareja */}
            <div className="relative max-w-md mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60"
                  alt="Quetzalia y Adrián juntos"
                  width={400}
                  height={500}
                  className="object-cover"
                  quality={60}
                />
              </div>
            </div>

            {/* Contenido de la historia */}
            <div className="space-y-8">
              
              {/* Historia principal */}
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <div className="w-12 h-px bg-accent" />
                  <Heart className="w-6 h-6 text-accent" />
                  <div className="w-12 h-px bg-accent" />
                </div>

                <h3 className="text-2xl font-heading font-semibold text-primary mb-6 text-center">
                  El Comienzo de Nuestro Amor
                </h3>

                <div className="space-y-4 text-text leading-relaxed">
                  <p>
                    {t('story')}
                  </p>
                </div>
              </div>

              {/* Estadísticas de la relación */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="text-3xl font-heading font-bold text-primary mb-2">7</div>
                  <div className="text-sm font-semibold text-text uppercase tracking-wide">
                    {t('stats.years')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-heading font-bold text-primary mb-2">∞</div>
                  <div className="text-sm font-semibold text-text uppercase tracking-wide">
                    {t('stats.adventures')}
                  </div>
                </div>
              </div>

              {/* Cita especial */}
              <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 border border-border">
                <blockquote className="text-lg font-body italic text-center text-primary">
                  {t('quote')}
                </blockquote>
                <div className="text-center mt-4">
                  <div className="w-16 h-px bg-accent mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Momentos especiales simplificados */}
          <div className="mt-20 pt-16 border-t border-border">
            <h2 className="section-title mb-12">
              {t('specialMoments')}
            </h2>
            
            <div className="space-y-6">
              <div className="text-center bg-white rounded-2xl p-6 shadow-lg h-40 flex flex-col justify-center">
                <Star className="w-12 h-12 text-accent mx-auto mb-4" />
                <div className="text-2xl font-heading font-bold text-primary mb-2">2018</div>
                <div className="text-lg font-semibold text-text mb-3">{t('timeline.2018.title')}</div>
                <div className="text-sm text-text opacity-80">
                  {t('timeline.2018.description')}
                </div>
              </div>

              <div className="text-center bg-white rounded-2xl p-6 shadow-lg h-40 flex flex-col justify-center">
                <Home className="w-12 h-12 text-accent mx-auto mb-4" />
                <div className="text-2xl font-heading font-bold text-primary mb-2">2021</div>
                <div className="text-lg font-semibold text-text mb-3">{t('timeline.2021.title')}</div>
                <div className="text-sm text-text opacity-80">
                  {t('timeline.2021.description')}
                </div>
              </div>

              <div className="text-center bg-white rounded-2xl p-6 shadow-lg h-40 flex flex-col justify-center">
                <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                <div className="text-2xl font-heading font-bold text-primary mb-2">2024</div>
                <div className="text-lg font-semibold text-text mb-3">{t('timeline.2024.title')}</div>
                <div className="text-sm text-text opacity-80">
                  {t('timeline.2024.description')}
                </div>
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
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
            <div className="grid lg:grid-cols-2 gap-16">
              <div className="h-80 bg-gray-200 rounded-3xl" />
              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Versión para desktop con animaciones CSS
  return (
    <section className="py-20 bg-white">
      <div className="section-container">
        <div className="animate-fade-in-up">
          {/* Título */}
          <div className="text-center mb-16 animation-delay-200">
            <h2 className="section-title mb-4">{t('title')}</h2>
            <p className="section-subtitle">
              {t('subtitle')}
            </p>
          </div>

          {/* Historia en grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            
            {/* Imagen de la pareja */}
            <div className="relative animation-delay-400">
              <div className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <Image
                  src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80"
                  alt="Quetzalia y Adrián juntos"
                  width={600}
                  height={800}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
              
              {/* Decoración flotante */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary rounded-full opacity-10 blur-2xl" />
            </div>

            {/* Contenido de la historia */}
            <div className="space-y-8 animation-delay-600">
              
              {/* Historia principal */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-px bg-accent" />
                  <Heart className="w-6 h-6 text-accent" />
                  <div className="w-12 h-px bg-accent" />
                </div>

                <h3 className="text-2xl md:text-3xl font-heading font-semibold text-primary mb-6">
                  El Comienzo de Nuestro Amor
                </h3>

                <div className="space-y-4 text-text leading-relaxed">
                  <p className="text-lg">
                    {t('story')}
                  </p>
                </div>
              </div>

              {/* Estadísticas de la relación */}
              <div className="grid grid-cols-2 gap-6 pt-8 border-t border-border">
                <div className="text-center">
                  <div className="text-3xl font-heading font-bold text-primary mb-2">7</div>
                  <div className="text-sm font-semibold text-text uppercase tracking-wide">
                    {t('stats.years')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-heading font-bold text-primary mb-2">∞</div>
                  <div className="text-sm font-semibold text-text uppercase tracking-wide">
                    {t('stats.adventures')}
                  </div>
                </div>
              </div>

              {/* Cita especial */}
              <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 border border-border">
                <blockquote className="text-lg font-body italic text-center text-primary">
                  {t('quote')}
                </blockquote>
                <div className="text-center mt-4">
                  <div className="w-16 h-px bg-accent mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Línea temporal de momentos especiales */}
          <div className="mt-20 pt-16 border-t border-border animation-delay-800">
            <h2 className="section-title mb-12">
              {t('specialMoments')}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center group animation-delay-1000">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-56 flex flex-col justify-center">
                  <Star className="w-12 h-12 text-accent mx-auto mb-4" />
                  <div className="text-2xl font-heading font-bold text-primary mb-2">
                    2018
                  </div>
                  <div className="text-lg font-semibold text-text mb-3">
                    {t('timeline.2018.title')}
                  </div>
                  <div className="text-sm text-text opacity-80 leading-relaxed">
                    {t('timeline.2018.description')}
                  </div>
                </div>
              </div>

              <div className="text-center group animation-delay-1200">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-56 flex flex-col justify-center">
                  <Home className="w-12 h-12 text-accent mx-auto mb-4" />
                  <div className="text-2xl font-heading font-bold text-primary mb-2">
                    2021
                  </div>
                  <div className="text-lg font-semibold text-text mb-3">
                    {t('timeline.2021.title')}
                  </div>
                  <div className="text-sm text-text opacity-80 leading-relaxed">
                    {t('timeline.2021.description')}
                  </div>
                </div>
              </div>

              <div className="text-center group animation-delay-1400">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 h-56 flex flex-col justify-center">
                  <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                  <div className="text-2xl font-heading font-bold text-primary mb-2">
                    2024
                  </div>
                  <div className="text-lg font-semibold text-text mb-3">
                    {t('timeline.2024.title')}
                  </div>
                  <div className="text-sm text-text opacity-80 leading-relaxed">
                    {t('timeline.2024.description')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About; 