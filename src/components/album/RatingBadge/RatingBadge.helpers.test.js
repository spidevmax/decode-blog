import { describe, expect, it } from 'vitest';
import { ratingTone } from './RatingBadge.helpers';

describe('ratingTone', () => {
  it('uses teal from 8 inclusive', () => {
    expect(ratingTone(10)).toBe('teal');
    expect(ratingTone(8.7)).toBe('teal');
    expect(ratingTone(8)).toBe('teal');
  });

  it('uses ink between 6.5 and 8 (8 excluded)', () => {
    expect(ratingTone(7.9)).toBe('ink');
    expect(ratingTone(6.5)).toBe('ink');
  });

  it('uses red below 6.5', () => {
    expect(ratingTone(6.4)).toBe('red');
    expect(ratingTone(0)).toBe('red');
  });

  // The boundaries are the business rule: 8 and 6.5 belong to the upper band.
  it('respects the exact thresholds', () => {
    expect(ratingTone(7.99)).toBe('ink');
    expect(ratingTone(6.49)).toBe('red');
  });
});
