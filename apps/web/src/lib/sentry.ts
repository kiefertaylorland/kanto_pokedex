import * as Sentry from '@sentry/react';
import { env } from './env';

const TOKEN_KEYS = ['access_token', 'refresh_token', 'authorization', 'apikey', 'token', 'password'];

/**
 * Initialize Sentry with aggressive scrubbing (SEC-013). `beforeSend` strips
 * auth tokens, the apikey header, and obvious PII before any event leaves the
 * browser. No-ops when no DSN is configured.
 */
export function initSentry(): void {
  if (!env.VITE_SENTRY_DSN) return;
  Sentry.init({
    dsn: env.VITE_SENTRY_DSN,
    environment: env.VITE_APP_ENV,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    beforeSend(event) {
      scrub(event.request?.headers);
      scrub(event.extra);
      if (event.request?.cookies) delete event.request.cookies;
      if (event.user) {
        // Keep only a coarse, non-identifying id; drop email/ip.
        event.user = event.user.id ? { id: '[redacted]' } : {};
      }
      return event;
    },
  });
}

function scrub(obj: Record<string, unknown> | undefined): void {
  if (!obj) return;
  for (const key of Object.keys(obj)) {
    if (TOKEN_KEYS.some((t) => key.toLowerCase().includes(t))) {
      obj[key] = '[redacted]';
    }
  }
}
