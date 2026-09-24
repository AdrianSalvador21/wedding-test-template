'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Loader2, Lock, Mail, MessageCircle } from 'lucide-react';
import { manrope, displayFont } from './ui';
import { useAuth } from '../../lib/auth-context';
import { whatsappUrl } from '../../lib/contact';

// Piezas de las pantallas de acceso (login, verificación, sin boda, sin acceso).
// Siguen el diseño del spec 08 con la paleta neutra de los paneles.

export function formatWeddingDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function AuthScreen({ children, showHelp = true }: { children: ReactNode; showHelp?: boolean }) {
  return (
    <div className="admin-form min-h-screen bg-[#FAFAFA] flex flex-col items-center gap-9 px-4 sm:px-6 py-12 sm:py-16" style={manrope}>
      <span className="text-[28px] sm:text-[30px] text-[#0A0A0A]" style={displayFont}>
        invyta
      </span>
      <div className="w-full max-w-[420px] bg-white border border-[rgba(0,0,0,0.08)] rounded-2xl p-6 sm:p-8 flex flex-col gap-[22px]">{children}</div>
      {showHelp && (
        <p className="text-[13px] text-[#71717A] text-center">
          ¿Problemas para entrar?{' '}
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0A0A0A]">
            Escríbenos por WhatsApp
          </a>
        </p>
      )}
    </div>
  );
}

export function AuthHead({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="m-0 text-[26px] font-extrabold tracking-[-0.01em] text-[#0A0A0A] leading-[1.15]">{title}</h1>
      <p className="m-0 text-sm leading-[1.55] text-[#3F3F46]">{sub}</p>
    </div>
  );
}

export function IconBadge({ icon: Icon }: { icon: typeof Mail }) {
  return (
    <div className="w-[52px] h-[52px] rounded-[14px] bg-[#F4F4F5] flex items-center justify-center">
      <Icon className="h-6 w-6 text-[#0A0A0A]" />
    </div>
  );
}

export function AuthBanner({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="flex gap-2.5 items-start bg-[rgba(185,28,28,0.06)] border border-[rgba(185,28,28,0.3)] rounded-[10px] px-3.5 py-3 text-[13px] leading-normal text-[#7F1D1D]">
      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-[#B91C1C]" />
      <span>{children}</span>
    </div>
  );
}

export function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  error,
  hint,
  placeholder,
  autoComplete,
  password = false,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  hint?: string;
  placeholder?: string;
  autoComplete?: string;
  password?: boolean;
}) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-[#27272A]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={password ? (shown ? 'text' : 'password') : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          className={`w-full h-[46px] rounded-lg border bg-white text-sm text-[#0A0A0A] focus:outline-none focus:ring-2 focus:ring-[rgba(0,0,0,0.08)] focus:border-[#111111] transition-colors ${
            error ? 'border-[#B91C1C]' : 'border-[rgba(0,0,0,0.14)]'
          } ${password ? 'pl-4 pr-[84px]' : 'px-4'}`}
        />
        {password && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            className="absolute right-2 top-[7px] h-8 px-2.5 rounded-md bg-[#F4F4F5] text-[#3F3F46] text-xs font-bold hover:bg-[#E4E4E7]"
          >
            {shown ? 'Ocultar' : 'Mostrar'}
          </button>
        )}
      </div>
      {hint && <span className={`text-xs ${error ? 'text-[#B91C1C]' : 'text-[#71717A]'}`}>{hint}</span>}
    </div>
  );
}

export function AuthButton({
  children,
  onClick,
  type = 'button',
  variant = 'solid',
  loading = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'solid' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-lg text-sm font-bold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
        variant === 'solid'
          ? 'bg-[#111111] text-white border border-transparent hover:bg-black'
          : 'bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA]'
      }`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-[13px] font-bold text-[#0A0A0A] underline hover:text-[#3F3F46]">
      {children}
    </button>
  );
}

export function LoadingScreen({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="admin-form min-h-screen bg-[#FAFAFA] flex items-center justify-center" style={manrope}>
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111] mx-auto mb-4" />
        <p className="text-[#3F3F46]">{text}</p>
      </div>
    </div>
  );
}

export function EnteringScreen({ title, date }: { title: string; date: string }) {
  const formatted = formatWeddingDate(date);
  return (
    <AuthScreen showHelp={false}>
      <div className="flex flex-col items-center gap-[18px] py-3">
        <Loader2 className="h-[34px] w-[34px] animate-spin text-[#111111]" />
        <div className="text-center flex flex-col gap-1.5">
          <div className="text-xl font-extrabold text-[#0A0A0A]">Entrando a tu invitación</div>
          <div className="text-sm text-[#3F3F46]">{[title, formatted].filter(Boolean).join(' · ')}</div>
        </div>
      </div>
    </AuthScreen>
  );
}

