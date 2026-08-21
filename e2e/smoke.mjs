/**
 * End-to-end smoke test for DECODE.
 *
 *   npm run e2e          builds, serves, tests, tears down
 *   npm run e2e:flaky    the same, with the simulated outages switched on
 *
 * It runs against a production build rather than the dev server, which is
 * what makes the result trustworthy: a production build turns the network
 * simulation off, so every navigation resolves once, immediately, and a red
 * test means a red test. It is also the artefact that actually gets deployed
 * — the route chunks and the dynamically imported dataset included — so this
 * exercises what readers will run, not an approximation of it.
 *
 * `npm run e2e:flaky` puts the 8% failure rate back for a build. The error
 * states are worth exercising, but not in the same run as the regression
 * suite: a test that sometimes passes teaches you to rerun it, not to fix it.
 *
 * Point it at an already-running server with E2E_BASE_URL to skip all of the
 * above (`E2E_BASE_URL=http://localhost:5173 npm run e2e` against `npm run dev`).
 */
import { spawn } from 'node:child_process';

import { chromium } from 'playwright';

/** Simulated failure rate to build with. Zero unless the flaky run asked. */
const FAIL_RATE = process.env.E2E_FAIL_RATE ?? '0';
const SIMULATING = Number(FAIL_RATE) > 0;

const PORT = Number(process.env.E2E_PORT ?? 4173);
const EXTERNAL = process.env.E2E_BASE_URL;
const BASE = EXTERNAL ?? `http://localhost:${PORT}`;

/**
 * Attempts per navigation. Retrying only makes sense while the API is
 * dropping requests on purpose: against a clean build, a page that does not
 * load is the finding, and eight four-second retries would just bury it.
 */
const RETRIES = SIMULATING || EXTERNAL ? 8 : 1;

/** Runs a command to completion, inheriting stdio so failures are readable. */
const run = (command, args, env) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false, env });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)),
    );
  });

/** Polls the server until it answers, so the first test never races the boot. */
const waitForServer = async (url, timeoutMs = 30000) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`server at ${url} never came up`);
};

let server = null;

if (!EXTERNAL) {
  console.log(`\nBuilding${SIMULATING ? ` with a ${FAIL_RATE} failure rate` : ''}…`);
  await run('npm', ['run', 'build'], {
    ...process.env,
    VITE_API_FAIL_RATE: FAIL_RATE,
  });

  server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
    stdio: 'ignore',
    shell: false,
  });
  server.on('error', (error) => {
    console.error(`could not start the preview server: ${error.message}`);
    process.exit(1);
  });

  await waitForServer(BASE);
  console.log(`Serving ${BASE}\n`);
}

/** Stops the server however the run ends, including Ctrl-C and a crash. */
const stopServer = () => {
  if (server && !server.killed) server.kill();
  server = null;
};
process.on('exit', stopServer);
process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});

const browser = await chromium.launch();
const results = [];

/**
 * Cover art is hosted on a CDN that blocks hotlinking, so every card logs a
 * failed image request. AlbumCover handles that with a gradient fallback, so
 * this noise is expected and must not fail the run.
 */
const isExpectedNoise = (text) =>
  /Failed to load resource|ERR_BLOCKED_BY_RESPONSE|net::ERR/.test(text);

async function check(name, fn) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error' && !isExpectedNoise(m.text())) errors.push(m.text());
  });

  try {
    const detail = await fn(page);
    results.push({ name, ok: errors.length === 0, detail, errors });
  } catch (e) {
    results.push({ name, ok: false, detail: String(e).split('\n')[0], errors });
  }
  await page.close();
}

/** Navigates, retrying while the mock API returns its simulated error. */
async function goto(page, path, selector) {
  for (let i = 0; i < RETRIES; i++) {
    await page.goto(BASE + path);
    try {
      await page.waitForSelector(selector, { timeout: 4000 });
      return true;
    } catch {
      /* simulated failure: retry */
    }
  }
  return false;
}

await check('Home: asymmetric grid with 2x2 feature card', async (page) => {
  if (!(await goto(page, '/', '.album-card'))) throw new Error('grid never loaded');
  const feature = await page.locator('.album-card--feature').count();
  const cols = await page.$eval(
    '.album-grid',
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
  );
  if (feature !== 1) throw new Error(`expected 1 feature card, found ${feature}`);
  return `${cols} columns, ${feature} feature`;
});

await check('Home mixes reviews with news and features', async (page) => {
  if (!(await goto(page, '/', '.album-card'))) throw new Error('grid never loaded');
  await page.waitForSelector('.editorial-card', { timeout: 8000 });

  const kinds = await page.$$eval('.album-grid > *', (els) =>
    els.map((e) =>
      e.classList.contains('album-card')
        ? 'review'
        : e.classList.contains('editorial-card--news')
          ? 'news'
          : e.classList.contains('editorial-card--feature')
            ? 'feature'
            : '?',
    ),
  );

  if (kinds.includes('?')) throw new Error('an unrecognised card is in the grid');
  if (kinds[0] !== 'review') throw new Error(`the lead card is a ${kinds[0]}`);

  const reviews = kinds.filter((k) => k === 'review').length;
  const editorial = kinds.length - reviews;
  if (editorial === 0) throw new Error('no editorial content was interleaved');
  // Reviews must stay the point of the page.
  if (reviews / kinds.length < 0.7) {
    throw new Error(`reviews are only ${reviews}/${kinds.length} of the grid`);
  }

  // Editorial cards carry no score: that is what separates them at a glance.
  const strayRatings = await page.locator('.editorial-card .rating').count();
  if (strayRatings) throw new Error('an editorial card rendered a rating badge');

  return `${kinds.length} cards: ${reviews} reviews, ${editorial} editorial`;
});

