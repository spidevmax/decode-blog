import { ALBUMS } from './mocks/albums.data';
import { FEATURES, NEWS } from './mocks/editorial.data';

/**
 * Data access layer.
 *
 * Today it resolves against an in-memory dataset, but simulates latency and
 * network failures so the hooks' loading/error states behave for real. Once a
 * backend exists, swap the body of these functions for fetch() and no
 * component needs to change.
 */

const LATENCY_MIN = 400;
const LATENCY_MAX = 600;

/** Simulated failure rate. Disabled in tests via VITE_API_FAIL_RATE=0. */
const FAIL_RATE = Number(import.meta.env?.VITE_API_FAIL_RATE ?? 0.08);

export class ApiError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const latency = () => {
  return LATENCY_MIN + Math.random() * (LATENCY_MAX - LATENCY_MIN);
};

/** Resolves `value` after a delay, or rejects to simulate a network drop. */
const respond = (value, { canFail = true } = {}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (canFail && Math.random() < FAIL_RATE) {
        reject(new ApiError('We could not reach the server.', 503));
        return;
      }
      // Defensive copy: nobody mutates the "backend" from a component.
      resolve(structuredClone(value));
    }, latency());
  });
};

/** Release year → the decade it opens, e.g. 1997 → 1990. */
const decadeOf = (year) => Math.floor(Number(year) / 10) * 10;

/**
 * Ordering. `recent` and `score` read the review — when we published it, what
 * we thought of it. `newest` and `oldest` read the record, which is a
 * different archive running on different dates.
 */
const COMPARE = {
  score: (a, b) => b.score - a.score,
  recent: (a, b) => b.date.localeCompare(a.date),
  newest: (a, b) => b.year - a.year || b.score - a.score,
  oldest: (a, b) => a.year - b.year || b.score - a.score,
};

/**
 * @param {{
 *   genre?: string,
 *   year?: number|string,
 *   decade?: number|string,
 *   minScore?: number,
 *   maxScore?: number,
 *   sort?: 'recent'|'score'|'newest'|'oldest'
 * }} [filters]  `maxScore` is exclusive: the rating bands meet at their
 *   boundaries, and a record cannot be in two of them.
 * @returns {Promise<Album[]>}
 */
export const getAlbums = (filters = {}) => {
  const { genre, year, decade, minScore, maxScore, sort = 'recent' } = filters;

  const result = ALBUMS.filter((album) => {
    if (genre && !album.genres.includes(genre)) return false;
    if (year && String(album.year) !== String(year)) return false;
    if (decade && decadeOf(album.year) !== decadeOf(decade)) return false;
    if (minScore != null && album.score < minScore) return false;
    if (maxScore != null && album.score >= maxScore) return false;
    return true;
  });

  result.sort(COMPARE[sort] ?? COMPARE.recent);

  return respond(result);
};

/**
 * Looks an entry up by id in `collection`, rejecting with a 404 after the same
 * simulated delay a hit would have taken. Shared by every by-id getter so the
 * three of them cannot drift apart.
 */
const findById = (collection, id, notFoundMessage) => {
  const found = collection.find((entry) => entry.id === id);
  if (!found) {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new ApiError(notFoundMessage, 404)), latency());
    });
  }
  return respond(found);
};

/** @returns {Promise<Album>} */
export const getAlbumById = (id) => {
  return findById(ALBUMS, id, 'We could not find that review.');
};

/** Facets for the /reviews chips. Never fails: it is local metadata. */
export const getFacets = () => {
  const genres = [...new Set(ALBUMS.flatMap((a) => a.genres))].sort();
  const years = [...new Set(ALBUMS.map((a) => a.year))].sort((a, b) => b - a);
  // Decades, not years: the archive spans enough of them that a per-year list
  // is a scroll, and nobody browses records one year at a time.
  const decades = [...new Set(ALBUMS.map((a) => decadeOf(a.year)))].sort((a, b) => b - a);
  return respond({ genres, years, decades }, { canFail: false });
};

/** Submission from the /suggest form. Simulates a POST. */
export const submitSuggestion = (payload) => {
  return respond({ ok: true, received: payload });
};

/** News items, newest first. @returns {Promise<News[]>} */
export const getNews = () => {
  const result = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
  return respond(result);
};

/** A single news item by id. @returns {Promise<News>} */
export const getNewsById = (id) => {
  return findById(NEWS, id, 'We could not find that story.');
};

/** Long-form features. @returns {Promise<Feature[]>} */
export const getFeatures = () => {
  const result = [...FEATURES].sort((a, b) => b.date.localeCompare(a.date));
  return respond(result);
};

/** A single feature by id. @returns {Promise<Feature>} */
export const getFeatureById = (id) => {
  return findById(FEATURES, id, 'We could not find that feature.');
};
