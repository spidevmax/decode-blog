import { memo } from 'react';
import { Link } from 'react-router-dom';
import AlbumCover from './AlbumCover';
import GenreTag from './GenreTag';
import RatingBadge from './RatingBadge';
import { ratingTone } from './RatingBadge/RatingBadge.helpers';
import TypeChip from '@/components/editorial/TypeChip';
import { SaveButton } from '@/components/ui';
import './AlbumCard.css';

/** The verdict bands, as paint. Same four the badge and the footer key use. */
const TONE_COLORS = {
  magenta: 'var(--color-magenta)',
  petrol: 'var(--color-petrol)',
  mostaza: 'var(--color-mostaza)',
  terracota: 'var(--color-terracota)',
};

/**
 * Trading card: cover, rating overlaid top-right, then a foot strip carrying
 * the genres and the year, ruled in the colour of the record's verdict.
 *
 * That rule used to be a solid block of colour picked by grid position, which
 * meant the largest colour area on the card said nothing — and said it in the
 * same four hues the scoring bands use, so a magenta strip on a 6.0 actively
 * contradicted the badge above it. Now the only colour left on the card is
 * the one the score earns.
 *
 * @param {'default'|'feature'} variant  `feature` spans 2x2 in the grid and
 *   shows the excerpt.
 * @param {boolean} showType  adds the REVIEW chip. Only worth it in a grid
 *   that mixes content types — on /reviews everything is a review already.
 */
const AlbumCard = ({ album, variant = 'default', showType = false }) => {
  const isFeature = variant === 'feature';

  return (
    <article
      className={`album-card album-card--${variant}`}
      style={{ '--verdict-color': TONE_COLORS[ratingTone(album.score)] }}
    >
      <div className="album-card__media">
        <AlbumCover album={album} />
        {showType && (
          <div className="album-card__type">
            <TypeChip kind="review" />
          </div>
        )}
      </div>

      {/* A direct child of the card: overlays the cover on desktop, and takes
          its own column in the compact mobile row. */}
      <div className="album-card__rating">
        <RatingBadge score={album.score} size={isFeature ? 'md' : 'sm'} />
      </div>

      <div className="album-card__body">
        <h3 className="album-card__title">
          {/* Stretched link: the whole card is clickable, no nested interactives */}
          <Link to={`/reviews/${album.id}`} className="album-card__link">
            {album.title}
          </Link>
        </h3>

        <p className="album-card__artist">{album.artist}</p>

        {isFeature && <p className="album-card__excerpt">{album.excerpt}</p>}
      </div>

      {/* Foot strip: genres carried as real tags so filtering can read them. */}
      <div className="album-card__strip">
        <span className="album-card__genres">
          {album.genres.map((genre) => (
            <GenreTag key={genre}>{genre}</GenreTag>
          ))}
        </span>
        <span className="album-card__year">{album.year}</span>
      </div>

      <SaveButton
        type="review"
        id={album.id}
        title={album.title}
        className="album-card__fav"
      />
    </article>
  );
};

export default memo(AlbumCard);
