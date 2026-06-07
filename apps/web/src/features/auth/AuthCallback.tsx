import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/features/auth/auth';
import { LoadingState } from '@/components/state';
import { track } from '@/lib/analytics';

/**
 * OAuth / magic-link return target. Supabase parses the session from the URL
 * (detectSessionInUrl); once authenticated we redirect to /pokedex (FR-006).
 */
export function AuthCallback() {
  const { status } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (status === 'authenticated') {
      track('auth_succeeded');
      void navigate({ to: '/pokedex', replace: true });
    } else if (status === 'unauthenticated') {
      void navigate({ to: '/auth', replace: true });
    }
  }, [status, navigate]);

  return <LoadingState label="Signing you in…" />;
}
