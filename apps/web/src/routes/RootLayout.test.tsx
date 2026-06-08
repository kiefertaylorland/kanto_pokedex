import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { RootLayout } from './RootLayout';

vi.mock('@/features/auth/auth', () => ({
  useAuth: () => ({
    session: null,
    status: 'authenticated',
    isAuthenticated: true,
    signInWithOAuth: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signOut: vi.fn(),
  }),
}));

function renderLayout(path: string) {
  const rootRoute = createRootRoute({ component: RootLayout });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: () => <div>Home</div>,
  });
  const pokedexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pokedex',
    component: () => <div>Pokédex browse</div>,
  });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pokemon/$dexId',
    component: () => <div>Pokémon detail</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, pokedexRoute, detailRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <RouterProvider router={router as any} />,
  );
}

describe('RootLayout navigation', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hides the Browse button on the Pokédex browse screen', async () => {
    renderLayout('/pokedex');

    await screen.findByRole('button', { name: 'Sign out' });
    expect(screen.queryByRole('link', { name: 'Browse' })).not.toBeInTheDocument();
  });

  it('shows the Browse button on Pokémon detail pages', async () => {
    renderLayout('/pokemon/25');

    await screen.findByRole('button', { name: 'Sign out' });
    expect(screen.getByRole('link', { name: 'Browse' })).toHaveAttribute('href', '/pokedex');
  });
});
