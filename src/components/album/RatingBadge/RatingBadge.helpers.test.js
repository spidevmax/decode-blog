import { describe, expect, it } from 'vitest';
import { RATING_BANDS, ratingTone } from './RatingBadge.helpers';

describe('ratingTone', () => {
  it('uses magenta from 8.5 inclusive', () => {
    expect(ratingTone(10)).toBe('magenta');
    expect(ratingTone(9.2)).toBe('magenta');
    expect(ratingTone(8.5)).toBe('magenta');
  });

  it('uses petrol between 7 and 8.5 (8.5 excluded)', () => {
    expect(ratingTone(8.4)).toBe('petrol');
    expect(ratingTone(7)).toBe('petrol');
  });

  it('uses mostaza between 5.5 and 7 (7 excluded)', () => {
    expect(ratingTone(6.9)).toBe('mostaza');
    expect(ratingTone(5.5)).toBe('mostaza');
  });

  it('uses terracota below 5.5', () => {
    expect(ratingTone(5.4)).toBe('terracota');
    expect(ratingTone(0)).toBe('terracota');
  });

  // The boundaries are the business rule: each one belongs to the upper band.
  it('respects the exact thresholds', () => {
    expect(ratingTone(8.49)).toBe('petrol');
    expect(ratingTone(6.99)).toBe('mostaza');
    expect(ratingTone(5.49)).toBe('terracota');
  });
});

describe('RATING_BANDS', () => {
  it('runs highest first, so the find picks the right band', () => {
    const mins = RATING_BANDS.map((b) => b.min);
    expect([...mins].sort((a, b) => b - a)).toEqual(mins);
  });

  it('gives every band a tone and a label', () => {
    expect(RATING_BANDS.every((b) => b.tone && b.label)).toBe(true);
  });

  // The footer legend reads these bands, so they have to agree with the badge
  // for every score the site can show.
  it('agrees with ratingTone across the whole scale', () => {
    for (let score = 0; score <= 10; score += 0.1) {
      const rounded = Math.round(score * 10) / 10;
      const expected = RATING_BANDS.find((b) => rounded >= b.min).tone;
      expect(ratingTone(rounded)).toBe(expected);
    }
  });

  it('still paints something below the lowest floor', () => {
    expect(ratingTone(-1)).toBe('terracota');
  });
});
