import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { browserSearchInput } from '@kanto/shared';
import type { AuthState } from '@/features/auth/auth';
import { RootLayout } from '@/routes/RootLayout';
import { NotFound } from '@/routes/NotFound';
import { LandingPage } from '@/features/landing/LandingPage';
import { AuthPage } from '@/features/auth/AuthPage';
import { AuthCallback } from '@/features/auth/AuthCallback';
import { PokedexPage } from '@/features/pokedex/PokedexPage';
import { DetailPage } from '@/features/pokemon-detail/DetailPage';
import { MapPage } from '@/features/kanto-map/MapPage';
import { FavoritesPage } from '@/features/favorites/FavoritesPage';
import { ComparePage } from '@/features/compare/ComparePage';

export interface RouterContext {
  queryClient: QueryClient;
  auth: { state: AuthState };
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  notFoundComponent: () => <NotFound />,
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: LandingPage });
const authRoute = createRoute({ getParentRoute: () => rootRoute, path: '/auth', component: AuthPage });
const authCallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/callback',
  component: AuthCallback,
});

/**
 * Pathless protected layout (SEC-001). The guard redirects to /auth when there
 * is no session. This is UX enforcement only — RLS at the database is the
 * authorization of record.
 */
const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: '_protected',
  beforeLoad: ({ context }) => {
    if (context.auth.state.status === 'unauthenticated') {
      throw redirect({ to: '/auth' });
    }
  },
});

const pokedexRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/pokedex',
  component: PokedexPage,
  validateSearch: (search: Record<string, unknown>) => browserSearchInput.parse(search),
});

const detailRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/pokemon/$dexId',
  component: DetailPage,
});

const mapSearchSchema = z.object({ location: z.string().optional() });
const mapRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/map',
  component: MapPage,
  validateSearch: (search: Record<string, unknown>) => mapSearchSchema.parse(search),
});

const favoritesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/favorites',
  component: FavoritesPage,
});

const compareSearchSchema = z.object({
  a: z.coerce.number().int().min(1).max(151).optional().catch(undefined),
  b: z.coerce.number().int().min(1).max(151).optional().catch(undefined),
});
const compareRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/compare',
  component: ComparePage,
  validateSearch: (search: Record<string, unknown>) => compareSearchSchema.parse(search),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  authRoute,
  authCallbackRoute,
  protectedRoute.addChildren([pokedexRoute, detailRoute, mapRoute, favoritesRoute, compareRoute]),
]);

export function createAppRouter(context: RouterContext) {
  return createRouter({
    routeTree,
    context,
    defaultPreload: 'intent',
    defaultNotFoundComponent: () => <NotFound />,
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;

declare module '@tanstack/react-router' {
  interface Register {
    router: AppRouter;
  }
}
