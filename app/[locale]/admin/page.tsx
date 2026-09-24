'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CalendarDays, Mail, Pencil, Plus, Search, Settings, Users } from 'lucide-react';
import { manrope, displayFont } from '../../../components/admin/ui';
import AccountControls from '../../../components/admin/AccountControls';
import {
  AuthErrorScreen,
  LoadingScreen,
  NoWeddingsScreen,
  VerifyEmailScreen,
  formatWeddingDate,
} from '../../../components/admin/auth-ui';
import { NewWeddingModal, OwnersModal, SettingsModal } from '../../../components/admin/OperatorTools';
import { useAuth, type LinkedWedding } from '../../../lib/auth-context';

function WeddingCard({
  wedding,
  locale,
  compact,
  onEditOwners,
  onSettings,
}: {
  wedding: LinkedWedding;
  locale: string;
  compact?: boolean;
  onEditOwners?: () => void;
  onSettings?: () => void;
}) {
  const date = formatWeddingDate(wedding.date);
  const owners = wedding.ownerEmails;
  const actionClass =
    'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-lg text-sm font-bold transition-colors border';
  return (
    <div className={`bg-white border border-[rgba(0,0,0,0.08)] rounded-[14px] flex flex-col min-w-0 ${compact ? 'p-[18px] gap-3.5' : 'p-[22px] gap-[18px]'}`}>
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className={`font-extrabold tracking-[-0.01em] text-[#0A0A0A] break-words ${compact ? 'text-[17px]' : 'text-xl'}`}>{wedding.title}</div>
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              aria-label={`Ajustes de ${wedding.title}`}
              className="h-9 w-9 -mt-1.5 -mr-1.5 flex-shrink-0 flex items-center justify-center rounded-lg text-[#71717A] hover:bg-[#F4F4F5] hover:text-[#0A0A0A]"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>
        {date && (
          <div className="flex items-center gap-2 text-[13px] text-[#3F3F46]">
            <CalendarDays className="h-3.5 w-3.5" />
            {date}
          </div>
        )}
        <div className="text-xs text-[#71717A] font-mono break-all">{wedding.id}</div>
        {onEditOwners && (
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <Mail className="h-3.5 w-3.5" />
            {owners?.length ? `${owners.length} ${owners.length === 1 ? 'correo' : 'correos'} con acceso` : 'Sin correos con acceso'}
            <button type="button" onClick={onEditOwners} className="font-bold text-[#0A0A0A] hover:underline">
              Editar
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={`/${locale}/admin/wedding-editor/${wedding.id}`} className={`${actionClass} bg-[#111111] text-white border-transparent hover:bg-black`}>
          <Pencil className="h-[15px] w-[15px]" />
          Editor
        </a>
        <a href={`/${locale}/admin/guests/${wedding.id}`} className={`${actionClass} bg-white text-[#0A0A0A] border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA]`}>
          <Users className="h-[15px] w-[15px]" />
          Invitados
        </a>
      </div>
    </div>
  );
}

export default function AdminHomePage() {
  const auth = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';

  const [query, setQuery] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [ownersFor, setOwnersFor] = useState<LinkedWedding | null>(null);
  const [settingsFor, setSettingsFor] = useState<LinkedWedding | null>(null);

  useEffect(() => {
    if (auth.status === 'signedOut') router.replace(`/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`);
  }, [auth.status, locale, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auth.weddings;
    return auth.weddings.filter((w) => w.title.toLowerCase().includes(q) || w.id.toLowerCase().includes(q));
  }, [auth.weddings, query]);

  if (auth.status === 'loading' || auth.status === 'signedOut') return <LoadingScreen />;
  if (auth.status === 'unverified') return <VerifyEmailScreen />;
  if (auth.status === 'error') return <AuthErrorScreen />;
  if (auth.status === 'noWeddings') return <NoWeddingsScreen />;

  const refreshSilently = () => void auth.refresh({ silent: true });
  const empty = auth.weddings.length === 0;

  return (
    <div className="admin-form min-h-screen bg-[#FAFAFA]" style={manrope}>
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-10 h-[60px] flex items-center justify-between gap-4">
        <span className="text-xl sm:text-2xl text-[#0A0A0A]" style={displayFont}>
          invyta
        </span>
        <AccountControls />
      </div>

      <div className="px-4 sm:px-10 py-8 sm:py-10">
        <div className="max-w-[1120px] mx-auto flex flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            <h1 className="m-0 text-[26px] sm:text-[30px] text-[#0A0A0A]" style={displayFont}>
              Mis invitaciones
            </h1>
            <p className="m-0 text-sm text-[#3F3F46]">
              {auth.isAdmin ? 'Como administrador ves todas las invitaciones.' : 'Elige la invitación que quieres administrar.'}
            </p>
          </div>

          {auth.isAdmin && !empty && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative w-full sm:w-[420px]">
                <label htmlFor="admin-search" className="sr-only">
                  Buscar por nombre o ID
                </label>
                <Search className="absolute left-3.5 top-3.5 h-[18px] w-[18px] text-[#71717A]" />
                <input
                  id="admin-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o ID"
                  className="w-full h-[46px] rounded-lg border border-[rgba(0,0,0,0.14)] bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-[13px] font-semibold text-[#71717A]">
                  {filtered.length} de {auth.weddings.length} {auth.weddings.length === 1 ? 'invitación' : 'invitaciones'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowNew(true)}
                  className="inline-flex items-center gap-2 h-[46px] px-5 rounded-lg bg-[#111111] text-white hover:bg-black text-sm font-bold"
                >
                  <Plus className="h-4 w-4" />
                  Nueva invitación
                </button>
              </div>
            </div>
          )}

          {auth.isAdmin && empty && (
            <>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNew(true)}
                  className="inline-flex items-center gap-2 h-[46px] px-5 rounded-lg bg-[#111111] text-white hover:bg-black text-sm font-bold"
                >
                  <Plus className="h-4 w-4" />
                  Nueva invitación
                </button>
              </div>
              <div className="border border-dashed border-[rgba(0,0,0,0.25)] rounded-[14px] px-6 py-14 flex flex-col items-center gap-3.5 text-center">
                <div className="text-lg font-extrabold text-[#0A0A0A]">Todavía no hay invitaciones</div>
                <div className="text-sm text-[#3F3F46] max-w-[420px] leading-relaxed">
                  Crea la primera: solo necesitas los nombres, los correos con los que entrarán, la fecha y la plantilla.
                </div>
                <button
                  type="button"
                  onClick={() => setShowNew(true)}
                  className="inline-flex items-center gap-2 h-[46px] px-5 rounded-lg bg-[#111111] text-white hover:bg-black text-sm font-bold"
                >
                  <Plus className="h-4 w-4" />
                  Crear la primera invitación
                </button>
              </div>
            </>
          )}

          {!empty && (
            <div className={`grid grid-cols-1 gap-5 ${auth.isAdmin ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'}`}>
              {filtered.map((w) => (
                <WeddingCard
                  key={w.id}
                  wedding={w}
                  locale={locale}
                  compact={auth.isAdmin}
                  onEditOwners={auth.isAdmin ? () => setOwnersFor(w) : undefined}
                  onSettings={auth.isAdmin ? () => setSettingsFor(w) : undefined}
                />
              ))}
              {filtered.length === 0 && <p className="text-sm text-[#71717A]">Ninguna invitación coincide con «{query}».</p>}
            </div>
          )}
        </div>
      </div>

      {showNew && <NewWeddingModal onClose={() => setShowNew(false)} onCreated={refreshSilently} />}
      {ownersFor && <OwnersModal wedding={ownersFor} onClose={() => setOwnersFor(null)} onSaved={refreshSilently} />}
      {settingsFor && <SettingsModal wedding={settingsFor} onClose={() => setSettingsFor(null)} onSaved={refreshSilently} />}
    </div>
  );
}