await check('Home cards are labelled by type', async (page) => {
  if (!(await goto(page, '/', '.album-card'))) throw new Error('grid never loaded');
  await page.waitForSelector('.editorial-card', { timeout: 8000 });

  // Colour alone must not carry the meaning: every chip spells out its type.
  const chips = await page.$$eval('.album-grid .type-chip', (els) =>
    els.map((e) => e.textContent.trim()),
  );
  if (chips.length === 0) throw new Error('no type chips in the grid');
  const known = ['Review', 'News', 'Feature'];
  const odd = chips.filter((c) => !known.includes(c));
  if (odd.length) throw new Error(`unexpected chip labels: ${odd.join(', ')}`);

  return `${chips.length} chips, all labelled`;
});

await check('The latest strip announces one of each type', async (page) => {
  if (!(await goto(page, '/', '.latest-strip'))) throw new Error('strip never loaded');

  // The strip renders each announcement as its list arrives rather than
  // waiting on the slowest, so it can be mid-fill when the selector resolves.
  await page
    .waitForFunction(
      () => document.querySelectorAll('.latest-strip__item').length === 3,
      null,
      { timeout: 8000 },
    )
    .catch(() => {});

  const items = await page.locator('.latest-strip__item').count();
  if (items !== 3) throw new Error(`expected 3 announcements, settled at ${items}`);

  // Static by design: nothing in the strip may animate.
  const animated = await page.$$eval(
    '.latest-strip *',
    (els) => els.filter((e) => getComputedStyle(e).animationName !== 'none').length,
  );
  if (animated) throw new Error(`${animated} animated nodes in the strip`);

  // Titles must survive the narrow widths. The list scrolls inside itself, so
  // a squeezed strip never widens the document and the overflow check on
  // /mobile cannot see it: flex once shrank every title to nothing, leaving
  // the chips adjacent with a date in the gap where a headline should be.
  for (const width of [320, 375, 600, 900]) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(200);
    const widths = await page.$$eval('.latest-strip__link', (as) =>
      as.map((a) => Math.round(a.getBoundingClientRect().width)),
    );
    const squeezed = widths.filter((w) => w < 40);
    if (squeezed.length) {
      throw new Error(`at ${width}px the titles measure ${widths.join('/')}`);
    }
  }
  await page.setViewportSize({ width: 1280, height: 800 });

  // Each announcement must lead somewhere real.
  const hrefs = await page.$$eval('.latest-strip__link', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  for (const href of hrefs) {
    await page.goto(BASE + href);
    await page.waitForTimeout(600);
    if (await page.locator('.error-state').count()) {
      throw new Error(`${href} fell through to an error`);
    }
  }
  return hrefs.join(' ');
});

await check('Home survives the simulated API failures', async (page) => {
  // With the failure rate at its default the three lists fail independently,
  // so this exercises the partial-data paths: whatever else happens, the hero
  // and the review grid must be there. (The empty-editorial case itself is
  // pinned down in the buildHomeFeed unit tests.)
  if (!(await goto(page, '/', '.album-card'))) {
    throw new Error('the grid never loaded');
  }
  if (!(await page.locator('.hero__title').count())) {
    throw new Error('the hero disappeared');
  }
  const cards = await page.locator('.album-card').count();
  if (cards === 0) throw new Error('no review cards rendered');
  return `hero + ${cards} review cards`;
});

await check('Every card renders a cover (image or gradient fallback)', async (page) => {
  if (!(await goto(page, '/reviews', '.album-card'))) {
    throw new Error('listing never loaded');
  }
  await page.waitForTimeout(1500); // let onError swap in the fallbacks
  const state = await page.evaluate(() => {
    const cards = document.querySelectorAll('.album-card').length;
    const imgs = [...document.querySelectorAll('.cover__img')];
    return {
      cards,
      covers: document.querySelectorAll('.cover').length,
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).length,
      painted: [...document.querySelectorAll('.cover:not(.cover--image)')].filter(
        (el) => getComputedStyle(el).backgroundImage !== 'none',
      ).length,
    };
  });
  if (state.covers !== state.cards) {
    throw new Error(`${state.cards} cards but ${state.covers} covers`);
  }
  if (state.broken > 0) throw new Error(`${state.broken} broken images left visible`);
  return `${state.covers} covers, ${state.painted} gradient fallbacks, 0 broken`;
});

await check('Reviews uses the even grid', async (page) => {
  await goto(page, '/reviews', '.album-card');
  const rows = await page.$eval('.album-grid', (el) => getComputedStyle(el).gridAutoRows);
  if (rows !== 'auto') throw new Error(`grid-auto-rows=${rows}`);
  return `grid-auto-rows: ${rows}`;
});

await check('Reviews filters by genre and updates the URL', async (page) => {
  if (!(await goto(page, '/reviews', '.album-card'))) {
    throw new Error('listing never loaded');
  }
  const before = await page.locator('.album-card').count();

  // Open the genre filter and take whatever the first real option is, so this
  // survives dataset changes. Option 0 is "All genres", the way back out.
  await page.locator('.filter-select__trigger').first().click();
  await page.waitForSelector('.filter-select__panel', { timeout: 3000 });
  const option = page.locator('.filter-select__option').nth(1);
  const label = (await option.textContent()).trim();
  await option.click();

  await page.waitForFunction(
    (g) => new URL(location.href).searchParams.get('genre') === g,
    label,
    { timeout: 4000 },
  );
  // Wait for the grid itself to settle: the cards from the unfiltered view are
  // still mounted, so waiting on the selector alone would test the old list.
  await page.waitForFunction(
    (g) => {
      const cards = [...document.querySelectorAll('.album-card')];
      return (
        cards.length > 0 &&
        cards.every((c) =>
          [...c.querySelectorAll('.genre-tag')].some((t) => t.textContent.trim() === g),
        )
      );
    },
    label,
    { timeout: 6000 },
  );

  const after = await page.locator('.album-card').count();
  if (after > before) throw new Error(`filter grew the list: ${before} → ${after}`);
  return `${before} → ${after} with ?genre=${label}`;
});

