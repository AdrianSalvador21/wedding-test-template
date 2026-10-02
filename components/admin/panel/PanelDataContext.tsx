'use client';

import { createContext, useCallback, useContext, useEffect, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { saveWeddingDoc } from '../../../lib/weddingSave';
import { createInitialWeddingData, isValidWeddingId } from '../../../lib/wedding-defaults';
import { guestService, resolveGuestAttendance, getSeatedGuestCount } from '../../../services/guestService';
import { tableService } from '../../../services/tableService';
import { FirebaseGuest, FirebaseTable, WeddingData } from '../../../src/types/wedding';

// Misma migración que ya usan `wedding-editor` y `guests` (duplicada ahí también,
// sigue el patrón existente de no extraerla a un lib compartido) — se necesita aquí
// porque el layout del panel nuevo hace el único fetch de `weddingData` para las 5
// secciones, y debe dejar el documento en el mismo formato migrado que ya esperan.
function migrateWeddingData(data: Record<string, unknown>): WeddingData {
  const migrated = { ...data } as unknown as WeddingData;

  if (data.selectedGuestTickets !== undefined) migrated.selectedGuestTickets = data.selectedGuestTickets as boolean;
  if (data.hasDiet !== undefined) migrated.hasDiet = data.hasDiet as boolean;
  if (data.hasInstagram !== undefined) migrated.hasInstagram = data.hasInstagram as boolean;
  if (data.hasFacebook !== undefined) migrated.hasFacebook = data.hasFacebook as boolean;
  if (data.showGuestsInput !== undefined) migrated.showGuestsInput = data.showGuestsInput as boolean;
  if (data.showRecommendedPlaces !== undefined) migrated.showRecommendedPlaces = data.showRecommendedPlaces as boolean;
  if (data.showConfirmCta !== undefined) migrated.showConfirmCta = data.showConfirmCta as boolean;

  // Spec 16 — una boda gratuita no tiene Editor para apagar `selectedGuestTickets`,
  // así que se autocorrige aquí (mismo ajuste que ya hacían `wedding-editor` y
  // `guests` por separado) — sin esto, "Número de Personas" quedaría oculto para
  // siempre en una boda gratuita creada antes de este ajuste.
  if (migrated.tier === 'free' && migrated.selectedGuestTickets !== false) {
    migrated.selectedGuestTickets = false;
  }

  return migrated as WeddingData;
}

export interface GuestStats {
  total: number;
  totalGuestCount: number;
  totalConfirmedPersons: number;
  confirmed: number;
  declined: number;
  pending: number;
}

// Misma matemática que `guestService.getWeddingGuestStats`, pero sobre los invitados
// ya cargados en memoria por el contexto — evita un segundo viaje a Firestore cada
// vez que Dashboard/Confirmaciones/Invitados necesitan estos números.
export function computeGuestStats(guests: FirebaseGuest[]): GuestStats {
  return {
    total: guests.length,
    totalGuestCount: guests.reduce((sum) => sum + 1, 0),
    totalConfirmedPersons: guests.reduce((sum, g) => {
      if (resolveGuestAttendance(g) !== 'confirmed') return sum;
      return sum + (g.rsvpConfirmation?.guestCount || g.guestCount || 1);
    }, 0),
    confirmed: guests.filter((g) => resolveGuestAttendance(g) === 'confirmed').length,
    declined: guests.filter((g) => resolveGuestAttendance(g) === 'declined').length,
    pending: guests.filter((g) => resolveGuestAttendance(g) === 'pending').length,
  };
}

export interface TableStatsComputed {
  totalTables: number;
  seatedGuests: number;
  unseatedGuests: number;
  totalCapacity: number;
}

// Misma matemática que `tableService.getWeddingTableStats`, sobre los datos ya
// cargados por el contexto.
export function computeTableStats(tables: FirebaseTable[], guests: FirebaseGuest[]): TableStatsComputed {
  let seatedGuests = 0;
  let unseatedGuests = 0;
  guests.forEach((guest) => {
    const count = getSeatedGuestCount(guest);
    if (guest.tableId) {
      seatedGuests += count;
    } else {
      unseatedGuests += count;
    }
  });
  return {
    totalTables: tables.length,
    seatedGuests,
    unseatedGuests,
    totalCapacity: tables.reduce((sum, t) => sum + (t.capacity || 0), 0),
  };
}

interface PanelDataValue {
  weddingId: string;
  weddingData: WeddingData | null;
  guests: FirebaseGuest[];
  tables: FirebaseTable[];
  loading: boolean;
  notFound: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setWeddingData: Dispatch<SetStateAction<WeddingData | null>>;
  setGuests: Dispatch<SetStateAction<FirebaseGuest[]>>;
  setTables: Dispatch<SetStateAction<FirebaseTable[]>>;
}

const PanelDataContext = createContext<PanelDataValue | null>(null);

export function PanelDataProvider({ weddingId, children }: { weddingId: string; children: ReactNode }) {
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [guests, setGuests] = useState<FirebaseGuest[]>([]);
  const [tables, setTables] = useState<FirebaseTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isValidWeddingId(weddingId)) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNotFound(false);

      const docRef = doc(db, 'weddings', weddingId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const data = docSnap.data() as WeddingData;
      const hasBasicInfo = data.couple?.bride?.name || data.couple?.groom?.name || data.event?.date;

      let resolvedData: WeddingData;
      if (hasBasicInfo) {
        resolvedData = migrateWeddingData(data as unknown as Record<string, unknown>);
      } else {
        resolvedData = createInitialWeddingData(weddingId);
      }
      await saveWeddingDoc(docRef, resolvedData);
      setWeddingData(resolvedData);

      const [fetchedGuests, fetchedTables] = await Promise.all([
        guestService.getWeddingGuests(weddingId),
        tableService.getWeddingTables(weddingId),
      ]);
      setGuests(fetchedGuests);
      setTables(fetchedTables);
    } catch (err) {
      console.error('Error cargando datos del panel:', err);
      setError('Error al cargar los datos de la boda.');
    } finally {
      setLoading(false);
    }
  }, [weddingId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <PanelDataContext.Provider
      value={{
        weddingId,
        weddingData,
        guests,
        tables,
        loading,
        notFound,
        error,
        refetch: load,
        setWeddingData,
        setGuests,
        setTables,
      }}
    >
      {children}
    </PanelDataContext.Provider>
  );
}

export function usePanelData(): PanelDataValue {
  const ctx = useContext(PanelDataContext);
  if (!ctx) throw new Error('usePanelData fuera de PanelDataProvider');
  return ctx;
}
