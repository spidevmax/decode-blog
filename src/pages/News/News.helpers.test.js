import { describe, expect, it } from 'vitest';
import { groupByMonth, monthKey } from './News.helpers';

describe('monthKey', () => {
  it('keeps year and month', () => {
    expect(monthKey('2026-07-22')).toBe('2026-07');
  });

  it('survives missing input', () => {
    expect(monthKey(undefined)).toBe('');
  });
});

describe('groupByMonth', () => {
  const item = (date) => ({ id: date, date });

  it('collects consecutive items sharing a month', () => {
    const groups = groupByMonth([
      item('2026-07-22'),
      item('2026-07-05'),
      item('2026-06-27'),
    ]);

    expect(groups).toHaveLength(2);
    expect(groups[0].key).toBe('2026-07');
    expect(groups[0].items).toHaveLength(2);
    expect(groups[1].key).toBe('2026-06');
  });

  // The heading is formatted from this, so it has to be a real date.
  it('carries the first date of each group', () => {
    const [july] = groupByMonth([item('2026-07-22'), item('2026-07-05')]);
    expect(july.date).toBe('2026-07-22');
  });

  // Same month a year apart is not the same group.
  it('separates the same month in different years', () => {
    const groups = groupByMonth([item('2026-07-01'), item('2025-07-01')]);
    expect(groups).toHaveLength(2);
  });

  it('survives nonsense input', () => {
    expect(groupByMonth(undefined)).toEqual([]);
    expect(groupByMonth([])).toEqual([]);
  });
});
