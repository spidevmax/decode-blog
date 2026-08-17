import './App.css';

import AppRoutes from '@/app/routes';
import Footer from '@/components/layout/Footer';
import Nav from '@/components/layout/Nav';

const App = () => {
  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <Nav />
      <main id="main" className="app__main">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
};

export default App;
