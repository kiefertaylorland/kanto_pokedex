# Contract: Pokédex Browser Query Params

Source of truth for the `/pokedex` URL state (FR-014). Parsed/validated on every load; invalid values fall back to defaults rather than erroring the page.

## Parameters

| Param | Type | Rules | Default |
|---|---|---|---|
| `q` | string | trimmed; ≤ 50 chars; treated as literal text (no injection — SEC-007/008). If all-digits → exact numeric dex match (1–151), else case-insensitive name substring | `""` |
| `types` | string[] | each ∈ allow-list of 15 Gen-I type names (`normal,fire,water,…`); multi-select **OR/union** semantics | `[]` |
| `sort` | enum | **allow-list**: `number` \| `name` \| `base_stat_total` | `number` |
| `dir` | enum | `asc` \| `desc` | `asc` |
| `page` | int | coerced; clamped to `[1, ceil(matchCount/20)]` | `1` |

Page size is the fixed constant `PAGE_SIZE = 20` (not client-controllable).

## Zod (in `packages/shared/src/schemas/browserQuery.ts`)

```ts
export const SORT_KEYS = ['number', 'name', 'base_stat_total'] as const;
export const TYPE_NAMES = ['normal','fire','water','electric','grass','ice',
  'fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon'] as const;
export const PAGE_SIZE = 20;

export const browserQuerySchema = z.object({
  q: z.string().trim().max(50).catch(''),
  types: z.array(z.enum(TYPE_NAMES)).catch([]),
  sort: z.enum(SORT_KEYS).catch('number'),
  dir: z.enum(['asc', 'desc']).catch('asc'),
  page: z.coerce.number().int().min(1).catch(1),
});
export type BrowserQuery = z.infer<typeof browserQuerySchema>;
```

`.catch(...)` guarantees a malformed URL degrades to defaults (resilient, non-throwing) — the page never renders raw input back as an error (SEC-012).

## Result shape (browser card)

```ts
{ id, national_dex_number, display_name, sprite_url, types: TypeName[], base_stat_total }
```