await check('The filter bar collapses its options', async (page) => {
  if (!(await goto(page, '/reviews', '.album-card'))) {
    throw new Error('listing never loaded');
  }

  // The point of the change: 49 genres and 33 years must not be on the page.
  const shownAtRest = await page.locator('.filter-select__option').count();
  if (shownAtRest !== 0) throw new Error(`${shownAtRest} options visible while closed`);

  const barHeight = await page.$eval(
    '.filters',
    (el) => el.getBoundingClientRect().height,
  );
  if (barHeight > 140)
    throw new Error(`the filter bar is ${Math.round(barHeight)}px tall`);

  // Opening one reveals its options, and only its own.
  await page.locator('.filter-select__trigger').first().click();
  await page.waitForSelector('.filter-select__panel', { timeout: 3000 });
  const panels = await page.locator('.filter-select__panel').count();
  if (panels !== 1) throw new Error(`${panels} panels open at once`);
  const options = await page.locator('.filter-select__option').count();
  if (options < 2) throw new Error('the genre panel is empty');

  return `bar ${Math.round(barHeight)}px, ${options} options on demand`;
});

await check('The filter dropdown answers to the keyboard', async (page) => {
  if (!(await goto(page, '/reviews', '.album-card'))) {
    throw new Error('listing never loaded');
  }
  const trigger = page.locator('.filter-select__trigger').first();

  await trigger.focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('.filter-select__panel', { timeout: 3000 });

  // Escape closes it and hands focus back, so the tab position is not lost.
  await page.keyboard.press('Escape');
  await page.waitForSelector('.filter-select__panel', {
    state: 'detached',
    timeout: 3000,
  });
  const refocused = await page.evaluate(() =>
    document.activeElement?.classList.contains('filter-select__trigger'),
  );
  if (!refocused) throw new Error('Escape dropped focus');

  // And the trigger reports its state to assistive tech.
  const expanded = await trigger.getAttribute('aria-expanded');
  if (expanded !== 'false') throw new Error(`aria-expanded is "${expanded}" once closed`);

  return 'Enter opens, Escape closes and restores focus';
});

await check('An applied filter is visible without opening anything', async (page) => {
  await page.goto(`${BASE}/reviews?genre=Art%20Rock`);
  await page.waitForSelector('.filter-select__trigger', { timeout: 8000 });

  const label = await page.locator('.filter-select__trigger').first().textContent();
  if (!/art rock/i.test(label)) throw new Error(`the trigger reads "${label.trim()}"`);

  const set = await page.locator('.filter-select__trigger--set').count();
  if (set !== 1) throw new Error(`${set} triggers marked as filtering`);
  return `trigger reads "${label.trim()}"`;
});

await check('RatingBadge applies the tone by threshold', async (page) => {
  await goto(page, '/reviews', '.album-card');
  const badges = await page.$$eval('.album-card', (cards) =>
    cards.map((c) => ({
      score: c.querySelector('.rating__score').textContent,
      tone: [...c.querySelector('.rating').classList].find(
        (x) => x.startsWith('rating--') && x !== 'rating--sm',
      ),
    })),
  );
  const wrong = badges.filter(({ score, tone }) => {
    const n = parseFloat(score);
    const expected =
      n >= 8.5
        ? 'rating--magenta'
        : n >= 7
          ? 'rating--petrol'
          : n >= 5.5
            ? 'rating--mostaza'
            : 'rating--terracota';
    return tone !== expected;
  });
  if (wrong.length) throw new Error(`wrong tones: ${JSON.stringify(wrong)}`);
  return `${badges.length} badges correct`;
});

await check('Newsletter: validates the email and confirms sign-up', async (page) => {
  await page.goto(BASE + '/suggest');
  await page.waitForSelector('.suggest-form');

  await page.getByLabel(/Your email/).fill('not-an-email');
  await page.getByRole('button', { name: 'Subscribe' }).click();
  await page.waitForSelector('.field__error', { timeout: 3000 });
  const error = await page.textContent('.field__error');

  let confirmed = false;
  for (let i = 0; i < RETRIES && !confirmed; i++) {
    await page.getByLabel(/Your email/).fill('marina@example.com');
    await page.getByRole('button', { name: 'Subscribe' }).click();
    try {
      await page.waitForSelector('.form-success', { timeout: 4000 });
      confirmed = true;
    } catch {
      /* simulated failure */
    }
  }
  if (!confirmed) throw new Error('confirmation never arrived');
  return `"${error}" → confirmed`;
});

await check('Suggestion: independent fields and submission', async (page) => {
  await page.goto(BASE + '/suggest');
  await page.waitForSelector('.suggest-form');

  await page.getByRole('button', { name: 'Send the pitch' }).click();
  await page.waitForSelector('.field__error', { timeout: 3000 });
  const errors = await page.locator('.field__error').count();
  if (errors !== 2) throw new Error(`expected 2 errors, found ${errors}`);

  const fill = async () => {
    await page.getByLabel(/Artist/).fill('Test Artist');
    await page.getByLabel(/^Album/).fill('Test Album');
  };
  await fill();
  await page.getByLabel(/Why it matters/).fill('Worth a listen.');

  const values = await page.$$eval('.field__control', (els) => els.map((e) => e.value));
  if (!values.includes('Test Artist') || !values.includes('Test Album')) {
    throw new Error(`fields wired incorrectly: ${JSON.stringify(values)}`);
  }

  let confirmed = false;
  for (let i = 0; i < RETRIES && !confirmed; i++) {
    await page.getByRole('button', { name: 'Send the pitch' }).click();
    try {
      await page.waitForSelector('.form-success', { timeout: 4000 });
      confirmed = true;
    } catch {
      await fill();
    }
  }
  if (!confirmed) throw new Error('confirmation never arrived');
  return `${errors} validation errors, fields OK, submitted`;
});

