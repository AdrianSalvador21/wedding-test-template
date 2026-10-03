'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { Plus, Search, LayoutGrid, Map as MapIcon, Users, Settings } from 'lucide-react';
import { db } from '../../../../../lib/firebase';
import { guestService, resolveGuestAttendance, getSeatedGuestCount } from '../../../../../services/guestService';
import { tableService } from '../../../../../services/tableService';
import { venueFixtureService } from '../../../../../services/venueFixtureService';
import { seatService } from '../../../../../services/seatService';
import { track } from '../../../../../lib/analytics/client';
import { isValidWeddingId } from '../../../../../lib/wedding-defaults';
import { FirebaseGuest, FirebaseTable, FirebaseTableSeat, FirebaseVenueFixture } from '../../../../../src/types/wedding';
import WeddingNotFound from '../../../../../components/WeddingNotFound';
import AuthGuard from '../../../../../components/admin/AuthGuard';
import { AdminTopBar, AdminPageNav, AdminStatCard, AdminStatusPill, AdminButton, manrope, displayFont } from '../../../../../components/admin/ui';
import { FreeWeddingSettingsModal } from '../../../../../components/admin/FreeWeddingTools';
import TableTile from '../../../../../components/admin/tables/TableTile';
import TableDetailPanel, { type TableDetailTarget } from '../../../../../components/admin/tables/TableDetailPanel';
import TableFormModal, { type TableFormValues } from '../../../../../components/admin/tables/TableFormModal';
import DeleteTableConfirmModal from '../../../../../components/admin/tables/DeleteTableConfirmModal';
import PlanoCanvas from '../../../../../components/admin/tables/PlanoCanvas';
import { computeOccupancyByTable, getOccupancyState, getUnseatedCount } from '../../../../../components/admin/tables/occupancy';

type OccupancyFilter = 'all' | 'space' | 'full' | 'over';

