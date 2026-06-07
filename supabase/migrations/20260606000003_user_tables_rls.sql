-- User-owned tables with Row-Level Security (SEC-004). Each row is owned by an
-- authenticated user; policies restrict all access to the owner. profiles holds
-- only a NON-credential row (SEC-006) — no passwords anywhere in the app.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  default_sort text,
  default_view text,
  theme text,
  updated_at timestamptz not null default now()
);

-- Phase-2 (product) favorites table, RLS-ready from day one.
create table if not exists public.user_favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  pokemon_id integer not null references public.pokemon (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, pokemon_id)
);

alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_favorites enable row level security;

-- profiles: owner-only read/insert/update (no delete; cascade handles account removal).
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- user_preferences: owner-only.
create policy "prefs_select_own" on public.user_preferences
  for select using (user_id = auth.uid());
create policy "prefs_insert_own" on public.user_preferences
  for insert with check (user_id = auth.uid());
create policy "prefs_update_own" on public.user_preferences
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- user_favorites: owner-only read/insert/delete.
create policy "favorites_select_own" on public.user_favorites
  for select using (user_id = auth.uid());
create policy "favorites_insert_own" on public.user_favorites
  for insert with check (user_id = auth.uid());
create policy "favorites_delete_own" on public.user_favorites
  for delete using (user_id = auth.uid());

-- Auto-provision a profile row when an auth user is created (SEC-006: stores
-- only non-credential fields lifted from OAuth metadata).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
