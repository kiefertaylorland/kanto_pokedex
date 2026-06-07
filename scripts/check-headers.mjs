#!/usr/bin/env node
/**
 * SEC-011 deploy smoke: assert the served app carries the baseline security
 * headers. Exits non-zero (failing the deploy) if any required header is
 * missing or the CSP weakens script protection.
 *
 *   node scripts/check-headers.mjs https://kanto-pokedex.pages.dev
 */
const url = process.argv[2];
if (!url) {
  console.error('usage: check-headers.mjs <url>');
  process.exit(2);
}

const REQUIRED = {
  'content-security-policy': (v) => v.includes("default-src 'self'") && !/script-src[^;]*'unsafe-inline'/.test(v) && !/script-src[^;]*'unsafe-eval'/.test(v),
  'x-content-type-options': (v) => v.toLowerCase() === 'nosniff',
  'referrer-policy': (v) => v.length > 0,
  'strict-transport-security': (v) => /max-age=\d+/.test(v),
};

const res = await fetch(url, { redirect: 'manual' });
const failures = [];

for (const [header, check] of Object.entries(REQUIRED)) {
  const value = res.headers.get(header);
  if (!value) {
    failures.push(`missing ${header}`);
  } else if (!check(value)) {
    failures.push(`invalid ${header}: ${value}`);
  }
}

// frame protection: either X-Frame-Options or CSP frame-ancestors.
const xfo = res.headers.get('x-frame-options');
const csp = res.headers.get('content-security-policy') ?? '';
if (!xfo && !csp.includes('frame-ancestors')) {
  failures.push('missing frame protection (X-Frame-Options or CSP frame-ancestors)');
}

if (failures.length) {
  console.error(`SEC-011 header smoke FAILED for ${url}:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log(`SEC-011 header smoke passed for ${url}.`);
