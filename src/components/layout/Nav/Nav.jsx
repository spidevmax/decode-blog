import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useFavorites } from '@/hooks/useFavorites';
import { LINKS } from './Nav.constants';
import './Nav.css';

const Nav = () => {
  // The menu records which route it opened on. If the route changed it is
  // closed: it shuts on navigation without an effect syncing state.
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

  // Escape closes the open menu.
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
        <NavLink to="/" className="nav__brand" aria-label="DECODE, home">
          Decode
        </NavLink>

        <button
          type="button"
          className="nav__toggle"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="nav-menu"
        >
          {open ? 'Close' : 'Menu'}
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
              <span className="nav__favs" title="Saved reviews">
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
