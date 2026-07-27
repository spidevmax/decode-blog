import { Link } from 'react-router-dom';
import AlbumCard from '@/components/album/AlbumCard';
import AlbumCover from '@/components/album/AlbumCover';
import AlbumGrid from '@/components/album/AlbumGrid';
import GenreTag from '@/components/album/GenreTag';
import RatingBadge from '@/components/album/RatingBadge';
import { Button, ErrorState, Loader, TapeAccent } from '@/components/ui';
import { useAlbums } from '@/hooks/useAlbums';
import './Home.css';

const Home = () => {
  const { albums, loading, error, retry } = useAlbums();

  if (loading) {
    return (
      <div className="container section">
        <Loader variant="grid" count={6} label="Loading reviews…" />
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

  // The lead is whichever is flagged `featured`; otherwise the most recent.
  const hero = albums.find((a) => a.featured) ?? albums[0];
  const rest = albums.filter((a) => a.id !== hero?.id);

  return (
    <>
      {hero && (
        <section className="hero" aria-labelledby="hero-title">
          <div className="container hero__inner">
            <div className="hero__text">
              <p className="eyebrow">Featured review</p>
              <h1 id="hero-title" className="hero__title">
                {hero.title}
              </h1>
              <p className="hero__artist">{hero.artist}</p>
              <p className="hero__excerpt">{hero.excerpt}</p>

              <div className="hero__tags">
                {hero.genres.map((g) => (
                  <GenreTag key={g} to={`/explore?genre=${encodeURIComponent(g)}`}>
                    {g}
                  </GenreTag>
                ))}
              </div>

              <div className="hero__actions">
                <Button to={`/reviews/${hero.id}`} variant="accent" size="lg">
                  Read the review
                </Button>
                <Button to="/explore" variant="ghost" size="lg">
                  Explore all
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
                by {hero.reviewer} · {hero.year}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="section section--panel" aria-labelledby="latest-title">
        <div className="container">
          <div className="section-head">
            <h2 id="latest-title">Latest reviews</h2>
            <Link to="/explore" className="section-head__link">
              View all
            </Link>
          </div>

          <AlbumGrid>
            {rest.map((album, i) => (
              <AlbumCard
                key={album.id}
                album={album}
                // The first one in the grid spans 2x2
                variant={i === 0 ? 'feature' : 'default'}
              />
            ))}
          </AlbumGrid>
        </div>
      </section>
    </>
  );
};

export default Home;
