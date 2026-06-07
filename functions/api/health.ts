// Cloudflare Pages Function — GET /api/health
//
// The only day-one BFF route (per architecture: /api/pokemon and /api/map are
// added ONLY if measured to help). Touches no user data. Used by the deploy
// smoke test and uptime checks. Returns a generic body only (SEC-012).

interface PagesContext {
  request: Request;
}

export const onRequestGet = (_context: PagesContext): Response => {
  return new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
