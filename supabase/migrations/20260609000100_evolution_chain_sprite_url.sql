-- Include per-stage sprites in the pokemon_detail evolution_chain payload so
-- the detail page can render actual Pokémon sprites instead of placeholders.

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
         'sprite_url', p2.sprite_url,
         'trigger', el.trigger,
         'min_level', el.min_level,
         'item_name', el.item_name,
         'from_species_id', (
           select p3.national_dex_number from public.pokemon p3
           where p3.species_id = el.from_species_id))
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

grant select on public.pokemon_detail to authenticated;
