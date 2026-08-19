import { describe, expect, it } from 'vitest';

import { favoriteKey, idsOfType, parseStored, toggleEntry } from './favorites.helpers';

describe('parseStored', () => {
  it('reads the current format', () => {
    const raw = [
      { type: 'review', id: 'gnx' },
      { type: 'news', id: 'vinyl-sales-record' },
    ];
    expect(parseStored(raw)).toEqual(raw);
  });

  // One bad entry must cost you that favourite, not the whole shelf.
  it('drops unusable entries and keeps the rest', () => {
    const raw = [
      { type: 'review', id: 'gnx' },
      null,
      42,
      {},
      { type: 'nope', id: 'x' },
      'gnx',
      { type: 'news', id: '' },
      { type: 'news', id: 'arctic-monkeys-studio' },
    ];
    expect(parseStored(raw)).toEqual([
      { type: 'review', id: 'gnx' },
      { type: 'news', id: 'arctic-monkeys-studio' },
    ]);
  });

  it('de-duplicates on the type+id pair', () => {
    const raw = [
      { type: 'review', id: 'gnx' },
      { type: 'review', id: 'gnx' },
    ];
    expect(parseStored(raw)).toEqual([{ type: 'review', id: 'gnx' }]);
  });

  // Ids are only unique within a dataset, so the same id in two types is two
  // different favourites.
  it('keeps the same id under different types', () => {
    const raw = [
      { type: 'review', id: 'blackstar' },
      { type: 'news', id: 'blackstar' },
    ];
    expect(parseStored(raw)).toHaveLength(2);
  });

  it('survives anything that is not an array', () => {
    expect(parseStored(null)).toEqual([]);
    expect(parseStored(undefined)).toEqual([]);
    expect(parseStored({})).toEqual([]);
    expect(parseStored('gnx')).toEqual([]);
  });
});

describe('toggleEntry', () => {
  it('adds what is missing', () => {
    expect(toggleEntry([], 'news', 'a')).toEqual([{ type: 'news', id: 'a' }]);
  });

  it('removes what is already there', () => {
    const entries = [
      { type: 'review', id: 'gnx' },
      { type: 'news', id: 'a' },
    ];
    expect(toggleEntry(entries, 'news', 'a')).toEqual([{ type: 'review', id: 'gnx' }]);
  });

  it('only removes the matching type', () => {
    const entries = [
      { type: 'review', id: 'x' },
      { type: 'news', id: 'x' },
    ];
    expect(toggleEntry(entries, 'news', 'x')).toEqual([{ type: 'review', id: 'x' }]);
  });

  it('keeps the order of the entries it does not touch', () => {
    const entries = [
      { type: 'review', id: 'a' },
      { type: 'review', id: 'b' },
      { type: 'review', id: 'c' },
    ];
    expect(toggleEntry(entries, 'review', 'b').map((e) => e.id)).toEqual(['a', 'c']);
  });
});

describe('idsOfType', () => {
  const entries = [
    { type: 'review', id: 'gnx' },
    { type: 'news', id: 'a' },
    { type: 'review', id: 'blonde' },
    { type: 'feature', id: 'f1' },
  ];

  it('returns only the ids of that type, in order', () => {
    expect(idsOfType(entries, 'review')).toEqual(['gnx', 'blonde']);
    expect(idsOfType(entries, 'news')).toEqual(['a']);
    expect(idsOfType(entries, 'feature')).toEqual(['f1']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(idsOfType([], 'review')).toEqual([]);
  });
});

describe('favoriteKey', () => {
  it('does not collide across types', () => {
    expect(favoriteKey('review', 'x')).not.toBe(favoriteKey('news', 'x'));
  });
});
