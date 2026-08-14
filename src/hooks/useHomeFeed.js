import { useAlbums } from './useAlbums';
import { useFeatures, useNews } from './useEditorial';
import { alternateEditorial, buildHomeFeed } from './homeFeed.helpers';

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
 * @param {number} limit  total cards in the grid, including the 2x2 lead.
 *   13 closes the four-column grid exactly: the lead spans four cells, the
 *   other twelve take one each, so the last row fills instead of trailing an
 *   empty gap next to the footer.
 */
export const useHomeFeed = (limit = 13) => {
  const { albums, loading, error, retry } = useAlbums();
  const { news } = useNews();
  const { features } = useFeatures();

  // The lead is whichever review is flagged `featured`; otherwise the newest.
  const hero = albums.find((a) => a.featured) ?? albums[0];
  const rest = hero ? albums.filter((a) => a.id !== hero.id) : albums;

  const feed = buildHomeFeed(rest, alternateEditorial(news, features), { limit });

  // The newest of each type, for the announcement strip. All three lists
  // arrive newest-first, so the head of each is the latest.
  const latest = [
    { kind: 'review', item: albums[0], to: albums[0] && `/reviews/${albums[0].id}` },
    { kind: 'news', item: news[0], to: news[0] && `/news/${news[0].id}` },
    {
      kind: 'feature',
      item: features[0],
      to: features[0] && `/features/${features[0].id}`,
    },
  ];

  return { hero, feed, latest, loading, error, retry };
};
