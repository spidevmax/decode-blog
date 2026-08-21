/**
 * Date formatting shared by every view that prints an editorial date.
 *
 * The Intl formatter is built once at module scope: constructing one per
 * render is measurably expensive, and the format is identical everywhere.
 *
 * Both formatters pin UTC, and that is load-bearing rather than tidy. These
 * are calendar dates — `'2026-07-22'`, no time of day — and JavaScript parses
 * a date-only string as midnight UTC. Formatting that instant in the reader's
 * zone moves it: west of Greenwich, midnight UTC is still the previous
 * afternoon, so every date printed a day early for anyone in the Americas.
 * `formatDayOfMonth` read UTC already, which is why the News archive could
 * show `22` to the eye and read `21 July` to a screen reader, inside one
 * `<time>` element.
 */

const LONG_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const MONTH_LABEL = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/**
 * The date behind a value, or null if there is not one.
 *
 * Only non-empty strings are attempted, and that exclusion is the whole
 * point: `new Date(null)` is not an invalid date, it is the Unix epoch,
 * because null coerces to 0. So does `0`, and so does `false`. A NaN check
 * alone lets all three through and prints `1 January 1970` wherever a date
 * was simply missing.
 */
const toDate = (value) => {
  if (typeof value !== 'string' || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** What to show when there is no date to show: the input, or nothing. */
const asGiven = (value) => String(value ?? '');

/** `'2026-07-22'` → `'22 July 2026'`. Unusable input is returned unchanged. */
export const formatLongDate = (value) => {
  const date = toDate(value);
  return date ? LONG_DATE.format(date) : asGiven(value);
};

/** `'2026-07-22'` → `'July 2026'`. Heads a month in a grouped archive. */
export const formatMonthLabel = (value) => {
  const date = toDate(value);
  return date ? MONTH_LABEL.format(date) : asGiven(value);
};

/**
 * `'2026-07-22'` → `'22'`.
 *
 * Only ever printed under a month heading that supplies the rest, and always
 * beside the full date for screen readers — a bare number is not a date.
 */
export const formatDayOfMonth = (value) => {
  const date = toDate(value);
  return date ? String(date.getUTCDate()) : asGiven(value);
};
