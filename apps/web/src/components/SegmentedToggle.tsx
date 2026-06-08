import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

/**
 * Two-or-more segment toggle (`role="group"`). The active segment is filled
 * `brand-600` with white text; selection is also exposed via `aria-pressed`.
 */
export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  /** Accessible group label. */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn('inline-flex rounded-sm border border-border-strong bg-surface p-0.5', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-sm px-3 py-1.5 text-sm font-semibold transition-colors',
              active ? 'bg-brand-600 text-white' : 'text-ink-700 hover:bg-surface-2',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
