import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ArticleBody from '@/components/editorial/ArticleBody';
import ArticleHeader from '@/components/editorial/ArticleHeader';
import ReadingProgress from '@/components/editorial/ReadingProgress';
import { ErrorState, Loader, SaveButton } from '@/components/ui';
import { useFeature, useFeatureNeighbours } from '@/hooks/useEditorial';
import { formatLongDate } from '@/utils/dates';
import './ArticleDetail.css';

/**
 * Kicker colour by content type — the same four the archive files pieces
 * under, carried through so a Report does not arrive in Analysis colours.
 * Duplicated from Features.jsx on purpose: the two pages are code-split, and
 * a shared module for four lines would be loaded by both to serve one.
 */
const KICKER_COLORS = {
  Analysis: 'var(--color-mostaza)',
  Feature: 'var(--color-oliva)',
  Report: 'var(--color-terracota)',
  Interview: 'var(--color-petrol)',
};

/**
 * A single long-form feature.
 *
 * Like news, features have no score, so there is no RatingBadge here either.
 * They do carry a pull quote, which ArticleBody places after the first
 * paragraph exactly as on a review.
 *
 * The excerpt runs as a dek under the title rather than as the first block of
 * prose: it summarises what follows, which is a job for the header band.
 */
const FeatureDetail = () => {
  const { id } = useParams();
  const { feature, loading, error, retry } = useFeature(id);
  const { later, earlier } = useFeatureNeighbours(id, feature?.kicker);

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

  const accent = KICKER_COLORS[feature.kicker] ?? 'var(--color-magenta)';

  return (
    <article
      className="article article--plain article--feature"
      style={{ '--kicker-color': accent }}
    >
      <ReadingProgress />

      <ArticleHeader title={feature.title}>
        {/* The kicker is a filter on the archive, so it opens one. */}
        <Link
          to={`/features?kicker=${encodeURIComponent(feature.kicker)}`}
          className="eyebrow article__kicker-link"
        >
          {feature.kicker}
        </Link>

        <p className="article__dek">{feature.excerpt}</p>

        <p className="article__meta">
          <time dateTime={feature.date}>{formatLongDate(feature.date)}</time>
          <span className="article__meta-sep" aria-hidden="true">
            ·
          </span>
          {feature.readingTime} read
        </p>

        <div className="article__actions">
          <SaveButton
            type="feature"
            id={feature.id}
            title={feature.title}
            variant="row"
          />
        </div>
      </ArticleHeader>

      <div className="container">
        <ArticleBody paragraphs={feature.body} pullQuote={feature.pullQuote}>
          <footer className="article__footer">
            <SaveButton type="feature" id={feature.id} title={feature.title} />
            <Link to="/features" className="article__back">
              ← Back to features
            </Link>
          </footer>

          {/* Between long reads the useful relation is kind, not date: the
              neighbours here are the next and previous piece of this type. */}
          {(earlier || later) && (
            <nav
              className="article__nav"
              aria-label={`More ${feature.kicker.toLowerCase()} pieces`}
            >
              {later && (
                <Link to={`/features/${later.id}`} className="article-step">
                  <span className="article-step__label">Newer {feature.kicker}</span>
                  <span className="article-step__title">{later.title}</span>
                </Link>
              )}

              {earlier && (
                <Link
                  to={`/features/${earlier.id}`}
                  className="article-step article-step--earlier"
                >
                  <span className="article-step__label">Older {feature.kicker}</span>
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

export default FeatureDetail;
