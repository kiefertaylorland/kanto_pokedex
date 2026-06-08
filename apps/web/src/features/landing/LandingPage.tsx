import { Link } from '@tanstack/react-router';
import { type TypeName, TYPE_TINTS } from '@kanto/shared';
import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';

/**
 * Public landing page (FR-001..007). Static / illustrative only — it renders NO
 * live protected data (clarification: static preview). The single CTA routes to
 * /auth. This is the only public content route besides /auth.
 */
const PREVIEW: { dex: number; name: string; types: TypeName[] }[] = [
  { dex: 1, name: 'Bulbasaur', types: ['grass', 'poison'] },
  { dex: 4, name: 'Charmander', types: ['fire'] },
  { dex: 7, name: 'Squirtle', types: ['water'] },
  { dex: 25, name: 'Pikachu', types: ['electric'] },
  { dex: 150, name: 'Mewtwo', types: ['psychic'] },
  { dex: 151, name: 'Mew', types: ['psychic'] },
];

/** Compact, non-interactive preview card shown inside the device mock. */
function PreviewCard({ dex, name, types }: { dex: number; name: string; types: TypeName[] }) {
  const primary = types[0] ?? 'normal';
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-sm border border-border bg-surface p-2">
      <span className="self-start font-mono text-2xs text-ink-500">#{String(dex).padStart(3, '0')}</span>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-sm"
        style={{ backgroundColor: TYPE_TINTS[primary] }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.4 }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
          <path d="M2 12 H22" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </div>
      <span className="text-xs font-semibold text-ink-900">{name}</span>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* Left: copy + CTA */}
        <div>
          <p className="mb-4 font-display text-2xs uppercase tracking-wide text-brand-600">
            № 001–151 · Generation I
          </p>
          <h1 className="mb-5 font-display text-display leading-display text-ink-900">
            The Kanto
            <br />
            Pokédex
          </h1>
          <p className="mb-6 max-w-[46ch] text-lg leading-relaxed text-ink-700">
            Browse all 151 original Pokémon — search, filter by type, inspect stats and evolutions, and explore
            where each one appears across the Kanto region.
          </p>
          <Button asChild size="lg" onClick={() => track('landing_cta_clicked')}>
            <Link to="/auth">Sign in to explore</Link>
          </Button>
          <p className="mt-4 text-xs text-ink-500">Sign in with Google, GitHub, or an email magic link.</p>
        </div>

        {/* Right: stylized device mock (illustrative) */}
        <div>
          <div className="rounded-lg border-frame border-brand-700 bg-brand-600 p-3 shadow-md">
            {/* device top strip */}
            <div className="flex items-center gap-2 px-2 pb-3">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-white" style={{ background: '#9ec9e8' }} />
              <span className="h-[7px] w-[7px] rounded-full bg-stat-low" />
              <span className="h-[7px] w-[7px] rounded-full bg-warning" />
              <span className="h-[7px] w-[7px] rounded-full bg-success" />
              <span className="ml-auto font-display text-2xs tracking-wide text-white/85">KANTO · 151</span>
            </div>
            {/* screen */}
            <div className="rounded-md bg-surface p-4">
              <div className="grid grid-cols-3 gap-3" aria-hidden>
                {PREVIEW.map((p) => (
                  <PreviewCard key={p.dex} {...p} />
                ))}
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-ink-500">Illustrative preview — sign in to see live data.</p>
        </div>
      </div>
    </div>
  );
}
