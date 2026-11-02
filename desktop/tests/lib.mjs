// Test harness of CyberRiskGuardian Desktop. Every path and port comes from the environment, with defaults
// relative to this repository, so the suites run the same on a workstation and in CI:
//   CRG_URL       the running app and helper (default http://127.0.0.1:8099/)
//   CRG_APP_DIR   the application folder (default ../app)
//   CRG_TMP       scratch folder for the run (default ./.tmp); the helper's folders live under it:
//   CRG_FEEDS_DIR (default $CRG_TMP/feeds) · CRG_ORG_DIR ($CRG_TMP/orggraphs) · CRG_KEYS_DIR ($CRG_TMP/keys)
//   CRG_AI_MOCK   canned AI answers (default ./mock) · CRG_SHARED_REGISTRY ($CRG_TMP/shared-registry)
//   CRGO_HOME     a CRGO v0.10.1 checkout (default ../../CyberRiskGuardian-Ontology-0.10.1)
//   CRG_MOCK_GITHUB_PORT  port of the mock GitHub API used by t29 (default 8199)
// serve.sh starts the helper with the same values (it reads them the same way).
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
export const TESTS = path.dirname(fileURLToPath(import.meta.url));
const env = (k, d) => process.env[k] || d;
export const URL = env('CRG_URL', 'http://127.0.0.1:8099/');
export const PORT = Number(new globalThis.URL(URL).port || 80);
export const APP = path.resolve(env('CRG_APP_DIR', path.join(TESTS, '..', 'app')));
export const TMP = path.resolve(env('CRG_TMP', path.join(TESTS, '.tmp')));
export const FEEDS = path.resolve(env('CRG_FEEDS_DIR', path.join(TMP, 'feeds')));
export const ORG = path.resolve(env('CRG_ORG_DIR', path.join(TMP, 'orggraphs')));
export const KEYS = path.resolve(env('CRG_KEYS_DIR', path.join(TMP, 'keys')));
export const MOCK = path.resolve(env('CRG_AI_MOCK', path.join(TESTS, 'mock')));
export const SHARED = path.resolve(env('CRG_SHARED_REGISTRY', path.join(TMP, 'shared-registry')));
export const CRGO = path.resolve(env('CRGO_HOME', path.join(TESTS, '..', '..', 'CyberRiskGuardian-Ontology-0.10.1')));
export const MOCK_GITHUB_PORT = Number(env('CRG_MOCK_GITHUB_PORT', '8199'));
fs.mkdirSync(TMP, { recursive: true });
/** A file in the scratch folder of this run. */
export const tmp = name => path.join(TMP, name);
/** Restart the helper on PORT with this run's folders (serve.sh); extra environment for one restart. */
export const serveCmd = (extra = '') => `${extra} bash ${JSON.stringify(path.join(TESTS, 'serve.sh'))}`;

export async function open(hash = '#/process') {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ serviceWorkers: process.env.CRG_SW ? 'allow' : 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(URL + hash);
  await page.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, polling: 300 });
  // A fresh profile seeds the MediBec teaching case just after the first workspace opens; most suites select it.
  await page.waitForFunction(async () => { const m = await import('/js/state.js'); if (!m.S.list.some(w => w.kind === 'example')) await m.refreshList?.(); return m.S.list.some(w => w.kind === 'example'); },
    null, { timeout: 20000, polling: 300 }).catch(() => {});
  return { browser, ctx, page, errors };
}
let fails = 0, passes = 0;
export function ok(cond, msg) { if (cond) { passes++; } else { fails++; console.log('FAIL', msg); } }
export function done(name) { console.log(`${name}: ${passes} passed, ${fails} failed`); process.exit(fails ? 1 : 0); }
