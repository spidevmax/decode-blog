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

const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
});

/** `'2026-07-22'` → `'22 July 2026'`. Invalid input is returned unchanged. */
export const formatLongDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value ?? '') : LONG_DATE.format(date);
};

/** `'2026-07-22'` → `'July 2026'`. Heads a month in a grouped archive. */
export const formatMonthLabel = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value ?? '') : MONTH_LABEL.format(date);
};

/**
 * `'2026-07-22'` → `'22'`.
 *
 * Only ever printed under a month heading that supplies the rest, and always
 * beside the full date for screen readers — a bare number is not a date.
 */
export const formatDayOfMonth = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value ?? '') : String(date.getUTCDate());
};
