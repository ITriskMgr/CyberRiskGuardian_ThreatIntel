// Ad-hoc screenshots for design review (not a suite): node q_atlas_shot.mjs <outdir> <hash> [lang] [theme] [w] [h] [click-selector]
import { chromium } from 'playwright';
const [out, hash = '#/process', lang = 'en', theme = 'light', w = '1366', h = '900', click = ''] = process.argv.slice(2);
const URL = process.env.CRG_URL || 'http://127.0.0.1:8121/';
const browser = await chromium.launch();
const ctx = await browser.newContext({ serviceWorkers: 'block', viewport: { width: +w, height: +h } });
const page = await ctx.newPage();
await page.addInitScript(([t]) => { try { localStorage.setItem('crg-theme', t); } catch {} }, [theme]);
await page.goto(URL + hash);
await page.waitForFunction(async () => { const m = await import('/js/state.js'); return !!m.S.ws && m.S.list.length > 0; }, null, { timeout: 20000, polling: 300 });
await page.waitForTimeout(1500);
if (lang === 'fr') { await page.evaluate(async () => { const i = await import('/js/i18n.js'); await i.setLang('fr'); }); await page.waitForTimeout(800); }
await page.evaluate(async h => { const st = await import('/js/state.js'); const ex = st.S.list.find(x => x.kind === 'example'); if (ex && st.S.ws.id !== ex.id) await st.select(ex.id); location.hash = h; }, hash);
await page.waitForTimeout(1600);
if (click) { for (const c of click.split('||')) { await page.click(c); await page.waitForTimeout(500); } }
await page.screenshot({ path: out, fullPage: false });
await browser.close();
