import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import './Nav.css';

const LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/explorar', label: 'Explorar' },
  { to: '/sugerir', label: 'Sugerir' },
];

const Nav = () => {
  // El menú guarda en qué ruta se abrió. Si la ruta cambió, está cerrado:
  // así se cierra al navegar sin necesidad de un efecto que sincronice estado.
  const [openedAt, setOpenedAt] = useState(null);
  const { count } = useFavorites();
  const location = useLocation();

  const open = openedAt === location.pathname;

  const setOpen = useCallback(
    (next) => {
      setOpenedAt(next ? location.pathname : null);
    },
    [location.pathname],
  );

  // Escape cierra el menú abierto.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, setOpen]);

  return (
    <header className="nav">
      <div className="nav__inner container">
        <NavLink to="/" className="nav__brand" aria-label="DECODE, inicio">
          DECODE
          <span className="nav__brand-dot" aria-hidden="true" />
        </NavLink>

        <button
          type="button"
          className="nav__toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="nav-menu"
        >
          {open ? 'Cerrar' : 'Menú'}
        </button>

        <nav
          id="nav-menu"
          className={`nav__menu${open ? ' nav__menu--open' : ''}`}
          aria-label="Principal"
        >
          <ul className="nav__list">
            {LINKS.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `nav__link${isActive ? ' nav__link--active' : ''}`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              <span className="nav__favs" title="Reseñas guardadas">
                ★ {count}
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
