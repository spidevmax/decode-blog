import { Link } from 'react-router-dom';
import { RATING_BANDS } from '@/components/album/RatingBadge/RatingBadge.helpers';
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
 * Carries the scoring key. Every score on the site is a coloured circle, and
 * until now nothing said what the colours meant — a reader could see a pink
 * 9.4 and an amber 6.9 with no way to tell what separated them. The bands come
 * from RatingBadge.helpers, so the key cannot drift from the badge.
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
            {RATING_BANDS.map(({ tone, min, label }, i) => (
              <li key={tone} className="footer__band">
                <span
                  className={`footer__swatch footer__swatch--${tone}`}
                  aria-hidden="true"
                />
                {/* The lowest band has no floor to quote, only a ceiling. */}
                <span className="footer__band-range">
                  {i === RATING_BANDS.length - 1
                    ? `Under ${RATING_BANDS[i - 1].min}`
                    : `${min} and up`}
                </span>
                <span className="footer__band-label">{label}</span>
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
