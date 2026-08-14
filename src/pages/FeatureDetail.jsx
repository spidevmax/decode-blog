import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArticleBody from '@/components/editorial/ArticleBody';
import ArticleHeader from '@/components/editorial/ArticleHeader';
import { ErrorState, Loader, SaveButton } from '@/components/ui';
import { useFeature } from '@/hooks/useEditorial';
import { formatLongDate } from '@/utils/dates';
import './ArticleDetail.css';

/**
 * A single long-form feature.
 *
 * Like news, features have no score, so there is no RatingBadge here either.
 * They do carry a pull quote, which ArticleBody places after the first
 * paragraph exactly as on a review.
 */
const FeatureDetail = () => {
  const { id } = useParams();
  const { feature, loading, error, retry } = useFeature(id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="container section">
        <Loader label="Loading feature…" />
      </div>
    );
  }

  if (error || !feature) {
    return (
      <div className="container section">
        <ErrorState
          subject="that feature"
          error={error}
          onRetry={retry}
          backTo="/features"
          backLabel="All features"
        />
      </div>
    );
  }

  const byline = `By ${feature.author} · ${feature.readingTime} read`;

  return (
    <article className="article article--plain">
      <ArticleHeader eyebrow={feature.kicker} title={feature.title}>
        <p className="article__meta">
          <time dateTime={feature.date}>{formatLongDate(feature.date)}</time>
        </p>
      </ArticleHeader>

      <div className="container">
        <ArticleBody
          byline={byline}
          lede={feature.excerpt}
          paragraphs={feature.body}
          pullQuote={feature.pullQuote}
        >
          <footer className="article__footer">
            <SaveButton type="feature" id={feature.id} title={feature.title} />
            <Link to="/features" className="article__back">
              ← Back to features
            </Link>
          </footer>
        </ArticleBody>
      </div>
    </article>
  );
};

export default FeatureDetail;
