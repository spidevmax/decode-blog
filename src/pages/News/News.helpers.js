/**
 * Month grouping for the news archive.
 *
 * The list arrives already sorted newest first, so grouping only has to walk
 * it in order and start a new bucket when the month changes. Nothing is
 * re-sorted here: the API decides the order, this decides where the rules go.
 */

/** `'2026-07-22'` → `'2026-07'`, the key a month group is identified by. */
export const monthKey = (value) => String(value ?? '').slice(0, 7);

/**
 * Consecutive runs of items that share a month, in the order given.
 *
 * @param {{date: string}[]} items  already sorted newest first
 * @returns {{key: string, date: string, items: object[]}[]} `date` is the
 *   first item's, so the caller can format the heading however it likes.
 */
export const groupByMonth = (items) => {
  if (!Array.isArray(items)) return [];

  return items.reduce((groups, item) => {
    const key = monthKey(item?.date);
    const current = groups[groups.length - 1];

    if (current && current.key === key) current.items.push(item);
    else groups.push({ key, date: item?.date, items: [item] });

    return groups;
  }, []);
};
