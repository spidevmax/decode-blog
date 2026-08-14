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
  { tone: 'magenta', min: 8.5, label: 'Essential' },
  { tone: 'petrol', min: 7, label: 'Recommended' },
  { tone: 'mostaza', min: 5.5, label: 'Flawed' },
  { tone: 'terracota', min: 0, label: 'Skip it' },
];

/** The colour band a score falls in. Each boundary belongs to the upper band. */
export const ratingTone = (score) => {
  const band = RATING_BANDS.find(({ min }) => score >= min);
  // Below the lowest floor — a negative score — still has to paint something.
  return band?.tone ?? RATING_BANDS[RATING_BANDS.length - 1].tone;
};
