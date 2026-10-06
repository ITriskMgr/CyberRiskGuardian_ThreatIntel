/* catalog.js — mitigation-control catalogue (ISO/IEC 27002, NIST SP 800-53 r5, NIST CSF, CIS Controls, ATT&CK
   mitigations, CRG measures) and the measure model of Risk mitigation (1.4.0).

   Combination rule (approved for 1.4.0): for a scenario covered by measures i = 1…n,
       red_p = 1 − ∏(1 − rp_i)      red_i = 1 − ∏(1 − ri_i)
   computed separately for likelihood and impact, then passed to the verified engine (CRG.calc), which applies
   the workbook convention  mitigated = estimated × red_p × red_i  (Excel guide v1.0c §11.5) unchanged.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute, scen, initiatives, initArr, INIT_COLS } from './state.js';
import { KB, tech, mitigation, MEASURES } from './ontology.js';
import { today, uid } from './util.js';
import * as FW from './frameworks.js';

const C = self.CRG_CONTROLS || { frameworks: [], tags: {}, controls: [], flags: [] };
export const FRAMEWORKS = [...C.frameworks];
/** Bundled frameworks plus any imported pack that introduces a new framework. */
export function frameworkList() {
  const out = [...C.frameworks];
  const have = new Set(out.map(f => f.id));
  for (const [id, p] of Object.entries(FW.packs()))
    if (!have.has(id)) out.push({ id, name: p.framework.name, short: p.framework.short || p.framework.name, origin: 'Imported', note: p.framework.note || '', count: p.controls.length });
  return out;
}
export const TAGS = C.tags;
export const FLAGS = C.flags;
export const FN = ['Governance', 'Identify', 'Prevention', 'Detection', 'Response', 'Recovery', 'Transfer'];
export const STATUS = [['proposed', 'Proposed'], ['approved', 'Approved'], ['in-progress', 'In progress'], ['implemented', 'Implemented'], ['rejected', 'Rejected']];
export const CONF = ['Low', 'Medium', 'High'];

let ALL = null;
/** Every control as {key, fw, fwName, id, title, grp, fn, tags, note, enh}. */
export function controls() {
  if (ALL) return ALL;
  ALL = C.controls.map(([fi, id, title, grp, fn, tags, note, enh]) => {
    const f = C.frameworks[fi];
    return { key: f.id + ':' + id, fw: f.id, fwName: f.short, id, title, grp, fn, tags, note, enh: !!enh };
  });
  // ATT&CK mitigations from kb.js
  const tagByMit = {};
  for (const [k, t] of Object.entries(TAGS)) for (const m of t.mits || []) (tagByMit[m] ||= []).push(k);
  for (const [id, m] of Object.entries(KB.mit || {}))
    ALL.push({ key: 'ATTACK-M:' + id, fw: 'ATTACK-M', fwName: 'ATT&CK M', id, title: m.n, grp: 'ATT&CK mitigations', fn: 'Prevention', tags: tagByMit[id] || ['harden'], note: '' });
  for (const m of MEASURES) {
    const tg = Object.entries(TAGS).filter(([, t]) => t.measure === m.key).map(([k]) => k);
    ALL.push({ key: 'CRG:' + m.key, fw: 'CRG', fwName: 'CRG', id: m.key, title: m.name, grp: 'CRG measures', fn: m.fn === 'Resilience' ? 'Recovery' : m.fn, tags: tg.length ? tg : ['gov'], note: '' });
  }
  // Imported framework packs (1.5.0). A pack whose id matches a bundled framework replaces that
  // framework's controls outright, so an imported edition is never mixed with the bundled one.
  const imported = FW.importedControls();
  if (imported.length) {
    const replaced = new Set(imported.map(c => c.fw));
    ALL = ALL.filter(c => !replaced.has(c.fw)).concat(imported);
  }
  return ALL;
}

/** Drop the cached control list; call after a framework pack is installed or removed. */
export function invalidate() { ALL = null; KEYMAP = null; }
export const fwCount = id => controls().filter(c => c.fw === id).length;
const byKey = () => { const m = new Map(); for (const c of controls()) m.set(c.key, c); return m; };
let KEYMAP = null;
export const control = key => (KEYMAP ||= byKey()).get(key) || null;

