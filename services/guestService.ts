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
import { cleanUndefinedFields } from '../lib/firestore-utils';
import { FirebaseGuest } from '../src/types/wedding';
import { activityService } from './activityService';
import { seatService } from './seatService';

/**
 * Personas a sentar por invitación (spec 12): mismo criterio que
 * `getWeddingGuestStats` usa para "personas confirmadas" — si ya confirmó
 * asistencia, el número real que puso en el RSVP; si no, el estimado de la
 * invitación (`guestCount`).
 */
export function getSeatedGuestCount(guest: FirebaseGuest): number {
  if (guest.rsvpConfirmation?.attending === true) {
    return guest.rsvpConfirmation.guestCount || 1;
  }
  return guest.guestCount || 1;
}

/**
 * Estado de asistencia resuelto (spec 16): el RSVP público (`rsvpConfirmation.attending`) es
 * la fuente de verdad cuando existe. Si no —el caso permanente de una boda gratuita, y el de
 * cualquier invitado que todavía no confirma por su enlace— se usa `rsvpStatus`, que ahora
 * también se puede fijar a mano desde el panel (antes solo lo cambiaba el propio invitado).
 */
export type AttendanceStatus = 'confirmed' | 'declined' | 'pending';

export function resolveGuestAttendance(guest: FirebaseGuest): AttendanceStatus {
  if (guest.rsvpConfirmation?.attending === true) return 'confirmed';
  if (guest.rsvpConfirmation?.attending === false) return 'declined';
  if (guest.rsvpStatus === 'confirmed') return 'confirmed';
  if (guest.rsvpStatus === 'declined') return 'declined';
  return 'pending';
}

export class GuestService {
  private readonly GUESTS_COLLECTION = 'guests';

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
      
      const cleanData = cleanUndefinedFields({
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

      await activityService.log(guestData.weddingId, 'guest_added', guestData.name);

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

      const cleanData = cleanUndefinedFields({
        ...guestData,
        updatedAt: now
      });

      await updateDoc(guestDoc, cleanData);

      // El RSVP público (RSVP.tsx y sus variantes) confirma/declina escribiendo
      // `rsvpConfirmation` a través de este método genérico, no de
      // `updateGuestRSVPStatus` — se registra la actividad aquí para cubrir ese
      // flujo real, no solo el cambio manual desde el panel.
      //
      // Spec 23 — un cambio en `guestCount` o `rsvpConfirmation` puede mover cuántas
      // personas hay que sentar; se reconcilian los sub-asientos aquí (único punto de
      // entrada real de ambos flujos) para liberar el sobrante si el conteo bajó. Es
      // una operación barata (no hace nada si no hay sub-asientos de más).
      if (guestData.rsvpConfirmation || guestData.guestCount !== undefined) {
        const freshDoc = await getDoc(guestDoc);
        if (freshDoc.exists()) {
          const freshData = { id: freshDoc.id, ...freshDoc.data() } as FirebaseGuest;

          if (guestData.rsvpConfirmation) {
            await activityService.log(
              freshData.weddingId,
              guestData.rsvpConfirmation.attending ? 'guest_confirmed' : 'guest_declined',
              freshData.name
            );
          }

          await seatService.reconcileGuestSeats(freshData);
        }
      }
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
   * Marca manualmente el estado de asistencia de un invitado desde el panel (spec 16): a
   * diferencia de `updateGuestRSVPStatus` (que busca por `guestId` público, pensado para el
   * RSVP), este recibe directo el `id` de Firestore que la tabla de Invitados ya tiene, y
   * admite volver a 'pending' para poder corregir un error. No toca `rsvpConfirmation`:
   * `getSeatedGuestCount` ya usa `guestCount` como respaldo cuando no hay una confirmación
   * real, así que marcar "Confirmado" a mano no cambia cómo se cuenta para Mesas.
   */
  async updateGuestStatus(id: string, status: 'pending' | 'confirmed' | 'declined'): Promise<void> {
    try {
      const guestDoc = doc(db, this.GUESTS_COLLECTION, id);
      await updateDoc(guestDoc, {
        rsvpStatus: status,
        updatedAt: new Date().toISOString()
      });

      if (status !== 'pending') {
        const freshDoc = await getDoc(guestDoc);
        if (freshDoc.exists()) {
          const freshData = freshDoc.data() as FirebaseGuest;
          await activityService.log(freshData.weddingId, status === 'confirmed' ? 'guest_confirmed' : 'guest_declined', freshData.name);
        }
      }
    } catch (error) {
      console.error('Error actualizando el estado del invitado:', error);
      throw new Error('No se pudo actualizar el estado del invitado');
    }
  }

  /**
   * Asigna (o quita, con tableId = null) un invitado a una mesa (spec 12).
   * La validación de capacidad vive en quien la llama (la UI de Mesas), no aquí.
   */
  async assignGuestToTable(guestId: string, tableId: string | null): Promise<void> {
    await this.updateGuest(guestId, { tableId });
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
          // Cuenta confirmados por RSVP público (número real que puso el invitado) y también
          // los marcados a mano desde el panel (spec 16), con el estimado de la invitación.
          if (resolveGuestAttendance(g) !== 'confirmed') return sum;
          return sum + (g.rsvpConfirmation?.guestCount || g.guestCount || 1);
        }, 0), // Total personas confirmadas
        confirmed: guests.filter(g => resolveGuestAttendance(g) === 'confirmed').length, // Invitaciones confirmadas
        declined: guests.filter(g => resolveGuestAttendance(g) === 'declined').length,
        pending: guests.filter(g => resolveGuestAttendance(g) === 'pending').length
      };
      
      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('No se pudieron obtener las estadísticas');
    }
  }
}

export const guestService = new GuestService();
