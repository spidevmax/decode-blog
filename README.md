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

| Command                | What it does                                      |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Dev server on http://localhost:5173               |
| `npm run build`        | Production build into `dist/`                     |
| `npm run preview`      | Serve the built `dist/`                           |
| `npm run lint`         | ESLint over the repo                              |
| `npm run format`       | Prettier, write                                   |
| `npm run format:check` | Prettier, check only                              |
| `npm test`             | Vitest, single run                                |
| `npm run test:watch`   | Vitest in watch mode                              |
| `npm run e2e`          | Playwright smoke suite — builds and serves itself |
| `npm run e2e:flaky`    | The same suite, with the simulated outages on     |

---

## Two things that will confuse you

**1. The mock API fails ~8% of the time on purpose — in development only.**
[`src/services/api.js`](src/services/api.js) simulates a network in front of
the dataset: a ~500ms round trip and a 1-in-12 failure rate. A page that errors
once and works on retry is behaving correctly. It exists so the loading and
error states get exercised in normal use rather than rotting unseen.

A production build turns both off (`import.meta.env.DEV`), because neither is a
property of the data: a deployed build serves what it already holds in memory,
immediately. No environment variables to set: the only deployment config is
the SPA rewrite in `vercel.json`, which every client-routed build needs so a
refresh on `/reviews/:id` reaches the app instead of a 404.

Both are overridable at build time, in a `.env.local` or inline:

```
VITE_API_FAIL_RATE=0     # develop without the dropped requests
VITE_API_LATENCY=0       # ...and without the wait
VITE_API_FAIL_RATE=0.3   # or lean on the error states
```

Both test projects pin them to `0` via `TEST_ENV` in `vite.config.js`. They have
to be set there rather than in a `beforeAll`, because Vite inlines
`import.meta.env` at build time and `api.js` reads it at import time.

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
| `/saved`        | `Saved`         | Everything saved, as one shelf of uniform rows                   |
| `/suggest`      | `Suggest`       | Newsletter sign-up and album suggestion forms                    |
| `*`             | `NotFound`      | 404                                                              |

---

## Project layout

