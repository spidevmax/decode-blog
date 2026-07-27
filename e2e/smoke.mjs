/**
 * Smoke test end-to-end de DECODE.
 *
 * Requiere el servidor de desarrollo levantado:
 *   npm run dev        (en otra terminal)
 *   npm run e2e
 *
 * El API mock falla ~8% de las veces a propósito, así que las navegaciones se
 * reintentan: así un fallo del test significa un bug real y no una caída
 * simulada.
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

/** Navega reintentando mientras el API mock devuelva su error simulado. */
async function goto(page, path, selector) {
  for (let i = 0; i < RETRIES; i++) {
    await page.goto(BASE + path);
    try {
      await page.waitForSelector(selector, { timeout: 4000 });
      return true;
    } catch {
      /* falla simulada: reintentar */
    }
  }
  return false;
}

await check('Home: grilla asimétrica con card destacada 2x2', async (page) => {
  if (!(await goto(page, '/', '.album-card'))) throw new Error('no cargó la grilla');
  const feature = await page.locator('.album-card--feature').count();
  const cols = await page.$eval(
    '.album-grid',
    (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length,
  );
  if (feature !== 1) throw new Error(`esperaba 1 card destacada, hubo ${feature}`);
  return `${cols} columnas, ${feature} destacada`;
});

await check('Explore y Reviews usan la grilla pareja', async (page) => {
  await goto(page, '/explore', '.album-card');
  const explore = await page.$eval(
    '.album-grid',
    (el) => getComputedStyle(el).gridAutoRows,
  );
  await goto(page, '/reviews', '.album-card');
  const reviews = await page.$eval(
    '.album-grid',
    (el) => getComputedStyle(el).gridAutoRows,
  );
  if (explore !== 'auto' || reviews !== 'auto') {
    throw new Error(`explore=${explore} reviews=${reviews}`);
  }
  return 'ambas con grid-auto-rows: auto';
});

await check('RatingBadge aplica el tono por umbral', async (page) => {
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
  if (wrong.length) throw new Error(`tonos incorrectos: ${JSON.stringify(wrong)}`);
  return `${badges.length} badges correctos`;
});

await check('Newsletter: valida el email y confirma el alta', async (page) => {
  await page.goto(BASE + '/suggest');
  await page.waitForSelector('.suggest-form');

  await page.getByLabel(/Tu email/).fill('no-es-un-email');
  await page.getByRole('button', { name: 'Suscribirme' }).click();
  await page.waitForSelector('.field__error', { timeout: 3000 });
  const error = await page.textContent('.field__error');

  let confirmed = false;
  for (let i = 0; i < RETRIES && !confirmed; i++) {
    await page.getByLabel(/Tu email/).fill('marina@ejemplo.com');
    await page.getByRole('button', { name: 'Suscribirme' }).click();
    try {
      await page.waitForSelector('.form-success', { timeout: 4000 });
      confirmed = true;
    } catch {
      /* falla simulada */
    }
  }
  if (!confirmed) throw new Error('nunca llegó la confirmación');
  return `"${error}" → confirmado`;
});

await check('Sugerencia: campos independientes y envío', async (page) => {
  await page.goto(BASE + '/suggest');
  await page.waitForSelector('.suggest-form');

  await page.getByRole('button', { name: 'Enviar sugerencia' }).click();
  await page.waitForSelector('.field__error', { timeout: 3000 });
  const errors = await page.locator('.field__error').count();
  if (errors !== 2) throw new Error(`esperaba 2 errores, hubo ${errors}`);

  const fill = async () => {
    await page.getByLabel(/Artista/).fill('Ceci Maravilla');
    await page.getByLabel(/^Álbum/).fill('Humedad Tropical');
  };
  await fill();
  await page.getByLabel(/Por qué/).fill('Perreo mutante.');

  const values = await page.$$eval('.field__control', (els) => els.map((e) => e.value));
  if (!values.includes('Ceci Maravilla') || !values.includes('Humedad Tropical')) {
    throw new Error(`campos mal enlazados: ${JSON.stringify(values)}`);
  }

  let confirmed = false;
  for (let i = 0; i < RETRIES && !confirmed; i++) {
    await page.getByRole('button', { name: 'Enviar sugerencia' }).click();
    try {
      await page.waitForSelector('.form-success', { timeout: 4000 });
      confirmed = true;
    } catch {
      await fill();
    }
  }
  if (!confirmed) throw new Error('nunca llegó la confirmación');
  return `${errors} errores de validación, campos OK, enviado`;
});

await check('Todos los enlaces del Nav resuelven', async (page) => {
  await goto(page, '/', '.hero__title');
  const hrefs = await page.$$eval('.nav__menu a', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  for (const href of hrefs) {
    await page.goto(BASE + href);
    await page.waitForTimeout(700);
    if (await page.locator('.error-state').count()) {
      throw new Error(`${href} cayó en NotFound`);
    }
  }
  return `${hrefs.length} rutas: ${hrefs.join(' ')}`;
});

await check('Favoritos persisten en localStorage', async (page) => {
  await goto(page, '/', '.album-card');
  await page.locator('.album-card__fav').first().click();
  const stored = await page.evaluate(() => localStorage.getItem('decode:favorites'));
  if (!stored || JSON.parse(stored).length !== 1) {
    throw new Error(`localStorage=${stored}`);
  }
  return stored;
});

await check('Detalle: pull quote, énfasis y escala tipográfica', async (page) => {
  if (!(await goto(page, '/reviews/cemento', '.review__title'))) {
    throw new Error('no cargó el detalle');
  }
  const quotes = await page.locator('.pull-quote').count();
  const emphasis = await page.locator('.review__body em').count();
  const size = (sel) => page.$eval(sel, (e) => getComputedStyle(e).fontSize);
  const scale = [
    await size('.review__byline'),
    await size('.review__lede'),
    await size('.pull-quote p'),
  ].join('/');

  if (quotes !== 1) throw new Error(`pull quotes=${quotes}`);
  if (emphasis < 1) throw new Error('renderEmphasis no generó <em>');
  if (scale !== '14px/21px/26px') throw new Error(`escala alterada: ${scale}`);
  return `pull quote OK, ${emphasis} énfasis, escala ${scale}`;
});

await check('Móvil 375px: sin scroll horizontal y menú funcional', async (page) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await goto(page, '/', '.hero__title');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  if (overflow > 0) throw new Error(`overflow horizontal de ${overflow}px`);

  await page.getByRole('button', { name: 'Menú' }).click();
  await page.waitForSelector('.nav__menu--open');
  await page.locator('.nav__menu').getByRole('link', { name: 'Features' }).click();
  await page.waitForURL('**/features');
  await page
    .locator('.nav__menu--open')
    .waitFor({ state: 'detached', timeout: 3000 })
    .catch(() => {
      throw new Error('el menú no se cerró al navegar');
    });
  return 'sin overflow, menú abre/navega/cierra';
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
