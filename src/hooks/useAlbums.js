import { getAlbumById, getAlbums, getFacets } from '@/services/api';
import { useAsync } from './useAsync';

/** Lista de álbumes, opcionalmente filtrada. */
export const useAlbums = (filters = {}) => {
  const { genre = null, year = null, sort = 'recent' } = filters;
  const { data, loading, error, retry } = useAsync(
    (g, y, s) => getAlbums({ genre: g, year: y, sort: s }),
    [genre, year, sort],
  );
  return { albums: data ?? [], loading, error, retry };
};

/** Una reseña por id. */
export const useAlbum = (id) => {
  const { data, loading, error, retry } = useAsync(getAlbumById, [id], {
    enabled: Boolean(id),
  });
  return { album: data, loading, error, retry };
};

/** Facetas (géneros / años) para los chips de filtro. */
export const useFacets = () => {
  const { data, loading, error, retry } = useAsync(getFacets, []);
  return { facets: data ?? { genres: [], years: [] }, loading, error, retry };
};
