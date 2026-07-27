import { useCallback, useEffect, useMemo, useState } from 'react';
import { FavoritesContext } from './favorites-context';

const STORAGE_KEY = 'decode:favorites';

const readStored = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // localStorage can fail (private mode, quota, corrupt JSON).
    // That is no reason to bring the app down.
    return [];
  }
};

export const FavoritesProvider = ({ children }) => {
  const [ids, setIds] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* no persistence, but the session keeps working */
    }
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  const isFavorite = useCallback((id) => ids.includes(id), [ids]);

  const value = useMemo(
    () => ({ favorites: ids, count: ids.length, toggle, isFavorite }),
    [ids, toggle, isFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
