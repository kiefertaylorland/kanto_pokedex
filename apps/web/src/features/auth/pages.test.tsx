import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthCallback } from './AuthCallback';
import { AuthPage } from './AuthPage';
import { track } from '@/lib/analytics';
import { useAuth } from './auth';

const navigate = vi.fn();

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
vi.mock('./auth', () => ({ useAuth: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }));

describe('auth pages', () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(track).mockReset();
  });

  it('starts OAuth sign-in flows and shows a generic error on failure', async () => {
    const signInWithOAuth = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('oauth failed'));
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      status: 'unauthenticated',
      isAuthenticated: false,
      signInWithOAuth,
      signInWithMagicLink: vi.fn(),
      signOut: vi.fn(),
    });

    const user = userEvent.setup();
    render(<AuthPage />);

    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));
    await user.click(screen.getByRole('button', { name: 'Continue with GitHub' }));

    expect(track).toHaveBeenCalledWith('auth_started');
    expect(signInWithOAuth).toHaveBeenNthCalledWith(1, 'google');
    expect(signInWithOAuth).toHaveBeenNthCalledWith(2, 'github');
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t start sign-in. Please try again.');
  });

  it('submits magic-link sign-in, handles blank submits, and reports send state', async () => {
    const signInWithMagicLink = vi
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('mail failed'));
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      status: 'unauthenticated',
      isAuthenticated: false,
      signInWithOAuth: vi.fn(),
      signInWithMagicLink,
      signOut: vi.fn(),
    });

    const user = userEvent.setup();
    const firstRender = render(<AuthPage />);

    await user.click(screen.getByRole('button', { name: 'Send magic link' }));
    expect(signInWithMagicLink).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Email magic link'), 'misty@kanto.dev');
    await user.click(screen.getByRole('button', { name: 'Send magic link' }));
    expect(track).toHaveBeenCalledWith('auth_started');
    expect(signInWithMagicLink).toHaveBeenNthCalledWith(1, 'misty@kanto.dev');
    expect(await screen.findByRole('status')).toHaveTextContent('Check your email for a sign-in link.');

    firstRender.unmount();
    render(<AuthPage />);
    await user.clear(screen.getByLabelText('Email magic link'));
    await user.type(screen.getByLabelText('Email magic link'), 'brock@kanto.dev');
    await user.click(screen.getByRole('button', { name: 'Send magic link' }));
    expect(signInWithMagicLink).toHaveBeenNthCalledWith(2, 'brock@kanto.dev');
    expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t start sign-in. Please try again.');
  });

  it('redirects from the callback route based on auth state', async () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      status: 'authenticated',
      isAuthenticated: true,
      signInWithOAuth: vi.fn(),
      signInWithMagicLink: vi.fn(),
      signOut: vi.fn(),
    });

    const { rerender } = render(<AuthCallback />);
    expect(screen.getByRole('status')).toHaveTextContent('Signing you in…');
    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/pokedex', replace: true }));
    expect(track).toHaveBeenCalledWith('auth_succeeded');

    vi.mocked(useAuth).mockReturnValue({
      session: null,
      status: 'unauthenticated',
      isAuthenticated: false,
      signInWithOAuth: vi.fn(),
      signInWithMagicLink: vi.fn(),
      signOut: vi.fn(),
    });
    rerender(<AuthCallback />);

    await waitFor(() => expect(navigate).toHaveBeenCalledWith({ to: '/auth', replace: true }));
  });
});