export function search({ q = '', fw = 'all', fn = 'all', tag = 'all', enh = false } = {}, limit = 300) {
  const ql = q.trim().toLowerCase();
  const out = [];
  for (const c of controls()) {
    if (fw !== 'all' && c.fw !== fw) continue;
    if (fn !== 'all' && c.fn !== fn) continue;
    if (tag !== 'all' && !c.tags.includes(tag)) continue;
    if (!enh && c.enh && !ql) continue;
    if (ql) {
      const hay = (c.id + ' ' + c.title + ' ' + c.grp).toLowerCase();
      if (!ql.split(/\s+/).every(w => hay.includes(w))) continue;
    }
    out.push(c);
    if (out.length >= limit) break;
  }
  return out;
}

/* ---------------- indicative cost templates per capability (analytical estimates — validation required) ---------------- */
// CAD, organization of about 250–1,000 staff; scaled by size. months = time to benefit.
export const TEMPLATES = {
  mfa: { name: 'Phishing-resistant MFA and conditional access for all users and administrators', initial: 60000, recurring: 30000, months: 3, owner: 'IAM lead' },
  iam: { name: 'Identity governance — joiner/mover/leaver automation and quarterly access reviews', initial: 90000, recurring: 35000, months: 6, owner: 'IAM lead' },
  pam: { name: 'Privileged access management (vault, just-in-time admin, session recording)', initial: 120000, recurring: 45000, months: 6, owner: 'Infrastructure manager' },
  asset: { name: 'Automated asset and software inventory (CMDB with discovery)', initial: 50000, recurring: 25000, months: 4, owner: 'IT operations' },
  vuln: { name: 'Vulnerability and patch management with risk-based SLAs (KEV first)', initial: 45000, recurring: 40000, months: 3, owner: 'IT operations' },
  harden: { name: 'Secure configuration baselines (CIS Benchmarks) with drift monitoring', initial: 40000, recurring: 20000, months: 6, owner: 'Infrastructure manager' },
  seg: { name: 'Network segmentation of critical systems and Zero Trust remote access', initial: 150000, recurring: 30000, months: 9, owner: 'Network architect' },
  edr: { name: 'EDR/XDR on all endpoints and servers with managed response', initial: 40000, recurring: 90000, months: 3, owner: 'Security operations' },
  siem: { name: 'Centralized logging, SIEM and 24/7 monitoring (MDR/SOC)', initial: 80000, recurring: 180000, months: 6, owner: 'Security operations' },
  mail: { name: 'Advanced e-mail security (sandboxing, DMARC enforcement) and web filtering', initial: 20000, recurring: 35000, months: 2, owner: 'Messaging administrator' },
  crypto: { name: 'Encryption of sensitive data at rest and in transit with key management', initial: 60000, recurring: 15000, months: 6, owner: 'Infrastructure manager' },
  dlp: { name: 'Data classification and data loss prevention for sensitive information', initial: 90000, recurring: 40000, months: 9, owner: 'Privacy officer' },
  backup: { name: 'Immutable, isolated backups with quarterly restoration tests', initial: 70000, recurring: 25000, months: 4, owner: 'IT operations' },
  bcp: { name: 'Business continuity and disaster recovery plans, exercised yearly', initial: 50000, recurring: 20000, months: 6, owner: 'Business continuity manager' },
  ir: { name: 'Incident response plan, retainer and tabletop exercises', initial: 30000, recurring: 35000, months: 3, owner: 'CISO' },
  tprm: { name: 'Third-party risk management and vendor remote-access brokering', initial: 40000, recurring: 30000, months: 6, owner: 'Procurement / CISO' },
  cloud: { name: 'Cloud security posture management and tenant hardening', initial: 35000, recurring: 30000, months: 4, owner: 'Cloud architect' },
  aware: { name: 'Security awareness programme and phishing simulation', initial: 15000, recurring: 20000, months: 2, owner: 'CISO / HR' },
  appsec: { name: 'Secure development life cycle — code analysis, dependency scanning, WAF', initial: 60000, recurring: 40000, months: 6, owner: 'Development manager' },
  pentest: { name: 'Annual penetration test and remediation follow-up', initial: 0, recurring: 45000, months: 2, owner: 'CISO' },
  cti: { name: 'Threat intelligence programme feeding the threat-context snapshot', initial: 10000, recurring: 25000, months: 2, owner: 'Security operations' },
  gov: { name: 'Information security governance — policies, roles, risk register and reporting', initial: 30000, recurring: 15000, months: 4, owner: 'CISO' },
  physical: { name: 'Physical security of server rooms and clinics (access control, monitoring)', initial: 50000, recurring: 10000, months: 6, owner: 'Facilities' },
  hr: { name: 'Personnel security — screening, onboarding and offboarding controls', initial: 10000, recurring: 8000, months: 3, owner: 'HR' },
  privacy: { name: 'Privacy programme — PIAs, incident register, retention and destruction (Law 25)', initial: 40000, recurring: 25000, months: 6, owner: 'Privacy officer' },
};
export function sizeFactor(ws = S.ws) {
  const n = Number(String(ws.org.employees || '').replace(/[^\d.]/g, ''));
  if (n > 0) return n < 100 ? 0.4 : n < 250 ? 0.7 : n <= 1000 ? 1 : n <= 5000 ? 2 : 3.5;
  const s = (ws.org.size || '').toLowerCase();
  return /small|petite/.test(s) ? 0.5 : /large|grande|enterprise/.test(s) ? 2 : 1;
}

