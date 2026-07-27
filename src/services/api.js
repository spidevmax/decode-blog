import { ALBUMS } from './mocks/albums.data';
import { FEATURES, NEWS } from './mocks/editorial.data';

/**
 * Capa de acceso a datos.
 *
 * Hoy resuelve contra un dataset en memoria, pero simula latencia y fallas de
 * red para que los estados de loading/error de los hooks sean reales. El día
 * que exista un backend, se reemplaza el cuerpo de estas funciones por fetch()
 * y ningún componente se entera.
 */

const LATENCY_MIN = 400;
const LATENCY_MAX = 600;

/** Probabilidad de falla simulada. Se apaga en test vía VITE_API_FAIL_RATE=0. */
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

/** Resuelve `value` tras un delay, o rechaza para simular una caída de red. */
const respond = (value, { canFail = true } = {}) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (canFail && Math.random() < FAIL_RATE) {
        reject(new ApiError('No pudimos conectar con el servidor.', 503));
        return;
      }
      // Copia defensiva: nadie muta el "backend" desde un componente.
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
        () => reject(new ApiError('No encontramos esa reseña.', 404)),
        latency(),
      );
    });
  }
  return respond(album);
};

/** Facetas para los chips de /explore. No falla: es metadata local. */
export const getFacets = () => {
  const genres = [...new Set(ALBUMS.flatMap((a) => a.genres))].sort();
  const years = [...new Set(ALBUMS.map((a) => a.year))].sort((a, b) => b - a);
  return respond({ genres, years }, { canFail: false });
};

/** Envío del formulario de /suggest. Simula un POST. */
export const submitSuggestion = (payload) => {
  return respond({ ok: true, received: payload });
};

/** Noticias breves, de la más reciente a la más vieja. @returns {Promise<News[]>} */
export const getNews = () => {
  const result = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
  return respond(result);
};

/** Artículos de fondo. @returns {Promise<Feature[]>} */
export const getFeatures = () => {
  const result = [...FEATURES].sort((a, b) => b.date.localeCompare(a.date));
  return respond(result);
};
