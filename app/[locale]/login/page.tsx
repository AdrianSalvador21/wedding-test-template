'use client';

import { Suspense, useEffect, useState, type FormEvent } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Mail } from 'lucide-react';
import { auth } from '../../../lib/firebase';
import { useAuth } from '../../../lib/auth-context';
import { resolveLanding } from '../../../lib/auth-redirect';
import {
  AuthBanner,
  AuthButton,
  AuthErrorScreen,
  AuthField,
  AuthHead,
  AuthScreen,
  EnteringScreen,
  IconBadge,
  LoadingScreen,
  TextLink,
  VerifyEmailScreen,
} from '../../../components/admin/auth-ui';

type Mode = 'signin' | 'signup' | 'reset' | 'sent';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function authErrorMessage(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo. Inicia sesión o recupera tu contraseña.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Usa al menos 8 caracteres.';
    case 'auth/invalid-email':
      return 'Escribe un correo válido.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
    default:
      return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
  }
}

const errorCode = (err: unknown) => (err && typeof err === 'object' && 'code' in err ? String((err as { code: string }).code) : '');

function LoginContent() {
  const authCtx = useAuth();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'es';
  const next = searchParams.get('next');

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<'email' | 'password' | null>(null);
  const [busy, setBusy] = useState(false);

  const { status, weddings, isAdmin } = authCtx;
  const target = resolveLanding({ locale, weddings, isAdmin, next });

  useEffect(() => {
    if (status === 'ready' || status === 'noWeddings') router.replace(target);
  }, [status, target, router]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setFieldError(null);
    setPassword('');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);
    const cleanEmail = email.trim();

    if (!EMAIL_RE.test(cleanEmail)) {
      setFieldError('email');
      setError('Escribe un correo válido.');
      return;
    }
    if (mode !== 'reset' && !password) {
      setFieldError('password');
      setError('Escribe tu contraseña.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setFieldError('password');
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, cleanEmail, password);
      } else if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        await sendEmailVerification(cred.user);
      } else {
        try {
          await sendPasswordResetEmail(auth, cleanEmail);
        } catch (err) {
          // No revelamos si el correo tiene cuenta: solo mostramos errores de formato o de red.
          const code = errorCode(err);
          if (code !== 'auth/user-not-found') throw err;
        }
        setMode('sent');
      }
    } catch (err) {
      setError(authErrorMessage(errorCode(err)));
      if (errorCode(err) === 'auth/invalid-email') setFieldError('email');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') return <LoadingScreen />;
  if (status === 'unverified') return <VerifyEmailScreen />;
  if (status === 'error') return <AuthErrorScreen />;
  if (status === 'ready' || status === 'noWeddings') {
    const single = !isAdmin && weddings.length === 1 ? weddings[0] : null;
    return single ? <EnteringScreen title={single.title} date={single.date} /> : <LoadingScreen text="Entrando..." />;
  }

  if (mode === 'sent') {
    return (
      <AuthScreen showHelp={false}>
        <IconBadge icon={Mail} />
        <AuthHead
          title="Revisa tu correo"
          sub={
            <>
              Si <strong className="text-[#0A0A0A]">{email.trim()}</strong> tiene una cuenta, te enviamos un enlace para crear una nueva contraseña. Puede tardar un par de minutos; revisa también la carpeta de spam.
            </>
          }
        />
        <AuthButton variant="ghost" onClick={() => switchMode('signin')}>
          Volver a iniciar sesión
        </AuthButton>
      </AuthScreen>
    );
  }

  const title = mode === 'signin' ? 'Inicia sesión' : mode === 'signup' ? 'Crea tu cuenta' : 'Recupera tu contraseña';
  const sub =
    mode === 'signin'
      ? 'Entra con el correo con el que registramos tu invitación.'
      : mode === 'signup'
        ? 'Usa el mismo correo que nos compartiste para que enlacemos tu invitación.'
        : 'Escribe tu correo y te enviaremos un enlace para crear una nueva.';

  return (
    <AuthScreen>
      <AuthHead title={title} sub={sub} />
      <form onSubmit={submit} noValidate className="flex flex-col gap-[22px]">
        {error && <AuthBanner>{error}</AuthBanner>}
        <div className="flex flex-col gap-4">
          <AuthField
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="nombre@correo.com"
            autoComplete="email"
            error={fieldError === 'email'}
          />
          {mode !== 'reset' && (
            <AuthField
              label="Contraseña"
              password
              value={password}
              onChange={setPassword}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              error={fieldError === 'password'}
              hint={mode === 'signup' ? 'Mínimo 8 caracteres.' : undefined}
            />
          )}
          {mode === 'signin' && (
            <div className="flex justify-end">
              <TextLink onClick={() => switchMode('reset')}>¿Olvidaste tu contraseña?</TextLink>
            </div>
          )}
        </div>
        <AuthButton type="submit" loading={busy}>
          {mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace'}
        </AuthButton>
        {mode === 'signup' && (
          <p className="m-0 text-xs leading-normal text-[#71717A] text-center">Te enviaremos un correo para verificar tu dirección antes de entrar.</p>
        )}
      </form>
      {mode === 'reset' ? (
        <div className="text-center">
          <TextLink onClick={() => switchMode('signin')}>Volver a iniciar sesión</TextLink>
        </div>
      ) : (
        <div className="border-t border-[rgba(0,0,0,0.08)] pt-[18px] text-[13px] text-[#3F3F46] text-center">
          {mode === 'signin' ? (
            <>
              ¿Todavía no tienes cuenta? <TextLink onClick={() => switchMode('signup')}>Crear cuenta</TextLink>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta? <TextLink onClick={() => switchMode('signin')}>Inicia sesión</TextLink>
            </>
          )}
        </div>
      )}
    </AuthScreen>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginContent />
    </Suspense>
  );
}
