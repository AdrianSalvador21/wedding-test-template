import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cleanUndefinedFields } from '../lib/firestore-utils';
import { FirebaseGuest, FirebaseTableSeat } from '../src/types/wedding';
import { getSeatedGuestCount } from './guestService';

/**
 * Nombre a mostrar de un sub-asiento (spec 23), derivado en cada render y nunca
 * persistido: el titular usa el nombre real de la invitación; el acompañante 1 usa
 * `rsvpConfirmation.plusOne.name` si existe; cualquier otro usa el formato genérico.
 */
export function getSeatDisplayName(guest: FirebaseGuest, seatIndex: number): string {
  if (seatIndex === 0) return guest.name;
  if (seatIndex === 1 && guest.rsvpConfirmation?.plusOne?.name) {
    return guest.rsvpConfirmation.plusOne.name;
  }
  return `Acompañante de ${guest.name} ${seatIndex}`;
}

export class SeatService {
  private readonly SEATS_COLLECTION = 'tableSeats';

  /**
   * Sub-asientos ya persistidos de un invitado, ordenados por seatIndex.
   */
  async getGuestSeats(guestId: string): Promise<FirebaseTableSeat[]> {
    try {
      const seatsQuery = query(collection(db, this.SEATS_COLLECTION), where('guestId', '==', guestId));
      const querySnapshot = await getDocs(seatsQuery);
      const seats: FirebaseTableSeat[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        seats.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as FirebaseTableSeat);
      });

      return seats.sort((a, b) => a.seatIndex - b.seatIndex);
    } catch (error) {
      console.error('Error obteniendo sub-asientos del invitado:', error);
      throw new Error('No se pudieron obtener los asientos del invitado');
    }
  }

  /**
   * Genera de forma perezosa los sub-asientos faltantes de un invitado (spec 23): si
   * no existía ninguno, crea exactamente `getSeatedGuestCount(guest)` y todos heredan
   * el `tableId` del modelo anterior (migración transparente desde spec 12); si ya
   * existían algunos pero el conteo creció, solo completa los que faltan, sin mesa.
   *
   * IDs deterministas (`${guestId}_${seatIndex}`) en vez de `addDoc`: dos llamadas
   * concurrentes (dos pestañas) calculan los mismos documentos faltantes y el segundo
   * `batch.set` solo sobreescribe con datos equivalentes, en vez de duplicar asientos.
   */
  async getOrCreateGuestSeats(guest: FirebaseGuest): Promise<FirebaseTableSeat[]> {
    try {
      const desired = getSeatedGuestCount(guest);
      const existing = await this.getGuestSeats(guest.id);

      const existingIndexes = new Set(existing.map((s) => s.seatIndex));
      const missingIndexes: number[] = [];
      for (let i = 0; i < desired; i++) {
        if (!existingIndexes.has(i)) missingIndexes.push(i);
      }

      if (missingIndexes.length === 0) {
        return existing;
      }

      const now = new Date().toISOString();
      const inheritedTableId = existing.length === 0 ? guest.tableId ?? null : null;

      const batch = writeBatch(db);
      const created: FirebaseTableSeat[] = [];
      missingIndexes.forEach((seatIndex) => {
        const ref = doc(db, this.SEATS_COLLECTION, `${guest.id}_${seatIndex}`);
        const data = {
          weddingId: guest.weddingId,
          guestId: guest.id,
          seatIndex,
          tableId: inheritedTableId,
          createdAt: now,
          updatedAt: now,
        };
        batch.set(ref, cleanUndefinedFields(data));
        created.push({ id: ref.id, ...data });
      });
      await batch.commit();

      return [...existing, ...created].sort((a, b) => a.seatIndex - b.seatIndex);
    } catch (error) {
      console.error('Error generando sub-asientos del invitado:', error);
      throw new Error('No se pudieron generar los asientos del invitado');
    }
  }

  /**
   * Genera/completa los sub-asientos de todos los invitados de una boda en paralelo
   * (spec 23): es lo que usan las páginas de Mesas al cargar, cubriendo tanto la
   * migración de invitados con `tableId` previo como el alta de nuevos.
   */
  async ensureWeddingSeats(guests: FirebaseGuest[]): Promise<FirebaseTableSeat[]> {
    const results = await Promise.all(guests.map((guest) => this.getOrCreateGuestSeats(guest)));
    return results.flat();
  }

  /**
   * Asigna (o quita, con tableId = null) UN sub-asiento a una mesa (spec 23). A
   * diferencia de `guestService.assignGuestToTable`, mueve solo a esa persona, no a
   * toda la invitación.
   */
  async assignSeatToTable(seatId: string, tableId: string | null): Promise<void> {
    try {
      const seatDoc = doc(db, this.SEATS_COLLECTION, seatId);
      await updateDoc(seatDoc, cleanUndefinedFields({ tableId, updatedAt: new Date().toISOString() }));
    } catch (error) {
      console.error('Error asignando el asiento a la mesa:', error);
      throw new Error('No se pudo asignar el asiento a la mesa');
    }
  }

  /**
   * Libera y elimina los sub-asientos sobrantes cuando baja el conteo de personas de
   * una invitación (spec 23): los de mayor `seatIndex` que ya no corresponden.
   */
  async reconcileGuestSeats(guest: FirebaseGuest): Promise<void> {
    try {
      const desired = getSeatedGuestCount(guest);
      const existing = await this.getGuestSeats(guest.id);
      const overflow = existing.filter((seat) => seat.seatIndex >= desired);
      if (overflow.length === 0) return;

      const batch = writeBatch(db);
      overflow.forEach((seat) => batch.delete(doc(db, this.SEATS_COLLECTION, seat.id)));
      await batch.commit();
    } catch (error) {
      console.error('Error reconciliando sub-asientos del invitado:', error);
      throw new Error('No se pudieron reconciliar los asientos del invitado');
    }
  }
}

export const seatService = new SeatService();
