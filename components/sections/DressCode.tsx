'use client';

import React from 'react';
import { Sparkles, Shirt, Crown, Gem, X, Leaf, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useIsMobile } from '@/lib/motion';

const DressCode = () => {
  const t = useTranslations('dressCode');
  const { isMobile, isLoaded } = useIsMobile();

  const ladiesSuggestions = t.raw('ladies.suggestions.items') as string[];
  const gentlemenSuggestions = t.raw('gentlemen.suggestions.items') as string[];

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section className="py-20 bg-white">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">{t('title')}</h2>
            <div className="text-xl font-medium text-accent mb-6">{t('subtitle')}</div>
            <p className="section-subtitle max-w-3xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Mensaje principal */}
          <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 mb-12 shadow-lg max-w-4xl mx-auto">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-accent" />
              <p className="text-lg text-text leading-relaxed">
                {t('mainMessage')}
              </p>
            </div>
          </div>

          {/* Secciones para Damas y Caballeros */}
          <div className="space-y-8">
            {/* Para Damas */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-heading font-semibold text-primary mb-6 text-center">
                {t('ladies.title')}
              </h3>
              
              <div className="space-y-6">
                {/* Sugerencias */}
                <div>
                  <h4 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('ladies.suggestions.title')}
                  </h4>
                  <ul className="space-y-2">
                    {ladiesSuggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-text">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Colores recomendados */}
                <div>
                  <h4 className="text-lg font-semibold text-secondary mb-3 flex items-center">
                    <Leaf className="w-5 h-5 mr-2" />
                    {t('ladies.colors.title')}
                  </h4>
                  <p className="text-text mb-4">{t('ladies.colors.description')}</p>
                  
                  {/* Paleta de colores visual */}
                  <div className="flex space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-amber-700" title="Tierra"></div>
                    <div className="w-8 h-8 rounded-full bg-rose-200" title="Rosa pastel"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-900" title="Azul marino"></div>
                    <div className="w-8 h-8 rounded-full bg-purple-600" title="Morado"></div>
                    <div className="w-8 h-8 rounded-full bg-green-800" title="Verde bosque"></div>
                  </div>
                </div>

                {/* Tip especial */}
                <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-accent">
                  <h4 className="text-lg font-semibold text-secondary mb-2 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    {t('ladies.tip.title')}
                  </h4>
                  <p className="text-text text-sm">{t('ladies.tip.description')}</p>
                </div>
              </div>
            </div>

            {/* Para Caballeros */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-heading font-semibold text-primary mb-6 text-center">
                {t('gentlemen.title')}
              </h3>
              
              <div className="space-y-6">
                {/* Sugerencias */}
                <div>
                  <h4 className="text-lg font-semibold text-secondary mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2" />
                    {t('gentlemen.suggestions.title')}
                  </h4>
                  <ul className="space-y-2">
                    {gentlemenSuggestions.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                        <span className="text-text">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Colores recomendados */}
                <div>
                  <h4 className="text-lg font-semibold text-secondary mb-3 flex items-center">
                    <Leaf className="w-5 h-5 mr-2" />
                    {t('gentlemen.colors.title')}
                  </h4>
                  <p className="text-text mb-4">{t('gentlemen.colors.description')}</p>
                  
                  {/* Paleta de colores visual */}
                  <div className="flex space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-900" title="Azul marino"></div>
                    <div className="w-8 h-8 rounded-full bg-gray-600" title="Gris"></div>
                    <div className="w-8 h-8 rounded-full bg-black" title="Negro"></div>
                    <div className="w-8 h-8 rounded-full bg-amber-800" title="Café"></div>
                    <div className="w-8 h-8 rounded-full bg-amber-900" title="Tierra oscura"></div>
                  </div>
                </div>

                {/* Tip especial */}
                <div className="bg-blue-50 rounded-xl p-4 border-l-4 border-accent">
                  <h4 className="text-lg font-semibold text-secondary mb-2 flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" />
                    {t('gentlemen.tip.title')}
                  </h4>
                  <p className="text-text text-sm">{t('gentlemen.tip.description')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-12 bg-gradient-to-br from-light to-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <h3 className="text-2xl font-heading font-semibold text-primary mb-6 text-center">
              {t('additionalInfo.title')}
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <h4 className="font-semibold text-secondary mb-2">{t('additionalInfo.environment.title')}</h4>
                <p className="text-text text-sm">{t('additionalInfo.environment.description')}</p>
              </div>
              <div className="text-center">
                <h4 className="font-semibold text-secondary mb-2">{t('additionalInfo.style.title')}</h4>
                <p className="text-text text-sm">{t('additionalInfo.style.description')}</p>
              </div>
            </div>

            {/* Qué evitar */}
            <div className="bg-red-50 rounded-xl p-4 border-l-4 border-red-400 mb-6">
              <div className="flex items-start">
                <X className="w-5 h-5 mr-3 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-red-800 text-sm font-medium">{t('additionalInfo.avoid.casual')}</p>
                  <p className="text-red-800 text-sm font-medium">{t('additionalInfo.avoid.bright')}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-text italic">
                {t('additionalInfo.questions')}
              </p>
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
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="h-96 bg-gray-200 rounded-2xl" />
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
            <div className="text-2xl font-medium text-accent mb-6">{t('subtitle')}</div>
            <p className="section-subtitle max-w-3xl mx-auto">
              {t('description')}
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Sparkles className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Mensaje principal */}
            <div className="text-center mb-16 animation-delay-400">
              <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 text-white max-w-3xl mx-auto hover:shadow-xl transition-shadow duration-300">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-accent" />
                <p className="text-lg text-text leading-relaxed">
                  {t('mainMessage')}
                </p>
              </div>
            </div>

            {/* Sugerencias por género */}
            <div className="grid lg:grid-cols-2 gap-12 mb-16">
              
              {/* Para Damas */}
              <div className="animation-delay-600">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mr-4">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-primary">
                      {t('ladies.title')}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        {t('ladies.suggestions.title')}
                      </h4>
                      <ul className="space-y-2 text-text">
                        {ladiesSuggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-text">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        {t('ladies.colors.title')}
                      </h4>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {['#8b7355', '#a67c5a', '#d4af8c', '#5a4a3a', '#2c3e50', '#8e44ad'].map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-text opacity-80">
                        {t('ladies.colors.description')}
                      </p>
                    </div>

                    <div className="bg-light rounded-xl p-4">
                      <h4 className="font-semibold text-dark mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 text-accent mr-2" />
                        {t('ladies.tip.title')}
                      </h4>
                      <p className="text-sm text-text">
                        {t('ladies.tip.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Para Caballeros */}
              <div className="animation-delay-800">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mr-4">
                      <Shirt className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-primary">
                      {t('gentlemen.title')}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        {t('gentlemen.suggestions.title')}
                      </h4>
                      <ul className="space-y-2 text-text">
                        {gentlemenSuggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-accent rounded-full mt-2 mr-3 flex-shrink-0" />
                            <span className="text-text">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        {t('gentlemen.colors.title')}
                      </h4>
                      <div className="flex flex-wrap gap-3 mb-4">
                        {['#2c3e50', '#34495e', '#8b7355', '#5a4a3a', '#1a1a1a', '#4a5568'].map((color, index) => (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-lg hover:scale-110 transition-transform duration-200"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-text opacity-80">
                        {t('gentlemen.colors.description')}
                      </p>
                    </div>

                    <div className="bg-light rounded-xl p-4">
                      <h4 className="font-semibold text-dark mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 text-accent mr-2" />
                        {t('gentlemen.tip.title')}
                      </h4>
                      <p className="text-sm text-text">
                        {t('gentlemen.tip.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-center animation-delay-1000">
              <div className="bg-gradient-to-br from-light to-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 max-w-4xl mx-auto">
                <h3 className="text-2xl font-heading font-semibold text-primary mb-6">
                  {t('additionalInfo.title')}
                </h3>
                
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <Leaf className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h4 className="font-semibold text-dark mb-2">
                      {t('additionalInfo.environment.title')}
                    </h4>
                    <p className="text-sm text-text opacity-80">
                      {t('additionalInfo.environment.description')}
                    </p>
                  </div>
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h4 className="font-semibold text-dark mb-2">
                      {t('additionalInfo.style.title')}
                    </h4>
                    <p className="text-sm text-text opacity-80">
                      {t('additionalInfo.style.description')}
                    </p>
                  </div>
                  <div className="text-center">
                    <Gem className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h4 className="font-semibold text-dark mb-2">
                      {t('additionalInfo.occasion.title')}
                    </h4>
                    <p className="text-sm text-text opacity-80">
                      {t('additionalInfo.occasion.description')}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-dark mb-3 flex items-center">
                      <X className="w-4 h-4 text-red-500 mr-2" />
                      {t('additionalInfo.avoid.casual')}
                    </h4>
                    <ul className="space-y-1 text-sm text-text">
                      <li>{t('additionalInfo.avoid.casual.item1')}</li>
                      <li>{t('additionalInfo.avoid.casual.item2')}</li>
                      <li>{t('additionalInfo.avoid.casual.item3')}</li>
                      <li>{t('additionalInfo.avoid.casual.item4')}</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-dark mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 text-accent mr-2" />
                      {t('additionalInfo.consider.title')}
                    </h4>
                    <ul className="space-y-1 text-sm text-text">
                      <li>{t('additionalInfo.consider.item1')}</li>
                      <li>{t('additionalInfo.consider.item2')}</li>
                      <li>{t('additionalInfo.consider.item3')}</li>
                      <li>{t('additionalInfo.consider.item4')}</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border">
                  <p className="text-text leading-relaxed">
                    <strong className="text-primary">
                      {t('additionalInfo.questions')}
                    </strong>
                  </p>
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