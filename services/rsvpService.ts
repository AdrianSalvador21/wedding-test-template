import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FirebaseRSVP, FirebaseGuest } from '../src/types/wedding';

export class RSVPService {
  // Colecciones de Firestore
  private readonly RSVPS_COLLECTION = 'rsvps';

  /**
   * Limpia campos undefined de un objeto para Firebase
   */
  private cleanUndefinedFields(obj: any): any {
    const cleaned: any = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (value !== undefined) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          // Recursivamente limpiar objetos anidados
          const cleanedNested = this.cleanUndefinedFields(value);
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested;
          }
        } else {
          cleaned[key] = value;
        }
      }
    });
    
    return cleaned;
  }

  /**
   * Obtiene la confirmación RSVP de un invitado
   */
  async getRSVP(weddingId: string, guestId: string): Promise<FirebaseRSVP | null> {
    try {
      const rsvpQuery = query(
        collection(db, this.RSVPS_COLLECTION),
        where('weddingId', '==', weddingId),
        where('guestId', '==', guestId)
      );
      
      const querySnapshot = await getDocs(rsvpQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as FirebaseRSVP;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo RSVP:', error);
      throw new Error('No se pudo obtener la confirmación de asistencia');
    }
  }

  /**
   * Guarda o actualiza una confirmación RSVP
   */
  async saveRSVP(rsvpData: Omit<FirebaseRSVP, 'id' | 'submittedAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      
      // Verificar si ya existe un RSVP para este invitado
      const existingRSVP = await this.getRSVP(rsvpData.weddingId, rsvpData.guestId);
      
      if (existingRSVP) {
        // Actualizar RSVP existente
        const rsvpDoc = doc(db, this.RSVPS_COLLECTION, existingRSVP.id);
        
        // Limpiar datos undefined antes de actualizar
        const cleanData = this.cleanUndefinedFields({ ...rsvpData, updatedAt: now });
        
        await updateDoc(rsvpDoc, cleanData);
        
        return existingRSVP.id;
      } else {
        // Crear nuevo RSVP
        const rsvpCollection = collection(db, this.RSVPS_COLLECTION);
        
        // Limpiar datos undefined antes de crear
        const cleanData = this.cleanUndefinedFields({
          ...rsvpData,
          submittedAt: now,
          updatedAt: now
        });
        
        const docRef = await addDoc(rsvpCollection, cleanData);
        
        return docRef.id;
      }
    } catch (error) {
      console.error('Error guardando RSVP:', error);
      throw new Error('No se pudo guardar la confirmación de asistencia');
    }
  }

  /**
   * Obtiene todas las confirmaciones RSVP de una boda
   */
  async getWeddingRSVPs(weddingId: string): Promise<FirebaseRSVP[]> {
    try {
      const rsvpQuery = query(
        collection(db, this.RSVPS_COLLECTION),
        where('weddingId', '==', weddingId)
      );
      
      const querySnapshot = await getDocs(rsvpQuery);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirebaseRSVP[];
    } catch (error) {
      console.error('Error obteniendo RSVPs de la boda:', error);
      throw new Error('No se pudieron obtener las confirmaciones de asistencia');
    }
  }

  /**
   * Obtiene estadísticas básicas de confirmaciones para una boda
   */
  async getWeddingStats(weddingId: string): Promise<{
    total: number;
    attending: number;
    notAttending: number;
    withPlusOne: number;
  }> {
    try {
      const rsvps = await this.getWeddingRSVPs(weddingId);
      
      const stats = {
        total: rsvps.length,
        attending: rsvps.filter(r => r.attending).length,
        notAttending: rsvps.filter(r => !r.attending).length,
        withPlusOne: rsvps.filter(r => r.plusOne?.attending).length
      };
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('No se pudieron obtener las estadísticas');
    }
  }
}

// Instancia singleton del servicio
export const rsvpService = new RSVPService();
