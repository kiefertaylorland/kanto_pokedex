import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Favorite toggle. State is conveyed by color **+ fill + label** (never color
 * alone) and surfaced via `aria-pressed` with a label that flips. Stops click
 * propagation so it never triggers an enclosing card link.
 */
export function FavStar({
  active,
  onToggle,
  name,
  size = 'default',
  className,
}: {
  active: boolean;
  onToggle: () => void;
  /** Pokémon name, woven into the accessible label. */
  name: string;
  /** 'default' = 34px (detail/standalone); 'grid' = 32px (card overlay). */
  size?: 'default' | 'grid';
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      title={active ? `Remove ${name} from favorites` : `Add ${name} to favorites`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-sm border-2 transition-colors',
        size === 'grid' ? 'h-8 w-8' : 'h-[34px] w-[34px]',
        active
          ? 'border-brand-600 bg-brand-300 text-brand-600'
          : 'border-border-strong bg-surface text-ink-500 hover:bg-surface-2',
        className,
      )}
    >
      <Star
        className={cn(size === 'grid' ? 'h-4 w-4' : 'h-[18px] w-[18px]', active && 'fill-current')}
        aria-hidden
      />
    </button>
  );
}