/* ---------------- measures ---------------- */
export function blankMeasure(o = {}) {
  return Object.assign({ id: nextMeasureId(), name: '', desc: '', ctl: [], tags: [], fn: 'Prevention', owner: '', initial: 0, recurring: 0, months: 3,
    effort: 'Medium', rp: 0.2, ri: 0.2, conf: 'Low', scen: [], eff: {}, status: 'proposed', source: 'manual', rationale: '', evidence: '',
    effect: '', verb: '', gap: '',   // 1.5.1: what it changes (guidance §5), the action verb (§6), what the scenario revealed (§6)
    initId: null, created: today() }, o);
}
export function nextMeasureId(ws = S.ws) {
  let n = 0; for (const m of ws.measures || []) { const x = /^MS-(\d+)$/.exec(m.id); if (x) n = Math.max(n, +x[1]); }
  return 'MS-' + String(n + 1).padStart(2, '0');
}
export const active = (m, statuses) => statuses ? statuses.includes(m.status) : m.status !== 'rejected';
/** Effect of measure m on scenario id: per-scenario override, else the measure's default. */
export const effect = (m, id) => ({ rp: Number(m.eff?.[id]?.rp ?? m.rp) || 0, ri: Number(m.eff?.[id]?.ri ?? m.ri) || 0 });

/** Combined reduction for one scenario: 1 − ∏(1 − r), separately for likelihood and impact. */
export function combined(id, ws = S.ws, statuses) {
  let qp = 1, qi = 1; const ms = [];
  for (const m of ws.measures || []) {
    if (!active(m, statuses) || !(m.scen || []).includes(id)) continue;
    const e = effect(m, id); qp *= 1 - Math.max(0, Math.min(1, e.rp)); qi *= 1 - Math.max(0, Math.min(1, e.ri)); ms.push(m);
  }
  return { red_p: 1 - qp, red_i: 1 - qi, measures: ms };
}

/** Before/after through the verified engine for every scenario touched by a measure (or all). */
export function impact(ws = S.ws, statuses) {
  const A = ws.assessment, app = A.APPETITE, fac = A.FACTOR;
  const rows = [];
  for (const s of A.SCEN) {
    const c = combined(s.id, ws, statuses);
    let cur, untreated, after;
    try {
      cur = CRG.calc(s, app, fac);
      untreated = CRG.calc(Object.assign({}, s, { red_p: 0, red_i: 0 }), app, fac);
      after = c.measures.length ? CRG.calc(Object.assign({}, s, { red_p: +c.red_p.toFixed(6), red_i: +c.red_i.toFixed(6) }), app, fac) : null;
    } catch (e) { rows.push({ s, error: String(e.message || e) }); continue; }
    rows.push({ s, c, cur, untreated, after, cls: CRG.classify((after || cur).ratio), curCls: CRG.classify(cur.ratio) });
  }
  return rows;
}

