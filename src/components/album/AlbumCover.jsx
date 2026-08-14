import { useState } from 'react';
import './AlbumCover.css';

/**
 * Fallback artwork is generated from the album id, so a given album always
 * gets the same look and neighbouring cards do not repeat themselves.
 * Colours stay inside the palette declared in tokens.css.
 */
const PATTERNS = ['stripes', 'dots', 'grid', 'waves'];
const PAIRS = [
  ['var(--color-petrol)', 'var(--color-magenta)'],
  ['var(--color-magenta)', 'var(--color-terracota)'],
  ['var(--color-mostaza)', 'var(--color-oliva)'],
  ['var(--color-ink)', 'var(--color-petrol)'],
  ['var(--color-oliva)', 'var(--color-mostaza)'],
  ['var(--color-terracota)', 'var(--color-night)'],
];

const hash = (seed) =>
  [...String(seed)].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) >>> 0;

/**
 * Album cover.
 *
 * `album.cover` may be either an image URL or a `{from, to, pattern}` object
 * describing a CSS gradient. Anything else — or an image that fails to load,
 * which happens when a remote host blocks hotlinking — falls back to a
 * generated gradient so the card never renders empty.
 */
const AlbumCover = ({ album, className = '' }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const { cover } = album;
  const isUrl = typeof cover === 'string' && cover.trim() !== '';
  const isGradient = cover && typeof cover === 'object';

  if (isUrl && !imageFailed) {
    return (
      <div className={`cover cover--image ${className}`.trim()}>
        {/* Decorative: every card and header that shows a cover prints the
            title and the artist as text beside it, so describing the sleeve
            here only makes a screen reader say the record's name twice. */}
        <img
          className="cover__img"
          src={cover}
          alt=""
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  // Gradient: either the declared one, or derived from the album id.
  const seed = hash(album.id ?? album.title);
  const [seedFrom, seedTo] = PAIRS[seed % PAIRS.length];
  const from = isGradient ? cover.from : seedFrom;
  const to = isGradient ? cover.to : seedTo;
  const pattern = isGradient ? cover.pattern : PATTERNS[seed % PATTERNS.length];

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
