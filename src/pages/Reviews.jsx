import AlbumCard from '@/components/album/AlbumCard';
import { ErrorState, Loader } from '@/components/ui';
import { useAlbums } from '@/hooks/useAlbums';
import './Reviews.css';

/**
 * Archivo completo de reseñas, ordenado por puntaje.
 * A diferencia de /explore, no ofrece filtros: es el listado canónico.
 */
const Reviews = () => {
  const { albums, loading, error, retry } = useAlbums({ sort: 'score' });

  return (
    <div className="section">
      <div className="container">
        <header className="reviews__head">
          <p className="eyebrow">Todas las reseñas</p>
          <h1 className="reviews__title">Reseñas</h1>
          <p className="reviews__lede">
            Cada disco que pasó por la redacción, del mejor puntaje al peor.
          </p>
        </header>

        {loading && <Loader variant="grid" count={6} label="Cargando reseñas…" />}

        {error && !loading && <ErrorState error={error} onRetry={retry} />}

        {!loading && !error && (
          <>
            <p className="reviews__count" role="status" aria-live="polite">
              {albums.length} {albums.length === 1 ? 'reseña' : 'reseñas'}
            </p>

            <div className="album-grid album-grid--even">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;
