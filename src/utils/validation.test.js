import { describe, expect, it } from 'vitest';

import { isNotBlank, isValidEmail } from './validation';

describe('isValidEmail', () => {
  it('accepts well-formed emails', () => {
    expect(isValidEmail('hello@example.com')).toBe(true);
    expect(isValidEmail('m.lopez+decode@sub.domain.co.uk')).toBe(true);
  });

  it('trims whitespace before validating', () => {
    expect(isValidEmail('  hello@example.com  ')).toBe(true);
  });

  it('rejects anything not shaped like an email', () => {
    expect(isValidEmail('bad')).toBe(false);
    expect(isValidEmail('no@domain')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('with space@example.com')).toBe(false);
  });

  it('does not blow up on null/undefined', () => {
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});

describe('isNotBlank', () => {
  it('tells real content from whitespace', () => {
    expect(isNotBlank('Content')).toBe(true);
    expect(isNotBlank('   ')).toBe(false);
    expect(isNotBlank('')).toBe(false);
  });

  it('does not blow up on null/undefined', () => {
    expect(isNotBlank(null)).toBe(false);
    expect(isNotBlank(undefined)).toBe(false);
  });
});
