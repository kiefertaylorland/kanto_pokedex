import * as React from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Auth state shared with the router (SEC-001/003). The client guard is UX only;
 * authorization of record is enforced by RLS at the database. On token refresh
 * failure Supabase emits a null session, which flips `isAuthenticated` false and
 * the `_protected` guard redirects to /auth.
 */
export interface AuthState {
  session: Session | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const redirectTo = () => `${window.location.origin}/auth/callback`;

export function AuthProvider({
  children,
  onChange,
}: {
  children: React.ReactNode;
  onChange?: (state: AuthState) => void;
}) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [status, setStatus] = React.useState<AuthState['status']>('loading');

  React.useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setStatus(data.session ? 'authenticated' : 'unauthenticated');
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setStatus(next ? 'authenticated' : 'unauthenticated');
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const state: AuthState = React.useMemo(
    () => ({ session, status, isAuthenticated: status === 'authenticated' }),
    [session, status],
  );

  React.useEffect(() => {
    onChange?.(state);
  }, [state, onChange]);

  const value: AuthContextValue = React.useMemo(
    () => ({
      ...state,
      async signInWithOAuth(provider) {
        // Minimal scopes; Supabase manages the OAuth handshake (SEC-002).
        await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } });
      },
      async signInWithMagicLink(email) {
        await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
      },
      async signOut() {
        await supabase.auth.signOut();
      },
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
