#!/usr/bin/env node
/**
 * SEC-005 secret segregation guard.
 *
 * Fails (exit 1) if a Supabase SERVICE-ROLE key leaks into tracked source or the
 * built client bundle. Crucially, the anon key is ALSO a JWT and is *supposed*
 * to ship in the client bundle — so we don't flag JWTs by shape. Instead we
 * decode every JWT-shaped token and flag only those whose payload role is
 * `service_role`. Reading `SUPABASE_SERVICE_ROLE_KEY` from env (server side) is
 * legitimate and never flagged.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['apps', 'packages', 'functions', 'supabase', 'scripts'];
const SCAN_BUNDLE_DIRS = ['apps/web/dist'];
const SKIP = new Set(['node_modules', '.git', 'dist', 'coverage', 'test-results', 'playwright-report']);
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.html', '.css', '.toml', '.yml', '.yaml', '.sql', '.env', '']);

const JWT_RE = /eyJ[A-Za-z0-9_-]{6,}\.([A-Za-z0-9_-]{6,})\.[A-Za-z0-9_-]{6,}/g;
const INLINE_SECRET_RE = /SUPABASE_SERVICE_ROLE_KEY\s*=\s*['"]?eyJ/;

const violations = [];

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (SKIP.has(name)) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full);
    else if (TEXT_EXT.has(extname(full))) scanFile(full);
  }
}

function roleOfJwt(payloadB64) {
  try {
    const json = Buffer.from(payloadB64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    const obj = JSON.parse(json);
    return typeof obj.role === 'string' ? obj.role : null;
  } catch {
    return null;
  }
}

function scanFile(file) {
  const rel = file.replace(ROOT + '/', '');
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    return;
  }

  if (INLINE_SECRET_RE.test(content)) {
    violations.push(`${rel}: inline SUPABASE_SERVICE_ROLE_KEY value`);
  }

  let m;
  JWT_RE.lastIndex = 0;
  while ((m = JWT_RE.exec(content)) !== null) {
    const role = roleOfJwt(m[1]);
    // Anon-key JWTs (role 'anon') are public and allowed in the bundle.
    if (role === 'service_role') {
      violations.push(`${rel}: hardcoded service_role JWT`);
    }
  }
}

for (const d of SCAN_DIRS) walk(join(ROOT, d));
for (const d of SCAN_BUNDLE_DIRS) walk(join(ROOT, d));

if (violations.length) {
  console.error('SEC-005 secret-scan FAILED — service-role key present in source or client bundle:');
  for (const v of violations) console.error('  - ' + v);
  process.exit(1);
}
console.log('SEC-005 secret-scan passed: no service-role key in source or client bundle.');
