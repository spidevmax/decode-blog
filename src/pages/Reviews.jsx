import { useSearchParams } from 'react-router-dom';
import AlbumCard from '@/components/album/AlbumCard';
import AlbumGrid from '@/components/album/AlbumGrid';
import GenreTag from '@/components/album/GenreTag';
import { Button, ErrorState, Loader } from '@/components/ui';
import { useAlbums, useFacets } from '@/hooks/useAlbums';
import './Reviews.css';

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

  /** Sets or clears a param; picking the same chip again deselects it. */
  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value === null || next.get(key) === String(value)) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }
    setParams(next, { replace: true });
  };

  const hasFilters = Boolean(genre || year);

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

        <div className="filters">
          <fieldset className="filters__group">
            <legend className="filters__legend">Genre</legend>
            <div className="filters__chips">
              {facets.genres.map((g) => (
                <GenreTag
                  key={g}
                  as="button"
                  selected={genre === g}
                  onClick={() => setFilter('genre', g)}
                >
                  {g}
                </GenreTag>
              ))}
            </div>
          </fieldset>

          <fieldset className="filters__group">
            <legend className="filters__legend">Year</legend>
            <div className="filters__chips">
              {facets.years.map((y) => (
                <GenreTag
                  key={y}
                  as="button"
                  selected={year === String(y)}
                  onClick={() => setFilter('year', y)}
                >
                  {y}
                </GenreTag>
              ))}
            </div>
          </fieldset>

          <fieldset className="filters__group">
            <legend className="filters__legend">Sort</legend>
            <div className="filters__chips">
              <GenreTag
                as="button"
                selected={sort === 'score'}
                onClick={() => setFilter('sort', 'score')}
              >
                Highest score
              </GenreTag>
              <GenreTag
                as="button"
                selected={sort === 'recent'}
                onClick={() => setFilter('sort', 'recent')}
              >
                Most recent
              </GenreTag>
            </div>
          </fieldset>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setParams({}, { replace: true })}
            >
              Clear filters
            </Button>
          )}
        </div>

        {loading && <Loader variant="grid" count={6} label="Loading reviews…" />}

        {error && !loading && <ErrorState error={error} onRetry={retry} />}

        {!loading && !error && (
          <>
            <p className="reviews__count" role="status" aria-live="polite">
              {albums.length} {albums.length === 1 ? 'review' : 'reviews'}
            </p>

            {albums.length === 0 ? (
              <div className="reviews__empty">
                <p>No reviews match those filters.</p>
                <Button variant="accent" onClick={() => setParams({}, { replace: true })}>
                  Show all
                </Button>
              </div>
            ) : (
              <AlbumGrid variant="even">
                {albums.map((album) => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </AlbumGrid>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;
