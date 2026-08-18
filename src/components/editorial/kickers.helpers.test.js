import { describe, expect, it } from 'vitest';

import { kickerColor, KICKERS } from './kickers.helpers';

describe('the kicker taxonomy', () => {
  it('names each type exactly once', () => {
    const names = KICKERS.map((k) => k.name);
    expect(new Set(names).size).toBe(names.length);
  });

  // Colour is how the archive tells the four types apart at a glance, so two
  // of them sharing a hue would make the distinction unreadable.
  it('gives each type its own colour', () => {
    const colors = KICKERS.map((k) => k.color);
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('paints only with palette tokens, never a literal', () => {
    for (const { name, color } of KICKERS) {
      expect(color, name).toMatch(/^var\(--color-[a-z-]+\)$/);
    }
  });

  it('returns the colour a type is filed under', () => {
    for (const { name, color } of KICKERS) {
      expect(kickerColor(name)).toBe(color);
    }
  });

  // A type added to the dataset before it is added here should look
  // deliberate rather than unstyled.
  it('falls back to magenta for an unknown type', () => {
    expect(kickerColor('Obituary')).toBe('var(--color-magenta)');
    expect(kickerColor(undefined)).toBe('var(--color-magenta)');
    expect(kickerColor('')).toBe('var(--color-magenta)');
  });

  // The fallback must not be one of the four, or an unfiled piece would
  // impersonate a filed one.
  it('does not reuse a real type colour as the fallback', () => {
    expect(KICKERS.map((k) => k.color)).not.toContain(kickerColor('Obituary'));
  });
});
