-- RLS policy tests (SEC-004, SC-011): prove a user cannot read or modify another
-- user's rows, that anon cannot read user data, and that the new-user trigger
-- provisions a profile. Run with: `supabase test db`.

begin;
select plan(7);

-- Two synthetic auth users. Inserting fires handle_new_user → profiles.
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@test.dev'),
  ('22222222-2222-2222-2222-222222222222', 'b@test.dev');

select is(
  (select count(*)::int from public.profiles
     where id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222')),
  2,
  'new-user trigger provisioned a profile for each auth user (SEC-006)'
);

insert into public.user_preferences (user_id, default_sort) values
  ('22222222-2222-2222-2222-222222222222', 'name');

-- Act as user A (authenticated role + JWT sub = A).
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);

select is(
  (select count(*)::int from public.profiles),
  1,
  'user A sees only their own profile row (RLS read isolation)'
);
select is(
  (select id from public.profiles)::text,
  '11111111-1111-1111-1111-111111111111',
  'and the visible row is A''s own'
);
select is(
  (select count(*)::int from public.user_preferences),
  0,
  'user A cannot see user B''s preferences (IDOR prevented)'
);

-- A attempts to tamper with B's profile; RLS should make this a no-op.
update public.profiles set display_name = 'hacked-by-a'
  where id = '22222222-2222-2222-2222-222222222222';

-- Back to superuser to verify B's row is untouched.
reset role;
select set_config('request.jwt.claims', NULL, true);
select is(
  (select display_name from public.profiles where id = '22222222-2222-2222-2222-222222222222'),
  NULL,
  'user A could not modify user B''s profile (RLS write isolation)'
);

-- Anonymous role must not read user-owned data.
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is(
  (select count(*)::int from public.profiles),
  0,
  'anonymous role cannot read any profiles'
);

-- Authenticated users CAN read reference data (curated map is seeded).
reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
select ok(
  (select count(*) from public.kanto_locations) > 0,
  'authenticated role can read reference/curated tables'
);

reset role;
select * from finish();
rollback;
