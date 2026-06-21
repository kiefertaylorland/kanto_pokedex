import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';

const invalidate = vi.fn();
const createRoot = vi.fn();
const initSentry = vi.fn();

vi.mock('@/routes/RootLayout', () => ({ RootLayout: () => <div>root-layout</div> }));
vi.mock('@/routes/NotFound', () => ({ NotFound: () => <div>not-found</div> }));
vi.mock('@/features/landing/LandingPage', () => ({ LandingPage: () => <div>landing</div> }));
vi.mock('@/features/auth/AuthPage', () => ({ AuthPage: () => <div>auth-page</div> }));
vi.mock('@/features/auth/AuthCallback', () => ({ AuthCallback: () => <div>auth-callback</div> }));
vi.mock('@/features/pokedex/PokedexPage', () => ({ PokedexPage: () => <div>pokedex</div> }));
vi.mock('@/features/pokemon-detail/DetailPage', () => ({ DetailPage: () => <div>detail</div> }));
vi.mock('@/features/favorites/FavoritesPage', () => ({ FavoritesPage: () => <div>favorites</div> }));
vi.mock('@/features/compare/ComparePage', () => ({ ComparePage: () => <div>compare</div> }));

vi.mock('@/lib/sentry', () => ({ initSentry }));
vi.mock('@/components/state', () => ({ LoadingState: ({ label }: { label: string }) => <div>{label}</div> }));
vi.mock('@/features/auth/auth', () => ({
  AuthProvider: ({
    children,
    onChange,
  }: {
    children: React.ReactNode;
    onChange?: (state: { session: null; status: 'loading' | 'authenticated'; isAuthenticated: boolean }) => void;
  }) => {
    React.useEffect(() => {
      onChange?.({ session: null, status: 'loading', isAuthenticated: false });
      onChange?.({ session: null, status: 'authenticated', isAuthenticated: true });
    }, [onChange]);
    return <>{children}</>;
  },
}));
vi.mock('@/router', () => ({
  createAppRouter: vi.fn(() => ({ invalidate })),
}));
vi.mock('@tanstack/react-router', () => ({
  RouterProvider: () => <div>router-ready</div>,
}));
vi.mock('react-dom/client', () => ({
  default: {
    createRoot,
  },
}));
vi.mock('@/styles/globals.css', () => ({}));

describe('router and main entrypoint', () => {
  beforeEach(() => {
    vi.resetModules();
    invalidate.mockReset();
    initSentry.mockReset();
    createRoot.mockReset().mockReturnValue({
      render: (node: React.ReactNode) => render(<>{node}</>),
    });
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('boots the main entrypoint and renders the app once auth is ready', async () => {
    await import('./main');

    expect(initSentry).toHaveBeenCalledOnce();
    expect(createRoot).toHaveBeenCalledWith(document.getElementById('root'));
    await waitFor(() => expect(screen.getByText('router-ready')).toBeInTheDocument());
    expect(invalidate).toHaveBeenCalled();
  });

  it('throws when the root element is missing', async () => {
    document.body.innerHTML = '';

    await expect(import('./main')).rejects.toThrow('Root element not found');
  });
});
