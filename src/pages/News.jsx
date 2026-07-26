import ErrorState from '../components/ErrorState';
import Loader from '../components/Loader';
import { useNews } from '../hooks/useEditorial';
import './News.css';

const DATE_FORMAT = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const News = () => {
  const { news, loading, error, retry } = useNews();

  return (
    <div className="section">
      <div className="container">
        <header className="news__head">
          <p className="eyebrow">Actualidad</p>
          <h1 className="news__title">Noticias</h1>
          <p className="news__lede">
            Lo que pasa alrededor de los discos: sellos, ciclos, giras y archivos.
          </p>
        </header>

        {loading && <Loader label="Cargando noticias…" />}

        {error && !loading && <ErrorState error={error} onRetry={retry} />}

        {!loading && !error && (
          <ul className="news__list">
            {news.map((item) => (
              <li key={item.id} className="news-item">
                <p className="news-item__meta">
                  <time dateTime={item.date}>
                    {DATE_FORMAT.format(new Date(item.date))}
                  </time>
                  <span aria-hidden="true"> · </span>
                  {item.source}
                </p>
                <h2 className="news-item__title">{item.title}</h2>
                <p className="news-item__excerpt">{item.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default News;
