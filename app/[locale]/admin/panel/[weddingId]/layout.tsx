'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthGuard from '../../../../../components/admin/AuthGuard';
import WeddingNotFound from '../../../../../components/WeddingNotFound';
import { PanelDataProvider, usePanelData } from '../../../../../components/admin/panel/PanelDataContext';
import { PanelSidebar, PanelTopBar, type PanelSection } from '../../../../../components/admin/panel/ui';
import { manrope, AdminButton } from '../../../../../components/admin/ui';

function sectionFromPathname(pathname: string | null): PanelSection {
  if (!pathname) return 'dashboard';
  if (pathname.includes('/editor')) return 'editor';
  if (pathname.includes('/confirmations')) return 'confirmations';
  if (pathname.includes('/guests')) return 'guests';
  if (pathname.includes('/tables')) return 'tables';
  return 'dashboard';
}

function PanelShell({ weddingId, locale, children }: { weddingId: string; locale: string; children: ReactNode }) {
  const { loading, notFound, error, refetch, weddingData } = usePanelData();
  const pathname = usePathname();
  const active = sectionFromPathname(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const tier = weddingData?.tier === 'free' ? 'free' : 'template';

  // Preferencia por navegador, no por boda — se recuerda entre sesiones con localStorage.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem('invyta-panel-sidebar-collapsed') === '1');
    } catch {
      // localStorage no disponible (modo privado, etc.) — queda expandido por defecto.
    }
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('invyta-panel-sidebar-collapsed', next ? '1' : '0');
      } catch {
        // Si falla, simplemente no persiste entre sesiones.
      }
      return next;
    });
  };

  if (notFound) {
    return <WeddingNotFound weddingId={weddingId} />;
  }

  return (
    // `h-screen` (100vh) se queda corto en móvil cuando el navegador muestra su barra de
    // direcciones/navegación: esa barra "resta" del alto visible real sin achicar 100vh, así
    // que el contenido y el drawer del sidebar terminan tapados debajo. `h-[100dvh]` usa el alto
    // visible dinámico; se deja `h-screen` como respaldo para navegadores sin soporte a `dvh`.
    <div className="flex w-full h-screen h-[100dvh] overflow-hidden bg-[#FAFAFA]">
      <PanelSidebar
        weddingId={weddingId}
        locale={locale}
        active={active}
        tier={tier}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        <PanelTopBar onOpenMenu={() => setMobileOpen(true)} />
        <div className="flex-1 overflow-y-auto flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#111111] mx-auto mb-4" />
                <p className="text-[#3F3F46]" style={manrope}>Cargando panel...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center" style={manrope}>
                <p className="text-[#B91C1C] mb-4">{error}</p>
                <AdminButton onClick={() => void refetch()}>Reintentar</AdminButton>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: ReactNode }) {
  const params = useParams();
  const weddingId = params?.weddingId as string;
  const locale = (params?.locale as string) || 'es';

  return (
    <AuthGuard weddingId={weddingId}>
      <PanelDataProvider weddingId={weddingId}>
        <PanelShell weddingId={weddingId} locale={locale}>
          {children}
        </PanelShell>
      </PanelDataProvider>
    </AuthGuard>
  );
}
