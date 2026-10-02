'use client';

import { useEffect, useId, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowRight, CheckCircle2, Heart, LayoutGrid, Loader2, Lock, Mail, Sparkles, Users } from 'lucide-react';
import { manrope, displayFont } from './ui';
import { fraunces } from '../../lib/brand';
import { useAuth } from '../../lib/auth-context';
import { whatsappUrl } from '../../lib/contact';
import { useFreeWeddingForm, FreeWeddingFields } from './FreeWeddingTools';

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
    <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA] flex flex-col items-center gap-9 px-4 sm:px-6 py-12 sm:py-16" style={manrope}>
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
    <div className="w-[52px] h-[52px] rounded-[14px] bg-[rgba(198,102,60,0.1)] flex items-center justify-center">
      <Icon className="h-6 w-6 text-[#AE5730]" />
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
          ? 'bg-[#AE5730] text-white border border-transparent hover:bg-[#8F4524]'
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
    <button type="button" onClick={onClick} className="text-[13px] font-bold text-[#AE5730] underline hover:text-[#8F4524]">
      {children}
    </button>
  );
}

export function LoadingScreen({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div className="admin-form min-h-screen min-h-[100dvh] bg-[#FAFAFA] flex items-center justify-center" style={manrope}>
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

// Onboarding de bienvenida (spec 22). Acento tipográfico en Fraunces itálica, solo en este
// flujo — el resto del panel de admin sigue usando únicamente `displayFont`/Manrope.
function OnboardingEmphasis({ children }: { children: ReactNode }) {
  return (
    <em style={{ ...fraunces, fontStyle: 'italic', fontWeight: 500, color: '#AE5730' }}>{children}</em>
  );
}

function OnboardingTitle({ children }: { children: ReactNode }) {
  return <h1 className="m-0 text-[25px] font-extrabold tracking-[-0.01em] text-[#0A0A0A] leading-[1.2]">{children}</h1>;
}

function OnboardingProgress({ step }: { step: number }) {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 h-1 rounded-full bg-[#F4F4F5] overflow-hidden">
          <div className="h-full rounded-full bg-[#AE5730] transition-[width] duration-300" style={{ width: i <= step ? '100%' : '0%' }} />
        </div>
      ))}
    </div>
  );
}

