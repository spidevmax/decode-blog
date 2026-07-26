import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Nav from './components/Nav';
import Explore from './pages/Explore';
import Features from './pages/Features';
import Home from './pages/Home';
import News from './pages/News';
import NotFound from './pages/NotFound';
import ReviewDetail from './pages/ReviewDetail';
import Reviews from './pages/Reviews';
import Suggest from './pages/Suggest';
import './App.css';

const App = () => {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Saltar al contenido
      </a>

      <Nav />

      <main id="main" className="app__main">
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
      </main>

      <Footer />
    </div>
  );
};

export default App;