/** Cost of the measure portfolio: each measure counted once, its Year-1 cost split equally across its scenarios. */
export function costs(ws = S.ws, statuses) {
  const per = {}; let initial = 0, recurring = 0;
  for (const m of ws.measures || []) {
    if (!active(m, statuses)) continue;
    initial += Number(m.initial) || 0; recurring += Number(m.recurring) || 0;
    const y1 = (Number(m.initial) || 0) + (Number(m.recurring) || 0);
    const sc = (m.scen || []).filter(id => scen(id));
    for (const id of sc) per[id] = (per[id] || 0) + y1 / sc.length;
  }
  return { initial, recurring, y1: initial + recurring, per };
}

/** Write the combined reductions into the scenarios (reversible: previous values kept in s.redPrev). */
export function applyToScenarios(ids, ws = S.ws, statuses) {
  const done = [];
  for (const id of ids) {
    const s = scen(id); if (!s) continue;
    const c = combined(id, ws, statuses); if (!c.measures.length) continue;
    const before = { red_p: s.red_p, red_i: s.red_i };
    let r0; try { r0 = CRG.calc(s, ws.assessment.APPETITE, ws.assessment.FACTOR); } catch { r0 = null; }
    s.redPrev = s.redPrev || before;
    s.red_p = +c.red_p.toFixed(4); s.red_i = +c.red_i.toFixed(4);
    s.red_source = { date: today(), measures: c.measures.map(m => m.id), rule: '1 − ∏(1 − r)' };
    let r1; try { r1 = CRG.calc(s, ws.assessment.APPETITE, ws.assessment.FACTOR); } catch { r1 = null; }
    (s.revisions ||= []).push({ date: today(), what: `red_p ${before.red_p} → ${s.red_p}, red_i ${before.red_i} → ${s.red_i} from measures ${c.measures.map(m => m.id).join(', ')}`,
      before: r0 ? +r0.ratio.toFixed(3) : null, after: r1 ? +r1.ratio.toFixed(3) : null });
    done.push(id);
  }
  return done;
}
export function revertScenario(id) {
  const s = scen(id); if (!s?.redPrev) return false;
  s.red_p = s.redPrev.red_p; s.red_i = s.redPrev.red_i; delete s.redPrev; delete s.red_source;
  (s.revisions ||= []).push({ date: today(), what: `red_p/red_i restored to ${s.red_p}/${s.red_i} (measures un-applied)` });
  return true;
}

/** Create or update the initiative that funds a measure, so Budget, Recommendations and Excel see it. */
export function toInitiative(m, ws = S.ws) {
  const I = ws.assessment.INITIATIVES;
  const horizon = m.months <= 3 ? '0–90 days' : m.months <= 6 ? '3–6 months' : m.months <= 12 ? '6–12 months' : '12–24 months';
  const o = { id: m.initId || ('I-' + m.id), name: m.name, desc: m.desc || m.rationale || '', scenarios: m.scen.slice(), owner: m.owner, priority: m.priority || 'P2',
    initial: Number(m.initial) || 0, recurring: Number(m.recurring) || 0, start: today().slice(0, 7), end: '', success: m.kri || '', dependencies: m.deps || '',
    type: m.fn + ' · ' + horizon + ' · measure ' + m.id };
  const idx = I.findIndex(a => a[0] === o.id);
  if (idx >= 0) I[idx] = initArr(o); else I.push(initArr(o));
  m.initId = o.id;
  return o.id;
}

