/**
 * Data access layer.
 *
 * Today it resolves against an in-memory dataset, but simulates latency and
 * network failures so the hooks' loading/error states behave for real. Once a
 * backend exists, swap the body of these functions for fetch() and no
 * component needs to change.
 *
 * The dataset is imported dynamically rather than at the top of the file. It
 * is ~85KB of review prose and feature copy, and a static import puts all of
 * it in the entry chunk: every reader downloads the whole archive before the
 * first paint, including the one who landed on /suggest and will never read a
 * word of it. Loaded this way it becomes its own chunk, fetched when something
 * actually asks for data — which is exactly the shape a real `fetch()` will
 * have, so the day this layer talks to a server, the call sites do not move.
 */

/** Reads a numeric build-time env var, falling back when unset or malformed. */
const envNumber = (value, fallback) => {
  if (value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

/**
 * Network simulation: on in development, off in a production build.
 *
 * The dropped requests and the half-second wait exist to keep the loading and
 * error states honest while building — states that are never exercised are
 * states that quietly rot. Neither is a property of the data, though, so a
 * deployed build serves the dataset it already holds in memory, immediately:
 * an 8% failure rate in front of a reader is not a rehearsal, it is a broken
 * site, and half a second of invented delay is half a second stolen.
 *
 * Both are overridable at build time — `VITE_API_FAIL_RATE=0.3 npm run dev` to
 * lean on the error states, `VITE_API_FAIL_RATE=0.08` on a preview deploy to
 * show someone what a bad connection looks like. Vite inlines `import.meta.env`
 * when it compiles, so these are read at build time, not at runtime.
 */
const SIMULATE_NETWORK = import.meta.env?.DEV ?? false;

const FAIL_RATE = envNumber(
  import.meta.env?.VITE_API_FAIL_RATE,
  SIMULATE_NETWORK ? 0.08 : 0,
);

/** Upper bound of the simulated round trip, in ms. The floor is two thirds of it. */
const LATENCY_MAX = envNumber(
  import.meta.env?.VITE_API_LATENCY,
  SIMULATE_NETWORK ? 600 : 0,
);
const LATENCY_MIN = LATENCY_MAX * (2 / 3);

/**
 * The dataset, in two halves.
 *
 * Records and editorial are split because the pages are: /news has no use for
 * sixty album reviews, and /reviews has none for the features. Each half is
 * fetched at most once — the promise is kept, not the module — so concurrent
 * callers share one download and later ones resolve immediately.
 *
 * Literal paths, so the bundler can see exactly which two files these are.
 */
let albumsChunk = null;
const albumsData = () =>
  (albumsChunk ??= import('./mocks/albums.data').then((m) => m.ALBUMS));

let editorialChunk = null;
const editorialData = () => (editorialChunk ??= import('./mocks/editorial.data'));

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
export const getAlbums = async (filters = {}) => {
  const { genre, year, decade, minScore, maxScore, sort = 'recent' } = filters;
  const ALBUMS = await albumsData();

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
export const getAlbumById = async (id) => {
  return findById(await albumsData(), id, 'We could not find that review.');
};

/** Facets for the /reviews chips. Never fails: it is local metadata. */
export const getFacets = async () => {
  const ALBUMS = await albumsData();

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
export const getNews = async () => {
  const { NEWS } = await editorialData();
  const result = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
  return respond(result);
};

/** A single news item by id. @returns {Promise<News>} */
export const getNewsById = async (id) => {
  const { NEWS } = await editorialData();
  return findById(NEWS, id, 'We could not find that story.');
};

/** Long-form features. @returns {Promise<Feature[]>} */
export const getFeatures = async () => {
  const { FEATURES } = await editorialData();
  const result = [...FEATURES].sort((a, b) => b.date.localeCompare(a.date));
  return respond(result);
};

/** A single feature by id. @returns {Promise<Feature>} */
export const getFeatureById = async (id) => {
  const { FEATURES } = await editorialData();
  return findById(FEATURES, id, 'We could not find that feature.');
};
