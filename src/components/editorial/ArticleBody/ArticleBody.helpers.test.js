import { describe, expect, it } from 'vitest';
import { splitEmphasis } from './ArticleBody.helpers';

describe('splitEmphasis', () => {
  it('leaves plain text as a single segment', () => {
    expect(splitEmphasis('no markup here')).toEqual([
      { text: 'no markup here', em: false },
    ]);
  });

  it('marks the wrapped chunk and keeps what surrounds it', () => {
    expect(splitEmphasis('listen to *BRAT* now')).toEqual([
      { text: 'listen to ', em: false },
      { text: 'BRAT', em: true },
      { text: ' now', em: false },
    ]);
  });

  it('handles several emphasised chunks', () => {
    const segments = splitEmphasis('*a* and *b*');
    expect(segments.filter((s) => s.em).map((s) => s.text)).toEqual(['a', 'b']);
  });

  // A lone asterisk is content, not markup: it must survive untouched.
  it('leaves unpaired asterisks alone', () => {
    expect(splitEmphasis('2 * 3 = 6')).toEqual([{ text: '2 * 3 = 6', em: false }]);
  });

  // '**' has nothing between the delimiters, so it is not emphasis.
  it('does not treat an empty pair as emphasis', () => {
    expect(splitEmphasis('a ** b')).toEqual([{ text: 'a ** b', em: false }]);
  });

  it('survives empty and nullish input', () => {
    expect(splitEmphasis('')).toEqual([]);
    expect(splitEmphasis(undefined)).toEqual([]);
    expect(splitEmphasis(null)).toEqual([]);
  });
});
