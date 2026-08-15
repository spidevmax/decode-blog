import { useAlbums } from './useAlbums';
import { useFeatures, useNews } from './useEditorial';
import { alternateEditorial, buildHomeFeed, excludeShown } from './homeFeed.helpers';

/**
 * Cards in the Home grid, including the 2x2 lead. Exported so the loading
 * skeleton can paint the right number of them instead of guessing.
 */
export const HOME_FEED_LIMIT = 13;

/**
 * The mixed Home grid: reviews with news and features dropped in.
 *
 * Composes the three existing list hooks rather than fetching anything of its
 * own, so `useAsync`, the services and the other pages are untouched.
 *
 * Reviews decide the page: their `loading` and `error` are the ones reported,
 * and the editorial lists are treated as an enhancement. If those fail — the
 * mock API fails ~8% of the time on purpose — the grid still renders, just
 * without the interleaved pieces, instead of taking the whole page down.
 *
 * The three registers of the page do not overlap. The hero is the featured
 * review, the strip is the newest of each type, and the grid is everything
 * else — the strip's items are held back from the feed rather than announced
 * at the top and then repeated two hundred pixels below.
 *
 * @param {number} limit  total cards in the grid, including the 2x2 lead.
 *   13 closes the four-column grid exactly: the lead spans four cells, the
 *   other twelve take one each, so the last row fills instead of trailing an
 *   empty gap next to the footer. Holding four items back does not change it:
 *   the limit governs how many cards render, not how many exist to choose
 *   from, and the archive has far more than thirteen.
 */
export const useHomeFeed = (limit = HOME_FEED_LIMIT) => {
  const { albums, loading, error, retry } = useAlbums();
  const { news } = useNews();
  const { features } = useFeatures();

  // The lead is whichever review is flagged `featured`; otherwise the newest.
  const hero = albums.find((a) => a.featured) ?? albums[0];

  // The newest of each type, for the announcement strip. All three lists
  // arrive newest-first, so the head of each is the latest — except for
  // reviews, where the newest may be the one already running as the hero.
  const latestReview = albums.find((a) => a.id !== hero?.id);
  const latest = [
    {
      kind: 'review',
      item: latestReview,
      to: latestReview && `/reviews/${latestReview.id}`,
    },
    { kind: 'news', item: news[0], to: news[0] && `/news/${news[0].id}` },
    {
      kind: 'feature',
      item: features[0],
      to: features[0] && `/features/${features[0].id}`,
    },
  ];

  // Whatever the top of the page has already shown, held back from the grid.
  const feed = buildHomeFeed(
    excludeShown(albums, hero, latestReview),
    alternateEditorial(excludeShown(news, news[0]), excludeShown(features, features[0])),
    { limit },
  );

  return { hero, feed, latest, loading, error, retry };
};
