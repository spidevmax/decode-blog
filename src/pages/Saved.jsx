import { Link } from 'react-router-dom';
import AlbumCard from '@/components/album/AlbumCard';
import AlbumGrid from '@/components/album/AlbumGrid';
import { Button, Loader, SaveButton } from '@/components/ui';
import { useAlbums } from '@/hooks/useAlbums';
import { useFeatures, useNews } from '@/hooks/useEditorial';
import { useFavorites } from '@/hooks/useFavorites';
import { formatLongDate } from '@/utils/dates';
// This page reuses the news rows and feature cards, so it needs their
// stylesheets: each page owns its own CSS and there is no global sheet.
import './Features.css';
import './News.css';
import './Saved.css';

/**
 * Everything the reader has saved, grouped by type.
 *
 * The saved list holds only ids, so this page reads the three full listings
 * and filters them. That costs nothing here — the "API" is in memory — and it
 * keeps a single source of truth for the content itself: a renamed album
 * shows its new title rather than a stale copy taken at save time.
 *
 * Order follows each listing, not the order things were saved, so the page
 * reads the same way as the sections it draws from.
 */
const Saved = () => {
  const { reviewIds, newsIds, featureIds } = useFavorites();

  const { albums, loading: albumsLoading } = useAlbums();
  const { news, loading: newsLoading } = useNews();
  const { features, loading: featuresLoading } = useFeatures();

  const loading = albumsLoading || newsLoading || featuresLoading;

  const savedAlbums = albums.filter((a) => reviewIds.includes(a.id));
  const savedNews = news.filter((n) => newsIds.includes(n.id));
  const savedFeatures = features.filter((f) => featureIds.includes(f.id));

  // A saved id whose article has since been pulled resolves to nothing. Count
  // what actually renders, so the heading never promises more than it shows.
  const shown = savedAlbums.length + savedNews.length + savedFeatures.length;

  return (
    <div className="section">
      <div className="container">
        <header className="saved__head">
          <p className="eyebrow">Your shelf</p>
          <h1 className="saved__title">Saved</h1>
          <p className="saved__lede">
            {shown === 0
              ? 'Nothing saved yet.'
              : `${shown} ${shown === 1 ? 'item' : 'items'} kept for later.`}
          </p>
        </header>

        {loading && <Loader label="Loading your saved items…" />}

        {!loading && shown === 0 && (
          <div className="saved__empty">
            <p className="saved__empty-mark" aria-hidden="true">
              ☆
            </p>
            <h2>Your shelf is empty</h2>
            <p>
              Hit the star on any review, news story or feature and it will wait for you
              here.
            </p>
            <div className="saved__empty-actions">
              <Button to="/reviews" variant="accent">
                Browse reviews
              </Button>
              <Button to="/features" variant="ghost">
                Read a feature
              </Button>
            </div>
          </div>
        )}

        {!loading && shown > 0 && (
          <>
            {savedAlbums.length > 0 && (
              <section className="saved__section" aria-labelledby="saved-reviews">
                <div className="section-head">
                  <h2 id="saved-reviews">Reviews ({savedAlbums.length})</h2>
                  <Link to="/reviews" className="section-head__link">
                    All reviews
                  </Link>
                </div>

                <AlbumGrid variant="even">
                  {savedAlbums.map((album, i) => (
                    <AlbumCard key={album.id} album={album} index={i} />
                  ))}
                </AlbumGrid>
              </section>
            )}

            {savedNews.length > 0 && (
              <section className="saved__section" aria-labelledby="saved-news">
                <div className="section-head">
                  <h2 id="saved-news">News ({savedNews.length})</h2>
                  <Link to="/news" className="section-head__link">
                    All news
                  </Link>
                </div>

                <ul className="news__list">
                  {savedNews.map((item) => (
                    <li key={item.id} className="news-item">
                      <p className="news-item__date">
                        <time dateTime={item.date}>{formatLongDate(item.date)}</time>
                      </p>

                      <div className="news-item__text">
                        <h3 className="news-item__title">
                          <Link to={`/news/${item.id}`} className="news-item__link">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="news-item__excerpt">{item.excerpt}</p>
                      </div>

                      <div className="news-item__aside">
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
              </section>
            )}

            {savedFeatures.length > 0 && (
              <section className="saved__section" aria-labelledby="saved-features">
                <div className="section-head">
                  <h2 id="saved-features">Features ({savedFeatures.length})</h2>
                  <Link to="/features" className="section-head__link">
                    All features
                  </Link>
                </div>

                <div className="features__grid">
                  {savedFeatures.map((item) => (
                    <article key={item.id} className="feature-card">
                      <div className="feature-card__top">
                        <p className="feature-card__kicker">{item.kicker}</p>
                        <SaveButton
                          type="feature"
                          id={item.id}
                          title={item.title}
                          className="feature-card__save"
                        />
                      </div>
                      <h3 className="feature-card__title">
                        <Link to={`/features/${item.id}`} className="feature-card__link">
                          {item.title}
                        </Link>
                      </h3>
                      <p className="feature-card__excerpt">{item.excerpt}</p>
                      <p className="feature-card__meta">
                        {item.author}
                        <span aria-hidden="true"> · </span>
                        <time dateTime={item.date}>{formatLongDate(item.date)}</time>
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Saved;
