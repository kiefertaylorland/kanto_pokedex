import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CryButton } from './CryButton';

describe('CryButton', () => {
  it('plays the cry on click when enabled', async () => {
    const onPlay = vi.fn();
    render(<CryButton onPlay={onPlay} enabled name="Pikachu" />);
    const btn = screen.getByRole('button', { name: /play pikachu's cry/i });
    await userEvent.click(btn);
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it('is disabled and does not play when sound is off', async () => {
    const onPlay = vi.fn();
    render(<CryButton onPlay={onPlay} enabled={false} name="Pikachu" />);
    const btn = screen.getByRole('button', { name: /play pikachu's cry/i });
    expect(btn).toBeDisabled();
    await userEvent.click(btn);
    expect(onPlay).not.toHaveBeenCalled();
  });
});
