import { Link } from 'react-router-dom';
import AlbumCard from '@/components/album/AlbumCard';
import AlbumCover from '@/components/album/AlbumCover';
import AlbumGrid from '@/components/album/AlbumGrid';
import GenreTag from '@/components/album/GenreTag';
import RatingBadge from '@/components/album/RatingBadge';
import EditorialCard from '@/components/editorial/EditorialCard';
import LatestStrip from '@/components/editorial/LatestStrip';
import { Button, ErrorState, Loader } from '@/components/ui';
import { HOME_FEED_LIMIT, useHomeFeed } from '@/hooks/useHomeFeed';
import './Home.css';

const Home = () => {
  const { hero, feed, latest, loading, error, retry } = useHomeFeed();

  if (loading) {
    return (
      <div className="container section">
        <Loader variant="grid" count={HOME_FEED_LIMIT} label="Loading reviews…" />
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

              {/* One call, not two. The archive is reachable from the nav,
                  from the section below and from every card; a second button
                  of the same size here only splits the one action the hero
                  exists to prompt. */}
              <div className="hero__actions">
                <Button to={`/reviews/${hero.id}`} variant="accent" size="lg">
                  Read the review
                </Button>
              </div>
            </div>

            <div className="hero__collage">
              {/* Artwork and score in one block, so the badge is positioned
                  against the sleeve it hangs off rather than against the
                  caption underneath it. */}
              <div className="hero__artwork">
                <Link
                  to={`/reviews/${hero.id}`}
                  className="hero__cover-link"
                  // The cover image is decorative, so the link would
                  // otherwise have no name to announce.
                  aria-label={`Read the review of ${hero.title}`}
                >
                  <AlbumCover album={hero} className="cover--lg" />
                </Link>
                {/* Overlaps the bottom-right corner of the cover. */}
                <div className="hero__rating">
                  <RatingBadge score={hero.score} size="lg" />
                </div>
              </div>
              {/* Caption to the artwork: what the sleeve is, not who wrote
                  about it. The record's own credits, in its own order. */}
              <p className="hero__byline">
                {hero.artist} · {hero.year} · {hero.label}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="section section--panel" aria-labelledby="latest-title">
        <div className="container">
          <div className="section-head">
            {/* Named for what the grid actually carries: reviews, with news
                and features dropped in between them. The link matches. */}
            <h2 id="latest-title">Latest reviews</h2>
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
