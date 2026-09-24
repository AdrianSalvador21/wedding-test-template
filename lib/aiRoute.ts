import { NextResponse } from 'next/server';
import type { UsageResult } from './aiUsage';

export function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && !/[^a-zA-Z0-9\-_]/.test(id);
}

export function clampText(value: unknown, max = 2000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Devuelve el resultado junto con `usage` (usos consumidos y límite del
// contador), para que el editor muestre cuántos quedan sin volver a leer Firestore.
export function usageResponse<T extends object>(result: UsageResult<T>) {
  if (result.ok) return NextResponse.json({ ...result.data, usage: result.usage });
  if (result.reason === 'limit_reached') {
    return NextResponse.json(
      { error: 'limit_reached', limit: result.limit, usage: { key: result.key, used: result.limit, limit: result.limit } },
      { status: 429 }
    );
  }
  return NextResponse.json({ error: result.message || 'Error generando el texto' }, { status: 500 });
}

export interface VenueInput {
  name: string;
  address: string;
}

export function parseVenue(value: unknown): VenueInput {
  const v = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;
  return { name: clampText(v.name, 200), address: clampText(v.address, 300) };
}

export function venuesBlock(ceremony: VenueInput, reception: VenueInput): string {
  const line = (label: string, v: VenueInput) =>
    `${label}: ${[v.name, v.address].filter(Boolean).join(' — ') || 'no especificado'}`;
  return `${line('Ceremonia', ceremony)}\n${line('Recepción', reception)}`;
}

export function hasAddress(...venues: VenueInput[]): boolean {
  return venues.some((v) => v.address.length >= 5);
}

export function invalidId() {
  return NextResponse.json({ error: 'Invalid wedding ID' }, { status: 400 });
}
