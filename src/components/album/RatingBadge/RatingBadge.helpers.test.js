import { describe, expect, it } from 'vitest';
import { ratingTone } from './RatingBadge.helpers';

describe('ratingTone', () => {
  it('usa teal desde 8 inclusive', () => {
    expect(ratingTone(10)).toBe('teal');
    expect(ratingTone(8.7)).toBe('teal');
    expect(ratingTone(8)).toBe('teal');
  });

  it('usa ink entre 6.5 y 8 (sin incluir 8)', () => {
    expect(ratingTone(7.9)).toBe('ink');
    expect(ratingTone(6.5)).toBe('ink');
  });

  it('usa red por debajo de 6.5', () => {
    expect(ratingTone(6.4)).toBe('red');
    expect(ratingTone(0)).toBe('red');
  });

  // Los límites son la regla de negocio: 8 y 6.5 pertenecen al tramo superior.
  it('respeta los umbrales exactos', () => {
    expect(ratingTone(7.99)).toBe('ink');
    expect(ratingTone(6.49)).toBe('red');
  });
});
