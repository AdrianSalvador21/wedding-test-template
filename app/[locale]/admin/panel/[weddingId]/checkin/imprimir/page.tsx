'use client';

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Printer, X } from 'lucide-react';
import { useAuth } from '../../../../../../../lib/auth-context';
import { checkInKey, normalizeSearch, personLabel, surnameSortKey } from '../../../../../../../lib/checkIn';
import type { CheckInSnapshot, CheckInSnapshotGuest } from '../../../../../../../src/types/wedding';

// Spec 33 — lista impresa de respaldo del check-in (`?orden=apellido|mesa`), lista para imprimir o
// guardar como PDF en hoja carta. Se dibuja en un portal fuera del marco del panel para que la
// impresión no herede su altura fija ni su menú.

const PRINT_CSS = `
@media print {
  @page { size: letter; margin: 14mm 12mm; }
  body > *:not(#checkin-print-root) { display: none !important; }
  #checkin-print-root { position: static !important; overflow: visible !important; height: auto !important; }
  .no-print { display: none !important; }
  tr, .keep { break-inside: avoid; }
}
`;

const box = <span className="inline-block h-4 w-4 rounded-[3px] border-[1.5px] border-[#3F3F46] align-middle" />;
const done = (
  <span className="inline-flex h-4 w-4 items-center justify-center rounded-[3px] border-[1.5px] border-[#15803D] align-middle text-[11px] font-semibold text-[#15803D]">✓</span>
);

// "Carlos Hernández López" → "Hernández López, Carlos".
function surnameFirst(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return name;
  return `${words.slice(1).join(' ')}, ${words[0]}`;
}

function notesOf(g: CheckInSnapshotGuest): string {
  const notes: string[] = [];
  if (g.status === 'pending') notes.push('No confirmó');
  if (g.status === 'declined') notes.push('Declinó');
  if (g.addedAtDoor) notes.push('Agregado en la entrada');
  return notes.join(' · ');
}

