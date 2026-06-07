import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import type { PokemonDetail } from '@kanto/shared';
import { DetailPage } from './DetailPage';
import { fetchPokemonDetail } from './api';
import { SOUND_STORAGE_KEY } from '@/features/sound/useSoundPreference';

vi.mock('./api', () => ({ fetchPokemonDetail: vi.fn() }));
vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));

const PIKACHU: PokemonDetail = {
  id: 25,
  national_dex_number: 25,
  display_name: 'Pikachu',
  sprite_url: 'https://cdn/sprite/25.png',
  official_artwork_url: 'https://cdn/art/25.png',
  base_stat_total: 320,
  height: 4,
  weight: 60,
  flavor_text: null,
  types: ['electric'],
  stats: [],
  abilities: [],
  evolution_chain: [],
  encounters: [],
};

/** Fake Audio that records playback so we can assert auto-play behavior. */
class FakeAudio {
  static instances: FakeAudio[] = [];
  static last(): FakeAudio {
    const a = FakeAudio.instances.at(-1);
    if (!a) throw new Error('no Audio constructed');
    return a;
  }
  src = '';
  volume = 1;
  currentTime = 0;
  play = vi.fn().mockResolvedValue(undefined);
  constructor() {
    FakeAudio.instances.push(this);
  }
}

/** Renders the real detail route in a minimal memory router (Links resolve). */
function renderDetail() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const detailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pokemon/$dexId',
    component: DetailPage,
  });
  // Stub destinations so the page's <Link>s resolve during render.
  const stub = (path: string) =>
    createRoute({ getParentRoute: () => rootRoute, path, component: () => <div /> });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      detailRoute,
      stub('/pokedex'),
      stub('/compare'),
      stub('/map'),
    ]),
    history: createMemoryHistory({ initialEntries: ['/pokemon/25'] }),
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <RouterProvider router={router as any} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  FakeAudio.instances = [];
  vi.stubGlobal('Audio', FakeAudio as unknown as typeof Audio);
  vi.stubGlobal('scrollTo', vi.fn()); // jsdom doesn't implement it; router scroll restoration calls it

  vi.mocked(fetchPokemonDetail).mockResolvedValue(PIKACHU);
  localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));
});
afterEach(() => {
  vi.unstubAllGlobals();
  localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));
});

describe('DetailPage cry playback', () => {
  it('auto-plays the cry at low volume when the detail loads and sound is on', async () => {
    renderDetail();
    await screen.findByRole('heading', { name: 'Pikachu' });

    await waitFor(() => expect(FakeAudio.instances).toHaveLength(1));
    const audio = FakeAudio.last();
    expect(audio.src).toBe(
      'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg',
    );
    expect(audio.volume).toBe(0.3);
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it('does NOT auto-play when sound is off', async () => {
    localStorage.setItem(SOUND_STORAGE_KEY, 'false');
    window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));

    renderDetail();
    await screen.findByRole('heading', { name: 'Pikachu' });
    // Give the auto-play effect a chance to (not) fire.
    await new Promise((r) => setTimeout(r, 50));
    expect(FakeAudio.instances).toHaveLength(0);
  });

  it('exposes a replay button that plays the cry on demand', async () => {
    renderDetail();
    await screen.findByRole('heading', { name: 'Pikachu' });
    await waitFor(() => expect(FakeAudio.instances).toHaveLength(1));

    await userEvent.click(screen.getByRole('button', { name: /play pikachu's cry/i }));
    expect(FakeAudio.last().play).toHaveBeenCalledTimes(2);
  });
});
