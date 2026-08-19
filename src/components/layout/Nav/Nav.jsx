import './Nav.css';

import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useFavorites } from '@/hooks/useFavorites';

import { LINKS, LOGO_LETTERS } from './Nav.constants';

/**
 * Site header: wordmark, menu toggle and the primary navigation.
 *
 * The brand and the toggle sit outside the <nav> on purpose — a navigation
 * landmark should hold navigation links and nothing else, so a screen reader
 * jumping between landmarks lands on destinations rather than on the logo.
 * The component is named for its role in the layout; the element it renders
 * is the <header>.
 */
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
          {/* The wordmark repeats letters, so position is the identity here. */}
          {LOGO_LETTERS.map(({ letter, color }, i) => (
            <span
              key={`${letter}-${i}`}
              className="nav__brand-dot"
              style={{ '--dot-bg': color }}
              aria-hidden="true"
            >
              {letter}
            </span>
          ))}
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
          aria-label="Primary"
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
              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  `nav__favs${isActive ? ' nav__favs--active' : ''}`
                }
                aria-label={`Saved items, ${count} ${count === 1 ? 'item' : 'items'}`}
              >
                <span aria-hidden="true">★ {count}</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Nav;
