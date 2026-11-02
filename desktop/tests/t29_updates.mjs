// 1.8.0 — opt-in update check through the helper (serve.py) against a mocked GitHub "latest release" API:
// first-start question, setting off by default, Check now under About → Versions, banner and release notes,
// Download of the ZIP into the feeds folder, nothing sent, and graceful no release / rate limit / no network.
import { open, ok, done, FEEDS, TESTS, MOCK_GITHUB_PORT, tmp, serveCmd } from './lib.mjs';
import { spawn, execSync } from 'child_process';
import fs from 'fs';
const MP = MOCK_GITHUB_PORT, LOGF = tmp('mock-github.log');
fs.rmSync(LOGF, { force: true });
fs.mkdirSync(FEEDS, { recursive: true });
for (const f of fs.readdirSync(FEEDS).filter(f => f.endsWith('.zip'))) fs.rmSync(FEEDS + '/' + f);
const mock = spawn('python3', ['mock_github.py', String(MP), LOGF], { cwd: TESTS, stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));
const serveWith = p => execSync(serveCmd(`CRG_UPDATE_URL=http://127.0.0.1:${MP}${p}`));
try {
  serveWith('/newer');
  const { browser, page, errors } = await open('#/process');
  // first start: the question is asked once; the setting is off by default
  ok(await page.waitForSelector('#update-ask', { timeout: 8000 }).then(() => true, () => false), 'first start asks whether to check for updates');
  const pre = await page.evaluate(async () => { const U = await import('/js/updates.js'); return { on: U.enabled(), asked: U.asked() }; });
  ok(!pre.on && !pre.asked, 'off by default, not yet asked');
  ok(!fs.existsSync(LOGF), 'nothing is requested before the person answers');
  await page.click('#update-no'); await page.waitForTimeout(300);
  const no = await page.evaluate(async () => { const U = await import('/js/updates.js'); return { on: U.enabled(), asked: U.asked() }; });
  ok(!no.on && no.asked && !(await page.isVisible('#update-ask')), '"No" records the answer and closes the question');
  await page.reload(); await page.waitForTimeout(1500);
  ok(!(await page.isVisible('#update-ask')) && !(await page.isVisible('#update-banner')) && !fs.existsSync(LOGF), 'asked once; with the setting off nothing is checked at start-up');
  // Check now (About → Versions): a newer release
  await page.evaluate(() => { location.hash = '#/about/versions'; }); await page.waitForTimeout(800);
  ok(await page.isVisible('#update-setting') && !(await page.isChecked('#update-setting')), 'About → Versions: the setting, unticked');
  await page.click('#update-check-now');
  ok(await page.waitForSelector('#panel-about >> text=Version 1.9.0 is available', { timeout: 8000 }).then(() => true, () => false), 'banner: Version 1.9.0 is available');
  ok(/releases\/tag\/v1\.9\.0/.test(await page.getAttribute('#panel-about #update-notes', 'href')), 'release-notes link');
  const req = fs.readFileSync(LOGF, 'utf8').trim().split('\n').map(JSON.parse);
  ok(req.length === 1 && req[0].path === '/newer' && !/1\.8\.0/.test(req[0].headers['User-Agent'] || '') && !req[0].headers['Cookie'], 'one request to the fixed address, no query, no version, no cookie: ' + JSON.stringify(req[0]));
  // Download → helper job → ZIP in the feeds folder, never unpacked
  await page.click('#panel-about #update-download');
  ok(await page.waitForSelector('#panel-about >> text=Saved in the feeds folder', { timeout: 15000 }).then(() => true, () => false), 'Download saves the ZIP in the feeds folder');
  ok(fs.existsSync(FEEDS + '/CyberRiskGuardian_Desktop_v1.9.0-beta.zip'), 'the ZIP is in the feeds folder');
  ok(fs.readdirSync(FEEDS).every(f => !/^CyberRiskGuardian_Desktop_v1\.9\.0-beta$/.test(f)), 'nothing unpacked');
  ok(/Unverified: the release publishes no SHA-256 checksum/.test(await page.textContent('#panel-about #update-verify')), 'no .sha256 asset: kept, marked unverified');
  // switched on: checked at start-up, banner in the chrome
  await page.click('#update-setting'); await page.reload(); await page.waitForTimeout(2000);
  ok(await page.isVisible('#engine-banner #update-banner'), 'switched on: the start-up check shows the banner');
  await browser.close();
  // the latest release, no release, rate limit, no network: said plainly, nothing changes
  const cases = [['/same', /latest release \(1\.8\.1\)/], ['/none', /No release has been published yet/], ['/rate', /limits how often/], ['/noasset', /no ZIP file attached/], ['/plugin', /no ZIP file attached for the desktop/], ['/mixed', /Version 1\.9\.0 is available/]];
  for (const [p, re] of cases) {
    serveWith(p);
    const o = await open('#/about/versions'); await o.page.waitForTimeout(900);
    await o.page.click('#update-check-now'); await o.page.waitForTimeout(1500);
    const t = await o.page.textContent('#panel-about');
    ok(re.test(t), `${p}: ${re}`);
    ok(!o.errors.length, `${p}: no console error ` + o.errors.join(' | ').slice(0, 200));
    await o.browser.close();
  }
  // 1.9.0 — SHA-256: a matching "<zip>.sha256" asset → verified; a wrong one → refused, nothing kept
  for (const [p, good] of [['/verified', true], ['/badsum', false]]) {
    fs.rmSync(FEEDS + '/CyberRiskGuardian_Desktop_v1.9.0-beta.zip', { force: true });
    serveWith(p);
    const o = await open('#/about/versions'); await o.page.waitForTimeout(900);
    await o.page.click('#update-check-now'); await o.page.waitForSelector('#panel-about #update-download', { timeout: 8000 });
    await o.page.click('#panel-about #update-download'); await o.page.waitForTimeout(2500);
    const t = await o.page.textContent('#panel-about');
    if (good) ok(/Verified: its SHA-256 checksum matches/.test(t) && fs.existsSync(FEEDS + '/CyberRiskGuardian_Desktop_v1.9.0-beta.zip'), '.sha256 matches: verified and kept');
    else ok(/does not match the one published with the release/.test(t) && !fs.existsSync(FEEDS + '/CyberRiskGuardian_Desktop_v1.9.0-beta.zip'), '.sha256 differs: refused, nothing kept');
    await o.browser.close();
  }
  execSync(serveCmd('CRG_UPDATE_URL=http://127.0.0.1:1/latest'));
  const o = await open('#/about/versions'); await o.page.waitForTimeout(900);
  await o.page.click('#update-check-now'); await o.page.waitForTimeout(1500);
  ok(/could not be reached/.test(await o.page.textContent('#panel-about')), 'no network: said plainly');
  const r = await o.page.evaluate(async () => (await import('/js/helper.js')).apiJson('/api/update/check'));
  ok(r.status === 'offline' && r.current === '1.8.2', 'helper reports offline and the running version');
  await o.browser.close();
  ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
} finally {
  mock.kill();
  execSync(serveCmd());
}
done('t29 update check');
