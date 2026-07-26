import './AlbumCover.css';

/**
 * Portada generada por CSS a partir de `album.cover` ({from, to, pattern}).
 * Evita depender de imágenes binarias y mantiene la paleta del sistema.
 * Decorativa: el título ya se anuncia en el texto de la card.
 */
const AlbumCover = ({ album, className = '' }) => {
  const { from, to, pattern } = album.cover;

  return (
    <div
      className={`cover cover--${pattern} ${className}`.trim()}
      style={{ '--cover-from': from, '--cover-to': to }}
      aria-hidden="true"
    >
      <span className="cover__title">{album.title}</span>
      <span className="cover__artist">{album.artist}</span>
    </div>
  );
};

export default AlbumCover;
