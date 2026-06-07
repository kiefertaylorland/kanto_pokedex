/**
 * Allow-listed, non-identifying analytics events (SEC-013). Only these event
 * names may be emitted; payloads carry no user identifiers, tokens, or PII.
 * The transport is Cloudflare Web Analytics (configured via the deploy), so
 * this module only guards the event surface.
 */
export const ANALYTICS_EVENTS = [
  'landing_cta_clicked',
  'auth_started',
  'auth_succeeded',
  'browser_searched',
  'browser_filtered',
  'detail_viewed',
  'map_marker_opened',
  'favorites_viewed',
  'compare_viewed',
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

export function track(event: AnalyticsEvent): void {
  // Intentionally no payload. Cloudflare Web Analytics auto-captures page views;
  // custom events are emitted only by name to keep logs PII-free.
  if (typeof window !== 'undefined' && 'dispatchEvent' in window) {
    window.dispatchEvent(new CustomEvent('kanto:analytics', { detail: { event } }));
  }
}
