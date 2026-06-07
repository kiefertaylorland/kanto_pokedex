-- Relocate pg_net out of the public schema (lint 0014_extension_in_public).
--
-- pg_net does NOT support `alter extension ... set schema`, so it must be
-- dropped and recreated in the `extensions` schema. pg_net exposes its callable
-- API in a dedicated `net` schema (recreated on reinstall) regardless of the
-- extension's home schema, so net.http_post(...) — used by the
-- `sync-pokeapi-weekly` pg_cron job, which is stored as text and re-resolves at
-- run time — keeps working unchanged. Supabase's `grant_pg_net_access` event
-- trigger re-applies the required grants automatically on CREATE EXTENSION.
drop extension if exists pg_net;
create extension if not exists pg_net with schema extensions;
