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

/**
 * @param {{ genre?: string, year?: number|string, sort?: 'recent'|'score' }} [filters]
 * @returns {Promise<Album[]>}
 */
export const getAlbums = (filters = {}) => {
  const { genre, year, sort = 'recent' } = filters;

  let result = ALBUMS.filter((album) => {
    if (genre && !album.genres.includes(genre)) return false;
    if (year && String(album.year) !== String(year)) return false;
    return true;
  });

  result = [...result].sort((a, b) =>
    sort === 'score' ? b.score - a.score : b.date.localeCompare(a.date),
  );

  return respond(result);
};

/** @returns {Promise<Album>} */
export const getAlbumById = (id) => {
  const album = ALBUMS.find((a) => a.id === id);
  if (!album) {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new ApiError('We could not find that review.', 404)),
        latency(),
      );
    });
  }
  return respond(album);
};

/** Facets for the /explore chips. Never fails: it is local metadata. */
export const getFacets = () => {
  const genres = [...new Set(ALBUMS.flatMap((a) => a.genres))].sort();
  const years = [...new Set(ALBUMS.map((a) => a.year))].sort((a, b) => b - a);
  return respond({ genres, years }, { canFail: false });
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

/** Long-form features. @returns {Promise<Feature[]>} */
export const getFeatures = () => {
  const result = [...FEATURES].sort((a, b) => b.date.localeCompare(a.date));
  return respond(result);
};
