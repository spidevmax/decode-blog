import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, ErrorState, Loader, SaveButton } from '@/components/ui';
import FilterSelect from '@/components/ui/FilterSelect';
import Pagination from '@/components/ui/Pagination';
import { useFeatures } from '@/hooks/useEditorial';
import { usePagination } from '@/hooks/usePagination';
import { formatLongDate } from '@/utils/dates';
import './Features.css';

/** A lead across both columns, then three full rows of two. */
const PER_PAGE = 7;

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

const kickerColor = (kicker) => KICKER_COLORS[kicker] ?? 'var(--color-magenta)';

/**
 * The long-read archive.
 *
 * The kicker was already a taxonomy the reader could see — four types, four
 * colours — so it is also the filter, held in the URL (?kicker) like the
 * /reviews filters. The first piece on every page runs across both columns:
 * a section front opens with something rather than with a uniform grid.
 */
const Features = () => {
  const [params, setParams] = useSearchParams();
  const kicker = params.get('kicker');

  const { features, loading, error, retry } = useFeatures();

  const kickers = useMemo(
    () => [...new Set(features.map((item) => item.kicker))].sort(),
    [features],
  );

  const filtered = useMemo(
    () => (kicker ? features.filter((item) => item.kicker === kicker) : features),
    [features, kicker],
  );

  const { page, pages, pageItems, setPage } = usePagination(filtered, PER_PAGE);

  const kickerOptions = [
    { value: null, label: 'All types' },
    ...kickers.map((name) => ({ value: name, label: name })),
  ];

  const setKicker = (value) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete('kicker');
    else next.set('kicker', value);
    // A new filter means a new result set: page 2 of the old one is meaningless.
    next.delete('page');
    setParams(next, { replace: true });
  };

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
            <div className="filters">
              <p className="filters__lead" aria-hidden="true">
                Showing
              </p>

              <div className="filters__controls">
                <FilterSelect
                  label="Type"
                  value={kicker}
                  options={kickerOptions}
                  onSelect={setKicker}
                />
              </div>

              {kicker && (
                <Button variant="ghost" size="sm" onClick={() => setKicker(null)}>
                  Clear filter
                </Button>
              )}

              <p className="filters__count" role="status" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
                {pages > 1 && (
                  <span className="filters__page-of">
                    {' '}
                    · page {page} of {pages}
                  </span>
                )}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="listing-empty">
                <p>No features of that type.</p>
                <Button variant="accent" onClick={() => setKicker(null)}>
                  Show all
                </Button>
              </div>
            ) : (
              <>
                <div className="features__grid">
                  {pageItems.map((item, index) => (
                    <article
                      key={item.id}
                      className={`feature-card${index === 0 ? ' feature-card--lead' : ''}`}
                      style={{ '--kicker-color': kickerColor(item.kicker) }}
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
                        <time dateTime={item.date}>{formatLongDate(item.date)}</time>
                        <span aria-hidden="true"> · </span>
                        {item.readingTime} read
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
          </>
        )}
      </div>
    </div>
  );
};

export default Features;
