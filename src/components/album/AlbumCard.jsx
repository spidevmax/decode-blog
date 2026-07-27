import { Link } from 'react-router-dom';
import AlbumCover from './AlbumCover';
import GenreTag from './GenreTag';
import RatingBadge from './RatingBadge';
import TapeAccent from '@/components/ui/TapeAccent';
import { useFavorites } from '@/hooks/useFavorites';
import './AlbumCard.css';

/**
 * @param {'default'|'feature'} variant  `feature` spans 2x2 in the grid and
 *   shows the excerpt.
 */
const AlbumCard = ({ album, variant = 'default' }) => {
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(album.id);
  const isFeature = variant === 'feature';

  return (
    <article className={`album-card album-card--${variant}`}>
      {isFeature && <TapeAccent position="top-right" rotate={7} width="8rem" />}

      <div className="album-card__media">
        <AlbumCover album={album} className={isFeature ? 'cover--lg' : ''} />
        <div className="album-card__rating">
          <RatingBadge score={album.score} size={isFeature ? 'md' : 'sm'} />
        </div>
      </div>

      <div className="album-card__body">
        <p className="album-card__artist">{album.artist}</p>

        <h3 className="album-card__title">
          {/* Stretched link: the whole card is clickable, no nested interactives */}
          <Link to={`/reviews/${album.id}`} className="album-card__link">
            {album.title}
          </Link>
        </h3>

        <p className="album-card__meta">
          {album.year} · {album.label}
        </p>

        {isFeature && <p className="album-card__excerpt">{album.excerpt}</p>}

        <div className="album-card__tags">
          {album.genres.map((genre) => (
            <GenreTag key={genre}>{genre}</GenreTag>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`album-card__fav${saved ? ' album-card__fav--on' : ''}`}
        onClick={() => toggle(album.id)}
        aria-pressed={saved}
        aria-label={
          saved
            ? `Remove ${album.title} from favourites`
            : `Save ${album.title} to favourites`
        }
      >
        <span aria-hidden="true">{saved ? '★' : '☆'}</span>
      </button>
    </article>
  );
};

export default AlbumCard;
