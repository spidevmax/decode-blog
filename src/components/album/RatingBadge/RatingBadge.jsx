import { ratingTone } from './RatingBadge.helpers';
import './RatingBadge.css';

const RatingBadge = ({ score, size = 'md' }) => {
  const tone = ratingTone(score);
  // Always one decimal: 8 → "8.0"
  const label = score.toFixed(1);

  return (
    <div
      className={`rating rating--${tone} rating--${size}`}
      role="img"
      aria-label={`Score ${label} out of 10`}
    >
      <span className="rating__score">{label}</span>
    </div>
  );
};

export default RatingBadge;
