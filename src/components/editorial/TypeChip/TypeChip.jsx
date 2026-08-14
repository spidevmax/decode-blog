import './TypeChip.css';

/**
 * Identifies what kind of content a card holds, so a mixed grid can be read
 * at a glance.
 *
 * Colour carries the meaning, so the label is always spelled out too — the
 * chip has to work for anyone who cannot separate the three hues.
 */
const LABELS = {
  review: 'Review',
  news: 'News',
  feature: 'Feature',
};

const TypeChip = ({ kind }) => {
  const label = LABELS[kind];
  if (!label) return null;

  return <span className={`type-chip type-chip--${kind}`}>{label}</span>;
};

export default TypeChip;