await check('The empty score tracks the pitch', async (page) => {
  await page.goto(BASE + '/suggest');
  await page.waitForSelector('.pitch__score');

  const glyph = () => page.textContent('.pitch__score');
  const note = () => page.textContent('.pitch__score-note');

  if ((await glyph()).trim() !== '—') throw new Error('the score did not start empty');

  // Naming a record makes it a candidate; one field alone is not enough.
  await page.getByLabel(/Artist/).fill('Kendrick Lamar');
  await page.waitForTimeout(200);
  if ((await glyph()).trim() !== '—') {
    throw new Error('the score changed on the artist alone');
  }

  await page.getByLabel(/^Album/).fill('GNX');
  await page.waitForFunction(
    () => document.querySelector('.pitch__score').textContent.trim() === '?',
    null,
    { timeout: 3000 },
  );
  if (!/verdict/i.test(await note())) throw new Error(`note reads "${await note()}"`);

  // Clearing the album takes it back.
  await page.getByLabel(/^Album/).fill('');
  await page.waitForFunction(
    () => document.querySelector('.pitch__score').textContent.trim() === '—',
    null,
    { timeout: 3000 },
  );
  return '— → ? → —';
});

await check('Form controls stay legible on both grounds', async (page) => {
  await page.goto(BASE + '/suggest');
  await page.waitForSelector('.suggest-form');

  // Errors used to be drawn in ink, which is invisible on the night ground.
  await page.getByRole('button', { name: 'Send the pitch' }).click();
  await page.waitForSelector('.pitch__form .field__error', { timeout: 3000 });
  const onDark = await page.$eval('.pitch__form .field__error', (el) => ({
    color: getComputedStyle(el).color,
    bg: getComputedStyle(document.body).backgroundColor,
  }));
  if (onDark.color === onDark.bg) throw new Error('error text matches the background');

  // The solid button on the amber band must not be cream on cream.
  const btn = await page.$eval('.subscribe .btn--accent', (el) => ({
    color: getComputedStyle(el).color,
    bg: getComputedStyle(el).backgroundColor,
  }));
  if (btn.color === btn.bg) throw new Error('the subscribe button has no contrast');

  return `error ${onDark.color}, button ${btn.color} on ${btn.bg}`;
});

await check('An unmatched route shows the address it could not find', async (page) => {
  const missing = '/reviews/gnx/liner-notes';
  await page.goto(BASE + missing);
  await page.waitForSelector('.notfound', { timeout: 6000 });

  // The address is the point: it is where the typo is.
  const shown = (await page.textContent('.notfound__path')).trim();
  if (shown !== missing) throw new Error(`the page shows "${shown}"`);

  // And it must not look like the retryable network error.
  if (await page.locator('.error-state').count()) {
    throw new Error('the 404 reuses the retryable error box');
  }

  // Every way out must actually resolve.
  const hrefs = await page.$$eval('.notfound__actions a', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  if (hrefs.length < 2) throw new Error('the 404 offers no way out');
  for (const href of hrefs) {
    await page.goto(BASE + href);
    await page.waitForTimeout(500);
    if (await page.locator('.notfound').count()) {
      throw new Error(`the way out ${href} is itself a 404`);
    }
  }
  return `${shown} · ${hrefs.length} ways out`;
});

await check('A pathological address cannot break the 404 layout', async (page) => {
  await page.goto(`${BASE}/${'x'.repeat(400)}`);
  await page.waitForSelector('.notfound', { timeout: 6000 });

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) throw new Error(`a long address overflowed by ${overflow}px`);

  const shown = (await page.textContent('.notfound__path')).trim();
  if (shown.length > 72) throw new Error(`the address rendered ${shown.length} chars`);
  return `clamped to ${shown.length} chars, no overflow`;
});

await check('The footer key matches the badges it explains', async (page) => {
  if (!(await goto(page, '/', '.album-card'))) throw new Error('home never loaded');

  const result = await page.evaluate(() => {
    const swatches = [...document.querySelectorAll('.footer__swatch')];
    const toneOf = (el) =>
      [...el.classList].find((c) => c.startsWith('footer__swatch--'))?.slice(16);

    // A swatch must be painted with the same token as the badge it stands for,
    // not a hex copied by hand that can drift.
    const probe = document.createElement('span');
    document.body.appendChild(probe);
    const tokenColour = (tone) => {
      probe.style.backgroundColor = `var(--color-${tone})`;
      return getComputedStyle(probe).backgroundColor;
    };

    const mismatched = swatches
      .map((s) => ({
        tone: toneOf(s),
        swatch: getComputedStyle(s).backgroundColor,
        token: tokenColour(toneOf(s)),
      }))
      .filter((x) => x.swatch !== x.token);
    probe.remove();

    // And every tone the page actually paints must be in the key.
    const shownTones = new Set(
      [...document.querySelectorAll('.rating')].flatMap((r) =>
        [...r.classList]
          .filter((c) => c.startsWith('rating--'))
          .map((c) => c.slice(8))
          .filter((c) => !['sm', 'md', 'lg'].includes(c)),
      ),
    );
    const keyed = new Set(swatches.map(toneOf));

    return {
      swatches: swatches.length,
      mismatched,
      missing: [...shownTones].filter((t) => !keyed.has(t)),
      ranges: [...document.querySelectorAll('.footer__band-range')].map((e) =>
        e.textContent.trim(),
      ),
    };
  });

  if (result.swatches < 3) throw new Error(`only ${result.swatches} bands in the key`);
  if (result.mismatched.length) {
    throw new Error(
      `swatch drifted from its token: ${JSON.stringify(result.mismatched)}`,
    );
  }
  if (result.missing.length) {
    throw new Error(`tones on the page but not in the key: ${result.missing.join(', ')}`);
  }
  return `${result.swatches} bands: ${result.ranges.join(' / ')}`;
});

