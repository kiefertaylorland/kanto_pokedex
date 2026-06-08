import * as React from 'react';
import { useSearch, useNavigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { type MapLocationEncounters } from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchMapData } from './api';
import { KantoMapSvg, MapLegend, MarkerGlyph } from './KantoMapSvg';
import { ConfidenceLabel } from '@/components/ConfidenceLabel';
import { SegmentedToggle } from '@/components/SegmentedToggle';
import { LoadingState, ErrorState, EmptyState } from '@/components/state';

type MapView = 'map' | 'list';

/**
 * Kanto map (FR-027..033). The two-column map view pairs a flat-geometry SVG of
 * Kanto (markers shaped by category) with a sticky encounter rail; a segmented
 * toggle switches to a non-spatial list view (a11y/keyboard path). Selecting a
 * marker or list card updates the rail. A `?location=<id>` param opens a
 * location directly (context-aware open from the detail page); otherwise the
 * rail defaults to Mt. Moon.
 */
export function MapPage() {
  const search = useSearch({ strict: false }) as { location?: string };
  const navigate = useNavigate();
  const [view, setView] = React.useState<MapView>('map');

  const result = useQuery({
    queryKey: queryKeys.map.locations(),
    queryFn: fetchMapData,
  });

  const setSelected = React.useCallback(
    (locationId: string | null) => {
      if (locationId) track('map_marker_opened');
      void navigate({
        to: '/map',
        search: locationId ? { location: locationId } : {},
        replace: true,
      });
    },
    [navigate],
  );

  if (result.isLoading) return <LoadingState label="Loading the Kanto map…" />;
  if (result.isError) return <ErrorState message={toUserMessage(result.error)} onRetry={() => void result.refetch()} />;
  if (!result.data || result.data.length === 0) {
    return <EmptyState title="The map has no locations yet." />;
  }

  const locations = result.data;
  const markerTypes = Array.from(new Set(locations.map((l) => l.point.marker_type)));

  // Default the rail to Mt. Moon when no location is in the URL.
  const defaultLocation =
    locations.find((l) => l.location.slug === 'mt-moon' || l.location.display_name === 'Mt. Moon') ?? locations[0];
  const selectedId = search.location ?? defaultLocation?.location.id ?? null;
  const selected = selectedId ? locations.find((l) => l.location.id === selectedId) ?? null : null;

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold text-ink-900">Kanto Map</h1>
          <p className="mt-1 text-sm text-ink-500">
            {view === 'map'
              ? 'Tap a marker to see which Pokémon appear there.'
              : 'Browse every location as a list.'}
          </p>
        </div>
        <SegmentedToggle
          label="Map view"
          value={view}
          onChange={setView}
          options={[
            { value: 'map', label: 'Map' },
            { value: 'list', label: 'View as list' },
          ]}
        />
      </div>

      {view === 'map' ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-2">
            <KantoMapSvg locations={locations} selectedId={selectedId} onSelect={setSelected} />
            <MapLegend markerTypes={markerTypes} />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <LocationRail location={selected} />
          </div>
        </div>
      ) : (
        <ListView
          locations={locations}
          onSelect={(id) => {
            setSelected(id);
            setView('map');
          }}
        />
      )}
    </div>
  );
}

/** Sticky encounter rail showing the selected location's Pokémon. */
function LocationRail({ location }: { location: MapLocationEncounters | null }) {
  if (!location) {
    return (
      <div className="rounded-md border-2 border-border-strong bg-surface p-5">
        <EmptyState title="Select a location" hint="Tap a marker to see its encounters." />
      </div>
    );
  }
  return (
    <div className="rounded-md border-2 border-border-strong bg-surface p-5">
      <h2 className="text-xl font-bold text-ink-900">{location.location.display_name}</h2>
      <p className="mt-1 text-sm text-ink-500">{location.location.location_type}</p>
      {location.location.description && (
        <p className="mt-2 text-sm text-ink-700">{location.location.description}</p>
      )}

      <div className="mt-4">
        {location.encounters.length === 0 ? (
          <p className="text-sm text-ink-500">No recorded encounters here.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {location.encounters.map((e, i) => (
              <li key={`${e.pokemon.id}-${i}`} className="flex items-center gap-2">
                <Link
                  to="/pokemon/$dexId"
                  params={{ dexId: String(e.pokemon.national_dex_number) }}
                  className="flex flex-1 items-center gap-3 rounded-sm p-1 no-underline hover:bg-surface-2"
                >
                  {e.pokemon.sprite_url ? (
                    <img
                      src={e.pokemon.sprite_url}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-sm bg-surface-2 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-surface-2 text-[10px] text-ink-500">
                      N/A
                    </span>
                  )}
                  <span className="text-sm font-semibold text-ink-900">{e.pokemon.display_name}</span>
                </Link>
                {e.method && <span className="text-xs text-ink-500">{e.method}</span>}
                <ConfidenceLabel confidence={e.confidence} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Non-spatial fallback: every location as a framed, selectable card. */
function ListView({
  locations,
  onSelect,
}: {
  locations: MapLocationEncounters[];
  onSelect: (locationId: string) => void;
}) {
  return (
    <ul className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
      {locations.map(({ location, point, encounters }) => (
        <li key={location.id}>
          <button
            type="button"
            onClick={() => onSelect(location.id)}
            className="flex w-full items-center gap-3 rounded-md border-2 border-border-strong bg-surface p-4 text-left hover:bg-surface-2"
          >
            <MarkerGlyph markerType={point.marker_type} className="h-5 w-5 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-ink-900">{location.display_name}</span>
              <span className="block text-xs text-ink-500">{location.location_type}</span>
            </span>
            <span className="shrink-0 text-xs text-ink-500">
              {encounters.length} encounter{encounters.length === 1 ? '' : 's'}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
