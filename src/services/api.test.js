import { describe, expect, it } from 'vitest';
import { getAlbumById, getAlbums, getFacets, getFeatures, getNews } from './api';

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
});