await check('Footer links are reachable and large enough to hit', async (page) => {
  if (!(await goto(page, '/', '.footer'))) throw new Error('footer never loaded');

  const links = await page.$$eval('.footer__nav a', (as) =>
    as.map((a) => ({
      href: a.getAttribute('href'),
      h: Math.round(a.getBoundingClientRect().height),
      w: Math.round(a.getBoundingClientRect().width),
    })),
  );

  // WCAG 2.5.8 puts the floor at 24px; the system aims higher.
  const small = links.filter((l) => l.h < 24 || l.w < 24);
  if (small.length) throw new Error(`targets under 24px: ${JSON.stringify(small)}`);

  // The footer is the one place that lists every destination.
  for (const path of ['/', '/reviews', '/news', '/features', '/suggest', '/saved']) {
    if (!links.some((l) => l.href === path))
      throw new Error(`${path} is not in the footer`);
  }

  for (const { href } of links) {
    await page.goto(BASE + href);
    await page.waitForTimeout(500);
    if (await page.locator('.notfound').count()) {
      throw new Error(`${href} is a dead link`);
    }
  }
  return `${links.length} links, smallest ${Math.min(...links.map((l) => l.h))}px tall`;
});

await check('The footer sits flush against the page', async (page) => {
  if (!(await goto(page, '/', '.footer'))) throw new Error('footer never loaded');
  const gap = await page.evaluate(() => {
    const footer = document.querySelector('.footer');
    const main = document.querySelector('.app__main');
    return Math.round(
      footer.getBoundingClientRect().top - main.getBoundingClientRect().bottom,
    );
  });
  // A band of page ground between two ink blocks reads as a mistake.
  if (gap > 1) throw new Error(`${gap}px of ground shows above the footer`);
  return `flush (${gap}px)`;
});

await check('Every Nav link resolves', async (page) => {
  await goto(page, '/', '.hero__title');
  const hrefs = await page.$$eval('.nav__menu a', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  for (const href of hrefs) {
    await page.goto(BASE + href);
    await page.waitForTimeout(700);
    // NotFound has its own markup now, so an unmatched route is checked for
    // directly rather than inferred from the shared error box.
    if (await page.locator('.notfound').count()) {
      throw new Error(`${href} fell through to NotFound`);
    }
    if (await page.locator('.error-state').count()) {
      throw new Error(`${href} rendered an error state`);
    }
  }
  // Home is not in the menu: the wordmark is the only way back to /.
  if (hrefs.includes('/')) throw new Error('Home should not be a nav link');
  return `${hrefs.length} routes: ${hrefs.join(' ')}`;
});

await check('Reviews paginates and keeps the page in the URL', async (page) => {
  if (!(await goto(page, '/reviews', '.album-card'))) {
    throw new Error('listing never loaded');
  }
  const perPage = await page.locator('.album-card').count();
  if (perPage !== 12) throw new Error(`expected 12 cards on page 1, got ${perPage}`);

  const firstTitle = await page.locator('.album-card__title').first().textContent();

  await page.getByRole('button', { name: 'Page 2' }).click();
  await page.waitForFunction(
    () => new URL(location.href).searchParams.get('page') === '2',
    null,
    { timeout: 4000 },
  );
  // The grid re-renders after the URL changes, so wait for the content itself
  // rather than for the card selector, which never went away.
  await page.waitForFunction(
    (before) => {
      const el = document.querySelector('.album-card__title');
      return el && el.textContent.trim() !== before;
    },
    firstTitle.trim(),
    { timeout: 6000 },
  );

  const secondTitle = await page.locator('.album-card__title').first().textContent();
  if (firstTitle === secondTitle) throw new Error('page 2 shows the same first card');

  const current = await page.locator('.pagination__page--current').textContent();
  if (current.trim() !== '2') throw new Error(`current chip says ${current}`);

  // The page must survive a reload: it lives in the URL, not in state.
  await page.reload();
  await page.waitForSelector('.album-card', { timeout: 6000 });
  const afterReload = await page.locator('.album-card__title').first().textContent();
  if (afterReload !== secondTitle) throw new Error('reload lost the page');

  // And the back button steps back to page 1.
  await page.goBack();
  await page.waitForFunction(
    (want) => {
      const el = document.querySelector('.album-card__title');
      return el && el.textContent.trim() === want;
    },
    firstTitle.trim(),
    { timeout: 6000 },
  );
  const back = await page.locator('.album-card__title').first().textContent();
  if (back !== firstTitle) throw new Error('back button did not return to page 1');

  return `12/page, page 2 OK, reload + back OK`;
});

await check('Filtering resets pagination to page 1', async (page) => {
  await page.goto(`${BASE}/reviews?page=3`);
  await page.waitForSelector('.album-card', { timeout: 8000 });

  await page.locator('.filter-select__trigger').first().click();
  await page.waitForSelector('.filter-select__panel', { timeout: 3000 });
  await page.locator('.filter-select__option').nth(1).click();
  await page.waitForFunction(
    () => new URL(location.href).searchParams.get('genre') !== null,
    null,
    { timeout: 4000 },
  );
  await page.waitForSelector('.album-card', { timeout: 6000 });

  const stillPaged = await page.evaluate(() =>
    new URL(location.href).searchParams.get('page'),
  );
  if (stillPaged !== null) throw new Error(`?page survived the filter: ${stillPaged}`);
  return 'page cleared on filter change';
});

await check('A page beyond the end falls back to real content', async (page) => {
  await page.goto(`${BASE}/reviews?page=999`);
  await page.waitForSelector('.album-card', { timeout: 8000 });
  const cards = await page.locator('.album-card').count();
  if (cards === 0) throw new Error('?page=999 rendered an empty list');
  if (await page.locator('.error-state').count()) {
    throw new Error('?page=999 fell through to an error state');
  }
  return `${cards} cards shown instead of a blank page`;
});

await check('The pager appears exactly when there is a second page', async (page) => {
  // Asserted as an invariant, not as a fact about how much content exists.
  // This test used to hard-code "news and features fit on one page", which
  // stopped being true the moment the archive grew, and then reported the
  // correct pager as a bug. What is permanently true is the relationship:
  // the control shows itself if and only if something did not fit.
  const seen = [];

  for (const [path, item] of [
    ['/news', '.news-item'],
    ['/features', '.feature-card'],
  ]) {
    if (!(await goto(page, path, item))) throw new Error(`${path} never loaded`);

    // The listing prints its own total: "16 stories", "14 pieces".
    const countText = await page.locator('.filters__count').first().textContent();
    const total = Number(countText.trim().match(/^\d+/)?.[0]);
    if (!Number.isInteger(total)) throw new Error(`${path}: no total in "${countText}"`);

    const shown = await page.locator(item).count();
    const pagers = await page.locator('.pagination').count();
    const fitsOnOnePage = shown === total;

    if (fitsOnOnePage && pagers !== 0) {
      throw new Error(`${path} shows all ${total} items and still renders a pager`);
    }
    if (!fitsOnOnePage && pagers === 0) {
      throw new Error(`${path} shows ${shown} of ${total} items with no pager`);
    }

    // When there is a second page it has to be reachable and different.
    if (!fitsOnOnePage) {
      const firstOnPage1 = await page.locator(item).first().innerText();
      await goto(page, `${path}?page=2`, item);
      const firstOnPage2 = await page.locator(item).first().innerText();
      if (firstOnPage1 === firstOnPage2) {
        throw new Error(`${path}?page=2 repeats page 1`);
      }
    }

    seen.push(`${path} ${shown}/${total}${fitsOnOnePage ? ' no pager' : ' paged'}`);
  }

  return seen.join(' · ');
});

await check('The wordmark navigates home', async (page) => {
  await goto(page, '/reviews', '.album-card');
  await page.locator('.nav__brand').click();
  await page.waitForURL(`${BASE}/`, { timeout: 5000 });
  await page.waitForSelector('.hero__title', { timeout: 6000 });
  return `back to ${new URL(page.url()).pathname}`;
});

await check('Favourites persist in localStorage as typed entries', async (page) => {
  await goto(page, '/', '.album-card');
  await page.locator('.album-card__fav').first().click();
  const stored = await page.evaluate(() => localStorage.getItem('decode:favorites'));
  const parsed = JSON.parse(stored ?? '[]');
  if (parsed.length !== 1) throw new Error(`localStorage=${stored}`);
  if (parsed[0].type !== 'review' || !parsed[0].id) {
    throw new Error(`expected a {type,id} entry, got ${stored}`);
  }
  return stored;
});

await check('News and features can be saved and reach /saved', async (page) => {
  await page.goto(BASE + '/');
  await page.evaluate(() => localStorage.removeItem('decode:favorites'));

  // Save one news story from the listing.
  if (!(await goto(page, '/news', '.news-item'))) throw new Error('news never loaded');
  await page.locator('.news-item__save').first().click();

  // Save one feature from the listing.
  if (!(await goto(page, '/features', '.feature-card'))) {
    throw new Error('features never loaded');
  }
  await page.locator('.feature-card__save').first().click();

  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('decode:favorites')),
  );
  const types = stored.map((e) => e.type).sort();
  if (types.join(',') !== 'feature,news') {
    throw new Error(`expected one news + one feature, got ${JSON.stringify(stored)}`);
  }

  // Both must reach the shelf. It is one list of uniform rows, not three
  // stacked listings, so what tells the kinds apart is the type chip.
  if (!(await goto(page, '/saved', '.shelf-row'))) {
    throw new Error('saved page never loaded');
  }
  const rows = await page.locator('.shelf-row').count();
  if (rows !== 2) throw new Error(`expected 2 rows on the shelf, found ${rows}`);

  const kinds = await page.$$eval('.shelf-row .type-chip', (chips) =>
    chips.map((chip) => chip.textContent.trim()).sort(),
  );
  if (kinds.join(',') !== 'Feature,News') {
    throw new Error(`expected one News and one Feature chip, got ${kinds.join(',')}`);
  }
  return kinds.join(' · ');
});

