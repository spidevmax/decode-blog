import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import RatingBadge from '@/components/album/RatingBadge';
import TypeChip from '@/components/editorial/TypeChip';
import { Button, Loader } from '@/components/ui';
import { useAlbums } from '@/hooks/useAlbums';
import { useFeatures, useNews } from '@/hooks/useEditorial';
import { useFavorites } from '@/hooks/useFavorites';
import { formatLongDate } from '@/utils/dates';
import { countByType, shelfRows } from './Saved.helpers';
import './Saved.css';

/** Where a row of each kind leads, and what it says about itself. */
const ROW = {
  review: {
    href: (item) => `/reviews/${item.id}`,
    subtitle: (item) => `${item.artist} · ${item.year}`,
  },
  news: {
    href: (item) => `/news/${item.id}`,
    subtitle: (item) => formatLongDate(item.date),
  },
  feature: {
    href: (item) => `/features/${item.id}`,
    subtitle: (item) => `${item.kicker} · ${formatLongDate(item.date)}`,
  },
};

/**
 * Everything the reader has kept, as one shelf.
 *
 * Not three listings stacked: browsing an archive and choosing what to read
 * next are different jobs. Every row is the same shape, the type chip does
 * the sorting the eye used to do by layout, and the right-hand column carries
 * the one fact that decides whether you have time for it — a score, a source,
 * a number of minutes.
 *
 * This page deliberately owns its own markup rather than borrowing the rows
 * and cards from /news and /features: it used to import their stylesheets,
 * and redesigning either page silently broke this one.
 */
const Saved = () => {
  const { favorites, toggle } = useFavorites();

  const { albums, loading: albumsLoading } = useAlbums();
  const { news, loading: newsLoading } = useNews();
  const { features, loading: featuresLoading } = useFeatures();

  const loading = albumsLoading || newsLoading || featuresLoading;

  const rows = useMemo(
    () => shelfRows(favorites, { albums, news, features }),
    [favorites, albums, news, features],
  );

  // Removing is one click and the row is gone, so the row stays put with its
  // way back. Keyed snapshots, because by then the item is out of `favorites`
  // and there is nothing left to render it from.
  const [undoable, setUndoable] = useState([]);

  const remove = useCallback(
    (row) => {
      // The slot it held on the shelf, not in the rendered list: rows already
      // waiting to be undone are not part of the favourites this indexes into.
      const index = rows.findIndex((entry) => entry.key === row.key);
      toggle(row.item.id, row.type);
      setUndoable((current) => [...current, { ...row, index }]);
    },
    [rows, toggle],
  );

  const undo = useCallback(
    (row) => {
      toggle(row.item.id, row.type);
      setUndoable((current) => current.filter((entry) => entry.key !== row.key));
    },
    [toggle],
  );

  // Rows that are on their way out are put back where they were, so nothing
  // below them jumps while the reader decides.
  const listed = useMemo(() => {
    const next = [...rows];
    for (const row of undoable) {
      next.splice(Math.min(row.index, next.length), 0, { ...row, removed: true });
    }
    return next;
  }, [rows, undoable]);

  const counts = countByType(rows);
  const shown = rows.length;

  const tally = [
    counts.review && `${counts.review} ${counts.review === 1 ? 'review' : 'reviews'}`,
    counts.news && `${counts.news} ${counts.news === 1 ? 'story' : 'stories'}`,
    counts.feature &&
      `${counts.feature} ${counts.feature === 1 ? 'feature' : 'features'}`,
  ].filter(Boolean);

  return (
    <div className="section">
      <div className="container">
        <header className="saved__head">
          <p className="eyebrow">Your shelf</p>
          <h1 className="saved__title">Saved</h1>
          <p className="saved__lede">
            {shown === 0 ? 'Nothing saved yet.' : `${tally.join(', ')}, newest first.`}
          </p>
        </header>

        {loading && <Loader label="Loading your saved items…" />}

        {!loading && listed.length === 0 && (
          <div className="saved__empty">
            <p className="saved__empty-mark" aria-hidden="true">
              ☆
            </p>
            <h2>Your shelf is empty</h2>
            <p>
              Hit the star on any review, news story or feature and it will wait for you
              here.
            </p>
            <div className="saved__empty-actions">
              <Button to="/reviews" variant="accent">
                Browse reviews
              </Button>
              <Button to="/features" variant="ghost">
                Read a feature
              </Button>
            </div>
          </div>
        )}

        {!loading && listed.length > 0 && (
          <ul className="shelf">
            {listed.map((row) =>
              row.removed ? (
                <li key={row.key} className="shelf-row shelf-row--removed">
                  <p className="shelf-row__removed-text">Removed from your shelf.</p>
                  <button
                    type="button"
                    className="shelf-row__undo"
                    onClick={() => undo(row)}
                  >
                    Put it back
                  </button>
                </li>
              ) : (
                <li key={row.key} className="shelf-row">
                  <TypeChip kind={row.type} />

                  <div className="shelf-row__text">
                    <h2 className="shelf-row__title">
                      <Link to={ROW[row.type].href(row.item)} className="shelf-row__link">
                        {row.item.title}
                      </Link>
                    </h2>
                    <p className="shelf-row__sub">{ROW[row.type].subtitle(row.item)}</p>
                  </div>

                  {/* The one fact that decides whether you have time for this
                      now: what it scored, where it came from, how long it is. */}
                  <div className="shelf-row__weight">
                    {row.type === 'review' && (
                      <RatingBadge score={row.item.score} size="sm" />
                    )}
                    {row.type === 'news' && (
                      <span className="shelf-row__note">{row.item.source}</span>
                    )}
                    {row.type === 'feature' && (
                      <span className="shelf-row__note">{row.item.readingTime} read</span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="shelf-row__remove"
                    onClick={() => remove(row)}
                    aria-label={`Remove ${row.item.title} from your shelf`}
                  >
                    <span aria-hidden="true">★</span>
                  </button>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Saved;
