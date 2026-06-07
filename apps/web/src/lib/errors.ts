/**
 * Maps any thrown/queried error to a generic, user-safe message (SEC-012).
 * Raw Supabase/Postgres errors, stack traces, and internal identifiers are
 * never surfaced to the UI — they go to Sentry (scrubbed) instead.
 */
export function toUserMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code ?? '');
    if (code === 'PGRST301' || code === '401') return 'Your session has expired. Please sign in again.';
    if (code.startsWith('PGRST')) return 'We could not load this data right now. Please try again.';
  }
  return 'Something went wrong. Please try again.';
}

/** Stable, generic error used by query error boundaries. */
export class DataError extends Error {
  constructor(public readonly userMessage: string) {
    super(userMessage);
    this.name = 'DataError';
  }
}
