import { favoriteKey } from '@/context/favorites.helpers';

/**
 * The shelf, in the order things were put on it.
 *
 * Favourites are stored in the order they were saved, so the newest is last.
 * A shelf is read the other way round — the thing you just kept is the thing
 * you are coming back for — hence the reverse.
 *
 * The saved list holds only ids, so the content is resolved against the live
 * listings: a retitled album shows its new title rather than a copy taken at
 * save time. An id that no longer resolves has been pulled from the archive
 * and is dropped, so the shelf never counts what it cannot show.
 *
 * @param {{type: string, id: string}[]} favorites
 * @param {{albums: object[], news: object[], features: object[]}} content
 * @returns {{key: string, type: string, item: object}[]}
 */
export const shelfRows = (favorites, { albums = [], news = [], features = [] } = {}) => {
  if (!Array.isArray(favorites)) return [];

  const byType = {
    review: new Map(albums.map((item) => [item.id, item])),
    news: new Map(news.map((item) => [item.id, item])),
    feature: new Map(features.map((item) => [item.id, item])),
  };

  const rows = [];

  for (let i = favorites.length - 1; i >= 0; i -= 1) {
    const entry = favorites[i];
    const item = byType[entry?.type]?.get(entry?.id);
    if (!item) continue;

    rows.push({ key: favoriteKey(entry.type, entry.id), type: entry.type, item });
  }

  return rows;
};

/** How many of each kind are on the shelf, for the count line. */
export const countByType = (rows) => {
  return rows.reduce(
    (counts, row) => ({ ...counts, [row.type]: (counts[row.type] ?? 0) + 1 }),
    {},
  );
};
