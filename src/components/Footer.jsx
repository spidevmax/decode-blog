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
          <Link to="/">Inicio</Link>
          <Link to="/explorar">Explorar</Link>
          <Link to="/sugerir">Sugerir</Link>
        </nav>

        <p className="footer__legal">
          © {new Date().getFullYear()} DECODE — Todas las opiniones son discutibles.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
