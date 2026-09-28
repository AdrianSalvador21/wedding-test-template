import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cleanUndefinedFields } from '../lib/firestore-utils';
import { FirebaseVenueFixture } from '../src/types/wedding';

export class VenueFixtureService {
  private readonly FIXTURES_COLLECTION = 'venueFixtures';

  /**
   * Obtiene todos los objetos de salón de una boda (pista, barra, etc.)
   */
  async getWeddingFixtures(weddingId: string): Promise<FirebaseVenueFixture[]> {
    try {
      const fixturesQuery = query(
        collection(db, this.FIXTURES_COLLECTION),
        where('weddingId', '==', weddingId)
      );

      const querySnapshot = await getDocs(fixturesQuery);
      const fixtures: FirebaseVenueFixture[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fixtures.push({
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        } as FirebaseVenueFixture);
      });

      fixtures.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return fixtures;
    } catch (error) {
      console.error('Error obteniendo objetos del salón:', error);
      throw new Error('No se pudieron obtener los objetos del salón');
    }
  }

  /**
   * Crea un nuevo objeto de salón
   */
  async createFixture(
    fixtureData: Omit<FirebaseVenueFixture, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const now = new Date().toISOString();

      const cleanData = cleanUndefinedFields({
        ...fixtureData,
        createdAt: now,
        updatedAt: now,
      });

      const fixtureCollection = collection(db, this.FIXTURES_COLLECTION);
      const docRef = await addDoc(fixtureCollection, cleanData);

      return docRef.id;
    } catch (error) {
      console.error('Error creando objeto del salón:', error);
      throw new Error('No se pudo crear el objeto del salón');
    }
  }

  /**
   * Actualiza un objeto de salón (etiqueta, tamaño, tipo)
   */
  async updateFixture(
    fixtureId: string,
    fixtureData: Partial<Omit<FirebaseVenueFixture, 'id' | 'createdAt'>>
  ): Promise<void> {
    try {
      const now = new Date().toISOString();
      const fixtureDoc = doc(db, this.FIXTURES_COLLECTION, fixtureId);

      const cleanData = cleanUndefinedFields({
        ...fixtureData,
        updatedAt: now,
      });

      await updateDoc(fixtureDoc, cleanData);
    } catch (error) {
      console.error('Error actualizando objeto del salón:', error);
      throw new Error('No se pudo actualizar el objeto del salón');
    }
  }

  /**
   * Actualiza solo la posición de un objeto de salón en el Plano
   */
  async updateFixturePosition(fixtureId: string, posX: number, posY: number): Promise<void> {
    try {
      const fixtureDoc = doc(db, this.FIXTURES_COLLECTION, fixtureId);
      await updateDoc(fixtureDoc, {
        posX,
        posY,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error actualizando posición del objeto del salón:', error);
      throw new Error('No se pudo actualizar la posición del objeto del salón');
    }
  }

  /**
   * Toda boda debería arrancar con un Escenario y una Pista de baile ya
   * colocados en el Plano (pedido explícito del usuario). Se valida contra
   * lo que ya existe y solo se crea lo que falte — mismo patrón de
   * migración perezosa al cargar que ya usa `guests/page.tsx` con
   * `migrateWeddingData`, aplicado aquí a los objetos de salón.
   */
  async ensureDefaultFixtures(weddingId: string, existing: FirebaseVenueFixture[]): Promise<FirebaseVenueFixture[]> {
    const hasStage = existing.some((f) => f.type === 'stage');
    const hasDanceFloor = existing.some((f) => f.type === 'dance_floor');

    const toCreate: Omit<FirebaseVenueFixture, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    if (!hasStage) {
      toCreate.push({ weddingId, type: 'stage', label: 'Escenario', posX: -120, posY: -260, width: 240, height: 90 });
    }
    if (!hasDanceFloor) {
      toCreate.push({ weddingId, type: 'dance_floor', label: 'Pista de baile', posX: -140, posY: -140, width: 280, height: 160 });
    }
    if (toCreate.length === 0) return existing;

    const now = new Date().toISOString();
    const created = await Promise.all(
      toCreate.map(async (fixtureData) => {
        const id = await this.createFixture(fixtureData);
        return { ...fixtureData, id, createdAt: now, updatedAt: now } as FirebaseVenueFixture;
      })
    );

    return [...existing, ...created];
  }

  /**
   * Elimina un objeto de salón
   */
  async deleteFixture(fixtureId: string): Promise<void> {
    try {
      const fixtureDoc = doc(db, this.FIXTURES_COLLECTION, fixtureId);
      await deleteDoc(fixtureDoc);
    } catch (error) {
      console.error('Error eliminando objeto del salón:', error);
      throw new Error('No se pudo eliminar el objeto del salón');
    }
  }
}

export const venueFixtureService = new VenueFixtureService();
