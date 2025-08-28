'use client';

import React, { useState } from 'react';

const TypographyTest = () => {
  const [selectedHeadingFont, setSelectedHeadingFont] = useState('Playfair Display');
  const [selectedBodyFont, setSelectedBodyFont] = useState('Lora');

  // Fuentes organizadas por categorías según la investigación
  const serifFonts = [
    { name: 'Playfair Display', class: 'font-playfair', import: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap', category: 'Serif Elegante' },
    { name: 'Merriweather', class: 'font-merriweather', import: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap', category: 'Serif Elegante' },
    { name: 'Lora', class: 'font-lora', import: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&display=swap', category: 'Serif Elegante' },
    { name: 'Cinzel', class: 'font-cinzel', import: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap', category: 'Serif Sofisticada' },
    { name: 'Cormorant Garamond', class: 'font-cormorant', import: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&display=swap', category: 'Serif Ultra Elegante' },
  ];

  const scriptFonts = [
    { name: 'Great Vibes', class: 'font-great-vibes', import: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap', category: 'Script Sofisticada' },
    { name: 'Allura', class: 'font-allura', import: 'https://fonts.googleapis.com/css2?family=Allura&display=swap', category: 'Script Sofisticada' },
    { name: 'Dancing Script', class: 'font-dancing', import: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&display=swap', category: 'Script Contemporánea' },
    { name: 'Satisfy', class: 'font-satisfy', import: 'https://fonts.googleapis.com/css2?family=Satisfy&display=swap', category: 'Script Ligera' },
    { name: 'Playfair Display Italic', class: 'font-playfair-italic', import: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400;1,600;1,700&display=swap', category: 'Serif Cursiva Clásica' },
    { name: 'Cormorant Garamond Italic', class: 'font-cormorant-italic', import: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400;1,600;1,700&display=swap', category: 'Serif Cursiva Sofisticada' },
    { name: 'EB Garamond Italic', class: 'font-eb-garamond-italic', import: 'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@1,400;1,600;1,700&display=swap', category: 'Serif Cursiva Editorial' },
    { name: 'Lora Italic', class: 'font-lora-italic', import: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@1,400;1,600;1,700&display=swap', category: 'Serif Cursiva Elegante' },
    { name: 'Marcellus Italic', class: 'font-marcellus-italic', import: 'https://fonts.googleapis.com/css2?family=Marcellus&display=swap', category: 'Serif Cursiva Clásica' },
    { name: 'Cinzel Decorative', class: 'font-cinzel-decorative', import: 'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap', category: 'Serif Decorativa Ceremonial' },
  ];

  const sansSerifFonts = [
    { name: 'Montserrat', class: 'font-montserrat', import: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap', category: 'Sans Serif Minimalista' },
    { name: 'Quicksand', class: 'font-quicksand', import: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600;700&display=swap', category: 'Sans Serif Suave' },
    { name: 'Poppins', class: 'font-poppins', import: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap', category: 'Sans Serif Redondeada' },
  ];

  const headingFonts = [...serifFonts, ...scriptFonts, ...sansSerifFonts];

  const bodyFonts = [
    { name: 'Merriweather', class: 'font-merriweather', import: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400&display=swap', category: 'Serif - Clásica' },
    { name: 'Lora', class: 'font-lora', import: 'https://fonts.googleapis.com/css2?family=Lora:wght@400;500&display=swap', category: 'Serif - Moderna' },
    { name: 'Montserrat', class: 'font-montserrat', import: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap', category: 'Sans Serif - Minimalista' },
    { name: 'Quicksand', class: 'font-quicksand', import: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap', category: 'Sans Serif - Suave' },
    { name: 'Poppins', class: 'font-poppins', import: 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap', category: 'Sans Serif - Redondeada' },
    { name: 'Cormorant Garamond', class: 'font-cormorant', import: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500&display=swap', category: 'Serif - Ultra Elegante' },
  ];

  // Combinaciones específicas recomendadas
  const recommendedCombinations = [
    { 
      name: 'Clásica Balanceada', 
      heading: 'Playfair Display', 
      body: 'Lora',
      description: 'Muy balanceada, funciona en casi todo dispositivo'
    },
    { 
      name: 'Distinción Elegante', 
      heading: 'Lora', 
      body: 'Great Vibes',
      description: 'Da distinción sin recargar (Great Vibes solo para nombres)'
    },
    { 
      name: 'Formal Moderna', 
      heading: 'Merriweather', 
      body: 'Poppins',
      description: 'Formal pero con aire moderno'
    },
    { 
      name: 'Script Sofisticada', 
      heading: 'Great Vibes', 
      body: 'Merriweather',
      description: 'Caligráfica para nombres + serif legible'
    },
    { 
      name: 'Ultra Elegante', 
      heading: 'Cormorant Garamond', 
      body: 'Lora',
      description: 'Máxima elegancia con legibilidad'
    },
    { 
      name: 'Cursiva Clásica', 
      heading: 'Playfair Display Italic', 
      body: 'Lora',
      description: 'Elegancia clásica con cursiva sofisticada'
    },
    { 
      name: 'Editorial Europea', 
      heading: 'EB Garamond Italic', 
      body: 'Lora',
      description: 'Inspiración editorial con gran porte y formalidad'
    },
    { 
      name: 'Lujo Contemporáneo', 
      heading: 'Cormorant Garamond Italic', 
      body: 'Quicksand',
      description: 'Sofisticación con toques de tradición y lujo'
    },
    { 
      name: 'Ceremonial Formal', 
      heading: 'Cinzel Decorative', 
      body: 'Merriweather',
      description: 'Formal y ceremonial, ideal para eventos especiales'
    }
  ];

  const sampleText = {
    title: "María & Carlos",
    subtitle: "Nuestra Historia de Amor",
    paragraph: "Nos conocimos en una tarde de primavera, cuando el destino cruzó nuestros caminos en la universidad. Desde ese momento, supimos que habíamos encontrado algo especial. Después de cinco años de aventuras, risas y sueños compartidos, decidimos dar el siguiente paso en nuestra historia de amor.",
    longText: "Te invitamos a ser parte de este momento tan especial en nuestras vidas. Queremos compartir contigo la alegría de unirnos en matrimonio, rodeados de las personas que más queremos. Tu presencia será el regalo más valioso que podamos recibir en este día tan importante para nosotros.",
    quote: "El amor no es mirarse el uno al otro, sino mirar juntos en la misma dirección."
  };

  const selectedHeadingFontObj = headingFonts.find(f => f.name === selectedHeadingFont);
  const selectedBodyFontObj = bodyFonts.find(f => f.name === selectedBodyFont);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
      {/* Cargar fuentes dinámicamente */}
      <style jsx>{`
        @import url('${selectedHeadingFontObj?.import}');
        @import url('${selectedBodyFontObj?.import}');
        
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        .font-lora { font-family: 'Lora', serif; }
        .font-merriweather { font-family: 'Merriweather', serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-great-vibes { font-family: 'Great Vibes', cursive; }
        .font-dancing { font-family: 'Dancing Script', cursive; }
        .font-satisfy { font-family: 'Satisfy', cursive; }
        .font-playfair-italic { font-family: 'Playfair Display', serif; font-style: italic; }
        .font-cormorant-italic { font-family: 'Cormorant Garamond', serif; font-style: italic; }
        .font-eb-garamond-italic { font-family: 'EB Garamond', serif; font-style: italic; }
        .font-lora-italic { font-family: 'Lora', serif; font-style: italic; }
        .font-marcellus-italic { font-family: 'Marcellus', serif; font-style: italic; }
        .font-cinzel-decorative { font-family: 'Cinzel Decorative', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }
        .font-quicksand { font-family: 'Quicksand', sans-serif; }
        .font-poppins { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-primary mb-4">
              Pruebas de Tipografía
            </h1>
            <p className="text-lg text-text">
              Experimenta con diferentes combinaciones de fuentes
            </p>
          </div>

          {/* Combinaciones recomendadas */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-6 text-primary text-center">
              Combinaciones Recomendadas
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedCombinations.map((combo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedHeadingFont(combo.heading);
                    setSelectedBodyFont(combo.body);
                  }}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="font-semibold text-primary mb-2">{combo.name}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    {combo.heading} + {combo.body}
                  </div>
                  <div className="text-xs text-gray-500">{combo.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selectores de fuentes */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Fuente para Títulos
              </h3>
              <select
                value={selectedHeadingFont}
                onChange={(e) => setSelectedHeadingFont(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <optgroup label="Serif Elegantes">
                  {serifFonts.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Script/Caligráficas y Cursivas">
                  {scriptFonts.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sans Serif Modernas">
                  {sansSerifFonts.map((font) => (
                    <option key={font.name} value={font.name}>
                      {font.name} ({font.category})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4 text-primary">
                Fuente para Texto
              </h3>
              <select
                value={selectedBodyFont}
                onChange={(e) => setSelectedBodyFont(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {bodyFonts.map((font) => (
                  <option key={font.name} value={font.name}>
                    {font.name} ({font.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vista previa */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-sm text-gray-500 mb-4">
                Vista Previa - {selectedHeadingFont} + {selectedBodyFont}
              </h2>
            </div>

            {/* Títulos principales */}
            <div className="text-center mb-12">
              <h1 className={`text-5xl md:text-6xl font-semibold text-primary mb-4 ${selectedHeadingFontObj?.class}`}>
                {sampleText.title}
              </h1>
              <h2 className={`text-2xl md:text-3xl font-medium text-secondary mb-6 ${selectedHeadingFontObj?.class}`}>
                {sampleText.subtitle}
              </h2>
            </div>

            {/* Diferentes tamaños de títulos */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center text-primary">
                Jerarquía de Títulos
              </h2>
              <div className="space-y-4">
                <h1 className={`text-4xl font-bold text-primary ${selectedHeadingFontObj?.class}`}>
                  Título H1 - {selectedHeadingFont}
                </h1>
                <h2 className={`text-3xl font-semibold text-secondary ${selectedHeadingFontObj?.class}`}>
                  Título H2 - {selectedHeadingFont}
                </h2>
                <h3 className={`text-2xl font-medium text-primary ${selectedHeadingFontObj?.class}`}>
                  Título H3 - {selectedHeadingFont}
                </h3>
                <h4 className={`text-xl font-medium text-text ${selectedHeadingFontObj?.class}`}>
                  Título H4 - {selectedHeadingFont}
                </h4>
              </div>
            </div>

            {/* Párrafos de texto */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Párrafo Normal
                </h3>
                <p className={`text-lg leading-relaxed text-text ${selectedBodyFontObj?.class}`}>
                  {sampleText.paragraph}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Párrafo con Tamaño Base
                </h3>
                <p className={`text-base leading-relaxed text-text ${selectedBodyFontObj?.class}`}>
                  {sampleText.longText}
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Texto en Cursiva (Cita)
                </h3>
                <p className={`text-lg italic text-center text-secondary leading-relaxed ${selectedBodyFontObj?.class}`}>
                  &ldquo;{sampleText.quote}&rdquo;
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">
                  Texto Pequeño
                </h3>
                <p className={`text-sm text-gray-600 leading-relaxed ${selectedBodyFontObj?.class}`}>
                  Este es un ejemplo de texto pequeño que podría usarse para notas, detalles adicionales o información complementaria en la invitación.
                </p>
              </div>
            </div>

            {/* Simulación de sección de invitación */}
            <div className="mt-12 p-8 bg-gradient-to-br from-stone-50 to-stone-100 rounded-lg border-2 border-stone-200">
              <div className="text-center">
                <h2 className={`text-3xl font-semibold text-primary mb-4 ${selectedHeadingFontObj?.class}`}>
                  Celebra con Nosotros
                </h2>
                <p className={`text-lg text-text mb-6 ${selectedBodyFontObj?.class}`}>
                  Sábado, 21 de Noviembre 2025
                </p>
                <p className={`text-base text-text leading-relaxed max-w-2xl mx-auto ${selectedBodyFontObj?.class}`}>
                  Te invitamos a ser parte de este momento tan especial en nuestras vidas. Tu presencia será el regalo más valioso que podamos recibir.
                </p>
              </div>
            </div>
          </div>

          {/* Ejemplo especial para fuentes script */}
          {scriptFonts.some(font => font.name === selectedHeadingFont) && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-yellow-800">
                ⚠️ Recomendación para Fuentes Script
              </h3>
              <p className="text-sm text-yellow-700 mb-4">
                Las fuentes script (caligráficas) como <strong>{selectedHeadingFont}</strong> son ideales para nombres y títulos cortos, pero no para párrafos largos por legibilidad.
              </p>
              <div className="bg-white p-4 rounded-lg">
                <div className="text-center">
                  <h2 className={`text-4xl text-primary mb-2 ${selectedHeadingFontObj?.class}`}>
                    María & Carlos
                  </h2>
                  <p className="text-sm text-gray-600">
                    ✅ Perfecto para nombres
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información técnica */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-primary">
              Configuración Actual
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Título:</strong> {selectedHeadingFont}<br />
                <strong>Clase CSS:</strong> {selectedHeadingFontObj?.class}<br />
                <strong>Categoría:</strong> {selectedHeadingFontObj?.category}
              </div>
              <div>
                <strong>Texto:</strong> {selectedBodyFont}<br />
                <strong>Clase CSS:</strong> {selectedBodyFontObj?.class}<br />
                <strong>Categoría:</strong> {selectedBodyFontObj?.category}
              </div>
            </div>
          </div>

          {/* Consejos de la investigación */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">
              💡 Consejos de la Investigación
            </h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>• <strong>Máximo 2 fuentes</strong> en el proyecto para mantener sencillez</li>
              <li>• <strong>Contrastes suficientes</strong> entre headers y cuerpo</li>
              <li>• <strong>Fuentes script</strong> solo para nombres y detalles, nunca párrafos largos</li>
              <li>• <strong>Prueba en móvil</strong> para garantizar legibilidad</li>
              <li>• <strong>Todas las fuentes</strong> son gratuitas y open source</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypographyTest; 