import { CONFIDENCE_DISPLAY, type ConfidenceLevel } from '@kanto/shared';
import { cn } from '@/lib/utils';

/**
 * Provenance / confidence chip shown on every encounter. Color is never the sole
 * signal (WCAG 1.4.1): the level is conveyed by color + text label + a shape glyph.
 */
const GLYPH: Record<ConfidenceLevel, string> = {
  pokeapi: '●', // filled disc
  curated: '◆', // diamond
  inferred: '▲', // triangle
  unknown: '◌', // dotted ring
};

const TONE: Record<ConfidenceLevel, string> = {
  pokeapi: 'text-confidence-pokeapi border-confidence-pokeapi',
  curated: 'text-confidence-curated border-confidence-curated',
  inferred: 'text-confidence-inferred border-confidence-inferred',
  unknown: 'text-confidence-unknown border-confidence-unknown',
};

export function ConfidenceLabel({ confidence }: { confidence: ConfidenceLevel }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm border bg-surface px-1.5 py-0.5 text-xs font-semibold',
        TONE[confidence],
      )}
    >
      <span aria-hidden className="leading-none">
        {GLYPH[confidence]}
      </span>
      {CONFIDENCE_DISPLAY[confidence]}
    </span>
  );
}
