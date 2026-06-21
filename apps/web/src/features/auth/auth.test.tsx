import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth, type AuthState } from './auth';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

function Consumer() {
  const auth = useAuth();
  return (
    <>
      <div>{auth.status}</div>
      <div>{auth.isAuthenticated ? 'yes' : 'no'}</div>
      <button type="button" onClick={() => void auth.signInWithOAuth('github')}>
        OAuth
      </button>
      <button type="button" onClick={() => void auth.signInWithMagicLink('ash@kanto.dev')}>
        Magic
      </button>
      <button type="button" onClick={() => void auth.signOut()}>
        Sign out
      </button>
    </>
  );
}

describe('AuthProvider', () => {
  let authChange: ((event: string, session: { access_token: string } | null) => void) | undefined;
  const unsubscribe = vi.fn();

  beforeEach(() => {
    unsubscribe.mockReset();
    authChange = undefined;
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { access_token: 'token' } },
    } as never);
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((cb) => {
      authChange = cb as typeof authChange;
      return { data: { subscription: { unsubscribe } } } as never;
    });
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({} as never);
    vi.mocked(supabase.auth.signInWithOtp).mockResolvedValue({} as never);
    vi.mocked(supabase.auth.signOut).mockResolvedValue({} as never);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('exposes the authenticated session and auth actions', async () => {
    const onChange = vi.fn<(state: AuthState) => void>();
    const user = userEvent.setup();

    render(
      <AuthProvider onChange={onChange}>
        <Consumer />
      </AuthProvider>,
    );

    await screen.findByText('authenticated');
    expect(screen.getByText('yes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'OAuth' }));
    await user.click(screen.getByRole('button', { name: 'Magic' }));
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
      options: { redirectTo: 'http://localhost:3000/auth/callback' },
    });
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'ash@kanto.dev',
      options: { emailRedirectTo: 'http://localhost:3000/auth/callback' },
    });
    expect(supabase.auth.signOut).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith({
      session: { access_token: 'token' },
      status: 'authenticated',
      isAuthenticated: true,
    });
  });

  it('handles unauthenticated sessions, auth events, and cleanup', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({ data: { session: null } } as never);

    const onChange = vi.fn<(state: AuthState) => void>();
    const { unmount } = render(
      <AuthProvider onChange={onChange}>
        <Consumer />
      </AuthProvider>,
    );

    await screen.findByText('unauthenticated');
    expect(screen.getByText('no')).toBeInTheDocument();

    act(() => {
      authChange?.('SIGNED_IN', { access_token: 'new-token' });
    });
    await waitFor(() => expect(screen.getByText('authenticated')).toBeInTheDocument());

    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('throws when useAuth is called outside the provider', () => {
    expect(() => render(<Consumer />)).toThrow('useAuth must be used within AuthProvider');
  });
});
