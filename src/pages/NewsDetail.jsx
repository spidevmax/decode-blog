import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArticleBody from '@/components/editorial/ArticleBody';
import ArticleHeader from '@/components/editorial/ArticleHeader';
import { ErrorState, Loader, SaveButton } from '@/components/ui';
import { useNewsItem, useNewsNeighbours } from '@/hooks/useEditorial';
import { formatLongDate } from '@/utils/dates';
import './ArticleDetail.css';

/**
 * A single news story.
 *
 * News items carry no score and no artwork, so this view drops the
 * RatingBadge and the cover slot rather than inventing either. They also have
 * no pull quote, which ArticleBody already treats as optional.
 *
 * The excerpt is not printed: on a four-paragraph wire report the first
 * paragraph already says it, and running both makes the story open by
 * repeating itself. Features, which are long enough for a dek to earn its
 * place, keep theirs.
 */
const NewsDetail = () => {
  const { id } = useParams();
  const { item, loading, error, retry } = useNewsItem(id);
  const { later, earlier } = useNewsNeighbours(id);

  // Every story starts at the top, same as the review page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Loading story…" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container section">
        <ErrorState
          subject="that story"
          error={error}
          onRetry={retry}
          backTo="/news"
          backLabel="All news"
        />
      </div>
    );
  }

  return (
    <article className="article article--plain">
      <ArticleHeader eyebrow="News" title={item.title}>
        <p className="article__meta">
          <time dateTime={item.date}>{formatLongDate(item.date)}</time>
          <span className="article__meta-sep" aria-hidden="true">
            ·
          </span>
          {/* The source is also a filter on the archive, so it opens one. */}
          <Link
            to={`/news?source=${encodeURIComponent(item.source)}`}
            className="article__meta-link"
          >
            {item.source}
          </Link>
        </p>

        <div className="article__actions">
          <SaveButton type="news" id={item.id} title={item.title} variant="row" />
        </div>
      </ArticleHeader>

      <div className="container">
        <ArticleBody paragraphs={item.body}>
          <footer className="article__footer">
            <SaveButton type="news" id={item.id} title={item.title} />
            <Link to="/news" className="article__back">
              ← Back to news
            </Link>
          </footer>

          {/* The archive reads as a diary, so its neighbours are moments in
              time rather than a numbered sequence. */}
          {(earlier || later) && (
            <nav className="article__nav" aria-label="More news">
              {later && (
                <Link to={`/news/${later.id}`} className="article-step">
                  <span className="article-step__label">Later</span>
                  <span className="article-step__title">{later.title}</span>
                </Link>
              )}

              {earlier && (
                <Link
                  to={`/news/${earlier.id}`}
                  className="article-step article-step--earlier"
                >
                  <span className="article-step__label">Earlier</span>
                  <span className="article-step__title">{earlier.title}</span>
                </Link>
              )}
            </nav>
          )}
        </ArticleBody>
      </div>
    </article>
  );
};

export default NewsDetail;
