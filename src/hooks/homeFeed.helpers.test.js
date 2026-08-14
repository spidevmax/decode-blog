import { describe, expect, it } from 'vitest';
import { alternateEditorial, buildHomeFeed } from './homeFeed.helpers';

const reviews = (n) => Array.from({ length: n }, (_, i) => ({ id: `r${i + 1}` }));
const news = (n) => Array.from({ length: n }, (_, i) => ({ id: `n${i + 1}` }));
const features = (n) => Array.from({ length: n }, (_, i) => ({ id: `f${i + 1}` }));

describe('alternateEditorial', () => {
  it('alternates the two types', () => {
    const out = alternateEditorial(news(2), features(2));
    expect(out.map((e) => e.kind)).toEqual(['news', 'feature', 'news', 'feature']);
  });

  it('keeps going when one list is shorter', () => {
    const out = alternateEditorial(news(3), features(1));
    expect(out.map((e) => e.kind)).toEqual(['news', 'feature', 'news', 'news']);
  });

  it('handles either list being empty', () => {
    expect(alternateEditorial([], features(2)).map((e) => e.kind)).toEqual([
      'feature',
      'feature',
    ]);
    expect(alternateEditorial(news(1), []).map((e) => e.kind)).toEqual(['news']);
    expect(alternateEditorial([], [])).toEqual([]);
  });

  it('tags each entry with its item', () => {
    const [first] = alternateEditorial(news(1), []);
    expect(first).toEqual({ kind: 'news', item: { id: 'n1' } });
  });
});

describe('buildHomeFeed', () => {
  const editorial = alternateEditorial(news(3), features(3));

  it('leads with a review and drops one editorial every four', () => {
    const feed = buildHomeFeed(reviews(12), editorial, { every: 4, limit: 12 });
    expect(feed.map((e) => e.kind)).toEqual([
      'review',
      'review',
      'review',
      'review',
      'news',
      'review',
      'review',
      'review',
      'review',
      'feature',
      'review',
      'review',
    ]);
  });

  it('never puts an editorial piece in the lead slot', () => {
    const feed = buildHomeFeed(reviews(8), editorial, { every: 1, limit: 8 });
    expect(feed[0].kind).toBe('review');
  });

  it('respects the limit exactly', () => {
    expect(buildHomeFeed(reviews(50), editorial, { limit: 12 })).toHaveLength(12);
    expect(buildHomeFeed(reviews(50), editorial, { limit: 5 })).toHaveLength(5);
  });

  // Editorial content is an enhancement: without it the grid is still a grid.
  it('degrades to reviews only when there is no editorial content', () => {
    const feed = buildHomeFeed(reviews(6), [], { every: 4, limit: 6 });
    expect(feed.map((e) => e.kind)).toEqual(Array(6).fill('review'));
  });

  it('stops interleaving once the editorial list runs out', () => {
    const feed = buildHomeFeed(reviews(20), alternateEditorial(news(1), []), {
      every: 4,
      limit: 20,
    });
    expect(feed.filter((e) => e.kind !== 'review')).toHaveLength(1);
  });

  it('returns nothing when there are no reviews', () => {
    expect(buildHomeFeed([], editorial)).toEqual([]);
  });

  it('keeps reviews the clear majority', () => {
    const feed = buildHomeFeed(reviews(30), editorial, { every: 4, limit: 12 });
    const rate = feed.filter((e) => e.kind === 'review').length / feed.length;
    expect(rate).toBeGreaterThan(0.7);
  });

  // Every entry must be renderable: a card is picked by `kind`.
  it('tags every entry with a known kind and an item', () => {
    const feed = buildHomeFeed(reviews(12), editorial);
    expect(feed.every((e) => ['review', 'news', 'feature'].includes(e.kind))).toBe(true);
    expect(feed.every((e) => Boolean(e.item))).toBe(true);
  });

  it('survives nullish input', () => {
    expect(buildHomeFeed(undefined, undefined)).toEqual([]);
  });
});
