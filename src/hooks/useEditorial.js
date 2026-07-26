import { getFeatures, getNews } from '@/services/api';
import { useAsync } from './useAsync';

/** Noticias breves para /news. */
export const useNews = () => {
  const { data, loading, error, retry } = useAsync(getNews, []);
  return { news: data ?? [], loading, error, retry };
};

/** Artículos de fondo para /features. */
export const useFeatures = () => {
  const { data, loading, error, retry } = useAsync(getFeatures, []);
  return { features: data ?? [], loading, error, retry };
};