function OnboardingFeature({
  icon: Icon,
  title,
  children,
  locked = false,
  link,
}: {
  icon: typeof Mail;
  title: string;
  children: ReactNode;
  locked?: boolean;
  link?: ReactNode;
}) {
  return (
    <div className={`flex gap-3 items-start p-3.5 rounded-xl border ${locked ? 'border-dashed border-[rgba(0,0,0,0.16)]' : 'border-[rgba(0,0,0,0.08)]'}`}>
      <div
        className={`w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
          locked ? 'bg-[#F4F4F5] text-[#71717A]' : 'bg-[rgba(198,102,60,0.1)] text-[#AE5730]'
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="text-sm font-extrabold text-[#0A0A0A]">{title}</div>
        <p className="m-0 text-xs leading-[1.5] text-[#71717A]">{children}</p>
        {link}
      </div>
    </div>
  );
}

export function NoWeddingsScreen() {
  const auth = useAuth();
  const params = useParams();
  const locale = (params?.locale as string) || 'es';
  const [step, setStep] = useState(0);
  const [weddingId, setWeddingId] = useState<string | null>(null);
  // `NoWeddingsScreen` solo se monta dentro de `/admin` (app/[locale]/admin/page.tsx). Al crear
  // la boda no hace falta refrescar `auth`: el paso 4 enlaza directo al panel de la boda nueva o
  // de vuelta a "Mis invitaciones", que al cargar ya resuelve `auth.status` a 'ready'.
  const form = useFreeWeddingForm((id) => {
    setWeddingId(id);
    setStep(3);
  });
  const recoveryMessage = `Hola, ya contraté mi invitación con Invyta (correo: ${auth.email}) y no la veo en mi cuenta.`;

  return (
    <AuthScreen showHelp={false}>
      <OnboardingProgress step={step} />

      {step === 0 && (
        <div className="flex flex-col gap-[22px]">
          <IconBadge icon={Heart} />
          <OnboardingTitle>
            Bienvenida a <OnboardingEmphasis>Invyta</OnboardingEmphasis>.
          </OnboardingTitle>
          <p className="m-0 text-sm leading-[1.6] text-[#3F3F46]">
            Tu boda, en una invitación que se siente tuya. En un par de minutos armamos tu lista de invitados y tus mesas.
          </p>
          <AuthButton onClick={() => setStep(1)}>Comenzar</AuthButton>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-[18px]">
          <div className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-[#AE5730]">Con tu cuenta gratis</div>
          <OnboardingTitle>
            Esto es lo que vas a <OnboardingEmphasis>organizar</OnboardingEmphasis>.
          </OnboardingTitle>
          <div className="flex flex-col gap-2.5">
            <OnboardingFeature icon={Users} title="Lista de invitados">
              Agregas a cada invitado y anotas tú su confirmación — sin límite de invitados.
            </OnboardingFeature>
            <OnboardingFeature icon={LayoutGrid} title="Acomodo de mesas">
              Arma tus mesas y mueve invitados entre ellas para cuadrar tu salón.
            </OnboardingFeature>
            <OnboardingFeature
              icon={Sparkles}
              title="Invitación con diseño"
              locked
              link={
                <a
                  href={whatsappUrl('Hola, quiero saber más de la invitación con diseño de Invyta.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-[#AE5730] hover:text-[#8F4524]"
                >
                  Escríbenos por WhatsApp
                  <ArrowRight className="h-3 w-3" />
                </a>
              }
            >
              Un sitio propio para tus invitados, con enlace único y tu panel para editar los datos y el diseño cuando quieras.
            </OnboardingFeature>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep(0)} className="text-[13px] font-bold text-[#71717A] hover:text-[#0A0A0A]">
              Atrás
            </button>
            <div className="flex-1">
              <AuthButton onClick={() => setStep(2)}>Crear mi boda gratis</AuthButton>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={form.submit} noValidate className="flex flex-col gap-[20px]">
          <OnboardingTitle>
            ¿Quiénes se <OnboardingEmphasis>casan</OnboardingEmphasis>?
          </OnboardingTitle>
          <FreeWeddingFields form={form} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setStep(1)} className="text-[13px] font-bold text-[#71717A] hover:text-[#0A0A0A]">
              Atrás
            </button>
            <div className="flex-1">
              <AuthButton type="submit" loading={form.submitting}>
                Crear mi boda
              </AuthButton>
            </div>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-[20px]">
          <div className="w-[52px] h-[52px] rounded-full bg-[rgba(198,102,60,0.1)] flex items-center justify-center text-[#AE5730]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <OnboardingTitle>
            Tu boda está <OnboardingEmphasis>lista</OnboardingEmphasis>.
          </OnboardingTitle>
          <div className="border border-[rgba(0,0,0,0.08)] rounded-xl p-4 flex flex-col gap-1">
            <span style={{ ...fraunces, fontStyle: 'italic', fontWeight: 500 }} className="text-lg text-[#0A0A0A]">
              {form.bride.trim()} &amp; {form.groom.trim()}
            </span>
            <span className="text-xs text-[#71717A]">{formatWeddingDate(form.date) || 'Fecha por confirmar'}</span>
          </div>
          <p className="m-0 text-sm text-[#3F3F46]">Ya puedes empezar a sumar invitados y armar tus mesas.</p>
          <div className="flex flex-col gap-2.5">
            {weddingId && (
              <a
                href={`/${locale}/admin/panel/${weddingId}/guests`}
                className="w-full inline-flex items-center justify-center h-[46px] px-5 rounded-lg bg-[#AE5730] text-white hover:bg-[#8F4524] text-sm font-bold transition-colors"
              >
                Agregar mis primeros invitados
              </a>
            )}
            <a
              href={`/${locale}/admin`}
              className="w-full inline-flex items-center justify-center h-[46px] px-5 rounded-lg bg-white text-[#0A0A0A] border border-[rgba(0,0,0,0.14)] hover:bg-[#FAFAFA] text-sm font-bold transition-colors"
            >
              Ir a mis invitaciones
            </a>
          </div>
        </div>
      )}

      {step < 2 && (
        <p className="m-0 text-xs leading-normal text-[#71717A] text-center">
          ¿Ya contrataste una invitación con diseño?{' '}
          <a href={whatsappUrl(recoveryMessage)} target="_blank" rel="noopener noreferrer" className="font-bold text-[#0A0A0A] underline">
            Escríbenos por WhatsApp
          </a>{' '}
          para ligarla a tu cuenta.
        </p>
      )}

      {step < 3 && (
        <div className="border-t border-[rgba(0,0,0,0.08)] pt-4 text-center">
          <TextLink onClick={() => void auth.signOut()}>Cerrar sesión</TextLink>
        </div>
      )}
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
          className="w-full inline-flex items-center justify-center h-[46px] px-5 rounded-lg bg-[#AE5730] text-white hover:bg-[#8F4524] text-sm font-bold transition-colors"
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
