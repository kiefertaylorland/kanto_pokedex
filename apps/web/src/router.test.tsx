import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';

vi.mock('@/routes/RootLayout', () => ({ RootLayout: () => null }));
vi.mock('@/routes/NotFound', () => ({ NotFound: () => null }));
vi.mock('@/features/landing/LandingPage', () => ({ LandingPage: () => null }));
vi.mock('@/features/auth/AuthPage', () => ({ AuthPage: () => null }));
vi.mock('@/features/auth/AuthCallback', () => ({ AuthCallback: () => null }));
vi.mock('@/features/pokedex/PokedexPage', () => ({ PokedexPage: () => null }));
vi.mock('@/features/pokemon-detail/DetailPage', () => ({ DetailPage: () => null }));
vi.mock('@/features/favorites/FavoritesPage', () => ({ FavoritesPage: () => null }));
vi.mock('@/features/compare/ComparePage', () => ({ ComparePage: () => null }));

describe('createAppRouter', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('validates compare and pokedex search params', async () => {
    const { createAppRouter } = await import('./router');
    const router = createAppRouter({
      queryClient: new QueryClient(),
      auth: { state: { session: null, status: 'authenticated', isAuthenticated: true } },
    });

    expect(typeof router.navigate).toBe('function');
    expect((router.routeTree as { options?: { notFoundComponent?: () => unknown } }).options?.notFoundComponent?.()).toBeTruthy();
    expect(router.options.defaultNotFoundComponent?.({} as never)).toBeTruthy();

    await router.navigate({ to: '/compare', search: { a: '0' as never, b: '26' as never } });
    expect(router.state.location.pathname).toBe('/compare');
    expect(router.state.location.search).toEqual({ a: undefined, b: 26 });

    await router.navigate({
      to: '/pokedex',
      search: { q: 'Pika', types: ['electric'], sort: 'name', dir: 'desc', page: '2' as never },
    });
    expect(router.state.location.search).toEqual({
      q: 'Pika',
      types: ['electric'],
      sort: 'name',
      dir: 'desc',
      page: 2,
    });
  });

  it('redirects unauthenticated users from protected routes', async () => {
    const { createAppRouter } = await import('./router');
    const router = createAppRouter({
      queryClient: new QueryClient(),
      auth: { state: { session: null, status: 'unauthenticated', isAuthenticated: false } },
    });

    await router.navigate({ to: '/pokedex' });
    expect(router.state.location.pathname).toBe('/auth');
  });
});
