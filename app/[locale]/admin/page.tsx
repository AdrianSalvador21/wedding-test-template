'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  CheckSquare,
  ExternalLink,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Table2,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { manrope, displayFont } from '../../../components/admin/ui';
import { whatsappUrl } from '../../../lib/contact';
import { track } from '../../../lib/analytics/client';
import AccountControls from '../../../components/admin/AccountControls';
import {
  AuthErrorScreen,
  LoadingScreen,
  NoWeddingsScreen,
  VerifyEmailScreen,
} from '../../../components/admin/auth-ui';
import { NewWeddingModal, OwnersModal, SettingsModal } from '../../../components/admin/OperatorTools';
import { FreeWeddingModal } from '../../../components/admin/FreeWeddingTools';
import { useAuth, type LinkedWedding } from '../../../lib/auth-context';

// Display del template Moderno (spec 25); la fuente ya se carga para todo app/[locale]
// desde invitation-fonts.css.
const moderno = { fontFamily: "'Bricolage Grotesque', var(--font-manrope), sans-serif" };

// Calculada en el cliente a partir de `wedding.date` (ya disponible en LinkedWedding) —
// sin pedir ningún dato nuevo al servidor. null si la boda no tiene fecha válida.
function daysUntil(dateIso: string): number | null {
  if (!dateIso) return null;
  const eventDate = new Date(dateIso);
  if (Number.isNaN(eventDate.getTime())) return null;
  return Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function celebratedLabel(days: number): string {
  if (days === 0) return 'Hoy es el gran día';
  const ago = Math.abs(days);
  return `Celebrada hace ${ago} ${ago === 1 ? 'día' : 'días'}`;
}

interface DateParts {
  day: string;
  monthYear: string; // "MARZO 2027"
  weekday: string; // "Domingo"
  numeric: string; // "14.03.2027"
  short: string; // "14 mar 2027"
}

// En UTC, igual que formatWeddingDate, para que el día no se corra por zona horaria.
function dateParts(dateIso: string): DateParts | null {
  if (!dateIso) return null;
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return null;
  const fmt = (opts: Intl.DateTimeFormatOptions) => date.toLocaleDateString('es-MX', { ...opts, timeZone: 'UTC' });
  const weekday = fmt({ weekday: 'long' });
  return {
    day: fmt({ day: 'numeric' }),
    monthYear: `${fmt({ month: 'long' })} ${fmt({ year: 'numeric' })}`.toUpperCase(),
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    numeric: `${fmt({ day: '2-digit' })}.${fmt({ month: '2-digit' })}.${fmt({ year: 'numeric' })}`,
    short: fmt({ day: 'numeric', month: 'short', year: 'numeric' }).replace('.', ''),
  };
}

// El título llega como "Novia y Novio" (link-weddings); "…" marca un nombre faltante y,
// sin nombres, el título es el id de la boda.
function initialsOf(title: string): string[] {
  const parts = title
    .split(' y ')
    .map((p) => p.trim())
    .filter((p) => p && p !== '…');
  if (parts.length === 0) return [title.charAt(0).toUpperCase() || '·'];
  return parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase());
}

// Próximas primero (la más cercana arriba), luego las celebradas (la más reciente arriba)
// y al final las que no tienen fecha.
function sortByNearest(weddings: LinkedWedding[]): LinkedWedding[] {
  const key = (w: LinkedWedding) => {
    const days = daysUntil(w.date);
    if (days === null) return [2, 0] as const;
    return days >= 0 ? ([0, days] as const) : ([1, -days] as const);
  };
  return [...weddings].sort((a, b) => {
    const [ga, va] = key(a);
    const [gb, vb] = key(b);
    return ga - gb || va - vb || a.title.localeCompare(b.title);
  });
}

type BandTheme = {
  bg: string;
  text: string;
  ring: string;
  overline: string;
  accent: string;
  rule: string;
};

