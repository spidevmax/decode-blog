import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArticleBody from '@/components/editorial/ArticleBody';
import ArticleHeader from '@/components/editorial/ArticleHeader';
import { ErrorState, Loader, SaveButton } from '@/components/ui';
import { useNewsItem } from '@/hooks/useEditorial';
import { formatLongDate } from '@/utils/dates';
import './ArticleDetail.css';

/**
 * A single news story.
 *
 * News items carry no score and no artwork, so this view drops the
 * RatingBadge and the cover slot rather than inventing either. They also have
 * no pull quote, which ArticleBody already treats as optional.
 */
const NewsDetail = () => {
  const { id } = useParams();
  const { item, loading, error, retry } = useNewsItem(id);

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
          <span aria-hidden="true"> · </span>
          {item.source}
        </p>
      </ArticleHeader>

      <div className="container">
        <ArticleBody lede={item.excerpt} paragraphs={item.body}>
          <footer className="article__footer">
            <SaveButton type="news" id={item.id} title={item.title} />
            <Link to="/news" className="article__back">
              ← Back to news
            </Link>
          </footer>
        </ArticleBody>
      </div>
    </article>
  );
};

export default NewsDetail;
