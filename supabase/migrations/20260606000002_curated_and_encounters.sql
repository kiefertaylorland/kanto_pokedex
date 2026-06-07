-- Curated, product-owned map layer + encounters + sync history.
-- The PokéAPI sync MUST NEVER write kanto_locations / kanto_map_points
-- (SEC-014): they are populated by seed/migration only.

create table if not exists public.kanto_locations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  location_type text not null,
  description text,
  source_status text not null default 'curated',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint kanto_locations_type_check
    check (location_type in ('city', 'route', 'cave', 'forest', 'water', 'special'))
);

create table if not exists public.kanto_map_points (
  id uuid primary key default gen_random_uuid(),
  kanto_location_id uuid not null references public.kanto_locations (id) on delete cascade,
  x numeric not null,
  y numeric not null,
  width numeric,
  height numeric,
  label_anchor text,
  zoom_group text,
  marker_type text not null,
  unique (kanto_location_id)
);

create table if not exists public.pokemon_encounters (
  id uuid primary key default gen_random_uuid(),
  pokemon_id integer not null references public.pokemon (id) on delete cascade,
  location_id integer references public.locations (id) on delete set null,
  location_area_id integer references public.location_areas (id) on delete set null,
  kanto_location_id uuid references public.kanto_locations (id) on delete set null,
  version text,
  method text,
  min_level integer,
  max_level integer,
  chance integer,
  confidence text not null,
  notes text,
  raw_payload jsonb,
  constraint pokemon_encounters_confidence_check
    check (confidence in ('pokeapi', 'curated', 'inferred', 'unknown'))
);

create table if not exists public.sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'pokeapi',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  records_processed integer,
  error_message text,
  metadata jsonb,
  constraint sync_runs_status_check check (status in ('running', 'success', 'failed'))
);

create index if not exists idx_encounters_pokemon on public.pokemon_encounters (pokemon_id);
create index if not exists idx_encounters_kanto_location on public.pokemon_encounters (kanto_location_id);
create index if not exists idx_map_points_location on public.kanto_map_points (kanto_location_id);
create index if not exists idx_sync_runs_started on public.sync_runs (started_at desc);
