-- sync_runs is a server-only audit table written exclusively by the
-- sync-pokeapi edge function via the service role (which bypasses RLS).
-- RLS was enabled with no policy (SEC-014), which already denies all client
-- access. This explicit deny-all policy makes that intent visible in the
-- schema and clears the "RLS enabled, no policy" advisor warning. Behavior
-- is unchanged: no anon/authenticated client can read or write this table.
create policy "sync_runs_no_client_access"
  on public.sync_runs
  for all
  to authenticated, anon
  using (false)
  with check (false);
