import { getFeatureById, getFeatures, getNews, getNewsById } from '@/services/api';

import { useAsync } from './useAsync';

/** Short news items for /news. */
export const useNews = () => {
  const { data, loading, error, retry } = useAsync(getNews, []);
  return { news: data ?? [], loading, error, retry };
};

/** A single news item by id. */
export const useNewsItem = (id) => {
  const { data, loading, error, retry } = useAsync(getNewsById, [id], {
    enabled: Boolean(id),
  });
  return { item: data, loading, error, retry };
};

/** Long-form features for /features. */
export const useFeatures = () => {
  const { data, loading, error, retry } = useAsync(getFeatures, []);
  return { features: data ?? [], loading, error, retry };
};

/** A single feature by id. */
export const useFeature = (id) => {
  const { data, loading, error, retry } = useAsync(getFeatureById, [id], {
    enabled: Boolean(id),
  });
  return { feature: data, loading, error, retry };
};

/**
 * The two items either side of `id` in a list already ordered newest first.
 *
 * @returns {{later: object|null, earlier: object|null}} `later` is the more
 *   recent neighbour — the one above in the archive.
 */
const neighbours = (list, id) => {
  const index = list.findIndex((item) => item.id === id);
  if (index === -1) return { later: null, earlier: null };

  return {
    later: list[index - 1] ?? null,
    earlier: list[index + 1] ?? null,
  };
};

/**
 * The stories either side of a news item, in date order.
 *
 * This is a second request for the whole archive, and it can fail on its own
 * while the story itself loaded fine. That is why nothing here reports an
 * error: the footer navigation is an addition to a page that already works,
 * so when the list does not arrive, the links simply are not offered.
 */
export const useNewsNeighbours = (id) => {
  const { news } = useNews();
  return neighbours(news, id);
};

/**
 * The features either side of this one *of the same type*.
 *
 * Chronology means little between long reads, so the useful neighbour is
 * another Analysis, or another Report — the relation the kicker already
 * claims. Falls back to the whole archive for an unknown type.
 */
export const useFeatureNeighbours = (id, kicker) => {
  const { features } = useFeatures();
  const sameType = kicker ? features.filter((item) => item.kicker === kicker) : features;

  return neighbours(sameType, id);
};
