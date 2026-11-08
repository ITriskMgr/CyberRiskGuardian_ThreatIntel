// Test harness of CyberRiskGuardian Desktop — the only one (1.9.0: the lane harnesses of tests-new were merged here).
// Every path and port comes from the environment, with defaults relative to this repository, so the suites run the
// same on a workstation and in CI:
//   CRG_PORT      shorthand for parallel runs (several checkouts at once): sets the defaults of CRG_URL
//                 (http://127.0.0.1:$CRG_PORT/), CRG_TMP ($TMPDIR/crg-desktop-tests-$CRG_PORT), CRG_MOCK_GITHUB_PORT
//                 ($CRG_PORT+100) and CRG_EMBED_PORT ($CRG_PORT+1000). Unset: the defaults below, unchanged.
//   CRG_URL       the running app and helper (default http://127.0.0.1:8099/)
//   CRG_APP_DIR   the application folder (default ../app)
//   CRG_TMP       scratch folder for the run (default $TMPDIR/crg-desktop-tests, outside the repository: the helper refuses
//                 an organisation-graph folder inside a git repository); the helper's folders live under it:
//   CRG_FEEDS_DIR (default $CRG_TMP/feeds) · CRG_ORG_DIR ($CRG_TMP/orggraphs) · CRG_KEYS_DIR ($CRG_TMP/keys)
//   CRG_AI_MOCK   the helper's canned-answer folder (default $CRG_TMP/mock, a copy of ./mock made by serve.sh and
//                 here: suites rewrite consultant.txt and the helper writes _last.json there, never in the repository)
//   CRG_AI_MOCK_SRC  the canned answers in the repository (default ./mock) · CRG_SHARED_REGISTRY ($CRG_TMP/shared-registry)
//   CRGO_HOME     a CRGO checkout (default ../../CyberRiskGuardian-Ontology-0.11.0); 1.9.0 targets CRGO 0.11.0
//   CRGO_RELEASE  the release the suites expect that checkout to be (default 0.11.0; 0.10.1 still runs the 0.10 contracts)
//   CRG_MOCK_GITHUB_PORT  port of the mock GitHub API used by t29 (default 8199)
//   CRG_EMBED_PORT        port of the mock local embedding endpoint used by t44 (default 8115)
// serve.sh starts the helper with the same values (it reads them the same way).
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
export const TESTS = path.dirname(fileURLToPath(import.meta.url));
const env = (k, d) => process.env[k] || d;
const CRG_PORT = Number(process.env.CRG_PORT) || 0;
export const URL = env('CRG_URL', `http://127.0.0.1:${CRG_PORT || 8099}/`);
export const PORT = Number(new globalThis.URL(URL).port || 80);
export const APP = path.resolve(env('CRG_APP_DIR', path.join(TESTS, '..', 'app')));
export const TMP = path.resolve(env('CRG_TMP', path.join(os.tmpdir(), CRG_PORT ? `crg-desktop-tests-${CRG_PORT}` : 'crg-desktop-tests')));
export const FEEDS = path.resolve(env('CRG_FEEDS_DIR', path.join(TMP, 'feeds')));
export const ORG = path.resolve(env('CRG_ORG_DIR', path.join(TMP, 'orggraphs')));
export const KEYS = path.resolve(env('CRG_KEYS_DIR', path.join(TMP, 'keys')));
export const MOCK_SRC = path.resolve(env('CRG_AI_MOCK_SRC', path.join(TESTS, 'mock')));
export const MOCK = path.resolve(env('CRG_AI_MOCK', path.join(TMP, 'mock')));
export const SHARED = path.resolve(env('CRG_SHARED_REGISTRY', path.join(TMP, 'shared-registry')));
export const CRGO = path.resolve(env('CRGO_HOME', path.join(TESTS, '..', '..', 'CyberRiskGuardian-Ontology-0.11.0')));
/** The CRGO release the suites expect at CRGO_HOME, and whether it has the 0.11 terms (scenario patterns, CIS v8.1, crgo-iam). */
export const CRGO_RELEASE = env('CRGO_RELEASE', '0.11.0');
export const CRGO_011 = CRGO_RELEASE.split('.').map(Number).reduce((a, x) => a * 1000 + x, 0) >= 11000;
export const MOCK_GITHUB_PORT = Number(env('CRG_MOCK_GITHUB_PORT', String(CRG_PORT ? CRG_PORT + 100 : 8199)));
export const EMBED_PORT = Number(env('CRG_EMBED_PORT', String(CRG_PORT ? CRG_PORT + 1000 : 8115)));
export const FIXTURES = path.join(TESTS, 'fixtures');
fs.mkdirSync(TMP, { recursive: true });
// Suites write into the mock folder (consultant.txt) and the helper writes _last.json there: never the repository's.
if (MOCK === MOCK_SRC) throw new Error(`CRG_AI_MOCK must not be the repository's mock folder (${MOCK_SRC}); leave it unset (default ${path.join(TMP, 'mock')})`);
if (!fs.existsSync(MOCK)) { fs.mkdirSync(MOCK, { recursive: true }); for (const f of fs.readdirSync(MOCK_SRC)) fs.copyFileSync(path.join(MOCK_SRC, f), path.join(MOCK, f)); }
/** A file in the scratch folder of this run. */
export const tmp = name => path.join(TMP, name);
/** Restart the helper on PORT with this run's folders (serve.sh); extra environment for one restart. */
export const serveCmd = (extra = '') => `${extra} bash ${JSON.stringify(path.join(TESTS, 'serve.sh'))}`;

