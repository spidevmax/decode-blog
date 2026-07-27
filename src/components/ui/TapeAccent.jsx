import './TapeAccent.css';

/**
 * Decorative tape. Positioned absolutely against the nearest ancestor with
 * `position: relative`. Purely ornamental → aria-hidden.
 *
 * @param {'top-left'|'top-right'|'bottom-left'|'bottom-right'|'top-center'} position
 * @param {number} rotate  tilt in degrees
 */
const TapeAccent = ({
  position = 'top-left',
  rotate = -8,
  width = '7rem',
  color = 'amber',
}) => {
  return (
    <span
      aria-hidden="true"
      className={`tape tape--${position} tape--${color}`}
      style={{ '--tape-rotate': `${rotate}deg`, '--tape-width': width }}
    />
  );
};

export default TapeAccent;
