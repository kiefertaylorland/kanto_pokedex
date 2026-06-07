import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { track } from '@/lib/analytics';

/**
 * Public landing page (FR-001..007). Static / illustrative only — it renders NO
 * live protected data (clarification: static preview). The single CTA routes to
 * /auth. This is the only public content route besides /auth.
 */
const PREVIEW = [
  { dex: '001', name: 'Bulbasaur' },
  { dex: '004', name: 'Charmander' },
  { dex: '007', name: 'Squirtle' },
  { dex: '025', name: 'Pikachu' },
  { dex: '150', name: 'Mewtwo' },
  { dex: '151', name: 'Mew' },
];

export function LandingPage() {
  return (
    <div className="flex flex-col items-center gap-10 py-8 text-center">
      <section className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">The Kanto Pokédex</h1>
        <p className="text-lg text-ink-700">
          Browse all 151 original Pokémon — search, filter by type, inspect stats and evolutions, and explore where
          each one appears across the Kanto region.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button asChild size="lg" onClick={() => track('landing_cta_clicked')}>
            <Link to="/auth">Sign in to explore</Link>
          </Button>
        </div>
        <p className="text-xs text-ink-500">Sign in with Google, GitHub, or an email magic link.</p>
      </section>

      <section aria-label="Preview" className="w-full max-w-3xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PREVIEW.map((p) => (
            <Card key={p.dex} className="overflow-hidden">
              <CardContent className="flex flex-col items-center gap-2 p-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-2 font-mono text-xs text-ink-500">
                  #{p.dex}
                </div>
                <span className="text-sm font-medium">{p.name}</span>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-500">Illustrative preview — sign in to see live data.</p>
      </section>
    </div>
  );
}
