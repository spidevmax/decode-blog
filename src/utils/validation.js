/**
 * Generic validation helpers, nothing DECODE-specific.
 * (Utils = portable to any project; helpers = domain-specific.)
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @returns {boolean} true if `value` looks like a valid email. */
export const isValidEmail = (value) => EMAIL_RE.test(String(value ?? '').trim());

/** @returns {boolean} true if `value` has any non-whitespace character. */
export const isNotBlank = (value) => String(value ?? '').trim().length > 0;
