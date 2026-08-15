import { getAlbumById, getAlbums, getFacets } from '@/services/api';
import { useAsync } from './useAsync';

/**
 * Album list, optionally filtered.
 *
 * The filters are normalised into a single object with a fixed key order and
 * handed to `getAlbums` as one argument. Two reasons it is not an arrow that
 * spreads six positional parameters, which is what this used to be: `useAsync`
 * keys its cache on the fetcher's identity, and an inline arrow is a new
 * function on every render; and the serialised object is the cache key, so it
 * has to serialise identically for the same filters, which a literal written
 * in one place does and six loose arguments only do by accident.
 */
export const useAlbums = (filters = {}) => {
  const {
    genre = null,
    year = null,
    decade = null,
    minScore = null,
    maxScore = null,
    sort = 'recent',
  } = filters;

  const { data, loading, error, retry } = useAsync(getAlbums, [
    { genre, year, decade, minScore, maxScore, sort },
  ]);

  return { albums: data ?? [], loading, error, retry };
};

/** A single review by id. */
export const useAlbum = (id) => {
  const { data, loading, error, retry } = useAsync(getAlbumById, [id], {
    enabled: Boolean(id),
  });
  return { album: data, loading, error, retry };
};

/**
 * The reviews either side of this one within a genre, best first.
 *
 * Records do not sit in a timeline the way news does, so the neighbour worth
 * offering is another record of the same kind — the relation the genre tags
 * at the top of the page already point at. Ordered by score, which is how the
 * archive lists itself by default.
 *
 * A second request for the listing, and one that can fail on its own while
 * the review itself loaded fine. Nothing here reports an error: the links are
 * an addition to a page that already works, so if the list does not arrive
 * they are simply not offered.
 *
 * The genre is *not* part of the request. It comes from the album, which is
 * still loading when this runs, so asking the API to filter by it would make
 * this fetch wait for that one and then start over the moment it arrived —
 * two round trips in a row, the first of them thrown away. Fetching the whole
 * scored listing starts immediately, in parallel with the review, and the
 * filtering happens here on data already in hand. It is also the same request
 * /reviews makes with its default sort, so on a second visit it is free.
 */
export const useAlbumNeighbours = (id, genre) => {
  const { albums } = useAlbums({ sort: 'score' });

  const sameGenre = genre
    ? albums.filter((album) => album.genres.includes(genre))
    : albums;

  const index = sameGenre.findIndex((album) => album.id === id);
  if (index === -1) return { better: null, worse: null };

  return {
    better: sameGenre[index - 1] ?? null,
    worse: sameGenre[index + 1] ?? null,
  };
};

/** Facets (genres / years) for the filter chips. */
export const useFacets = () => {
  const { data, loading, error, retry } = useAsync(getFacets, []);
  return {
    facets: data ?? { genres: [], years: [], decades: [] },
    loading,
    error,
    retry,
  };
};
