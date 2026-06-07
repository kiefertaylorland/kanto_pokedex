import * as React from 'react';
import { useAuth } from '@/features/auth/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { track } from '@/lib/analytics';

/**
 * Auth screen (FR-002..006). All identity is delegated to Supabase Auth — no
 * password fields, no credential handling (SEC-002/006). Errors are mapped to a
 * single generic message (SEC-012); details go to Sentry, not the user.
 */
export function AuthPage() {
  const { signInWithOAuth, signInWithMagicLink } = useAuth();
  const [email, setEmail] = React.useState('');
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleOAuth(provider: 'google' | 'github') {
    try {
      track('auth_started');
      await signInWithOAuth(provider);
    } catch {
      setStatus('error');
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('sending');
    try {
      track('auth_started');
      await signInWithMagicLink(email);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="mx-auto max-w-sm py-8">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button className="w-full" variant="outline" onClick={() => void handleOAuth('google')}>
              Continue with Google
            </Button>
            <Button className="w-full" variant="outline" onClick={() => void handleOAuth('github')}>
              Continue with GitHub
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-500">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          {status === 'sent' ? (
            <p className="text-sm text-ink-700" role="status">
              Check your email for a sign-in link.
            </p>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email magic link
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send magic link'}
              </Button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-sm text-error" role="alert">
              We couldn’t start sign-in. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
