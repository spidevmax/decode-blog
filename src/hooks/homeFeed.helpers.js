/**
 * Home feed composition, kept free of React so it can be unit tested.
 *
 * The feed is a list of tagged items — `{ kind: 'review' | 'news' | 'feature',
 * item }` — so the page can render each one with its own card without having
 * to guess a type from the shape of the object.
 */

/** How many reviews run between two editorial pieces. */
export const EDITORIAL_EVERY = 4;

/**
 * Alternates news and features so neither type clusters, whatever the two
 * lists happen to contain. Runs out gracefully when one is shorter.
 */
export const alternateEditorial = (news = [], features = []) => {
  const out = [];
  const max = Math.max(news.length, features.length);
  for (let i = 0; i < max; i++) {
    if (news[i]) out.push({ kind: 'news', item: news[i] });
    if (features[i]) out.push({ kind: 'feature', item: features[i] });
  }
  return out;
};

/**
 * Builds the Home grid: reviews carry the page, with one editorial piece
 * dropped in after every `every` reviews.
 *
 * Editorial content is an enhancement — if those lists are empty (their fetch
 * failed, or there is simply nothing to show) the result is just the reviews,
 * so the page never depends on them.
 *
 * The first slot is left alone: it is the 2x2 lead card, and an editorial
 * piece there would displace the review the section is built around.
 *
 * @param {object[]} reviews
 * @param {object[]} editorial  already tagged, e.g. from `alternateEditorial`
 * @param {number} limit  total cards to render
 */
export const buildHomeFeed = (
  reviews = [],
  editorial = [],
  { every = EDITORIAL_EVERY, limit = 12 } = {},
) => {
  const feed = [];
  let nextEditorial = 0;
  let sinceEditorial = 0;

  for (const review of reviews) {
    if (feed.length >= limit) break;

    feed.push({ kind: 'review', item: review });
    sinceEditorial += 1;

    const slotIsFree = feed.length < limit;
    const dueNow = sinceEditorial >= every && feed.length > 1;

    if (dueNow && slotIsFree && editorial[nextEditorial]) {
      feed.push(editorial[nextEditorial]);
      nextEditorial += 1;
      sinceEditorial = 0;
    }
  }

  return feed;
};
