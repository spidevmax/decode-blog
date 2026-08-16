import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import FilterSelect from './FilterSelect';

/** The first option is the neutral one, as the component documents. */
const GENRES = [
  { value: null, label: 'All genres' },
  { value: 'Techno', label: 'Techno' },
  { value: 'Jazz', label: 'Jazz' },
];

const setup = (props = {}) => {
  const onSelect = vi.fn();
  const view = render(
    <FilterSelect
      label="Genre"
      value={null}
      options={GENRES}
      onSelect={onSelect}
      {...props}
    />,
  );
  return { onSelect, user: userEvent.setup(), ...view };
};

/** The trigger, found the way a screen reader announces it. */
const trigger = () => screen.getByRole('button', { name: /^Genre:/ });

describe('the collapsed trigger', () => {
  it('states the current value rather than naming the control', () => {
    setup();
    expect(trigger()).toHaveTextContent('All genres');
  });

  it('announces the facet name for anyone who cannot see the bar', () => {
    setup({ value: 'Techno' });
    expect(screen.getByRole('button', { name: 'Genre: Techno' })).toBeInTheDocument();
  });

  // Choosing an order does not narrow the archive, so only a value that
  // differs from the neutral option counts as applied.
  it('marks itself as set only when something is actually filtered', () => {
    const { unmount } = setup({ value: 'Techno' });
    expect(trigger().className).toContain('filter-select__trigger--set');
    unmount();

    setup({ value: null });
    expect(trigger().className).not.toContain('filter-select__trigger--set');
  });

  /**
   * The URL is read before the facets arrive, so for a moment the options do
   * not contain the selected value. Falling back to "All genres" would have
   * the control claim nothing is filtered while the listing is filtered.
   */
  it('shows an unrecognised value instead of claiming nothing is filtered', () => {
    setup({ value: 'Ambient', options: [{ value: null, label: 'All genres' }] });
    expect(trigger()).toHaveTextContent('Ambient');
    expect(trigger()).not.toHaveTextContent('All genres');
  });
});

describe('opening and choosing', () => {
  it('lists the options once opened', async () => {
    const { user } = setup();
    expect(screen.queryByRole('group', { name: 'Genre' })).not.toBeInTheDocument();

    await user.click(trigger());

    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: 'Techno' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Jazz' })).toBeInTheDocument();
  });

  it('reports the chosen value and closes', async () => {
    const { onSelect, user } = setup();
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'Jazz' }));

    expect(onSelect).toHaveBeenCalledWith('Jazz');
    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('hands focus back to the trigger, so the tab order is not lost', async () => {
    const { user } = setup();
    await user.click(trigger());
    await user.click(screen.getByRole('button', { name: 'Techno' }));

    expect(trigger()).toHaveFocus();
  });

  it('marks the current option as pressed', async () => {
    const { user } = setup({ value: 'Techno' });
    await user.click(trigger());

    expect(screen.getByRole('button', { name: 'Techno' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Jazz' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

describe('dismissing', () => {
  it('closes on Escape and returns focus', async () => {
    const { user } = setup();
    await user.click(trigger());

    await user.keyboard('{Escape}');

    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(trigger()).toHaveFocus();
  });

  it('closes when the press starts outside', async () => {
    const { user } = setup();
    await user.click(trigger());

    await user.click(document.body);

    expect(trigger()).toHaveAttribute('aria-expanded', 'false');
  });

  it('stays open while the press is inside its own panel', async () => {
    const { user } = setup();
    await user.click(trigger());

    await user.click(screen.getByRole('group', { name: 'Genre' }));

    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });
});
