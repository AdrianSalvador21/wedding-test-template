import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FirebaseGuest } from '../src/types/wedding';

export class GuestService {
  private readonly GUESTS_COLLECTION = 'guests';

  /**
   * Limpia campos undefined de un objeto para Firebase
   */
  private cleanUndefinedFields(obj: any): any {
    const cleaned: any = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (value !== undefined) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
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
   * Genera un ID único para el invitado basado en su nombre
   */
  private generateGuestId(name: string, weddingId: string): string {
    const cleanName = name.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    const timestamp = Date.now().toString().slice(-4);
    return `${cleanName}-${timestamp}`;
  }

  /**
   * Obtiene todos los invitados de una boda
   */
  async getWeddingGuests(weddingId: string): Promise<FirebaseGuest[]> {
    try {
      const guestsQuery = query(
        collection(db, this.GUESTS_COLLECTION),
        where('weddingId', '==', weddingId)
      );
      
      const querySnapshot = await getDocs(guestsQuery);
      const guests: FirebaseGuest[] = [];
      
      querySnapshot.forEach(doc => {
        const data = doc.data();
        guests.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as FirebaseGuest);
      });
      
      // Ordenar por fecha de creación (más recientes primero)
      guests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return guests;
    } catch (error) {
      console.error('Error obteniendo invitados:', error);
      throw new Error('No se pudieron obtener los invitados');
    }
  }

  /**
   * Obtiene un invitado específico
   */
  async getGuest(guestId: string): Promise<FirebaseGuest | null> {
    try {
      const guestDoc = await getDoc(doc(db, this.GUESTS_COLLECTION, guestId));
      
      if (guestDoc.exists()) {
        const data = guestDoc.data();
        return {
          id: guestDoc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as FirebaseGuest;
      }
      
      return null;
    } catch (error) {
      console.error('Error obteniendo invitado:', error);
      throw new Error('No se pudo obtener el invitado');
    }
  }

  /**
   * Busca un invitado por su guestId (el ID usado en las URLs)
   */
  async getGuestByGuestId(guestId: string, weddingId: string): Promise<FirebaseGuest | null> {
    try {
      const guestsQuery = query(
        collection(db, this.GUESTS_COLLECTION),
        where('guestId', '==', guestId),
        where('weddingId', '==', weddingId)
      );

      const querySnapshot = await getDocs(guestsQuery);
      
      if (querySnapshot.empty) {
        return null;
      }

      // Tomar el primer resultado (debería ser único)
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      } as FirebaseGuest;
    } catch (error) {
      console.error('Error buscando invitado por guestId:', error);
      throw new Error('No se pudo encontrar el invitado');
    }
  }

  /**
   * Crea un nuevo invitado
   */
  async createGuest(guestData: Omit<FirebaseGuest, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      
      const cleanData = this.cleanUndefinedFields({
        ...guestData,
        rsvpStatus: 'pending',
        createdAt: now,
        updatedAt: now
      });

      const guestCollection = collection(db, this.GUESTS_COLLECTION);
      const docRef = await addDoc(guestCollection, cleanData);
      
      // Generar el guestId después de crear el documento para usar el ID real
      const guestId = this.generateGuestId(guestData.name, docRef.id);
      
      // Actualizar el documento con el guestId generado
      await updateDoc(docRef, { guestId });
      
      return docRef.id;
    } catch (error) {
      console.error('Error creando invitado:', error);
      throw new Error('No se pudo crear el invitado');
    }
  }

  /**
   * Actualiza un invitado existente
   */
  async updateGuest(guestId: string, guestData: Partial<Omit<FirebaseGuest, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const now = new Date().toISOString();
      const guestDoc = doc(db, this.GUESTS_COLLECTION, guestId);
      
      const cleanData = this.cleanUndefinedFields({
        ...guestData,
        updatedAt: now
      });
      
      await updateDoc(guestDoc, cleanData);
    } catch (error) {
      console.error('Error actualizando invitado:', error);
      throw new Error('No se pudo actualizar el invitado');
    }
  }

  /**
   * Actualiza el estado RSVP de un invitado
   */
  async updateGuestRSVPStatus(guestId: string, weddingId: string, status: 'confirmed' | 'declined'): Promise<void> {
    try {
      // Buscar el invitado por guestId
      const guest = await this.getGuestByGuestId(guestId, weddingId);
      if (!guest) {
        throw new Error('Invitado no encontrado');
      }

      // Actualizar el estado RSVP
      const guestDoc = doc(db, this.GUESTS_COLLECTION, guest.id);
      await updateDoc(guestDoc, {
        rsvpStatus: status,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error actualizando estado RSVP del invitado:', error);
      throw new Error('No se pudo actualizar el estado del invitado');
    }
  }

  /**
   * Elimina un invitado
   */
  async deleteGuest(guestId: string): Promise<void> {
    try {
      const guestDoc = doc(db, this.GUESTS_COLLECTION, guestId);
      await deleteDoc(guestDoc);
    } catch (error) {
      console.error('Error eliminando invitado:', error);
      throw new Error('No se pudo eliminar el invitado');
    }
  }

  /**
   * Regenera guestId faltantes para invitados existentes
   */
  async fixMissingGuestIds(weddingId: string): Promise<void> {
    try {
      const guests = await this.getWeddingGuests(weddingId);
      
      for (const guest of guests) {
        if (!guest.guestId) {
          const guestId = this.generateGuestId(guest.name, guest.id);
          const guestDoc = doc(db, this.GUESTS_COLLECTION, guest.id);
          await updateDoc(guestDoc, { 
            guestId,
            updatedAt: new Date().toISOString()
          });
          console.log(`✅ GuestId generado para ${guest.name}: ${guestId}`);
        }
      }
    } catch (error) {
      console.error('Error regenerando guestIds:', error);
      throw new Error('No se pudieron regenerar los guestIds');
    }
  }

  /**
   * Obtiene estadísticas de invitados para una boda
   */
  async getWeddingGuestStats(weddingId: string): Promise<{
    total: number;
    totalGuestCount: number;
    totalConfirmedPersons: number;
    confirmed: number;
    declined: number;
    pending: number;
  }> {
    try {
      const guests = await this.getWeddingGuests(weddingId);
      
      const stats = {
        total: guests.length, // Número de invitaciones
        totalGuestCount: guests.reduce((sum, g) => {
          // Siempre contar como 1 hasta que confirmen o rechacen
          return sum + 1;
        }, 0), // Total personas invitadas (1 por invitación hasta que confirmen/rechacen)
        totalConfirmedPersons: guests.reduce((sum, g) => {
          // Solo contar personas confirmadas con su número real de invitados
          if (g.rsvpConfirmation?.attending === true) {
            return sum + (g.rsvpConfirmation?.guestCount || 1);
          }
          return sum;
        }, 0), // Total personas confirmadas (suma real de guestCount de confirmados)
        confirmed: guests.filter(g => g.rsvpConfirmation?.attending === true).length, // Invitaciones confirmadas
        declined: guests.filter(g => g.rsvpConfirmation?.attending === false).length,
        pending: guests.filter(g => !g.rsvpConfirmation || g.rsvpConfirmation.attending === undefined).length
      };
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('No se pudieron obtener las estadísticas');
    }
  }
}

export const guestService = new GuestService();
