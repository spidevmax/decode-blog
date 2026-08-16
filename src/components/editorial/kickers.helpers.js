/**
 * The kicker taxonomy: what kinds of long read DECODE publishes, and the
 * colour each one is filed under.
 *
 * Four types, four hues from the palette. The colour is not decoration — the
 * archive filters by kicker, the card and the article header paint themselves
 * with it, and a Report arriving in Analysis colours is a piece filed wrong.
 *
 * This used to be declared twice, identically, in Features.jsx and
 * FeatureDetail.jsx, with a comment arguing that a shared module for four
 * lines would be loaded by both to serve one. The concern was reasonable and
 * turned out to be worth about 150 bytes, against two lists that had to agree
 * with each other and nothing to make them. The listing and the piece it
 * opens now read the same table.
 *
 * Note what is deliberately *not* here: TypeChip's review/news/feature labels.
 * That is a different axis — what kind of content this is, not what kind of
 * feature — and it already has a single home. Merging the two tables would
 * only mean one import serving two unrelated questions.
 */

/** In publishing order, which is also the order the archive filter offers. */
export const KICKERS = [
  { name: 'Analysis', color: 'var(--color-mostaza)' },
  { name: 'Feature', color: 'var(--color-oliva)' },
  { name: 'Report', color: 'var(--color-terracota)' },
  { name: 'Interview', color: 'var(--color-petrol)' },
];

/**
 * The accent for a kicker.
 *
 * Falls back to magenta rather than to nothing: a new type added to the
 * dataset before it is added here should look deliberate, not unstyled.
 *
 * @param {string} kicker
 * @returns {string} a CSS custom property reference, ready for `--kicker-color`
 */
export const kickerColor = (kicker) =>
  KICKERS.find((entry) => entry.name === kicker)?.color ?? 'var(--color-magenta)';
