/**
 * The scoring scale, in one place.
 *
 * Bands run highest first and each `min` is inclusive. Both the badge and the
 * legend in the footer read from this array, so the key shown to readers
 * cannot drift away from the colour the badge actually paints.
 *
 * `mostaza` is the one light fill in the set, so its badge switches to ink
 * text (handled in the stylesheet).
 */
export const RATING_BANDS = [
  { tone: 'magenta', min: 8.5, label: 'Essential', slug: 'essential' },
  { tone: 'petrol', min: 7, label: 'Recommended', slug: 'recommended' },
  { tone: 'mostaza', min: 5.5, label: 'Flawed', slug: 'flawed' },
  { tone: 'terracota', min: 0, label: 'Skip it', slug: 'skip' },
];

/**
 * The score range a band covers, as the archive filter needs it: `min` is
 * inclusive, `max` exclusive, and the top band has no ceiling.
 *
 * The slug is what travels in the URL — `/reviews?rated=essential` — rather
 * than the colour token, which is a paint decision and not something to
 * publish in an address.
 *
 * @returns {{min: number, max: number}|null} null for an unknown slug, so a
 *   hand-edited URL filters nothing instead of emptying the archive.
 */
export const bandRange = (slug) => {
  const index = RATING_BANDS.findIndex((band) => band.slug === slug);
  if (index === -1) return null;

  return {
    min: RATING_BANDS[index].min,
    max: index === 0 ? Infinity : RATING_BANDS[index - 1].min,
  };
};

/**
 * The range a band covers, written out: `8.5+`, `7–8.5`, `0–5.5`.
 *
 * One function for every place the scale is printed. The footer used to word
 * this itself and said "7 and up" for Recommended — which reads as including
 * everything above it, when the filter it now links to means 7 up to 8.5. A
 * key that describes the scale differently from the control that applies it
 * is a key that has to be checked against the code, which is the opposite of
 * what a key is for.
 *
 * @param {string} slug
 * @returns {string} empty for an unknown band, so nothing prints a range for
 *   something that does not exist.
 */
export const bandRangeLabel = (slug) => {
  const range = bandRange(slug);
  if (!range) return '';

  return range.max === Infinity ? `${range.min}+` : `${range.min}–${range.max}`;
};

/** The band a score falls in. Each boundary belongs to the upper band. */
export const ratingBand = (score) => {
  // Below the lowest floor — a negative score — still has to land somewhere.
  return (
    RATING_BANDS.find(({ min }) => score >= min) ?? RATING_BANDS[RATING_BANDS.length - 1]
  );
};

/** Just the colour of that band, which is all the badge and the card need. */
export const ratingTone = (score) => ratingBand(score).tone;
