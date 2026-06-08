import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { PokemonCard } from '@kanto/shared';
import { PokemonCardItem } from './PokemonCardItem';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, className }: { children: ReactNode; className?: string }) => (
    <a href="/pokemon/6" className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/features/favorites/useFavorites', () => ({
  useFavorites: () => ({ isFavorite: () => false, toggle: vi.fn() }),
}));

const basePokemon: PokemonCard = {
  id: 6,
  national_dex_number: 6,
  display_name: 'Charizard',
  sprite_url: 'https://cdn/sprite/6.png',
  types: ['fire', 'flying'],
  base_stat_total: 534,
};

describe('PokemonCardItem', () => {
  it('reserves consistent vertical space for the type badges', () => {
    const { rerender, container } = render(<PokemonCardItem pokemon={basePokemon} />);

    const dualTypeContainer = container.querySelector('div.min-h-14');
    expect(dualTypeContainer).not.toBeNull();
    expect(dualTypeContainer!).toHaveClass('min-h-14', 'items-start', 'content-start');

    rerender(<PokemonCardItem pokemon={{ ...basePokemon, types: ['fire'] }} />);

    const singleTypeContainer = container.querySelector('div.min-h-14');
    expect(singleTypeContainer).not.toBeNull();
    expect(singleTypeContainer!).toHaveClass('min-h-14', 'items-start', 'content-start');
  });
});
