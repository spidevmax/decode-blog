import { Link } from 'react-router-dom';
import {
  bandRangeLabel,
  RATING_BANDS,
} from '@/components/album/RatingBadge/RatingBadge.helpers';
import './Footer.css';

/** Every destination, including the shelf, which the top nav reaches by star. */
const LINKS = [
  { to: '/', label: 'Home' },
  { to: '/reviews', label: 'Reviews' },
  { to: '/news', label: 'News' },
  { to: '/features', label: 'Features' },
  { to: '/suggest', label: 'Suggest' },
  { to: '/saved', label: 'Saved' },
];

/**
 * Site footer.
 *
 * Carries the scoring key. The four band colours run through the whole site —
 * the circle on every score, the rule at the foot of every card, the verdict
 * that closes every review — and this is the one place that says what they
 * mean. Bands, ranges and slugs all come from RatingBadge.helpers, so the key
 * cannot drift from the badge it explains or the filter it opens.
 *
 * Each band is a link: the page that defines the scale is also the shortest
 * way into it, and /reviews already filters by exactly these four.
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__identity">
          <p className="footer__brand">DECODE</p>
          <p className="footer__tag">Music criticism without courtesies.</p>
        </div>

        <section className="footer__scale" aria-labelledby="footer-scale">
          <h2 id="footer-scale" className="footer__scale-title">
            How we score
          </h2>
          <ul className="footer__bands">
            {RATING_BANDS.map(({ tone, label, slug }) => (
              <li key={tone} className="footer__band">
                <Link
                  to={`/reviews?rated=${slug}`}
                  className="footer__band-link"
                  aria-label={`${label}: every review scoring ${bandRangeLabel(slug)}`}
                >
                  <span
                    className={`footer__swatch footer__swatch--${tone}`}
                    aria-hidden="true"
                  />
                  <span className="footer__band-range">{bandRangeLabel(slug)}</span>
                  <span className="footer__band-label">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="container footer__foot">
        <nav className="footer__nav" aria-label="Footer">
          {LINKS.map(({ to, label }) => (
            <Link key={to} to={to}>
              {label}
            </Link>
          ))}
        </nav>

        <p className="footer__legal">© {new Date().getFullYear()} DECODE</p>
      </div>
    </footer>
  );
};

export default Footer;
