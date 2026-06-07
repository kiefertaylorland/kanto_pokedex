import { useParams, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  parseDexId,
  STAT_DISPLAY,
  MAX_BASE_STAT,
  CONFIDENCE_DISPLAY,
  type StatKey,
} from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchPokemonDetail } from './api';
import { TypeBadge } from '@/components/TypeBadge';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingState, ErrorState, EmptyState } from '@/components/state';
import * as React from 'react';

/** Pokémon detail page (FR-016..026). */
export function DetailPage() {
  const params = useParams({ strict: false }) as { dexId?: string };
  const dexId = parseDexId(params.dexId ?? '');

  React.useEffect(() => {
    if (dexId !== null) track('detail_viewed');
  }, [dexId]);

  const result = useQuery({
    queryKey: queryKeys.pokemon.detail(dexId ?? -1),
    queryFn: () => fetchPokemonDetail(dexId as number),
    enabled: dexId !== null,
  });

  if (dexId === null) {
    return <EmptyState title="That Pokémon doesn’t exist." hint="The Kanto Pokédex covers numbers 1–151." />;
  }
  if (result.isLoading) return <LoadingState label="Loading Pokémon…" />;
  if (result.isError) return <ErrorState message={toUserMessage(result.error)} onRetry={() => void result.refetch()} />;
  if (!result.data) {
    return <EmptyState title="That Pokémon doesn’t exist." hint="The Kanto Pokédex covers numbers 1–151." />;
  }

  const p = result.data;
  const dex = String(p.national_dex_number).padStart(3, '0');

  return (
    <article className="space-y-6">
      <Link to="/pokedex" className="text-sm text-zinc-500 hover:underline">
        ← Back to Pokédex
      </Link>

      <header className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {p.official_artwork_url || p.sprite_url ? (
          <img
            src={p.official_artwork_url ?? p.sprite_url ?? ''}
            alt={p.display_name}
            width={200}
            height={200}
            className="h-48 w-48 object-contain"
          />
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800">
            No image
          </div>
        )}
        <div className="space-y-2 text-center sm:text-left">
          <p className="font-mono text-sm text-zinc-400">#{dex}</p>
          <h1 className="text-3xl font-bold">{p.display_name}</h1>
          <div className="flex flex-wrap justify-center gap-1 sm:justify-start">
            {p.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <dl className="flex gap-6 pt-1 text-sm text-zinc-600 dark:text-zinc-300">
            <div>
              <dt className="text-xs text-zinc-400">Height</dt>
              <dd>{p.height !== null ? `${p.height / 10} m` : '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-400">Weight</dt>
              <dd>{p.weight !== null ? `${p.weight / 10} kg` : '—'}</dd>
            </div>
          </dl>
        </div>
      </header>

      {p.flavor_text && (
        <Card>
          <CardContent className="p-4">
            <p className="italic text-zinc-700 dark:text-zinc-300">{p.flavor_text}</p>
            <p className="mt-1 text-xs text-zinc-400">Pokémon Red/Blue</p>
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
              <p className="text-sm text-zinc-400">Stats unavailable.</p>
            ) : (
              p.stats.map((s) => <StatBar key={s.key} statKey={s.key} value={s.base_stat} />)
            )}
            <p className="pt-2 text-sm font-semibold">Total: {p.base_stat_total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {p.abilities.length === 0 ? (
              <p className="text-sm text-zinc-400">Abilities unavailable.</p>
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
            <p className="text-sm text-zinc-400">This Pokémon does not evolve.</p>
          ) : (
            <ol className="flex flex-wrap items-center gap-2 text-sm">
              {p.evolution_chain.map((node, i) => (
                <li key={node.species_id} className="flex items-center gap-2">
                  {i > 0 && <span className="text-zinc-400">→</span>}
                  <Link
                    to="/pokemon/$dexId"
                    params={{ dexId: String(node.species_id) }}
                    className="rounded border border-zinc-200 px-2 py-1 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
            <p className="text-sm text-zinc-400">No recorded Kanto encounters.</p>
          ) : (
            <ul className="space-y-2">
              {p.encounters.map((e, i) => (
                <li key={`${e.kanto_location_id ?? 'loc'}-${i}`} className="flex flex-wrap items-center gap-2 text-sm">
                  {e.kanto_location_id ? (
                    <Link
                      to="/map"
                      search={{ location: e.kanto_location_id }}
                      className="font-medium hover:underline"
                    >
                      {e.location_display_name ?? 'Unknown location'}
                    </Link>
                  ) : (
                    <span className="font-medium">{e.location_display_name ?? 'Unknown location'}</span>
                  )}
                  {e.method && <span className="text-zinc-500">· {e.method}</span>}
                  <Badge tone="muted">{CONFIDENCE_DISPLAY[e.confidence]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </article>
  );
}

function StatBar({ statKey, value }: { statKey: StatKey; value: number }) {
  const pct = Math.min(100, Math.round((value / MAX_BASE_STAT) * 100));
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-zinc-500">{STAT_DISPLAY[statKey]}</span>
      <span className="w-8 shrink-0 text-right text-xs font-mono">{value}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div className="h-full rounded-full bg-pokedex-red" style={{ width: `${pct}%` }} aria-hidden />
      </div>
    </div>
  );
}
