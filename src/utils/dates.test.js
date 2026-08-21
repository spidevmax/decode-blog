import { describe, expect, it } from 'vitest';

import { formatDayOfMonth, formatLongDate, formatMonthLabel } from './dates';

/**
 * Every assertion here is an exact string, and that is the point: these
 * functions format calendar dates, so the output must not depend on where the
 * reader is. The suite passes in UTC and in Honolulu or it is not testing
 * anything — run it with `TZ=America/New_York npm test` to confirm.
 */
describe('formatLongDate', () => {
  it('writes the date the way the magazine prints it', () => {
    expect(formatLongDate('2026-07-22')).toBe('22 July 2026');
    expect(formatLongDate('1997-05-21')).toBe('21 May 1997');
  });

  // A date-only string parses as midnight UTC. Formatted in a zone west of
  // Greenwich that instant is still the previous afternoon, which once made
  // every date on the site a day early for readers in the Americas.
  it('does not shift the day for a reader west of Greenwich', () => {
    expect(formatLongDate('2026-01-01')).toBe('1 January 2026');
    expect(formatLongDate('2026-03-01')).toBe('1 March 2026');
  });

  it('returns unusable input unchanged rather than printing Invalid Date', () => {
    expect(formatLongDate('not a date')).toBe('not a date');
    expect(formatLongDate(null)).toBe('');
    expect(formatLongDate(undefined)).toBe('');
  });
});

describe('formatMonthLabel', () => {
  it('drops the day, keeping month and year', () => {
    expect(formatMonthLabel('2026-07-22')).toBe('July 2026');
  });

  // The first of a month is where a local-time formatter would roll the label
  // back into the month before, not just the day.
  it('keeps the first of the month in its own month', () => {
    expect(formatMonthLabel('2026-07-01')).toBe('July 2026');
    expect(formatMonthLabel('2026-01-01')).toBe('January 2026');
  });

  it('returns unusable input unchanged', () => {
    expect(formatMonthLabel('nonsense')).toBe('nonsense');
    expect(formatMonthLabel(null)).toBe('');
  });
});

describe('formatDayOfMonth', () => {
  it('is the day alone, unpadded', () => {
    expect(formatDayOfMonth('2026-07-22')).toBe('22');
    expect(formatDayOfMonth('2026-07-01')).toBe('1');
  });

  it('returns unusable input unchanged', () => {
    expect(formatDayOfMonth('nonsense')).toBe('nonsense');
    expect(formatDayOfMonth(null)).toBe('');
  });
});

/**
 * The News archive prints both inside one `<time>`: the day alone to the eye,
 * the full date to a screen reader. They disagreed by one for anyone west of
 * Greenwich, so the same element said 22 and 21 at once.
 */
describe('the pair the News archive prints together', () => {
  it('names the same day', () => {
    for (const value of ['2026-07-22', '2026-01-01', '2026-12-31', '1997-05-21']) {
      const day = formatLongDate(value).split(' ')[0];
      expect(formatDayOfMonth(value)).toBe(day);
    }
  });
});
