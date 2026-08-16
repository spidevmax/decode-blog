import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import ErrorState from './ErrorState';

const renderState = (props = {}) => {
  const onRetry = vi.fn();
  render(
    <MemoryRouter>
      <ErrorState subject="the reviews" onRetry={onRetry} {...props} />
    </MemoryRouter>,
  );
  return { onRetry, user: userEvent.setup() };
};

describe('a request that failed for good', () => {
  it('says so plainly and offers to try again', () => {
    renderState();

    expect(screen.getByRole('alert')).toHaveTextContent('No answer from the archive');
    expect(screen.getByRole('alert')).toHaveTextContent('the reviews');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('calls back when the reader tries again', async () => {
    const { onRetry, user } = renderState();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('leads back to the section the reader was in, not the front page', () => {
    renderState({ backTo: '/reviews', backLabel: 'All reviews' });
    expect(screen.getByRole('link', { name: 'All reviews' })).toHaveAttribute(
      'href',
      '/reviews',
    );
  });

  it('falls back to the front page when no section is given', () => {
    renderState();
    expect(screen.getByRole('link', { name: 'Go home' })).toHaveAttribute('href', '/');
  });
});

/**
 * A 404 is an answer, not a failure. Offering to retry would promise
 * something the archive cannot deliver: the record is not there.
 */
describe('a 404 from the API', () => {
  it('reports a missing record and does not offer a retry', () => {
    renderState({ error: { status: 404 }, subject: 'that review' });

    expect(screen.getByRole('alert')).toHaveTextContent('Not in the archive');
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('still offers a way out', () => {
    renderState({ error: { status: 404 }, backTo: '/reviews', backLabel: 'All reviews' });
    expect(screen.getByRole('link', { name: 'All reviews' })).toBeInTheDocument();
  });

  it('does not offer a retry even when a handler was passed', () => {
    renderState({ error: { status: 404 }, onRetry: vi.fn() });
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });
});

describe('without a retry handler', () => {
  it('shows only the way out', () => {
    render(
      <MemoryRouter>
        <ErrorState subject="the news" />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go home' })).toBeInTheDocument();
  });
});
