import { Link } from 'react-router-dom';
import AlbumCard from '../components/AlbumCard';
import AlbumCover from '../components/AlbumCover';
import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import GenreTag from '../components/GenreTag';
import Loader from '../components/Loader';
import RatingBadge from '../components/RatingBadge';
import TapeAccent from '../components/TapeAccent';
import { useAlbums } from '../hooks/useAlbums';
import './Home.css';

const Home = () => {
  const { albums, loading, error, retry } = useAlbums();

  if (loading) {
    return (
      <div className="container section">
        <Loader variant="grid" count={6} label="Cargando reseñas…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container section">
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  // El destacado es el marcado como `featured`; si no hay, el más reciente.
  const hero = albums.find((a) => a.featured) ?? albums[0];
  const rest = albums.filter((a) => a.id !== hero?.id);

  return (
    <>
      {hero && (
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero__inner">
            <div className="hero__text">
              <p className="eyebrow">Reseña destacada</p>
              <h1 id="hero-title" className="hero__title">
                {hero.title}
              </h1>
              <p className="hero__artist">{hero.artist}</p>
              <p className="hero__excerpt">{hero.excerpt}</p>

              <div className="hero__tags">
                {hero.genres.map((g) => (
                  <GenreTag key={g} to={`/explore?genero=${encodeURIComponent(g)}`}>
                    {g}
                  </GenreTag>
                ))}
              </div>

              <div className="hero__actions">
                <Button to={`/reviews/${hero.id}`} variant="accent" size="lg">
                  Leer la reseña
                </Button>
                <Button to="/explore" variant="ghost" size="lg">
                  Explorar todo
                </Button>
              </div>
            </div>

            <div className="hero__collage">
              <TapeAccent position="top-left" rotate={-9} width="9rem" />
              <TapeAccent position="bottom-right" rotate={5} width="7rem" color="red" />
              <Link to={`/reviews/${hero.id}`} className="hero__cover-link">
                <AlbumCover album={hero} className="cover--lg" />
              </Link>
              <div className="hero__rating">
                <RatingBadge score={hero.score} size="lg" />
              </div>
              <p className="hero__byline">
                por {hero.reviewer} · {hero.year}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="section section--panel" aria-labelledby="latest-title">
        <div className="container">
          <div className="section-head">
            <h2 id="latest-title">Últimas reseñas</h2>
            <Link to="/explore" className="section-head__link">
              Ver todas
            </Link>
          </div>

          <div className="album-grid">
            {rest.map((album, i) => (
              <AlbumCard
                key={album.id}
                album={album}
                // La primera de la grilla ocupa 2x2
                variant={i === 0 ? 'feature' : 'default'}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
