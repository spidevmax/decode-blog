import { Link } from 'react-router-dom';
import './GenreTag.css';

/**
 * Tag de género. Sin `to` es una etiqueta estática; con `to` navega.
 * `as="button"` lo convierte en chip seleccionable (usado en /explore).
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
