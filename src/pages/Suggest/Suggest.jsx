import { TapeAccent } from '@/components/ui';
import NewsletterForm from './NewsletterForm';
import SuggestionForm from './SuggestionForm';
import './Suggest.css';

/** Composición de los dos formularios; el estado vive en cada uno. */
const Suggest = () => {
  return (
    <div className="section">
      <div className="container">
        <header className="suggest__head">
          <p className="eyebrow">Participá</p>
          <h1 className="suggest__title">Sumate</h1>
          <p className="suggest__lede">
            Recibe las reseñas por mail o cuéntanos qué disco tendríamos que estar
            escuchando.
          </p>
        </header>

        <div className="suggest__panels">
          <section className="suggest__panel" aria-labelledby="newsletter-title">
            <TapeAccent position="top-left" rotate={-6} width="7rem" />
            <h2 id="newsletter-title" className="suggest__panel-title">
              Newsletter
            </h2>
            <NewsletterForm />
          </section>

          <section className="suggest__panel" aria-labelledby="suggestion-title">
            <TapeAccent position="top-right" rotate={5} width="7rem" color="red" />
            <h2 id="suggestion-title" className="suggest__panel-title">
              Sugiere un álbum
            </h2>
            <SuggestionForm />
          </section>
        </div>
      </div>
    </div>
  );
};

export default Suggest;
