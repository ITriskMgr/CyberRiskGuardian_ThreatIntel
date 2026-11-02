import { open, ok, done, URL } from './lib.mjs';
const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); });
const routes = ['process', 'evidence', 'screening', 'screening/families', 'screening/weights', 'screening/coverage', 'screening/watch', 'screening/final', 'summary', 'about/versions', 'org/profile', 'org/crown', 'org/docs', 'org/import', 'org/evidence', 'org/workspaces', 'assets', 'maturity', 'reset', 'reset/admin', 'dashboard', 'safeguards', 'register', 'scenario/S1', 'batch', 'calc', 'riskreg', 'mitigation', 'recs',
  'threats', 'vulns', 'feeds', 'threat', 'ontology/suggest', 'ontology/explore', 'ontology/connection',
  'registry/browse', 'registry/contribute', 'registry/mine', 'registry/moderate', 'registry/settings', 'share',
  'frameworks', 'isp/policies', 'isp/policy', 'isp/issues', 'isp/reviews', 'compliance', 'compliance/requirements', 'compliance/applicability', 'compliance/determinations', 'compliance/ai', 'compliance/report',
  'isms/overview', 'isms/exceptions', 'csm/tests', 'csm/governance', 'csm/decisions', 'csm/incidents', 'audit/engagements', 'audit/programmes', 'audit/findings', 'audit/assurance', 'qc', 'ontology/link',
  'cvss', 'budget', 'export', 'ai', 'forecast', 'backup', 'settings/general', 'settings/modules', 'settings/ai', 'settings/users', 'settings/links', 'about'];
for (const r of routes) {
  const before = errors.length;
  await page.evaluate(h => { location.hash = '#/' + h; }, r);
  await page.waitForTimeout(r.startsWith('ontology') || r.startsWith('settings') ? 1500 : 450);
  const bad = await page.evaluate(() => [...document.querySelectorAll('main section:not([hidden]) .banner, main section:not([hidden]) .callout')].map(b => b.textContent).filter(t => /raised an error/.test(t)));
  ok(!bad.length && errors.length === before, `route ${r} renders cleanly ${bad.join(' ').slice(0, 300)} ${errors.slice(before).join(' | ').slice(0, 300)}`);
}
// module off
await page.evaluate(async () => { const M = await import('/js/modules.js'); M.set('isp', false); location.hash = '#/isp'; });
await page.waitForTimeout(400);
ok(await page.isVisible('text=This module is switched off'), 'switched-off module explains itself');
ok(!(await page.isVisible('nav a[data-panel="isp"]')), 'its menu entry is hidden');
await page.evaluate(async () => { const M = await import('/js/modules.js'); M.set('isp', true); });
ok(await page.isVisible('nav a[data-panel="isp"]'), 'menu entry back when switched on');
await browser.close(); done('t06 smoke');
