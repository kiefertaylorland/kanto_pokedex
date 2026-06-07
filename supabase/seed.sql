-- Curated, product-owned Kanto map layer (SEC-014: never written by the sync).
-- Coordinates live in the SVG's 0–100 viewBox space. Idempotent: safe to re-run
-- via `supabase db reset`.

insert into public.kanto_locations (slug, display_name, location_type, description, source_status) values
  ('pallet-town',      'Pallet Town',       'city',    'A quiet town where many trainers begin their journey.', 'curated'),
  ('route-1',          'Route 1',           'route',   'The grassy path north of Pallet Town.',                 'curated'),
  ('viridian-city',    'Viridian City',     'city',    'The eternally green paradise.',                          'curated'),
  ('viridian-forest',  'Viridian Forest',   'forest',  'A maze-like forest teeming with Bug Pokémon.',           'curated'),
  ('pewter-city',      'Pewter City',       'city',    'A city of stone, home to the Rock-type Gym.',            'curated'),
  ('mt-moon',          'Mt. Moon',          'cave',    'A mountain cave known for fossils and Clefairy.',        'curated'),
  ('cerulean-city',    'Cerulean City',     'city',    'A city of water near the coast.',                        'curated'),
  ('vermilion-city',   'Vermilion City',    'city',    'A port city of the sea breeze.',                         'curated'),
  ('lavender-town',    'Lavender Town',     'special', 'A solemn town with the Pokémon Tower.',                  'curated'),
  ('celadon-city',     'Celadon City',      'city',    'The bustling department-store city.',                    'curated'),
  ('saffron-city',     'Saffron City',      'city',    'A central hub of commerce and psychics.',                'curated'),
  ('fuchsia-city',     'Fuchsia City',      'city',    'Home to the Safari Zone.',                               'curated'),
  ('cinnabar-island',  'Cinnabar Island',   'water',   'A volcanic island with a research lab.',                 'curated'),
  ('seafoam-islands',  'Seafoam Islands',   'cave',    'Frozen sea caves in the south.',                         'curated'),
  ('power-plant',      'Power Plant',       'special', 'An abandoned plant humming with Electric Pokémon.',      'curated'),
  ('victory-road',     'Victory Road',      'cave',    'The final trial before the Pokémon League.',             'curated'),
  ('indigo-plateau',   'Indigo Plateau',    'special', 'Where the Elite Four await.',                            'curated')
on conflict (slug) do nothing;

insert into public.kanto_map_points (kanto_location_id, x, y, label_anchor, marker_type)
select kl.id, v.x, v.y, v.label_anchor, v.marker_type
from (values
  ('pallet-town',     20::numeric, 90::numeric, 'top',          'city'),
  ('route-1',         20::numeric, 82::numeric, 'right',        'route'),
  ('viridian-city',   20::numeric, 74::numeric, 'bottom',       'city'),
  ('viridian-forest', 20::numeric, 64::numeric, 'right',        'forest'),
  ('pewter-city',     20::numeric, 54::numeric, 'right',        'city'),
  ('mt-moon',         32::numeric, 50::numeric, 'top',          'cave'),
  ('cerulean-city',   46::numeric, 48::numeric, 'top',          'city'),
  ('power-plant',     58::numeric, 52::numeric, 'right',        'special'),
  ('saffron-city',    46::numeric, 62::numeric, 'bottom',       'city'),
  ('vermilion-city',  46::numeric, 76::numeric, 'bottom',       'city'),
  ('lavender-town',   62::numeric, 62::numeric, 'top-right',    'special'),
  ('celadon-city',    34::numeric, 62::numeric, 'left',         'city'),
  ('fuchsia-city',    44::numeric, 90::numeric, 'top-right',    'city'),
  ('seafoam-islands', 36::numeric, 95::numeric, 'top-right',    'cave'),
  ('cinnabar-island', 20::numeric, 96::numeric, 'top-right',    'water'),
  ('victory-road',    8::numeric,  52::numeric, 'bottom-right', 'cave'),
  ('indigo-plateau',  6::numeric,  46::numeric, 'bottom-right', 'special')
) as v(slug, x, y, label_anchor, marker_type)
join public.kanto_locations kl on kl.slug = v.slug
on conflict (kanto_location_id) do update
set x = excluded.x,
    y = excluded.y,
    label_anchor = excluded.label_anchor,
    marker_type = excluded.marker_type;
