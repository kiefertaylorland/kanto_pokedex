import * as React from 'react';
import { useParams, Link, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  parseDexId,
  MIN_DEX,
  MAX_DEX,
  TYPE_TINTS,
  TYPE_COLORS,
  type EvolutionNode,
} from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchPokemonDetail } from './api';
import { TypeBadge } from '@/components/TypeBadge';
import { StatBar } from '@/components/StatBar';
import { AbilityTag } from '@/components/AbilityTag';
import { ConfidenceLabel } from '@/components/ConfidenceLabel';
import { PokeWell } from '@/components/PokeWell';
import { EvoNode, EvoTrigger } from '@/components/EvoNode';
import { LoadingState, ErrorState } from '@/components/state';
import { Button } from '@/components/ui/button';
import { NotFound } from '@/routes/NotFound';
import { useFavorites } from '@/features/favorites/useFavorites';
import { useSoundPreference, isSoundEnabled } from '@/features/sound/useSoundPreference';
import { useCry } from '@/features/sound/useCry';
import { cryUrl } from '@/features/sound/cry';
import { CryButton } from '@/features/sound/CryButton';
import { cn } from '@/lib/utils';

/** Title-case a slug like "fire-stone" → "Fire Stone". */
function titleCase(s: string): string {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Human label for how a node is reached (level / item / trigger). */
function evoLabel(node: EvolutionNode): string | null {
  if (node.min_level) return `Lv. ${node.min_level}`;
  if (node.item_name) return titleCase(node.item_name);
  if (node.trigger) return titleCase(node.trigger);
  return null;
}

/** Framed content panel. */
function Panel({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-md border-2 border-border-strong bg-surface p-5', className)}>
      {title && <h2 className="mb-4 text-xl font-semibold text-ink-900">{title}</h2>}
      {children}
    </section>
  );
}

/** Pokémon detail page (FR-016..026). */
export function DetailPage() {
  const params = useParams({ strict: false }) as { dexId?: string };
  const navigate = useNavigate();
  const raw = params.dexId ?? '';
  const dexId = parseDexId(raw);
  const numericRaw = /^\d+$/.test(raw) ? raw : undefined;
  const { isFavorite, toggle } = useFavorites();
  const { enabled: soundEnabled } = useSoundPreference();
  const { play } = useCry();

  React.useEffect(() => {
    if (dexId !== null) track('detail_viewed');
  }, [dexId]);

  const result = useQuery({
    queryKey: queryKeys.pokemon.detail(dexId ?? -1),
    queryFn: () => fetchPokemonDetail(dexId as number),
    enabled: dexId !== null,
  });

  // Auto-play the cry once per Pokémon as its details appear (sound permitting).
  const loadedId = result.data?.id ?? null;
  React.useEffect(() => {
    if (loadedId !== null && isSoundEnabled()) play(cryUrl(loadedId));
  }, [loadedId, play]);

  if (dexId === null) return <NotFound dexId={numericRaw} />;
  if (result.isLoading) return <LoadingState label="Loading Pokémon…" />;
  if (result.isError)
    return <ErrorState message={toUserMessage(result.error)} onRetry={() => void result.refetch()} />;
  if (!result.data) return <NotFound dexId={raw} />;

  const p = result.data;
  const dex = String(p.national_dex_number).padStart(3, '0');
  const primaryType = p.types[0];
  const tint = primaryType ? TYPE_TINTS[primaryType] : undefined;
  const hue = primaryType ? TYPE_COLORS[primaryType] : undefined;
  const saved = isFavorite(p.national_dex_number);
  const artUrl = p.official_artwork_url ?? p.sprite_url;

  // Backend holds the contiguous 1–151, so neighbors are just ±1 within range.
  const prevDex = p.national_dex_number > MIN_DEX ? p.national_dex_number - 1 : null;
  const nextDex = p.national_dex_number < MAX_DEX ? p.national_dex_number + 1 : null;

  // A Gen-I chain of 4+ is the Eevee-style branch fan (base + siblings); else linear.
  const chain = p.evolution_chain;
  const branchBase = chain[0];
  const isBranch = chain.length >= 4 && branchBase !== undefined;

  const dexNavButton = (target: number | null, dir: 'prev' | 'next') => (
    <button
      type="button"
      disabled={target === null}
      onClick={() => target !== null && void navigate({ to: '/pokemon/$dexId', params: { dexId: String(target) } })}
      aria-label={target !== null ? `${dir === 'prev' ? 'Previous' : 'Next'} Pokémon, №${String(target).padStart(3, '0')}` : undefined}
      className="inline-flex h-9 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-ink-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {dir === 'prev' && <span aria-hidden>‹</span>}
      <span className="font-display text-2xs">№{target !== null ? String(target).padStart(3, '0') : '—'}</span>
      {dir === 'next' && <span aria-hidden>›</span>}
    </button>
  );

  return (
    <div className="mx-auto max-w-xl px-6 py-8">
      {/* Top bar: back + dex nav */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <Link to="/pokedex" className="text-sm text-ink-500 hover:underline">
          ← Back to Pokédex
        </Link>
        <div className="flex items-center gap-2">
          {dexNavButton(prevDex, 'prev')}
          {dexNavButton(nextDex, 'next')}
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[360px_1fr]">
        {/* Left rail: type-tinted identity (sticky) */}
        <div className="lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-md border-2 border-border-strong bg-surface">
            <div className="px-6 pb-5 pt-6 text-center" style={tint ? { backgroundColor: tint } : undefined}>
              <p className="mb-4 font-display text-xl tracking-tight" style={hue ? { color: hue } : undefined}>
                №{dex}
              </p>
              <div className="relative mx-auto w-[200px]">
                <PokeWell type={primaryType} spriteUrl={artUrl} alt={p.display_name} size={200} className="border border-white/60 bg-white/60" />
                <CryButton onPlay={() => play(cryUrl(p.id))} enabled={soundEnabled} name={p.display_name} className="absolute bottom-1 right-1" />
              </div>
            </div>
            <div className="px-6 pb-6 pt-5 text-center">
              <h1 className="mb-3 text-2xl font-bold text-ink-900">{p.display_name}</h1>
              <div className="flex justify-center gap-1">
                {p.types.map((t) => (
                  <TypeBadge key={t} type={t} />
                ))}
              </div>
              <dl className="mt-5 flex justify-center gap-8 border-t border-border pt-4">
                <div>
                  <dt className="text-2xs uppercase tracking-wide text-ink-500">Height</dt>
                  <dd className="mt-1 font-mono text-base text-ink-900">{p.height !== null ? `${p.height / 10} m` : '—'}</dd>
                </div>
                <div>
                  <dt className="text-2xs uppercase tracking-wide text-ink-500">Weight</dt>
                  <dd className="mt-1 font-mono text-base text-ink-900">{p.weight !== null ? `${p.weight / 10} kg` : '—'}</dd>
                </div>
              </dl>
              <div className="mt-5 flex gap-2">
                <Button
                  variant={saved ? 'secondary' : 'default'}
                  size="sm"
                  className="flex-1"
                  aria-pressed={saved}
                  onClick={() => toggle(p.national_dex_number)}
                >
                  {saved ? '★ Saved' : '☆ Add to favorites'}
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/compare" search={{ a: p.national_dex_number, b: undefined }}>
                    Compare
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: data */}
        <div className="flex flex-col gap-5">
          {p.flavor_text && (
            <div
              className="rounded-md border border-border bg-surface-2 p-5"
              style={hue ? { borderLeftWidth: 3, borderLeftColor: hue } : undefined}
            >
              <p className="italic leading-relaxed text-ink-700">{p.flavor_text}</p>
            </div>
          )}

          <Panel title="Base stats">
            {p.stats.length === 0 ? (
              <p className="text-sm text-ink-500">Stats unavailable.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {p.stats.map((s) => (
                  <StatBar key={s.key} statKey={s.key} value={s.base_stat} animate />
                ))}
              </div>
            )}
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold text-ink-700">Base stat total</span>
              <span className="font-mono text-xl font-bold text-ink-900">{p.base_stat_total}</span>
            </div>
          </Panel>

          <div className="grid gap-5 md:grid-cols-2">
            <Panel title="Abilities">
              {p.abilities.length === 0 ? (
                <p className="text-sm text-ink-500">Abilities unavailable.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {p.abilities.map((a) => (
                    <AbilityTag key={`${a.name}-${a.slot}`} name={a.display_name} isHidden={a.is_hidden} />
                  ))}
                </div>
              )}
            </Panel>

            <Panel title="Where to find">
              {p.encounters.length === 0 ? (
                <p className="text-sm text-ink-500">No recorded Kanto encounters.</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {p.encounters.map((e, i) => (
                    <li key={`${e.kanto_location_id ?? 'loc'}-${i}`} className="flex flex-wrap items-center gap-2">
                      {e.kanto_location_id ? (
                        <Link
                          to="/map"
                          search={{ location: e.kanto_location_id }}
                          className="border-b border-border-strong text-sm font-semibold text-ink-900 no-underline hover:border-ink-900"
                        >
                          {e.location_display_name ?? 'Unknown location'}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-ink-900">{e.location_display_name ?? 'Unknown location'}</span>
                      )}
                      {e.method && <span className="text-xs text-ink-500">{e.method}</span>}
                      <ConfidenceLabel confidence={e.confidence} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Evolution">
            {chain.length <= 1 ? (
              <p className="text-sm text-ink-500">This Pokémon does not evolve.</p>
            ) : isBranch && branchBase ? (
              <div className="flex flex-wrap items-center gap-4">
                <EvoNode
                  dexNumber={branchBase.species_id}
                  name={branchBase.display_name}
                  isCurrent={branchBase.species_id === p.national_dex_number}
                />
                <EvoTrigger />
                <div className="flex flex-col gap-3">
                  {chain.slice(1).map((node) => (
                    <div key={node.species_id} className="flex items-center gap-2">
                      <span className="min-w-[88px] text-right text-2xs text-ink-500">{evoLabel(node)}</span>
                      <EvoNode
                        dexNumber={node.species_id}
                        name={node.display_name}
                        isCurrent={node.species_id === p.national_dex_number}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <ol className="flex list-none flex-wrap items-center gap-3 p-0">
                {chain.map((node, i) => (
                  <li key={node.species_id} className="flex items-center gap-3">
                    {i > 0 && <EvoTrigger label={evoLabel(node)} />}
                    <EvoNode
                      dexNumber={node.species_id}
                      name={node.display_name}
                      isCurrent={node.species_id === p.national_dex_number}
                    />
                  </li>
                ))}
              </ol>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
