import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { PokeWell } from '@/components/PokeWell';

/**
 * Catch-all not-found screen. Also rendered from the detail route when a
 * requested dex isn't in the dataset (stale evolution links) — pass `dexId` for
 * the species-specific variant.
 */
export function NotFound({ dexId }: { dexId?: string }) {
  const dex = dexId ? String(Number(dexId)).padStart(3, '0') : null;
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-5 rounded-md border-2 border-border-strong bg-surface p-8 text-center">
        <PokeWell size={96} />
        <div className="space-y-1">
          <p className="font-display text-2xs uppercase tracking-wide text-brand-600">Not found</p>
          <p className="font-display text-display text-ink-900">404</p>
        </div>
        <p className="text-ink-700">
          {dex
            ? `We don’t have data for №${dex} yet. It may not be in this Pokédex.`
            : 'We couldn’t find that page. It may have moved, or the link is out of date.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link to="/pokedex">Back to Pokédex</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