/* ---------------- in-app proposals (transparent rules) ---------------- */
const KW = [
  [/phish|credential|password|account takeover|identity|login|authentication/i, ['mfa', 'aware', 'iam']],
  [/ransom|encrypt(ed|ion) for impact|extortion|wiper|destructive/i, ['backup', 'edr', 'seg', 'ir']],
  [/privileg|admin|domain controller|active directory/i, ['pam', 'iam']],
  [/vulnerab|unpatched|cve-|exploit|public-facing|vpn|firewall|edge/i, ['vuln', 'harden', 'seg']],
  [/exfiltrat|disclosure|leak|breach|personal (health )?information|privacy|law 25|pipeda/i, ['dlp', 'crypto', 'privacy', 'siem']],
  [/supplier|vendor|third[- ]party|supply chain|outsourc/i, ['tprm']],
  [/cloud|saas|tenant|m365|azure|aws/i, ['cloud', 'mfa']],
  [/outage|availability|disrupt|downtime|denial of service|ddos|failure|disaster/i, ['bcp', 'backup', 'seg']],
  [/insider|employee|negligen|error|misconfig/i, ['iam', 'aware', 'harden']],
  [/web application|injection|api|portal|development|code/i, ['appsec', 'vuln']],
  [/medical device|iot|ot\b|connected equipment/i, ['seg', 'asset', 'harden']],
  [/e-?mail|attachment|malicious link/i, ['mail', 'aware']],
];
/** Capability tags suggested for a scenario, with the reasons (ATT&CK mitigations, keywords, damage profile). */
export function suggestTags(s) {
  const why = {};
  const add = (t, r) => { (why[t] ||= new Set()).add(r); };
  for (const tid of s.attack || []) for (const mid of tech(tid)?.mitigations || [])
    for (const [k, t] of Object.entries(TAGS)) if ((t.mits || []).includes(mid)) add(k, `ATT&CK ${tid} → ${mid} ${mitigation(mid)?.name || ''}`.trim());
  const text = [s.name, s.statement, s.threat_source, s.threat_event, s.assets, s.processes, (s.vulns || []).join(' '), s.narrative].join(' ');
  for (const [rx, tags] of KW) { const m = rx.exec(text); if (m) for (const t of tags) add(t, `keyword “${m[0]}”`); }
  const v = k => Number(s.params?.[k]?.v ?? s.params?.[k]);
  if (v('Dm') >= 0.7) { add('backup', 'maximum damage δm ≥ 0.70: impact reduction needed'); add('ir', 'maximum damage δm ≥ 0.70'); }
  if (v('Th') <= 0.4) { add('siem', 'resilience θ ≤ 0.40: detection and response gap'); add('ir', 'resilience θ ≤ 0.40'); }
  if ((s.cves || []).length) add('vuln', 'CVE linked to the scenario');
  return Object.entries(why).map(([tag, r]) => ({ tag, reasons: [...r] }))
    .sort((a, b) => b.reasons.length - a.reasons.length);
}
/** Proposed measures for a set of scenarios, merged across scenarios so shared controls appear once. */
export function propose(ids, ws = S.ws) {
  const f = sizeFactor(ws);
  const by = {};
  for (const id of ids) {
    const s = scen(id); if (!s) continue;
    for (const { tag, reasons } of suggestTags(s).slice(0, 6)) {
      const T = TEMPLATES[tag], G = TAGS[tag]; if (!T || !G) continue;
      const exists = (ws.measures || []).find(m => m.status !== 'rejected' && (m.tags || []).includes(tag));
      const p = by[tag] ||= { tag, name: T.name, owner: T.owner, initial: Math.round(T.initial * f / 1000) * 1000, recurring: Math.round(T.recurring * f / 1000) * 1000,
        months: T.months, rp: G.rp, ri: G.ri, fn: G.fn, scen: [], reasons: {}, exists: exists?.id || null,
        ctl: controls().filter(c => c.tags[0] === tag && ['ISO22', 'NIST-53', 'CIS81', 'CSF2'].includes(c.fw) && !c.enh).slice(0, 4).map(c => c.key) };
      p.scen.push(id); p.reasons[id] = reasons;
    }
  }
  return Object.values(by).sort((a, b) => b.scen.length - a.scen.length || (b.rp + b.ri) - (a.rp + a.ri));
}