await check('The Nav star links to the shelf and counts', async (page) => {
  await page.goto(BASE + '/');
  await page.evaluate(() => localStorage.removeItem('decode:favorites'));
  await goto(page, '/', '.album-card');

  const before = (await page.locator('.nav__favs').textContent()).trim();
  if (before !== '★ 0') throw new Error(`counter started at "${before}"`);

  await page.locator('.album-card__fav').first().click();
  await page.waitForFunction(
    () => document.querySelector('.nav__favs').textContent.trim() === '★ 1',
    null,
    { timeout: 4000 },
  );

  await page.locator('.nav__favs').click();
  await page.waitForURL('**/saved', { timeout: 5000 });
  // Wait for the row itself: the shelf only renders one once the three
  // listings have loaded and the saved ids have been resolved against them.
  await page.waitForSelector('.shelf-row', { timeout: 8000 });
  const saved = await page.locator('.shelf-row').count();
  if (saved !== 1) throw new Error(`shelf shows ${saved} rows`);
  return `★ 0 → ★ 1 → /saved with ${saved} row`;
});

await check('The empty shelf explains itself', async (page) => {
  await page.goto(BASE + '/');
  await page.evaluate(() => localStorage.removeItem('decode:favorites'));
  await page.goto(BASE + '/saved');
  await page.waitForSelector('.saved__empty', { timeout: 8000 });
  if (await page.locator('.shelf').count()) {
    throw new Error('empty shelf still rendered a list');
  }
  const cta = await page.locator('.saved__empty-actions a').count();
  if (cta < 1) throw new Error('empty state offers no way out');
  return `empty state with ${cta} calls to action`;
});

