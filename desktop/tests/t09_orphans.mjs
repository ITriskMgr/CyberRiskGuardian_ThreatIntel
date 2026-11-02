import { open, ok, done, APP } from './lib.mjs';
import fs from 'fs';
import path from 'path';
// every field a module writes on a workspace (static scan) must belong to a reset group
const SRC = APP + '/js';
const files = [...fs.readdirSync(SRC).map(f => path.join(SRC, f)), ...fs.readdirSync(SRC + '/panels').map(f => path.join(SRC, 'panels', f))].filter(f => f.endsWith('.js'));
const written = new Set();
for (const f of files) for (const m of fs.readFileSync(f, 'utf8').matchAll(/\b(?:ws|S\.ws)\.([a-zA-Z_]+)\s*(?:\|\|=|\?\?=|=(?!=))/g)) written.add(m[1]);
const { browser, page } = await open('#/process');
const r = await page.evaluate(async (written) => {
  const R = await import('/js/reset.js'); const st = await import('/js/state.js');
  const g = new Set(['assessment']); for (const x of Object.values(R.GROUPS)) for (const k of x) g.add(k);
  const live = new Set(); for (const w of st.S.list) for (const k of Object.keys(w)) live.add(k);
  // a fully populated workspace: every known field set, then the broadest reset
  const ws = structuredClone(st.S.list.find(w => w.kind === 'example'));
  for (const k of written) if (!(k in ws)) ws[k] = { marker: 1 };
  ws.ai = { ...(ws.ai || {}), confidential: true, enabled: false, log: [{ t: 1 }] };
  ws.csm = { bodies: [], roles: [], delegations: [], decisions: [], incidents: [{ id: 'INC-001', detected: '2025-01-01', type: 'phishing' }] };
  R.apply(ws, 'context');
  const afterContext = { inc: ws.csm?.incidents?.length, conf: ws.ai?.confidential };
  R.apply(ws, 'organization');
  return { orph: [...written].filter(k => !g.has(k)), liveOrph: [...live].filter(k => !g.has(k)), afterContext, conf: ws.ai?.confidential, log: ws.ai?.log?.length, inc: ws.csm?.incidents };
}, [...written]);
ok(!r.orph.length, 'every field written by a module belongs to a reset group ' + r.orph.join(','));
ok(!r.liveOrph.length, 'every field of the stored workspaces belongs to a reset group ' + r.liveOrph.join(','));
ok(r.afterContext.inc === 1 && r.afterContext.conf === true, '"Keep the context" keeps the incident register and the confidential flag');
ok(r.conf === true && r.log === 1, 'even removing the organization keeps the workspace confidential and its AI log');
ok(!r.inc || !r.inc.length, 'removing the organization clears the incidents');
await browser.close(); done('t09 orphan fields');
