import './GenreTag.css';

import { Link } from 'react-router-dom';

/**
 * Genre tag. Without `to` it is a static label; with `to` it navigates.
 * `as="button"` turns it into a selectable chip (used on /reviews).
 */
const GenreTag = ({ children, to, as, selected = false, onClick, ...rest }) => {
  const className = `genre-tag${selected ? ' genre-tag--selected' : ''}`;

  if (as === 'button') {
    return (
      <button
        type="button"
        className={className}
        aria-pressed={selected}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    );
  }

  if (to) {
    return (
      <Link to={to} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <span className={className} {...rest}>
      {children}
    </span>
  );
};

export default GenreTag;
