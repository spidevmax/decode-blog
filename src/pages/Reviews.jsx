import { useSearchParams } from 'react-router-dom';
import AlbumCard from '@/components/album/AlbumCard';
import AlbumGrid from '@/components/album/AlbumGrid';
import { Button, ErrorState, FilterSelect, Loader, Pagination } from '@/components/ui';
import { useAlbums, useFacets } from '@/hooks/useAlbums';
import { usePagination } from '@/hooks/usePagination';
import './Reviews.css';

/** Cards per page: three full rows of the four-column grid. */
const PER_PAGE = 12;

/** Sort is always one of these; `score` is the default and stays out of the URL. */
const SORT_OPTIONS = [
  { value: 'score', label: 'Highest rated' },
  { value: 'recent', label: 'Most recent' },
];

/**
 * The review archive and its filters, in one place.
 *
 * Filters live in the URL (?genre, ?year, ?sort) so a filtered view is
 * shareable and the back button works. Default sort is by score: with no
 * filters applied this is still the canonical "best to worst" listing.
 */
const Reviews = () => {
  const [params, setParams] = useSearchParams();
  const genre = params.get('genre');
  const year = params.get('year');
  const sort = params.get('sort') ?? 'score';

  const { facets } = useFacets();
  const { albums, loading, error, retry } = useAlbums({ genre, year, sort });
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

  const hasFilters = Boolean(genre || year);

  // Each list opens with the way out of the filter, so clearing one never
  // means hunting for a separate control.
  const genreOptions = [
    { value: null, label: 'All genres' },
    ...facets.genres.map((g) => ({ value: g, label: g })),
  ];

  const yearOptions = [
    { value: null, label: 'All years' },
    ...facets.years.map((y) => ({ value: String(y), label: String(y) })),
  ];

  return (
    <div className="section">
      <div className="container">
        <header className="reviews__head">
          <p className="eyebrow">Every review</p>
          <h1 className="reviews__title">Reviews</h1>
          <p className="reviews__lede">
            Every record that came through the newsroom, filtered by genre and year.
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
              label="Year"
              value={year}
              options={yearOptions}
              onSelect={(value) => setFilter('year', value)}
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

        {loading && <Loader variant="grid" count={6} label="Loading reviews…" />}

        {error && !loading && (
          <ErrorState subject="the reviews" error={error} onRetry={retry} />
        )}

        {!loading && !error && (
          <>
            {albums.length === 0 ? (
              <div className="reviews__empty">
                <p>No reviews match those filters.</p>
                <Button variant="accent" onClick={() => setParams({}, { replace: true })}>
                  Show all
                </Button>
              </div>
            ) : (
              <>
                <AlbumGrid variant="even">
                  {pageItems.map((album, i) => (
                    <AlbumCard key={album.id} album={album} index={i} />
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
