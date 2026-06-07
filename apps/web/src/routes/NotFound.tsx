import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PokeballMark } from '@/components/PokeballMark';

/**
 * Catch-all not-found screen. Also rendered from the detail route when a
 * requested dex isn't in the dataset (stale evolution links) — pass `dexId` for
 * the species-specific variant.
 */
export function NotFound({ dexId }: { dexId?: string }) {
  const dex = dexId ? String(Number(dexId)).padStart(3, '0') : null;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-md border-2 border-border-strong bg-surface p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-md bg-surface-2">
        <PokeballMark className="h-14 w-14" />
      </div>
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-brand-600">Not found</p>
        <p className="font-display text-4xl text-ink-900">404</p>
      </div>
      <p className="text-ink-700">
        {dex
          ? `We don’t have data for №${dex} yet.`
          : 'We couldn’t find that page. It may have moved, or never existed in this Pokédex.'}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/pokedex">Back to Pokédex</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/map">View the Kanto map</Link>
        </Button>
      </div>
    </div>
  );
}
