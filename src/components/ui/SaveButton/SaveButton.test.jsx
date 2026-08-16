import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { FavoritesProvider } from '@/context/FavoritesProvider';
import SaveButton from './SaveButton';

// localStorage is shimmed and cleared between tests in src/test/setup.js.
const renderSaved = (ui) => ({
  user: userEvent.setup(),
  ...render(<FavoritesProvider>{ui}</FavoritesProvider>),
});

describe('the toggle', () => {
  it('starts unsaved and says what pressing it would do', () => {
    renderSaved(<SaveButton type="review" id="ok-computer" title="OK Computer" />);

    const button = screen.getByRole('button', { name: 'Save OK Computer' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it('saves, and then offers to undo rather than repeating itself', async () => {
    const { user } = renderSaved(
      <SaveButton type="review" id="ok-computer" title="OK Computer" />,
    );

    await user.click(screen.getByRole('button', { name: 'Save OK Computer' }));

    const button = screen.getByRole('button', {
      name: 'Remove OK Computer from saved',
    });
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('persists as a typed entry, not a bare id', async () => {
    const { user } = renderSaved(
      <SaveButton type="news" id="label-folds" title="A label folds" />,
    );

    await user.click(screen.getByRole('button', { name: 'Save A label folds' }));

    const stored = JSON.parse(window.localStorage.getItem('decode:favorites'));
    expect(stored).toEqual([{ type: 'news', id: 'label-folds' }]);
  });
});

/**
 * Ids are only unique within their own dataset. A news item and an album may
 * share one, so the identity is the pair — this is the invariant the whole
 * favourites format exists to hold.
 */
describe('type and id together are the identity', () => {
  it('saving one type leaves the same id under another type alone', async () => {
    const { user } = renderSaved(
      <>
        <SaveButton type="review" id="shared-id" title="The review" />
        <SaveButton type="news" id="shared-id" title="The story" />
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Save The review' }));

    expect(
      screen.getByRole('button', { name: 'Remove The review from saved' }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Save The story' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

describe('variants', () => {
  // The bare star needs a label; the full bar already says "Save" in text,
  // and an aria-label would only talk over it.
  it('labels the icon variant and lets the row variant speak for itself', () => {
    const { unmount } = renderSaved(
      <SaveButton type="feature" id="a" title="A feature" />,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Save A feature');
    unmount();

    renderSaved(<SaveButton type="feature" id="a" title="A feature" variant="row" />);
    const row = screen.getByRole('button');
    expect(row).not.toHaveAttribute('aria-label');
    expect(row).toHaveTextContent('Save');
  });
});
