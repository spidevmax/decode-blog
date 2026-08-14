import { describe, expect, it } from 'vitest';
import {
  getAlbumById,
  getAlbums,
  getFacets,
  getFeatureById,
  getFeatures,
  getNews,
  getNewsById,
} from './api';

// The simulated network failure is disabled via VITE_API_FAIL_RATE=0, set in
// vite.config.js: the module reads it on import, so doing it here would be late.

describe('getAlbums', () => {
  it('returns the whole catalogue with no filters', async () => {
    const albums = await getAlbums();
    expect(albums.length).toBeGreaterThan(0);
    expect(albums[0]).toHaveProperty('title');
  });

  it('sorts by date descending by default', async () => {
    const albums = await getAlbums();
    const dates = albums.map((a) => a.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('sorts by score when asked', async () => {
    const albums = await getAlbums({ sort: 'score' });
    const scores = albums.map((a) => a.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  // Values are derived from the dataset itself, so the tests survive any
  // content change.
  it('filters by genre', async () => {
    const [first] = await getAlbums();
    const genre = first.genres[0];
    const albums = await getAlbums({ genre });
    expect(albums.length).toBeGreaterThan(0);
    expect(albums.every((a) => a.genres.includes(genre))).toBe(true);
  });

  it('filters by year, comparing as string or number', async () => {
    const [first] = await getAlbums();
    const { year } = first;
    const byNumber = await getAlbums({ year });
    const byString = await getAlbums({ year: String(year) });
    expect(byNumber.map((a) => a.id)).toEqual(byString.map((a) => a.id));
    expect(byNumber.every((a) => a.year === year)).toBe(true);
  });

  it('sorts by release year, newest and oldest', async () => {
    const newest = await getAlbums({ sort: 'newest' });
    const oldest = await getAlbums({ sort: 'oldest' });

    const years = newest.map((a) => a.year);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
    expect(oldest[0].year).toBeLessThanOrEqual(newest[0].year);
  });

  it('filters by decade, whichever year of it is given', async () => {
    const albums = await getAlbums({ decade: 1990 });
    expect(albums.length).toBeGreaterThan(0);
    expect(albums.every((a) => a.year >= 1990 && a.year < 2000)).toBe(true);

    const sameDecade = await getAlbums({ decade: 1997 });
    expect(sameDecade.map((a) => a.id)).toEqual(albums.map((a) => a.id));
  });

  // The bands meet at their boundaries: maxScore is exclusive, so a record
  // scoring exactly 8.5 is Essential and nothing else.
  it('filters by score range, with an exclusive ceiling', async () => {
    const recommended = await getAlbums({ minScore: 7, maxScore: 8.5 });
    expect(recommended.every((a) => a.score >= 7 && a.score < 8.5)).toBe(true);

    const essential = await getAlbums({ minScore: 8.5 });
    expect(essential.every((a) => a.score >= 8.5)).toBe(true);

    const ids = new Set(essential.map((a) => a.id));
    expect(recommended.some((a) => ids.has(a.id))).toBe(false);
  });

  it('combines filters', async () => {
    const [first] = await getAlbums({ sort: 'score' });
    const genre = first.genres[0];
    const albums = await getAlbums({ genre, minScore: 8.5 });
    expect(albums.every((a) => a.genres.includes(genre) && a.score >= 8.5)).toBe(true);
  });

  it('returns copies: mutating the result does not alter the dataset', async () => {
    const first = await getAlbums();
    const original = first[0].title;
    first[0].title = 'MUTATED';
    const second = await getAlbums();
    expect(second[0].title).toBe(original);
  });
});

describe('getAlbumById', () => {
  it('finds an existing album', async () => {
    const [first] = await getAlbums();
    const album = await getAlbumById(first.id);
    expect(album.title).toBe(first.title);
    expect(album.body.length).toBeGreaterThan(0);
  });

  it('rejects with 404 when it does not exist', async () => {
    await expect(getAlbumById('does-not-exist')).rejects.toMatchObject({ status: 404 });
  });
});

describe('getFacets', () => {
  it('returns unique, sorted genres and years', async () => {
    const { genres, years } = await getFacets();
    expect(new Set(genres).size).toBe(genres.length);
    expect([...genres].sort()).toEqual(genres);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it('returns the decades those years fall in, newest first', async () => {
    const { years, decades } = await getFacets();
    expect(new Set(decades).size).toBe(decades.length);
    expect([...decades].sort((a, b) => b - a)).toEqual(decades);
    expect(decades.every((d) => d % 10 === 0)).toBe(true);
    // Every year in the archive has a decade to be filtered under.
    expect(years.every((y) => decades.includes(Math.floor(y / 10) * 10))).toBe(true);
  });
});

describe('editorial content', () => {
  it('getNews sorts newest first', async () => {
    const news = await getNews();
    const dates = news.map((n) => n.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it('getFeatures sorts newest first', async () => {
    const features = await getFeatures();
    const dates = features.map((f) => f.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  // The detail pages render `body` as paragraphs, so every item must have one.
  it('every news item carries a body', async () => {
    const news = await getNews();
    expect(news.every((n) => Array.isArray(n.body) && n.body.length > 0)).toBe(true);
  });

  it('every feature carries a body and a pull quote', async () => {
    const features = await getFeatures();
    expect(features.every((f) => Array.isArray(f.body) && f.body.length > 0)).toBe(true);
    expect(features.every((f) => Boolean(f.pullQuote))).toBe(true);
  });
});

describe('getNewsById', () => {
  it('finds an existing news item', async () => {
    const [first] = await getNews();
    const item = await getNewsById(first.id);
    expect(item.title).toBe(first.title);
    expect(item.body.length).toBeGreaterThan(0);
  });

  it('rejects with 404 when it does not exist', async () => {
    await expect(getNewsById('does-not-exist')).rejects.toMatchObject({ status: 404 });
  });
});

describe('getFeatureById', () => {
  it('finds an existing feature', async () => {
    const [first] = await getFeatures();
    const feature = await getFeatureById(first.id);
    expect(feature.title).toBe(first.title);
    expect(feature.body.length).toBeGreaterThan(0);
  });

  it('rejects with 404 when it does not exist', async () => {
    await expect(getFeatureById('does-not-exist')).rejects.toMatchObject({
      status: 404,
    });
  });

  it('returns copies: mutating the result does not alter the dataset', async () => {
    const [first] = await getFeatures();
    const original = first.title;
    const fetched = await getFeatureById(first.id);
    fetched.title = 'MUTATED';
    const again = await getFeatureById(first.id);
    expect(again.title).toBe(original);
  });
});