export function VerifyEmailScreen() {
  const auth = useAuth();
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const check = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const ok = await auth.recheckVerification();
      if (!ok) setMessage('Todavía no vemos la verificación. Abre el enlace del correo y vuelve a intentarlo.');
    } catch {
      setMessage('No pudimos comprobarlo. Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    setMessage(null);
    try {
      await auth.resendVerification();
      setCooldown(60);
      setMessage('Te enviamos otro correo.');
    } catch {
      setCooldown(60);
      setMessage('No pudimos reenviarlo ahora. Espera un momento e inténtalo de nuevo.');
    }
  };

  return (
    <AuthScreen>
      <IconBadge icon={Mail} />
      <AuthHead
        title="Verifica tu correo"
        sub={
          <>
            Enviamos un enlace a <strong className="text-[#0A0A0A]">{auth.email}</strong>. Ábrelo y regresa aquí para entrar.
          </>
        }
      />
      <div className="flex flex-col gap-2.5">
        <AuthButton onClick={check} loading={checking}>
          Ya verifiqué
        </AuthButton>
        <AuthButton variant="ghost" onClick={resend} disabled={cooldown > 0}>
          {cooldown > 0 ? `Reenviar correo · disponible en ${cooldown} s` : 'Reenviar correo'}
        </AuthButton>
      </div>
      {message && <p className="m-0 text-[13px] leading-normal text-[#3F3F46]">{message}</p>}
      <p className="m-0 text-xs leading-normal text-[#71717A]">¿No lo ves? Revisa la carpeta de spam o correo no deseado.</p>
      <div className="border-t border-[rgba(0,0,0,0.08)] pt-4 text-center">
        <TextLink onClick={() => void auth.signOut()}>Cerrar sesión</TextLink>
      </div>
    </AuthScreen>
  );
}

export function NoWeddingsScreen() {
  const auth = useAuth();
  const [retrying, setRetrying] = useState(false);
  const retry = async () => {
    setRetrying(true);
    try {
      await auth.refresh();
    } finally {
      setRetrying(false);
    }
  };
  const message = `Hola, me registré en Invyta con ${auth.email} y no veo mi invitación.`;
  return (
    <AuthScreen showHelp={false}>
      <IconBadge icon={Mail} />
      <AuthHead
        title="Todavía no tienes una invitación ligada a tu cuenta"
        sub={
          <>
            Iniciaste sesión con <strong className="text-[#0A0A0A]">{auth.email}</strong>. Si tu invitación ya está lista, es posible que la registremos con otro correo.
          </>
        }
      />
      <div className="flex flex-col gap-2.5">
        <AuthButton onClick={retry} loading={retrying}>
          Reintentar
        </AuthButton>
        <a
          href={whatsappUrl(message)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 h-[46px] px-5 rounded-lg bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] text-sm font-bold transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
          Escribirnos por WhatsApp
        </a>
      </div>
      <p className="m-0 text-xs leading-normal text-[#71717A]">Cuando la liguemos, pulsa Reintentar. No necesitas registrarte otra vez.</p>
      <div className="border-t border-[rgba(0,0,0,0.08)] pt-4 text-center">
        <TextLink onClick={() => void auth.signOut()}>Cerrar sesión</TextLink>
      </div>
    </AuthScreen>
  );
}

export function NoAccessScreen() {
  const auth = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  return (
    <AuthScreen showHelp={false}>
      <IconBadge icon={Lock} />
      <AuthHead
        title="No tienes acceso a esta boda"
        sub={
          <>
            Tu cuenta (<strong className="text-[#0A0A0A]">{auth.email}</strong>) no está ligada a esta invitación.
          </>
        }
      />
      <div className="flex flex-col gap-2.5">
        <a
          href={`/${locale}/admin`}
          className="w-full inline-flex items-center justify-center h-[46px] px-5 rounded-lg bg-[#111111] text-white hover:bg-black text-sm font-bold transition-colors"
        >
          Ir a mis invitaciones
        </a>
        <AuthButton variant="ghost" onClick={() => void auth.signOut()}>
          Cerrar sesión
        </AuthButton>
      </div>
    </AuthScreen>
  );
}

export function AuthErrorScreen() {
  const auth = useAuth();
  const [retrying, setRetrying] = useState(false);
  const retry = async () => {
    setRetrying(true);
    try {
      await auth.refresh();
    } finally {
      setRetrying(false);
    }
  };
  return (
    <AuthScreen>
      <IconBadge icon={AlertCircle} />
      <AuthHead title="No pudimos cargar tus invitaciones" sub="Revisa tu conexión e inténtalo de nuevo. Si el problema sigue, escríbenos." />
      {auth.errorCode && <p className="m-0 text-xs text-[#71717A]">Código: <span className="font-mono">{auth.errorCode}</span></p>}
      <div className="flex flex-col gap-2.5">
        <AuthButton onClick={retry} loading={retrying}>
          Reintentar
        </AuthButton>
        <AuthButton variant="ghost" onClick={() => void auth.signOut()}>
          Cerrar sesión
        </AuthButton>
      </div>
    </AuthScreen>
  );
}
