/**
 * UI primitives barrel.
 *
 * The only index.js that aggregates more than one module. The fourteen others
 * — `Nav/index.js`, `pages/News/index.js` and the rest — are single
 * re-exports that let a folder resolve by its own name and pull in nothing a
 * direct import would not. Nothing like this file exists in `album/` or
 * `pages/`, where it would defeat the per-route code splitting.
 *
 * Explicit named exports, no `export *`: keeps tree-shaking predictable and
 * avoids collisions as the set grows.
 *
 * Membership is not "every primitive", it is "the ones on the path to the
 * first paint anyway". Importing this barrel pulls in every component listed
 * here, and while unused *code* is tree-shaken, each component also imports
 * its own stylesheet — and a CSS import is a side effect, so it ships whether
 * or not anything renders it. Four components earn their place: `Loader`
 * (used by the route table itself), `ErrorState`, `Button`, and `SaveButton`,
 * which `AlbumCard` puts on the home page.
 *
 * `FilterSelect`, `Pagination` and `FormField` are deliberately absent. They
 * belong to the listing pages and to /suggest, all of them lazily loaded, so
 * they are imported directly from their own files and stay in those route
 * chunks. Add to this list only what the first paint already needs.
 */
export { default as Button } from './Button';
export { default as ErrorState } from './ErrorState';
export { default as Loader } from './Loader';
export { default as SaveButton } from './SaveButton';
