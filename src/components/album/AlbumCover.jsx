import './AlbumCover.css';

/**
 * Cover art rendered in CSS from `album.cover` ({from, to, pattern}).
 * Decorative: the title is already announced by the card text.
 *
 * NOTE: the dataset now ships `cover` as an image URL, so this renders blank.
 * Either restore the {from, to, pattern} shape or switch this to an <img>.
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
