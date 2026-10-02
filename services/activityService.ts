import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export type ActivityType = 'guest_added' | 'guest_confirmed' | 'guest_declined';

export interface ActivityLogEntry {
  id: string;
  weddingId: string;
  type: ActivityType;
  guestName: string;
  message: string;
  createdAt: string;
}

const MESSAGE_BY_TYPE: Record<ActivityType, (guestName: string) => string> = {
  guest_added: (name) => `${name} se agregó a la lista de invitados`,
  guest_confirmed: (name) => `${name} confirmó su asistencia`,
  guest_declined: (name) => `${name} no podrá asistir`,
};

export class ActivityService {
  private readonly COLLECTION = 'activityLog';

  /**
   * Registra un evento de actividad. No lanza error hacia arriba: una falla al
   * loguear no debe tumbar la acción principal (crear invitado, confirmar RSVP).
   */
  async log(weddingId: string, type: ActivityType, guestName: string): Promise<void> {
    try {
      await addDoc(collection(db, this.COLLECTION), {
        weddingId,
        type,
        guestName,
        message: MESSAGE_BY_TYPE[type](guestName),
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error registrando actividad:', error);
    }
  }

  /**
   * Últimos eventos de una boda. Mismo criterio que `guestService.getWeddingGuests`
   * (spec 21): filtra solo por `weddingId` en Firestore y ordena en el cliente, para
   * no depender de un índice compuesto nuevo.
   */
  async getRecentActivity(weddingId: string, max = 8): Promise<ActivityLogEntry[]> {
    try {
      const activityQuery = query(collection(db, this.COLLECTION), where('weddingId', '==', weddingId));
      const querySnapshot = await getDocs(activityQuery);
      const entries: ActivityLogEntry[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        entries.push({
          id: docSnap.id,
          weddingId: data.weddingId,
          type: data.type,
          guestName: data.guestName,
          message: data.message,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return entries.slice(0, max);
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      return [];
    }
  }
}

export const activityService = new ActivityService();
