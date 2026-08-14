import { Link } from 'react-router-dom';
import { ErrorState, Loader, Pagination, SaveButton } from '@/components/ui';
import { useNews } from '@/hooks/useEditorial';
import { usePagination } from '@/hooks/usePagination';
import { formatLongDate } from '@/utils/dates';
import './News.css';

const PER_PAGE = 6;

const News = () => {
  const { news, loading, error, retry } = useNews();
  const { page, pages, pageItems, setPage } = usePagination(news, PER_PAGE);

  return (
    <div className="section">
      <div className="container">
        <header className="news__head">
          <p className="eyebrow">Latest</p>
          <h1 className="news__title">News</h1>
          <p className="news__lede">
            What happens around the records: labels, gigs, tours and archives.
          </p>
        </header>

        {loading && <Loader label="Loading news…" />}

        {error && !loading && (
          <ErrorState subject="the news" error={error} onRetry={retry} />
        )}

        {!loading && !error && (
          <>
            <ul className="news__list">
              {pageItems.map((item) => (
                <li key={item.id} className="news-item">
                  <p className="news-item__date">
                    <time dateTime={item.date}>{formatLongDate(item.date)}</time>
                  </p>

                  <div className="news-item__text">
                    <h2 className="news-item__title">
                      {/* Stretched link: the whole row is clickable, as on AlbumCard */}
                      <Link to={`/news/${item.id}`} className="news-item__link">
                        {item.title}
                      </Link>
                    </h2>
                    <p className="news-item__excerpt">{item.excerpt}</p>
                  </div>

                  <div className="news-item__aside">
                    {/* No category field in the dataset: the source plays that role. */}
                    <p className="news-item__source">{item.source}</p>
                    <SaveButton
                      type="news"
                      id={item.id}
                      title={item.title}
                      className="news-item__save"
                    />
                  </div>
                </li>
              ))}
            </ul>

            <Pagination
              page={page}
              pages={pages}
              onChange={setPage}
              label="News pagination"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default News;
