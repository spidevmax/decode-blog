import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import TapeAccent from '../components/TapeAccent';
import { useFeatures } from '../hooks/useEditorial';
import './Features.css';

const DATE_FORMAT = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const Features = () => {
  const { features, loading, error, retry } = useFeatures();

  return (
    <div className="section">
      <div className="container">
        <header className="features__head">
          <p className="eyebrow">Lecturas largas</p>
          <h1 className="features__title">Artículos</h1>
          <p className="features__lede">
            Ensayos, informes y crónicas sobre la música que reseñamos.
          </p>
        </header>

        {loading && <Loader label="Cargando artículos…" />}

        {error && !loading && <ErrorState error={error} onRetry={retry} />}

        {!loading && !error && (
          <div className="features__grid">
            {features.map((item, i) => (
              <article key={item.id} className="feature-card">
                {i === 0 && <TapeAccent position="top-right" rotate={7} width="7rem" />}
                <p className="feature-card__kicker">{item.kicker}</p>
                <h2 className="feature-card__title">{item.title}</h2>
                <p className="feature-card__excerpt">{item.excerpt}</p>
                <p className="feature-card__meta">
                  {item.author}
                  <span aria-hidden="true"> · </span>
                  <time dateTime={item.date}>
                    {DATE_FORMAT.format(new Date(item.date))}
                  </time>
                  <span aria-hidden="true"> · </span>
                  {item.readingTime}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;
