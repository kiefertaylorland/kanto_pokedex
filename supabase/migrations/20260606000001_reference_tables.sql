-- Reference (PokéAPI-sourced) tables. Written only by the sync edge function
-- (service role). Authenticated clients may SELECT only (policies added in a
-- later migration). Schema mirrors docs/07-data-model.md §4.

create table if not exists public.pokemon_species (
  id integer primary key,
  name text not null,
  generation text,
  habitat text,
  color text,
  shape text,
  flavor_text text,
  evolution_chain_id integer,
  raw_payload jsonb,
  last_synced_at timestamptz not null default now()
);

create table if not exists public.evolution_chains (
  id integer primary key,
  raw_payload jsonb,
  last_synced_at timestamptz not null default now()
);

create table if not exists public.evolution_links (
  id uuid primary key default gen_random_uuid(),
  chain_id integer not null references public.evolution_chains (id) on delete cascade,
  from_species_id integer,
  to_species_id integer not null,
  trigger text,
  min_level integer,
  item_name text,
  conditions jsonb
);

create table if not exists public.pokemon (
  id integer primary key,
  national_dex_number integer not null,
  name text not null,
  display_name text not null,
  height integer,
  weight integer,
  base_experience integer,
  sprite_url text,
  official_artwork_url text,
  species_id integer references public.pokemon_species (id) on delete set null,
  base_stat_total integer not null default 0,
  raw_payload jsonb,
  last_synced_at timestamptz not null default now(),
  constraint pokemon_dex_range check (national_dex_number between 1 and 151)
);

create table if not exists public.types (
  id integer primary key,
  name text not null unique,
  display_name text not null,
  raw_payload jsonb
);

create table if not exists public.pokemon_types (
  pokemon_id integer not null references public.pokemon (id) on delete cascade,
  type_id integer not null references public.types (id) on delete cascade,
  slot integer not null,
  primary key (pokemon_id, slot)
);

create table if not exists public.stats (
  id integer primary key,
  name text not null unique,
  display_name text not null,
  sort_order integer not null
);

create table if not exists public.pokemon_stats (
  pokemon_id integer not null references public.pokemon (id) on delete cascade,
  stat_id integer not null references public.stats (id) on delete cascade,
  base_stat integer not null,
  effort integer,
  primary key (pokemon_id, stat_id)
);

create table if not exists public.abilities (
  id integer primary key,
  name text not null unique,
  display_name text not null,
  effect_summary text,
  raw_payload jsonb
);

create table if not exists public.pokemon_abilities (
  pokemon_id integer not null references public.pokemon (id) on delete cascade,
  ability_id integer not null references public.abilities (id) on delete cascade,
  slot integer not null,
  is_hidden boolean not null default false,
  primary key (pokemon_id, ability_id)
);

create table if not exists public.locations (
  id integer primary key,
  name text not null,
  display_name text not null,
  region_name text,
  raw_payload jsonb
);

create table if not exists public.location_areas (
  id integer primary key,
  location_id integer not null references public.locations (id) on delete cascade,
  name text not null,
  display_name text not null,
  raw_payload jsonb
);

-- Indexes supporting browser sort/search, type filtering, and detail joins
-- (docs/07 §6).
create index if not exists idx_pokemon_dex on public.pokemon (national_dex_number);
create index if not exists idx_pokemon_name on public.pokemon (name);
create index if not exists idx_pokemon_bst on public.pokemon (base_stat_total);
create index if not exists idx_pokemon_types_type on public.pokemon_types (type_id);
create index if not exists idx_pokemon_stats_pokemon on public.pokemon_stats (pokemon_id);
create index if not exists idx_pokemon_abilities_pokemon on public.pokemon_abilities (pokemon_id);
create index if not exists idx_evolution_links_chain on public.evolution_links (chain_id);
