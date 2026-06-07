import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SoundToggle } from './SoundToggle';
import { SOUND_STORAGE_KEY } from './useSoundPreference';

function resetSound() {
  localStorage.clear();
  window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));
}

describe('SoundToggle', () => {
  beforeEach(resetSound);
  afterEach(resetSound);

  it('is pressed (sound on) by default', () => {
    render(<SoundToggle />);
    const btn = screen.getByRole('button', { name: /turn cry sound off/i });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles aria-pressed and its label on click', async () => {
    render(<SoundToggle />);
    await userEvent.click(screen.getByRole('button', { name: /turn cry sound off/i }));

    const off = screen.getByRole('button', { name: /turn cry sound on/i });
    expect(off).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(off);
    expect(screen.getByRole('button', { name: /turn cry sound off/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('reflects a persisted "off" preference', () => {
    localStorage.setItem(SOUND_STORAGE_KEY, 'false');
    window.dispatchEvent(new StorageEvent('storage', { key: SOUND_STORAGE_KEY }));
    render(<SoundToggle />);
    expect(screen.getByRole('button', { name: /turn cry sound on/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
