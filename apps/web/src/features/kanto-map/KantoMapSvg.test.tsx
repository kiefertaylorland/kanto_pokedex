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
      label_anchor: 'right',
      marker_type: 'route',
    },
    encounters: [],
  },
];

describe('KantoMapSvg', () => {
  it('renders a layered Kanto-style map with accessible location markers', () => {
    const { container } = render(<KantoMapSvg locations={locations} selectedId={null} onSelect={vi.fn()} />);

    expect(screen.getByRole('img', { name: /map of the kanto region/i })).toBeInTheDocument();
    expect(screen.getByTestId('kanto-landmass')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pallet Town, 1 encounter' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Route 1, 0 encounters' })).toBeInTheDocument();
    expect(container.querySelector('text[x="3.4"]')).toHaveTextContent('Route 1');
  });

  it('keeps marker selection mouse and keyboard accessible', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <>
        <button type="button">Before map</button>
        <KantoMapSvg locations={locations} selectedId="loc-pallet" onSelect={onSelect} />
      </>,
    );

    const beforeMap = screen.getByRole('button', { name: 'Before map' });
    const palletTown = screen.getByRole('button', { name: 'Pallet Town, 1 encounter' });
    const routeOne = screen.getByRole('button', { name: 'Route 1, 0 encounters' });
    beforeMap.focus();
    expect(beforeMap).toHaveFocus();
    await user.tab();
    expect(palletTown).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('loc-pallet');
    await user.tab();
    expect(routeOne).toHaveFocus();

    await user.click(palletTown);
    expect(onSelect).toHaveBeenCalledWith('loc-pallet');
  });
});
