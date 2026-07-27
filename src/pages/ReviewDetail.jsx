import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import AlbumCover from '@/components/album/AlbumCover';
import { Button, ErrorState, Loader, TapeAccent } from '@/components/ui';
import GenreTag from '@/components/album/GenreTag';
import RatingBadge from '@/components/album/RatingBadge';
import { useAlbum } from '@/hooks/useAlbums';
import { useFavorites } from '@/hooks/useFavorites';
import './ReviewDetail.css';

/** Turns *text* into <em>text</em>, leaving the rest as plain text. */
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

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const ReviewDetail = () => {
  const { id } = useParams();
  const { album, loading, error, retry } = useAlbum(id);
  const { isFavorite, toggle } = useFavorites();

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
        <ErrorState error={error} onRetry={retry} />
      </div>
    );
  }

  const saved = isFavorite(album.id);
  // The pull quote sits after the first paragraph.
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
            <p className="eyebrow">Review</p>
            <h1 className="review__title">{album.title}</h1>
            <p className="review__artist">{album.artist}</p>

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

            <div className="review__tags">
              {album.genres.map((g) => (
                <GenreTag key={g} to={`/explore?genre=${encodeURIComponent(g)}`}>
                  {g}
                </GenreTag>
              ))}
            </div>

            <Button
              variant={saved ? 'primary' : 'ghost'}
              onClick={() => toggle(album.id)}
              aria-pressed={saved}
            >
              {saved ? '★ Saved' : '☆ Save review'}
            </Button>
          </div>
        </div>
      </header>

      <div className="container review__body">
        <p className="review__byline">
          By {album.reviewer} ·{' '}
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
            ← Back to explore
          </Link>
        </footer>
      </div>
    </article>
  );
};

export default ReviewDetail;
