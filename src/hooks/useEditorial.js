import { getFeatures, getNews } from '@/services/api';
import { useAsync } from './useAsync';

/** Short news items for /news. */
export const useNews = () => {
  const { data, loading, error, retry } = useAsync(getNews, []);
  return { news: data ?? [], loading, error, retry };
};

/** Long-form features for /features. */
export const useFeatures = () => {
  const { data, loading, error, retry } = useAsync(getFeatures, []);
  return { features: data ?? [], loading, error, retry };
};
