import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { LandingPage } from './LandingPage';
import { track } from '@/lib/analytics';

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

function renderLanding() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const landingRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: LandingPage,
  });
  const authRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/auth',
    component: () => <div>Auth screen</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([landingRoute, authRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  const view = render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <RouterProvider router={router as any} />,
  );
  return { router, view };
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  vi.mocked(track).mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('LandingPage', () => {
  it('renders the hero copy and the static preview cards', async () => {
    renderLanding();

    expect(await screen.findByRole('heading', { name: /the kanto pokédex/i })).toBeInTheDocument();
    expect(screen.getByText('№ 001–151 · Generation I')).toBeInTheDocument();
    expect(screen.getByText('Illustrative preview — sign in to see live data.')).toBeInTheDocument();

    // All six illustrative preview Pokémon are present with padded dex numbers.
    for (const [dex, name] of [
      ['#001', 'Bulbasaur'],
      ['#004', 'Charmander'],
      ['#007', 'Squirtle'],
      ['#025', 'Pikachu'],
      ['#150', 'Mewtwo'],
      ['#151', 'Mew'],
    ] as const) {
      expect(screen.getByText(dex)).toBeInTheDocument();
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('routes the single CTA to /auth and tracks the click', async () => {
    const user = userEvent.setup();
    const { router } = renderLanding();

    const cta = await screen.findByRole('link', { name: 'Sign in to explore' });
    expect(cta).toHaveAttribute('href', '/auth');

    await user.click(cta);

    expect(track).toHaveBeenCalledWith('landing_cta_clicked');
    expect(router.state.location.pathname).toBe('/auth');
    expect(await screen.findByText('Auth screen')).toBeInTheDocument();
  });
});
