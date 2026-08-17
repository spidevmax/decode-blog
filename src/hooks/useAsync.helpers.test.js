import { describe, expect, it } from 'vitest';

import { AUTO_RETRIES, RETRY_BACKOFF, retryDelay, shouldRetry } from './useAsync.helpers';

describe('shouldRetry', () => {
  it('retries a dropped request while attempts remain', () => {
    expect(shouldRetry(new Error('network'), 0)).toBe(true);
    expect(shouldRetry(new Error('network'), 1)).toBe(true);
  });

  it('gives up once the attempts are spent', () => {
    expect(shouldRetry(new Error('network'), AUTO_RETRIES)).toBe(false);
    expect(shouldRetry(new Error('network'), AUTO_RETRIES + 1)).toBe(false);
  });

  // The whole point: a missing record is an answer, and repeating the question
  // only delays telling the reader the truth.
  it('never retries a 404', () => {
    expect(shouldRetry({ status: 404 }, 0)).toBe(false);
    expect(shouldRetry({ status: 404 }, 1)).toBe(false);
  });

  it('retries other statuses', () => {
    expect(shouldRetry({ status: 500 }, 0)).toBe(true);
    expect(shouldRetry({ status: 503 }, 0)).toBe(true);
  });

  it('honours a custom ceiling', () => {
    expect(shouldRetry(new Error('x'), 0, 0)).toBe(false);
    expect(shouldRetry(new Error('x'), 4, 5)).toBe(true);
  });

  it('survives a nullish error', () => {
    expect(shouldRetry(null, 0)).toBe(true);
    expect(shouldRetry(undefined, 0)).toBe(true);
  });
});

describe('retryDelay', () => {
  it('follows the backoff', () => {
    expect(retryDelay(0)).toBe(RETRY_BACKOFF[0]);
    expect(retryDelay(1)).toBe(RETRY_BACKOFF[1]);
  });

  it('holds at the last step rather than running off the end', () => {
    expect(retryDelay(99)).toBe(RETRY_BACKOFF[RETRY_BACKOFF.length - 1]);
  });

  it('clamps a negative attempt to the first step', () => {
    expect(retryDelay(-1)).toBe(RETRY_BACKOFF[0]);
  });

  it('returns nothing to wait for when there is no backoff', () => {
    expect(retryDelay(0, [])).toBe(0);
    expect(retryDelay(0, null)).toBe(0);
  });

  // Every wait happens under the loader, so the total has to stay short.
  it('adds up to under a second and a half', () => {
    const total = RETRY_BACKOFF.reduce((sum, ms) => sum + ms, 0);
    expect(total).toBeLessThan(1500);
  });
});
