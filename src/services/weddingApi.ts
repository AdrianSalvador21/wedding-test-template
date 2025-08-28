import { WeddingData, ApiResponse, RSVPFormData } from '../types/wedding';
import { getMockWeddingData } from '../data/mockData';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { guestService } from '../../services/guestService';

// Configuración de la API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
const USE_MOCK_DATA = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';

// Delay simulado para desarrollo
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Función para procesar datos bilingües según el idioma del invitado
function processBilingualData(data: unknown, language: 'es' | 'en' = 'es'): unknown {
  if (!data || typeof data !== 'object') return data;
  
  // Si es un array, procesar cada elemento
  if (Array.isArray(data)) {
    return data.map(item => processBilingualData(item, language));
  }
  
  const processed = { ...data as Record<string, unknown> };
  
  // Procesar cada propiedad del objeto
  for (const key in processed) {
    const value = processed[key];
    
    // Si la propiedad tiene estructura bilingüe { es: string, en: string }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const bilingualValue = value as Record<string, unknown>;
      if (typeof bilingualValue.es === 'string' && typeof bilingualValue.en === 'string') {
        // MANTENER el objeto bilingüe intacto para que los componentes puedan seleccionar el idioma
        processed[key] = bilingualValue;
      } else {
        // Si es un objeto anidado, procesarlo recursivamente
        processed[key] = processBilingualData(value, language);
      }
    }
  }
  
  return processed;
}

// Función para obtener el idioma del invitado
async function getGuestLanguage(guestId: string, weddingId: string): Promise<'es' | 'en'> {
  try {
    if (!guestId) return 'es';
    
    const guest = await guestService.getGuestByGuestId(guestId, weddingId);
    return guest?.language || 'es';
  } catch (error) {
    console.error('Error obteniendo idioma del invitado:', error);
    return 'es';
  }
}

// Función para obtener datos de Firebase
async function getWeddingFromFirebase(weddingId: string, guestId?: string): Promise<WeddingData | null> {
  try {
    const docRef = doc(db, 'weddings', weddingId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Verificar si tiene información básica
      const hasBasicInfo = data.couple?.bride?.name || data.couple?.groom?.name || data.event?.date;
      
      if (hasBasicInfo) {
        // Obtener idioma del invitado si se proporciona guestId
        const language = guestId ? await getGuestLanguage(guestId, weddingId) : 'es';
        
        // Procesar datos bilingües según el idioma
        const processedData = processBilingualData(data, language);
        
        return { id: weddingId, ...(processedData as Record<string, unknown>) } as WeddingData;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error obteniendo datos de Firebase:', error);
    return null;
  }
}

// Clase de servicio API
export class WeddingApiService {
  // Obtener datos de la boda por ID
  static async getWeddingById(id: string, guestId?: string): Promise<ApiResponse<WeddingData>> {
    try {
      // 1. Primero intentar obtener datos de Firebase
      const firebaseData = await getWeddingFromFirebase(id, guestId);
      
      if (firebaseData) {
        return {
          success: true,
          data: firebaseData,
          message: 'Datos obtenidos exitosamente desde Firebase'
        };
      }

      // 2. Si no hay datos en Firebase, usar mock como fallback
      if (USE_MOCK_DATA) {
        // Simular delay de red
        await simulateDelay(800);
        
        // Usar siempre friends-test como fallback cuando no hay datos en Firebase
        const mockData = getMockWeddingData('friends-test');
        if (mockData) {
          // Asignar el ID correcto al mock
          const fallbackData = { ...mockData, id };
          return {
            success: true,
            data: fallbackData,
            message: 'Datos obtenidos desde mock (fallback)'
          };
        }
      }

      // 3. Llamada real a la API como último recurso
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