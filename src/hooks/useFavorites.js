import { useContext } from 'react';

import { FavoritesContext } from '@/context/favorites.context';

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used inside <FavoritesProvider>');
  }
  return ctx;
};
