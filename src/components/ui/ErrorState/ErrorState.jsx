import './ErrorState.css';

import Button from '../Button';

/**
 * A request that failed for good.
 *
 * By the time this renders, useAsync has already retried and got nowhere, so
 * the copy can say that plainly instead of guessing at a cause. Distinct from
 * the 404 page, which is a route that never existed rather than one that would
 * not load.
 *
 * @param {string} subject  what failed to load, for the sentence: "the
 *   reviews", "this review", "the news".
 * @param {string} [backTo]  where the way out leads; the section the reader was
 *   in beats the front page.
 */
const ErrorState = ({
  subject = 'this page',
  error,
  onRetry,
  backTo = '/',
  backLabel = 'Go home',
}) => {
  // A 404 from the API is an answer, not a failure: nothing to retry.
  const is404 = error?.status === 404;

  return (
    <div className="error-state" role="alert">
      <p className="error-state__mark" aria-hidden="true">
        {is404 ? '—' : '✕'}
      </p>

      <h2 className="error-state__title">
        {is404 ? 'Not in the archive' : 'No answer from the archive'}
      </h2>

      <p className="error-state__message">
        {is404
          ? `We have no record of ${subject}. It may have been taken down, or the link may be wrong.`
          : `We asked for ${subject} three times and got nothing back. This one is on us, not you.`}
      </p>

      <div className="error-state__actions">
        {onRetry && !is404 && (
          <Button variant="accent" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="ghost" to={backTo}>
          {backLabel}
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
