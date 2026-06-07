import * as React from 'react';
import { useSearch, useNavigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { type MapLocationEncounters } from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchMapData } from './api';
import { KantoMapSvg } from './KantoMapSvg';
import { ConfidenceLabel } from '@/components/ConfidenceLabel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LoadingState, ErrorState, EmptyState } from '@/components/state';

/**
 * Kanto map (FR-027..033). Markers open an encounter panel listing the Pokémon
 * found at that location with provenance labels + method and links to detail.
 * A `?location=<id>` param opens a panel directly (context-aware open from the
 * detail page).
 */
export function MapPage() {
  const search = useSearch({ strict: false }) as { location?: string };
  const navigate = useNavigate();

  const result = useQuery({
    queryKey: queryKeys.map.locations(),
    queryFn: fetchMapData,
  });

  const selectedId = search.location ?? null;

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

  const selected = selectedId ? result.data.find((l) => l.location.id === selectedId) ?? null : null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-ink-900">Kanto Map</h1>
      <p className="text-sm text-ink-500">Tap a marker to see which Pokémon appear there.</p>

      <div className="mx-auto max-w-3xl">
        <KantoMapSvg locations={result.data} selectedId={selectedId} onSelect={setSelected} />
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          {selected && <LocationPanel location={selected} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LocationPanel({ location }: { location: MapLocationEncounters }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{location.location.display_name}</DialogTitle>
        {location.location.description && (
          <DialogDescription>{location.location.description}</DialogDescription>
        )}
      </DialogHeader>

      {location.encounters.length === 0 ? (
        <EmptyState title="No recorded encounters here." />
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {location.encounters.map((e, i) => (
            <li key={`${e.pokemon.id}-${i}`} className="flex items-center gap-3">
              <Link
                to="/pokemon/$dexId"
                params={{ dexId: String(e.pokemon.national_dex_number) }}
                className="flex flex-1 items-center gap-3 rounded-sm p-1 hover:bg-surface-2"
              >
                {e.pokemon.sprite_url ? (
                  <img src={e.pokemon.sprite_url} alt={e.pokemon.display_name} width={40} height={40} className="h-10 w-10 object-contain" loading="lazy" />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-surface-2 text-[10px] text-ink-500">N/A</span>
                )}
                <span className="text-sm font-medium text-ink-900">{e.pokemon.display_name}</span>
              </Link>
              {e.method && <span className="text-xs text-ink-500">{e.method}</span>}
              <ConfidenceLabel confidence={e.confidence} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
