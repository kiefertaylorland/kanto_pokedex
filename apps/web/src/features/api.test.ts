import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPokemonOptions } from '@/features/compare/api';
import { addFavorite, fetchFavoriteIds, fetchFavorites, removeFavorite } from '@/features/favorites/api';
import { fetchPokemonDetail } from '@/features/pokemon-detail/api';
import { fetchPokemonIndex, fetchPokemonPage } from '@/features/pokedex/api';
import { supabase } from '@/lib/supabase';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

type MockBuilder = Record<string, ReturnType<typeof vi.fn>>;

function createRangeBuilder(result: unknown) {
  const builder: MockBuilder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    ilike: vi.fn(() => builder),
    overlaps: vi.fn(() => builder),
    order: vi.fn(() => builder),
    range: vi.fn(() => Promise.resolve(result)),
  };
  return builder;
}

function createOrderBuilder(result: unknown) {
  const builder: MockBuilder = {
    select: vi.fn(() => builder),
    order: vi.fn(() => Promise.resolve(result)),
  };
  return builder;
}

function createMaybeSingleBuilder(result: unknown) {
  const builder: MockBuilder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    maybeSingle: vi.fn(() => Promise.resolve(result)),
  };
  return builder;
}

function createInsertBuilder(result: unknown) {
  const builder: MockBuilder = {
    insert: vi.fn(() => Promise.resolve(result)),
  };
  return builder;
}

