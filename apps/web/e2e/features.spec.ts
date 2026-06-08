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
  await page.addInitScript(([k, v]) => window.localStorage.setItem(k, v), [storageKey, value] as const);
}

test.describe('404 not-found (public catch-all)', () => {
  test('renders the 404 card with two real, focusable actions', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/not found/i)).toBeVisible();
    const back = page.getByRole('link', { name: /back to pokédex/i });
    const map = page.getByRole('link', { name: /view the kanto map/i });
    await expect(back).toBeVisible();
    await expect(map).toBeVisible();
  });

  test('no critical accessibility violations on 404', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(serious).toEqual([]);
  });
});

<<<<<<< HEAD
test.describe('Cry sound toggle (public header control)', () => {
  // Each Playwright test gets a fresh context, so localStorage starts empty.
  test('is on by default, toggles off, and persists across reload', async ({ page }) => {
    await page.goto('/');
    const on = page.getByRole('button', { name: /turn cry sound off/i });
    await expect(on).toBeVisible();
    await expect(on).toHaveAttribute('aria-pressed', 'true');

    await on.click();
    const off = page.getByRole('button', { name: /turn cry sound on/i });
    await expect(off).toHaveAttribute('aria-pressed', 'false');

    await page.reload();
    await expect(page.getByRole('button', { name: /turn cry sound on/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

test.describe('Detail cry replay (authenticated)', () => {
  test.skip(!existsSync(SESSION_FILE), 'No test backend configured (global-setup minted no session).');

  test.beforeEach(async ({ page }) => {
    await injectSession(page);
  });

  test('detail page exposes a replay control for the cry', async ({ page }) => {
    await page.goto('/pokemon/25');
    await expect(page.getByRole('heading', { name: 'Pikachu' })).toBeVisible();
    await expect(page.getByRole('button', { name: /play pikachu's cry/i })).toBeVisible();
  });
});

=======
>>>>>>> origin/main
test.describe('Favorites + Compare (authenticated)', () => {
  test.skip(!existsSync(SESSION_FILE), 'No test backend configured (global-setup minted no session).');

  test.beforeEach(async ({ page }) => {
    await injectSession(page);
    await page.addInitScript(() => window.localStorage.removeItem('kanto:favorites'));
  });

  test('favorites: empty state → star a Pokémon → persists across reload', async ({ page }) => {
    await page.goto('/favorites');
    await expect(page.getByText(/no favorites yet/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /browse the pokédex/i })).toBeVisible();

    // Star a Pokémon from the browser; the star must NOT navigate.
    await page.goto('/pokedex');
    const star = page.getByRole('button', { name: /add .* to favorites/i }).first();
    await star.click();
    await expect(page).toHaveURL(/\/pokedex/);
    await expect(star).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: /remove .* from favorites/i }).first()).toBeVisible();

    // It shows on the favorites screen and survives a reload.
    await page.goto('/favorites');
    await expect(page.getByText(/1 saved/i)).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(1);
    await page.reload();
    await expect(page.getByText(/1 saved/i)).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(1);
  });

  test('compare: two Pokémon, swap, and the winner value is bold', async ({ page }) => {
    await page.goto('/compare?a=1&b=4'); // Bulbasaur (BST 318) vs Charmander (BST 309)
    await expect(page.getByText('Bulbasaur')).toBeVisible();
    await expect(page.getByText('Charmander')).toBeVisible();
    await expect(page.getByText('Total')).toBeVisible();

    // Bulbasaur's total is higher, so its value renders bold (color is never the only signal).
    await expect(page.getByText('318', { exact: true })).toHaveClass(/font-bold/);

    // Swap reverses the URL params.
    await page.getByRole('button', { name: /swap a and b/i }).click();
    await expect(page).toHaveURL(/a=4/);
    await expect(page).toHaveURL(/b=1/);
  });
});