export default function CheckInPrintPage() {
  const params = useParams();
  const search = useSearchParams();
  const weddingId = params.weddingId as string;
  const locale = (params.locale as string) || 'es';
  const router = useRouter();
  const order = search?.get('orden') === 'mesa' ? 'mesa' : 'apellido';
  const auth = useAuth();
  const [snapshot, setSnapshot] = useState<CheckInSnapshot | null>(null);
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const printedAt = useMemo(() => new Date(), []);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    auth
      .authedFetch(`/api/panel/check-in/${weddingId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { snapshot: CheckInSnapshot }) => setSnapshot(d.snapshot))
      .catch(() => setError(true));
  }, [auth, weddingId]);

  const names = useMemo(() => new Map((snapshot?.tables || []).map((t) => [t.id, t.name])), [snapshot]);
  const totalPeople = snapshot ? snapshot.guests.reduce((s, g) => s + g.count, 0) : 0;

  const bySurname = useMemo(() => {
    if (!snapshot) return [];
    return [...snapshot.guests].sort((a, b) => surnameSortKey(a.name).localeCompare(surnameSortKey(b.name), 'es'));
  }, [snapshot]);

  const byTable = useMemo(() => {
    if (!snapshot) return [];
    const groups = new Map<string, { name: string; rows: { label: string; key: string; arrived: boolean; note: string }[] }>();
    const noTable = { name: 'Sin mesa', rows: [] as { label: string; key: string; arrived: boolean; note: string }[] };
    snapshot.tables.forEach((t) => groups.set(t.id, { name: t.name, rows: [] }));
    snapshot.guests.forEach((g) => {
      for (let i = 0; i < g.count; i += 1) {
        const base = personLabel(g, i);
        const label = i === 0 ? surnameFirst(base) : `${base}${base.startsWith('Acompañante') ? ` (de ${g.name})` : ''}`;
        const row = { label, key: checkInKey(g.docId, i), arrived: !!snapshot.checkIns[checkInKey(g.docId, i)]?.arrived, note: i === 0 ? notesOf(g) : '' };
        const id = g.seats[i];
        (id && groups.get(id) ? groups.get(id)! : noTable).rows.push(row);
      }
    });
    const list = Array.from(groups.values())
      .filter((gr) => gr.rows.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { numeric: true }));
    list.forEach((gr) => gr.rows.sort((a, b) => normalizeSearch(a.label).localeCompare(normalizeSearch(b.label), 'es')));
    if (noTable.rows.length) list.push(noTable);
    return list;
  }, [snapshot]);

  if (!mounted) return null;

  const content = (
    <div id="checkin-print-root" className="fixed inset-0 z-[100] overflow-y-auto bg-white text-[#0A0A0A]" style={{ fontFamily: 'var(--font-manrope), sans-serif' }}>
      <style>{PRINT_CSS}</style>
      <div className="no-print sticky top-0 flex items-center justify-between gap-3 border-b border-[rgba(0,0,0,0.08)] bg-white px-5 py-3">
        <span className="text-sm font-semibold">Vista para imprimir · {order === 'mesa' ? 'por mesa' : 'por apellido'}</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} disabled={!snapshot} className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#111111] px-4 text-sm font-semibold text-white disabled:opacity-50">
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
          <button type="button" onClick={() => router.push(`/${locale}/admin/panel/${weddingId}/checkin`)} className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[rgba(0,0,0,0.14)] px-3 text-sm font-semibold">
            <X className="h-4 w-4" />
            Cerrar
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[816px] px-8 py-10 print:max-w-none print:p-0">
        {!snapshot && !error && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {error && <p className="py-20 text-center text-sm text-[#B91C1C]">No pudimos cargar la lista. Cierra esta pestaña y vuelve a intentarlo.</p>}
        {snapshot && (
          <>
            <header className="mb-5 flex items-end justify-between gap-4 border-b-2 border-[#0A0A0A] pb-3.5">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#71717A]">Lista de check-in · {order === 'mesa' ? 'por mesa' : 'por apellido'}</span>
                <span className="text-2xl font-semibold">
                  {snapshot.wedding.bride} &amp; {snapshot.wedding.groom}
                </span>
              </div>
              <span className="text-right text-xs leading-relaxed text-[#3F3F46]">
                {snapshot.wedding.date && (
                  <>
                    {new Date(snapshot.wedding.date).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Mexico_City' })}
                    <br />
                  </>
                )}
                Impresa el {printedAt.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Mexico_City' })} · {snapshot.guests.length} invitaciones · {totalPeople} personas
              </span>
            </header>

            {order === 'apellido' ? (
              <table className="w-full border-collapse text-[15px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.06em] text-[#71717A]">
                    <th className="w-[46px] px-2 py-1.5">Llegó</th>
                    <th className="px-2 py-1.5">Apellido, nombre</th>
                    <th className="w-[76px] px-2 py-1.5 text-center">Personas</th>
                    <th className="px-2 py-1.5">Mesa</th>
                    <th className="px-2 py-1.5">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {bySurname.map((g) => {
                    const arrived = Array.from({ length: g.count }, (_, i) => !!snapshot.checkIns[checkInKey(g.docId, i)]?.arrived).filter(Boolean).length;
                    const tables = Array.from({ length: g.count }, (_, i) => (g.seats[i] ? names.get(g.seats[i]!) || 'Mesa' : 'sin mesa'));
                    const uniq = Array.from(new Set(tables));
                    return (
                      <tr key={g.docId} className="border-b border-[#E4E4E7]">
                        <td className="px-2 py-2.5">{arrived === g.count && g.count > 0 ? done : box}</td>
                        <td className="px-2 py-2.5 font-semibold">{surnameFirst(g.name)}</td>
                        <td className="px-2 py-2.5 text-center">{arrived > 0 && arrived < g.count ? `${arrived}/${g.count}` : g.count}</td>
                        <td className="px-2 py-2.5">{uniq.length === 1 ? uniq[0].replace(/^sin mesa$/, 'Sin mesa') : tables.join(', ')}</td>
                        <td className="px-2 py-2.5 text-[#3F3F46]">{notesOf(g)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                {byTable.map((gr) => (
                  <section key={gr.name} className="keep flex flex-col">
                    <div className="flex items-baseline justify-between border-b-[1.5px] border-[#0A0A0A] py-1.5">
                      <span className="text-base font-semibold">{gr.name}</span>
                      <span className="text-xs text-[#71717A]">
                        {gr.rows.length} {gr.rows.length === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                    {gr.rows.map((r) => (
                      <div key={r.key} className="flex items-center gap-2.5 border-b border-[#E4E4E7] py-[7px] text-sm">
                        {r.arrived ? done : box}
                        <span>
                          {r.label}
                          {r.note ? <span className="text-[#71717A]"> · {r.note}</span> : null}
                        </span>
                      </div>
                    ))}
                  </section>
                ))}
              </div>
            )}
            <footer className="mt-8 flex justify-between text-[11px] text-[#71717A]">
              <span>invyta · check-in</span>
              <span>✓ = ya marcado en el check-in al imprimir</span>
            </footer>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