await check('Unsaving from the shelf offers a way back', async (page) => {
  await page.goto(BASE + '/');
  await page.evaluate(() =>
    localStorage.setItem(
      'decode:favorites',
      JSON.stringify([{ type: 'review', id: 'ok-computer' }]),
    ),
  );
  if (!(await goto(page, '/saved', '.shelf-row'))) {
    throw new Error('saved page never loaded');
  }

  // Removing is one click, so the row holds its place with an undo rather
  // than vanishing and taking the way back with it.
  await page.locator('.shelf-row__remove').first().click();
  await page.waitForSelector('.shelf-row--removed', { timeout: 6000 });
  if (!(await page.locator('.shelf-row__undo').count())) {
    throw new Error('the removed row offers no way back');
  }

  const afterRemove = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('decode:favorites')),
  );
  if (afterRemove.length !== 0) {
    throw new Error(`still stored: ${JSON.stringify(afterRemove)}`);
  }

  // And the way back has to work, or the row is a promise the page breaks.
  await page.locator('.shelf-row__undo').click();
  await page
    .locator('.shelf-row--removed')
    .waitFor({ state: 'detached', timeout: 4000 })
    .catch(() => {
      throw new Error('undo left the removed placeholder on screen');
    });

  const afterUndo = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('decode:favorites')),
  );
  if (afterUndo.length !== 1 || afterUndo[0].id !== 'ok-computer') {
    throw new Error(`undo restored ${JSON.stringify(afterUndo)}`);
  }
  return 'removed → undo offered → put back';
});

await check('Detail: pull quote, emphasis and type scale', async (page) => {
  // Enter through the first card so we do not depend on any dataset id.
  if (!(await goto(page, '/reviews', '.album-card'))) {
    throw new Error('listing never loaded');
  }
  await page.locator('.album-card__link').first().click();
  await page.waitForSelector('.review__title', { timeout: 6000 });
  const quotes = await page.locator('.pull-quote').count();
  const emphasis = await page.locator('.article__body em').count();

  if (quotes !== 1) throw new Error(`pull quotes=${quotes}`);

  // The type rule of the redesign: prose in Lora, everything functional in
  // Oswald. Asserting the families catches a regression that swapping exact
  // pixel sizes would not.
  const fonts = await page.evaluate(() => {
    const family = (sel) =>
      getComputedStyle(document.querySelector(sel)).fontFamily.split(',')[0].trim();
    return {
      title: family('.review__title'),
      para: family('.article__para'),
      quote: family('.pull-quote p'),
      artist: family('.review__artist'),
    };
  });
  if (!/Oswald/.test(fonts.title)) throw new Error(`title font: ${fonts.title}`);
  if (!/Oswald/.test(fonts.artist)) throw new Error(`artist font: ${fonts.artist}`);
  if (!/Lora/.test(fonts.para)) throw new Error(`body font: ${fonts.para}`);
  if (!/Lora/.test(fonts.quote)) throw new Error(`quote font: ${fonts.quote}`);

  // Emphasis depends on the dataset shipping *text*: reported, not required.
  return `pull quote OK, ${emphasis} emphasis, Oswald/Lora split correct`;
});

await check('Redesign: square corners and the two-column detail grid', async (page) => {
  await goto(page, '/reviews', '.album-card');
  const radii = await page.$$eval('.album-card, .genre-tag, .btn', (els) =>
    els.map((e) => getComputedStyle(e).borderRadius).filter((r) => r !== '0px'),
  );
  if (radii.length) throw new Error(`rounded corners found: ${radii.join(', ')}`);

  // The rating circle is the deliberate exception.
  const ratingRadius = await page.$eval(
    '.rating',
    (e) => getComputedStyle(e).borderRadius,
  );
  if (ratingRadius === '0px') throw new Error('the rating badge should stay a circle');

  await page.locator('.album-card__link').first().click();
  await page.waitForSelector('.review__grid', { timeout: 6000 });
  const cols = await page.$eval(
    '.review__grid',
    (e) => getComputedStyle(e).gridTemplateColumns,
  );
  if (cols.split(' ').length !== 2) throw new Error(`detail grid columns: ${cols}`);
  return `0 rounded, rating circle ${ratingRadius}, grid ${cols}`;
});

await check('Nav: the wordmark is six coloured circles', async (page) => {
  await goto(page, '/', '.nav__brand');
  const dots = await page.$$eval('.nav__brand-dot', (els) =>
    els.map((e) => ({
      radius: getComputedStyle(e).borderRadius,
      bg: getComputedStyle(e).backgroundColor,
    })),
  );
  if (dots.length !== 6)
    throw new Error(`expected 6 letter circles, found ${dots.length}`);
  const distinct = new Set(dots.map((d) => d.bg)).size;
  if (distinct < 5) throw new Error(`only ${distinct} distinct colours in the wordmark`);
  return `6 circles, ${distinct} colours`;
});

await check('News cards open their detail page', async (page) => {
  if (!(await goto(page, '/news', '.news-item'))) throw new Error('listing never loaded');
  const items = await page.locator('.news-item').count();
  const links = await page.locator('.news-item__link').count();
  if (items !== links) throw new Error(`${items} items but only ${links} link anywhere`);

  await page.locator('.news-item__link').first().click();
  await page.waitForURL('**/news/**', { timeout: 6000 });
  await page.waitForSelector('.article__body', { timeout: 6000 });

  const paras = await page.locator('.article__para').count();
  if (paras === 0) throw new Error('the story body did not render');
  // News carries no score and no pull quote; neither should be invented.
  const ratings = await page.locator('.rating').count();
  if (ratings !== 0) throw new Error(`news detail shows ${ratings} rating badges`);
  return `${items} items, ${paras} paragraphs, no rating`;
});

