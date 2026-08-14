import './ArticleHeader.css';

/**
 * The banded header shared by article pages.
 *
 * Layout adapts to whether there is a `media` slot: reviews pass the cover
 * (plus tape and rating), while news and features have no artwork and get a
 * single full-width column instead of the two-column split.
 *
 * Everything below the title is a slot, so each page supplies its own
 * metadata — facts list, source, reading time — without this component
 * knowing about any of those shapes.
 */
const ArticleHeader = ({ eyebrow, title, subtitle, media, children }) => {
  return (
    <header className="article__header">
      <div
        className={`container article__header-inner${
          media ? '' : ' article__header-inner--plain'
        }`}
      >
        {media && <div className="article__media">{media}</div>}

        <div className="article__intro">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 className="article__title">{title}</h1>
          {subtitle && <p className="article__subtitle">{subtitle}</p>}
          {children}
        </div>
      </div>
    </header>
  );
};

export default ArticleHeader;
