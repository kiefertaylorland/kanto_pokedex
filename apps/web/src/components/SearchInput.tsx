import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Search field with a leading magnifier, an optional spinner while a query is
 * in flight, and a clear button when there's text. Defaults to 280px wide.
 */
export function SearchInput({
  value,
  onChange,
  onClear,
  loading = false,
  placeholder = 'Search by name or number',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={cn('relative w-[280px] max-w-full', className)}>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500"
        aria-hidden
      />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search Pokémon"
        className="h-10 w-full rounded-sm border border-border bg-surface-2 pl-9 pr-9 text-sm text-ink-900 placeholder:text-ink-400"
      />
      {loading ? (
        <Loader2
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-500"
          aria-hidden
        />
      ) : (
        onClear && value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-sm text-ink-500 hover:bg-surface-3"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )
      )}
    </div>
  );
}
