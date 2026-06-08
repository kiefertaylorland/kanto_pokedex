import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Build a compact page list with ellipses, e.g. 1 … 4 5 [6] 7 8 … 20. */
function pageList(page: number, pageCount: number): (number | 'gap')[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('gap');
    out.push(p);
    prev = p;
  }
  return out;
}

/** Numbered pagination with prev/next. Disabled at the ends. */
export function Pagination({
  page,
  pageCount,
  onChange,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  const cellBase =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={cn(cellBase, 'border-border-strong bg-surface text-ink-700 hover:bg-surface-2')}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      {pageList(page, pageCount).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="px-1 text-ink-400" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              cellBase,
              p === page
                ? 'border-brand-600 bg-brand-300 text-ink-900'
                : 'border-border-strong bg-surface text-ink-700 hover:bg-surface-2',
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Next page"
        className={cn(cellBase, 'border-border-strong bg-surface text-ink-700 hover:bg-surface-2')}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
