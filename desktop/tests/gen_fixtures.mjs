// Generate workspaces as saved by earlier releases: each old build is served statically and its own code creates the data.
import { chromium } from 'playwright';
import { waitInPage } from './lib.mjs';
import { spawn } from 'child_process';
import fs from 'fs';
// Maintenance tool, not a suite: the unpacked earlier builds are not in the repository. Give their folders as
// CRG_OLD_BUILDS='{"1.5.4":"/path/CyberRiskGuardian_Desktop_v1.5.4-beta", …}'; the fixtures are committed in fixtures/.
const builds = JSON.parse(process.env.CRG_OLD_BUILDS || '{}');
if (!Object.keys(builds).length) { console.log('gen_fixtures: set CRG_OLD_BUILDS to the folders of the earlier builds'); process.exit(0); }
if (process.env.ONLY) for (const k of Object.keys(builds)) if (k !== process.env.ONLY) delete builds[k];
const browser = await chromium.launch();
let port = 8111;
for (const [v, dir] of Object.entries(builds)) {
  port++;
  const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: dir, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200));
  const ctx = await browser.newContext({ serviceWorkers: 'block' });
  const page = await ctx.newPage();
  await page.goto(`http://127.0.0.1:${port}/#/process`);
  await waitInPage(page, async () => { const m = await import('/js/state.js'); return !!m.S.ws; }, null, { timeout: 30000, every: 300 });
  const dump = await page.evaluate(async (v) => {
    const st = await import('/js/state.js'); const store = await import('/js/store.js');
    // a second, organization workspace with some analyst work, built with this release's own factory
    const w = st.newWorkspace({ name: 'Fixture org ' + v, kind: 'organization' });
    w.org.sector = 'Retail'; w.org.region = 'Quebec, Canada'; w.appetite_rationale = 'Fixture.';
    const ex = (st.S.list || []).find(x => x.kind === 'example') || st.S.ws;
    w.assessment = JSON.parse(JSON.stringify(ex.assessment));
    w.recommendations = [{ id: 'R1', title: 'Fixture recommendation', status: 'approved' }];
    w.measures = [{ id: 'M1', name: 'MFA', scen: ['S1'] }];
    if (v === '1.5.8') { w.grc = w.grc || {}; w.grc.evidence = [{ id: 'EV-001', title: 'MFA report', validUntil: '2026-01-31', custodian: 'IT' }]; }
    if (v === '1.5.7' || v === '1.5.8') {
      try { const P = await import('/js/isp.js'); const I = P.isp(w); I.policies.push(P.newPolicy({ title: 'Access control', type: 'policy', domain: 'Identity and access' })); I.issues.push({ id: 'NC-1', type: 'exception', status: 'accepted', title: 'Legacy app', expiry: '2026-12-31' }); } catch (e) { w._fixtureNote = String(e); }
      w.compliance.requirements = [{ id: 'REQ-1', set: 'Contract', reference: '§7.2', requirement: 'Encrypt backups', status: 'partial' }];
      w.incidents = [{ date: '2025-03-01', type: 'phishing', impact: 'low' }];
      w.ai = { enabled: true, confidential: true, provider: 'claude', log: [{ t: 1, feature: 'extract_profile' }] };
      w.importPlan = ['assets', 'incidents'];
    }
    await store.put('ws', w.id, w);
    const wss = (await store.all('ws')).filter(Boolean);
    const meta = {}; for (const k of ['prefs', 'users', 'settings', 'frameworks']) { try { meta[k] = await store.get('meta', k); } catch {} }
    return { app: v, workspaces: wss, meta };
  }, v);
  fs.writeFileSync(`fixtures/ws-${v}.json`, JSON.stringify(dump));
  console.log(v, dump.workspaces.length, 'workspaces', Object.keys(dump.workspaces[0]).length, 'fields');
  await ctx.close(); srv.kill();
}
await browser.close();
