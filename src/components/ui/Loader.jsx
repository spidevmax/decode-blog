import './Loader.css';

/**
 * Loading state. `variant="grid"` paints skeletons shaped like the cards
 * so the layout does not jump when data arrives.
 */
const Loader = ({ variant = 'spinner', count = 6, label = 'Loading…' }) => {
  if (variant === 'grid') {
    return (
      <div className="loader-grid" role="status" aria-live="polite">
        <span className="visually-hidden">{label}</span>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="skeleton-card" aria-hidden="true">
            <div className="skeleton-card__cover shimmer" />
            <div className="skeleton-card__line shimmer" />
            <div className="skeleton-card__line skeleton-card__line--short shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__disc" aria-hidden="true" />
      <p className="loader__label">{label}</p>
    </div>
  );
};

export default Loader;
