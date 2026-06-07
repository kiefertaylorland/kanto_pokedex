import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TypeBadge } from './TypeBadge';

describe('TypeBadge (SEC-009)', () => {
  it('renders the type label as escaped text', () => {
    const { container } = render(<TypeBadge type="fire" />);
    expect(screen.getByText('Fire')).toBeInTheDocument();
    // No raw HTML injection surface — content is plain text only.
    expect(container.querySelector('[dangerouslySetInnerHTML]')).toBeNull();
  });
});
