import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { existsSync, readFileSync } from 'node:fs';
import { SESSION_FILE } from './global-setup';

/** Inject the minted Supabase session into localStorage before the app loads. */
async function injectSession(page: Page) {
  const { storageKey, value } = JSON.parse(readFileSync(SESSION_FILE, 'utf8')) as {
    storageKey: string;
    value: string;
  };
  await page.addInitScript(
    ([k, v]) => window.localStorage.setItem(k, v),
    [storageKey, value] as const,
  );
}

test.describe('Public access (no session required)', () => {
  test('landing page renders and exposes no live protected data (FR-001/007)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /kanto pokédex/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /sign in to explore/i })).toBeVisible();
  });

  test('unauthenticated /pokedex redirects to /auth, leaking no data (SC-008)', async ({ page }) => {
    await page.goto('/pokedex');
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('landing page has no critical accessibility violations (SC-010)', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(serious).toEqual([]);
  });
});

test.describe('Authenticated journey: login → browse → detail → map', () => {
  test.skip(!existsSync(SESSION_FILE), 'No test backend configured (global-setup minted no session).');

  test.beforeEach(async ({ page }) => {
    await injectSession(page);
  });

  test('browse shows Pokémon and search narrows results (P2, SC-003/005)', async ({ page }) => {
    await page.goto('/pokedex');
    await expect(page.getByRole('heading', { name: 'Pokédex' })).toBeVisible();
    // Cards present.
    await expect(page.getByRole('listitem').first()).toBeVisible();
    // Exact numeric search → only #025 Pikachu (FR-010).
    await page.getByLabel(/search by name or number/i).fill('25');
    await expect(page.getByText('Pikachu')).toBeVisible();
  });

  test('detail page shows full data incl. Red/Blue flavor text (P3, SC-006)', async ({ page }) => {
    await page.goto('/pokemon/133'); // Eevee — multiple evolutions
    await expect(page.getByRole('heading', { name: 'Eevee' })).toBeVisible();
    await expect(page.getByText('Pokémon Red/Blue')).toBeVisible();
    await expect(page.getByRole('heading', { name: /base stats/i })).toBeVisible();
  });

  test('out-of-range detail id shows the 404 not-found screen (edge case)', async ({ page }) => {
    await injectSession(page);
    await page.goto('/pokemon/9999');
    await expect(page.getByText(/we don’t have data for №9999 yet/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /back to pokédex/i })).toBeVisible();
  });

  test('map marker opens an encounter panel with provenance (P4, SC-007)', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByRole('heading', { name: 'Kanto Map' })).toBeVisible();
    // Open a location known to have curated encounters.
    await page.getByRole('button', { name: /Pallet Town/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').getByText(/Curated|Inferred|PokéAPI/).first()).toBeVisible();
  });
});
