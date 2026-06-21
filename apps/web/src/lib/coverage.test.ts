import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DataError, toUserMessage } from './errors';
import { queryKeys } from './queryKeys';
import { track } from './analytics';

const init = vi.fn();
const createClient = vi.fn();

vi.mock('@sentry/react', () => ({ init }));
vi.mock('@supabase/supabase-js', () => ({ createClient }));

describe('lib coverage sweep', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    init.mockReset();
    createClient.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('dispatches analytics events through the window', () => {
    const dispatch = vi.spyOn(window, 'dispatchEvent');

    track('favorites_viewed');

    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'kanto:analytics' }));
  });

  it('maps errors to safe user messages and exposes stable query keys', () => {
    expect(toUserMessage({ code: 'PGRST301' })).toBe('Your session has expired. Please sign in again.');
    expect(toUserMessage({ code: 'PGRST999' })).toBe('We could not load this data right now. Please try again.');
    expect(toUserMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');

    const err = new DataError('Generic');
    expect(err.name).toBe('DataError');
    expect(queryKeys.pokemon.all).toEqual(['pokemon']);
    expect(queryKeys.pokemon.list({ q: 'pikachu', types: ['electric'], sort: 'name', dir: 'asc', page: 2 })).toEqual([
      'pokemon',
      'list',
      { q: 'pikachu', types: ['electric'], sort: 'name', dir: 'asc', page: 2 },
    ]);
    expect(queryKeys.pokemon.index()).toEqual(['pokemon', 'index']);
    expect(queryKeys.pokemon.detail(25)).toEqual(['pokemon', 'detail', 25]);
    expect(queryKeys.session).toEqual(['session']);
  });

  it('loads fallback env values in test mode and validates configured values', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', undefined);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', undefined);
    vi.stubEnv('VITE_SENTRY_DSN', undefined);
    vi.stubEnv('VITE_APP_ENV', undefined);

    const fallback = await import('./env');
    expect(fallback.SUPABASE_URL).toBe('http://localhost:54321');
    expect(fallback.env.VITE_APP_ENV).toBe('local');

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('VITE_SENTRY_DSN', 'https://dsn.example/1');
    vi.stubEnv('VITE_APP_ENV', 'preview');

    const configured = await import('./env');
    expect(configured.SUPABASE_URL).toBe('https://example.supabase.co');
    expect(configured.env.VITE_APP_ENV).toBe('preview');
  });

  it('throws a generic configuration error outside test mode when env is missing', async () => {
    vi.stubEnv('MODE', 'production');
    vi.stubEnv('VITE_SUPABASE_URL', undefined);
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', undefined);

    await expect(import('./env')).rejects.toThrow(
      'Application is not configured. Missing required public environment variables.',
    );
  });

  it('initializes Sentry only when a DSN is configured and scrubs secrets', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('VITE_SENTRY_DSN', '');
    vi.stubEnv('VITE_APP_ENV', 'local');

    const noDsn = await import('./sentry');
    noDsn.initSentry();
    expect(init).not.toHaveBeenCalled();

    vi.resetModules();
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('VITE_SENTRY_DSN', 'https://dsn.example/1');
    vi.stubEnv('VITE_APP_ENV', 'production');

    const sentry = await import('./sentry');
    sentry.initSentry();

    expect(init).toHaveBeenCalledOnce();
    const config = init.mock.calls[0]?.[0];
    expect(config).toMatchObject({
      dsn: 'https://dsn.example/1',
      environment: 'production',
      sendDefaultPii: false,
    });

    const event = config.beforeSend({
      request: {
        headers: { Authorization: 'secret', 'x-apikey': 'secret' },
        cookies: 'session=secret',
      },
      extra: { refresh_token: 'secret', note: 'ok' },
      user: { id: '123', email: 'misty@kanto.dev' },
    });
    expect(event.request.headers.Authorization).toBe('[redacted]');
    expect(event.request.headers['x-apikey']).toBe('[redacted]');
    expect(event.request.cookies).toBeUndefined();
    expect(event.extra.refresh_token).toBe('[redacted]');
    expect(event.user).toEqual({ id: '[redacted]' });
  });

  it('creates the browser Supabase client with the expected auth options', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');
    vi.stubEnv('VITE_SENTRY_DSN', '');
    vi.stubEnv('VITE_APP_ENV', 'local');
    createClient.mockReturnValue({ fake: true });

    const mod = await import('./supabase');

    expect(createClient).toHaveBeenCalledWith('https://example.supabase.co', 'anon-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
    expect(mod.supabase).toEqual({ fake: true });
  });
});
