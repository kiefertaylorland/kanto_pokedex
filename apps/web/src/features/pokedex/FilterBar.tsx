import {
  TYPE_NAMES,
  typeDisplayName,
  SORT_KEYS,
  type BrowserQuery,
  type SortKey,
  type TypeName,
} from '@kanto/shared';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const SORT_LABELS: Record<SortKey, string> = {
  number: 'Number',
  name: 'Name',
  base_stat_total: 'Base stat total',
};

interface Props {
  query: BrowserQuery;
  onChange: (patch: Partial<BrowserQuery>) => void;
}

/** Search + multi-select type filter (OR) + sort controls (FR-010..013). */
export function FilterBar({ query, onChange }: Props) {
  function toggleType(type: TypeName) {
    const next = query.types.includes(type)
      ? query.types.filter((t) => t !== type)
      : [...query.types, type];
    onChange({ types: next, page: 1 });
  }

  return (
    <div className="space-y-4 rounded-md border-2 border-border-strong bg-surface p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="search" className="sr-only">
          Search by name or number
        </label>
        <Input
          id="search"
          type="search"
          inputMode="search"
          placeholder="Search by name or number (e.g. pika or 25)"
          value={query.q}
          onChange={(e) => onChange({ q: e.target.value, page: 1 })}
          className="sm:max-w-xs"
        />

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-ink-700">
            Sort
          </label>
          <select
            id="sort"
            value={query.sort}
            onChange={(e) => onChange({ sort: e.target.value as SortKey, page: 1 })}
            className="h-10 rounded-md border border-border-strong bg-surface px-2 text-sm text-ink-900"
          >
            {SORT_KEYS.map((k) => (
              <option key={k} value={k}>
                {SORT_LABELS[k]}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            aria-label={`Toggle sort direction, currently ${query.dir === 'asc' ? 'ascending' : 'descending'}`}
            onClick={() => onChange({ dir: query.dir === 'asc' ? 'desc' : 'asc' })}
          >
            {query.dir === 'asc' ? '↑ Asc' : '↓ Desc'}
          </Button>
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink-700">Filter by type</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {TYPE_NAMES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-700">
              <Checkbox checked={query.types.includes(type)} onCheckedChange={() => toggleType(type)} />
              {typeDisplayName(type)}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
