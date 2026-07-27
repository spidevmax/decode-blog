import { getAlbumById, getAlbums, getFacets } from '@/services/api';
import { useAsync } from './useAsync';

/** Album list, optionally filtered. */
export const useAlbums = (filters = {}) => {
  const { genre = null, year = null, sort = 'recent' } = filters;
  const { data, loading, error, retry } = useAsync(
    (g, y, s) => getAlbums({ genre: g, year: y, sort: s }),
    [genre, year, sort],
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

/** Facets (genres / years) for the filter chips. */
export const useFacets = () => {
  const { data, loading, error, retry } = useAsync(getFacets, []);
  return { facets: data ?? { genres: [], years: [] }, loading, error, retry };
};
