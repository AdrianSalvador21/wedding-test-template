'use client';

import { ArrowLeft, Check, Undo2 } from 'lucide-react';
import type { CheckInSnapshot, CheckInSnapshotGuest } from '../../src/types/wedding';
import { arrivedCount, checkInKey, personLabel } from '../../lib/checkIn';
import EventDayFloorPlan, { hasPlacedTables } from '../eventDay/EventDayFloorPlan';
import type { FirebaseTable, FirebaseVenueFixture } from '../../src/types/wedding';
import { BTN_OK, BTN_PRIMARY, Badge, CARD, NEUTRAL_PLAN, guestBadges, tableNamesOf, time } from './ui';
import { TableIcon } from '../eventDay/EventDayReopenButton';

// Spec 33 — ficha del invitado en el modo hostess: una fila por persona con "Marcar llegada" o
// "Llegó · hora" + "Deshacer", "Llegaron todos", "Cambiar mesa" y el plano con sus mesas.

export default function GuestSheet({
  view,
  guest,
  onArrive,
  onUndo,
  onMove,
  onBack,
}: {
  view: CheckInSnapshot;
  guest: CheckInSnapshotGuest;
  onArrive: (seatIndexes: number[]) => void;
  onUndo: (seatIndex: number) => void;
  onMove: (seatIndex: number) => void;
  onBack?: () => void;
}) {
  const names = tableNamesOf(view);
  const arrived = arrivedCount(view, guest);
  const missing = Array.from({ length: guest.count }, (_, i) => i).filter((i) => !view.checkIns[checkInKey(guest.docId, i)]?.arrived);
  const ownTables = Array.from(new Set(guest.seats.filter((id): id is string => !!id)));
  const showPlan = hasPlacedTables(view.tables as FirebaseTable[], ownTables);
  const lastBy = Array.from({ length: guest.count }, (_, i) => view.checkIns[checkInKey(guest.docId, i)])
    .filter((c) => c?.arrived)
    .sort((a, b) => ((a!.at < b!.at) ? 1 : -1))[0];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {onBack && (
        <header className="flex items-center border-b border-[rgba(0,0,0,0.06)] bg-white px-2 py-2.5">
          <button type="button" onClick={onBack} className="inline-flex h-11 items-center gap-1 px-2.5 text-[15px] font-semibold text-[#0A0A0A]">
            <ArrowLeft className="h-5 w-5" />
            Lista
          </button>
        </header>
      )}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 md:px-7 md:py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-1.5">
            <h2 className="m-0 text-[26px] font-semibold tracking-[-0.02em] text-[#0A0A0A] md:text-[30px]">{guest.name}</h2>
            <span className="text-[15px] text-[#3F3F46]">
              {guest.count} {guest.count === 1 ? 'persona' : 'personas'} ·{' '}
              <span className={`font-semibold ${arrived > 0 ? 'text-[#15803D]' : 'text-[#71717A]'}`}>
                {arrived === guest.count ? 'llegaron todos' : `${arrived} de ${guest.count} llegaron`}
              </span>
            </span>
            {guestBadges(view, guest).length > 0 && (
              <span className="flex flex-wrap gap-1.5">
                {guestBadges(view, guest).map((b) => (
                  <Badge key={b.text} tone={b.tone}>
                    {b.text}
                  </Badge>
                ))}
              </span>
            )}
          </div>
          {missing.length > 0 && guest.count > 1 && (
            <button type="button" data-track-action="checkin_all" onClick={() => onArrive(missing)} className={`${BTN_OK} h-[52px] px-5 text-[16px]`}>
              <Check className="h-5 w-5" strokeWidth={2.4} />
              Llegaron todos
            </button>
          )}
        </div>

        <div className={`grid items-start gap-4 ${showPlan ? 'lg:grid-cols-[minmax(0,1fr)_332px]' : ''}`}>
          <section aria-label="Personas" className={`${CARD} overflow-hidden`}>
            {Array.from({ length: guest.count }, (_, i) => {
              const rec = view.checkIns[checkInKey(guest.docId, i)];
              const tableId = guest.seats[i];
              const tableName = tableId ? names.get(tableId) : null;
              return (
                <div key={i} className={`flex items-center justify-between gap-3 px-4 py-3.5 md:px-5 md:py-4 ${i > 0 ? 'border-t border-[rgba(0,0,0,0.06)]' : ''}`}>
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <span className="text-[15px] font-semibold text-[#0A0A0A] md:text-base">{personLabel(guest, i)}</span>
                    <span className="flex flex-wrap items-center gap-x-3.5 gap-y-1">
                      <span className={`inline-flex items-center gap-1.5 text-[13px] md:text-sm ${tableName ? 'text-[#3F3F46]' : 'text-[#78350F]'}`}>
                        <TableIcon size={15} color={tableName ? '#71717A' : '#B45309'} />
                        {tableName || 'Sin mesa'}
                      </span>
                      <button type="button" onClick={() => onMove(i)} className="text-[13px] font-semibold text-[#AE5730] md:text-sm">
                        Cambiar mesa
                      </button>
                    </span>
                  </div>
                  {rec?.arrived ? (
                    <div className="flex flex-col items-end gap-1.5 md:flex-row md:items-center md:gap-2.5">
                      <span className="inline-flex h-[34px] items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3 text-[13px] font-semibold text-[#15803D] md:h-10 md:text-sm">
                        <Check className="h-4 w-4" strokeWidth={2.4} />
                        Llegó · {time(rec.arrivedAt || rec.at)}
                      </span>
                      <button type="button" onClick={() => onUndo(i)} className="inline-flex h-9 items-center gap-1.5 rounded-[10px] px-2 text-[13px] font-semibold text-[#3F3F46] md:border md:border-[rgba(0,0,0,0.14)] md:bg-white md:px-3">
                        <Undo2 className="h-4 w-4" />
                        Deshacer
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => onArrive([i])} className={`${BTN_PRIMARY} h-11 flex-shrink-0 text-[14px] md:h-12 md:px-5 md:text-[15px]`}>
                      Marcar llegada
                    </button>
                  )}
                </div>
              );
            })}
          </section>

          {showPlan && (
            <section aria-label="Dónde se sienta" className={`${CARD} flex flex-col gap-2.5 p-3.5`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0A0A0A]">Dónde se sienta</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#AE5730]">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#AE5730]" />
                  {ownTables.map((id) => names.get(id)).filter(Boolean).join(', ')}
                </span>
              </div>
              <EventDayFloorPlan
                tables={view.tables as FirebaseTable[]}
                fixtures={view.fixtures as FirebaseVenueFixture[]}
                highlightedTableIds={ownTables}
                theme={NEUTRAL_PLAN}
                labels={{ aria: 'Plano del salón con sus mesas resaltadas', you: 'Su mesa', near: 'Cerca de su mesa', whole: 'Todo el salón', nearHint: 'Acercado a su mesa porque el salón tiene muchas mesas.', wholeHint: 'Todas las mesas. La suya sigue resaltada.' }}
              />
            </section>
          )}
        </div>

        {lastBy && <p className="m-0 text-[13px] text-[#71717A]">Última llegada marcada por {lastBy.by} · {time(lastBy.at)}</p>}
      </div>
    </div>
  );
}
