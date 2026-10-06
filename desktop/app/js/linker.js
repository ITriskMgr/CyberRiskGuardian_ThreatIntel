/* linker.js — suggested links between vulnerabilities and scenarios (1.5.3, proof of concept).

   Stage 1 — rules, on this computer, no AI. A register CVE is proposed for a scenario when:
     • asset    the scenario is linked to an inventory asset that lists the CVE, or the CVE's asset /
                product field names one of the scenario's assets;
     • CWE      the CVE's weakness is one the scenario already carries;
     • ATT&CK   the CVE's weakness is exploited by a technique the scenario carries (through CAPEC);
     • product  the CVE's product is named in the scenario's text.
   A CWE is proposed for a scenario that has techniques but no weakness. A CVE is proposed as *exposed*
   when an inventory asset lists it or runs the product it concerns.
   Stage 2 — AI (task link_vulns). Reads the causal chains and the register and proposes further links
   with a reason and a confidence. Local model by default (Settings → AI — local & remote), because the
   payload is the organization's vulnerability list. Identifiers the register does not hold are dropped.

   Nothing here changes a stored value. Proposals land in a review list; a link exists when the analyst
   accepts it, and a link alone never moves a score — Pb(ψ,A) still moves only for exposed CVEs, through
   the ladder proposals of Threat context. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';
import { KB, cwe as cweInfo, tech } from './ontology.js';
import * as AI from './ai.js';

const norm = s => String(s || '').toLowerCase();
const CONF_RANK = { High: 3, Medium: 2, Low: 1 };
const scenText = s => norm([s.name, s.statement, s.assets, s.processes, s.threat_event, ...(s.vulns || []), s.narrative].join(' '));
const words = s => norm(s).split(/[^a-z0-9.+-]+/).filter(w => w.length >= 4);

/** CWEs exploited by the scenario's ATT&CK techniques (sub-techniques fall back to the parent). */
function cwesOfTechniques(ids) {
  const out = new Set();
  for (const id of ids || []) {
    const t = KB.tech[id] || KB.tech[String(id).split('.')[0]];
    for (const w of (t?.w || [])) out.add(w);
  }
  return out;
}

/** Inventory assets a scenario refers to: explicit links first, then names found in its asset text. */
function scenarioAssets(s, ws) {
  const inv = ws.assets || [];
  const ids = new Set(s.assetIds || []);
  const txt = norm(s.assets) + ' ' + norm(s.name);
  for (const a of inv) if (a.name && a.name.length >= 3 && txt.includes(norm(a.name))) ids.add(a.id);
  return inv.filter(a => ids.has(a.id) && a.lifecycle?.stage !== 'disposed');
}

