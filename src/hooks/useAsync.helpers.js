/**
 * Retry policy for useAsync, kept free of React so it can be unit tested.
 *
 * A dropped request is usually a blip, and asking the reader to press a button
 * for something the app can do itself is work handed to the wrong party. The
 * failure is only shown once retrying has genuinely stopped helping — which
 * makes the error state rare, and therefore worth believing.
 */

/** Automatic attempts after the first, before the failure reaches the reader. */
export const AUTO_RETRIES = 2;

/** Wait before each automatic retry, in ms. Short: this happens under a loader. */
export const RETRY_BACKOFF = [300, 800];

/**
 * Whether a failed attempt is worth repeating.
 *
 * A 404 is an answer, not a blip: the record is not there, and asking three
 * times will not conjure it. Retrying would only delay the honest message.
 *
 * @param {number} attempt  how many attempts have already failed
 */
export const shouldRetry = (error, attempt, max = AUTO_RETRIES) => {
  if (attempt >= max) return false;
  if (error?.status === 404) return false;
  return true;
};

/** How long to wait before the retry that follows `attempt` failures. */
export const retryDelay = (attempt, backoff = RETRY_BACKOFF) => {
  if (!Array.isArray(backoff) || backoff.length === 0) return 0;
  const index = Math.min(Math.max(attempt, 0), backoff.length - 1);
  return backoff[index];
};
