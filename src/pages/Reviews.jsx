import './Reviews.css';

import { useSearchParams } from 'react-router-dom';

import AlbumCard from '@/components/album/AlbumCard';
import AlbumGrid from '@/components/album/AlbumGrid';
import {
  bandRange,
  bandRangeLabel,
  RATING_BANDS,
} from '@/components/album/RatingBadge/RatingBadge.helpers';
import { Button, ErrorState, Loader } from '@/components/ui';
import FilterSelect from '@/components/ui/FilterSelect';
import Pagination from '@/components/ui/Pagination';
import { useAlbums, useFacets } from '@/hooks/useAlbums';
import { usePagination } from '@/hooks/usePagination';

/** Cards per page: three full rows of the four-column grid. */
const PER_PAGE = 12;

/** Sort is always one of these; `score` is the default and stays out of the URL. */
const SORT_OPTIONS = [
  { value: 'score', label: 'Highest rated' },
  { value: 'recent', label: 'Latest reviews' },
  { value: 'newest', label: 'Newest records' },
  { value: 'oldest', label: 'Oldest records' },
];

/**
 * The review archive and its filters, in one place.
 *
 * Filters live in the URL (?genre, ?decade, ?rated, ?sort) so a filtered view
 * is shareable and the back button works. Default sort is by score: with no
 * filters applied this is still the canonical "best to worst" listing.
 *
 * The verdict bands get their own row above the grid rather than another
 * dropdown. They are the scale this publication runs on — the same four names
 * the footer prints, in the same colours the badges paint — so they are the
 * argument of the page, not one more control on it.
 */
const Reviews = () => {
  const [params, setParams] = useSearchParams();
  const genre = params.get('genre');
  const decade = params.get('decade');
  const rated = params.get('rated');
  const sort = params.get('sort') ?? 'score';

  const { facets } = useFacets();

  const range = bandRange(rated);
  const { albums, loading, error, retry } = useAlbums({
    genre,
    decade,
    sort,
    minScore: range?.min,
    maxScore: range?.max,
  });
  const { page, pages, pageItems, setPage } = usePagination(albums, PER_PAGE);

  /** Sets a param, or clears it when the value is null. */
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, String(value));
    // A new filter means a new result set: page 3 of the old one is meaningless.
    next.delete('page');
    setParams(next, { replace: true });
  };

  const hasFilters = Boolean(genre || decade || rated);

  // Each list opens with the way out of the filter, so clearing one never
  // means hunting for a separate control.
  const genreOptions = [
    { value: null, label: 'All genres' },
    ...facets.genres.map((g) => ({ value: g, label: g })),
  ];

  const decadeOptions = [
    { value: null, label: 'All decades' },
    ...facets.decades.map((d) => ({ value: String(d), label: `${d}s` })),
  ];

  return (
    <div className="section">
      <div className="container">
        <header className="reviews__head">
          <p className="eyebrow">Every review</p>
          <h1 className="reviews__title">Reviews</h1>
          <p className="reviews__lede">
            Every record that came through the newsroom, scored out of ten and kept on
            file.
          </p>
        </header>

        {/* One line that states what you are looking at, rather than a wall of
            82 chips. Each control carries its own current value. */}
        <div className="filters">
          <p className="filters__lead" aria-hidden="true">
            Showing
          </p>

          <div className="filters__controls">
            <FilterSelect
              label="Genre"
              value={genre}
              options={genreOptions}
              onSelect={(value) => setFilter('genre', value)}
            />
            <FilterSelect
              label="Decade"
              value={decade}
              options={decadeOptions}
              onSelect={(value) => setFilter('decade', value)}
            />
            <FilterSelect
              label="Sort by"
              value={sort}
              options={SORT_OPTIONS}
              onSelect={(value) => setFilter('sort', value === 'score' ? null : value)}
            />
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParams({}, { replace: true })}
            >
              Clear filters
            </Button>
          )}

          {/* The tally belongs to the same sentence as the filters, so it sits
              on the same line rather than repeating the layout below. */}
          {!loading && !error && (
            <p className="filters__count" role="status" aria-live="polite">
              {albums.length} {albums.length === 1 ? 'review' : 'reviews'}
              {pages > 1 && (
                <span className="filters__page-of">
                  {' '}
                  · page {page} of {pages}
                </span>
              )}
            </p>
          )}
        </div>

        {/* The scale, as navigation. Each band is painted in the colour its
            badges already carry, which is also the only place that code is
            explained where it is used. */}
        <div className="verdicts">
          <p className="verdicts__lead" id="verdicts-label">
            Verdict
          </p>

          <div className="verdicts__bands" role="group" aria-labelledby="verdicts-label">
            {RATING_BANDS.map((band) => {
              const active = rated === band.slug;

              return (
                <button
                  key={band.slug}
                  type="button"
                  className={`verdict verdict--${band.tone}${active ? ' verdict--on' : ''}`}
                  aria-pressed={active}
                  onClick={() => setFilter('rated', active ? null : band.slug)}
                >
                  <span className="verdict__label">{band.label}</span>
                  <span className="verdict__range">{bandRangeLabel(band.slug)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {loading && <Loader variant="grid" count={PER_PAGE} label="Loading reviews…" />}

        {error && !loading && (
          <ErrorState subject="the reviews" error={error} onRetry={retry} />
        )}

        {!loading && !error && (
          <>
            {albums.length === 0 ? (
              <div className="listing-empty">
                <p>No reviews match those filters.</p>
                <Button variant="accent" onClick={() => setParams({}, { replace: true })}>
                  Show all
                </Button>
              </div>
            ) : (
              <>
                <AlbumGrid variant="even">
                  {pageItems.map((album) => (
                    <AlbumCard key={album.id} album={album} />
                  ))}
                </AlbumGrid>

                <Pagination
                  page={page}
                  pages={pages}
                  onChange={setPage}
                  label="Reviews pagination"
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;