await check('Feature cards open their detail page', async (page) => {
  if (!(await goto(page, '/features', '.feature-card'))) {
    throw new Error('listing never loaded');
  }
  const cards = await page.locator('.feature-card').count();
  const links = await page.locator('.feature-card__link').count();
  if (cards !== links) throw new Error(`${cards} cards but only ${links} link anywhere`);

  // The card meta line used to print "undefined" for the missing author.
  const meta = await page.locator('.feature-card__meta').first().textContent();
  if (/undefined/.test(meta)) throw new Error(`card meta renders undefined: ${meta}`);

  await page.locator('.feature-card__link').first().click();
  await page.waitForURL('**/features/**', { timeout: 6000 });
  await page.waitForSelector('.article__body', { timeout: 6000 });

  const paras = await page.locator('.article__para').count();
  const quotes = await page.locator('.pull-quote').count();
  const ratings = await page.locator('.rating').count();
  if (paras === 0) throw new Error('the feature body did not render');
  if (quotes !== 1) throw new Error(`expected 1 pull quote, found ${quotes}`);
  if (ratings !== 0) throw new Error(`feature detail shows ${ratings} rating badges`);
  return `${cards} cards, ${paras} paragraphs, 1 pull quote, no rating`;
});

await check('Unknown article ids surface the 404 state', async (page) => {
  // Each section names what it could not find, and offers its own way back.
  const cases = [
    { path: '/news/no-such-story', names: /story/i, back: '/news' },
    { path: '/features/no-such-feature', names: /feature/i, back: '/features' },
    { path: '/reviews/no-such-record', names: /review/i, back: '/reviews' },
  ];

  const seen = [];
  for (const { path, names, back } of cases) {
    await page.goto(BASE + path);
    await page.waitForSelector('.error-state', { timeout: 8000 });

    const title = (await page.textContent('.error-state__title')).trim();
    if (!/archive/i.test(title)) throw new Error(`unexpected 404 title: ${title}`);

    // The message used to say "review" whatever the section was.
    const message = await page.textContent('.error-state__message');
    if (!names.test(message)) throw new Error(`${path} says: ${message}`);

    // Nothing to retry: asking again cannot make a missing record exist.
    const retry = await page
      .locator('.error-state__actions', { hasText: 'Try again' })
      .count();
    if (retry) throw new Error(`${path} offers a pointless retry`);

    // The way out returns to the section, not the front page.
    const href = await page
      .locator('.error-state__actions a')
      .first()
      .getAttribute('href');
    if (href !== back) throw new Error(`${path} escapes to ${href}, not ${back}`);

    seen.push(title);
  }
  return seen.join(' · ');
});

await check('A failed load recovers without the reader doing anything', async (page) => {
  // The mock fails on purpose, so a plain load exercises the retry path. What
  // matters is that a blip never reaches the reader: with the rate at 0 here,
  // and retries covering the rest, the error box must not appear at all.
  for (const path of ['/reviews', '/news', '/features']) {
    if (!(await goto(page, path, '.container'))) throw new Error(`${path} never loaded`);
    await page.waitForTimeout(1200);
    if (await page.locator('.error-state').count()) {
      throw new Error(`${path} surfaced an error the app could have retried away`);
    }
  }
  return 'no error box on any listing';
});

await check('Mobile 375px: no horizontal scroll and working menu', async (page) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await goto(page, '/', '.hero__title');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) throw new Error(`horizontal overflow of ${overflow}px`);

  // Overflow alone does not catch a badge sitting flush against the edge: it
  // is inside the document, so nothing widens. The hero rating hangs off the
  // artwork by --space-4 and `.container` pads by the same amount below
  // 768px, which once put the circle exactly on the viewport edge in the
  // 600–767 band. Measure the clearance, at both ends of that band.
  for (const width of [375, 600, 767]) {
    await page.setViewportSize({ width, height: 812 });
    await page.waitForTimeout(200);
    const gap = await page.evaluate(() => {
      const b = document.querySelector('.hero__rating')?.getBoundingClientRect();
      return b ? Math.round(document.documentElement.clientWidth - b.right) : null;
    });
    if (gap === null) throw new Error('the hero rating badge is missing');
    if (gap < 8) throw new Error(`at ${width}px the badge clears the edge by ${gap}px`);

    // Same measurement for the cards. In the row layout the lead's badge is
    // sized down to `sm`: at `md` its ring overran the rating column, which
    // is sized for the smaller circle plus the 6px the box-shadow adds
    // outside the element box.
    const spill = await page.evaluate(() =>
      [...document.querySelectorAll('.album-card')]
        .map((card) => {
          const badge = card.querySelector('.rating');
          if (!badge) return -Infinity;
          const c = card.getBoundingClientRect();
          const b = badge.getBoundingClientRect();
          return Math.round(b.right + 6 - c.right);
        })
        .reduce((a, b) => Math.max(a, b), -Infinity),
    );
    if (spill > 0) throw new Error(`at ${width}px a card badge spills ${spill}px`);
  }

  // The detail page overlays the same circle on the cover, from the same
  // negative offset, and had the same collision with the container padding.
  await page.setViewportSize({ width: 375, height: 812 });
  await goto(page, '/reviews', '.album-card__link');
  await page.locator('.album-card__link').first().click();
  await page.waitForSelector('.review__rating', { timeout: 6000 });
  const detail = await page.evaluate(() => {
    const b = document.querySelector('.review__rating .rating').getBoundingClientRect();
    return Math.round(document.documentElement.clientWidth - (b.right + 6));
  });
  if (detail < 8) throw new Error(`the review badge clears the edge by ${detail}px`);

  await goto(page, '/', '.hero__title');
  await page.setViewportSize({ width: 375, height: 812 });

  await page.getByRole('button', { name: 'Menu' }).click();
  await page.waitForSelector('.nav__menu--open');
  await page.locator('.nav__menu').getByRole('link', { name: 'Features' }).click();
  await page.waitForURL('**/features');
  await page
    .locator('.nav__menu--open')
    .waitFor({ state: 'detached', timeout: 3000 })
    .catch(() => {
      throw new Error('the menu did not close on navigation');
    });
  return 'no overflow, menu opens/navigates/closes';
});

await browser.close();

let failed = 0;
for (const r of results) {
  console.log(`${r.ok ? '✓' : '✗'} ${r.name}\n    ${r.detail}`);
  if (r.errors?.length) console.log(`    console: ${r.errors.slice(0, 2).join(' | ')}`);
  if (!r.ok) failed++;
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
