'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, ShieldCheck } from 'lucide-react';
import { useAuthOptional } from '../../lib/auth-context';

// Correo de la sesión, etiqueta de operador y "Cerrar sesión". No importa ui.tsx para
// poder usarse dentro de AdminPageNav sin crear un ciclo de importaciones.
//
// En escritorio (!compact) todo vive detrás de un único control de cuenta (avatar +
// flecha): antes el badge "Admin", el correo y el botón "Cerrar sesión" competían por
// espacio directo en la barra superior y se sentía saturado en pantallas anchas
// (spec 13). El modo `compact`, usado dentro del menú hamburguesa móvil de
// AdminPageNav, no cambia — ahí no había ese problema.
// `menuPlacement="up"` — para cuando el control vive pegado al fondo de un contenedor alto
// (el sidebar del panel nuevo, spec 21): el menú abriendo hacia abajo se salía del viewport
// y hacía crecer la página (scroll no deseado al abrirlo). `AdminPageNav` (en la barra
// superior) sigue usando el valor por defecto, 'down', sin cambios.
export default function AccountControls({ compact = false, menuPlacement = 'down' }: { compact?: boolean; menuPlacement?: 'down' | 'up' }) {
  const auth = useAuthOptional();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú con un clic afuera o con Escape. Solo se suscribe mientras
  // el menú está abierto para no dejar listeners de más colgados en la página.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  if (!auth || !auth.user) return null;

  const signOut = () => {
    setMenuOpen(false);
    void auth.signOut();
  };

  const initial = (auth.email || '?').charAt(0).toUpperCase();

  if (compact) {
    return (
      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] text-[13px] font-bold transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        Cerrar sesión
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label="Cuenta"
        className="flex items-center gap-1.5 pl-1 pr-2 h-9 rounded-full bg-[#F4F4F5] border border-[rgba(0,0,0,0.08)] hover:bg-[#EDEDEF] transition-colors"
      >
        <span className="w-7 h-7 rounded-full bg-[#0A0A0A] text-white text-[11px] font-extrabold flex items-center justify-center flex-shrink-0">
          {initial}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-[#3F3F46] transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className={`absolute right-0 w-64 bg-white border border-[rgba(0,0,0,0.1)] rounded-xl shadow-lg p-2 z-50 ${
            menuPlacement === 'up' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
        >
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <span className="w-9 h-9 rounded-full bg-[#0A0A0A] text-white text-[13px] font-extrabold flex items-center justify-center flex-shrink-0">
              {initial}
            </span>
            <div className="min-w-0 flex flex-col gap-1">
              <span className="text-[12.5px] font-bold text-[#0A0A0A] truncate">{auth.email}</span>
              {auth.isAdmin && (
                <span className="inline-flex items-center gap-1 w-fit h-[18px] px-[7px] rounded-full bg-[#0A0A0A] text-white text-[10px] font-bold">
                  <ShieldCheck className="h-[9px] w-[9px]" />
                  Admin
                </span>
              )}
            </div>
          </div>
          <div className="h-px bg-[rgba(0,0,0,0.06)] my-1.5 mx-1" />
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[13px] font-bold text-[#0A0A0A] hover:bg-[#FAFAFA] transition-colors text-left"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