/** Stage 1. Returns {links, exposure, gaps}. */
export function byRules(ws = S.ws, { only = null } = {}) {
  const V = (ws.vulns || []).filter(v => v.kind !== 'CWE');
  const scen = ws.assessment.SCEN.filter(s => !only || only.includes(s.id));
  const links = new Map();
  const add = (s, id, kind, why, conf) => {
    const key = s.id + '|' + id;
    const cur = links.get(key) || { key, scen: s.id, id, kind, reasons: [], conf: 'Low', method: 'rules' };
    if (!cur.reasons.includes(why)) cur.reasons.push(why);
    if (CONF_RANK[conf] > CONF_RANK[cur.conf]) cur.conf = conf;
    links.set(key, cur);
  };
  for (const s of scen) {
    const have = new Set([...(s.cves || []), ...(s.cwe || []), ...(s.wlinks || [])]);
    const assets = scenarioAssets(s, ws);
    const assetNames = assets.map(a => norm(a.name)).filter(Boolean);
    const sCwe = new Set(s.cwe || []);
    const tCwe = cwesOfTechniques(s.attack);
    const text = scenText(s);
    for (const v of V) {
      if (have.has(v.id)) continue;
      const vCwe = v.cwe || [];
      const onAsset = assets.find(a => (a.vulns || []).includes(v.id));
      if (onAsset) add(s, v.id, v.kind === 'Weakness' ? 'Weakness' : 'CVE', `asset ${onAsset.name} lists ${v.id}`, 'High');   // the inventory lists it on the scenario's asset
      const named = assetNames.find(n => n.length >= 3 && norm(v.asset + ' ' + v.product).includes(n));
      if (named && !onAsset) add(s, v.id, v.kind === 'Weakness' ? 'Weakness' : 'CVE', `register entry concerns asset “${named}”`, v.exposed ? 'High' : 'Medium');
      const wm = vCwe.filter(w => sCwe.has(w));
      if (wm.length) add(s, v.id, v.kind === 'Weakness' ? 'Weakness' : 'CVE', `same weakness ${wm.join(', ')}`, onAsset || named ? 'High' : 'Medium');
      const tm = vCwe.filter(w => tCwe.has(w) && !sCwe.has(w));
      if (tm.length) add(s, v.id, v.kind === 'Weakness' ? 'Weakness' : 'CVE', `${tm.join(', ')} is exploited by the scenario's ATT&CK techniques`, onAsset || named ? 'Medium' : 'Low');
      const prodWords = words(v.product).filter(w => !['inc.', 'corp', 'software', 'server', 'microsoft', 'system', 'systems'].includes(w));
      const pm = prodWords.filter(w => text.includes(w));
      if (pm.length && pm.length >= Math.min(2, prodWords.length)) add(s, v.id, v.kind === 'Weakness' ? 'Weakness' : 'CVE', `product “${v.product}” named in the scenario`, onAsset || named ? 'High' : 'Medium');
    }
    // a weakness for a scenario that has techniques but none
    if (!(s.cwe || []).length && (s.attack || []).length) {
      const counts = {};
      for (const id of s.attack) { const t = KB.tech[id] || KB.tech[String(id).split('.')[0]]; for (const w of (t?.w || [])) counts[w] = (counts[w] || 0) + 1; }
      const top = Object.entries(counts).sort((a, b) => b[1] - a[1] || ((KB.top25.indexOf(a[0]) + 1 || 99) - (KB.top25.indexOf(b[0]) + 1 || 99))).slice(0, 2);
      for (const [w] of top) if (!have.has(w)) add(s, w, 'CWE', `exploited by ${s.attack.filter(id => ((KB.tech[id] || KB.tech[String(id).split('.')[0]])?.w || []).includes(w)).join(', ')}`, 'Low');
    }
  }
  // exposure: register CVEs not yet exposed that an inventory asset lists or runs
  const exposure = [];
  for (const v of V) {
    if (v.exposed) continue;
    const a = (ws.assets || []).find(x => (x.vulns || []).includes(v.id));
    if (a) { exposure.push({ id: v.id, why: `listed on asset ${a.name}${a.discovery?.source ? ' (' + a.discovery.source + ')' : ''}`, conf: 'High' }); continue; }
    const pw = words(v.product);
    const run = pw.length && (ws.assets || []).find(x => {
      const hay = norm([x.product, x.vendor, x.os, ...(x.software || []).map(sw => sw.name)].join(' '));
      return pw.filter(w => hay.includes(w)).length >= Math.min(2, pw.length);
    });
    if (run) exposure.push({ id: v.id, why: `asset ${run.name} runs “${v.product}”`, conf: 'Medium' });
  }
  const linked = new Set(ws.assessment.SCEN.flatMap(s => [...(s.cves || []), ...(s.cwe || [])]));
  const proposed = new Set([...links.values()].map(l => l.id));
  const gaps = {
    scenarios: scen.filter(s => !(s.cves || []).length && !(s.cwe || []).length && ![...links.values()].some(l => l.scen === s.id)).map(s => s.id),
    vulns: V.filter(v => !linked.has(v.id) && !proposed.has(v.id)).map(v => v.id),
  };
  return { links: [...links.values()].map(l => ({ ...l, why: l.reasons.join('; ') })), exposure, gaps };
}