/** Headers for a call to the helper's /api/* from Node: X-CRG and the per-launch token read from /api/session. */
export async function apiHeaders(extra = {}) {
  const r = await fetch(URL.replace(/\/$/, '') + '/api/session', { headers: { 'X-CRG': '1' } });
  const { token } = await r.json();
  return { 'X-CRG': '1', 'X-CRG-Token': token, ...extra };
}

// Readiness of the page: the workspace is open and the list is known. Evaluated again after a pause because the
// first answer can come from a module instance that is about to be replaced (the first open of a fresh profile
// migrates and reloads); an evaluation cut by that navigation is retried, not failed.
const READY = async () => { const m = await import('/js/state.js'); return !!m.S.ws && m.S.list.length > 0; };
async function waitReady(page, ms = 20000) {
  const end = Date.now() + ms;
  for (;;) {
    try { await page.waitForFunction(READY, null, { timeout: Math.max(1000, end - Date.now()), polling: 300 }); return; }
    catch (e) { if (Date.now() >= end || !/context was destroyed|navigation|Target closed|detached/i.test(String(e))) throw e; await page.waitForLoadState('load').catch(() => {}); }
  }
}

/** Reload the page and wait as open() does: a workspace is open, and still open a second later (the start-up chain can
    close and reopen it, so a single check right after the reload races it). */
export async function reload(page) {
  await page.reload();
  await waitReady(page);
  await page.waitForTimeout(1000);
  await waitReady(page);
}

export async function open(hash = '#/process') {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: process.env.CRG_SW ? 'allow' : 'block', acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL + hash);
  await waitReady(page);
  await page.waitForTimeout(1000);
  await waitReady(page);
  // ...and the start-up chain has finished (app.js: storage, catalogues, language and users loaded, then the chrome
  // and the first screen drawn): a screen is visible with its title. Before that, a click can race the start-up.
  await page.waitForFunction(() => !![...document.querySelectorAll('main > section')].find(s => !s.hidden)?.querySelector('h1'),
    null, { timeout: 20000, polling: 200 }).catch(() => {});
  // A fresh profile seeds the MediBec teaching case just after the first workspace opens; most suites select it.
  await waitInPage(page, async () => { const m = await import('/js/state.js'); if (!m.S.list.some(w => w.kind === 'example')) await m.refreshList?.(); return m.S.list.some(w => w.kind === 'example'); },
    null, { timeout: 20000, every: 300 }).catch(() => {});
  return { browser, ctx, page, errors };
}

// --- Identity & access management and Configuration management suites (t36–t43) ---
/** Switch the iam and cm modules (or the ones named) on or off (Settings → Modules). */
export async function modulesOn(page, on = true, ids = ['iam', 'cm']) {
  await page.evaluate(async ({ on, ids }) => { const M = await import('/js/modules.js'); for (const id of ids) M.set(id, on); }, { on, ids });
}
/** Select the MediBec example workspace; returns the name of the open workspace. */
export async function medibec(page) {
  return page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example' && /MediBec/.test(w.name)); if (ex && st.S.ws.id !== ex.id) await st.select(ex.id); return st.S.ws.name; });
}
/** Wait until an async predicate run in the page returns true; throws after `timeout` ms. Use this rather than
 *  page.waitForFunction with an async predicate: Playwright treats the Promise an async predicate returns as truthy and resolves at once. */
export async function waitInPage(page, fn, arg, { timeout = 10000, every = 100 } = {}) {
  const end = Date.now() + timeout;
  while (!(await page.evaluate(fn, arg))) {
    if (Date.now() > end) throw new Error('waitInPage: condition not met within ' + timeout + ' ms: ' + String(fn).slice(0, 120));
    await page.waitForTimeout(every);
  }
}
/** Go to a route inside the page (no reload) and let it render. */
export async function goto(page, hash, ms = 600) { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(ms); }

let fails = 0, passes = 0;
export function ok(cond, msg) { if (cond) { passes++; } else { fails++; console.log('FAIL', msg); } }
export function done(name) { console.log(`${name}: ${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0); }
