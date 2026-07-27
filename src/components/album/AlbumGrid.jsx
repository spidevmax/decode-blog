import './AlbumGrid.css';

/**
 * Grid of album cards.
 *
 * It exists as a component — rather than a loose class in a page stylesheet —
 * so the dependency is explicit: Home, Explore and Reviews all use it, and it
 * used to live in Home.css, so touching Home broke the others.
 *
 * @param {'asymmetric'|'even'} variant  `asymmetric` lets the first card span
 *   2x2 (Home's lead); `even` spreads them evenly.
 */
const AlbumGrid = ({ children, variant = 'asymmetric' }) => {
  return (
    <div className={`album-grid${variant === 'even' ? ' album-grid--even' : ''}`}>
      {children}
    </div>
  );
};

export default AlbumGrid;
