import { z } from 'zod';

/**
 * Client environment. Only VITE_-prefixed (public) values exist here (SEC-005).
 * A missing Supabase URL/key throws early in non-test builds so we never ship a
 * silently-misconfigured client.
 */
const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SENTRY_DSN: z.string().optional().default(''),
  VITE_APP_ENV: z.enum(['local', 'preview', 'production']).optional().default('local'),
});

const raw = {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
};

function loadEnv() {
  const parsed = envSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  // In test mode, fall back to harmless placeholders so component tests run
  // without a real Supabase project.
  if (import.meta.env.MODE === 'test') {
    return envSchema.parse({
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    });
  }
  // Generic, non-leaking message (SEC-012).
  throw new Error('Application is not configured. Missing required public environment variables.');
}

export const env = loadEnv();
export const SUPABASE_URL = env.VITE_SUPABASE_URL;