const AdminTablesContent = () => {
  const params = useParams();
  const weddingId = params.weddingId as string;
  const locale = (params.locale as string) || 'es';

  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Spec 16 — ausente se interpreta como 'template' (bodas creadas antes de este spec)
  const [tier, setTier] = useState<'free' | 'template'>('template');
  const [showFreeSettings, setShowFreeSettings] = useState(false);

  const [guests, setGuests] = useState<FirebaseGuest[]>([]);
  const [tables, setTables] = useState<FirebaseTable[]>([]);
  const [fixtures, setFixtures] = useState<FirebaseVenueFixture[]>([]);
  const [seats, setSeats] = useState<FirebaseTableSeat[]>([]);

  const [view, setView] = useState<'grid' | 'plano'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [occupancyFilter, setOccupancyFilter] = useState<OccupancyFilter>('all');

  const [panelTarget, setPanelTarget] = useState<TableDetailTarget | null>(null);
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<FirebaseTable | null>(null);
  const [deletingTable, setDeletingTable] = useState<FirebaseTable | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!weddingId) {
        setError('ID de boda no proporcionado.');
        setIsLoading(false);
        return;
      }
      if (!isValidWeddingId(weddingId)) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const weddingDoc = await getDoc(doc(db, 'weddings', weddingId));
        if (!weddingDoc.exists()) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        setTier(weddingDoc.data()?.tier === 'free' ? 'free' : 'template');

        const [fetchedGuests, fetchedTables, fetchedFixtures] = await Promise.all([
          guestService.getWeddingGuests(weddingId),
          tableService.getWeddingTables(weddingId),
          venueFixtureService.getWeddingFixtures(weddingId),
        ]);

        // Toda boda debe arrancar con Escenario y Pista de baile ya colocados en el Plano;
        // se crean solo si todavía no existen (no se duplican en cargas siguientes).
        const fixturesWithDefaults = await venueFixtureService.ensureDefaultFixtures(weddingId, fetchedFixtures);
        // Spec 23 — genera de forma perezosa los sub-asientos faltantes de cada invitado
        // (incluida la migración transparente desde su `tableId` anterior, si lo tenía).
        const ensuredSeats = await seatService.ensureWeddingSeats(fetchedGuests);

        setGuests(fetchedGuests);
        setTables(fetchedTables);
        setFixtures(fixturesWithDefaults);
        setSeats(ensuredSeats);
      } catch (err) {
        console.error('Error cargando mesas:', err);
        setError('Error al cargar las mesas. Intenta de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [weddingId]);

  const occupancyByTable = useMemo(() => computeOccupancyByTable(seats), [seats]);
  const unseatedCount = useMemo(() => getUnseatedCount(seats), [seats]);

  // Spec 16 — cuenta también a los confirmados a mano (rsvpStatus), no solo por RSVP público.
  const confirmedPersons = useMemo(
    () => guests.reduce((sum, g) => (resolveGuestAttendance(g) === 'confirmed' ? sum + getSeatedGuestCount(g) : sum), 0),
    [guests]
  );

  const tablesFull = useMemo(
    () => tables.filter((t) => getOccupancyState(occupancyByTable.get(t.id) || 0, t.capacity) === 'full').length,
    [tables, occupancyByTable]
  );
  const tablesOverCapacity = useMemo(
    () => tables.filter((t) => getOccupancyState(occupancyByTable.get(t.id) || 0, t.capacity) === 'over').length,
    [tables, occupancyByTable]
  );

  const filteredTables = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tables.filter((t) => {
      const occupied = occupancyByTable.get(t.id) || 0;
      const state = getOccupancyState(occupied, t.capacity);
      if (occupancyFilter === 'space' && !(state === 'space' || state === 'empty')) return false;
      if (occupancyFilter === 'full' && state !== 'full') return false;
      if (occupancyFilter === 'over' && state !== 'over') return false;
      if (!term) return true;
      if (t.name.toLowerCase().includes(term)) return true;
      const seatedGuestIds = new Set(seats.filter((s) => s.tableId === t.id).map((s) => s.guestId));
      return guests.some((g) => seatedGuestIds.has(g.id) && g.name.toLowerCase().includes(term));
    });
  }, [tables, guests, seats, occupancyByTable, occupancyFilter, searchTerm]);

  const handleAssignSeat = async (seatId: string, tableId: string | null) => {
    await seatService.assignSeatToTable(seatId, tableId);
    setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, tableId } : s)));
    track('guest_assigned_to_table', {});
  };

  const handleCreateOrUpdateTable = async (values: TableFormValues) => {
    if (editingTable) {
      await tableService.updateTable(editingTable.id, values);
      setTables((prev) => prev.map((t) => (t.id === editingTable.id ? { ...t, ...values } : t)));
    } else {
      const id = await tableService.createTable({ weddingId, ...values });
      const now = new Date().toISOString();
      setTables((prev) => [...prev, { id, weddingId, ...values, createdAt: now, updatedAt: now }]);
      track('table_created', {});
    }
    setShowTableForm(false);
    setEditingTable(null);
  };

  const openDeleteTable = (table: FirebaseTable) => setDeletingTable(table);

  const confirmDeleteTable = async () => {
    if (!deletingTable) return;
    await tableService.deleteTable(deletingTable.id, weddingId);
    setSeats((prev) => prev.map((s) => (s.tableId === deletingTable.id ? { ...s, tableId: null } : s)));
    setTables((prev) => prev.filter((t) => t.id !== deletingTable.id));
    track('table_deleted', {});
    if (panelTarget?.type === 'table' && panelTarget.table.id === deletingTable.id) setPanelTarget(null);
    setDeletingTable(null);
  };

  const affectedPersonCount = useMemo(
    () => (deletingTable ? seats.filter((s) => s.tableId === deletingTable.id).length : 0),
    [deletingTable, seats]
  );

  // El panel se re-lee de los arrays vivos (guests/tables) para no quedar con datos viejos tras asignar.
  const livePanelTarget: TableDetailTarget | null = useMemo(() => {
    if (!panelTarget) return null;
    if (panelTarget.type === 'unassigned') return { type: 'unassigned' };
    const fresh = tables.find((t) => t.id === panelTarget.table.id);
    return fresh ? { type: 'table', table: fresh } : null;
  }, [panelTarget, tables]);

  if (isLoading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[rgba(0,0,0,0.14)] border-t-[#111111] rounded-full mx-auto mb-4"></div>
          <p className="text-[#3F3F46]" style={manrope}>Cargando mesas...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <WeddingNotFound weddingId={weddingId} />;
  }

  if (error) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#FAFAFA] flex items-center justify-center" style={manrope}>
        <div className="text-center py-12">
          <div className="text-6xl text-[#D4D4D8] mb-6">⚠</div>
          <h3 className="text-2xl text-[#0A0A0A] mb-3" style={displayFont}>Error</h3>
          <p className="text-[#3F3F46]">{error}</p>
        </div>
      </div>
    );
  }

  const filterChipClass = (active: boolean) =>
    `px-3.5 py-2 text-[13px] font-bold rounded-full border transition-colors ${
      active ? 'bg-[#111111] text-white border-[#111111]' : 'bg-[#FAFAFA] text-[#3F3F46] border-[rgba(0,0,0,0.1)] hover:bg-white'
    }`;

  const viewToggleClass = (active: boolean) =>
    `flex items-center gap-1.5 text-[12.5px] font-bold px-3.5 py-2 rounded-lg transition-colors ${
      active ? 'bg-white text-[#0A0A0A] shadow-sm' : 'text-[#71717A]'
    }`;

  return (
    <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA]" style={manrope}>
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-10 py-3.5 flex items-center justify-between gap-4">
        <a href="/" className="text-xl sm:text-2xl text-[#0A0A0A] hover:opacity-70 transition-opacity" style={displayFont}>
          invyta
        </a>
        {weddingId && <AdminPageNav weddingId={weddingId} locale={locale} active="tables" tier={tier} />}
      </div>

      <AdminTopBar
        title="Gestión de Mesas"
        meta={
          tier === 'free' ? (
            <>
              <AdminStatusPill tone="free">Gratis</AdminStatusPill>
              <button
                type="button"
                onClick={() => setShowFreeSettings(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#71717A] hover:text-[#0A0A0A]"
              >
                <Settings className="h-3.5 w-3.5" />
                Ajustes
              </button>
            </>
          ) : undefined
        }
        actions={
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1 bg-[#F4F4F5] rounded-lg p-1">
              <button type="button" onClick={() => setView('grid')} className={viewToggleClass(view === 'grid')}>
                <LayoutGrid className="w-3.5 h-3.5" /> Cuadrícula
              </button>
              <button
                type="button"
                onClick={() => {
                  if (view !== 'plano') track('plano_view_opened', {});
                  setView('plano');
                }}
                className={viewToggleClass(view === 'plano')}
              >
                <MapIcon className="w-3.5 h-3.5" /> Plano
              </button>
            </div>
            <AdminButton
              onClick={() => {
                setEditingTable(null);
                setShowTableForm(true);
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva mesa</span>
              <span className="sm:hidden">Nueva</span>
            </AdminButton>
          </div>
        }
      />
      {showFreeSettings && (
        <FreeWeddingSettingsModal
          weddingId={weddingId}
          onClose={() => setShowFreeSettings(false)}
          onSaved={() => window.location.reload()}
        />
      )}
      {tier === 'free' && (
        <div className="bg-[#F4F4F5] border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-10 py-2.5 text-[13px] text-[#3F3F46]">
          La Cuadrícula y el Plano funcionan igual que con una invitación digital.
        </div>
      )}

      <div className="px-4 sm:px-10 py-6 sm:py-8 flex flex-col gap-5" style={{ minHeight: 'calc(100vh - 140px)' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <AdminStatCard icon={LayoutGrid} label="Mesas creadas" value={tables.length} tone="ink" />
          <AdminStatCard icon={Users} label="Invitados sin mesa" value={unseatedCount} tone="pending" />
          <AdminStatCard icon={Users} label="Mesas en su límite" value={tablesFull + tablesOverCapacity} tone={tablesOverCapacity > 0 ? 'danger' : 'ink'} />
          <AdminStatCard icon={Users} label="Personas confirmadas" value={confirmedPersons} tone="success" />
        </div>

        {view === 'grid' ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="h-4 w-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar mesa o invitado"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[rgba(0,0,0,0.14)] text-sm text-[#0A0A0A] bg-white focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setOccupancyFilter('all')} className={filterChipClass(occupancyFilter === 'all')}>
                  Todas ({tables.length})
                </button>
                <button onClick={() => setOccupancyFilter('space')} className={filterChipClass(occupancyFilter === 'space')}>
                  Con espacio
                </button>
                <button onClick={() => setOccupancyFilter('full')} className={filterChipClass(occupancyFilter === 'full')}>
                  Llenas ({tablesFull})
                </button>
                <button onClick={() => setOccupancyFilter('over')} className={filterChipClass(occupancyFilter === 'over')}>
                  Excedidas ({tablesOverCapacity})
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPanelTarget({ type: 'unassigned' })}
              className="w-full flex items-center justify-between gap-4 bg-[#FAFAFA] border-[1.5px] border-dashed border-[rgba(0,0,0,0.18)] rounded-xl px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#475569] flex-shrink-0" />
                <span className="text-[13.5px] font-extrabold text-[#0A0A0A] whitespace-nowrap">Sin mesa</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[rgba(71,85,105,0.08)] text-[#475569] whitespace-nowrap">
                  {unseatedCount} personas
                </span>
              </div>
              <span className="text-[12.5px] font-bold text-[#0A0A0A] whitespace-nowrap pl-2">Ver y asignar →</span>
            </button>

            {filteredTables.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[#71717A] font-medium">
                  {tables.length === 0 ? 'Todavía no hay mesas. Crea la primera con "Nueva mesa".' : 'Sin resultados con estos filtros.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {filteredTables.map((table) => (
                  <TableTile
                    key={table.id}
                    table={table}
                    occupied={occupancyByTable.get(table.id) || 0}
                    selected={panelTarget?.type === 'table' && panelTarget.table.id === table.id}
                    onOpen={() => setPanelTarget({ type: 'table', table })}
                    onEdit={() => {
                      setEditingTable(table);
                      setShowTableForm(true);
                    }}
                    onDelete={() => openDeleteTable(table)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <PlanoCanvas
            weddingId={weddingId}
            tables={tables}
            fixtures={fixtures}
            guests={guests}
            seats={seats}
            occupancyByTable={occupancyByTable}
            onSelectTable={(table) => setPanelTarget({ type: 'table', table })}
            onTableUpdated={(updated) => setTables((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))}
            onFixtureCreated={(fixture) => setFixtures((prev) => [...prev, fixture])}
            onFixtureUpdated={(updated) => setFixtures((prev) => prev.map((f) => (f.id === updated.id ? updated : f)))}
            onFixtureDeleted={(id) => setFixtures((prev) => prev.filter((f) => f.id !== id))}
            onAssignSeat={handleAssignSeat}
          />
        )}
      </div>

      <AnimatePresence>
        {livePanelTarget && (
          <TableDetailPanel
            key="table-detail-panel"
            target={livePanelTarget}
            guests={guests}
            tables={tables}
            seats={seats}
            occupancyByTable={occupancyByTable}
            onAssignSeat={handleAssignSeat}
            onClose={() => setPanelTarget(null)}
            onEditTable={
              livePanelTarget.type === 'table'
                ? () => {
                    setEditingTable(livePanelTarget.table);
                    setShowTableForm(true);
                  }
                : undefined
            }
            onDeleteTable={livePanelTarget.type === 'table' ? () => openDeleteTable(livePanelTarget.table) : undefined}
          />
        )}
      </AnimatePresence>

      {showTableForm && (
        <TableFormModal
          table={editingTable}
          onSubmit={handleCreateOrUpdateTable}
          onClose={() => {
            setShowTableForm(false);
            setEditingTable(null);
          }}
        />
      )}

      {deletingTable && (
        <DeleteTableConfirmModal
          table={deletingTable}
          affectedPersonCount={affectedPersonCount}
          onConfirm={confirmDeleteTable}
          onClose={() => setDeletingTable(null)}
        />
      )}
    </div>
  );
};

const AdminTablesPage = () => {
  const params = useParams();
  return (
    <AuthGuard weddingId={params.weddingId as string}>
      <AdminTablesContent />
    </AuthGuard>
  );
};

export default AdminTablesPage;
