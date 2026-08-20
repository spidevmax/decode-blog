import './AlbumCard.css';

import { memo } from 'react';
import { Link } from 'react-router-dom';

import TypeChip from '@/components/editorial/TypeChip';
import { SaveButton } from '@/components/ui';

import AlbumCover from './AlbumCover';
import GenreTag from './GenreTag';
import RatingBadge from './RatingBadge';
import { ratingColor } from './RatingBadge/RatingBadge.helpers';

/**
 * Trading card: cover, rating overlaid top-right, then a foot strip carrying
 * the genres and the year, ruled in the colour of the record's verdict.
 *
 * Colour on this card means one thing: the score. The foot rule takes the
 * verdict's hue and nothing else picks a colour — the four tones *are* the
 * scoring bands, so a magenta strip under a 6.0 would contradict the badge
 * above it. An earlier version filled that rule by grid position, which made
 * the largest colour area on the card say something untrue.
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
      style={{ '--verdict-color': ratingColor(album.score) }}
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
