import { getAlbumById, getAlbums, getFacets } from '@/services/api';
import { useAsync } from './useAsync';

/**
 * Album list, optionally filtered.
 *
 * The filters are spread into `useAsync`'s dependency array one by one rather
 * than passed as an object: the hook refetches on the serialised deps, and a
 * fresh object literal every render would serialise the same but is clearer
 * kept flat — each filter is visibly a reason to go back to the API.
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

  const { data, loading, error, retry } = useAsync(
    (g, y, d, min, max, s) =>
      getAlbums({
        genre: g,
        year: y,
        decade: d,
        minScore: min,
        maxScore: max,
        sort: s,
      }),
    [genre, year, decade, minScore, maxScore, sort],
  );

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
 * A second request for the genre's listing, and one that can fail on its own
 * while the review itself loaded fine. Nothing here reports an error: the
 * links are an addition to a page that already works, so if the list does not
 * arrive they are simply not offered.
 */
export const useAlbumNeighbours = (id, genre) => {
  const { albums } = useAlbums({ genre: genre ?? null, sort: 'score' });

  const index = albums.findIndex((album) => album.id === id);
  if (index === -1) return { better: null, worse: null };

  return {
    better: albums[index - 1] ?? null,
    worse: albums[index + 1] ?? null,
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