```
src/
  main.jsx            StrictMode > BrowserRouter > FavoritesProvider > App
  App.jsx             shell: skip link, Nav, <main>, Footer
  app/routes.jsx      route table, lazy loading
  pages/              one file or folder per route, each with its own CSS
  components/
    album/            AlbumCard, AlbumCover, AlbumGrid, GenreTag, RatingBadge
    editorial/        ArticleBody, ArticleHeader, EditorialCard, LatestStrip, ReadingProgress,
                      TypeChip, kickers.helpers.js (the four long-read types and their colours)
    layout/           Nav, Footer
    ui/               Button, ErrorState, FilterSelect, FormField, Loader, Pagination, SaveButton
  context/            FavoritesProvider + its helpers
  hooks/              useAsync (generic) + useAlbums / useEditorial / useHomeFeed / usePagination / useFavorites
  services/           api.js + mocks/*.data.js
  styles/             tokens.css, global.css, layout.css
  test/               setup.js for the jsdom project (localStorage shim, cache reset)
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
- **One aggregating barrel** — [`src/components/ui/index.js`](src/components/ui/index.js),
  with explicit named exports. The other `index.js` files are single re-exports
  that let a folder resolve by its own name, and cost nothing. Don't add a real
  barrel in `pages/`: it would defeat the per-route code splitting. This one
  holds only what the first paint needs
  anyway (`Button`, `ErrorState`, `Loader`, `SaveButton`); everything else is
  deep-imported from its own file, because a component's CSS import is a side
  effect and ships even when the component is tree-shaken away.
- **Colocated CSS.** Every component imports its own `.css` sibling. Class names
  are BEM-ish (`nav__link--active`). No inline styles except CSS custom
  properties (`style={{ '--card-accent': … }}`).
- **When something gets a folder.** Two directory styles exist and the line
  between them is not taste:
  - **Components and pages** are flat — `Button.jsx` + `Button.css` — until
    there is anything _beyond_ the `.jsx` and its stylesheet. A third file
    (helpers, constants, a test) means a folder with an `index.js`, so
    `@/pages/News` keeps resolving and no import has to know. The `.css`
    sibling never triggers this: every component has one.
  - **Module directories** — `hooks/`, `utils/`, `context/`, `services/` — are
    always flat, and group by filename instead: `useAsync.js`,
    `useAsync.helpers.js`, `useAsync.test.jsx`.

  Suffixes in use: `.helpers.js` (domain logic, unit tested), `.constants.js`,
  `.test.js` (pure, runs in node), `.test.jsx` (renders, runs in jsdom).

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

**187 unit tests** across 17 files, plus a **40-check E2E suite**.

Vitest runs **two projects**, split by what they need rather than by what they
cover. The file extension decides which one claims a test — there is nothing to
configure per file:

| Project | Files        | Environment | For                                       |
| ------- | ------------ | ----------- | ----------------------------------------- |
| `node`  | `*.test.js`  | node        | Pure logic in `.helpers.js`, and `api.js` |
| `dom`   | `*.test.jsx` | jsdom       | Hooks and components                      |

`npm test` runs both; `npx vitest run --project node` runs just the fast half.
Keep that half fast: it has no DOM and finishes in under half a second, which
is what makes it the suite you can leave running while you work. Nothing that
needs a browser belongs in it.

What the `dom` project covers, and why those and not everything: `useAsync`,
because out-of-order responses, retries and caching are the easiest things in
the repo to break silently; then `FilterSelect`, `SaveButton` and `ErrorState`,
the three components with real behaviour rather than markup. `TypeChip` and
`LatestStrip` are not unit tested on purpose — the E2E suite already sees them,
and a test that only restates the JSX costs maintenance and catches nothing.

Two environment details worth knowing before you add a test:

- **`localStorage` is a shim.** jsdom 30 under Node 26 provides none, so
  [`src/test/setup.js`](src/test/setup.js) installs an in-memory one and clears
  it between tests. `FavoritesProvider` wraps every access in a try/catch, so
  without the shim favourites would silently never persist and the storage
  format would be untestable.
- **The request cache is cleared between tests,** also in `setup.js`. It lives
  at module scope and outlives the component that filled it, which in a test
  file means it outlives the test.

E2E lives in [`e2e/smoke.mjs`](e2e/smoke.mjs): raw Playwright, no test runner.
It builds, serves, tests and tears down on its own — nothing to start first:

```bash
npm run e2e          # ~50s, deterministic
npm run e2e:flaky    # the same suite with the 8% failure rate switched on
```

It runs against a **production build** on `vite preview`, not the dev server.
That is what makes it trustworthy: a production build has the network
simulation off, so every navigation resolves once and a red test is a red
test. It is also the artefact that gets deployed, chunking included.

`e2e:flaky` puts the outages back for one build, so the retry paths and error
states get exercised. Deliberately a separate command: a suite that sometimes
fails teaches you to rerun it rather than to fix it.

Point it at a server you already have with
`E2E_BASE_URL=http://localhost:5173 npm run e2e` — which also re-enables the
8-attempt retry, since a dev server drops requests on purpose.

Two things the assertions try to get right, both learned the hard way:
**never hard-code how much content exists** (the pager test used to assert
"news fits on one page" and started reporting a correct pager as a bug when
the archive grew), and **assert against the markup that ships** (four `/saved`
tests kept targeting `.saved__section` for months after the page was
redesigned as a flat shelf).

---

## Definition of done

1. `npm run lint` — clean
2. `npm test` — green
3. `npm run format:check` — clean
4. `npm run build` — succeeds
5. If routes, data or UI changed: `npm run e2e` — green

All five run on every push and pull request
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)), so the list is now
enforced rather than remembered. Running them locally first is still faster
than waiting for a red tick.

The workflow is two parallel jobs: `check` (1–4) for fast feedback, and `e2e`
(5) on its own because it downloads a browser. A formatting mistake should not
wait behind a Chromium install, and the two ticks say which kind of thing broke
before you open the log.

Node is pinned to the version the project is developed on. The claim above that
it runs on Node 20+ is not verified by anything — widen `NODE_VERSION` into a
matrix if it needs to hold.

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
  are only unique within their own dataset. What comes back out is untrusted, so
  it is validated and de-duplicated on read; anything unusable is dropped.
- **The Home grid mixes content types**, one editorial piece after every four
  reviews. The composition is pure and unit tested in
  [`homeFeed.helpers.js`](src/hooks/homeFeed.helpers.js); news and features are
  an enhancement, so the grid still renders if their fetch fails.
- **Nav closes without an effect**: it stores the pathname it opened on and
  compares against the current location. Don't replace this with a `useEffect`.
- **No `dangerouslySetInnerHTML` anywhere.** The `*emphasis*` markup in article
  bodies is parsed into React elements.
