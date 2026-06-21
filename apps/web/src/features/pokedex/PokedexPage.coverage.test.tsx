import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { PokedexPage } from './PokedexPage';
import { useFavorites } from '@/features/favorites/useFavorites';
import { track } from '@/lib/analytics';

const navigate = vi.fn();

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }));
vi.mock('@/features/favorites/useFavorites', () => ({ useFavorites: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  keepPreviousData: Symbol('keepPreviousData'),
}));
vi.mock('@tanstack/react-router', async () => {
  return {
    Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a>,
    useNavigate: vi.fn(),
    useSearch: vi.fn(),
  };
});
vi.mock('./FilterBar', () => ({
  FilterBar: ({ onChange }: { onChange: (patch: { q?: string; types?: string[] }) => void }) => (
    <>
      <button type="button" onClick={() => onChange({ q: 'Ra' })}>
        search
      </button>
      <button type="button" onClick={() => onChange({ types: ['fire'] })}>
        filter
      </button>
    </>
  ),
}));
vi.mock('@/components/Pagination', () => ({
  Pagination: ({ onChange }: { onChange: (page: number) => void }) => (
    <button type="button" onClick={() => onChange(3)}>
      paginate
    </button>
  ),
}));
vi.mock('./PokemonCardItem', () => ({
  PokemonCardItem: ({ pokemon }: { pokemon: { display_name: string } }) => <div>{pokemon.display_name}</div>,
}));

describe('PokedexPage coverage', () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(track).mockReset();
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(useSearch).mockReturnValue({ q: '', types: [], sort: 'number', dir: 'asc', page: 1 } as never);
    vi.mocked(useFavorites).mockReturnValue({
      favorites: [],
      count: 2,
      isFavorite: vi.fn(),
      toggle: vi.fn(),
    });
  });

  it('renders loading, error, empty, and success states and updates the URL state', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch,
    } as never);
    const loadingRender = render(<PokedexPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading Pokémon…');
    loadingRender.unmount();

    vi.mocked(useQuery).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { code: 'PGRST301' },
      refetch,
    } as never);
    const errorRender = render(<PokedexPage />);
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Your session has expired. Please sign in again.');
    expect(refetch).toHaveBeenCalledOnce();
    errorRender.unmount();

    vi.mocked(useQuery).mockReturnValueOnce({
      data: { items: [], total: 0, page: 1, pageCount: 1 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    const emptyRender = render(<PokedexPage />);
    expect(screen.getByText('No Pokémon match your search.')).toBeInTheDocument();
    emptyRender.unmount();

    vi.mocked(useQuery).mockReturnValueOnce({
      data: {
        items: [{ id: 25, display_name: 'Pikachu' }],
        total: 1,
        page: 2,
        pageCount: 3,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    render(<PokedexPage />);

    expect(screen.getByRole('link', { name: '★ Favorites · 2' })).toHaveAttribute('href', '/favorites');
    expect(screen.getByText('1 result · page 2 of 3')).toBeInTheDocument();
    expect(screen.getByText('Pikachu')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'search' }));
    await user.click(screen.getByRole('button', { name: 'filter' }));
    await user.click(screen.getByRole('button', { name: 'paginate' }));

    expect(track).toHaveBeenCalledWith('browser_searched');
    expect(track).toHaveBeenCalledWith('browser_filtered');
    expect(navigate).toHaveBeenCalledTimes(3);
    expect(navigate.mock.calls[0]?.[0].search({ q: '', types: [], sort: 'number', dir: 'asc', page: 1 })).toEqual({
      q: 'Ra',
      types: [],
      sort: 'number',
      dir: 'asc',
      page: 1,
    });
  });
});
