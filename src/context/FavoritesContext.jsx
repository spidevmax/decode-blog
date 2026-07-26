import { useCallback, useEffect, useMemo, useState } from 'react';
import { FavoritesContext } from './favorites-context';

const STORAGE_KEY = 'decode:favorites';

const readStored = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // localStorage puede fallar (modo privado, cuota, JSON corrupto).
    // No es motivo para tirar la app abajo.
    return [];
  }
};

export const FavoritesProvider = ({ children }) => {
  const [ids, setIds] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* sin persistencia, pero la sesión sigue funcionando */
    }
  }, [ids]);

  const toggle = useCallback((id) => {
    setIds((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  const isFavorite = useCallback((id) => ids.includes(id), [ids]);

  const clear = useCallback(() => setIds([]), []);

  const value = useMemo(
    () => ({ favorites: ids, count: ids.length, toggle, isFavorite, clear }),
    [ids, toggle, isFavorite, clear],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