/* ---------------- stage 2 — AI ---------------- */
AI.TASKS.link_vulns = {
  label: 'Vulnerability ↔ scenario linking',
  build(ws, { only = null, rules = [] } = {}) {
    const scen = ws.assessment.SCEN.filter(s => !only || only.includes(s.id));
    const V = (ws.vulns || []).filter(v => v.kind !== 'CWE');
    const cut = (x, n) => String(x || '').replace(/\s+/g, ' ').slice(0, n);
    const body = [
      'Propose links between the risk scenarios and the vulnerabilities below.',
      '', 'SCENARIOS (id | name | causal chain | assets | predisposing conditions | CWE | ATT&CK | CVE already linked):',
      ...scen.map(s => [s.id, cut(s.name, 90), cut(s.statement, 320), cut(s.assets, 120), cut((s.vulns || []).join('; '), 160),
        (s.cwe || []).join(',') || '-', (s.attack || []).join(',') || '-', (s.cves || []).join(',') || '-'].join(' | ')),
      '', 'VULNERABILITY REGISTER (CVE or W- weakness | product | asset | CWE | exposure confirmed | title):',
      ...V.map(v => [v.id, cut(v.product, 60), cut(v.asset, 60), (v.cwe || []).join(',') || '-', v.exposed ? 'yes' : 'no', cut(v.title || v.desc, 120)].join(' | ')),
      '', 'Links already proposed by the rules (do not repeat them; you may contradict one in "doubts"):',
      ...(rules.length ? rules.slice(0, 200).map(l => `${l.scen} — ${l.id} (${l.why})`) : ['(none)']),
      '', 'Rules:',
      '- Link a CVE or a named weakness (W-…) only if it is in the register above. Never invent an identifier.',
      '- Link a CWE (CWE-<number>) when it names the weakness the causal chain relies on.',
      '- A link means: this vulnerability is a plausible way for this scenario to happen at this organization.',
      '  Product or asset correspondence is the strongest evidence; a shared weakness type alone is weak evidence.',
      '- Confidence: High (asset or product named on both sides), Medium (weakness and technique fit), Low (plausible only).',
      '- Do not propose parameter values. A link never changes a risk figure.',
      '', 'Answer with JSON only:',
      '{"links":[{"scenario":"S1","id":"CVE-2024-12345","reason":"<one sentence>","confidence":"High|Medium|Low"}],',
      ' "doubts":[{"scenario":"S1","id":"CVE-…","reason":"why a rule-proposed link looks wrong"}],',
      ' "no_evidence":["<scenario ids that no vulnerability in the register supports>"]}',
    ];
    return { system: 'You are a senior vulnerability and risk analyst. You map known vulnerabilities to risk scenarios precisely and conservatively. You never invent identifiers and never calculate risk.',
             prompt: body.join('\n'), max_tokens: 4000, json: true, keepLanguage: true };
  },
};

/** Validate the model's answer against the workspace: unknown scenarios or CVEs are dropped and counted. */
export function parseAI(text, ws = S.ws) {
  const data = AI.parseJson(text) || {};
  const sids = new Set(ws.assessment.SCEN.map(s => s.id));
  const vids = new Set((ws.vulns || []).map(v => v.id));
  let dropped = 0;
  const links = [];
  for (const l of data.links || []) {
    const sid = String(l.scenario || '').trim(), id = String(l.id || '').trim().toUpperCase();
    const s = ws.assessment.SCEN.find(x => x.id === sid);
    const isCve = /^CVE-\d{4}-\d{4,}$/.test(id), isCwe = /^CWE-\d+$/.test(id), isW = /^W-\d+$/.test(id);
    if (!s || !(isCve || isW ? vids.has(id) : isCwe)) { dropped++; continue; }   // CWE: any well-formed identifier (the bundled list is an extract)
    if ((s.cves || []).includes(id) || (s.cwe || []).includes(id) || (s.wlinks || []).includes(id)) continue;
    const conf = ['High', 'Medium', 'Low'].includes(l.confidence) ? l.confidence : 'Low';
    links.push({ key: sid + '|' + id, scen: sid, id, kind: isCve ? 'CVE' : isW ? 'Weakness' : 'CWE', why: String(l.reason || '').slice(0, 300), reasons: [String(l.reason || '')], conf, method: 'ai' });
  }
  const doubts = (data.doubts || []).filter(d => sids.has(d.scenario)).map(d => ({ scen: d.scenario, id: String(d.id || ''), why: String(d.reason || '').slice(0, 300) }));
  const none = (data.no_evidence || []).filter(x => sids.has(x));
  return { links, doubts, noEvidence: none, dropped, truncated: !!data.__truncated };
}

