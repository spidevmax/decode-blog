import './NotFound.css';

import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui';
import { truncatePath } from '@/utils/paths';

/**
 * No route matched.
 *
 * Distinct from ErrorState on purpose: a review whose fetch failed and an
 * address that answers to nothing are different problems, and looking alike
 * would tell the reader to retry something that will never work.
 *
 * The address is the largest thing on the page rather than the number. "404"
 * is what the reader already knows; the path is where the typo is, and a
 * record catalogue is the one place where a reference that resolves to nothing
 * is a familiar idea.
 */
const NotFound = () => {
  const { pathname } = useLocation();

  return (
    <div className="section notfound">
      <div className="container">
        <p className="notfound__eyebrow">Not in the catalogue</p>

        {/* React escapes this, so an address cannot inject markup. */}
        <p className="notfound__path">{truncatePath(pathname)}</p>

        <p className="notfound__note">
          No page answers to that address. It may have been moved, or the link that
          brought you here may be wrong.
        </p>

        <div className="notfound__ways">
          <p className="notfound__ways-label">Try instead</p>
          <div className="notfound__actions">
            <Button to="/reviews" variant="accent">
              Browse the archive
            </Button>
            <Button to="/" variant="ghost">
              Home
            </Button>
            <Button to="/news" variant="ghost">
              News
            </Button>
            <Button to="/features" variant="ghost">
              Features
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
