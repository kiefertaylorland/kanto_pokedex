import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_BROWSER_QUERY } from '@kanto/shared';
import { FilterBar } from './FilterBar';

describe('FilterBar (P2)', () => {
  it('emits a search patch and resets to page 1 on typing', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={DEFAULT_BROWSER_QUERY} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText(/search by name or number/i), 'p');
    expect(onChange).toHaveBeenLastCalledWith({ q: 'p', page: 1 });
  });

  it('toggles a type into the multi-select OR filter', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={DEFAULT_BROWSER_QUERY} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Fire'));
    expect(onChange).toHaveBeenCalledWith({ types: ['fire'], page: 1 });
  });

  it('removes an already-selected type', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={{ ...DEFAULT_BROWSER_QUERY, types: ['fire', 'water'] }} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Fire'));
    expect(onChange).toHaveBeenCalledWith({ types: ['water'], page: 1 });
  });

  it('changes the sort key from the allow-list', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={DEFAULT_BROWSER_QUERY} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Sort'), 'base_stat_total');
    expect(onChange).toHaveBeenCalledWith({ sort: 'base_stat_total', page: 1 });
  });
});
