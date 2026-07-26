/** score >= 8 → teal · score >= 6.5 → ink · score < 6.5 → red */
export const ratingTone = (score) => {
  if (score >= 8) return 'teal';
  if (score >= 6.5) return 'ink';
  return 'red';
};
