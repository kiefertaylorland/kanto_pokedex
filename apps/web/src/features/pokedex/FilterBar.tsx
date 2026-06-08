import { TYPE_NAMES, type BrowserQuery, type SortKey, type TypeName } from '@kanto/shared';
import { SearchInput } from '@/components/SearchInput';
import { Select } from '@/components/Select';
import { TypeBadge } from '@/components/TypeBadge';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'number', label: 'Number' },
  { value: 'name', label: 'Name A–Z' },
  { value: 'base_stat_total', label: 'Base stat total' },
];

/** Direction the design implies for each sort key (BST reads high→low). */
const SORT_DIR: Record<SortKey, BrowserQuery['dir']> = {
  number: 'asc',
  name: 'asc',
  base_stat_total: 'desc',
};

interface Props {
  query: BrowserQuery;
  onChange: (patch: Partial<BrowserQuery>) => void;
  /** Types absent from the dataset render disabled. All 15 Gen-I types are present. */
  presentTypes?: ReadonlySet<TypeName>;
}

/** Search + sort + interactive type-badge filter (OR) toolbar (FR-010..013). */
export function FilterBar({ query, onChange, presentTypes }: Props) {
  function toggleType(type: TypeName) {
    const next = query.types.includes(type)
      ? query.types.filter((t) => t !== type)
      : [...query.types, type];
    onChange({ types: next, page: 1 });
  }

  return (
    <div className="space-y-4 rounded-md border-2 border-border-strong bg-surface p-4">
      <div className="flex flex-wrap items-end gap-4">
        <SearchInput
          value={query.q}
          onChange={(q) => onChange({ q, page: 1 })}
          onClear={() => onChange({ q: '', page: 1 })}
          placeholder="Search by name or number"
        />
        <Select
          label="Sort"
          value={query.sort}
          options={SORT_OPTIONS}
          onChange={(value) => {
            const sort = value as SortKey;
            onChange({ sort, dir: SORT_DIR[sort], page: 1 });
          }}
          className="w-48"
        />
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-ink-700">
            Filter by type{query.types.length > 0 ? ` · ${query.types.length} selected` : ''}
          </p>
          {query.types.length > 0 && (
            <button
              type="button"
              onClick={() => onChange({ types: [], page: 1 })}
              className="text-xs font-semibold text-info underline"
            >
              Clear all types
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPE_NAMES.map((type) => {
            const disabled = presentTypes ? !presentTypes.has(type) : false;
            return (
              <TypeBadge
                key={type}
                type={type}
                variant="outline"
                interactive
                selected={query.types.includes(type)}
                disabled={disabled}
                onClick={() => !disabled && toggleType(type)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
