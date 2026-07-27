import AlbumCard from '@/components/album/AlbumCard';
import AlbumGrid from '@/components/album/AlbumGrid';
import { ErrorState, Loader } from '@/components/ui';
import { useAlbums } from '@/hooks/useAlbums';
import './Reviews.css';

/**
 * Full review archive, sorted by score.
 * Unlike /explore it offers no filters: this is the canonical listing.
 */
const Reviews = () => {
  const { albums, loading, error, retry } = useAlbums({ sort: 'score' });

  return (
    <div className="section">
      <div className="container">
        <header className="reviews__head">
          <p className="eyebrow">Every review</p>
          <h1 className="reviews__title">Reviews</h1>
          <p className="reviews__lede">
            Every record that came through the newsroom, best score to worst.
          </p>
        </header>

        {loading && <Loader variant="grid" count={6} label="Loading reviews…" />}

        {error && !loading && <ErrorState error={error} onRetry={retry} />}

        {!loading && !error && (
          <>
            <p className="reviews__count" role="status" aria-live="polite">
              {albums.length} {albums.length === 1 ? 'review' : 'reviews'}
            </p>

            <AlbumGrid variant="even">
              {albums.map((album) => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </AlbumGrid>
          </>
        )}
      </div>
    </div>
  );
};

export default Reviews;
