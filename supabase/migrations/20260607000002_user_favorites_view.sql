-- Read model for the Favorites screen: each of the signed-in user's favorited
-- Pokémon projected as a browser card. security_invoker means the underlying
-- user_favorites RLS (user_id = auth.uid()) scopes the rows to the owner — the
-- explicit predicate is belt-and-suspenders. Mutations go straight to the
-- user_favorites table (owner-only insert/delete policies already exist).

create or replace view public.user_favorites_view
with (security_invoker = on) as
select
  pb.id,
  pb.national_dex_number,
  pb.display_name,
  pb.sprite_url,
  pb.types,
  pb.base_stat_total,
  uf.created_at
from public.user_favorites uf
join public.pokemon_browser pb on pb.id = uf.pokemon_id
where uf.user_id = auth.uid();

grant select on public.user_favorites_view to authenticated;
