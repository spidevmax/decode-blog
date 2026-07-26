import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AlbumCover from '../components/AlbumCover';
import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import GenreTag from '../components/GenreTag';
import Loader from '../components/Loader';
import RatingBadge from '../components/RatingBadge';
import TapeAccent from '../components/TapeAccent';
import { useAlbum } from '../hooks/useAlbums';
import { useFavorites } from '../hooks/useFavorites';
import './ReviewDetail.css';

/** Convierte *texto* en <em>texto</em>, preservando el resto como texto plano. */
const renderEmphasis = (text) => {
  return text
    .split(/(\*[^*]+\*)/g)
    .map((chunk, i) =>
      chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2 ? (
        <em key={i}>{chunk.slice(1, -1)}</em>
      ) : (
        chunk
      ),
    );
};

const DATE_FORMAT = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const ReviewDetail = () => {
  const { id } = useParams();
  const { album, loading, error, retry } = useAlbum(id);
  const { isFavorite, toggle } = useFavorites();

  // Cada reseña arranca desde arriba.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Cargando reseña…" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="container section">
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  const saved = isFavorite(album.id);
  // El pull quote se intercala después del primer párrafo.
  const [firstPara, ...restParas] = album.body;

  return (
    <article className="review">
      <header className="review__header">
        <div className="container review__header-inner">
          <div className="review__cover-wrap">
            <TapeAccent position="top-left" rotate={-7} width="8rem" />
            <TapeAccent position="bottom-right" rotate={6} width="6rem" color="red" />
            <AlbumCover album={album} className="cover--lg" />
            <div className="review__rating">
              <RatingBadge score={album.score} size="lg" />
            </div>
          </div>

          <div className="review__intro">
            <p className="eyebrow">Reseña</p>
            <h1 className="review__title">{album.title}</h1>
            <p className="review__artist">{album.artist}</p>

            <dl className="review__facts">
              <div>
                <dt>Año</dt>
                <dd>{album.year}</dd>
              </div>
              <div>
                <dt>Sello</dt>
                <dd>{album.label}</dd>
              </div>
              <div>
                <dt>Duración</dt>
                <dd>{album.duration}</dd>
              </div>
              <div>
                <dt>Tracks</dt>
                <dd>{album.tracks}</dd>
              </div>
            </dl>

            <div className="review__tags">
              {album.genres.map((g) => (
                <GenreTag key={g} to={`/explore?genero=${encodeURIComponent(g)}`}>
                  {g}
                </GenreTag>
              ))}
            </div>

            <Button
              variant={saved ? 'primary' : 'ghost'}
              onClick={() => toggle(album.id)}
              aria-pressed={saved}
            >
              {saved ? '★ Guardada' : '☆ Guardar reseña'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container review__body">
        <p className="review__byline">
          Por {album.reviewer} ·{' '}
          <time dateTime={album.date}>{DATE_FORMAT.format(new Date(album.date))}</time>
        </p>

        <p className="review__lede">{album.excerpt}</p>

        <p>{renderEmphasis(firstPara)}</p>

        <blockquote className="pull-quote">
          <p>{album.pullQuote}</p>
        </blockquote>

        {restParas.map((para, i) => (
          <p key={i}>{renderEmphasis(para)}</p>
        ))}

        <footer className="review__footer">
          <RatingBadge score={album.score} size="md" />
          <p className="review__verdict">
            {album.title} — {album.artist}
          </p>
          <Link to="/explore" className="review__back">
            ← Volver a explorar
          </Link>
        </footer>
      </div>
    </article>
  );
};

export default ReviewDetail;
