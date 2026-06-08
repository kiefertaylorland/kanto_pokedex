import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TypeBadge } from './TypeBadge';

describe('TypeBadge (SEC-009)', () => {
  it('renders the type label as escaped text', () => {
    const { container } = render(<TypeBadge type="fire" />);
    expect(screen.getByText('Fire')).toBeInTheDocument();
    // No raw HTML injection surface — content is plain text only.
    expect(container.querySelector('[dangerouslySetInnerHTML]')).toBeNull();
  });

  it('renders an interactive filter toggle that reflects selection via aria-pressed', async () => {
    const onClick = vi.fn();
    const { rerender } = render(
      <TypeBadge type="water" variant="outline" interactive selected={false} onClick={onClick} />,
    );
    const btn = screen.getByRole('button', { name: 'Water' });
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledOnce();

    rerender(<TypeBadge type="water" variant="outline" interactive selected onClick={onClick} />);
    expect(screen.getByRole('button', { name: 'Water' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('disables a type that is absent from the dataset', () => {
    render(<TypeBadge type="ice" variant="outline" interactive disabled />);
    expect(screen.getByRole('button', { name: 'Ice' })).toBeDisabled();
  });
});
