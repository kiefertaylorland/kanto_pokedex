import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DEFAULT_BROWSER_QUERY } from '@kanto/shared';
import { FilterBar } from './FilterBar';

describe('FilterBar (P2)', () => {
  it('emits a search patch and resets to page 1 on typing', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={DEFAULT_BROWSER_QUERY} onChange={onChange} />);
    await userEvent.type(screen.getByRole('searchbox'), 'p');
    expect(onChange).toHaveBeenLastCalledWith({ q: 'p', page: 1 });
  });

  it('toggles a type into the multi-select OR filter', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={DEFAULT_BROWSER_QUERY} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
    expect(onChange).toHaveBeenCalledWith({ types: ['fire'], page: 1 });
  });

  it('removes an already-selected type', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={{ ...DEFAULT_BROWSER_QUERY, types: ['fire', 'water'] }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Fire' }));
    expect(onChange).toHaveBeenCalledWith({ types: ['water'], page: 1 });
  });

  it('clears all active type filters', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={{ ...DEFAULT_BROWSER_QUERY, types: ['fire', 'water'] }} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /clear all types/i }));
    expect(onChange).toHaveBeenCalledWith({ types: [], page: 1 });
  });

  it('changes the sort key from the allow-list and applies its direction', async () => {
    const onChange = vi.fn();
    render(<FilterBar query={DEFAULT_BROWSER_QUERY} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText('Sort'), 'base_stat_total');
    // Base-stat-total reads high→low, so the toolbar applies a descending direction.
    expect(onChange).toHaveBeenCalledWith({ sort: 'base_stat_total', dir: 'desc', page: 1 });
  });
});
