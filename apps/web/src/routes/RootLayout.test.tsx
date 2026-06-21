import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { RootLayout } from './RootLayout';

const signOut = vi.fn();
let isAuthenticated = true;

vi.mock('@/features/auth/auth', () => ({
  useAuth: () => ({
    session: null,
    status: isAuthenticated ? 'authenticated' : 'unauthenticated',
    isAuthenticated,
    signInWithOAuth: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signOut,
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
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RouterProvider router={router as any} />
    </>,
  );
}

describe('RootLayout navigation', () => {
  beforeEach(() => {
    isAuthenticated = true;
    signOut.mockReset();
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

  it('shows sign-in when unauthenticated and invokes sign-out when authenticated', async () => {
    const user = userEvent.setup();

    const first = renderLayout('/pokedex');
    await user.click(await screen.findByRole('button', { name: 'Sign out' }));
    expect(signOut).toHaveBeenCalledOnce();
    first.unmount();

    isAuthenticated = false;
    renderLayout('/');
    expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth');
  });
});
