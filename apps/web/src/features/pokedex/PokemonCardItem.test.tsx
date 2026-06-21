import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

const toggle = vi.fn();

vi.mock('@/features/favorites/useFavorites', () => ({
  useFavorites: () => ({ isFavorite: () => false, toggle }),
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

  it('shows a no-image fallback and toggles the favorite star', async () => {
    const user = userEvent.setup();
    render(<PokemonCardItem pokemon={{ ...basePokemon, sprite_url: null }} />);

    expect(screen.getByText('No image')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /add charizard to favorites/i }));
    expect(toggle).toHaveBeenCalledWith(6);
  });
});
