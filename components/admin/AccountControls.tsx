'use client';

import { LogOut, ShieldCheck } from 'lucide-react';
import { useAuthOptional } from '../../lib/auth-context';

// Correo de la sesión, etiqueta de operador y "Cerrar sesión". No importa ui.tsx para
// poder usarse dentro de AdminPageNav sin crear un ciclo de importaciones.
export default function AccountControls({ compact = false }: { compact?: boolean }) {
  const auth = useAuthOptional();
  if (!auth || !auth.user) return null;

  const signOut = () => {
    void auth.signOut();
  };

  return (
    <div className="flex items-center gap-3">
      {!compact && (
        <div className="hidden lg:flex items-center gap-2 text-[13px] font-semibold text-[#3F3F46]">
          {auth.isAdmin && (
            <span className="inline-flex items-center gap-1 h-[22px] px-[9px] rounded-full bg-[#111111] text-white text-[11px] font-bold">
              <ShieldCheck className="h-[11px] w-[11px]" />
              Admin
            </span>
          )}
          {auth.email}
        </div>
      )}
      <button
        type="button"
        onClick={signOut}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] text-[13px] font-bold transition-colors"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className={compact ? '' : 'hidden sm:inline'}>Cerrar sesión</span>
      </button>
    </div>
  );
}
