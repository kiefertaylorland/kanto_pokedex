import * as React from 'react';
import { MAX_BASE_STAT, STAT_DISPLAY, type StatKey } from '@kanto/shared';
import { cn } from '@/lib/utils';

/** 4-tier magnitude color: ≤59 low, 60–89 mid, 90–119 high, ≥120 elite. */
function tierClass(value: number): string {
  if (value >= 120) return 'bg-stat-elite';
  if (value >= 90) return 'bg-stat-high';
  if (value >= 60) return 'bg-stat-mid';
  return 'bg-stat-low';
}

/**
 * A single base-stat bar. Magnitude is conveyed by color tier **and** the
 * numeric value (never color alone). When `animate` is set the fill grows from
 * 0 on mount (`--motion-slow` / `--ease-sheet`); the final width is always
 * reachable, and `prefers-reduced-motion` (global) collapses the transition.
 */
export function StatBar({
  statKey,
  value,
  max = MAX_BASE_STAT,
  animate = false,
}: {
  statKey: StatKey;
  value: number;
  /** Scale denominator. Detail uses 255; Compare uses 200 for legible fills. */
  max?: number;
  animate?: boolean;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const [width, setWidth] = React.useState(animate ? 0 : pct);

  React.useEffect(() => {
    if (animate) {
      const id = requestAnimationFrame(() => setWidth(pct));
      return () => cancelAnimationFrame(id);
    }
    setWidth(pct);
  }, [animate, pct]);

  return (
    <div className="flex items-center gap-3">
      <span className="w-16 shrink-0 text-sm text-ink-700">{STAT_DISPLAY[statKey]}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-none bg-surface-3">
        <div
          className={cn('h-full rounded-none transition-[width] duration-[320ms] ease-sheet', tierClass(value))}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right font-mono text-sm font-semibold text-ink-900">
        {value}
      </span>
    </div>
  );
}
