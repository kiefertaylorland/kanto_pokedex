-- Read-model views for the three MVP query shapes (docs/07 §10). All use
-- security_invoker so the querying user's RLS applies (authenticated read on
-- the underlying reference/curated tables). No string SQL reaches these from
-- the app — the client selects from the view via the query builder (SEC-008).

-- Browser card view: one row per Pokémon with its type-name array (FR-009).
create or replace view public.pokemon_browser
with (security_invoker = on) as
select
  p.id,
  p.national_dex_number,
  p.display_name,
  p.sprite_url,
  p.base_stat_total,
  coalesce(
    array_agg(t.name order by pt.slot) filter (where t.name is not null),
    '{}'::text[]
  ) as types
from public.pokemon p
left join public.pokemon_types pt on pt.pokemon_id = p.id
left join public.types t on t.id = pt.type_id
group by p.id;

-- Detail view: aggregated stats / abilities / evolution / encounters (FR-016..026).
create or replace view public.pokemon_detail
with (security_invoker = on) as
select
  p.id,
  p.national_dex_number,
  p.display_name,
  p.sprite_url,
  p.official_artwork_url,
  p.base_stat_total,
  p.height,
  p.weight,
  sp.flavor_text,
  (select coalesce(array_agg(t.name order by pt.slot), '{}'::text[])
     from public.pokemon_types pt
     join public.types t on t.id = pt.type_id
     where pt.pokemon_id = p.id) as types,
  (select coalesce(jsonb_agg(
       jsonb_build_object('key', st.name, 'base_stat', ps.base_stat)
       order by st.sort_order), '[]'::jsonb)
     from public.pokemon_stats ps
     join public.stats st on st.id = ps.stat_id
     where ps.pokemon_id = p.id) as stats,
  (select coalesce(jsonb_agg(
       jsonb_build_object('name', a.name, 'display_name', a.display_name,
                          'is_hidden', pa.is_hidden, 'slot', pa.slot)
       order by pa.slot), '[]'::jsonb)
     from public.pokemon_abilities pa
     join public.abilities a on a.id = pa.ability_id
     where pa.pokemon_id = p.id) as abilities,
  (select coalesce(jsonb_agg(
       jsonb_build_object(
         'species_id', p2.national_dex_number,
         'display_name', p2.display_name,
         'trigger', el.trigger,
         'min_level', el.min_level,
         'item_name', el.item_name)
       order by p2.national_dex_number), '[]'::jsonb)
     from public.pokemon p2
     join public.pokemon_species s2 on s2.id = p2.species_id
     left join public.evolution_links el
       on el.to_species_id = s2.id and el.chain_id = sp.evolution_chain_id
     where sp.evolution_chain_id is not null
       and s2.evolution_chain_id = sp.evolution_chain_id) as evolution_chain,
  (select coalesce(jsonb_agg(
       jsonb_build_object(
         'kanto_location_id', e.kanto_location_id,
         'location_display_name', kl.display_name,
         'method', e.method,
         'confidence', e.confidence,
         'notes', e.notes)), '[]'::jsonb)
     from public.pokemon_encounters e
     left join public.kanto_locations kl on kl.id = e.kanto_location_id
     where e.pokemon_id = p.id) as encounters
from public.pokemon p
left join public.pokemon_species sp on sp.id = p.species_id;

-- Map view: each curated location + its point + nested encounters with Pokémon
-- cards and provenance labels (FR-027..032).
create or replace view public.kanto_map_view
with (security_invoker = on) as
select
  kl.id as location_id,
  kl.slug,
  kl.display_name,
  kl.location_type,
  kl.description,
  mp.id as point_id,
  mp.x,
  mp.y,
  mp.label_anchor,
  mp.marker_type,
  (select coalesce(jsonb_agg(
       jsonb_build_object(
         'kanto_location_id', e.kanto_location_id,
         'location_display_name', kl.display_name,
         'method', e.method,
         'confidence', e.confidence,
         'notes', e.notes,
         'pokemon', jsonb_build_object(
           'id', p.id,
           'national_dex_number', p.national_dex_number,
           'display_name', p.display_name,
           'sprite_url', p.sprite_url,
           'base_stat_total', p.base_stat_total,
           'types', (select coalesce(jsonb_agg(t.name order by pt.slot), '[]'::jsonb)
                       from public.pokemon_types pt
                       join public.types t on t.id = pt.type_id
                       where pt.pokemon_id = p.id)))
       order by p.national_dex_number), '[]'::jsonb)
     from public.pokemon_encounters e
     join public.pokemon p on p.id = e.pokemon_id
     where e.kanto_location_id = kl.id) as encounters
from public.kanto_locations kl
join public.kanto_map_points mp on mp.kanto_location_id = kl.id;

grant select on public.pokemon_browser to authenticated;
grant select on public.pokemon_detail to authenticated;
grant select on public.kanto_map_view to authenticated;
