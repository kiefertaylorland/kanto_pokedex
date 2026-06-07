-- Reference + curated tables: RLS enabled, authenticated SELECT only. No client
-- INSERT/UPDATE/DELETE policy exists, so writes are denied to anon/authenticated
-- roles; only the service role (sync function) bypasses RLS to write.
-- sync_runs has RLS enabled with NO policy → no client access at all (SEC-014).

do $$
declare
  t text;
  read_only_tables text[] := array[
    'pokemon', 'pokemon_species', 'types', 'pokemon_types', 'stats',
    'pokemon_stats', 'abilities', 'pokemon_abilities', 'evolution_chains',
    'evolution_links', 'locations', 'location_areas', 'pokemon_encounters',
    'kanto_locations', 'kanto_map_points'
  ];
begin
  foreach t in array read_only_tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (true);',
      t || '_authenticated_read', t
    );
  end loop;

  -- sync_runs: RLS on, no policy → fully server-only.
  execute 'alter table public.sync_runs enable row level security;';
end;
$$;
