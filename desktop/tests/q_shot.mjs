import { open, tmp } from './lib.mjs';
const { browser, page, errors } = await open('#/settings/simulation');
await page.waitForTimeout(1500);
await page.evaluate(async () => { const m = await import('/js/panels/settings_sim.js'); const S = await import('/js/simgen.js'); const st = await import('/js/state.js'); const p = await S.loadBundled('data/simulation/medibec/manifest.json'); await m.importPack(st.S.ws, p, { check: false }); st.touch(); });
await page.waitForTimeout(800);
for (const h of ['siem/coverage', 'soar/actions', 'compliance/dashboard', 'audit/plan']) { await page.evaluate(x => { location.hash = '#/' + x; }, h); await page.waitForTimeout(1200); await page.screenshot({ path: tmp(`shot-${h.replace("/", "-")}.png`) }); }
console.log(errors);
await browser.close();
