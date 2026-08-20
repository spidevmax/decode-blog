import { describe, expect, it } from 'vitest';

import {
  bandRange,
  bandRangeLabel,
  RATING_BANDS,
  ratingBand,
  ratingTone,
} from './RatingBadge.helpers';

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
});

describe('bandRange', () => {
  it('runs from its own floor to the next band up', () => {
    expect(bandRange('recommended')).toEqual({ min: 7, max: 8.5 });
    expect(bandRange('flawed')).toEqual({ min: 5.5, max: 7 });
  });

  // Nothing scores above ten today, but the range should not be the thing
  // that decides that.
  it('leaves the top band open', () => {
    expect(bandRange('essential')).toEqual({ min: 8.5, max: Infinity });
  });

  // Every band has to be reachable from a URL, or a chip filters nothing.
  it('resolves every published band', () => {
    expect(RATING_BANDS.every((band) => bandRange(band.slug))).toBe(true);
  });

  // A hand-edited ?rated= should show the whole archive, not none of it.
  it('returns null for anything it does not know', () => {
    expect(bandRange('masterpiece')).toBe(null);
    expect(bandRange(null)).toBe(null);
  });
});

describe('ratingBand', () => {
  it('names the band, not just its colour', () => {
    expect(ratingBand(10).label).toBe('Essential');
    expect(ratingBand(7.4).label).toBe('Recommended');
  });

  // Each boundary belongs to the band above it.
  it('puts a boundary score in the upper band', () => {
    expect(ratingBand(8.5).label).toBe('Essential');
    expect(ratingBand(8.4).label).toBe('Recommended');
  });
});

describe('bandRangeLabel', () => {
  it('opens the top band and closes the rest', () => {
    expect(bandRangeLabel('essential')).toBe('8.5+');
    expect(bandRangeLabel('recommended')).toBe('7–8.5');
    expect(bandRangeLabel('skip')).toBe('0–5.5');
  });

  // Each band ends where the next begins: no gap, no overlap, so the key
  // cannot describe a score as belonging to two of them.
  it('meets the band above it exactly', () => {
    RATING_BANDS.slice(1).forEach((band, i) => {
      expect(bandRangeLabel(band.slug).endsWith(String(RATING_BANDS[i].min))).toBe(true);
    });
  });

  it('prints nothing for a band that does not exist', () => {
    expect(bandRangeLabel('masterpiece')).toBe('');
  });
});
