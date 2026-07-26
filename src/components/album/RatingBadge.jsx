import { ratingTone } from './rating';
import './RatingBadge.css';

const RatingBadge = ({ score, size = 'md' }) => {
  const tone = ratingTone(score);
  // Un decimal siempre: 8 → "8.0"
  const label = score.toFixed(1);

  return (
    <div
      className={`rating rating--${tone} rating--${size}`}
      role="img"
      aria-label={`Puntaje ${label} de 10`}
    >
      <span className="rating__score">{label}</span>
    </div>
  );
};

export default RatingBadge;
