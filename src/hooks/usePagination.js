import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  clampPage,
  pageCount,
  pageSlice,
} from '@/components/ui/Pagination/Pagination.helpers';

/**
 * Client-side pagination backed by the URL (`?page=2`).
 *
 * The page lives in the query string, not in component state, so a given page
 * is shareable and the back button steps through pages — the same reasoning
 * that already puts the /reviews filters in the URL.
 *
 * The returned page is always clamped to what currently exists, so a stale
 * `?page=5` left over from a wider result set falls back to the last real page
 * instead of rendering an empty list. Nothing is written to the URL to correct
 * it: reading it as clamped is enough, and a redirect would fight the back
 * button.
 *
 * @param {any[]} items  the full, already filtered and sorted list
 * @param {number} perPage
 */
export const usePagination = (items, perPage) => {
  const [params, setParams] = useSearchParams();

  const total = Array.isArray(items) ? items.length : 0;
  const pages = pageCount(total, perPage);
  const page = clampPage(params.get('page'), total, perPage);

  const setPage = useCallback(
    (next) => {
      const target = clampPage(next, total, perPage);
      const updated = new URLSearchParams(params);

      // Page 1 is the default: keep it out of the URL so the canonical
      // listing has a clean address.
      if (target === 1) updated.delete('page');
      else updated.set('page', String(target));

      // A new history entry, unlike the filters: paging back should step
      // through pages rather than leave the listing.
      setParams(updated);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [params, setParams, total, perPage],
  );

  return { page, pages, pageItems: pageSlice(items, page, perPage), setPage };
};
