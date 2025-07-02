import Link from 'next/link';
import { availableWeddingIds } from '../../../src/data/mockData';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎉 Demo - Template de Invitaciones
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Selecciona una boda para ver el template dinámico en acción
          </p>
          
          {/* Enlace a invitación completa */}
          <div className="bg-gradient-to-r from-accent to-accent-dark text-white rounded-lg p-4 mb-8 inline-block">
            <Link href="/invitation" className="flex items-center space-x-2">
              <span>💝</span>
              <span className="font-semibold">Ver Invitación Completa (Demo)</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Grid de bodas disponibles */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {availableWeddingIds.map((weddingId) => (
            <Link
              key={weddingId}
              href={`/wedding/${weddingId}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 p-6 border border-gray-200"
            >
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {weddingId === 'maria-carlos-2025' ? '💕 María & Carlos' : '💖 Ana & Luis'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {weddingId === 'maria-carlos-2025' 
                    ? 'Celebración elegante en Jardines del Edén' 
                    : 'Ceremonia rural en Hacienda San Miguel'
                  }
                </p>
                <div className="text-sm text-gray-500 mb-4 font-mono bg-gray-100 px-2 py-1 rounded">
                  ID: {weddingId}
                </div>
                <div className="bg-gradient-to-r from-accent to-accent-dark text-white px-6 py-3 rounded-lg inline-block font-semibold shadow-md">
                  Ver Invitación →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Información adicional */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Instrucciones de uso */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">📖</span>
              Cómo usar el template:
            </h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• <strong>Ruta completa:</strong> <code className="bg-blue-100 px-2 py-1 rounded">/invitation</code> - Invitación con datos por defecto</li>
              <li>• <strong>Ruta dinámica:</strong> <code className="bg-blue-100 px-2 py-1 rounded">/wedding/[id]</code> - Con datos específicos de cada boda</li>
              <li>• <strong>Desarrollo:</strong> Usa datos mock para pruebas rápidas</li>
              <li>• <strong>Producción:</strong> Consultará la API real con datos reales</li>
              <li>• <strong>Personalización:</strong> Cada boda tiene su tema y contenido único</li>
            </ul>
          </div>

          {/* Características */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <span className="mr-2">✨</span>
              Características:
            </h3>
            <ul className="space-y-2 text-green-800 text-sm">
              <li>• <strong>Responsive:</strong> Optimizado para móvil y desktop</li>
              <li>• <strong>Multiidioma:</strong> Soporte español e inglés</li>
              <li>• <strong>Dinámico:</strong> Contenido personalizable por boda</li>
              <li>• <strong>Performance:</strong> Optimizado para carga rápida</li>
              <li>• <strong>SEO:</strong> Metadatos optimizados para cada boda</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
