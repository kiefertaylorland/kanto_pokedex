import { type TypeName, typeDisplayName, TYPE_COLORS, TYPE_TINTS } from '@kanto/shared';
import { cn } from '@/lib/utils';

type TypeBadgeVariant = 'solid' | 'tint' | 'outline';

/**
 * Colored type chip. Renders the type name as escaped text (SEC-009).
 * Color is never the sole signal — the type name is always present.
 *
 * - `solid` (default): white text on the deep type hue (AA ≥4.5:1).
 * - `tint`: type-tinted fill with dark ink text (non-text-critical accents).
 * - `outline`: bordered chip. Used as an interactive filter toggle in the
 *   Pokédex — pass `interactive` + `selected`/`disabled`/`onClick`.
 */
export function TypeBadge({
  type,
  variant = 'solid',
  interactive = false,
  selected = false,
  disabled = false,
  onClick,
  className,
}: {
  type: TypeName;
  variant?: TypeBadgeVariant;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const label = typeDisplayName(type);
  const base =
    'inline-flex items-center rounded-sm px-2.5 py-0.5 text-xs font-semibold transition-colors';

  if (interactive) {
    return (
      <button
        type="button"
        aria-pressed={selected}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          base,
          'border',
          disabled
            ? 'cursor-not-allowed border-border text-ink-400'
            : selected
              ? 'border-brand-600 bg-brand-300 text-ink-900'
              : 'border-border-strong bg-surface text-ink-700 hover:bg-surface-2',
          className,
        )}
        style={!disabled && !selected ? { borderColor: TYPE_COLORS[type] } : undefined}
      >
        {label}
      </button>
    );
  }

  if (variant === 'tint') {
    return (
      <span
        className={cn(base, 'text-ink-900', className)}
        style={{ backgroundColor: TYPE_TINTS[type] }}
      >
        {label}
      </span>
    );
  }

  if (variant === 'outline') {
    return (
      <span
        className={cn(base, 'border bg-surface', className)}
        style={{ borderColor: TYPE_COLORS[type], color: TYPE_COLORS[type] }}
      >
        {label}
      </span>
    );
  }

  // solid
  return (
    <span
      className={cn(base, 'text-white shadow-sm', className)}
      style={{ backgroundColor: TYPE_COLORS[type] }}
    >
      {label}
    </span>
  );
}
