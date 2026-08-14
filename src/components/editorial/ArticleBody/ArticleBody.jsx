import { splitEmphasis } from './ArticleBody.helpers';
import './ArticleBody.css';

/**
 * The prose column shared by reviews, news and features.
 *
 * Renders the lede, the paragraphs, and — when the content has one — a pull
 * quote inserted after the first paragraph, which is where all three article
 * types place it. Without a `pullQuote` the body is simply continuous, so
 * news items (which have none) need no special casing.
 *
 * `children` is appended after the prose, for the per-type footer.
 */
const ArticleBody = ({ lede, paragraphs = [], pullQuote, byline, children }) => {
  const [first, ...rest] = paragraphs;

  return (
    <div className="article__body">
      {byline && <p className="article__byline">{byline}</p>}

      {lede && <p className="article__lede">{lede}</p>}

      {first && <Paragraph text={first} />}

      {pullQuote && (
        <blockquote className="pull-quote">
          <p>{pullQuote}</p>
        </blockquote>
      )}

      {rest.map((text, i) => (
        <Paragraph key={i} text={text} />
      ))}

      {children}
    </div>
  );
};

/** A single paragraph with `*emphasis*` resolved to <em>. */
const Paragraph = ({ text }) => {
  return (
    <p className="article__para">
      {splitEmphasis(text).map((segment, i) =>
        segment.em ? <em key={i}>{segment.text}</em> : segment.text,
      )}
    </p>
  );
};

export default ArticleBody;
