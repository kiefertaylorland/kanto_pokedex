import { describe, it, expect, vi, afterEach } from 'vitest';
import { onRequestGet } from './health';

describe('GET /api/health (Pages Function)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns 200 with a generic JSON body and no-store caching', async () => {
    const response = onRequestGet({ request: new Request('https://example.com/api/health') });

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Cache-Control')).toBe('no-store');

    const body = (await response.json()) as { status: string; time: string };
    expect(body.status).toBe('ok');
    // Body stays generic (SEC-012): exactly the two expected keys, no extras.
    expect(Object.keys(body).sort()).toEqual(['status', 'time']);
  });

  it('reports the current time as a valid ISO-8601 timestamp', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T12:34:56.000Z'));

    const response = onRequestGet({ request: new Request('https://example.com/api/health') });
    const body = (await response.json()) as { time: string };

    expect(body.time).toBe('2026-07-01T12:34:56.000Z');
    expect(new Date(body.time).toISOString()).toBe(body.time);
  });
});
