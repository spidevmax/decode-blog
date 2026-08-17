import './SaveButton.css';

import { useFavorites } from '@/hooks/useFavorites';

/**
 * Save toggle shared by reviews, news and features.
 *
 * Owns the wording and the accessible label so the three content types cannot
 * drift apart. `variant="icon"` is the bare star used on cards and rows;
 * `variant="row"` is the full-width bar at the foot of a detail page.
 *
 * @param {'review'|'news'|'feature'} type
 * @param {string} title  used only for the screen-reader label
 */
const SaveButton = ({ type, id, title, variant = 'icon', className = '' }) => {
  const { isFavorite, toggle } = useFavorites();
  const saved = isFavorite(id, type);

  const label = saved ? `Remove ${title} from saved` : `Save ${title}`;
  const classes = `save save--${variant}${saved ? ' save--on' : ''} ${className}`.trim();

  return (
    <button
      type="button"
      className={classes}
      onClick={() => toggle(id, type)}
      aria-pressed={saved}
      aria-label={variant === 'icon' ? label : undefined}
      title={variant === 'icon' ? label : undefined}
    >
      <span aria-hidden="true">{saved ? '★' : '☆'}</span>
      {variant === 'row' && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
};

export default SaveButton;