/* ---------------- review list (persisted with the workspace) ---------------- */
export function draft(ws = S.ws) { ws.linkDraft ||= { links: [], exposure: [], gaps: null, doubts: [], noEvidence: [], ran: {} }; return ws.linkDraft; }

/** Merge proposals into the review list; a link proposed by both methods keeps both reasons. */
export function merge(items, ws = S.ws) {
  const d = draft(ws);
  for (const it of items) {
    if ((d.rejected || []).includes(it.key)) continue;     // rejected once: not proposed again
    const cur = d.links.find(x => x.key === it.key);
    if (!cur) d.links.push({ ...it, take: it.conf === 'High' });
    else {
      if (cur.method !== it.method) cur.method = 'rules + AI';
      if (it.why && !cur.why.includes(it.why)) cur.why += ' · ' + it.why;
      if (CONF_RANK[it.conf] > CONF_RANK[cur.conf]) cur.conf = it.conf;
    }
  }
  d.links.sort((a, b) => a.scen.localeCompare(b.scen, undefined, { numeric: true }) || CONF_RANK[b.conf] - CONF_RANK[a.conf]);
  touch();
  return d;
}

/** Accept the ticked links: they become scenario links, each recorded with its reason and method. */
export function accept(rows, by = '', ws = S.ws) {
  ws.linkLog ||= [];
  let n = 0;
  for (const r of rows) {
    const s = ws.assessment.SCEN.find(x => x.id === r.scen);
    if (!s) continue;
    if (r.kind === 'Weakness') {                       // 1.5.4 — a named weakness from the documents
      const w = (ws.vulns || []).find(v => v.id === r.id);
      (s.wlinks ||= []).includes(r.id) || s.wlinks.push(r.id);
      if (w?.title && !(s.vulns || []).includes(w.title)) (s.vulns ||= []).push(w.title);
      for (const c of w?.cwe || []) if (!(s.cwe ||= []).includes(c)) s.cwe.push(c);
      ws.linkLog.unshift({ at: new Date().toISOString(), scen: r.scen, id: r.id, method: r.method, conf: r.conf, why: r.why, by, action: 'linked' }); n++;
      continue;
    }
    const list = r.kind === 'CVE' ? (s.cves ||= []) : (s.cwe ||= []);
    if (!list.includes(r.id)) { list.push(r.id); n++; }
    ws.linkLog.unshift({ at: new Date().toISOString(), scen: r.scen, id: r.id, method: r.method, conf: r.conf, why: r.why, by, action: 'linked' });
  }
  const d = draft(ws);
  const keys = new Set(rows.map(r => r.key));
  d.links = d.links.filter(x => !keys.has(x.key));
  ws.linkLog = ws.linkLog.slice(0, 1000);
  touch();
  return n;
}
export function reject(rows, by = '', ws = S.ws) {
  ws.linkLog ||= [];
  for (const r of rows) ws.linkLog.unshift({ at: new Date().toISOString(), scen: r.scen, id: r.id, method: r.method, conf: r.conf, why: r.why, by, action: 'rejected' });
  const keys = new Set(rows.map(r => r.key));
  const d = draft(ws); d.links = d.links.filter(x => !keys.has(x.key));
  d.rejected = [...new Set([...(d.rejected || []), ...keys])].slice(-2000);
  touch();
}
/** Mark CVEs exposed, recording the evidence in the register entry. */
export function markExposed(items, by = '', ws = S.ws) {
  let n = 0;
  for (const it of items) {
    const v = (ws.vulns || []).find(x => x.id === it.id);
    if (!v || v.exposed) continue;
    v.exposed = true; v.notes = [v.notes, `Exposure confirmed ${new Date().toISOString().slice(0, 10)}${by ? ' by ' + by : ''}: ${it.why}`].filter(Boolean).join(' · '); n++;
  }
  const d = draft(ws); const ids = new Set(items.map(i => i.id)); d.exposure = d.exposure.filter(x => !ids.has(x.id));
  touch();
  return n;
}
