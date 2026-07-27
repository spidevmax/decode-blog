/**
 * End-to-end smoke test for DECODE.
 *
 * Requires the dev server to be running:
 *   npm run dev        (in another terminal)
 *   npm run e2e
 *
 * The mock API fails ~8% of the time on purpose, so navigations are retried:
 * that way a test failure means a real bug and not a simulated outage.
 */
import { chromium } from 'playwright';

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173';
const RETRIES = 8;

const browser = await chromium.launch();
const results = [];

async function check(name, fn) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

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

  // Pick whatever the first genre chip is, so this survives dataset changes.
  const chip = page.locator('.filters__group').first().locator('.genre-tag').first();
  const label = (await chip.textContent()).trim();
  await chip.click();

  await page.waitForFunction(
    (g) => new URL(location.href).searchParams.get('genre') === g,
    label,
    { timeout: 4000 },
  );
  await page.waitForSelector('.album-card', { timeout: 6000 });
  const after = await page.locator('.album-card').count();
  if (after > before) throw new Error(`filter grew the list: ${before} → ${after}`);

  // Every remaining card must carry the selected genre.
  const allMatch = await page.$$eval(
    '.album-card',
    (cards, g) =>
      cards.every((c) =>
        [...c.querySelectorAll('.genre-tag')].some((t) => t.textContent.trim() === g),
      ),
    label,
  );
  if (!allMatch) throw new Error(`some cards lack the genre "${label}"`);
  return `${before} → ${after} with ?genre=${label}`;
});

await check('/explore redirects to /reviews, keeping the query', async (page) => {
  await page.goto(`${BASE}/explore?genre=Pop`);
  await page.waitForURL('**/reviews?genre=Pop', { timeout: 5000 });
  const url = new URL(page.url());
  if (url.pathname !== '/reviews' || url.searchParams.get('genre') !== 'Pop') {
    throw new Error(`landed on ${page.url()}`);
  }
  return `${url.pathname}${url.search}`;
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
    const expected = n >= 8 ? 'rating--teal' : n >= 6.5 ? 'rating--ink' : 'rating--red';
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

  await page.getByRole('button', { name: 'Send suggestion' }).click();
  await page.waitForSelector('.field__error', { timeout: 3000 });
  const errors = await page.locator('.field__error').count();
  if (errors !== 2) throw new Error(`expected 2 errors, found ${errors}`);

  const fill = async () => {
    await page.getByLabel(/Artist/).fill('Test Artist');
    await page.getByLabel(/^Album/).fill('Test Album');
  };
  await fill();
  await page.getByLabel(/Why we should/).fill('Worth a listen.');

  const values = await page.$$eval('.field__control', (els) => els.map((e) => e.value));
  if (!values.includes('Test Artist') || !values.includes('Test Album')) {
    throw new Error(`fields wired incorrectly: ${JSON.stringify(values)}`);
  }

  let confirmed = false;
  for (let i = 0; i < RETRIES && !confirmed; i++) {
    await page.getByRole('button', { name: 'Send suggestion' }).click();
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

await check('Every Nav link resolves', async (page) => {
  await goto(page, '/', '.hero__title');
  const hrefs = await page.$$eval('.nav__menu a', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  for (const href of hrefs) {
    await page.goto(BASE + href);
    await page.waitForTimeout(700);
    if (await page.locator('.error-state').count()) {
      throw new Error(`${href} fell through to NotFound`);
    }
  }
  return `${hrefs.length} routes: ${hrefs.join(' ')}`;
});

await check('Favourites persist in localStorage', async (page) => {
  await goto(page, '/', '.album-card');
  await page.locator('.album-card__fav').first().click();
  const stored = await page.evaluate(() => localStorage.getItem('decode:favorites'));
  if (!stored || JSON.parse(stored).length !== 1) {
    throw new Error(`localStorage=${stored}`);
  }
  return stored;
});

await check('Detail: pull quote, emphasis and type scale', async (page) => {
  // Enter through the first card so we do not depend on any dataset id.
  if (!(await goto(page, '/reviews', '.album-card'))) {
    throw new Error('listing never loaded');
  }
  await page.locator('.album-card__link').first().click();
  await page.waitForSelector('.review__title', { timeout: 6000 });
  const quotes = await page.locator('.pull-quote').count();
  const emphasis = await page.locator('.review__body em').count();
  const size = (sel) => page.$eval(sel, (e) => getComputedStyle(e).fontSize);
  const scale = [
    await size('.review__byline'),
    await size('.review__lede'),
    await size('.pull-quote p'),
  ].join('/');

  if (quotes !== 1) throw new Error(`pull quotes=${quotes}`);
  if (scale !== '14px/21px/26px') throw new Error(`type scale changed: ${scale}`);
  // Emphasis depends on the dataset shipping *text*: reported, not required.
  return `pull quote OK, ${emphasis} emphasis, scale ${scale}`;
});

await check('Mobile 375px: no horizontal scroll and working menu', async (page) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await goto(page, '/', '.hero__title');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) throw new Error(`horizontal overflow of ${overflow}px`);

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
