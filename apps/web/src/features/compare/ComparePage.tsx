import * as React from 'react';
import { useSearch, useNavigate, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import {
  STAT_KEYS,
  STAT_DISPLAY,
  TYPE_TINTS,
  type StatKey,
  type PokemonCard,
  type PokemonDetail,
} from '@kanto/shared';
import { queryKeys } from '@/lib/queryKeys';
import { toUserMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { fetchPokemonIndex } from '@/features/pokedex/api';
import { fetchPokemonDetail } from '@/features/pokemon-detail/api';
import { TypeBadge } from '@/components/TypeBadge';
import { AbilityTag } from '@/components/AbilityTag';
import { FavStar } from '@/components/FavStar';
import { PokeballMark } from '@/components/PokeballMark';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Select } from '@/components/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/state';
import { useFavorites } from '@/features/favorites/useFavorites';

/** Side-by-side comparison of two Pokémon (FR additive — Compare screen). */
export function ComparePage() {
  const { a, b } = useSearch({ strict: false }) as { a?: number; b?: number };
  const navigate = useNavigate();

  React.useEffect(() => {
    track('compare_viewed');
  }, []);

  const index = useQuery({ queryKey: queryKeys.pokemon.index(), queryFn: fetchPokemonIndex });

  const setSlot = (slot: 'a' | 'b', dex: number | undefined) =>
    void navigate({ to: '/compare', search: (prev) => ({ ...prev, [slot]: dex }) });

  const swap = () => void navigate({ to: '/compare', search: (prev) => ({ a: prev.b, b: prev.a }) });

  if (index.isLoading) return <LoadingState label="Loading Pokémon…" />;
  if (index.isError) return <ErrorState message={toUserMessage(index.error)} onRetry={() => void index.refetch()} />;

  const options = index.data ?? [];
  const cardA = a != null ? options.find((p) => p.national_dex_number === a) ?? null : null;
  const cardB = b != null ? options.find((p) => p.national_dex_number === b) ?? null : null;

  return (
    <div className="mx-auto max-w-xl space-y-6 px-6 py-8">
      <Link to="/pokedex" className="text-sm text-ink-500 hover:underline">
        ← Back to Pokédex
      </Link>
      <ScreenHeader kicker="Side by side" title="Compare Pokémon" />

      {/* Picker toolbar. */}
      <div className="flex flex-col items-end gap-3 rounded-md border-2 border-border-strong bg-surface p-4 sm:flex-row">
        <PokemonSelect label="A" value={a} options={options} onChange={(v) => setSlot('a', v)} />
        <Button variant="ghost" size="sm" onClick={swap} aria-label="Swap A and B" className="mb-0.5">
          ⇄ Swap
        </Button>
        <PokemonSelect label="B" value={b} options={options} onChange={(v) => setSlot('b', v)} />
      </div>

      {/* Identity row. */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
        <IdentitySlot card={cardA} />
        <div className="flex items-center justify-center font-display text-xl text-ink-500" aria-hidden>
          VS
        </div>
        <IdentitySlot card={cardB} />
      </div>

      {a != null && b != null && <ComparePanels dexA={a} dexB={b} />}
    </div>
  );
}

function PokemonSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number | undefined;
  options: PokemonCard[];
  onChange: (dex: number | undefined) => void;
}) {
  const selectOptions = [
    { value: '', label: 'Select a Pokémon…' },
    ...options.map((p) => ({
      value: String(p.national_dex_number),
      label: `№${String(p.national_dex_number).padStart(3, '0')} · ${p.display_name}`,
    })),
  ];
  return (
    <Select
      label={label}
      value={value != null ? String(value) : ''}
      options={selectOptions}
      onChange={(v) => onChange(v === '' ? undefined : Number(v))}
      className="w-full"
    />
  );
}

