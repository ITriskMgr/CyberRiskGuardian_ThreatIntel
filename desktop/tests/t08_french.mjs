import { open, ok, done, waitInPage, URL, tmp } from './lib.mjs';
import fs from 'fs';
const { browser, ctx, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id);
  const i = await import('/js/i18n.js'); await i.setLang('fr'); });
await page.reload();
await waitInPage(page, async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 20000, every: 300 });
await page.evaluate(async () => { const i = await import('/js/i18n.js'); window.__miss = i.collectMissing(); });
const routes = ['process', 'evidence', 'screening', 'screening/families', 'screening/weights', 'screening/coverage', 'screening/watch', 'screening/final', 'summary', 'cvss', 'about/versions', 'org/profile', 'org/crown', 'org/docs', 'org/import', 'reset', 'register', 'batch', 'riskreg', 'recs',
  'ontology/suggest', 'ontology/explore', 'ontology/connection', 'registry/browse', 'registry/contribute', 'registry/mine', 'registry/moderate', 'registry/settings',
  'isp/policies', 'isp/issues', 'isp/reviews', 'compliance', 'compliance/requirements', 'compliance/ai', 'compliance/report', 'compliance/applicability', 'compliance/determinations', 'isms/overview', 'isms/exceptions', 'csm/tests', 'csm/governance', 'csm/decisions', 'csm/incidents', 'audit/engagements', 'audit/programmes', 'audit/findings', 'audit/assurance', 'qc', 'ontology/link', 'backup', 'settings/modules', 'settings/ai', 'about'];
const menuRoutes = await page.evaluate(async () => { const M = await import('/js/menu.js'); return M.MENU.flatMap(s => s.items.flatMap(i => i.tabs ? i.tabs.map(t => t.panel + '/' + t.arg) : i.panel ? [i.panel + (i.arg ? '/' + i.arg : '')] : [])); });
for (const r of menuRoutes) if (!routes.includes(r)) routes.push(r);
for (const r of routes) {
  const before = errors.length;
  await page.evaluate(h => { location.hash = '#/' + h; }, r);
  await page.waitForTimeout(r.startsWith('ontology') || r.startsWith('settings') ? 1500 : 500);
  ok(errors.length === before, `fr route ${r} renders cleanly ${errors.slice(before).join(' | ').slice(0, 300)}`);
}
ok(await page.isVisible('nav >> text=Registre partagé des risques'), 'nav shows Registre partagé des risques');
ok(await page.isVisible('nav >> text=Gestion des PSI'), 'nav shows PSI');
ok(await page.isVisible('nav >> text=Gestion de la cybersécurité') && await page.isVisible('nav >> text=Revue de qualité'), 'nav shows the governance modules in French');
const miss = await page.evaluate(async () => (await import('/js/i18n.js')).missingNow());
const real = miss.filter(s => /[a-z]{3}/i.test(s) && !/^[A-Z0-9_\-.:\/ ]+$/.test(s));
console.log("untranslated shown:", real.length); fs.writeFileSync(tmp("miss_fr.json"), JSON.stringify(real, null, 0));
// guide window picks the French guide
const g = await ctx.newPage();
await g.goto(URL + 'help/user-guide.html');
await g.waitForFunction(() => document.querySelector('#toc a'), null, { timeout: 15000 });
ok(await g.evaluate(() => document.documentElement.lang) === 'fr', 'guide window reads USER-GUIDE.fr.md');
ok(/Guide/.test(await g.textContent('#doc h1')), 'French guide title');
await browser.close(); done('t08 french');
