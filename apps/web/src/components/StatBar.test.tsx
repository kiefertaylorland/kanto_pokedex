import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBar } from './StatBar';

describe('StatBar', () => {
  it('shows the numeric value alongside the label (color is never the sole signal)', () => {
    render(<StatBar statKey="hp" value={45} />);
    expect(screen.getByText('HP')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
  });

  it('maps the value to the correct magnitude tier', () => {
    const tierOf = (value: number) => {
      const { container, unmount } = render(<StatBar statKey="attack" value={value} />);
      const fill = container.querySelector('.h-full');
      const cls = fill?.className ?? '';
      unmount();
      return cls;
    };
    expect(tierOf(40)).toContain('bg-stat-low'); // ≤59
    expect(tierOf(75)).toContain('bg-stat-mid'); // 60–89
    expect(tierOf(100)).toContain('bg-stat-high'); // 90–119
    expect(tierOf(130)).toContain('bg-stat-elite'); // ≥120
  });

  it('without animation renders the fill at its final width immediately', () => {
    const { container } = render(<StatBar statKey="speed" value={120} max={240} />);
    const fill = container.querySelector('.h-full') as HTMLElement | null;
    // 120 / 240 = 50%
    expect(fill?.style.width).toBe('50%');
  });
});