describe('feature API helpers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('builds numeric pokedex queries and maps the response into cards', async () => {
    const builder = createRangeBuilder({
      data: [
        {
          id: 25,
          national_dex_number: 25,
          display_name: 'Pikachu',
          sprite_url: 'https://cdn/pika.png',
          types: ['electric'],
          base_stat_total: 320,
        },
      ],
      count: 1,
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue(builder as never);

    await expect(
      fetchPokemonPage({ q: '25', types: ['electric'], sort: 'name', dir: 'desc', page: 1 }),
    ).resolves.toEqual({
      items: [
        {
          id: 25,
          national_dex_number: 25,
          display_name: 'Pikachu',
          sprite_url: 'https://cdn/pika.png',
          types: ['electric'],
          base_stat_total: 320,
        },
      ],
      total: 1,
      page: 1,
      pageCount: 1,
    });

    expect(builder.eq).toHaveBeenCalledWith('national_dex_number', 25);
    expect(builder.overlaps).toHaveBeenCalledWith('types', ['electric']);
    expect(builder.order).toHaveBeenNthCalledWith(1, 'display_name', { ascending: false });
    expect(builder.range).toHaveBeenCalledWith(0, 13);
  });

  it('builds name queries and clamps an oversized page by refetching once', async () => {
    const first = createRangeBuilder({ data: [], count: 20, error: null });
    const second = createRangeBuilder({
      data: [
        {
          id: 1,
          national_dex_number: 1,
          display_name: 'Bulbasaur',
          sprite_url: null,
          types: ['grass', 'poison'],
          base_stat_total: 318,
        },
      ],
      count: 20,
      error: null,
    });
    vi.mocked(supabase.from)
      .mockReturnValueOnce(first as never)
      .mockReturnValueOnce(second as never);

    await expect(fetchPokemonPage({ q: 'Bulba', types: [], sort: 'number', dir: 'asc', page: 5 })).resolves.toEqual({
      items: [
        {
          id: 1,
          national_dex_number: 1,
          display_name: 'Bulbasaur',
          sprite_url: null,
          types: ['grass', 'poison'],
          base_stat_total: 318,
        },
      ],
      total: 20,
      page: 2,
      pageCount: 2,
    });

    expect(first.ilike).toHaveBeenCalledWith('display_name', '%bulba%');
    expect(second.range).toHaveBeenCalledWith(14, 27);
  });

  it('throws the first query error for the pokedex page', async () => {
    const error = new Error('boom');
    vi.mocked(supabase.from).mockReturnValue(createRangeBuilder({ data: null, count: 0, error }) as never);

    await expect(fetchPokemonPage({ q: '', types: [], sort: 'number', dir: 'asc', page: 1 })).rejects.toThrow('boom');
  });

  it('reads the full pokedex index and compare options', async () => {
    const indexBuilder = createOrderBuilder({
      data: [
        {
          id: 4,
          national_dex_number: 4,
          display_name: 'Charmander',
          sprite_url: 'https://cdn/charmander.png',
          types: null,
          base_stat_total: 309,
        },
      ],
      error: null,
    });
    const optionsBuilder = createOrderBuilder({
      data: [{ national_dex_number: 7, display_name: 'Squirtle' }],
      error: null,
    });
    vi.mocked(supabase.from)
      .mockReturnValueOnce(indexBuilder as never)
      .mockReturnValueOnce(optionsBuilder as never);

    await expect(fetchPokemonIndex()).resolves.toEqual([
      {
        id: 4,
        national_dex_number: 4,
        display_name: 'Charmander',
        sprite_url: 'https://cdn/charmander.png',
        types: [],
        base_stat_total: 309,
      },
    ]);
    await expect(fetchPokemonOptions()).resolves.toEqual([{ dex: 7, label: '№007 · Squirtle' }]);
  });

  it('reads detail rows, defaulting nullable collections to empty arrays', async () => {
    vi.mocked(supabase.from).mockReturnValue(
      createMaybeSingleBuilder({
        data: {
          id: 25,
          national_dex_number: 25,
          display_name: 'Pikachu',
          sprite_url: null,
          official_artwork_url: null,
          base_stat_total: 320,
          height: null,
          weight: null,
          flavor_text: null,
          types: null,
          stats: null,
          abilities: null,
          evolution_chain: null,
          encounters: null,
        },
        error: null,
      }) as never,
    );

    await expect(fetchPokemonDetail(25)).resolves.toEqual({
      id: 25,
      national_dex_number: 25,
      display_name: 'Pikachu',
      sprite_url: null,
      official_artwork_url: null,
      base_stat_total: 320,
      height: null,
      weight: null,
      flavor_text: null,
      types: [],
      stats: [],
      abilities: [],
      evolution_chain: [],
      encounters: [],
    });
  });

  it('returns null for missing detail rows and throws detail errors', async () => {
    vi.mocked(supabase.from)
      .mockReturnValueOnce(createMaybeSingleBuilder({ data: null, error: null }) as never)
      .mockReturnValueOnce(createMaybeSingleBuilder({ data: null, error: new Error('detail') }) as never);

    await expect(fetchPokemonDetail(151)).resolves.toBeNull();
    await expect(fetchPokemonDetail(1)).rejects.toThrow('detail');
  });

  it('maps favorites and favorite ids', async () => {
    const favoritesBuilder = createOrderBuilder({
      data: [
        {
          id: 133,
          national_dex_number: 133,
          display_name: 'Eevee',
          sprite_url: null,
          types: null,
          base_stat_total: 325,
          created_at: '2026-01-01',
        },
      ],
      error: null,
    });
    const idsBuilder = {
      select: vi.fn(() => Promise.resolve({ data: [{ pokemon_id: 25 }], error: null })),
    };
    vi.mocked(supabase.from)
      .mockReturnValueOnce(favoritesBuilder as never)
      .mockReturnValueOnce(idsBuilder as never);

    await expect(fetchFavorites()).resolves.toEqual([
      {
        id: 133,
        national_dex_number: 133,
        display_name: 'Eevee',
        sprite_url: null,
        types: [],
        base_stat_total: 325,
      },
    ]);
    await expect(fetchFavoriteIds()).resolves.toEqual([25]);
  });

  it('writes and removes favorites through the secured tables', async () => {
    const insertBuilder = createInsertBuilder({ error: null });
    const deleteBuilder: { delete: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn> } = {
      delete: vi.fn(() => deleteBuilder),
      eq: vi.fn(),
    };
    deleteBuilder.eq.mockReturnValueOnce(deleteBuilder).mockReturnValueOnce(Promise.resolve({ error: null }));
    vi.mocked(supabase.from)
      .mockReturnValueOnce(insertBuilder as never)
      .mockReturnValueOnce(deleteBuilder as never);

    await expect(addFavorite('user-1', 25)).resolves.toBeUndefined();
    await expect(removeFavorite('user-1', 25)).resolves.toBeUndefined();

    expect(insertBuilder.insert).toHaveBeenCalledWith({ user_id: 'user-1', pokemon_id: 25 });
    expect(deleteBuilder.delete).toHaveBeenCalledOnce();
  });

  it('throws favorite write and read errors', async () => {
    const favoritesErrorBuilder = createOrderBuilder({ data: null, error: new Error('favorites') });
    const idsErrorBuilder = {
      select: vi.fn(() => Promise.resolve({ data: null, error: new Error('ids') })),
    };
    const addErrorBuilder = createInsertBuilder({ error: new Error('insert') });
    const removeErrorBuilder: { delete: ReturnType<typeof vi.fn>; eq: ReturnType<typeof vi.fn> } = {
      delete: vi.fn(() => removeErrorBuilder),
      eq: vi.fn(),
    };
    removeErrorBuilder.eq
      .mockReturnValueOnce(removeErrorBuilder)
      .mockReturnValueOnce(Promise.resolve({ error: new Error('remove') }));
    vi.mocked(supabase.from)
      .mockReturnValueOnce(favoritesErrorBuilder as never)
      .mockReturnValueOnce(idsErrorBuilder as never)
      .mockReturnValueOnce(addErrorBuilder as never)
      .mockReturnValueOnce(removeErrorBuilder as never);

    await expect(fetchFavorites()).rejects.toThrow('favorites');
    await expect(fetchFavoriteIds()).rejects.toThrow('ids');
    await expect(addFavorite('user-1', 25)).rejects.toThrow('insert');
    await expect(removeFavorite('user-1', 25)).rejects.toThrow('remove');
  });
});
