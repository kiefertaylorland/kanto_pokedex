import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} pageCount={1} onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} pageCount={5} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /previous page/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next page/i })).not.toBeDisabled();

    rerender(<Pagination page={5} pageCount={5} onChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: /next page/i })).toBeDisabled();
  });

  it('marks the current page and emits the chosen page', async () => {
    const onChange = vi.fn();
    render(<Pagination page={2} pageCount={5} onChange={onChange} />);
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: '4' }));
    await userEvent.click(screen.getByRole('button', { name: /previous page/i }));
    await userEvent.click(screen.getByRole('button', { name: /next page/i }));
    expect(onChange).toHaveBeenCalledWith(4);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('renders gap markers for long page ranges', () => {
    render(<Pagination page={6} pageCount={20} onChange={vi.fn()} />);
    expect(screen.getAllByText('…')).toHaveLength(2);
  });
});
