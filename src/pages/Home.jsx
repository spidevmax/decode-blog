import { Link } from 'react-router-dom';
import AlbumCard from '@/components/album/AlbumCard';
import AlbumCover from '@/components/album/AlbumCover';
import AlbumGrid from '@/components/album/AlbumGrid';
import GenreTag from '@/components/album/GenreTag';
import RatingBadge from '@/components/album/RatingBadge';
import EditorialCard from '@/components/editorial/EditorialCard';
import LatestStrip from '@/components/editorial/LatestStrip';
import { Button, ErrorState, Loader } from '@/components/ui';
import { useHomeFeed } from '@/hooks/useHomeFeed';
import './Home.css';

const Home = () => {
  const { hero, feed, latest, loading, error, retry } = useHomeFeed();

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
        <ErrorState subject="the latest reviews" error={error} onRetry={retry} />
      </div>
    );
  }

  return (
    <>
      <LatestStrip items={latest} />

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
                  <GenreTag key={g} to={`/reviews?genre=${encodeURIComponent(g)}`}>
                    {g}
                  </GenreTag>
                ))}
              </div>

              <div className="hero__actions">
                <Button to={`/reviews/${hero.id}`} variant="accent" size="lg">
                  Read the review
                </Button>
                <Button to="/reviews" variant="ghost" size="lg">
                  All reviews
                </Button>
              </div>
            </div>

            <div className="hero__collage">
              <Link to={`/reviews/${hero.id}`} className="hero__cover-link">
                <AlbumCover album={hero} className="cover--lg" />
              </Link>
              {/* Overlaps the bottom-right corner of the cover. */}
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
            <h2 id="latest-title">From the newsroom</h2>
            <Link to="/reviews" className="section-head__link">
              All reviews
            </Link>
          </div>

          {/* Reviews carry the grid; news and features are dropped in between
              them, each with its own card and type chip. */}
          <AlbumGrid>
            {feed.map(({ kind, item }, i) =>
              kind === 'review' ? (
                <AlbumCard
                  key={`review-${item.id}`}
                  album={item}
                  index={i}
                  showType
                  // The first one in the grid spans 2x2
                  variant={i === 0 ? 'feature' : 'default'}
                />
              ) : (
                <EditorialCard key={`${kind}-${item.id}`} kind={kind} item={item} />
              ),
            )}
          </AlbumGrid>
        </div>
      </section>
    </>
  );
};

export default Home;
