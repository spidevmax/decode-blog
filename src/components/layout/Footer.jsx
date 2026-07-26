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
          <Link to="/reviews">Reseñas</Link>
          <Link to="/news">Noticias</Link>
          <Link to="/features">Artículos</Link>
          <Link to="/explore">Explorar</Link>
          <Link to="/suggest">Sugerir</Link>
        </nav>

        <p className="footer__legal">
          © {new Date().getFullYear()} DECODE — Todas las opiniones son discutibles.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
