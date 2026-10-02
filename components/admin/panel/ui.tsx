'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, Menu, Pencil, Sparkles, Table2, Users, CheckSquare, X } from 'lucide-react';
import AccountControls from '../AccountControls';
import { useAuthOptional } from '../../../lib/auth-context';
import { whatsappUrl } from '../../../lib/contact';
import { track } from '../../../lib/analytics/client';
import { A, manrope, displayFont } from '../ui';

export type PanelTier = 'free' | 'template';

export type PanelSection = 'dashboard' | 'editor' | 'guests' | 'confirmations' | 'tables';

const NAV_ITEMS: { id: PanelSection; label: string; icon: typeof LayoutGrid; href: (weddingId: string, locale: string) => string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, href: (w, l) => `/${l}/admin/panel/${w}/dashboard` },
  { id: 'editor', label: 'Editor de invitación', icon: Pencil, href: (w, l) => `/${l}/admin/panel/${w}/editor` },
  { id: 'guests', label: 'Lista de invitados', icon: Users, href: (w, l) => `/${l}/admin/panel/${w}/guests` },
  { id: 'confirmations', label: 'Confirmaciones', icon: CheckSquare, href: (w, l) => `/${l}/admin/panel/${w}/confirmations` },
  { id: 'tables', label: 'Mesas', icon: Table2, href: (w, l) => `/${l}/admin/panel/${w}/tables` },
];

function EventSwitcher({ weddingId, locale }: { weddingId: string; locale: string }) {
  const auth = useAuthOptional();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!auth || auth.weddings.length <= 1) return null;

  const current = auth.weddings.find((w) => w.id === weddingId);

  return (
    <div className="relative mb-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center justify-between gap-2 w-full text-left bg-[#FAFAFA] border border-[rgba(0,0,0,0.08)] rounded-[10px] px-3 py-2.5"
      >
        <span className="flex flex-col gap-0.5 min-w-0">
          <span className="text-[10px] font-bold tracking-[0.06em] text-[#9CA3AF] uppercase">Evento actual</span>
          <span className="text-[13px] font-extrabold text-[#0A0A0A] truncate">{current?.title || weddingId}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#71717A] flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[rgba(0,0,0,0.1)] rounded-xl shadow-lg p-1.5 z-50 max-h-64 overflow-y-auto">
          {auth.weddings.map((w) => (
            <button
              key={w.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                router.push(`/${locale}/admin/panel/${w.id}/dashboard`);
              }}
              className={`w-full text-left text-[13px] font-semibold px-2.5 py-2 rounded-lg transition-colors ${
                w.id === weddingId ? 'bg-[#F4F4F5] text-[#0A0A0A]' : 'text-[#3F3F46] hover:bg-[#FAFAFA]'
              }`}
            >
              {w.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Spec 16 — el plan gratuito no tiene Editor de invitación. Mismo tratamiento que
// `AdminPageNav` (legacy): el link se reemplaza por un CTA de activación por
// WhatsApp, en vez de ocultarse sin explicación.
function FreeEditorUpsell({ weddingId, collapsed, onNavigate }: { weddingId: string; collapsed: boolean; onNavigate?: () => void }) {
  return (
    <a
      href={whatsappUrl(`Hola! Quiero activar mi boda "${weddingId}" con una invitación digital.`)}
      target="_blank"
      rel="noopener noreferrer"
      title={collapsed ? 'Activa tu invitación digital' : undefined}
      onClick={() => {
        track('free_wedding_upgrade_cta_click', {});
        onNavigate?.();
      }}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm no-underline border border-dashed border-[rgba(198,102,60,0.35)] text-[#AE5730] font-semibold hover:bg-[rgba(198,102,60,0.06)] transition-colors ${
        collapsed ? 'justify-center' : ''
      }`}
    >
      <Sparkles className="h-[18px] w-[18px] flex-shrink-0" />
      {!collapsed && <span>Activa tu invitación digital</span>}
    </a>
  );
}

function NavLinks({
  weddingId,
  locale,
  active,
  tier,
  collapsed,
  onNavigate,
}: {
  weddingId: string;
  locale: string;
  active: PanelSection;
  tier: PanelTier;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Secciones del panel">
      {NAV_ITEMS.map((item) => {
        if (item.id === 'editor' && tier === 'free') {
          return <FreeEditorUpsell key={item.id} weddingId={weddingId} collapsed={collapsed} onNavigate={onNavigate} />;
        }
        const isActive = item.id === active;
        const Icon = item.icon;
        return (
          <a
            key={item.id}
            href={item.href(weddingId, locale)}
            onClick={onNavigate}
            title={collapsed ? item.label : undefined}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-sm no-underline transition-colors ${
              collapsed ? 'justify-center' : ''
            } ${isActive ? 'bg-[rgba(198,102,60,0.08)] text-[#AE5730] font-extrabold' : 'text-[#3F3F46] hover:bg-[#FAFAFA] font-semibold'}`}
          >
            <Icon className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </a>
        );
      })}
    </nav>
  );
}