/** Identity card for a selected Pokémon, or a prompt when the slot is empty. */
function IdentitySlot({ card }: { card: PokemonCard | null }) {
  const { isFavorite, toggle } = useFavorites();
  if (!card) {
    return (
      <Card className="flex items-center justify-center p-6 text-center text-sm text-ink-500">
        Pick a Pokémon to compare.
      </Card>
    );
  }
  const dex = String(card.national_dex_number).padStart(3, '0');
  const primaryType = card.types[0];
  return (
    <Card className="overflow-hidden">
      {/* Type-tint header band. */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={primaryType ? { backgroundColor: TYPE_TINTS[primaryType] } : undefined}
      >
        <span className="font-display text-sm text-ink-900">№{dex}</span>
        <FavStar
          active={isFavorite(card.national_dex_number)}
          onToggle={() => toggle(card.national_dex_number)}
          name={card.display_name}
          size="grid"
        />
      </div>
      <CardContent className="flex flex-col items-center gap-2 p-4">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-md bg-surface-2"
          style={primaryType ? { backgroundColor: TYPE_TINTS[primaryType] } : undefined}
        >
          {card.sprite_url ? (
            <img src={card.sprite_url} alt={card.display_name} width={80} height={80} className="h-20 w-20 object-contain" />
          ) : (
            <PokeballMark className="h-12 w-12 opacity-60" />
          )}
        </div>
        <span className="text-sm font-semibold text-ink-900">{card.display_name}</span>
        <div className="flex flex-wrap justify-center gap-1">
          {card.types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
        <Link
          to="/pokemon/$dexId"
          params={{ dexId: String(card.national_dex_number) }}
          className="text-xs text-info hover:underline"
        >
          View details →
        </Link>
      </CardContent>
    </Card>
  );
}

/** Stats + abilities, loaded once both slots are filled. */
function ComparePanels({ dexA, dexB }: { dexA: number; dexB: number }) {
  const qa = useQuery({ queryKey: queryKeys.pokemon.detail(dexA), queryFn: () => fetchPokemonDetail(dexA) });
  const qb = useQuery({ queryKey: queryKeys.pokemon.detail(dexB), queryFn: () => fetchPokemonDetail(dexB) });

  if (qa.isLoading || qb.isLoading) return <LoadingState label="Loading stats…" />;
  if (qa.isError) return <ErrorState message={toUserMessage(qa.error)} onRetry={() => void qa.refetch()} />;
  if (qb.isError) return <ErrorState message={toUserMessage(qb.error)} onRetry={() => void qb.refetch()} />;
  if (!qa.data || !qb.data) return null;

  const a = qa.data;
  const b = qb.data;
  const statOf = (p: PokemonDetail, key: StatKey) => p.stats.find((s) => s.key === key)?.base_stat ?? 0;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Base stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {STAT_KEYS.map((key) => (
            <CompareStatRow key={key} label={STAT_DISPLAY[key]} aValue={statOf(a, key)} bValue={statOf(b, key)} />
          ))}
          <CompareStatRow label="Total" aValue={a.base_stat_total} bValue={b.base_stat_total} max={1200} isTotal />
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <AbilityPanel detail={a} />
        <AbilityPanel detail={b} />
      </div>
    </>
  );
}

function AbilityPanel({ detail }: { detail: PokemonDetail }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{detail.display_name}&apos;s abilities</CardTitle>
      </CardHeader>
      <CardContent>
        {detail.abilities.length === 0 ? (
          <p className="text-sm text-ink-500">Abilities unavailable.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {detail.abilities.map((ab) => (
              <AbilityTag key={`${ab.name}-${ab.slot}`} name={ab.display_name} isHidden={ab.is_hidden} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Magnitude tier — color reinforces the value (never the sole signal). */
function statTierColor(value: number): string {
  if (value >= 120) return 'bg-stat-elite';
  if (value >= 90) return 'bg-stat-high';
  if (value >= 60) return 'bg-stat-mid';
  return 'bg-stat-low';
}

/**
 * One mirrored row: value · bar (grows toward center) · label · bar · value.
 * Scale max 200 for legible side-by-side fills (tighter than the detail page's
 * 255). The higher value is bold ink-900, the lower ink-500, a tie ink-700.
 */
function CompareStatRow({
  label,
  aValue,
  bValue,
  max = 200,
  isTotal = false,
}: {
  label: string;
  aValue: number;
  bValue: number;
  max?: number;
  isTotal?: boolean;
}) {
  const aPct = Math.min(100, Math.round((aValue / max) * 100));
  const bPct = Math.min(100, Math.round((bValue / max) * 100));
  const weight = (mine: number, other: number) =>
    mine > other ? 'font-bold text-ink-900' : mine < other ? 'text-ink-500' : 'text-ink-700';

  return (
    <div className="grid grid-cols-[2.5rem_1fr_5rem_1fr_2.5rem] items-center gap-2">
      <span className={`text-right font-mono text-xs ${weight(aValue, bValue)}`}>{aValue}</span>
      <div className="flex h-2.5 justify-end overflow-hidden rounded-none bg-surface-3">
        <div className={`h-full rounded-none ${isTotal ? 'bg-ink-700' : statTierColor(aValue)}`} style={{ width: `${aPct}%` }} aria-hidden />
      </div>
      <span className="text-center text-xs text-ink-500">{label}</span>
      <div className="flex h-2.5 justify-start overflow-hidden rounded-none bg-surface-3">
        <div className={`h-full rounded-none ${isTotal ? 'bg-ink-700' : statTierColor(bValue)}`} style={{ width: `${bPct}%` }} aria-hidden />
      </div>
      <span className={`text-left font-mono text-xs ${weight(bValue, aValue)}`}>{bValue}</span>
    </div>
  );
}
