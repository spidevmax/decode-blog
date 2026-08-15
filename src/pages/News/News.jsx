import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, ErrorState, Loader, SaveButton } from '@/components/ui';
import FilterSelect from '@/components/ui/FilterSelect';
import Pagination from '@/components/ui/Pagination';
import { useNews } from '@/hooks/useEditorial';
import { usePagination } from '@/hooks/usePagination';
import { formatDayOfMonth, formatLongDate, formatMonthLabel } from '@/utils/dates';
import { groupByMonth } from './News.helpers';
import './News.css';

const PER_PAGE = 6;

/**
 * The news archive, read as a diary.
 *
 * Items are grouped by month and the month rule sticks to the top while its
 * own items scroll past, so the date column can drop to a bare day number:
 * the heading above it supplies the rest. The filter lives in the URL
 * (?source), like the /reviews filters, so a filtered archive is shareable.
 */
const News = () => {
  const [params, setParams] = useSearchParams();
  const source = params.get('source');

  const { news, loading, error, retry } = useNews();

  // No category field in the dataset: the source is the only real facet, and
  // it is already what the aside prints.
  const sources = useMemo(
    () => [...new Set(news.map((item) => item.source))].sort(),
    [news],
  );

  const filtered = useMemo(
    () => (source ? news.filter((item) => item.source === source) : news),
    [news, source],
  );

  const { page, pages, pageItems, setPage } = usePagination(filtered, PER_PAGE);
  const months = useMemo(() => groupByMonth(pageItems), [pageItems]);

  const sourceOptions = [
    { value: null, label: 'All sources' },
    ...sources.map((name) => ({ value: name, label: name })),
  ];

  const setSource = (value) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete('source');
    else next.set('source', value);
    // A new filter means a new result set: page 3 of the old one is meaningless.
    next.delete('page');
    setParams(next, { replace: true });
  };

  return (
    <div className="section">
      <div className="container">
        <header className="news__head">
          <p className="eyebrow">Latest</p>
          <h1 className="news__title">News</h1>
          <p className="news__lede">
            What happens around the records: labels, gigs, tours and archives.
          </p>
        </header>

        {loading && <Loader label="Loading news…" />}

        {error && !loading && (
          <ErrorState subject="the news" error={error} onRetry={retry} />
        )}

        {!loading && !error && (
          <>
            <div className="filters">
              <p className="filters__lead" aria-hidden="true">
                Showing
              </p>

              <div className="filters__controls">
                <FilterSelect
                  label="Source"
                  value={source}
                  options={sourceOptions}
                  onSelect={setSource}
                />
              </div>

              {source && (
                <Button variant="ghost" size="sm" onClick={() => setSource(null)}>
                  Clear filter
                </Button>
              )}

              <p className="filters__count" role="status" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
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
                <p>No news from that source.</p>
                <Button variant="accent" onClick={() => setSource(null)}>
                  Show all
                </Button>
              </div>
            ) : (
              <>
                <div className="news__archive">
                  {months.map((month) => (
                    <section key={month.key} className="news-month">
                      <h2 className="news-month__label">
                        <time dateTime={month.key}>{formatMonthLabel(month.date)}</time>
                      </h2>

                      <ul className="news-month__list">
                        {month.items.map((item) => (
                          <li key={item.id} className="news-item">
                            {/* The month heading carries month and year, so the
                                column prints the day alone. The full date stays
                                for anyone who is not reading the heading. */}
                            <time className="news-item__date" dateTime={item.date}>
                              <span aria-hidden="true">
                                {formatDayOfMonth(item.date)}
                              </span>
                              <span className="visually-hidden">
                                {formatLongDate(item.date)}
                              </span>
                            </time>

                            <div className="news-item__text">
                              <h3 className="news-item__title">
                                {/* Stretched link: the whole row is clickable,
                                    as on AlbumCard */}
                                <Link to={`/news/${item.id}`} className="news-item__link">
                                  {item.title}
                                </Link>
                              </h3>
                              <p className="news-item__excerpt">{item.excerpt}</p>
                            </div>

                            <div className="news-item__aside">
                              <p className="news-item__source">{item.source}</p>
                              <SaveButton
                                type="news"
                                id={item.id}
                                title={item.title}
                                className="news-item__save"
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>

                <Pagination
                  page={page}
                  pages={pages}
                  onChange={setPage}
                  label="News pagination"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default News;
