# DECODE

Music criticism without courtesies — a magazine front-end for album reviews,
news and long-form features.

Single-page app built with **React 19 + React Router 7 + Vite 8**, in plain
JavaScript, with hand-written CSS driven by design tokens. No TypeScript, no
CSS framework, no component library.

There is **no backend**: all content comes from an in-memory dataset behind a
service layer that simulates network latency and failures.

---

## Getting started

Requires Node 20+ (developed on Node 26).

```bash
npm install
npm run dev          # http://localhost:5173
```

**Read [Two things that will confuse you](#two-things-that-will-confuse-you)
before you file a bug.** The app fails and shows broken images on purpose.

---

## Commands

| Command                | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Dev server on http://localhost:5173                       |
| `npm run build`        | Production build into `dist/`                             |
| `npm run preview`      | Serve the built `dist/`                                   |
| `npm run lint`         | ESLint over the repo                                      |
| `npm run format`       | Prettier, write                                           |
| `npm run format:check` | Prettier, check only                                      |
| `npm test`             | Vitest, single run                                        |
| `npm run test:watch`   | Vitest in watch mode                                      |
| `npm run e2e`          | Playwright smoke suite — **needs the dev server running** |

---

## Two things that will confuse you

**1. The mock API fails ~8% of the time on purpose.** `FAIL_RATE` in
[`src/services/api.js`](src/services/api.js) defaults to `0.08`. A page that
errors once and works on retry is behaving correctly — it exists so the loading
and error states get exercised in normal use.

To develop without it, create a `.env.local`:

```
VITE_API_FAIL_RATE=0
```

Unit tests already pin it to `0` via `test.env` in `vite.config.js`. It has to
be set there rather than in a `beforeAll`, because `api.js` reads the variable
at import time.

**2. Cover art may 404.** Albums point at `/covers/<id>.jpg`. Any that are
missing fall back to a gradient generated from the album id — deterministic, so
a given album always looks the same. [`AlbumCover`](src/components/album/AlbumCover.jsx)
handles this via `onError`, and the E2E suite filters the resulting console
noise. Missing artwork is not a rendering bug.

---

## Routes

| Route           | Page            | What it is                                                       |
| --------------- | --------------- | ---------------------------------------------------------------- |
| `/`             | `Home`          | Featured review, then a mixed grid of reviews, news and features |
| `/reviews`      | `Reviews`       | Full archive, filterable, paginated                              |
| `/reviews/:id`  | `ReviewDetail`  | One review: cover, score, spec block, body                       |
| `/news`         | `News`          | News listing                                                     |
| `/news/:id`     | `NewsDetail`    | One news story                                                   |
| `/features`     | `Features`      | Long-form listing                                                |
| `/features/:id` | `FeatureDetail` | One feature                                                      |
| `/saved`        | `Saved`         | Everything saved, grouped by type                                |
| `/suggest`      | `Suggest`       | Newsletter sign-up and album suggestion forms                    |
| `/explore`      | —               | Redirect to `/reviews`, preserving the query string              |
| `*`             | `NotFound`      | 404                                                              |

---

## Project layout

```
src/
  main.jsx            StrictMode > BrowserRouter > FavoritesProvider > App
  App.jsx             shell: skip link, Nav, <main>, Footer
  app/routes.jsx      route table, lazy loading, /explore redirect
  pages/              one file (or folder) per route, each with its own CSS
  components/
    album/            AlbumCard, AlbumCover, AlbumGrid, GenreTag, RatingBadge
    editorial/        ArticleBody, ArticleHeader, EditorialCard, LatestStrip, TypeChip
    layout/           Nav, Footer
    ui/               Button, ErrorState, FormField, Loader, Pagination, SaveButton
  context/            FavoritesProvider + its helpers
  hooks/              useAsync (generic) + useAlbums / useEditorial / useHomeFeed / usePagination / useFavorites
  services/           api.js + mocks/*.data.js
  styles/             tokens.css, global.css, layout.css
  utils/              domain-free helpers (dates, validation)
```

**Layering:** pages → hooks → services → mocks. Components never import from
`services/` directly; data reaches them through hooks. Keeping that boundary is
what makes swapping the mocks for real `fetch` calls a one-file change.

---

## Conventions

- **Arrow-function components**, `export default` at the bottom of the file.
  Cards are wrapped in `React.memo`.
- **Path alias `@/` → `src/`.** Declared twice on purpose: `vite.config.js` for
  the bundler, `jsconfig.json` for the editor. Change both together.
- **One barrel only** — [`src/components/ui/index.js`](src/components/ui/index.js),
  with explicit named exports. Don't add one in `pages/`: it would defeat the
  per-route code splitting.
- **Colocated CSS.** Every component imports its own `.css` sibling. Class names
  are BEM-ish (`nav__link--active`). No inline styles except CSS custom
  properties (`style={{ '--card-accent': … }}`).
- **Multi-file components get a folder** with an `index.js`. Suffixes in use:
  `.helpers.js` (domain logic, unit tested), `.constants.js`, `.test.js`.
- **`utils/` vs `.helpers.js`**: utils are portable and domain-free; helpers are
  DECODE-specific.
- **Never hardcode a colour, space or border** — everything is a custom property
  in [`src/styles/tokens.css`](src/styles/tokens.css).

### Design system

Swiss/metro on a dark ground: straight edges everywhere (`border-radius: 0`),
2px rules instead of shadows, no rotation.

- **Oswald** for everything functional — headings, nav, buttons, chips, metadata.
- **Lora** for long-form prose and pull quotes only.
- The two never mix inside one block. There is an E2E test that enforces this.
- Token names are Spanish and only loosely describe the hue: `--color-mostaza`
  is amber `#e0a93a`, `--color-oliva` olive `#6e7c3d`, `--color-petrol` deep
  teal `#1f5c63`, `--color-magenta` raspberry `#c93b6b`. Don't "fix" a token by
  changing its value to match its name.
- The rating badge is one of the two deliberate circles (with the logo dots).
  Its colour bands live in
  [`RatingBadge.helpers.js`](src/components/album/RatingBadge/RatingBadge.helpers.js).

---

## Testing

**82 unit tests** across 7 files, plus a **31-check E2E suite**.

Unit tests run in the **node** environment and only match `src/**/*.test.js`
(see `test.include` in `vite.config.js`). There is no jsdom and no React Testing
Library, so the tested code is deliberately the pure logic pulled out into
`.helpers.js` files — pagination maths, favourites storage, the Home feed
interleave, `*emphasis*` parsing, rating bands, validation. Rendering is covered
by the E2E suite instead.

Adding component tests means adding jsdom and `@testing-library/react`, and
widening `test.include` to `*.test.{js,jsx}`. Treat that as a deliberate change.

E2E lives in [`e2e/smoke.mjs`](e2e/smoke.mjs): raw Playwright, no test runner.
Each navigation retries up to 8 times to absorb the simulated API failures, so a
failure means a real bug.

```bash
npm run dev     # terminal 1
npm run e2e     # terminal 2
```

Point it elsewhere with `E2E_BASE_URL=http://localhost:5199 npm run e2e`.

---

## Definition of done

1. `npm run lint` — clean
2. `npm test` — green
3. `npm run format:check` — clean
4. `npm run build` — succeeds
5. If routes, data or UI changed: `npm run e2e` — green

---

## Notable implementation details

Worth reading before changing the surrounding code:

- **`useAsync`** ([`src/hooks/useAsync.js`](src/hooks/useAsync.js)) deliberately
  avoids `setState` in effects: loading is derived during render by comparing the
  settled result's key against the current one. Fetcher arguments must be
  JSON-serialisable. Read the whole file before modifying it — the
  out-of-order-response guard and the retry counter are load-bearing.
- **Filters and pagination live in the URL** (`?genre`, `?year`, `?sort`,
  `?page`), never in component state, so a view is shareable and the back button
  works. Changing a filter clears `?page`; a `?page` beyond the end clamps to the
  last real page.
- **Favourites** are stored in `localStorage` as `{type, id}` pairs, because ids
  are only unique within their own dataset. The original format — a bare array of
  album ids — is migrated on read.
- **The Home grid mixes content types**, one editorial piece after every four
  reviews. The composition is pure and unit tested in
  [`homeFeed.helpers.js`](src/hooks/homeFeed.helpers.js); news and features are
  an enhancement, so the grid still renders if their fetch fails.
- **Nav closes without an effect**: it stores the pathname it opened on and
  compares against the current location. Don't replace this with a `useEffect`.
- **No `dangerouslySetInnerHTML` anywhere.** The `*emphasis*` markup in article
  bodies is parsed into React elements.
