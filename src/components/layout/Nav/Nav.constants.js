/**
 * The wordmark: one circle per letter, each with its own colour from the
 * palette. Kept as data so the markup stays a plain map.
 */
export const LOGO_LETTERS = [
  { letter: 'd', color: 'var(--color-magenta)' },
  { letter: 'e', color: 'var(--color-mostaza)' },
  { letter: 'c', color: 'var(--color-petrol)' },
  { letter: 'o', color: 'var(--color-terracota)' },
  { letter: 'd', color: 'var(--color-oliva)' },
  { letter: 'e', color: 'var(--color-paper-text)' },
];

/**
 * Primary navigation links, in display order.
 *
 * Home is deliberately absent: the wordmark is the way back to `/`.
 */
export const LINKS = [
  { to: '/reviews', label: 'Reviews' },
  { to: '/news', label: 'News' },
  { to: '/features', label: 'Features' },
  { to: '/suggest', label: 'Suggest' },
];
