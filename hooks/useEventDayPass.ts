'use client';

import { useEffect, useState } from 'react';
import { seatService } from '../services/seatService';
import { tableService } from '../services/tableService';
import { venueFixtureService } from '../services/venueFixtureService';
import { getSeatedGuestCount } from '../services/guestService';
import type { FirebaseGuest, FirebaseTable, FirebaseTableSeat, FirebaseVenueFixture } from '../src/types/wedding';

// Spec 32 — una persona de la invitación en el pase. `name` null = acompañante sin nombre, que el
// pase muestra con la clave traducida `eventDay.companion` ("Acompañante {n}").
export interface EventDayPerson {
  seatIndex: number;
  name: string | null;
  table: FirebaseTable | null;
}

export interface EventDayPassData {
  loading: boolean;
  people: EventDayPerson[];
  tables: FirebaseTable[];
  fixtures: FirebaseVenueFixture[];
  highlightedTableIds: string[];
}

const EMPTY: EventDayPassData = { loading: false, people: [], tables: [], fixtures: [], highlightedTableIds: [] };

// Nombre de cada persona, sin el texto fijo en español de getSeatDisplayName.
function personName(guest: FirebaseGuest, seatIndex: number): string | null {
  if (seatIndex === 0) return guest.name;
  if (seatIndex === 1 && guest.rsvpConfirmation?.plusOne?.name) return guest.rsvpConfirmation.plusOne.name;
  return null;
}

// Lee (sin escribir nada) las mesas de la invitación. Si la invitación no tiene `tableSeats`
// porque nunca se abrió en Mesas, todas sus personas usan el `guest.tableId` del spec 12.
// Si una lectura falla, el pase se queda sin esa sección en lugar de romperse.
export function useEventDayPass(guest: FirebaseGuest | null, enabled: boolean, withFloorPlan: boolean): EventDayPassData {
  // Resultado guardado junto con la llave (invitado + plano) que lo produjo. `loading` se deriva de
  // ahí, así que es verdadero desde el primer render en que el pase aplica, sin un instante vacío.
  const [result, setResult] = useState<{ key: string; data: EventDayPassData } | null>(null);
  const key = enabled && guest ? `${guest.id}|${withFloorPlan ? 1 : 0}` : '';

  useEffect(() => {
    if (!enabled || !guest) return;
    let cancelled = false;

    const safe = <T,>(p: Promise<T>, fallback: T) => p.catch(() => fallback);
    Promise.all([
      safe<FirebaseTableSeat[]>(seatService.getGuestSeats(guest.id), []),
      safe<FirebaseTable[]>(tableService.getWeddingTables(guest.weddingId), []),
      withFloorPlan ? safe<FirebaseVenueFixture[]>(venueFixtureService.getWeddingFixtures(guest.weddingId), []) : Promise.resolve([]),
    ]).then(([seats, tables, fixtures]) => {
      if (cancelled) return;
      const tableById = new Map(tables.map((t) => [t.id, t]));
      const count = getSeatedGuestCount(guest);
      const seatByIndex = new Map(seats.map((s) => [s.seatIndex, s]));
      const people: EventDayPerson[] = [];
      for (let i = 0; i < count; i += 1) {
        const tableId = seats.length > 0 ? seatByIndex.get(i)?.tableId : guest.tableId;
        people.push({ seatIndex: i, name: personName(guest, i), table: (tableId && tableById.get(tableId)) || null });
      }
      const highlightedTableIds = Array.from(new Set(people.map((p) => p.table?.id).filter((id): id is string => !!id)));
      setResult({ key: `${guest.id}|${withFloorPlan ? 1 : 0}`, data: { loading: false, people, tables, fixtures, highlightedTableIds } });
    });

    return () => {
      cancelled = true;
    };
  }, [guest, enabled, withFloorPlan]);

  if (!key) return EMPTY;
  if (result?.key !== key) return { ...EMPTY, loading: true };
  return result.data;
}
