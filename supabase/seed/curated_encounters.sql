-- Curated Pokémon→Kanto-location encounters (product data, confidence 'curated'
-- / 'inferred'). Run AFTER the sync has populated `pokemon` (these rows FK to it).
--
--   psql "$DATABASE_URL" -f supabase/seed/curated_encounters.sql
--
-- Idempotent: clears the curated/inferred set, then re-inserts. PokéAPI-sourced
-- encounters (confidence 'pokeapi') are left untouched.

begin;

delete from public.pokemon_encounters where confidence in ('curated', 'inferred');

insert into public.pokemon_encounters (pokemon_id, kanto_location_id, method, confidence, notes)
select p.id, kl.id, v.method, v.confidence, v.notes
from (values
  -- dex, location slug, method, confidence, notes
  (16, 'route-1',         'Walking', 'curated',  'Common in the grass north of Pallet Town.'),
  (19, 'route-1',         'Walking', 'curated',  'Frequently seen on Route 1.'),
  (10, 'viridian-forest', 'Walking', 'curated',  'Abundant among the trees.'),
  (13, 'viridian-forest', 'Walking', 'curated',  'Abundant among the trees.'),
  (25, 'viridian-forest', 'Walking', 'inferred', 'Rarely spotted in the forest.'),
  (35, 'mt-moon',         'Walking', 'curated',  'Appears deep within the cave at night.'),
  (74, 'mt-moon',         'Walking', 'curated',  'Found throughout the cave.'),
  (41, 'mt-moon',         'Walking', 'curated',  'Common in the cave tunnels.'),
  (129,'cerulean-city',   'Old Rod', 'curated',  'Caught by fishing near the city.'),
  (54, 'celadon-city',    'Surfing', 'inferred', 'Seen on the water near Celadon.'),
  (81, 'power-plant',     'Walking', 'curated',  'Inhabits the abandoned plant.'),
  (100,'power-plant',     'Walking', 'curated',  'Inhabits the abandoned plant.'),
  (125,'power-plant',     'Walking', 'inferred', 'Rare sightings among the machinery.'),
  (92, 'lavender-town',   'Walking', 'curated',  'Drifts around the Pokémon Tower.'),
  (104,'lavender-town',   'Walking', 'curated',  'Lurks near the tower.'),
  (86, 'seafoam-islands', 'Surfing', 'curated',  'Rests on the frozen shores.'),
  (87, 'seafoam-islands', 'Surfing', 'curated',  'Swims in the cold waters.'),
  (118,'vermilion-city',  'Old Rod', 'curated',  'Hooked while fishing at the port.'),
  (1,  'pallet-town',     'Gift',    'curated',  'A starter Pokémon from Prof. Oak.'),
  (4,  'pallet-town',     'Gift',    'curated',  'A starter Pokémon from Prof. Oak.'),
  (7,  'pallet-town',     'Gift',    'curated',  'A starter Pokémon from Prof. Oak.'),
  (143,'celadon-city',    'Gift',    'inferred', 'Reportedly found resting nearby.'),
  (150,'victory-road',    'Special', 'inferred', 'Rumored to dwell deep within.')
) as v(dex, slug, method, confidence, notes)
join public.pokemon p on p.national_dex_number = v.dex
join public.kanto_locations kl on kl.slug = v.slug;

commit;
