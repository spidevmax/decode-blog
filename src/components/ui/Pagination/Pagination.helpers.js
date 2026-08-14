/**
 * Pagination maths, kept free of React so it can be unit tested directly.
 */

/** Total pages for `total` items at `perPage`. Always at least 1. */
export const pageCount = (total, perPage) => {
  if (!Number.isFinite(total) || !Number.isFinite(perPage) || perPage < 1) return 1;
  return Math.max(1, Math.ceil(Math.max(0, total) / perPage));
};

/** Coerces anything (a query string, junk, undefined) into a valid page number. */
export const clampPage = (value, total, perPage) => {
  const last = pageCount(total, perPage);
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, last);
};

/** The slice of `items` shown on `page`. */
export const pageSlice = (items, page, perPage) => {
  const list = Array.isArray(items) ? items : [];
  const current = clampPage(page, list.length, perPage);
  const start = (current - 1) * perPage;
  return list.slice(start, start + perPage);
};

/**
 * The page numbers to render, with `'gap'` markers where the run is broken.
 *
 * First and last page are always present; around the current page a window of
 * `siblings` on each side. Short runs are returned whole, so the gap markers
 * only appear once they actually save space.
 *
 * e.g. page 5 of 12 → [1, 'gap', 4, 5, 6, 'gap', 12]
 */
export const pageItems = (current, last, siblings = 1) => {
  if (last < 1) return [1];

  // 2 ends + 2 gaps + the window: below this, showing everything is shorter.
  const maxSlots = siblings * 2 + 5;
  if (last <= maxSlots) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const page = clampPage(current, last, 1);
  const first = 1;

  // The inner run keeps a constant width, sliding rather than shrinking as the
  // current page approaches either end — otherwise the control changes size
  // while you page through it.
  const width = siblings * 2 + 1;
  let start = Math.max(first + 1, page - siblings);
  let end = Math.min(last - 1, page + siblings);

  if (end - start + 1 < width) {
    if (start === first + 1) end = Math.min(last - 1, start + width - 1);
    else if (end === last - 1) start = Math.max(first + 1, end - width + 1);
  }

  const items = [first];

  // Eliding a single page costs as much room as printing it, so don't.
  if (start > first + 2) items.push('gap');
  else if (start === first + 2) items.push(first + 1);

  for (let p = start; p <= end; p++) items.push(p);

  if (end < last - 2) items.push('gap');
  else if (end === last - 2) items.push(last - 1);

  items.push(last);
  return items;
};