function SidebarChrome({
  weddingId,
  locale,
  active,
  tier,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
}: {
  weddingId: string;
  locale: string;
  active: PanelSection;
  tier: PanelTier;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className={`flex flex-col h-full py-6 box-border ${collapsed ? 'px-2.5' : 'px-4'}`} style={manrope}>
      <div className={`pb-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between px-1'}`}>
        {!collapsed && <span className="text-xl text-[#0A0A0A]" style={displayFont}>invyta</span>}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            className="h-7 w-7 flex-shrink-0 flex items-center justify-center rounded-lg text-[#71717A] hover:bg-[#FAFAFA] hover:text-[#0A0A0A]"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>
      {!collapsed && <EventSwitcher weddingId={weddingId} locale={locale} />}
      <NavLinks weddingId={weddingId} locale={locale} active={active} tier={tier} collapsed={collapsed} onNavigate={onNavigate} />
      <div className="flex-1" />
      {!collapsed && (
        <div className="border-t border-[rgba(0,0,0,0.08)] pt-3.5">
          <AccountControls menuPlacement="up" />
        </div>
      )}
    </div>
  );
}

export function PanelSidebar({
  weddingId,
  locale,
  active,
  tier = 'template',
  collapsed = false,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: {
  weddingId: string;
  locale: string;
  active: PanelSection;
  tier?: PanelTier;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  return (
    <>
      <aside
        className={`hidden md:flex md:flex-col flex-shrink-0 bg-white border-r border-[rgba(0,0,0,0.08)] h-full overflow-y-auto transition-[width] duration-200 ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        <SidebarChrome
          weddingId={weddingId}
          locale={locale}
          active={active}
          tier={tier}
          collapsed={collapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/40 border-0 p-0 cursor-default"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[78%] max-w-[300px] bg-white shadow-xl">
            <div className="flex justify-end px-3 pt-3">
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={onCloseMobile}
                className="h-9 w-9 flex items-center justify-center rounded-lg text-[#0A0A0A] hover:bg-[#FAFAFA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarChrome weddingId={weddingId} locale={locale} active={active} tier={tier} onNavigate={onCloseMobile} />
          </div>
        </div>
      )}
    </>
  );
}

export function PanelTopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header
      className="md:hidden h-14 flex-shrink-0 bg-white border-b border-[rgba(0,0,0,0.08)] flex items-center justify-between px-4 box-border"
      style={manrope}
    >
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={onOpenMenu}
        className="h-9 w-9 flex items-center justify-center rounded-lg text-[#0A0A0A] hover:bg-[#FAFAFA]"
      >
        <Menu className="h-5 w-5" />
      </button>
      <span className="text-sm font-extrabold text-[#0A0A0A]">invyta</span>
      <span className="w-9" aria-hidden="true" />
    </header>
  );
}

export { A };
