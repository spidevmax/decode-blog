import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__brand">DECODE</p>
          <p className="footer__tag">Crítica musical sin cortesías.</p>
        </div>

        <nav className="footer__nav" aria-label="Pie de página">
          <Link to="/">Home</Link>
          <Link to="/reviews">Reviews</Link>
          <Link to="/news">News</Link>
          <Link to="/features">Features</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/suggest">Suggest</Link>
        </nav>

        <p className="footer__legal">© {new Date().getFullYear()} DECODE</p>
      </div>
    </footer>
  );
};

export default Footer;
