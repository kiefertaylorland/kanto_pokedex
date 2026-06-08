import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from './ThemeToggle';
import { THEME_STORAGE_KEY } from './useThemePreference';

function resetTheme() {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
}

describe('ThemeToggle', () => {
  beforeEach(resetTheme);
  afterEach(resetTheme);

  it('defaults to light mode', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles aria-pressed, label, and theme on click', async () => {
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));

    const dark = screen.getByRole('button', { name: /switch to light mode/i });
    expect(dark).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.theme).toBe('dark');

    await userEvent.click(dark);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('reflects a persisted dark preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
