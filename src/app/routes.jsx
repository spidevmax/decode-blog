import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Loader } from '@/components/ui';
import Home from '@/pages/Home';

/**
 * Route table.
 *
 * Home is imported statically because it is the most common entry point and
 * should not be deferred. The rest are split into chunks: downloaded only on
 * navigation, which keeps the initial bundle small as pages grow.
 * (This is why `pages/` has no barrel: it would defeat the splitting.)
 */
const FeatureDetail = lazy(() => import('@/pages/FeatureDetail'));
const Features = lazy(() => import('@/pages/Features'));
const News = lazy(() => import('@/pages/News'));
const NewsDetail = lazy(() => import('@/pages/NewsDetail'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ReviewDetail = lazy(() => import('@/pages/ReviewDetail'));
const Reviews = lazy(() => import('@/pages/Reviews'));
const Saved = lazy(() => import('@/pages/Saved'));
const Suggest = lazy(() => import('@/pages/Suggest'));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="container section">
          <Loader label="Loading…" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
        <Route path="/features" element={<Features />} />
        <Route path="/features/:id" element={<FeatureDetail />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/suggest" element={<Suggest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
