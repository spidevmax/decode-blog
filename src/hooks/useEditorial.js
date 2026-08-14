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