const BAND: Record<'template' | 'free' | 'past', BandTheme> = {
  template: { bg: 'bg-[#1E1C19]', text: 'text-[#FBFAF7]', ring: '#C9A882', overline: 'text-[#A49C91]', accent: 'text-[#C9A882]', rule: 'border-[#4A4640]' },
  free: { bg: 'bg-[#F2EFEA]', text: 'text-[#1E1C19]', ring: '#B79A7A', overline: 'text-[#57524B]', accent: 'text-[#7A5A3C]', rule: 'border-[#D9D3C9]' },
  past: { bg: 'bg-[#F2EFEA]', text: 'text-[#57524B]', ring: '#A1A1AA', overline: 'text-[#57524B]', accent: 'text-[#57524B]', rule: 'border-[#D9D3C9]' },
};

function bandFor(tier: 'free' | 'template', days: number | null): BandTheme {
  if (days !== null && days < 0) return BAND.past;
  return tier === 'free' ? BAND.free : BAND.template;
}

function Rings({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 104 60" fill="none" aria-hidden="true" className={className}>
      <circle cx="36" cy="30" r="24" stroke={color} strokeWidth="2" />
      <circle cx="68" cy="30" r="24" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function Monogram({ title, dotClass, className }: { title: string; dotClass: string; className: string }) {
  const initials = initialsOf(title);
  return (
    <span className={`font-light leading-none tracking-[-0.04em] ${className}`} style={moderno}>
      {initials[0]}
      {initials[1] && (
        <>
          <span className={`${dotClass} mx-[0.15em]`}>·</span>
          {initials[1]}
        </>
      )}
    </span>
  );
}

function TierPill({ tier }: { tier: 'free' | 'template' }) {
  return tier === 'free' ? (
    <span className="w-fit text-xs font-bold px-2.5 py-1 rounded-full bg-[#F4F4F5] text-[#3F3F46]">Gratis · invitados y mesas</span>
  ) : (
    <span className="w-fit text-xs font-bold px-2.5 py-1 rounded-full bg-[rgba(198,102,60,0.1)] text-[#8F4524]">Con plantilla</span>
  );
}

function CelebratedPill({ days }: { days: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-white text-[#52525B] border border-[rgba(0,0,0,0.08)]">
      <Check className="h-3.5 w-3.5" />
      {celebratedLabel(days)}
    </span>
  );
}

// Accesos directos a las secciones del panel (las mismas rutas de components/admin/panel/ui.tsx).
// El tier gratuito no tiene Editor (spec 16).
function shortcutsFor(wedding: LinkedWedding, locale: string): { label: string; shortLabel: string; icon: LucideIcon; href: string }[] {
  const base = `/${locale}/admin/panel/${wedding.id}`;
  const items = [
    { label: 'Invitados', shortLabel: 'Invitados', icon: Users, href: `${base}/guests` },
    { label: 'Confirmaciones', shortLabel: 'Confirmaciones', icon: CheckSquare, href: `${base}/confirmations` },
    { label: 'Mesas', shortLabel: 'Mesas', icon: Table2, href: `${base}/tables` },
  ];
  if ((wedding.tier ?? 'template') !== 'free') {
    items.push({ label: 'Editar invitación', shortLabel: 'Editar', icon: Pencil, href: `${base}/editor` });
  }
  return items;
}

function UpgradeBox({ wedding }: { wedding: LinkedWedding }) {
  return (
    <div className="rounded-xl bg-[#FBF5F1] border border-[rgba(174,87,48,0.16)] px-3.5 py-3 flex flex-col gap-1.5">
      <span className="text-[13px] font-bold text-[#0A0A0A]">Aún sin invitación digital</span>
      <a
        href={whatsappUrl(`Hola! Quiero activar mi boda "${wedding.id}" con una invitación digital.`)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track('free_wedding_upgrade_cta_click', {})}
        className="inline-flex w-fit items-center gap-1.5 text-[13px] font-bold text-[#AE5730] hover:text-[#8F4524]"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Activar con una plantilla
      </a>
    </div>
  );
}

function PanelButton({ wedding, locale, days, className = '' }: { wedding: LinkedWedding; locale: string; days: number | null; className?: string }) {
  const past = days !== null && days < 0;
  const free = (wedding.tier ?? 'template') === 'free';
  const tone = past
    ? 'bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#F4F4F5]'
    : free
      ? 'bg-[#18181B] text-white hover:bg-[#27272A]'
      : 'bg-[#AE5730] text-white hover:bg-[#8F4524]';
  return (
    <a
      href={`/${locale}/admin/panel/${wedding.id}/dashboard`}
      className={`inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-[10px] text-sm font-bold transition-colors ${tone} ${className}`}
    >
      {past ? 'Ver panel' : 'Abrir panel'}
      <ArrowRight className="h-4 w-4" />
    </a>
  );
}

// Una sola boda (pareja o planner con una boda): tarjeta destacada a todo el ancho.
function FeaturedWeddingCard({ wedding, locale }: { wedding: LinkedWedding; locale: string }) {
  const tier = wedding.tier ?? 'template';
  const days = daysUntil(wedding.date);
  const past = days !== null && days < 0;
  const parts = dateParts(wedding.date);
  const band = bandFor(tier, days);
  const shortcuts = shortcutsFor(wedding, locale);

  // Móvil: dentro de la franja (colores de la franja). Escritorio: junto al título.
  const countdown = (numberClass: string, labelClass: string, label: string) =>
    days === null ? null : past ? (
      <CelebratedPill days={days} />
    ) : (
      <div className="flex flex-col items-end gap-1.5 text-right">
        <span className={`font-light leading-[0.9] tracking-[-0.04em] ${numberClass}`} style={moderno}>
          {days}
        </span>
        <span className={`font-semibold tracking-[0.22em] ${labelClass}`}>{label}</span>
      </div>
    );

  return (
    <article className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[18px] md:rounded-[20px] overflow-hidden grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] shadow-[0_1px_2px_rgba(0,0,0,0.03),0_12px_32px_rgba(0,0,0,0.05)]">
      <div className={`${band.bg} ${band.text} p-5 md:p-8 flex flex-col justify-between gap-5 md:gap-7`}>
        <span className={`text-[11px] font-semibold tracking-[0.24em] ${band.overline}`}>{past ? 'NOS CASAMOS · CELEBRADA' : 'NOS CASAMOS'}</span>
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-3 md:gap-3.5">
            <Rings color={band.ring} className="w-[72px] h-[42px] md:w-[104px] md:h-[60px]" />
            <Monogram title={wedding.title} dotClass={band.accent} className="text-[48px] md:text-[64px]" />
          </div>
          {days !== null && (
            <div className="md:hidden">
              {countdown(`text-[48px] ${band.text}`, `text-[10px] ${band.accent}`, days === 1 ? 'DÍA' : 'DÍAS')}
            </div>
          )}
        </div>
        {parts && (
          <div className={`border-t ${band.rule} pt-3.5 md:pt-[18px] flex items-end gap-3 md:gap-4`}>
            <span className="text-[40px] md:text-[56px] font-light leading-[0.85] tracking-[-0.04em]" style={moderno}>
              {parts.day}
            </span>
            <div className="flex flex-col gap-1 pb-0.5">
              <span className={`text-[11px] font-semibold tracking-[0.24em] ${band.accent}`}>{parts.monthYear}</span>
              <span className={`text-[13px] ${band.overline}`}>{parts.weekday}</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 md:px-9 md:py-8 flex flex-col gap-4 md:gap-[22px] min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2.5 min-w-0">
            <TierPill tier={tier} />
            <h2 className="m-0 text-[30px] md:text-[40px] font-normal leading-[1.05] tracking-[-0.03em] text-[#0A0A0A] break-words" style={moderno}>
              {wedding.title}
            </h2>
          </div>
          {days !== null && (
            <div className="hidden md:block flex-shrink-0">
              {countdown('text-[64px] text-[#1E1C19]', 'text-[11px] text-[#7A5A3C]', days === 1 ? 'DÍA PARA LA BODA' : 'DÍAS PARA LA BODA')}
            </div>
          )}
        </div>

        <div className={`grid grid-cols-2 gap-2 md:gap-2.5 ${shortcuts.length === 4 ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
          {shortcuts.map(({ label, shortLabel, icon: Icon, href }) => (
            <a
              key={href}
              href={href}
              className="min-h-[48px] rounded-xl border border-[rgba(0,0,0,0.08)] bg-white p-3 md:p-3.5 flex md:flex-col items-center md:items-start gap-2.5 text-[#0A0A0A] hover:border-[rgba(174,87,48,0.35)] hover:bg-[#FBF5F1] transition-colors"
            >
              <Icon className="h-[18px] w-[18px] md:h-5 md:w-5 text-[#AE5730] flex-shrink-0" />
              <span className="text-[13px] md:text-sm font-bold">
                <span className="md:hidden">{shortLabel}</span>
                <span className="hidden md:inline">{label}</span>
              </span>
            </a>
          ))}
        </div>

        {tier === 'free' && <UpgradeBox wedding={wedding} />}

        <div className="md:border-t md:border-[rgba(0,0,0,0.06)] md:pt-5 flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-1 md:gap-3">
          {tier !== 'free' ? (
            <a
              href={`/${locale}/wedding/${wedding.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] text-[13px] md:text-sm font-bold text-[#3F3F46] hover:text-[#0A0A0A]"
            >
              <ExternalLink className="h-4 w-4" />
              Ver invitación como invitado
            </a>
          ) : (
            <span className="hidden md:block" />
          )}
          <PanelButton wedding={wedding} locale={locale} days={days} className="h-12 md:h-[46px]" />
        </div>
      </div>
    </article>
  );
}

// Varias bodas (pareja o planner): tarjeta vertical con franja de monograma.
function WeddingCard({ wedding, locale }: { wedding: LinkedWedding; locale: string }) {
  const tier = wedding.tier ?? 'template';
  const days = daysUntil(wedding.date);
  const past = days !== null && days < 0;
  const parts = dateParts(wedding.date);
  const band = bandFor(tier, days);

  return (
    <article className="bg-white border border-[rgba(0,0,0,0.08)] rounded-[18px] overflow-hidden flex flex-col min-w-0 shadow-[0_1px_2px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)]">
      <div className={`${band.bg} ${band.text} h-[136px] p-5 box-border flex items-end justify-between gap-3`}>
        <div className="flex flex-col gap-2.5">
          <Rings color={band.ring} className="w-[52px] h-[30px]" />
          <Monogram title={wedding.title} dotClass={band.accent} className="text-[34px]" />
        </div>
        {days !== null &&
          (past ? (
            <CelebratedPill days={days} />
          ) : (
            <div className="flex flex-col items-end gap-1.5 text-right">
              <span className="text-[44px] font-light leading-[0.9] tracking-[-0.04em]" style={moderno}>
                {days}
              </span>
              <span className={`text-[10px] font-semibold tracking-[0.22em] ${band.accent}`}>{days === 1 ? 'DÍA' : 'DÍAS'}</span>
            </div>
          ))}
      </div>
      <div className="p-5 flex flex-col gap-3 flex-grow">
        <TierPill tier={tier} />
        <h2 className={`m-0 text-[21px] font-extrabold tracking-[-0.01em] break-words ${past ? 'text-[#3F3F46]' : 'text-[#0A0A0A]'}`}>{wedding.title}</h2>
        {parts && (
          <div className="flex items-baseline gap-2.5 pb-3 border-b border-[#E7E2DA]">
            <span className={`text-lg font-normal tracking-[-0.01em] ${past ? 'text-[#57524B]' : 'text-[#1E1C19]'}`} style={moderno}>
              {parts.numeric}
            </span>
            <span className="text-[11px] font-semibold tracking-[0.2em] text-[#57524B]">{parts.weekday.toUpperCase()}</span>
          </div>
        )}
        {past ? (
          <p className="m-0 mt-1 text-[13px] leading-relaxed text-[#52525B]">
            Tu invitación sigue en línea. Puedes consultar invitados y confirmaciones cuando quieras.
          </p>
        ) : tier === 'free' ? (
          <div className="mt-1">
            <UpgradeBox wedding={wedding} />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2 mt-1">
            {shortcutsFor(wedding, locale).map(({ label, icon: Icon, href }) => (
              <a
                key={href}
                href={href}
                aria-label={label}
                title={label}
                className="h-11 rounded-[10px] bg-[#F4F4F5] flex items-center justify-center text-[#3F3F46] hover:bg-[#FBF5F1] hover:text-[#AE5730] transition-colors"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        )}
        <div className="flex-grow" />
        <PanelButton wedding={wedding} locale={locale} days={days} />
      </div>
    </article>
  );
}

function DataRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <span className="text-[#52525B] flex-shrink-0">{label}</span>
      <span className="min-w-0 text-right break-all">{children}</span>
    </div>
  );
}

// Operador: tarjeta compacta con los datos de soporte (plan, ID, planner, accesos).
function OperatorWeddingCard({
  wedding,
  locale,
  onEditOwners,
  onSettings,
}: {
  wedding: LinkedWedding;
  locale: string;
  onEditOwners: () => void;
  onSettings: () => void;
}) {
  const tier = wedding.tier ?? 'template';
  const days = daysUntil(wedding.date);
  const past = days !== null && days < 0;
  const parts = dateParts(wedding.date);
  const owners = wedding.ownerEmails ?? [];
  const initials = initialsOf(wedding.title).join('&');
  const avatarTone = past
    ? 'bg-[#F4F1EE] text-[#52525B]'
    : tier === 'free'
      ? 'bg-[#F4F4F5] text-[#3F3F46] border border-dashed border-[#A1A1AA]'
      : 'bg-[#F6ECE5] text-[#8F4524]';

  return (
    <article className="bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-[18px] flex flex-col gap-3.5 min-w-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="flex items-center gap-3">
        <div className={`h-11 w-11 flex-shrink-0 rounded-full box-border flex items-center justify-center text-sm font-extrabold ${avatarTone}`}>{initials}</div>
        <div className="flex flex-col gap-0.5 min-w-0 flex-grow">
          <span className={`text-base font-extrabold break-words ${past ? 'text-[#3F3F46]' : 'text-[#0A0A0A]'}`}>{wedding.title}</span>
          {parts && (
            <span className="text-xs text-[#52525B]">
              {parts.short}
              {days !== null && (
                <>
                  {' · '}
                  {past ? (
                    'celebrada'
                  ) : (
                    <strong className={tier === 'free' ? 'text-[#27272A]' : 'text-[#AE5730]'}>
                      {days === 0 ? 'hoy' : `en ${days} ${days === 1 ? 'día' : 'días'}`}
                    </strong>
                  )}
                </>
              )}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onSettings}
          aria-label={`Ajustes de ${wedding.title}`}
          className="h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-[10px] text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#0A0A0A]"
        >
          <MoreHorizontal className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="flex flex-col gap-2 rounded-[10px] bg-[#FAFAFA] px-3 py-2.5 text-xs text-[#3F3F46]">
        <DataRow label="Plan">
          <span className={`font-bold ${tier === 'free' ? '' : 'text-[#8F4524]'}`}>{tier === 'free' ? 'Gratis' : 'Con plantilla'}</span>
        </DataRow>
        <DataRow label="ID">
          <span className="font-mono">{wedding.id}</span>
        </DataRow>
        {wedding.plannerEmail && <DataRow label="Planner">{wedding.plannerEmail}</DataRow>}
        <DataRow label="Acceso">
          <span className={`inline-flex items-center gap-2 ${owners.length ? '' : 'text-[#9A3412]'}`}>
            <Mail className="h-3.5 w-3.5" />
            {owners.length ? `${owners.length} ${owners.length === 1 ? 'correo' : 'correos'}` : 'Sin correos'}
            <button type="button" onClick={onEditOwners} className="font-bold text-[#0A0A0A] hover:underline">
              Editar
            </button>
          </span>
        </DataRow>
      </div>
      <PanelButton wedding={wedding} locale={locale} days={days} className="h-11" />
    </article>
  );
}

function CreateFreeTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border-[1.5px] border-dashed border-[rgba(174,87,48,0.35)] bg-transparent rounded-2xl px-4 sm:px-[22px] py-3.5 sm:py-[18px] min-h-[56px] flex items-center justify-between gap-4 text-left hover:bg-[rgba(198,102,60,0.04)]"
    >
      <span className="flex items-center gap-3.5">
        <span className="h-10 w-10 flex-shrink-0 rounded-full bg-[rgba(198,102,60,0.1)] flex items-center justify-center">
          <Plus className="h-[18px] w-[18px] text-[#AE5730]" />
        </span>
        <span className="flex flex-col gap-0.5">
          <span className="text-[15px] font-extrabold text-[#0A0A0A]">Crear otra boda gratis</span>
          <span className="hidden sm:block text-[13px] text-[#52525B]">Invitados y mesas sin costo, para otra fecha o evento.</span>
        </span>
      </span>
      <span className="hidden sm:block text-[13px] font-bold text-[#AE5730]">Empezar</span>
    </button>
  );
}

const primaryButton =
  'inline-flex items-center gap-2 h-[46px] px-5 rounded-[10px] bg-[#AE5730] text-white hover:bg-[#8F4524] text-sm font-bold';

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

  // Parejas y planners ven primero la boda más próxima; el operador conserva el orden del servidor.
  const ownWeddings = useMemo(() => sortByNearest(auth.weddings), [auth.weddings]);

  if (auth.status === 'loading' || auth.status === 'signedOut') return <LoadingScreen />;
  if (auth.status === 'unverified') return <VerifyEmailScreen />;
  if (auth.status === 'error') return <AuthErrorScreen />;
  if (auth.status === 'noWeddings') return <NoWeddingsScreen />;

  const refreshSilently = () => void auth.refresh({ silent: true });
  const empty = auth.weddings.length === 0;
  const single = !auth.isAdmin && auth.weddings.length === 1;
  const templateCount = auth.weddings.filter((w) => (w.tier ?? 'template') !== 'free').length;
  const freeCount = auth.weddings.length - templateCount;

  const subtitle = auth.isAdmin
    ? 'Como administrador ves todas las invitaciones.'
    : single
      ? 'Todo lo de tu boda, a un clic.'
      : 'Ordenadas por la boda más próxima.';

  return (
    <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA]" style={manrope}>
      <div className="bg-white border-b border-[rgba(0,0,0,0.06)] px-4 sm:px-10 h-[60px] flex items-center justify-between gap-4">
        <span className="text-xl sm:text-2xl text-[#0A0A0A]" style={displayFont}>
          invyta
        </span>
        <AccountControls />
      </div>

      <div className="px-4 sm:px-10 py-7 sm:py-10">
        <div className="max-w-[1120px] mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              {auth.isAdmin && (
                <div className="text-[11px] font-extrabold tracking-[0.12em] text-[#AE5730] uppercase">Panel de operador</div>
              )}
              <h1 className="m-0 text-[26px] sm:text-[30px] text-[#0A0A0A]" style={displayFont}>
                {single ? 'Mi invitación' : 'Mis invitaciones'}
              </h1>
              <p className="m-0 text-sm text-[#3F3F46]">{subtitle}</p>
              {auth.isAdmin && !empty && (
                <div className="flex gap-2 flex-wrap mt-1.5">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F4F4F5] text-[#3F3F46]">
                    {auth.weddings.length} {auth.weddings.length === 1 ? 'invitación' : 'invitaciones'}
                  </span>
                  {templateCount > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[rgba(198,102,60,0.1)] text-[#8F4524]">
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
            {auth.isAdmin && empty && (
              <button type="button" onClick={() => setShowNew(true)} className={`${primaryButton} w-fit`}>
                <Plus className="h-4 w-4" />
                Nueva invitación
              </button>
            )}
            {!auth.isAdmin && !single && (
              <button
                type="button"
                onClick={() => setShowFreeNew(true)}
                className="inline-flex w-fit items-center gap-2 h-[46px] px-5 rounded-[10px] bg-white text-[#AE5730] border border-[rgba(198,102,60,0.35)] hover:bg-[rgba(198,102,60,0.06)] text-sm font-bold"
              >
                <Plus className="h-4 w-4" />
                Crear otra boda gratis
              </button>
            )}
          </div>

          {auth.isAdmin && !empty && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="relative w-full sm:w-[420px]">
                <label htmlFor="admin-search" className="sr-only">
                  Buscar por nombre, ID o correo
                </label>
                <Search className="absolute left-3.5 top-3.5 h-[18px] w-[18px] text-[#71717A]" />
                <input
                  id="admin-search"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre, ID o correo"
                  className="w-full h-[46px] rounded-[10px] border border-[rgba(0,0,0,0.14)] bg-white pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111]"
                />
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4">
                <span className="text-[13px] font-semibold text-[#52525B]">
                  {filtered.length} de {auth.weddings.length}
                </span>
                <button type="button" onClick={() => setShowNew(true)} className={primaryButton}>
                  <Plus className="h-4 w-4" />
                  Nueva invitación
                </button>
              </div>
            </div>
          )}

          {auth.isAdmin && empty && (
            <div className="border-[1.5px] border-dashed border-[rgba(0,0,0,0.2)] rounded-[18px] bg-white px-6 py-14 flex flex-col items-center gap-4 text-center">
              <div className="h-24 w-24 rounded-full border-[1.5px] border-dashed border-[rgba(174,87,48,0.4)] bg-[#FBF5F1] flex items-center justify-center">
                <Mail className="h-9 w-9 text-[#AE5730]" strokeWidth={1.8} />
              </div>
              <div className="text-xl font-extrabold text-[#0A0A0A]">Todavía no hay invitaciones</div>
              <div className="text-sm text-[#3F3F46] max-w-[440px] leading-relaxed">
                Crea la primera: solo necesitas los nombres, los correos con los que entrarán, la fecha y la plantilla.
              </div>
              <button type="button" onClick={() => setShowNew(true)} className={`${primaryButton} mt-1`}>
                <Plus className="h-4 w-4" />
                Crear la primera invitación
              </button>
            </div>
          )}

          {auth.isAdmin && !empty && filtered.length === 0 && (
            <div className="border border-[rgba(0,0,0,0.08)] rounded-[18px] bg-white px-6 py-12 flex flex-col items-center gap-3.5 text-center">
              <div className="h-16 w-16 rounded-full bg-[#F4F4F5] flex items-center justify-center">
                <Search className="h-[26px] w-[26px] text-[#52525B]" />
              </div>
              <div className="text-lg font-extrabold text-[#0A0A0A] break-words">Ninguna invitación coincide con «{query}»</div>
              <div className="text-sm text-[#3F3F46] max-w-[460px] leading-relaxed">
                Busca por nombre de la pareja, ID de la boda, correo con acceso o correo del planner.
              </div>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-0.5 inline-flex items-center justify-center h-11 px-[18px] rounded-[10px] bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#F4F4F5] text-sm font-bold"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}

          {auth.isAdmin && filtered.length > 0 && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((w) => (
                <OperatorWeddingCard
                  key={w.id}
                  wedding={w}
                  locale={locale}
                  onEditOwners={() => setOwnersFor(w)}
                  onSettings={() => setSettingsFor(w)}
                />
              ))}
            </div>
          )}

          {single && (
            <>
              <FeaturedWeddingCard wedding={ownWeddings[0]} locale={locale} />
              <CreateFreeTile onClick={() => setShowFreeNew(true)} />
            </>
          )}

          {!auth.isAdmin && !single && !empty && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {ownWeddings.map((w) => (
                <WeddingCard key={w.id} wedding={w} locale={locale} />
              ))}
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
