-- Weekly schedule for the PokéAPI sync (SEC-014: scheduled, server-only).
-- Apply against the project DB once secrets are configured. Requires the
-- `pg_cron` and `pg_net` extensions (available on Supabase).
--
-- The function is invoked with the SYNC_SECRET as a bearer token so only this
-- scheduled job (and an admin holding the secret) can trigger a sync.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Store the trigger secret + function URL in Vault (do NOT hardcode here).
--   select vault.create_secret('<SYNC_SECRET>', 'sync_secret');
--   select vault.create_secret('https://<ref>.functions.supabase.co/sync-pokeapi', 'sync_url');

select cron.schedule(
  'sync-pokeapi-weekly',
  '0 6 * * 1', -- 06:00 UTC every Monday
  $$
  select net.http_post(
    url     := (select decrypted_secret from vault.decrypted_secrets where name = 'sync_url'),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'sync_secret')
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- To remove: select cron.unschedule('sync-pokeapi-weekly');
