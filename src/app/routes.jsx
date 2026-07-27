import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Loader } from '@/components/ui';
import Home from '@/pages/Home';

/**
 * Tabla de rutas.
 *
 * Home se importa de forma estática porque es la entrada más frecuente y no
 * conviene diferirla. El resto va en chunks aparte: sólo se descargan al
 * navegar, lo que mantiene chico el bundle inicial a medida que crecen las
 * páginas. (Por eso `pages/` no tiene barrel: anularía esta división.)
 */
const Explore = lazy(() => import('@/pages/Explore'));
const Features = lazy(() => import('@/pages/Features'));
const News = lazy(() => import('@/pages/News'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ReviewDetail = lazy(() => import('@/pages/ReviewDetail'));
const Reviews = lazy(() => import('@/pages/Reviews'));
const Suggest = lazy(() => import('@/pages/Suggest'));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="container section">
          <Loader label="Cargando…" />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/features" element={<Features />} />
        <Route path="/suggest" element={<Suggest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
