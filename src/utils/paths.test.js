import { describe, expect, it } from 'vitest';
import { truncatePath } from './paths';

describe('truncatePath', () => {
  it('leaves a short path alone', () => {
    expect(truncatePath('/reviews/gnx')).toBe('/reviews/gnx');
  });

  it('leaves a path of exactly the limit alone', () => {
    const path = '/'.padEnd(20, 'a');
    expect(truncatePath(path, 20)).toBe(path);
  });

  it('truncates a longer path and marks it', () => {
    const result = truncatePath('/'.padEnd(40, 'a'), 20);
    expect(result).toHaveLength(20);
    expect(result.endsWith('…')).toBe(true);
  });

  // The start is what tells you which address you got wrong.
  it('keeps the beginning of the path', () => {
    expect(truncatePath('/reviews/some-very-long-album-slug', 12)).toBe('/reviews/so…');
  });

  it('survives nullish and non-string input', () => {
    expect(truncatePath(null)).toBe('');
    expect(truncatePath(undefined)).toBe('');
    expect(truncatePath(42)).toBe('42');
  });

  it('returns nothing when there is no room', () => {
    expect(truncatePath('/reviews', 0)).toBe('');
  });
});
