import './AlbumGrid.css';

/**
 * Grilla de cards de álbum.
 *
 * Existe como componente —y no como clase suelta en el CSS de una página—
 * para que la dependencia sea explícita: la usan Home, Explore y Reviews,
 * y antes se definía en Home.css, de modo que tocar Home rompía a las otras.
 *
 * @param {'asymmetric'|'even'} variant  `asymmetric` deja que la primera card
 *   ocupe 2x2 (portada de Home); `even` reparte todas por igual.
 */
const AlbumGrid = ({ children, variant = 'asymmetric' }) => {
  return (
    <div className={`album-grid${variant === 'even' ? ' album-grid--even' : ''}`}>
      {children}
    </div>
  );
};

export default AlbumGrid;
