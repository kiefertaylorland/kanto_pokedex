-- Spread visual labels around dense map clusters so location names do not
-- overlap markers or clip at the SVG edge.
update public.kanto_map_points mp
set label_anchor = v.label_anchor
from public.kanto_locations kl
join (values
  ('pallet-town',      'top'),
  ('route-1',          'right'),
  ('viridian-city',    'bottom'),
  ('viridian-forest',  'right'),
  ('pewter-city',      'right'),
  ('mt-moon',          'top'),
  ('cerulean-city',    'top'),
  ('vermilion-city',   'bottom'),
  ('lavender-town',    'top-right'),
  ('celadon-city',     'left'),
  ('saffron-city',     'bottom'),
  ('fuchsia-city',     'top-right'),
  ('cinnabar-island',  'top-right'),
  ('seafoam-islands',  'top-right'),
  ('power-plant',      'right'),
  ('victory-road',     'bottom-right'),
  ('indigo-plateau',   'bottom-right')
) as v(slug, label_anchor) on v.slug = kl.slug
where mp.kanto_location_id = kl.id;
