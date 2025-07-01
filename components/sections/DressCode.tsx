'use client';

import React from 'react';
import { Sparkles, Shirt, Crown, Gem, X, Leaf, Lightbulb } from 'lucide-react';
import { useIsMobile } from '@/lib/motion';

const DressCode = () => {
  const { isMobile, isLoaded } = useIsMobile();

  // Versión estática para móvil
  if (isMobile) {
    return (
      <section className="py-20 bg-white">
        <div className="section-container">
          {/* Título */}
          <div className="text-center mb-16">
            <h2 className="section-title mb-4">Código de Vestimenta</h2>
            <p className="section-subtitle">
              Queremos que te sientas elegante y cómodo en nuestra celebración
            </p>
            
            {/* Ornamento */}
            <div className="flex items-center justify-center mt-8 mb-12">
              <div className="w-16 h-px bg-accent" />
              <Sparkles className="mx-4 w-6 h-6 text-accent" />
              <div className="w-16 h-px bg-accent" />
            </div>
          </div>

          <div className="max-w-lg mx-auto space-y-8">
            {/* Mensaje principal */}
            <div className="bg-gradient-primary rounded-3xl p-6 text-white text-center">
              <Gem className="w-12 h-12 mx-auto mb-4 text-white" />
              <h3 className="text-2xl font-heading font-bold mb-4">
                Formal / Cocktail
              </h3>
              <p className="text-lg opacity-90">
                Invitamos a nuestros queridos invitados a vestirse con elegancia. 
                Piensa en una celebración sofisticada al aire libre con toques de jardín.
              </p>
            </div>

            {/* Para Damas */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mr-4">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-primary">
                  Para Damas
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-dark mb-3">
                    Sugerencias de Vestimenta
                  </h4>
                  <ul className="space-y-1 text-sm text-text">
                    <li>• Vestidos midi o largos elegantes</li>
                    <li>• Conjuntos de falda y blusa sofisticados</li>
                    <li>• Pantalones de vestir con blusa elegante</li>
                    <li>• Vestidos cóctel o de fiesta</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-dark mb-3">
                    Colores Recomendados
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['#8b7355', '#a67c5a', '#d4af8c', '#5a4a3a', '#2c3e50', '#8e44ad'].map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text opacity-80">
                    Tonos tierra, pasteles elegantes, azul marino, morado, verde bosque
                  </p>
                </div>

                <div className="bg-light rounded-xl p-4">
                  <h4 className="font-semibold text-dark mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 text-accent mr-2" />
                    Tip Especial
                  </h4>
                  <p className="text-sm text-text">
                    Como la celebración incluye jardines, evita tacones muy altos. 
                    Tacones gruesos o zapatos cómodos son perfectos.
                  </p>
                </div>
              </div>
            </div>

            {/* Para Caballeros */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-border">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mr-4">
                  <Shirt className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-heading font-bold text-primary">
                  Para Caballeros
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-dark mb-3">
                    Sugerencias de Vestimenta
                  </h4>
                  <ul className="space-y-1 text-sm text-text">
                    <li>• Traje completo (saco y pantalón)</li>
                    <li>• Pantalón de vestir con camisa y saco</li>
                    <li>• Camisa de vestir (corbata opcional)</li>
                    <li>• Zapatos de vestir formales</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-dark mb-3">
                    Colores Recomendados
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {['#2c3e50', '#34495e', '#8b7355', '#5a4a3a', '#1a1a1a', '#4a5568'].map((color, index) => (
                      <div
                        key={index}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text opacity-80">
                    Azul marino, gris, negro, café, tonos tierra oscuros
                  </p>
                </div>

                <div className="bg-light rounded-xl p-4">
                  <h4 className="font-semibold text-dark mb-2 flex items-center">
                    <Lightbulb className="w-4 h-4 text-accent mr-2" />
                    Tip Especial
                  </h4>
                  <p className="text-sm text-text">
                    Si hace calor, puedes usar camisa sin saco durante el cóctel. 
                    La corbata es opcional pero recomendada para la ceremonia.
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gradient-to-br from-light to-white rounded-2xl p-6 shadow-lg text-center">
              <h3 className="text-xl font-heading font-semibold text-primary mb-4">
                Información Adicional
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <Leaf className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h4 className="font-semibold text-dark mb-1">Ambiente</h4>
                  <p className="text-xs text-text opacity-80">Al aire libre con jardines</p>
                </div>
                <div className="text-center">
                  <Sparkles className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h4 className="font-semibold text-dark mb-1">Estilo</h4>
                  <p className="text-xs text-text opacity-80">Elegante y sofisticado</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-center text-sm">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-text">Evitar: Ropa muy casual, shorts, chanclas</span>
                </div>
                <div className="flex items-center justify-center text-sm">
                  <X className="w-4 h-4 text-red-500 mr-2" />
                  <span className="text-text">Evitar: Colores muy brillantes o neón</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-xl border border-border">
                <p className="text-sm text-text leading-relaxed">
                  <strong>¿Tienes dudas?</strong> No hesites en contactarnos. Lo importante es que te sientas cómodo y elegante para celebrar con nosotros.
                </p>
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
            <h2 className="section-title mb-4">Código de Vestimenta</h2>
            <p className="section-subtitle">
              Queremos que te sientas elegante y cómodo en nuestra celebración
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
              <div className="bg-gradient-primary rounded-3xl p-8 text-white max-w-3xl mx-auto hover:shadow-xl transition-shadow duration-300">
                <Gem className="w-16 h-16 mx-auto mb-6 text-white" />
                <h3 className="text-3xl font-heading font-bold mb-4">
                  Formal / Cocktail
                </h3>
                <p className="text-xl opacity-90 leading-relaxed">
                  Invitamos a nuestros queridos invitados a vestirse con elegancia. 
                  Piensa en una celebración sofisticada al aire libre con toques de jardín.
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
                      Para Damas
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        Sugerencias de Vestimenta
                      </h4>
                      <ul className="space-y-2 text-text">
                        <li>• Vestidos midi o largos elegantes</li>
                        <li>• Conjuntos de falda y blusa sofisticados</li>
                        <li>• Pantalones de vestir con blusa elegante</li>
                        <li>• Vestidos cóctel o de fiesta</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        Colores Recomendados
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
                        Tonos tierra, pasteles elegantes, azul marino, morado, verde bosque
                      </p>
                    </div>

                    <div className="bg-light rounded-xl p-4">
                      <h4 className="font-semibold text-dark mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 text-accent mr-2" />
                        Tip Especial
                      </h4>
                      <p className="text-sm text-text">
                        Como la celebración incluye jardines, evita tacones muy altos. 
                        Tacones gruesos o zapatos cómodos son perfectos.
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
                      Para Caballeros
                    </h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        Sugerencias de Vestimenta
                      </h4>
                      <ul className="space-y-2 text-text">
                        <li>• Traje completo (saco y pantalón)</li>
                        <li>• Pantalón de vestir con camisa y saco</li>
                        <li>• Camisa de vestir (corbata opcional)</li>
                        <li>• Zapatos de vestir formales</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-dark mb-3 flex items-center">
                        <div className="w-2 h-2 bg-accent rounded-full mr-3"></div>
                        Colores Recomendados
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
                        Azul marino, gris, negro, café, tonos tierra oscuros
                      </p>
                    </div>

                    <div className="bg-light rounded-xl p-4">
                      <h4 className="font-semibold text-dark mb-2 flex items-center">
                        <Lightbulb className="w-4 h-4 text-accent mr-2" />
                        Tip Especial
                      </h4>
                      <p className="text-sm text-text">
                        Si hace calor, puedes usar camisa sin saco durante el cóctel. 
                        La corbata es opcional pero recomendada para la ceremonia.
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
                  Información Adicional
                </h3>
                
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="text-center">
                    <Leaf className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h4 className="font-semibold text-dark mb-2">Ambiente</h4>
                    <p className="text-sm text-text opacity-80">Jardines al aire libre con espacios elegantes</p>
                  </div>
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h4 className="font-semibold text-dark mb-2">Estilo</h4>
                    <p className="text-sm text-text opacity-80">Elegante y sofisticado con toques naturales</p>
                  </div>
                  <div className="text-center">
                    <Gem className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h4 className="font-semibold text-dark mb-2">Ocasión</h4>
                    <p className="text-sm text-text opacity-80">Celebración especial que merece elegancia</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-dark mb-3 flex items-center">
                      <X className="w-4 h-4 text-red-500 mr-2" />
                      Evitar
                    </h4>
                    <ul className="space-y-1 text-sm text-text">
                      <li>• Ropa muy casual (jeans, shorts, chanclas)</li>
                      <li>• Colores muy brillantes o neón</li>
                      <li>• Vestidos blancos o color marfil</li>
                      <li>• Ropa deportiva o playera</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-border">
                    <h4 className="font-semibold text-dark mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 text-accent mr-2" />
                      Considerar
                    </h4>
                    <ul className="space-y-1 text-sm text-text">
                      <li>• Zapatos cómodos para jardín</li>
                      <li>• Chaqueta ligera para la noche</li>
                      <li>• Protección solar para la tarde</li>
                      <li>• Accesorios elegantes pero cómodos</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-border">
                  <p className="text-text leading-relaxed">
                    <strong className="text-primary">¿Tienes dudas sobre qué ponerte?</strong> No hesites en contactarnos. 
                    Lo más importante es que te sientas cómodo y elegante para celebrar con nosotros 
                    este momento tan especial. ¡Tu presencia es el mejor regalo!
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