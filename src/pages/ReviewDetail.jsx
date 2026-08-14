import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AlbumCover from '@/components/album/AlbumCover';
import GenreTag from '@/components/album/GenreTag';
import RatingBadge from '@/components/album/RatingBadge';
import { ratingBand } from '@/components/album/RatingBadge/RatingBadge.helpers';
import ArticleBody from '@/components/editorial/ArticleBody';
import { ErrorState, Loader, SaveButton } from '@/components/ui';
import { useAlbum, useAlbumNeighbours } from '@/hooks/useAlbums';
import { formatLongDate } from '@/utils/dates';
import './ArticleDetail.css';
import './ReviewDetail.css';

/**
 * A single review.
 *
 * Shares its header and prose column with the news and feature pages; what is
 * specific here is the cover artwork, the score, the facts list and the
 * favourite toggle.
 */
const ReviewDetail = () => {
  const { id } = useParams();
  const { album, loading, error, retry } = useAlbum(id);

  // The first genre is the one the archive files a record under; the tags
  // above the review link to all of them.
  const primaryGenre = album?.genres?.[0];
  const { better, worse } = useAlbumNeighbours(id, primaryGenre);

  // Every review starts at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Loading review…" />
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="container section">
        <ErrorState
          subject="that review"
          error={error}
          onRetry={retry}
          backTo="/reviews"
          backLabel="All reviews"
        />
      </div>
    );
  }

  const band = ratingBand(album.score);

  /**
   * Left column: cover with the score overlaid, then one bordered block that
   * holds the facts grid and the save toggle as its bottom row.
   */
  const aside = (
    <>
      <div className="review__cover">
        <AlbumCover album={album} className="cover--lg" />
        <div className="review__rating">
          <RatingBadge score={album.score} size="lg" />
        </div>
      </div>

      <div className="review__specs">
        <dl className="review__facts">
          <div>
            <dt>Year</dt>
            <dd>{album.year}</dd>
          </div>
          <div>
            <dt>Label</dt>
            <dd>{album.label}</dd>
          </div>
          <div>
            <dt>Length</dt>
            <dd>{album.duration}</dd>
          </div>
          <div>
            <dt>Tracks</dt>
            <dd>{album.tracks}</dd>
          </div>
        </dl>

        <SaveButton type="review" id={album.id} title={album.title} variant="row" />
      </div>
    </>
  );

  return (
    <article className="article review section">
      <div className="container review__grid">
        <aside className="review__aside">{aside}</aside>

        <div className="review__main">
          <p className="eyebrow">Review</p>
          <h1 className="review__title">{album.title}</h1>
          <p className="review__artist">{album.artist}</p>

          {/* Labelled, because the page carries two dates: this one is when
              the review ran, and the facts list holds the record's year. */}
          <p className="review__credits">
            Reviewed <time dateTime={album.date}>{formatLongDate(album.date)}</time>
          </p>

          <div className="review__tags">
            {album.genres.map((g) => (
              <GenreTag key={g} to={`/reviews?genre=${encodeURIComponent(g)}`}>
                {g}
              </GenreTag>
            ))}
          </div>

          <ArticleBody
            lede={album.excerpt}
            paragraphs={album.body}
            pullQuote={album.pullQuote}
          >
            {/* The close names the verdict rather than repeating the title
                and the score you have already read twice. `Essential` is the
                word the footer key, the archive filter and the card rules all
                run on, and this is the one page that never said it. */}
            <footer className="article__footer">
              <p className={`review__verdict review__verdict--${band.tone}`}>
                <span className="review__verdict-label">{band.label}</span>
                <span className="review__verdict-score">{album.score.toFixed(1)}</span>
              </p>
              <Link to="/reviews" className="article__back">
                ← Back to reviews
              </Link>
            </footer>

            {/* Records are not a timeline: the neighbour worth offering is
                another one of the same kind, which is what the tags above
                already point at. */}
            {(better || worse) && (
              <nav className="article__nav" aria-label={`More ${primaryGenre}`}>
                {better && (
                  <Link to={`/reviews/${better.id}`} className="article-step">
                    <span className="article-step__label">Rated higher</span>
                    <span className="article-step__title">{better.title}</span>
                  </Link>
                )}

                {worse && (
                  <Link
                    to={`/reviews/${worse.id}`}
                    className="article-step article-step--earlier"
                  >
                    <span className="article-step__label">Rated lower</span>
                    <span className="article-step__title">{worse.title}</span>
                  </Link>
                )}
              </nav>
            )}
          </ArticleBody>
        </div>
      </div>
    </article>
  );
};

export default ReviewDetail;
