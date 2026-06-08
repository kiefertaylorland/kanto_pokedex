import { Link } from '@tanstack/react-router';
import { type TypeName, TYPE_TINTS, TYPE_COLORS } from '@kanto/shared';
import { cn } from '@/lib/utils';

/**
 * A single node in an evolution chain — links to that Pokémon's detail page.
 * The current Pokémon is highlighted (brand border/fill) and marked
 * `aria-current`. Used by both linear chains and the Eevee-style branch fan.
 */
export function EvoNode({
  dexNumber,
  name,
  primaryType,
  spriteUrl,
  isCurrent = false,
}: {
  dexNumber: number;
  name: string;
  primaryType?: TypeName;
  spriteUrl?: string | null;
  isCurrent?: boolean;
}) {
  const dex = String(dexNumber).padStart(3, '0');
  const tint = primaryType ? TYPE_TINTS[primaryType] : 'rgb(var(--surface-2))';
  const hue = primaryType ? TYPE_COLORS[primaryType] : '#767A6C';
  return (
    <Link
      to="/pokemon/$dexId"
      params={{ dexId: String(dexNumber) }}
      aria-current={isCurrent ? 'true' : undefined}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-sm border-2 p-2 no-underline',
        isCurrent ? 'border-brand-600 bg-brand-300' : 'border-border bg-surface hover:bg-surface-2',
      )}
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-sm"
        style={{ backgroundColor: tint }}
      >
        {spriteUrl ? (
          <img src={spriteUrl} alt="" width={36} height={36} loading="lazy" className="h-9 w-9 object-contain" />
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden style={{ color: hue, opacity: 0.5 }}>
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M2 12 H22" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </span>
      <span className="font-display text-2xs text-ink-500">№{dex}</span>
      <span className="text-xs font-semibold text-ink-900">{name}</span>
    </Link>
  );
}

/** The "→" connector between evolution nodes, with an optional method label. */
export function EvoTrigger({ label }: { label?: string | null }) {
  return (
    <span className="inline-flex min-w-16 flex-col items-center text-ink-500">
      <span className="text-lg leading-none" aria-hidden>
        →
      </span>
      {label && <span className="text-center text-2xs">{label}</span>}
    </span>
  );
}
