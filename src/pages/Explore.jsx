import { useSearchParams } from 'react-router-dom';
import AlbumCard from '../components/AlbumCard';
import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import GenreTag from '../components/GenreTag';
import Loader from '../components/Loader';
import { useAlbums, useFacets } from '../hooks/useAlbums';
import './Explore.css';

const Explore = () => {
  // Los filtros viven en la URL: se puede compartir y volver atrás.
  const [params, setParams] = useSearchParams();
  const genre = params.get('genero');
  const year = params.get('anio');
  const sort = params.get('orden') ?? 'recent';

  const { facets } = useFacets();
  const { albums, loading, error, retry } = useAlbums({ genre, year, sort });

  /** Setea o limpia un parámetro; volver a elegir el mismo chip lo deselecciona. */
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null || next.get(key) === String(value)) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setParams(next, { replace: true });
  };

  const hasFilters = Boolean(genre || year);

  return (
    <div className="section">
      <div className="container">
        <header className="explore__head">
          <p className="eyebrow">Archivo</p>
          <h1 className="explore__title">Explorar</h1>
          <p className="explore__lede">
            Todo lo que reseñamos, filtrable por género y por año.
          </p>
        </header>

        <div className="filters">
          <fieldset className="filters__group">
            <legend className="filters__legend">Género</legend>
            <div className="filters__chips">
              {facets.genres.map((g) => (
                <GenreTag
                  key={g}
                  as="button"
                  selected={genre === g}
                  onClick={() => setFilter('genero', g)}
                >
                  {g}
                </GenreTag>
              ))}
            </div>
          </fieldset>

          <fieldset className="filters__group">
            <legend className="filters__legend">Año</legend>
            <div className="filters__chips">
              {facets.years.map((y) => (
                <GenreTag
                  key={y}
                  as="button"
                  selected={year === String(y)}
                  onClick={() => setFilter('anio', y)}
                >
                  {y}
                </GenreTag>
              ))}
            </div>
          </fieldset>

          <fieldset className="filters__group">
            <legend className="filters__legend">Orden</legend>
            <div className="filters__chips">
              <GenreTag
                as="button"
                selected={sort === 'recent'}
                onClick={() => setFilter('orden', 'recent')}
              >
                Más recientes
              </GenreTag>
              <GenreTag
                as="button"
                selected={sort === 'score'}
                onClick={() => setFilter('orden', 'score')}
              >
                Mejor puntaje
              </GenreTag>
            </div>
          </fieldset>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParams({}, { replace: true })}
            >
              Limpiar filtros
            </Button>
          )}
        </div>

        {loading && <Loader variant="grid" count={6} label="Filtrando…" />}

        {error && !loading && <ErrorState error={error} onRetry={retry} />}

        {!loading && !error && (
          <>
            <p className="explore__count" role="status" aria-live="polite">
              {albums.length} {albums.length === 1 ? 'reseña' : 'reseñas'}
            </p>

            {albums.length === 0 ? (
              <div className="explore__empty">
                <p>No hay reseñas con esos filtros.</p>
                <Button variant="accent" onClick={() => setParams({}, { replace: true })}>
                  Ver todas
                </Button>
              </div>
            ) : (
              <div className="album-grid album-grid--even">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
