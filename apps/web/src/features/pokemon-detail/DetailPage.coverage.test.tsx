import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from '@tanstack/react-router';
import { DetailPage } from './DetailPage';
import { useFavorites } from '@/features/favorites/useFavorites';
import { isSoundEnabled, useSoundPreference } from '@/features/sound/useSoundPreference';
import { useCry } from '@/features/sound/useCry';
import { track } from '@/lib/analytics';

const navigate = vi.fn();
const toggle = vi.fn();
const play = vi.fn();

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({ useQuery: vi.fn() }));
vi.mock('@/features/favorites/useFavorites', () => ({ useFavorites: vi.fn() }));
vi.mock('@/features/sound/useSoundPreference', () => ({
  useSoundPreference: vi.fn(),
  isSoundEnabled: vi.fn(),
}));
vi.mock('@/features/sound/useCry', () => ({ useCry: vi.fn() }));
vi.mock('@tanstack/react-router', async () => {
  return {
    Link: ({
      to,
      params,
      search,
      children,
    }: {
      to: string;
      params?: Record<string, string>;
      search?: Record<string, number | undefined>;
      children: ReactNode;
    }) => {
      let href = params?.dexId ? `/pokemon/${params.dexId}` : to;
      if (search) {
        const qs = new URLSearchParams(
          Object.entries(search)
            .filter(([, value]) => value != null)
            .map(([key, value]) => [key, String(value)]),
        ).toString();
        if (qs) href = `${href}?${qs}`;
      }
      return <a href={href}>{children}</a>;
    },
    useNavigate: vi.fn(),
    useParams: vi.fn(),
  };
});

describe('DetailPage coverage', () => {
  beforeEach(() => {
    navigate.mockReset();
    toggle.mockReset();
    play.mockReset();
    vi.mocked(track).mockReset();
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(useFavorites).mockReturnValue({
      favorites: [25],
      count: 1,
      isFavorite: vi.fn((dex: number) => dex === 25),
      toggle,
    });
    vi.mocked(useSoundPreference).mockReturnValue({ enabled: true, toggle: vi.fn() });
    vi.mocked(isSoundEnabled).mockReturnValue(false);
    vi.mocked(useCry).mockReturnValue({ play });
  });

  it('renders invalid, loading, error, and missing-detail states', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    vi.mocked(useParams).mockReturnValue({ dexId: '999' } as never);
    vi.mocked(useQuery).mockReturnValue({ data: undefined, isLoading: false, isError: false, error: null, refetch } as never);
    render(<DetailPage />);
    expect(screen.getByText(/we don’t have data for №999 yet/i)).toBeInTheDocument();

    vi.mocked(useParams).mockReturnValue({ dexId: '25' } as never);
    vi.mocked(useQuery).mockReturnValueOnce({ data: undefined, isLoading: true, isError: false, error: null, refetch } as never);
    const loadingRender = render(<DetailPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading Pokémon…');
    loadingRender.unmount();

    vi.mocked(useQuery).mockReturnValueOnce({ data: undefined, isLoading: false, isError: true, error: { code: 'PGRST301' }, refetch } as never);
    const errorRender = render(<DetailPage />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Your session has expired. Please sign in again.');
    expect(refetch).toHaveBeenCalledOnce();
    errorRender.unmount();

    vi.mocked(useQuery).mockReturnValueOnce({ data: null, isLoading: false, isError: false, error: null, refetch } as never);
    render(<DetailPage />);
    expect(screen.getByText(/we don’t have data for №025 yet/i)).toBeInTheDocument();
  });

  it('renders action controls, empty stats, branch evolution, and ability chips', async () => {
    vi.mocked(useParams).mockReturnValue({ dexId: '25' } as never);
    vi.mocked(useQuery).mockReturnValue({
      data: {
        id: 25,
        national_dex_number: 25,
        display_name: 'Pikachu',
        sprite_url: 'https://cdn/pika.png',
        official_artwork_url: null,
        base_stat_total: 320,
        height: null,
        weight: null,
        flavor_text: 'Mouse Pokémon.',
        types: ['electric'],
        stats: [],
        abilities: [{ name: 'static', display_name: 'Static', is_hidden: false, slot: 1 }],
        evolution_chain: [
          { species_id: 133, display_name: 'Eevee', sprite_url: null, trigger: null, min_level: null, item_name: null },
          { species_id: 134, display_name: 'Vaporeon', sprite_url: null, trigger: 'use-item', min_level: null, item_name: 'water-stone' },
          { species_id: 135, display_name: 'Jolteon', sprite_url: null, trigger: null, min_level: null, item_name: 'thunder-stone' },
          { species_id: 136, display_name: 'Flareon', sprite_url: null, trigger: null, min_level: null, item_name: 'fire-stone' },
        ],
        encounters: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const user = userEvent.setup();
    render(<DetailPage />);

    expect(track).toHaveBeenCalledWith('detail_viewed');
    expect(screen.getByText('Mouse Pokémon.')).toBeInTheDocument();
    expect(screen.getByText('Stats unavailable.')).toBeInTheDocument();
    expect(screen.getByText('Static')).toBeInTheDocument();
    expect(screen.getByText('No recorded Kanto encounters.')).toBeInTheDocument();
    expect(screen.getByText('Thunder Stone')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Compare' })).toHaveAttribute('href', '/compare?a=25');

    await user.click(screen.getByRole('button', { name: '★ Saved' }));
    expect(toggle).toHaveBeenCalledWith(25);

    await user.click(screen.getByRole('button', { name: /previous pokémon/i }));
    await user.click(screen.getByRole('button', { name: /next pokémon/i }));
    expect(navigate).toHaveBeenCalledWith({ to: '/pokemon/$dexId', params: { dexId: '24' } });
    expect(navigate).toHaveBeenCalledWith({ to: '/pokemon/$dexId', params: { dexId: '26' } });
  });

  it('renders stat bars and trigger labels when detailed data is present', () => {
    vi.mocked(useParams).mockReturnValue({ dexId: '25' } as never);
    vi.mocked(useQuery).mockReturnValue({
      data: {
        id: 25,
        national_dex_number: 25,
        display_name: 'Pikachu',
        sprite_url: 'https://cdn/pika.png',
        official_artwork_url: null,
        base_stat_total: 320,
        height: 4,
        weight: 60,
        flavor_text: null,
        types: ['electric'],
        stats: [{ key: 'hp', base_stat: 35 }],
        abilities: [],
        evolution_chain: [
          { species_id: 172, display_name: 'Pichu', sprite_url: null, trigger: null, min_level: null, item_name: null },
          { species_id: 25, display_name: 'Pikachu', sprite_url: null, trigger: 'level-up', min_level: null, item_name: null },
          { species_id: 26, display_name: 'Raichu', sprite_url: null, trigger: null, min_level: null, item_name: null },
        ],
        encounters: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    render(<DetailPage />);

    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('Level Up')).toBeInTheDocument();
  });
});
