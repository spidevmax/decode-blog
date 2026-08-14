/**
 * Date formatting shared by every view that prints an editorial date.
 *
 * The Intl formatter is built once at module scope: constructing one per
 * render is measurably expensive, and the format is identical everywhere.
 */

const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** `'2026-07-22'` → `'22 July 2026'`. Invalid input is returned unchanged. */
export const formatLongDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value ?? '') : LONG_DATE.format(date);
};
