'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, Mail, Plus, Search, Settings, Sparkles } from 'lucide-react';
import { manrope, displayFont, AdminStatusPill } from '../../../components/admin/ui';
import { whatsappUrl } from '../../../lib/contact';
import { track } from '../../../lib/analytics/client';
import AccountControls from '../../../components/admin/AccountControls';
import {
  AuthErrorScreen,
  LoadingScreen,
  NoWeddingsScreen,
  VerifyEmailScreen,
  formatWeddingDate,
} from '../../../components/admin/auth-ui';
import { NewWeddingModal, OwnersModal, SettingsModal } from '../../../components/admin/OperatorTools';
import { FreeWeddingModal } from '../../../components/admin/FreeWeddingTools';
import { useAuth, type LinkedWedding } from '../../../lib/auth-context';

// Calculada en el cliente a partir de `wedding.date` (ya disponible en LinkedWedding) —
// sin pedir ningún dato nuevo al servidor.
function countdownLabel(dateIso: string): string | null {
  if (!dateIso) return null;
  const eventDate = new Date(dateIso);
  if (Number.isNaN(eventDate.getTime())) return null;
  const diffDays = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'día' : 'días'} para la boda`;
  if (diffDays === 0) return 'Hoy es el gran día';
  const daysAgo = Math.abs(diffDays);
  return `Celebrada hace ${daysAgo} ${daysAgo === 1 ? 'día' : 'días'}`;
}

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
  const countdown = countdownLabel(wedding.date);
  const owners = wedding.ownerEmails;
  // Spec 16 — ausente se interpreta como 'template' (bodas creadas antes de este spec)
  const tier = wedding.tier ?? 'template';
  return (
    <div
      className={`bg-white border border-[rgba(0,0,0,0.08)] rounded-[18px] overflow-hidden flex flex-col min-w-0 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)]`}
    >
      <div className={`h-1 ${tier === 'free' ? 'bg-[#D4D4D8]' : 'bg-[#C6663C]'}`} />
      <div className={`flex flex-col min-w-0 ${compact ? 'p-[18px] gap-3' : 'p-[22px] gap-3.5'}`}>
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
        <AdminStatusPill tone={tier} className="w-fit">
          {tier === 'free' ? 'Gratis' : 'Con plantilla'}
        </AdminStatusPill>
        {date && (
          <div className="flex items-center gap-2 text-[13px] text-[#3F3F46]">
            <CalendarDays className="h-3.5 w-3.5 text-[#C6663C]" />
            {date}
          </div>
        )}
        {countdown && (
          <span
            className={`inline-flex w-fit items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              countdown.startsWith('Celebrada') ? 'bg-[#F4F4F5] text-[#71717A]' : 'bg-[rgba(198,102,60,0.08)] text-[#AE5730]'
            }`}
          >
            {countdown}
          </span>
        )}
        <div className="text-xs text-[#9CA3AF] font-mono break-all">{wedding.id}</div>
        {onEditOwners && (
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <Mail className="h-3.5 w-3.5" />
            {owners?.length ? `${owners.length} ${owners.length === 1 ? 'correo' : 'correos'} con acceso` : 'Sin correos con acceso'}
            <button type="button" onClick={onEditOwners} className="font-bold text-[#0A0A0A] hover:underline">
              Editar
            </button>
          </div>
        )}
        <div className="border-t border-[rgba(0,0,0,0.06)] pt-3.5 flex flex-col gap-2.5">
          <a
            href={`/${locale}/admin/panel/${wedding.id}/dashboard`}
            className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-lg text-sm font-bold transition-colors bg-[#AE5730] text-white hover:bg-[#8F4524]"
          >
            Abrir panel
            <ArrowRight className="h-4 w-4" />
          </a>
          {tier === 'free' && (
            <a
              href={whatsappUrl(`Hola! Quiero activar mi boda "${wedding.id}" con una invitación digital.`)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('free_wedding_upgrade_cta_click', {})}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#AE5730]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Activa tu invitación digital
            </a>
          )}
        </div>
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
  const [showFreeNew, setShowFreeNew] = useState(false);
  const [ownersFor, setOwnersFor] = useState<LinkedWedding | null>(null);
  const [settingsFor, setSettingsFor] = useState<LinkedWedding | null>(null);

  useEffect(() => {
    if (auth.status === 'signedOut') router.replace(`/${locale}/login?next=${encodeURIComponent(`/${locale}/admin`)}`);
  }, [auth.status, locale, router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return auth.weddings;
    // Spec 17 — también matchea por ownerEmails/plannerEmail, para que el operador pueda
    // contar las bodas de un wedding planner escribiendo su correo.
    return auth.weddings.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        !!w.plannerEmail?.toLowerCase().includes(q) ||
        !!w.ownerEmails?.some((email) => email.toLowerCase().includes(q))
    );
  }, [auth.weddings, query]);

  if (auth.status === 'loading' || auth.status === 'signedOut') return <LoadingScreen />;
  if (auth.status === 'unverified') return <VerifyEmailScreen />;
  if (auth.status === 'error') return <AuthErrorScreen />;
  if (auth.status === 'noWeddings') return <NoWeddingsScreen />;

  const refreshSilently = () => void auth.refresh({ silent: true });
  const empty = auth.weddings.length === 0;
  const templateCount = auth.weddings.filter((w) => (w.tier ?? 'template') !== 'free').length;
  const freeCount = auth.weddings.length - templateCount;

  return (
    <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA]" style={manrope}>
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-10 h-[60px] flex items-center justify-between gap-4">
        <span className="text-xl sm:text-2xl text-[#0A0A0A]" style={displayFont}>
          invyta
        </span>
        <AccountControls />
      </div>

      <div className="px-4 sm:px-10 py-8 sm:py-10">
        <div className="max-w-[1120px] mx-auto flex flex-col gap-7">
          <div className="flex flex-col gap-1.5">
            {auth.isAdmin && (
              <div className="text-[11px] font-extrabold tracking-[0.12em] text-[#AE5730] uppercase">Panel de operador</div>
            )}
            <h1 className="m-0 text-[26px] sm:text-[30px] text-[#0A0A0A]" style={displayFont}>
              Mis invitaciones
            </h1>
            <p className="m-0 text-sm text-[#3F3F46] mb-1">
              {auth.isAdmin ? 'Como administrador ves todas las invitaciones.' : 'Elige la invitación que quieres administrar.'}
            </p>
            {auth.isAdmin && !empty && (
              <div className="flex gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F4F4F5] text-[#3F3F46]">
                  {auth.weddings.length} {auth.weddings.length === 1 ? 'invitación' : 'invitaciones'}
                </span>
                {templateCount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[rgba(198,102,60,0.08)] text-[#AE5730]">
                    {templateCount} con plantilla
                  </span>
                )}
                {freeCount > 0 && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F4F4F5] text-[#3F3F46]">
                    {freeCount} {freeCount === 1 ? 'gratuita' : 'gratuitas'}
                  </span>
                )}
              </div>
            )}
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
                  className="inline-flex items-center gap-2 h-[46px] px-5 rounded-lg bg-[#AE5730] text-white hover:bg-[#8F4524] text-sm font-bold"
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
                  className="inline-flex items-center gap-2 h-[46px] px-5 rounded-lg bg-[#AE5730] text-white hover:bg-[#8F4524] text-sm font-bold"
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
                  className="inline-flex items-center gap-2 h-[46px] px-5 rounded-lg bg-[#AE5730] text-white hover:bg-[#8F4524] text-sm font-bold"
                >
                  <Plus className="h-4 w-4" />
                  Crear la primera invitación
                </button>
              </div>
            </>
          )}

          {!auth.isAdmin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowFreeNew(true)}
                className="inline-flex items-center gap-2 h-[46px] px-5 rounded-lg bg-white text-[#AE5730] border border-[rgba(198,102,60,0.35)] hover:bg-[rgba(198,102,60,0.06)] text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                Crear otra boda gratis
              </button>
            </div>
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
      {showFreeNew && <FreeWeddingModal onClose={() => setShowFreeNew(false)} onCreated={refreshSilently} />}
      {ownersFor && <OwnersModal wedding={ownersFor} onClose={() => setOwnersFor(null)} onSaved={refreshSilently} />}
      {settingsFor && <SettingsModal wedding={settingsFor} onClose={() => setSettingsFor(null)} onSaved={refreshSilently} />}
    </div>
  );
}
