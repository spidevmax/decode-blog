import './Pagination.css';

import { pageItems } from './Pagination.helpers';

/**
 * Numbered pager with prev/next.
 *
 * Presentational: it neither reads nor writes the URL. The page lives in the
 * caller's query string (see `usePagination`), which is what makes a given
 * page shareable and the back button work.
 *
 * Renders nothing when there is only one page, so a short list never shows a
 * pager it does not need.
 */
const Pagination = ({ page, pages, onChange, label = 'Pagination' }) => {
  if (pages <= 1) return null;

  const items = pageItems(page, pages);
  const atFirst = page <= 1;
  const atLast = page >= pages;

  return (
    <nav className="pagination" aria-label={label}>
      <button
        type="button"
        className="pagination__step"
        onClick={() => onChange(page - 1)}
        disabled={atFirst}
      >
        <span aria-hidden="true">‹</span> Prev
      </button>

      <ol className="pagination__list">
        {items.map((item, i) =>
          item === 'gap' ? (
            // Positional key: the two gaps are interchangeable markers.
            <li key={`gap-${i}`} className="pagination__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className={`pagination__page${
                  item === page ? ' pagination__page--current' : ''
                }`}
                onClick={() => onChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        className="pagination__step"
        onClick={() => onChange(page + 1)}
        disabled={atLast}
      >
        Next <span aria-hidden="true">›</span>
      </button>
    </nav>
  );
};

export default Pagination;
