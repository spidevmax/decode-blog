/**
 * Favourites storage format, kept free of React so it can be unit tested.
 *
 * An entry is `{ type, id }`, where type is 'review' | 'news' | 'feature'.
 * Ids are only unique within a type — a news item and an album could in
 * principle share one — so the pair is the identity, never the id alone.
 */

export const FAVORITE_TYPES = ['review', 'news', 'feature'];

/** Stable key for an entry, used for lookups and as a React key. */
export const favoriteKey = (type, id) => `${type}:${id}`;

const isValidEntry = (entry) =>
  Boolean(entry) &&
  typeof entry === 'object' &&
  FAVORITE_TYPES.includes(entry.type) &&
  typeof entry.id === 'string' &&
  entry.id !== '';

/**
 * Normalises whatever came out of localStorage.
 *
 * The first version of this feature stored a plain array of album ids, since
 * reviews were the only saveable thing. Those are migrated to `review`
 * entries rather than discarded, so nobody loses what they had saved.
 *
 * Anything unrecognisable is dropped: a corrupt entry should cost you that
 * one favourite, not the whole list.
 */
export const parseStored = (raw) => {
  if (!Array.isArray(raw)) return [];

  const seen = new Set();
  const out = [];

  for (const item of raw) {
    // Legacy format: a bare id, which could only ever have been a review.
    const entry =
      typeof item === 'string' && item !== ''
        ? { type: 'review', id: item }
        : isValidEntry(item)
          ? { type: item.type, id: item.id }
          : null;

    if (!entry) continue;

    const key = favoriteKey(entry.type, entry.id);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }

  return out;
};

/** Adds or removes an entry, preserving the order of the rest. */
export const toggleEntry = (entries, type, id) => {
  const key = favoriteKey(type, id);
  const existing = entries.findIndex((e) => favoriteKey(e.type, e.id) === key);
  if (existing === -1) return [...entries, { type, id }];
  return entries.filter((_, i) => i !== existing);
};

/** The ids saved for one type, in the order they were saved. */
export const idsOfType = (entries, type) =>
  entries.filter((e) => e.type === type).map((e) => e.id);
