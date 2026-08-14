/**
 * Generic path helpers, nothing DECODE-specific.
 * (Utils = portable to any project; helpers = domain-specific.)
 */

/**
 * Shortens an over-long path for display.
 *
 * A pathological address would otherwise set the width of whatever renders it.
 * The start is what identifies the mistake, so that is the part kept.
 *
 * @returns {string} at most `max` characters, ellipsis included.
 */
export const truncatePath = (path, max = 72) => {
  const value = String(path ?? '');
  if (max < 1) return '';
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
};
