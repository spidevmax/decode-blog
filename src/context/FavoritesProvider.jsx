import { useCallback, useEffect, useMemo, useState } from 'react';
import { FavoritesContext } from './favorites-context';
import { favoriteKey, idsOfType, parseStored, toggleEntry } from './favorites.helpers';

const STORAGE_KEY = 'decode:favorites';

const readStored = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return parseStored(raw ? JSON.parse(raw) : []);
  } catch {
    // localStorage can fail (private mode, quota, corrupt JSON).
    // That is no reason to bring the app down.
    return [];
  }
};

/**
 * Saved reviews, news and features.
 *
 * Entries are `{ type, id }` pairs: ids are unique only within their own
 * dataset, so the type is part of the identity. `type` defaults to 'review'
 * throughout, which keeps the album call sites unchanged.
 */
export const FavoritesProvider = ({ children }) => {
  const [entries, setEntries] = useState(readStored);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      /* no persistence, but the session keeps working */
    }
  }, [entries]);

  const toggle = useCallback((id, type = 'review') => {
    setEntries((current) => toggleEntry(current, type, id));
  }, []);

  // A Set of keys, so lookups stay O(1) as the list grows and the callback
  // only changes when the favourites actually change.
  const keys = useMemo(
    () => new Set(entries.map((e) => favoriteKey(e.type, e.id))),
    [entries],
  );

  const isFavorite = useCallback(
    (id, type = 'review') => keys.has(favoriteKey(type, id)),
    [keys],
  );

  const value = useMemo(
    () => ({
      favorites: entries,
      count: entries.length,
      reviewIds: idsOfType(entries, 'review'),
      newsIds: idsOfType(entries, 'news'),
      featureIds: idsOfType(entries, 'feature'),
      toggle,
      isFavorite,
    }),
    [entries, toggle, isFavorite],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