/* ---------------- Claude round-trip ---------------- */
export const CLAUDE_SCHEMA = {
  schema: 'crg-measures/1',
  measures: [{ name: 'string', desc: 'string', fn: FN.join('|'), owner: 'string', initial: 'number (CAD, Year-1 one-time)', recurring: 'number (CAD per year)',
    months: 'number — time to benefit', effort: 'Low|Medium|High', conf: 'Low|Medium|High', controls: [{ fw: 'ISO22|NIST-53|CSF2|CIS81|USR-ISO13|USR-CSF11|USR-CIS71|ATTACK-M', id: 'e.g. 8.5, AC-02, PR.AA-03, CIS 6' }],
    scenarios: [{ id: 'S1', rp: '0–1 likelihood reduction', ri: '0–1 impact reduction', rationale: 'string' }], evidence: 'string', dependencies: 'string', kri: 'string' }],
};
export function claudePrompt(ids, ws = S.ws) {
  const R = compute(ws);
  const rows = R.rows.filter(r => ids.includes(r.id));
  const A = ws.assessment, o = ws.org;
  const lines = [
    '# CyberRiskGuardian — mitigation proposal request',
    '',
    'Act as a Senior Cybersecurity Risk Analyst (CyberRiskGuardian). Propose a realistic, proportionate set of mitigation measures for the scenarios below, balanced across governance, prevention, detection, response, recovery and resilience. Identify shared controls once (one measure, several scenarios) so the same investment is not counted twice.',
    '',
    'For every measure give: name, description, function, owner, indicative Year-1 one-time cost and annual recurring cost (CAD), months to benefit, effort, confidence, the catalogue controls it implements (framework + identifier), and for each scenario it addresses the expected likelihood reduction rp and impact reduction ri on a 0–1 scale with a short rationale. Costs and reductions are analytical estimates — validation required.',
    '',
    'Modelling convention (do not change it): the app combines measures per scenario as red_p = 1 − ∏(1 − rp), red_i = 1 − ∏(1 − ri), and the CyberRiskGuardian engine computes mitigated = estimated × red_p × red_i, residual = estimated − mitigated. A measure that reduces only likelihood (ri = 0) contributes nothing unless another measure on the same scenario reduces impact, so pair preventive and recovery/response measures where appropriate.',
    '',
    `## Organization (${ws.kind === 'example' || ws.kind === 'classroom' ? 'fictional case' : 'confidential — anonymize before sharing outside the organization'})`,
    `- Sector: ${o.sector || '—'} · Size: ${o.size || '—'} ${o.employees ? '(' + o.employees + ' staff)' : ''} · Region: ${o.region || '—'}`,
    `- Mission: ${o.mission || '—'}`, `- Critical systems: ${o.systems || '—'}`, `- Cloud: ${o.cloud || '—'}`, `- Obligations: ${(o.regulations || []).join('; ') || '—'}`,
    `- Existing controls / maturity: ${o.maturity || o.controls || '—'}`,
    `- Risk appetite: ${A.APPETITE} · Factor: ${A.FACTOR} · Currency: ${A.CURRENCY || 'CAD'} · Period: ${A.PERIOD || 'next 12 months'}`,
    '',
    '## Scenarios',
  ];
  for (const r of rows) {
    const s = r.s, p = k => (s.params[k]?.v ?? s.params[k]);
    lines.push('', `### ${s.id} — ${s.name}`, s.statement || '',
      `- Parameters: Pb(A) ${p('PbA')}, Pb(ψ,A) ${p('Pbx')}, δe ${p('De')}, δm ${p('Dm')}, θ ${p('Th')}, μ(E) ${p('Mu')}, CVSS ${r.cvss}`,
      `- Estimated ${Math.round(r.est)}, tolerated ${Math.round(r.tol)}, untreated ratio ${(r.est / r.tol).toFixed(2)}; current red_p ${s.red_p}, red_i ${s.red_i} → residual ratio ${r.ratio.toFixed(2)} (${r.cls})`,
      (s.attack || []).length ? `- ATT&CK: ${(s.attack || []).join(', ')}` : '', (s.cves || []).length ? `- CVEs: ${s.cves.join(', ')}` : '',
      s.assets ? `- Assets: ${s.assets}` : '', (s.controls || []).length ? `- Existing controls: ${s.controls.join('; ')}` : '');
  }
  const ex = (ws.measures || []).filter(m => m.status !== 'rejected');
  if (ex.length) { lines.push('', '## Measures already in the plan (do not duplicate; you may extend their scenario coverage)'); for (const m of ex) lines.push(`- ${m.id} ${m.name} — scenarios ${m.scen.join(', ')}, rp ${m.rp}, ri ${m.ri}, Year-1 ${(+m.initial || 0) + (+m.recurring || 0)}`); }
  lines.push('', '## Answer format', 'Reply with ONE fenced ```json block that follows this schema exactly (no comments), then any narrative you want:', '```json', JSON.stringify(CLAUDE_SCHEMA, null, 1), '```');
  return lines.filter(x => x !== '').join('\n').replace(/\n(#+ )/g, '\n\n$1');
}
/** Parse Claude's answer (or any crg-measures/1 JSON) into measures. Returns {measures, warnings}. */
export function parseClaude(text, ws = S.ws) {
  const warnings = [];
  let j = null;
  const blocks = [...String(text).matchAll(/```(?:json)?\s*([\s\S]*?)```/g)].map(m => m[1]);
  for (const b of [...blocks, text]) { try { j = JSON.parse(b); break; } catch { /* next */ } }
  if (!j) { const a = String(text).indexOf('{'), b = String(text).lastIndexOf('}'); if (a >= 0 && b > a) try { j = JSON.parse(String(text).slice(a, b + 1)); } catch { /* none */ } }
  if (!j) throw new Error('No JSON found — paste the whole answer, including the ```json block.');
  const list = Array.isArray(j) ? j : j.measures;
  if (!Array.isArray(list)) throw new Error('The JSON has no "measures" array.');
  const clamp = x => Math.max(0, Math.min(1, Number(x) || 0));
  const out = [];
  let nextN = 0; for (const m of ws.measures || []) { const x = /^MS-(\d+)$/.exec(m.id); if (x) nextN = Math.max(nextN, +x[1]); }
  for (const m of list) {
    const sc = (m.scenarios || []).filter(x => x && scen(x.id));
    const miss = (m.scenarios || []).filter(x => x && !scen(x.id)).map(x => x.id);
    if (miss.length) warnings.push(`${m.name}: unknown scenario(s) ${miss.join(', ')} ignored`);
    if (!sc.length) { warnings.push(`${m.name || '(unnamed)'}: no known scenario — skipped`); continue; }
    const ctl = (m.controls || []).map(c => (c.fw || '') + ':' + (c.id || '')).filter(k => { if (!control(k)) { warnings.push(`${m.name}: control ${k} not in the catalogue — kept as text`); return false; } return true; });
    const eff = {}; for (const x of sc) eff[x.id] = { rp: clamp(x.rp), ri: clamp(x.ri), rationale: x.rationale || '' };
    const avg = k => sc.reduce((t, x) => t + clamp(x[k]), 0) / sc.length;
    out.push(blankMeasure({ id: 'MS-' + String(++nextN).padStart(2, '0'), name: m.name || 'Measure', desc: m.desc || '', fn: FN.includes(m.fn) ? m.fn : 'Prevention', owner: m.owner || '',
      initial: Number(m.initial) || 0, recurring: Number(m.recurring) || 0, months: Number(m.months) || 3, effort: m.effort || 'Medium', conf: CONF.includes(m.conf) ? m.conf : 'Low',
      ctl, ctlText: (m.controls || []).map(c => (c.fw || '') + ' ' + (c.id || '')).join(', '), tags: [...new Set(ctl.flatMap(k => control(k)?.tags?.slice(0, 1) || []))],
      scen: sc.map(x => x.id), eff, rp: +avg('rp').toFixed(2), ri: +avg('ri').toFixed(2), source: 'claude', evidence: m.evidence || '', deps: m.dependencies || '', kri: m.kri || '',
      rationale: 'Proposed by Claude — analytical estimate, validation required.' }));
  }
  return { measures: out, warnings };
}
export const newId = uid;
export { INIT_COLS, initiatives };
