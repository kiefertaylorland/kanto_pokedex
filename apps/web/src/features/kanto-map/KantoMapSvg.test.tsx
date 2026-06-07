import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { type MapLocationEncounters } from '@kanto/shared';
import { KantoMapSvg } from './KantoMapSvg';

const locations: MapLocationEncounters[] = [
  {
    location: {
      id: 'loc-pallet',
      slug: 'pallet-town',
      display_name: 'Pallet Town',
      location_type: 'city',
      description: null,
    },
    point: {
      id: 'point-pallet',
      kanto_location_id: 'loc-pallet',
      x: 20,
      y: 90,
      label_anchor: 'top',
      marker_type: 'city',
    },
    encounters: [
      {
        kanto_location_id: 'loc-pallet',
        location_display_name: 'Pallet Town',
        method: null,
        confidence: 'curated',
        notes: null,
        pokemon: {
          id: 1,
          national_dex_number: 1,
          display_name: 'Bulbasaur',
          sprite_url: null,
          types: ['grass'],
          base_stat_total: 318,
        },
      },
    ],
  },
  {
    location: {
      id: 'loc-route-1',
      slug: 'route-1',
      display_name: 'Route 1',
      location_type: 'route',
      description: null,
    },
    point: {
      id: 'point-route-1',
      kanto_location_id: 'loc-route-1',
      x: 20,
      y: 82,
      label_anchor: 'top',
      marker_type: 'route',
    },
    encounters: [],
  },
];

describe('KantoMapSvg', () => {
  it('renders a layered Kanto-style map with accessible location markers', () => {
    const { container } = render(<KantoMapSvg locations={locations} selectedId={null} onSelect={vi.fn()} />);

    expect(screen.getByRole('img', { name: /map of the kanto region/i })).toBeInTheDocument();
    expect(container.querySelector('path[d="M10 13 H44 V42 H31 V58 H10 Z M53 11 H94 V48 H72 V59 H53 Z M10 59 H72 V72 H61 V83 H49 V92 H29 V84 H10 Z"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pallet Town, 1 encounter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Route 1, 0 encounters' })).toBeInTheDocument();
  });

  it('keeps marker selection mouse and keyboard accessible', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<KantoMapSvg locations={locations} selectedId="loc-pallet" onSelect={onSelect} />);

    const palletTown = screen.getByRole('button', { name: 'Pallet Town, 1 encounter' });
    await user.click(palletTown);
    expect(onSelect).toHaveBeenCalledWith('loc-pallet');

    palletTown.focus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenLastCalledWith('loc-pallet');
  });
});
