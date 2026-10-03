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
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cleanUndefinedFields } from '../lib/firestore-utils';
import { FirebaseTable } from '../src/types/wedding';
import { guestService, getSeatedGuestCount } from './guestService';

export interface TableStats {
  totalTables: number;
  seatedGuests: number;
  unseatedGuests: number;
  tablesFull: number;
  tablesOverCapacity: number;
}

export class TableService {
  private readonly TABLES_COLLECTION = 'tables';
  private readonly GUESTS_COLLECTION = 'guests';
  private readonly SEATS_COLLECTION = 'tableSeats';

  /**
   * Obtiene todas las mesas de una boda
   */
  async getWeddingTables(weddingId: string): Promise<FirebaseTable[]> {
    try {
      const tablesQuery = query(
        collection(db, this.TABLES_COLLECTION),
        where('weddingId', '==', weddingId)
      );

      const querySnapshot = await getDocs(tablesQuery);
      const tables: FirebaseTable[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        tables.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as FirebaseTable);
      });

      // Orden estable: por fecha de creación (igual que getWeddingGuests)
      tables.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return tables;
    } catch (error) {
      console.error('Error obteniendo mesas:', error);
      throw new Error('No se pudieron obtener las mesas');
    }
  }

  /**
   * Obtiene una mesa específica
   */
  async getTable(tableId: string): Promise<FirebaseTable | null> {
    try {
      const tableDoc = await getDoc(doc(db, this.TABLES_COLLECTION, tableId));

      if (tableDoc.exists()) {
        const data = tableDoc.data();
        return {
          id: tableDoc.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as FirebaseTable;
      }

      return null;
    } catch (error) {
      console.error('Error obteniendo mesa:', error);
      throw new Error('No se pudo obtener la mesa');
    }
  }

  /**
   * Crea una nueva mesa
   */
  async createTable(tableData: Omit<FirebaseTable, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();

      const cleanData = cleanUndefinedFields({
        ...tableData,
        createdAt: now,
        updatedAt: now,
      });

      const tableCollection = collection(db, this.TABLES_COLLECTION);
      const docRef = await addDoc(tableCollection, cleanData);

      return docRef.id;
    } catch (error) {
      console.error('Error creando mesa:', error);
      throw new Error('No se pudo crear la mesa');
    }
  }

  /**
   * Actualiza una mesa existente (nombre, capacidad, forma)
   */
  async updateTable(tableId: string, tableData: Partial<Omit<FirebaseTable, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const now = new Date().toISOString();
      const tableDoc = doc(db, this.TABLES_COLLECTION, tableId);

      const cleanData = cleanUndefinedFields({
        ...tableData,
        updatedAt: now,
      });

      await updateDoc(tableDoc, cleanData);
    } catch (error) {
      console.error('Error actualizando mesa:', error);
      throw new Error('No se pudo actualizar la mesa');
    }
  }

  /**
   * Actualiza solo la posición de una mesa en el Plano (spec 12)
   */
  async updateTablePosition(tableId: string, posX: number, posY: number): Promise<void> {
    try {
      const tableDoc = doc(db, this.TABLES_COLLECTION, tableId);
      await updateDoc(tableDoc, {
        posX,
        posY,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error actualizando posición de la mesa:', error);
      throw new Error('No se pudo actualizar la posición de la mesa');
    }
  }

  /**
   * Elimina una mesa. Cascada: los sub-asientos con esta mesa asignada vuelven a
   * "Sin mesa" (tableId: null, spec 23) en el mismo batch, antes de borrar el
   * documento. También limpia el `tableId` (deprecated) de los invitados que
   * todavía lo tuvieran de antes de la migración lazy a FirebaseTableSeat.
   */
  async deleteTable(tableId: string, weddingId: string): Promise<void> {
    try {
      const affectedGuestsQuery = query(
        collection(db, this.GUESTS_COLLECTION),
        where('weddingId', '==', weddingId),
        where('tableId', '==', tableId)
      );
      const affectedSeatsQuery = query(
        collection(db, this.SEATS_COLLECTION),
        where('weddingId', '==', weddingId),
        where('tableId', '==', tableId)
      );
      const [affectedGuests, affectedSeats] = await Promise.all([
        getDocs(affectedGuestsQuery),
        getDocs(affectedSeatsQuery),
      ]);

      const batch = writeBatch(db);
      affectedGuests.forEach((guestDoc) => {
        batch.update(guestDoc.ref, { tableId: null, updatedAt: new Date().toISOString() });
      });
      affectedSeats.forEach((seatDoc) => {
        batch.update(seatDoc.ref, { tableId: null, updatedAt: new Date().toISOString() });
      });
      batch.delete(doc(db, this.TABLES_COLLECTION, tableId));

      await batch.commit();
    } catch (error) {
      console.error('Error eliminando mesa:', error);
      throw new Error('No se pudo eliminar la mesa');
    }
  }

  /**
   * Cuenta cuántas personas (sub-asientos) quedarían "Sin mesa" si se borra esta
   * mesa (para el modal de confirmación de borrado).
   */
  async countSeatsAtTable(tableId: string, weddingId: string): Promise<number> {
    try {
      const affectedSeatsQuery = query(
        collection(db, this.SEATS_COLLECTION),
        where('weddingId', '==', weddingId),
        where('tableId', '==', tableId)
      );
      const affectedSeats = await getDocs(affectedSeatsQuery);
      return affectedSeats.size;
    } catch (error) {
      console.error('Error contando personas de la mesa:', error);
      throw new Error('No se pudieron contar las personas de la mesa');
    }
  }

  /**
   * Estadísticas de mesas para una boda (spec 12)
   */
  async getWeddingTableStats(weddingId: string): Promise<TableStats> {
    try {
      const [tables, guests] = await Promise.all([
        this.getWeddingTables(weddingId),
        guestService.getWeddingGuests(weddingId),
      ]);

      const occupancyByTable = new Map<string, number>();
      let seatedGuests = 0;
      let unseatedGuests = 0;

      guests.forEach((guest) => {
        const count = getSeatedGuestCount(guest);
        if (guest.tableId) {
          occupancyByTable.set(guest.tableId, (occupancyByTable.get(guest.tableId) || 0) + count);
          seatedGuests += count;
        } else {
          unseatedGuests += count;
        }
      });

      let tablesFull = 0;
      let tablesOverCapacity = 0;
      tables.forEach((table) => {
        const occupied = occupancyByTable.get(table.id) || 0;
        if (occupied > table.capacity) {
          tablesOverCapacity++;
        } else if (occupied === table.capacity && table.capacity > 0) {
          tablesFull++;
        }
      });

      return {
        totalTables: tables.length,
        seatedGuests,
        unseatedGuests,
        tablesFull,
        tablesOverCapacity,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de mesas:', error);
      throw new Error('No se pudieron obtener las estadísticas de mesas');
    }
  }
}

export const tableService = new TableService();
