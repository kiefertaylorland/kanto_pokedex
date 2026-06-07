import { createClient } from '@supabase/supabase-js';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Mints a real Supabase session for a test user so the smoke spec can inject it
 * into localStorage and exercise the authenticated journey — without driving an
 * external OAuth provider. Uses a capturing storage adapter so the persisted
 * key/value EXACTLY match what @supabase/supabase-js expects at runtime.
 *
 * No-ops (writes no session file → smoke spec skips) unless a test backend is
 * configured via env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY.
 */
const here = dirname(fileURLToPath(import.meta.url));
export const SESSION_FILE = resolve(here, '.auth/session.json');

const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? 'kanto-e2e@example.test';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? 'e2e-Sup3r-Secret-Pass!';

export default async function globalSetup() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  rmSync(SESSION_FILE, { force: true });

  if (!url || !serviceKey || !anonKey) {
    console.warn('[e2e] No test backend configured — authenticated smoke will be skipped.');
    return;
  }

  // Ensure a confirmed test user exists (admin). Password sign-in is test-only;
  // the app itself never stores or handles passwords (SEC-006).
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  await admin.auth.admin.createUser({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    email_confirm: true,
  });

  // Sign in with a capturing storage adapter to learn the exact persisted entry.
  const captured: { key?: string; value?: string } = {};
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storage: {
        getItem: () => null,
        setItem: (k: string, v: string) => {
          captured.key = k;
          captured.value = v;
        },
        removeItem: () => {},
      },
    },
  });

  const { error } = await client.auth.signInWithPassword({ email: TEST_EMAIL, password: TEST_PASSWORD });
  if (error || !captured.key || !captured.value) {
    console.warn('[e2e] Could not mint a test session — skipping authenticated smoke.', error?.message);
    return;
  }

  mkdirSync(dirname(SESSION_FILE), { recursive: true });
  writeFileSync(SESSION_FILE, JSON.stringify({ storageKey: captured.key, value: captured.value }), 'utf8');
  console.log('[e2e] Test session minted; authenticated smoke enabled.');
}
