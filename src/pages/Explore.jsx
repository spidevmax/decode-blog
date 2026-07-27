import { useSearchParams } from 'react-router-dom';
import AlbumCard from '@/components/album/AlbumCard';
import AlbumGrid from '@/components/album/AlbumGrid';
import GenreTag from '@/components/album/GenreTag';
import { Button, ErrorState, Loader } from '@/components/ui';
import { useAlbums, useFacets } from '@/hooks/useAlbums';
import './Explore.css';

const Explore = () => {
  // Filters live in the URL: shareable and back-button friendly.
  const [params, setParams] = useSearchParams();
  const genre = params.get('genre');
  const year = params.get('year');
  const sort = params.get('sort') ?? 'recent';

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
        <header className="explore__head">
          <p className="eyebrow">Archive</p>
          <h1 className="explore__title">Explore</h1>
          <p className="explore__lede">
            Everything we have reviewed, filtered by genre and year.
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
                selected={sort === 'recent'}
                onClick={() => setFilter('sort', 'recent')}
              >
                Most recent
              </GenreTag>
              <GenreTag
                as="button"
                selected={sort === 'score'}
                onClick={() => setFilter('sort', 'score')}
              >
                Highest score
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

        {loading && <Loader variant="grid" count={6} label="Filtering…" />}

        {error && !loading && <ErrorState error={error} onRetry={retry} />}

        {!loading && !error && (
          <>
            <p className="explore__count" role="status" aria-live="polite">
              {albums.length} {albums.length === 1 ? 'review' : 'reviews'}
            </p>

            {albums.length === 0 ? (
              <div className="explore__empty">
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

export default Explore;
