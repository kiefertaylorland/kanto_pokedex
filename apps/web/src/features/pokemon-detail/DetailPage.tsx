import { useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  parseDexId,
  STAT_DISPLAY,
  MAX_BASE_STAT,
  TYPE_TINTS,
  type StatKey,
} from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchPokemonDetail } from './api';
import { TypeBadge } from '@/components/TypeBadge';
import { Badge } from '@/components/ui/badge';
import { ConfidenceLabel } from '@/components/ConfidenceLabel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState } from '@/components/state';
import { Button } from '@/components/ui/button';
import { FavStar } from '@/components/FavStar';
import { NotFound } from '@/routes/NotFound';
import { useFavorites } from '@/features/favorites/useFavorites';
<<<<<<< HEAD
import { useSoundPreference, isSoundEnabled } from '@/features/sound/useSoundPreference';
import { useCry } from '@/features/sound/useCry';
import { cryUrl } from '@/features/sound/cry';
import { CryButton } from '@/features/sound/CryButton';
=======
>>>>>>> origin/main
import * as React from 'react';

/** Pokémon detail page (FR-016..026). */
export function DetailPage() {
  const params = useParams({ strict: false }) as { dexId?: string };
  const raw = params.dexId ?? '';
  const dexId = parseDexId(raw);
  const numericRaw = /^\d+$/.test(raw) ? raw : undefined;
  const { isFavorite, toggle } = useFavorites();
<<<<<<< HEAD
  const { enabled: soundEnabled } = useSoundPreference();
  const { play } = useCry();
=======
>>>>>>> origin/main

  React.useEffect(() => {
    if (dexId !== null) track('detail_viewed');
  }, [dexId]);

  const result = useQuery({
    queryKey: queryKeys.pokemon.detail(dexId ?? -1),
    queryFn: () => fetchPokemonDetail(dexId as number),
    enabled: dexId !== null,
  });

  // Auto-play the cry once per Pokémon as its details appear (sound permitting).
  // Keyed on the loaded id so it fires on navigation, not on unrelated re-renders
  // or sound-toggle changes; `isSoundEnabled()` reads the live preference.
  const loadedId = result.data?.id ?? null;
  React.useEffect(() => {
    if (loadedId !== null && isSoundEnabled()) play(cryUrl(loadedId));
  }, [loadedId, play]);

  if (dexId === null) {
    return <NotFound dexId={numericRaw} />;
  }
  if (result.isLoading) return <LoadingState label="Loading Pokémon…" />;
  if (result.isError) return <ErrorState message={toUserMessage(result.error)} onRetry={() => void result.refetch()} />;
  if (!result.data) {
    return <NotFound dexId={raw} />;
  }

  const p = result.data;
  const dex = String(p.national_dex_number).padStart(3, '0');
  const primaryType = p.types[0];

  return (
    <article className="space-y-6">
      <Link to="/pokedex" className="text-sm text-ink-500 hover:underline">
        ← Back to Pokédex
      </Link>

      {/* Type-tinted detail rail: the header well takes the primary type's tint. */}
      <header
        className="flex flex-col items-center gap-4 rounded-md border-2 border-border-strong bg-surface-2 p-4 sm:flex-row sm:items-start"
        style={primaryType ? { backgroundColor: TYPE_TINTS[primaryType] } : undefined}
      >
        <div className="relative flex h-48 w-48 shrink-0 items-center justify-center rounded-md bg-surface/70">
          {p.official_artwork_url || p.sprite_url ? (
            <img
              src={p.official_artwork_url ?? p.sprite_url ?? ''}
              alt={p.display_name}
              width={184}
              height={184}
              className="h-44 w-44 object-contain"
            />
          ) : (
            <span className="text-sm text-ink-500">No image</span>
          )}
          <CryButton
            onPlay={() => play(cryUrl(p.id))}
            enabled={soundEnabled}
            name={p.display_name}
            className="absolute bottom-1 right-1"
          />
        </div>
        <div className="space-y-2 text-center sm:text-left">
          <p className="font-display text-sm text-ink-500">№{dex}</p>
          <h1 className="font-display text-2xl leading-tight text-ink-900 sm:text-3xl">{p.display_name}</h1>
          <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
            {p.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <dl className="flex gap-6 pt-1 text-sm text-ink-700">
            <div>
              <dt className="text-xs text-ink-500">Height</dt>
              <dd>{p.height !== null ? `${p.height / 10} m` : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-500">Weight</dt>
              <dd>{p.weight !== null ? `${p.weight / 10} kg` : '—'}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <FavStar
            active={isFavorite(p.national_dex_number)}
            onToggle={() => toggle(p.national_dex_number)}
            name={p.display_name}
          />
          <span className="text-sm text-ink-700">
            {isFavorite(p.national_dex_number) ? 'In favorites' : 'Add to favorites'}
          </span>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link to="/compare" search={{ a: p.national_dex_number, b: undefined }}>
            Compare
          </Link>
        </Button>
      </div>

      {p.flavor_text && (
        <Card>
          <CardContent className="p-4">
            <p className="italic text-ink-700">{p.flavor_text}</p>
            <p className="mt-1 text-xs text-ink-500">Pokémon Red/Blue</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Base stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.stats.length === 0 ? (
              <p className="text-sm text-ink-500">Stats unavailable.</p>
            ) : (
              p.stats.map((s) => <StatBar key={s.key} statKey={s.key} value={s.base_stat} />)
            )}
            <p className="pt-2 text-sm font-semibold text-ink-900">Total: {p.base_stat_total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.abilities.length === 0 ? (
              <p className="text-sm text-ink-500">Abilities unavailable.</p>
            ) : (
              <ul className="space-y-1">
                {p.abilities.map((a) => (
                  <li key={`${a.name}-${a.slot}`} className="flex items-center gap-2 text-sm">
                    {a.display_name}
                    {a.is_hidden && <Badge tone="muted">Hidden</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolution</CardTitle>
        </CardHeader>
        <CardContent>
          {p.evolution_chain.length <= 1 ? (
            <p className="text-sm text-ink-500">This Pokémon does not evolve.</p>
          ) : (
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              {p.evolution_chain.map((node, i) => (
                <li key={node.species_id} className="flex items-center gap-2">
                  {i > 0 && <span className="text-ink-500">→</span>}
                  <Link
                    to="/pokemon/$dexId"
                    params={{ dexId: String(node.species_id) }}
                    className="rounded-sm border border-border-strong px-2 py-1 text-ink-700 hover:bg-surface-2"
                  >
                    {node.display_name}
                    {node.min_level ? ` (Lv ${node.min_level})` : node.trigger ? ` (${node.trigger})` : ''}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where to find</CardTitle>
        </CardHeader>
        <CardContent>
          {p.encounters.length === 0 ? (
            <p className="text-sm text-ink-500">No recorded Kanto encounters.</p>
          ) : (
            <ul className="space-y-2">
              {p.encounters.map((e, i) => (
                <li key={`${e.kanto_location_id ?? 'loc'}-${i}`} className="flex flex-wrap items-center gap-2 text-sm">
                  {e.kanto_location_id ? (
                    <Link
                      to="/map"
                      search={{ location: e.kanto_location_id }}
                      className="font-medium text-ink-900 hover:underline"
                    >
                      {e.location_display_name ?? 'Unknown location'}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink-900">{e.location_display_name ?? 'Unknown location'}</span>
                  )}
                  {e.method && <span className="text-ink-500">· {e.method}</span>}
                  <ConfidenceLabel confidence={e.confidence} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </article>
  );
}

/** Stat-bar magnitude tier — color reinforces the numeric value (never the sole signal). */
function statTierColor(value: number): string {
  if (value >= 120) return 'bg-stat-elite';
  if (value >= 90) return 'bg-stat-high';
  if (value >= 60) return 'bg-stat-mid';
  return 'bg-stat-low';
}

function StatBar({ statKey, value }: { statKey: StatKey; value: number }) {
  const pct = Math.min(100, Math.round((value / MAX_BASE_STAT) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-ink-500">{STAT_DISPLAY[statKey]}</span>
      <span className="w-8 shrink-0 text-right font-mono text-xs text-ink-900">{value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-none bg-surface-3">
        <div className={`h-full rounded-none ${statTierColor(value)}`} style={{ width: `${pct}%` }} aria-hidden />
      </div>
    </div>
  );
}
