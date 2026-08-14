import { memo } from 'react';
import { Link } from 'react-router-dom';
import TypeChip from '@/components/editorial/TypeChip';
import { SaveButton } from '@/components/ui';
import { formatLongDate } from '@/utils/dates';
import './EditorialCard.css';

/**
 * A news story or a feature, sized to sit inside the reviews grid.
 *
 * Deliberately lighter than AlbumCard: no artwork and no score, because
 * neither exists for editorial content and faking them would blur the very
 * distinction this card is here to make. What tells the two apart at a glance
 * is the absence of a cover plus the coloured type chip.
 *
 * @param {'news'|'feature'} kind
 */
const EditorialCard = ({ kind, item }) => {
  const to = kind === 'news' ? `/news/${item.id}` : `/features/${item.id}`;

  // News carries a source, features carry a reading time.
  const meta =
    kind === 'news' ? item.source : item.readingTime && `${item.readingTime} read`;

  return (
    <article className={`editorial-card editorial-card--${kind}`}>
      <div className="editorial-card__top">
        <TypeChip kind={kind} />
        <SaveButton
          type={kind}
          id={item.id}
          title={item.title}
          className="editorial-card__save"
        />
      </div>

      <p className="editorial-card__date">
        <time dateTime={item.date}>{formatLongDate(item.date)}</time>
      </p>

      <h3 className="editorial-card__title">
        {/* Stretched link: the whole card is clickable, as on AlbumCard */}
        <Link to={to} className="editorial-card__link">
          {item.title}
        </Link>
      </h3>

      <p className="editorial-card__excerpt">{item.excerpt}</p>

      {meta && <p className="editorial-card__meta">{meta}</p>}
    </article>
  );
};

export default memo(EditorialCard);
