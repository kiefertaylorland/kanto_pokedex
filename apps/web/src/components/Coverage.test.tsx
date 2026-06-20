import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { AbilityTag } from './AbilityTag';
import { ConfidenceLabel } from './ConfidenceLabel';
import { FavStar } from './FavStar';
import { LoadingState, ErrorState, EmptyState } from './state';
import { SegmentedToggle } from './SegmentedToggle';
import { Select } from './Select';
import { PokeWell } from './PokeWell';
import { PokeballMark } from './PokeballMark';
import { SearchInput } from './SearchInput';
import { ScreenHeader } from './ScreenHeader';
import { EvoNode, EvoTrigger } from './EvoNode';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

function renderWithRouter(ui: ReactNode, path = '/pokemon/25') {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pokemon/$dexId',
    component: () => <>{ui}</>,
  });
  const pokedexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/pokedex',
    component: () => <div>Pokédex</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([testRoute, pokedexRoute]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <RouterProvider router={router as any} />,
  );
}

describe('component coverage sweep', () => {
  it('renders ability, confidence, header, badge, card, and input primitives', () => {
    const ref = { current: null as HTMLInputElement | null };

    render(
      <>
        <AbilityTag name="Lightning Rod" isHidden />
        <AbilityTag name="Static" />
        <ConfidenceLabel confidence="curated" />
        <ScreenHeader title="Favorites" kicker="2 saved" actions={<button type="button">Refresh</button>} />
        <ScreenHeader title="Compare" />
        <Badge>Default</Badge>
        <Badge tone="muted">Muted</Badge>
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent>Body</CardContent>
        </Card>
        <Input ref={(node) => (ref.current = node)} placeholder="Email" className="custom-input" />
      </>,
    );

    expect(screen.getByText('Hidden')).toBeInTheDocument();
    expect(screen.getByText('Curated')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
    expect(screen.getByText('Muted')).toHaveClass('bg-surface-3');
    expect(screen.getByTestId('card')).toHaveClass('rounded-md');
    expect(ref.current).toHaveAttribute('placeholder', 'Email');
    expect(ref.current).toHaveClass('custom-input');
  });

  it('handles favorite toggles, segmented toggles, search clearing, and selects', async () => {
    const onToggle = vi.fn();
    const onSegmentChange = vi.fn();
    const onClear = vi.fn();
    const onSearch = vi.fn();
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <FavStar active onToggle={onToggle} name="Pikachu" />
        <FavStar active={false} onToggle={onToggle} name="Bulbasaur" size="grid" />
        <SegmentedToggle
          label="Sort direction"
          value="asc"
          options={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
          onChange={onSegmentChange}
        />
        <SearchInput value="Pika" onChange={onSearch} onClear={onClear} />
        <SearchInput value="" onChange={onSearch} loading />
        <Select
          label="A"
          value="25"
          options={[
            { value: '', label: 'Select one' },
            { value: '25', label: 'Pikachu' },
          ]}
          onChange={onSelect}
        />
        <Select
          id="slot-b"
          label="B"
          value=""
          options={[{ value: '', label: 'Select one' }]}
          onChange={onSelect}
        />
      </>,
    );

    const favoriteButton = screen.getByRole('button', { name: /remove pikachu from favorites/i });
    await user.click(favoriteButton);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /add bulbasaur to favorites/i })).toHaveClass('h-8');

    await user.click(screen.getByRole('button', { name: 'Descending' }));
    expect(onSegmentChange).toHaveBeenCalledWith('desc');

    const [searchbox] = screen.getAllByRole('searchbox', { name: 'Search Pokémon' });
    await user.type(searchbox!, 'chu');
    expect(onSearch).toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(onClear).toHaveBeenCalledOnce();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('A'), '25');
    await user.selectOptions(screen.getByLabelText('B'), '');
    expect(onSelect).toHaveBeenCalledWith('25');
    expect(screen.getByLabelText('B')).toHaveAttribute('id', 'slot-b');
  });

  it('renders loading, error, empty, and checkbox states', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <>
        <LoadingState label="Loading favorites…" />
        <ErrorState message="Something broke" onRetry={onRetry} />
        <ErrorState message="No retry" />
        <EmptyState title="Nothing here" hint="Try another search." />
        <Checkbox aria-label="Favorite" defaultChecked />
      </>,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Loading favorites…');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledOnce();
    expect(screen.getByText('Try another search.')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Favorite' })).toHaveAttribute('data-state', 'checked');
  });

  it('renders dialog primitives', () => {
    render(
      <Dialog defaultOpen>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare</DialogTitle>
            <DialogDescription>Choose two Pokémon.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );

    expect(screen.getByText('Choose two Pokémon.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('renders Pokéball artwork and evolution links in all visual states', async () => {
    vi.stubGlobal('scrollTo', vi.fn());
    renderWithRouter(
      <>
        <PokeWell type="electric" spriteUrl="https://cdn/pikachu.png" alt="Pikachu" size={100} className="sprite-well" />
        <PokeWell size={80} />
        <PokeballMark title="Pokéball" tone="inverse" className="mark" />
        <PokeballMark />
        <EvoNode dexNumber={25} name="Pikachu" primaryType="electric" spriteUrl="https://cdn/pikachu.png" isCurrent />
        <EvoNode dexNumber={26} name="Raichu" />
        <EvoTrigger label="Thunder Stone" />
        <EvoTrigger />
      </>,
    );

    expect(await screen.findByAltText('Pikachu')).toHaveAttribute('src', 'https://cdn/pikachu.png');
    expect(document.querySelector('.sprite-well img')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Pokéball' })).toHaveClass('mark');
    expect(await screen.findByRole('link', { name: /pikachu/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /raichu/i })).toHaveAttribute('href', '/pokemon/26');
    expect(screen.getByText('Thunder Stone')).toBeInTheDocument();
    expect(screen.getAllByText('→')).toHaveLength(2);
  });
});
