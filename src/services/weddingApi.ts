import { WeddingData, ApiResponse, RSVPFormData } from '../types/wedding';
import { getMockWeddingData } from '../data/mockData';

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Delay simulado para desarrollo
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Clase de servicio API
export class WeddingApiService {
  // Obtener datos de la boda por ID
  static async getWeddingById(id: string): Promise<ApiResponse<WeddingData>> {
    try {
      if (USE_MOCK_DATA) {
        // Simular delay de red
        await simulateDelay(800);
        
        const mockData = getMockWeddingData(id);
        if (mockData) {
          return {
            success: true,
            data: mockData,
            message: 'Datos obtenidos exitosamente (mock)'
          };
        } else {
          return {
            success: false,
            error: 'Boda no encontrada',
            message: `No se encontró una boda con ID: ${id}`
          };
        }
      }

      // Llamada real a la API
      const response = await fetch(`${API_BASE_URL}/weddings/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching wedding data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al obtener los datos de la boda'
      };
    }
  }

  // Enviar RSVP
  static async submitRSVP(rsvpData: RSVPFormData): Promise<ApiResponse<{ id: string }>> {
    try {
      if (USE_MOCK_DATA) {
        // Simular delay de envío
        await simulateDelay(1200);
        
        // Simular diferentes escenarios de respuesta
        const random = Math.random();
        if (random > 0.9) {
          throw new Error('Error simulado de red');
        }
        
        return {
          success: true,
          data: { id: `rsvp_${Date.now()}` },
          message: 'RSVP enviado exitosamente (mock)'
        };
      }

      // Llamada real a la API
      const response = await fetch(`${API_BASE_URL}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rsvpData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error submitting RSVP:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        message: 'Error al enviar la confirmación'
      };
    }
  }
}

// Funciones de utilidad exportadas
export const weddingApi = {
  getById: WeddingApiService.getWeddingById,
  submitRSVP: WeddingApiService.submitRSVP,
};

export default weddingApi; 