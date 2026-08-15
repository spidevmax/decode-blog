import { describe, expect, it } from 'vitest';
import { countByType, shelfRows } from './Saved.helpers';

const content = {
  albums: [{ id: 'ok-computer', title: 'OK Computer' }],
  news: [{ id: 'vinyl-sales-record', title: 'Record vinyl sales' }],
  features: [{ id: 'vinyl-comeback', title: 'Why vinyl keeps growing' }],
};

describe('shelfRows', () => {
  // Saved order is oldest first; the shelf reads newest first.
  it('reverses the stored order', () => {
    const rows = shelfRows(
      [
        { type: 'review', id: 'ok-computer' },
        { type: 'news', id: 'vinyl-sales-record' },
      ],
      content,
    );

    expect(rows.map((row) => row.type)).toEqual(['news', 'review']);
  });

  it('resolves each entry against its own listing', () => {
    const [row] = shelfRows([{ type: 'feature', id: 'vinyl-comeback' }], content);
    expect(row.item.title).toBe('Why vinyl keeps growing');
    expect(row.key).toBe('feature:vinyl-comeback');
  });

  // Ids are unique only within a type, so the type has to be part of the lookup.
  it('does not match an id against the wrong listing', () => {
    expect(shelfRows([{ type: 'news', id: 'ok-computer' }], content)).toEqual([]);
  });

  it('drops entries whose content is gone', () => {
    const rows = shelfRows(
      [
        { type: 'review', id: 'pulled-from-the-archive' },
        { type: 'review', id: 'ok-computer' },
      ],
      content,
    );

    expect(rows).toHaveLength(1);
  });

  it('survives nonsense input', () => {
    expect(shelfRows(undefined, content)).toEqual([]);
    expect(shelfRows([{ type: 'review', id: 'ok-computer' }])).toEqual([]);
  });
});

describe('countByType', () => {
  it('tallies each kind', () => {
    const rows = shelfRows(
      [
        { type: 'review', id: 'ok-computer' },
        { type: 'news', id: 'vinyl-sales-record' },
        { type: 'feature', id: 'vinyl-comeback' },
      ],
      content,
    );

    expect(countByType(rows)).toEqual({ review: 1, news: 1, feature: 1 });
  });

  it('leaves out kinds that are not there', () => {
    expect(countByType([])).toEqual({});
  });
});
