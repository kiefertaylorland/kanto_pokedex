import { createClient } from '@supabase/supabase-js';
import { env } from './env';

/**
 * Browser Supabase client. Uses ONLY the anon key (SEC-005). The session is
 * stored in localStorage and attached as an `Authorization: Bearer` header —
 * not an ambient cookie — so classic CSRF does not apply (SEC-015).
 *
 * `autoRefreshToken` + `persistSession` give short-lived access tokens with
 * rotating refresh (SEC-003); on refresh failure the auth guard redirects.
 */
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
