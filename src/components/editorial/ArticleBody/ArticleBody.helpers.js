/**
 * Inline markup shared by article bodies across reviews, news and features.
 *
 * Splits a paragraph into segments, marking which ones were wrapped in
 * asterisks: `'a *b* c'` → `[{text:'a '}, {text:'b', em:true}, {text:' c'}]`.
 *
 * Returning data rather than JSX keeps this file plain JS (unit-testable, and
 * consistent with the other `.helpers.js` in the project); ArticleBody turns
 * the segments into <em> elements. Nothing here produces an HTML string, so
 * no dangerouslySetInnerHTML is involved anywhere in the chain.
 */
export const splitEmphasis = (text) => {
  return String(text ?? '')
    .split(/(\*[^*]+\*)/g)
    .filter((chunk) => chunk !== '')
    .map((chunk) => {
      const isEm = chunk.startsWith('*') && chunk.endsWith('*') && chunk.length > 2;
      return isEm ? { text: chunk.slice(1, -1), em: true } : { text: chunk, em: false };
    });
};
