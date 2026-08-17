import './LatestStrip.css';

import { Link } from 'react-router-dom';

import TypeChip from '@/components/editorial/TypeChip';
import { formatLongDate } from '@/utils/dates';

/**
 * A line of short announcements under the nav: the newest review, story and
 * feature, each one a link.
 *
 * Static on purpose. The reference this borrows from uses a scrolling
 * marquee, but moving text directly above the hero competes with it for
 * attention, and animation the reader cannot stop is an accessibility
 * problem — the project already disables animation under
 * `prefers-reduced-motion`, which would leave a marquee frozen mid-scroll.
 * A fixed strip carries the same information and stays legible.
 *
 * Nothing announced here appears again in the grid below: the page holds
 * these three back, so the strip carries news rather than a preview of the
 * next screenful.
 *
 * Renders nothing until there is something to announce.
 */
const LatestStrip = ({ items = [] }) => {
  const shown = items.filter((entry) => entry?.item);
  if (shown.length === 0) return null;

  return (
    <aside className="latest-strip" aria-label="Latest from the newsroom">
      <div className="container latest-strip__inner">
        <p className="latest-strip__label" aria-hidden="true">
          Latest
        </p>

        <ul className="latest-strip__list">
          {shown.map(({ kind, item, to }) => (
            <li key={kind} className="latest-strip__item">
              <TypeChip kind={kind} />
              <Link to={to} className="latest-strip__link">
                {item.title}
              </Link>
              {/* What makes it the latest. Drops out on narrow screens,
                  where the titles need the room more. */}
              <time className="latest-strip__date" dateTime={item.date}>
                {formatLongDate(item.date)}
              </time>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default LatestStrip;
