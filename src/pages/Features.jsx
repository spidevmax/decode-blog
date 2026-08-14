import { Link } from 'react-router-dom';
import { ErrorState, Loader, Pagination, SaveButton } from '@/components/ui';
import { useFeatures } from '@/hooks/useEditorial';
import { usePagination } from '@/hooks/usePagination';
import { formatLongDate } from '@/utils/dates';
import './Features.css';

/** Three full rows of the two-column grid. */
const PER_PAGE = 6;

/**
 * Kicker colour by content type, so a given kind of piece always reads the
 * same way. Anything unlisted falls back to magenta.
 */
const KICKER_COLORS = {
  Analysis: 'var(--color-mostaza)',
  Feature: 'var(--color-oliva)',
  Report: 'var(--color-terracota)',
  Interview: 'var(--color-petrol)',
};

const Features = () => {
  const { features, loading, error, retry } = useFeatures();
  const { page, pages, pageItems, setPage } = usePagination(features, PER_PAGE);

  return (
    <div className="section">
      <div className="container">
        <header className="features__head">
          <p className="eyebrow">Long reads</p>
          <h1 className="features__title">Features</h1>
          <p className="features__lede">
            Essays, reports and long-form pieces on the music we review.
          </p>
        </header>

        {loading && <Loader label="Loading features…" />}

        {error && !loading && (
          <ErrorState subject="the features" error={error} onRetry={retry} />
        )}

        {!loading && !error && (
          <>
            <div className="features__grid">
              {pageItems.map((item) => (
                <article
                  key={item.id}
                  className="feature-card"
                  style={{
                    '--kicker-color':
                      KICKER_COLORS[item.kicker] ?? 'var(--color-magenta)',
                  }}
                >
                  <div className="feature-card__top">
                    <p className="feature-card__kicker">{item.kicker}</p>
                    <SaveButton
                      type="feature"
                      id={item.id}
                      title={item.title}
                      className="feature-card__save"
                    />
                  </div>
                  <h2 className="feature-card__title">
                    {/* Stretched link: the whole card is clickable, as on AlbumCard */}
                    <Link to={`/features/${item.id}`} className="feature-card__link">
                      {item.title}
                    </Link>
                  </h2>
                  <p className="feature-card__excerpt">{item.excerpt}</p>
                  <p className="feature-card__meta">
                    {item.author}
                    <span aria-hidden="true"> · </span>
                    <time dateTime={item.date}>{formatLongDate(item.date)}</time>
                    <span aria-hidden="true"> · </span>
                    {item.readingTime}
                  </p>
                </article>
              ))}
            </div>

            <Pagination
              page={page}
              pages={pages}
              onChange={setPage}
              label="Features pagination"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Features;
