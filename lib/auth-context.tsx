'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, sendEmailVerification, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth } from './firebase';

export interface LinkedWedding {
  id: string;
  title: string;
  date: string;
  // Spec 16 — ausente se interpreta como 'template' (bodas creadas antes de este spec)
  tier?: 'free' | 'template';
  // Spec 17 — correo del wedding planner atribuido a esta boda, si aplica
  plannerEmail?: string | null;
  // Solo llega para el operador (weddingOwners/<id>.emails)
  ownerEmails?: string[];
}

// 'error' cubre una falla de red o del servidor al consultar las bodas ligadas.
export type AuthStatus = 'loading' | 'signedOut' | 'unverified' | 'noWeddings' | 'ready' | 'error';

interface AuthValue {
  status: AuthStatus;
  user: User | null;
  email: string;
  isAdmin: boolean;
  // Spec 17 — true si el correo de la cuenta es el plannerEmail de alguna de sus bodas
  // (y la cuenta no es admin). Una cuenta de planner es, por lo demás, una cuenta normal.
  isPlanner: boolean;
  weddings: LinkedWedding[];
  // Código corto de la última falla al cargar las bodas (para diagnosticar), si la hubo
  errorCode: string | null;
  signOut: () => Promise<void>;
  // Vuelve a consultar las bodas ligadas (Reintentar). Con silent no muestra el estado de carga
  // ni cambia la pantalla si falla: sirve para actualizar la lista tras crear o editar.
  refresh: (opts?: { silent?: boolean }) => Promise<void>;
  // Recarga al usuario y su token; devuelve true si el correo ya está verificado
  recheckVerification: () => Promise<boolean>;
  resendVerification: () => Promise<void>;
  // fetch con el ID token de la sesión; para las rutas de operador
  authedFetch: (input: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [weddings, setWeddings] = useState<LinkedWedding[]>([]);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const load = useCallback(async (u: User, silent = false) => {
    // La verificación de correo se deshabilitó a propósito: ni aquí ni en
    // /api/auth/link-weddings se exige `emailVerified` para entrar. `unverified`
    // sigue existiendo en `AuthStatus`/`VerifyEmailScreen` por si se reactiva más
    // adelante, pero ningún camino del código la fija ya.
    if (!silent) setStatus('loading');
    try {
      const token = await u.getIdToken();
      const res = await fetch('/api/auth/link-weddings', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) {
        await firebaseSignOut(auth);
        return;
      }
      if (!res.ok) {
        const failure = await res.json().catch(() => ({}));
        const detail = [[failure.error, failure.reason || failure.code].filter(Boolean).join(':'), failure.detail].filter(Boolean).join(' — ');
        throw new Error(detail || `http_${res.status}`);
      }
      setErrorCode(null);
      const data = await res.json();
      const linked: LinkedWedding[] = Array.isArray(data.weddings) ? data.weddings : [];
      setIsAdmin(data.isAdmin === true);
      setWeddings(linked);
      setStatus(data.isAdmin === true || linked.length > 0 ? 'ready' : 'noWeddings');
    } catch (err) {
      if (!silent) {
        setErrorCode(err instanceof Error && err.message ? err.message : 'network');
        setStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setIsAdmin(false);
        setWeddings([]);
        setStatus('signedOut');
        return;
      }
      void load(u);
    });
  }, [load]);

  const value = useMemo<AuthValue>(
    () => ({
      status,
      user,
      email: user?.email?.toLowerCase() ?? '',
      isAdmin,
      isPlanner: !isAdmin && weddings.some((w) => !!w.plannerEmail && w.plannerEmail === (user?.email?.toLowerCase() ?? '')),
      weddings,
      errorCode,
      signOut: () => firebaseSignOut(auth),
      refresh: async (opts) => {
        if (auth.currentUser) await load(auth.currentUser, opts?.silent === true);
      },
      recheckVerification: async () => {
        const u = auth.currentUser;
        if (!u) return false;
        await u.reload();
        await u.getIdToken(true);
        const fresh = auth.currentUser;
        if (!fresh) return false;
        setUser(fresh);
        await load(fresh);
        return fresh.emailVerified;
      },
      resendVerification: async () => {
        if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      },
      authedFetch: async (input, init = {}) => {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error('unauthenticated');
        const headers = new Headers(init.headers);
        headers.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    }),
    [status, user, isAdmin, weddings, errorCode, load]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fuera de AuthProvider');
  return ctx;
}

// Para componentes compartidos que también podrían montarse fuera del panel.
export function useAuthOptional(): AuthValue | null {
  return useContext(AuthContext);
}
