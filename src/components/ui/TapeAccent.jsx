import './TapeAccent.css';

/**
 * Cinta adhesiva decorativa. Se posiciona en absoluto respecto del ancestro
 * con `position: relative`. Puramente ornamental → aria-hidden.
 *
 * @param {'top-left'|'top-right'|'bottom-left'|'bottom-right'|'top-center'} position
 * @param {number} rotate  grados de inclinación
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
