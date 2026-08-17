import { describe, expect, it } from 'vitest';

import { clampPage, pageCount, pageItems, pageSlice } from './Pagination.helpers';

describe('pageCount', () => {
  it('divides and rounds up', () => {
    expect(pageCount(56, 12)).toBe(5);
    expect(pageCount(24, 12)).toBe(2);
  });

  // An empty list still has one (empty) page: the UI must not divide by zero.
  it('never returns less than one', () => {
    expect(pageCount(0, 12)).toBe(1);
    expect(pageCount(-5, 12)).toBe(1);
  });

  it('survives nonsense input', () => {
    expect(pageCount(NaN, 12)).toBe(1);
    expect(pageCount(10, 0)).toBe(1);
  });
});

describe('clampPage', () => {
  it('keeps a page that exists', () => {
    expect(clampPage(3, 56, 12)).toBe(3);
  });

  // The important case: filters shrink the list while ?page is still set.
  it('pulls a stale page back to the last real one', () => {
    expect(clampPage(5, 56, 12)).toBe(5);
    expect(clampPage(5, 6, 12)).toBe(1);
    expect(clampPage(99, 30, 12)).toBe(3);
  });

  it('treats junk and out-of-range as page 1', () => {
    expect(clampPage('abc', 56, 12)).toBe(1);
    expect(clampPage(null, 56, 12)).toBe(1);
    expect(clampPage(0, 56, 12)).toBe(1);
    expect(clampPage(-3, 56, 12)).toBe(1);
  });

  it('reads the string a query param actually gives us', () => {
    expect(clampPage('4', 56, 12)).toBe(4);
    expect(clampPage('2.7', 56, 12)).toBe(2);
  });
});

describe('pageSlice', () => {
  const items = Array.from({ length: 56 }, (_, i) => i + 1);

  it('returns the right window', () => {
    expect(pageSlice(items, 1, 12)).toEqual(items.slice(0, 12));
    expect(pageSlice(items, 2, 12)).toEqual(items.slice(12, 24));
    expect(pageSlice(items, 5, 12)).toEqual(items.slice(48, 56));
  });

  it('the last page holds the remainder', () => {
    expect(pageSlice(items, 5, 12)).toHaveLength(8);
  });

  // Never strand the user on a blank page.
  it('falls back to a real page when asked for one past the end', () => {
    expect(pageSlice(items, 99, 12)).toEqual(items.slice(48, 56));
  });

  it('handles empty and nullish lists', () => {
    expect(pageSlice([], 1, 12)).toEqual([]);
    expect(pageSlice(undefined, 1, 12)).toEqual([]);
  });
});

describe('pageItems', () => {
  it('lists every page when the run is short', () => {
    expect(pageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('elides the middle on long runs', () => {
    expect(pageItems(5, 12)).toEqual([1, 'gap', 4, 5, 6, 'gap', 12]);
  });

  it('keeps first and last always visible', () => {
    const items = pageItems(6, 20);
    expect(items[0]).toBe(1);
    expect(items[items.length - 1]).toBe(20);
  });

  it('does not elide near the start', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 4, 'gap', 12]);
  });

  it('does not elide near the end', () => {
    expect(pageItems(12, 12)).toEqual([1, 'gap', 9, 10, 11, 12]);
  });

  // Eliding one page would cost as many characters as printing it.
  it('prints a lone hidden page instead of a gap', () => {
    expect(pageItems(4, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12]);
  });

  // The control must not change size as you page through it.
  it('keeps a stable width as the current page moves', () => {
    const widths = new Set();
    for (let p = 1; p <= 12; p++) widths.add(pageItems(p, 12).length);
    // Only the two shapes: with one gap or with two.
    expect([...widths].sort()).toEqual([6, 7]);
  });

  it('never renders a gap next to another gap', () => {
    for (let p = 1; p <= 20; p++) {
      const items = pageItems(p, 20);
      const adjacent = items.some((x, i) => x === 'gap' && items[i + 1] === 'gap');
      expect(adjacent).toBe(false);
    }
  });

  it('always contains the current page', () => {
    for (let p = 1; p <= 20; p++) {
      expect(pageItems(p, 20)).toContain(p);
    }
  });
});
