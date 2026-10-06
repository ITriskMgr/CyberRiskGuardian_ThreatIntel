/* Batch scenarios — build many candidate scenarios at once from threat patterns × assets, a pasted
   CSV, or blank rows; review them in a grid; add the selected ones to the register.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, card, banner, field, select, toast, go, parseCSV, toCSV, download, today, chip } from '../util.js';
import { S, touch, nextScenarioId, blankScenario, PARAMS, PARAM_LABEL } from '../state.js';
import { THREAT_SOURCES, CONSEQUENCES, techName, tech, cwe as cweInfo, searchTech, searchCwe, techniquesForCwe, TACTICS, KB, parents, subtechniques } from '../ontology.js';
import { classify as ladder } from '../../threat.js';
import { linkEditor } from '../picker.js';
import { criticality } from '../assets.js';
import * as aiui from '../aiui.js';
import * as X from '../extractor.js';
import * as AI from '../ai.js';
import { spread, coverage, newSeed } from '../variety.js';
import * as MT from '../maturity.js';
import { tr } from '../i18n.js';

/** Scenario archetypes: a starting point, not an assessment. Every value is an analytical estimate. */
export const PATTERNS = [
  { key: 'phish', name: 'Credential phishing and MFA bypass', src: 'cybercrime', weak: 'push-based MFA without phishing resistance and limited conditional access', attack: ['T1566.002', 'T1621', 'T1078'], cwe: ['CWE-308', 'CWE-287'], cons: 0, p: [0.8, 0.5, 0.5, 0.8, 0.45, 0.8], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:N/SC:H/SI:L/SA:L' },
  { key: 'ransom', name: 'Ransomware with data exfiltration', src: 'ransomware', weak: 'flat network, standing administrative privileges and reachable backups', attack: ['T1566.001', 'T1021.001', 'T1486', 'T1490', 'T1567'], cwe: ['CWE-269'], cons: 1, p: [0.7, 0.5, 0.7, 0.95, 0.35, 0.9], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H' },
  { key: 'edge', name: 'Exploitation of an unpatched internet-facing system', src: 'opportunistic', weak: 'unpatched or end-of-life internet-facing software', attack: ['T1190', 'T1133'], cwe: ['CWE-1395'], cons: 1, p: [0.7, 0.45, 0.55, 0.85, 0.4, 0.8], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N' },
  { key: 'brute', name: 'Credential stuffing against exposed administrative interfaces', src: 'opportunistic', weak: 'exposed administrative interfaces without MFA or rate limiting', attack: ['T1110.004', 'T1133'], cwe: ['CWE-307', 'CWE-521'], cons: 0, p: [0.75, 0.4, 0.5, 0.8, 0.45, 0.75], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:L/SC:N/SI:N/SA:N' },
  { key: 'cloud', name: 'Misconfigured cloud storage exposes data', src: 'opportunistic', weak: 'publicly accessible or weakly authenticated cloud storage', attack: ['T1530', 'T1567.002'], cwe: ['CWE-732', 'CWE-284'], cons: 0, p: [0.6, 0.45, 0.55, 0.8, 0.45, 0.75], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N' },
  { key: 'token', name: 'Cloud tenant takeover through token theft or consent phishing', src: 'cybercrime', weak: 'unrestricted application consent and long-lived session tokens', attack: ['T1528', 'T1550.001', 'T1098.003'], cwe: ['CWE-284'], cons: 0, p: [0.6, 0.4, 0.6, 0.9, 0.4, 0.85], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:H/SC:H/SI:H/SA:L' },
  { key: 'insider', name: 'Insider misuse of legitimate access to extract data', src: 'insider-mal', weak: 'excessive access rights and limited monitoring of bulk queries', attack: ['T1078', 'T1213', 'T1048'], cwe: ['CWE-269', 'CWE-250'], cons: 0, p: [0.5, 0.5, 0.5, 0.8, 0.45, 0.85], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N' },
  { key: 'error', name: 'Accidental disclosure by staff', src: 'insider-err', weak: 'no data-loss prevention and unclear handling rules', attack: ['T1567'], cwe: ['CWE-200'], cons: 0, p: [0.8, 0.45, 0.35, 0.6, 0.5, 0.6], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:P/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N' },
  { key: 'supplier', name: 'Compromise of a supplier with remote access', src: 'supplier', weak: 'unbrokered, unmonitored vendor remote access', attack: ['T1199', 'T1133', 'T1078'], cwe: ['CWE-284'], cons: 1, p: [0.5, 0.45, 0.6, 0.9, 0.4, 0.85], cvss: 'CVSS:4.0/AV:N/AC:H/AT:N/PR:L/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H' },
  { key: 'update', name: 'Trojanized software update from a supplier', src: 'nation', weak: 'no integrity verification or staged rollout of updates', attack: ['T1195.002', 'T1072'], cwe: ['CWE-494'], cons: 1, p: [0.3, 0.4, 0.6, 0.95, 0.35, 0.85], cvss: 'CVSS:4.0/AV:N/AC:H/AT:P/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H' },
  { key: 'bec', name: 'Business e-mail compromise diverts payments', src: 'cybercrime', weak: 'payment changes approved by e-mail without call-back verification', attack: ['T1566.002', 'T1114.002', 'T1684.001'], cwe: ['CWE-290'], cons: 3, p: [0.75, 0.4, 0.45, 0.75, 0.5, 0.65], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:L/VI:H/VA:N/SC:N/SI:N/SA:N' },
  { key: 'ddos', name: 'Denial of service on online services', src: 'hacktivist', weak: 'no upstream DDoS protection for public services', attack: ['T1498', 'T1499'], cwe: ['CWE-400'], cons: 1, p: [0.55, 0.45, 0.35, 0.65, 0.5, 0.6], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:L' },
  { key: 'backup', name: 'Backups destroyed, preventing recovery', src: 'ransomware', weak: 'backups in the production identity domain, not immutable', attack: ['T1490', 'T1485'], cwe: ['CWE-732'], cons: 2, p: [0.5, 0.5, 0.6, 0.9, 0.35, 0.9], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:H' },
  { key: 'web', name: 'Web application flaw exposes records', src: 'opportunistic', weak: 'insufficient authorization checks and input validation', attack: ['T1190'], cwe: ['CWE-639', 'CWE-89'], cons: 0, p: [0.6, 0.4, 0.5, 0.8, 0.45, 0.7], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:L/VA:N/SC:N/SI:N/SA:N' },
  { key: 'secret', name: 'Exposed API key or secret enables data access', src: 'opportunistic', weak: 'secrets in code, logs or configuration without rotation', attack: ['T1552.001', 'T1530'], cwe: ['CWE-798'], cons: 0, p: [0.55, 0.45, 0.5, 0.8, 0.45, 0.7], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N' },
  { key: 'device', name: 'Lost or stolen device exposes data', src: 'insider-err', weak: 'unencrypted or unmanaged portable devices', attack: ['T1005'], cwe: ['CWE-311'], cons: 0, p: [0.7, 0.35, 0.3, 0.6, 0.55, 0.5], cvss: 'CVSS:4.0/AV:P/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N' },
  { key: 'sabotage', name: 'Malicious administrator sabotages systems', src: 'insider-mal', weak: 'standing privileged access without separation of duties', attack: ['T1078', 'T1485', 'T1489'], cwe: ['CWE-269'], cons: 1, p: [0.3, 0.5, 0.6, 0.95, 0.35, 0.9], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:H/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:H' },
  { key: 'outage', name: 'Loss of a site, data centre or network link', src: 'environment', weak: 'single point of failure without tested failover', attack: [], cwe: [], cons: 1, p: [0.4, 0.5, 0.5, 0.85, 0.4, 0.85], cvss: 'CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:N/VI:N/VA:H/SC:N/SI:N/SA:H', note: 'Limited CVSS applicability: representative weakness is a single point of failure.' },
];

const srcLabel = id => THREAT_SOURCES.find(t => t.id === id)?.label || id;
let mode = 'gen';
const sel = { patterns: new Set(['phish', 'ransom', 'edge']), sources: 'pattern', assets: new Set(), extraAsset: '', custom: [], n: 10 };

/* 1.5.5 — the candidates are chosen for variety as well as rank. The seed and the choice live with
   the workspace, not with this module, so they survive a reload and travel in an export: a set of
   candidates cited in a report can be re-derived later. */
const seedOf = ws => (ws.batchSeed ||= newSeed());
const spreadOn = ws => ws.batchSpread !== false;

function draft() { return (S.ws.batchDraft ||= []); }

function makeRow(p, asset, src) {
  const consq = CONSEQUENCES[p.cons] || CONSEQUENCES[0];
  return {
    pick: true, name: `${p.name} — ${asset}`,
    statement: `A ${srcLabel(src).toLowerCase()} ${p.attack.length ? 'uses ' + p.attack.slice(0, 3).map(t => techName(t).toLowerCase()).join(', ') : 'event'}, exploiting ${p.weak}, to affect ${asset}, resulting in ${consq}.`,
    threat_source: srcLabel(src), assets: asset, vulns: p.weak, attack: p.attack.slice(), cwe: p.cwe.slice(),
    params: Object.fromEntries(PARAMS.map((k, i) => [k, p.p[i]])), cvss: p.cvss, cvss_score: p.cvss_score ?? null, cvss_note: p.note || '', red_p: 0.6, red_i: 0.6, owner: '', pattern: p.key,
    cves: (p.cves || []).slice(), rat: p.rat || {},
  };
}

export function render(sec) {
  const ws = S.ws;
  sec.replaceChildren(el('h1', null, 'Batch scenarios'),
    el('p', 'lede', 'Create a batch of candidate scenarios in one pass, review and edit them in the grid, then add the selected ones to the register. Generated values are starting points — every one is an analytical estimate requiring validation.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['gen', 'Threat patterns × assets'], ['ai', 'Propose with AI'], ['attack', 'From MITRE ATT&CK'], ['cve', 'From CVE'], ['cwe', 'From CWE'], ['csv', 'Paste or import CSV'], ['blank', 'Blank rows']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(mode === k), onclick: () => { mode = k; render(sec); } }, t));
  sec.append(st);
  const top = el('div'); sec.append(top);
  const grid = el('div'); sec.append(grid);
  const drawGrid = () => renderGrid(grid, drawGrid);
  if (mode === 'gen') generator(top, drawGrid);
  else if (mode === 'ai') aiProposer(top, drawGrid);
  else if (mode === 'attack' || mode === 'cve' || mode === 'cwe') ontoBuilder(top, drawGrid, mode);
  else if (mode === 'csv') csv(top, drawGrid);
  else top.append(card(el('div', 'btnrow', ...[1, 5, 10, 20].map(n => el('button', { class: 'btn ghost', onclick: () => { for (let i = 0; i < n; i++) draft().push(makeRow({ name: 'New scenario', weak: '', attack: [], cwe: [], p: [0.5, 0.5, 0.5, 0.7, 0.5, 0.5], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N', cons: 0 }, 'asset', 'cybercrime')); draft().slice(-n).forEach(r => { r.name = ''; r.statement = ''; r.assets = ''; r.threat_source = ''; }); touch(); drawGrid(); } }, `Add ${n} blank row${n > 1 ? 's' : ''}`)))));
  drawGrid();
}

function generator(top, drawGrid) {
  const ws = S.ws;
  const pBox = el('div', 'grid g2');
  for (const p of PATTERNS) {
    const c = el('input', { type: 'checkbox', checked: sel.patterns.has(p.key) });
    c.addEventListener('change', () => { c.checked ? sel.patterns.add(p.key) : sel.patterns.delete(p.key); count(); });
    pBox.append(el('label', { style: { display: 'flex', gap: '8px', color: 'var(--ink)', fontSize: '13px', alignItems: 'flex-start' } }, c,
      el('span', null, p.name, el('div', 'small muted', p.attack.join(' · ') || 'non-adversarial'))));
  }
  const customEd = linkEditor(sel.custom, 'attack', count, { empty: 'Optional: add any other ATT&CK technique as its own pattern' });

  // 1.5.2 — assets come from the crown jewels AND the Information assets inventory (critical first).
  const crown = (ws.assessment.CROWN || []).map(r => r[1]).filter(Boolean);
  const inv = (ws.assets || []).filter(a => a.name && a.lifecycle?.stage !== 'disposed')
    .map(a => ({ name: a.name, c: criticality(a, ws) })).sort((x, y) => y.c.score - x.c.score);
  const weight = {};
  for (const c of crown) weight[c] = 1;
  for (const a of inv) weight[a.name] = Math.max(weight[a.name] || 0, a.c.score / 100);
  const aBox = el('div');
  const chipFor = (a, sub) => {
    const c = el('input', { type: 'checkbox', checked: sel.assets.has(a) });
    c.addEventListener('change', () => { c.checked ? sel.assets.add(a) : sel.assets.delete(a); count(); });
    return el('label', { class: 'chip', style: { cursor: 'pointer' }, title: sub || '' }, c, a);
  };
  const others = [...sel.assets].filter(a => !crown.includes(a) && !inv.some(x => x.name === a));
  if (!crown.length && !inv.length && !others.length) aBox.append(el('span', 'small muted', 'No crown jewels or information assets yet — add assets below, under Organization → Crown jewels, or in Information assets.'));
  if (crown.length) aBox.append(el('div', 'small muted', { style: { margin: '2px 0 4px' } }, 'Crown jewels'), el('div', 'chips', ...crown.map(a => chipFor(a, 'Crown jewel'))));
  const invOnly = inv.filter(a => !crown.includes(a.name));
  if (invOnly.length) aBox.append(el('div', 'small muted', { style: { margin: '8px 0 4px' } }, 'Information assets (most critical first)'), el('div', 'chips', ...invOnly.map(a => chipFor(a.name, `${a.c.tier} · criticality ${a.c.score}`))));
  if (others.length) aBox.append(el('div', 'small muted', { style: { margin: '8px 0 4px' } }, 'Added here'), el('div', 'chips', ...others.map(a => chipFor(a))));
  if (crown.length + invOnly.length) aBox.append(el('div', 'btnrow', { style: { marginTop: '6px' } },
    el('button', { class: 'btn sm ghost', onclick: () => { for (const a of [...crown, ...invOnly.slice(0, 5).map(x => x.name)]) sel.assets.add(a); top.replaceChildren(); generator(top, drawGrid); } }, 'Tick crown jewels + 5 most critical'),
    el('button', { class: 'btn sm ghost', onclick: () => { sel.assets.clear(); top.replaceChildren(); generator(top, drawGrid); } }, 'Untick all')));
  const extra = el('input', { placeholder: 'Other asset or service — press Enter to add' });
  extra.addEventListener('keydown', e => { if (e.key === 'Enter' && extra.value.trim()) { sel.assets.add(extra.value.trim()); top.replaceChildren(); generator(top, drawGrid); } });
  const srcSel = select([['pattern', 'Typical source for each pattern'], ...THREAT_SOURCES.map(t => [t.id, 'All from: ' + t.label]), ['all', 'Every source × pattern (large)']], sel.sources);
  srcSel.addEventListener('change', () => { sel.sources = srcSel.value; count(); });
  const info = el('div', 'note');
  const combos = () => {
    const pats = PATTERNS.filter(p => sel.patterns.has(p.key)).concat(sel.custom.map(t => ({ key: 'custom-' + t, name: techName(t), src: 'cybercrime', weak: 'a weakness to be documented', attack: [t], cwe: [], cons: 0, p: [0.5, 0.5, 0.5, 0.8, 0.45, 0.7], cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N' })));
    const assets = [...sel.assets];
    const out = [];
    for (const p of pats) for (const a of (assets.length ? assets : ['the organization\'s critical systems'])) {
      const srcs = sel.sources === 'pattern' ? [p.src] : sel.sources === 'all' ? THREAT_SOURCES.filter(t => t.id !== 'environment' || p.key === 'outage').map(t => t.id) : [sel.sources];
      for (const s of srcs) out.push([p, a, s]);
    }
    // rank: pattern prior Pb(A)×Pb(ψ,A) × asset weight (crown jewel 1, inventory criticality/100, other 0.6) × source fit
    const rank = ([p, a, src]) => (p.p[0] * p.p[1]) * (weight[a] ?? 0.6) * (src === p.src ? 1 : 0.7);
    return out.map(x => ({ key: `${x[0].key}|${x[1]}|${x[2]}`, rank: rank(x), combo: x,
                           dims: { pattern: x[0].key, asset: x[1], source: x[2] } }))
      .sort((u, v) => v.rank - u.rank || (u.key < v.key ? -1 : 1));
  };
  const nIn = el('input', { type: 'number', min: 1, max: 500, step: 1, value: sel.n, style: { width: '90px' }, 'aria-label': 'Number of candidates' });
  nIn.addEventListener('input', () => { sel.n = Math.max(1, Math.min(500, Math.round(+nIn.value || 10))); count(); });
  const spreadCb = el('input', { type: 'checkbox', checked: spreadOn(ws), style: { width: 'auto' } });
  spreadCb.addEventListener('change', () => { ws.batchSpread = spreadCb.checked; touch(); count(); });
  const seedOut = el('span', 'mono', String(seedOf(ws)));
  const spreadRow = el('div', { style: { marginTop: '8px' } },
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)' } }, spreadCb,
      el('span', null, el('b', null, 'Vary the patterns and assets'),
        el('div', 'small muted', 'On: the candidates are spread over the patterns and assets you ticked, still preferring the more likely ones \u2014 so twenty candidates are twenty different situations and not one threat applied twenty times. Off: strictly the highest-ranked combinations.'))),
    el('div', 'small muted', { style: { marginTop: '4px' } }, 'Seed ', seedOut,
      ' \u2014 the same seed reproduces the same candidates, so a set can be cited and re-derived. \u201cReshuffle\u201d draws a new one.'));
  /* Ranking alone gives a list with no variety: the pattern prior is identical for every asset and
     crown jewels all weigh 1.0, so the strongest pattern ties with itself across the inventory and
     fills the slots. spread() still prefers the highest-ranked combinations but walks across the grid
     instead of down one column. Unticking it restores the pure ranking. */
  const chosen = () => spreadOn(ws) ? spread(combos(), sel.n, seedOf(ws)) : combos().slice(0, sel.n);
  const take = () => chosen().map(x => x.combo);
  function count() {
    const all = combos(), n = all.length, picked = chosen(), k = picked.length;
    const c = coverage(picked);
    const how = !spreadOn(ws) ? ', the highest-ranked first (pattern likelihood × asset criticality × source fit).'
      : n > sel.n ? ', spread over the grid rather than taken from the top of one column.' : '.';
    info.replaceChildren(el('div', null, `${n} combination${n === 1 ? '' : 's'} possible — ${k} candidate${k === 1 ? '' : 's'} will be generated` + how),
      k ? el('div', 'small muted', { style: { marginTop: '3px' } },
        `Covering ${c.patterns} pattern${c.patterns === 1 ? '' : 's'} and ${c.assets} asset${c.assets === 1 ? '' : 's'}` +
        (c.sources > 1 ? ` and ${c.sources} threat sources` : '') +
        `; the most frequent pattern is ${Math.round(c.topPatternShare * 100)}% of the set.`) : null,
      k > 80 ? el('div', 'small muted', 'That is a lot: the methodology suggests about 20 candidates, then the 10 most material — and more as the organization\u2019s maturity grows.') : null);
  }
  count();
  top.append(el('div', 'cols2',
    card(el('h2', null, '1 · Threat patterns'), pBox, el('hr', 'sep'), el('label', null, el('b', null, 'Custom ATT&CK techniques')), customEd),
    el('div', null,
      card(el('h2', null, '2 · Assets and services'), aBox, el('div', { style: { marginTop: '10px' } }, extra)),
      card(el('h2', null, '3 · Threat sources'), srcSel,
        el('div', 'row', { style: { marginTop: '10px', alignItems: 'center' } }, el('label', { style: { margin: 0 } }, el('b', null, 'Number of candidates')), nIn,
          ...[10, 20, 30, 50].map(v => el('button', { class: 'btn sm ghost', onclick: () => { sel.n = v; nIn.value = v; count(); } }, String(v))),
          // 1.5.5 — the number this organization should carry, from the maturity it measured.
          (() => { const g = MT.scenarioGuidance(ws);
            return el('button', { class: 'btn sm', title: g.why,
              onclick: () => { sel.n = g.n; nIn.value = g.n; count(); toast(g.measured ? `${g.n} — from the measured maturity ${g.level} of 5` : `${g.n} — the starting number; assess the maturity and this follows it`); } },
              g.measured ? `${g.n} (measured maturity)` : `${g.n} (to begin with)`); })()),
        spreadRow, info,
        el('div', 'btnrow', { style: { marginTop: '12px' } },
          el('button', { class: 'btn', onclick: () => { const c = take(); for (const [p, a, s] of c) draft().push(makeRow(p, a, s)); touch(); drawGrid(); toast(c.length + ' candidates added to the grid'); } }, 'Generate candidates'),
          el('button', { class: 'btn ghost', onclick: () => { ws.batchSeed = newSeed(); touch(); seedOut.textContent = String(ws.batchSeed); count(); toast('A different set of candidates — seed ' + ws.batchSeed); } }, 'Reshuffle'))))));
}

/* ---------------- 1.5.2 — candidates proposed by AI ---------------- */
const aiSel = { n: 10, brief: '', useAssets: true, docs: true };
function aiProposer(top, drawGrid) {
  const ws = S.ws;
  const nIn = el('input', { type: 'number', min: 1, max: 30, value: aiSel.n, style: { width: '90px' } });
  nIn.addEventListener('input', () => { aiSel.n = Math.max(1, Math.min(30, Math.round(+nIn.value || 10))); });
  const brief = el('textarea', { rows: 3, placeholder: 'Optional direction — e.g. focus on suppliers, a new telehealth service, insider risk, the clinics network' });
  brief.value = aiSel.brief; brief.addEventListener('input', () => { aiSel.brief = brief.value; });
  const docsBox = el('input', { type: 'checkbox', checked: aiSel.docs && (ws.docs || []).length > 0, disabled: !(ws.docs || []).length, style: { width: 'auto' } });
  docsBox.addEventListener('change', () => { aiSel.docs = docsBox.checked; });
  const st = el('div');
  aiui.status(S.ws, 'scenarios').then(x => st.replaceChildren(x.ok ? el('p', 'note', tr('AI is available') + ' — ' + (AI.isLocal(x.provider) ? tr('local model') : AI.provider(x.provider).label) + '. ' + tr('You will see exactly what is sent before anything leaves this computer.'))
    : banner('warn', 'AI not available', x.why)));
  const crown = (ws.assessment.CROWN || []).map(r => r[1]).filter(Boolean);
  const inv = (ws.assets || []).map(a => ({ n: a.name, c: criticality(a, ws).score })).sort((x, y) => y.c - x.c).slice(0, 15).map(x => x.n);
  top.append(card(el('h2', null, 'Propose candidate scenarios with AI'),
    el('p', 'note', 'AI proposes candidate scenarios relevant to this case — complete causal chains with the six parameters, a reason and a confidence for each — from the organization profile, the crown jewels and information assets, and the scenarios already in the register (which it does not repeat). They land in the grid below, marked AI-generated and unreviewed; nothing enters the register until you add it. Analytical estimate — validation required.'),
    st,
    el('div', 'grid g3', field('<b>Number of candidates</b> (1–30)', nIn, 'The methodology suggests about 20 candidates, then the 10 most material.'),
      el('div', { style: { gridColumn: 'span 2' } }, field('Direction (optional)', brief))),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)', margin: '8px 0' } }, docsBox, el('span', null, el('b', null, 'Include the text of the context documents'),
      el('div', 'small muted', (ws.docs || []).length ? `${ws.docs.length} ${tr('document(s) — the full extracted text, shown in the preview (large documents are shortened).')}` : tr('No context document in this workspace.')))),
    crown.length + inv.length ? el('div', 'small muted', { style: { margin: '6px 0' } }, tr('Assets given to the AI:') + ' ', el('span', { 'data-noi18n': '' }, [...new Set([...crown, ...inv])].slice(0, 20).join(' · '))) : null,
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn', onclick: async () => {
      const x = await aiui.status(S.ws, 'scenarios'); if (!x.ok) { toast(x.why, 'bad'); return; }
      const assets = [...new Set([...crown, ...inv])].slice(0, 20);
      const b = [aiSel.brief, assets.length ? 'Crown jewels and most critical information assets: ' + assets.join('; ') : ''].filter(Boolean).join('\n');
      const docs = aiSel.docs && (ws.docs || []).length ? (await X.corpus(ws, 80000)).text : '';
      const out = await aiui.request('scenarios', { brief: b, count: aiSel.n, docs }, { title: tr('Scenario proposals — what will be sent') });
      if (!out) return;
      let parsed;
      try { parsed = AI.parseJson(out.text); } catch (e) { toast(tr('The answer was not machine-readable: ') + e.message, 'bad'); return; }
      const list = parsed.scenarios || [];
      const cl = v => Math.max(0.01, Math.min(1, Number(v) || 0.5));
      for (const sc of list) {
        const P = sc.params || {};
        draft().push({ pick: true, ai: true, name: (sc.name || 'AI candidate') + ' [AI]', statement: sc.statement || '', threat_source: sc.threat_source || '', assets: sc.asset || '',
          vulns: sc.vulnerability || '', attack: Array.isArray(sc.attack) ? sc.attack.filter(t => /^T\d{4}/.test(t)) : [], cwe: [], cves: [],
          params: Object.fromEntries(PARAMS.map(k => [k, cl(P[k]?.v)])), cvss: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N', cvss_score: null,
          cvss_note: 'Default vector for an AI-proposed candidate — set the vector in the scenario editor.', red_p: 0.6, red_i: 0.6, owner: '', pattern: 'ai',
          rat: Object.fromEntries(PARAMS.map(k => [k, (P[k]?.why ? 'AI: ' + P[k].why : 'AI-proposed') + ' — analytical estimate, validation required.'])),
          conf: Object.fromEntries(PARAMS.map(k => [k, ['High', 'Medium', 'Low'].includes(P[k]?.conf) ? P[k].conf : 'Low'])) });
      }
      AI.decide(out.entryId, 'pending', `${list.length} candidate(s) placed in the batch grid for review`);
      touch(); drawGrid(); toast(list.length + ' ' + tr('AI candidates added to the grid — review them before adding to the register'));
    } }, 'Propose candidates'))));
}

const CSV_COLS = ['name', 'statement', 'threat_source', 'assets', 'vulns', 'attack', 'cwe', 'cves', 'PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu', 'cvss', 'red_p', 'red_i', 'owner', 'horizon'];
function csv(top, drawGrid) {
  const ta = el('textarea', { class: 'code', rows: 8, placeholder: CSV_COLS.join(',') + '\n"Phishing of finance staff","A cybercriminal…","Cybercriminal","ERP","No MFA","T1566.002;T1078","CWE-308","",0.8,0.5,0.5,0.8,0.45,0.7,"CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N",0.7,0.6,"CFO","0-6 months"' });
  const fileIn = el('input', { type: 'file', accept: '.csv,.tsv,.txt', style: { display: 'none' } });
  fileIn.addEventListener('change', async () => { ta.value = await fileIn.files[0].text(); });
  const msg = el('div');
  top.append(card(el('p', 'note', 'First row = column names. Recognized columns: ' + CSV_COLS.join(', ') + '. Lists (attack, cwe, cves, vulns) use ";" separators. Missing parameters default to 0.5 and are flagged.'),
    ta, el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', onclick: () => {
        const rows = parseCSV(ta.value); if (rows.length < 2) { msg.replaceChildren(banner('warn', 'Nothing to import', 'Paste a header row and at least one scenario row.')); return; }
        const h = rows[0].map(x => x.trim().toLowerCase());
        const ix = k => h.indexOf(k.toLowerCase());
        let n = 0;
        for (const r of rows.slice(1)) {
          const g = k => ix(k) >= 0 ? (r[ix(k)] || '').trim() : '';
          const list = k => g(k).split(/[;|]/).map(x => x.trim()).filter(Boolean);
          const num = (k, d) => { const v = parseFloat(g(k)); return Number.isFinite(v) ? v : d; };
          draft().push({ pick: true, name: g('name'), statement: g('statement'), threat_source: g('threat_source'), assets: g('assets'), vulns: list('vulns').join('; '),
            attack: list('attack'), cwe: list('cwe').map(x => /^\d+$/.test(x) ? 'CWE-' + x : x.toUpperCase()), cves: list('cves').map(x => x.toUpperCase()),
            params: Object.fromEntries(PARAMS.map(k => [k, num(k, 0.5)])), cvss: g('cvss'), cvss_score: /^CVSS/i.test(g('cvss')) ? null : (parseFloat(g('cvss')) || null),
            red_p: num('red_p', 0.5), red_i: num('red_i', 0.5), owner: g('owner'), horizon: g('horizon'), pattern: 'csv' });
          n++;
        }
        touch(); drawGrid(); msg.replaceChildren(banner('good', n + ' rows added to the grid', 'Review them below before adding to the register.'));
      } }, 'Parse into grid'),
      el('button', { class: 'btn ghost', onclick: () => fileIn.click() }, 'Open CSV file…'), fileIn,
      el('button', { class: 'btn ghost', onclick: () => download('crg-batch-template.csv', toCSV([CSV_COLS])) }, 'Download template')), msg));
}

function renderGrid(box, redraw) {
  const rows = draft();
  box.replaceChildren();
  if (!rows.length) return;
  const all = el('input', { type: 'checkbox', checked: rows.every(r => r.pick), title: 'Select all' });
  all.addEventListener('change', () => { rows.forEach(r => { r.pick = all.checked; }); touch(); redraw(); });
  const t = el('table', 'grid compact');
  t.append(el('thead', null, el('tr', null, el('th', 'cb', all), ...['Name / statement', 'Source · asset', 'ATT&CK · CWE', ...PARAMS.map(k => PARAM_LABEL[k]), 'CVSS vector or score', 'P red', 'I red', ''].map(h => el('th', null, h)))));
  const tb = el('tbody');
  rows.forEach((r, i) => {
    const inp = (k, w, obj = r, num) => { const n = el('input', { value: obj[k] ?? '', style: { width: w }, type: num ? 'number' : 'text', step: num ? 0.05 : null, min: num ? 0 : null, max: num ? 1 : null });
      n.addEventListener('input', () => { obj[k] = num ? Number(n.value) : n.value; touch(); }); return n; };
    const ta = (k) => { const n = el('textarea', { rows: 2, style: { width: '300px' } }); n.value = r[k] || ''; n.addEventListener('input', () => { r[k] = n.value; touch(); }); return n; };
    const pk = el('input', { type: 'checkbox', checked: r.pick }); pk.addEventListener('change', () => { r.pick = pk.checked; touch(); });
    const cv = el('input', { value: r.cvss || (r.cvss_score ?? ''), class: 'mono', style: { width: '170px' } });
    cv.addEventListener('input', () => { if (/^CVSS:4/i.test(cv.value)) { r.cvss = cv.value; r.cvss_score = null; } else { r.cvss = ''; r.cvss_score = cv.value === '' ? null : Number(cv.value); } touch(); });
    const links = el('div', 'chips', ...(r.attack || []).map(x => chip(x, { kind: 't', title: techName(x) })), ...(r.cwe || []).map(x => chip(x, { kind: 'c' })), ...(r.cves || []).map(x => chip(x, { kind: 'v' })));
    tb.append(el('tr', r.pick ? null : 'off', el('td', 'cb', pk),
      el('td', null, inp('name', '300px'), ta('statement')),
      el('td', null, inp('threat_source', '170px'), inp('assets', '170px')),
      el('td', { style: { maxWidth: '200px' } }, links),
      ...PARAMS.map(k => el('td', null, inp(k, '62px', r.params, true))),
      el('td', null, cv), el('td', null, inp('red_p', '62px', r, true)), el('td', null, inp('red_i', '62px', r, true)),
      el('td', null, el('button', { class: 'btn sm ghost danger', onclick: () => { rows.splice(i, 1); touch(); redraw(); } }, '×'))));
  });
  t.append(tb);
  const picked = rows.filter(r => r.pick);
  box.append(card(el('h2', null, `Review grid — ${rows.length} candidates, ${picked.length} selected`),
    el('div', 'tablewrap', t),
    el('div', 'btnrow', { style: { marginTop: '12px' } },
      el('button', { class: 'btn', disabled: !picked.length, onclick: () => commit(redraw) }, `Add ${picked.length} selected to the register`),
      el('button', { class: 'btn ghost', onclick: () => { S.ws.batchDraft = rows.filter(r => !r.pick); touch(); redraw(); } }, 'Discard selected'),
      el('button', { class: 'btn ghost danger', onclick: () => { if (window.confirm('Clear the whole grid?')) { S.ws.batchDraft = []; touch(); redraw(); } } }, 'Clear grid')),
    el('p', 'note', 'Tip: the methodology recommends generating about 20 candidates, then selecting the 10 most material for detailed analysis. Avoid duplicates and overly generic scenarios.')));
}

function commit(redraw) {
  const a = S.ws.assessment, rows = draft(), keep = [], added = [];
  for (const r of rows) {
    if (!r.pick) { keep.push(r); continue; }
    const s = blankScenario(nextScenarioId());
    Object.assign(s, { name: r.name || 'Untitled scenario', statement: r.statement || '', threat_source: r.threat_source || '', assets: r.assets || '',
      vulns: String(r.vulns || '').split(/;\s*/).filter(Boolean), attack: r.attack || [], cwe: r.cwe || [], cves: r.cves || [],
      red_p: Number(r.red_p), red_i: Number(r.red_i), owner: r.owner || '', horizon: r.horizon || '', cvss_note: r.cvss_note || '', origin: (r.docs ? 'From the context documents (reviewed in batch) ' : r.ai ? 'AI-generated (reviewed in batch) ' : 'batch ') + today() });
    for (const k of PARAMS) s.params[k] = { v: Number(r.params[k]), qual: '', rat: (r.rat && r.rat[k]) || 'Batch default — analytical estimate, validation required.', ev: (r.rat && r.rat[k + '_ev']) || '', conf: (r.conf && r.conf[k]) || 'Low' };
    if (r.cvss) s.cvss = r.cvss; else if (r.cvss_score !== null && r.cvss_score !== undefined && r.cvss_score !== '') { s.cvss_score = Number(r.cvss_score); }
    a.SCEN.push(s); added.push(s.id);
  }
  S.ws.batchDraft = keep; touch();
  toast(added.length + ' scenarios added: ' + added[0] + '–' + added[added.length - 1]);
  redraw();
  go('register');
}


/* ---------------- from ATT&CK, CVE or CWE ---------------- */
const pick = { attack: new Set(), cve: new Set(), cwe: new Set(), tactic: 'all', q: { attack: '', cve: '', cwe: '' }, cveFilter: 'all', ownAsset: true, src: 'auto', assets: new Set() };
const VEC = {
  impact: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:H/VA:H/SC:N/SI:N/SA:H',
  access: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N',
  data: 'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N',
};
function fromTechnique(id) {
  const t = tech(id), tac = t.tactics;
  const isImpact = tac.includes('impact'), isData = tac.some(x => ['exfiltration', 'collection'].includes(x));
  const c0 = t.cwe.map(cweInfo).filter(Boolean)[0];
  const pba = Math.min(0.85, 0.35 + 0.015 * t.groups);
  return { key: 'attack-' + id, name: t.fullName, src: isImpact ? 'ransomware' : 'cybercrime', weak: c0 ? c0.name.toLowerCase() : 'a weakness to be documented',
    attack: [id], cwe: t.cwe.slice(0, 3), cons: isImpact ? 1 : 0, p: [+pba.toFixed(2), 0.45, 0.5, 0.8, 0.45, 0.75],
    cvss: isImpact ? VEC.impact : isData ? VEC.data : VEC.access,
    rat: { PbA: `Prior from ATT&CK prevalence: ${t.groups} tracked intrusion set(s) use ${id} — not organizational evidence. Analytical estimate — validation required.` } };
}
function fromCwe(id) {
  const c = cweInfo(id), techs = techniquesForCwe(id);
  return { key: 'cwe-' + id, name: c.name, src: 'opportunistic', weak: c.name.toLowerCase(), attack: techs.slice(0, 3), cwe: [id], cons: 0,
    p: [0.55, c.top25 ? 0.5 : 0.4, 0.5, 0.8, 0.45, 0.7], cvss: VEC.access,
    rat: { Pbx: c.top25 ? `${id} ranks #${c.top25} in the ${KB.meta.cwe.top25}. Analytical estimate — validation required.` : '' } };
}
function fromCve(v) {
  const cws = (v.cwe || []).filter(x => cweInfo(x));
  const techs = [...new Set(cws.flatMap(techniquesForCwe))].slice(0, 3);
  const r = S.snap ? ladder(v.id, S.snap, !!v.exposed) : null;
  const pbx = r && r.applies ? r.band[0] : 0.5;
  const prod = v.product || (v.title || '').split(/[.,;]/)[0].slice(0, 60) || 'an affected product';
  return { key: 'cve-' + v.id, name: `Exploitation of ${v.id} (${prod})`, src: 'opportunistic', weak: `${v.id} in ${prod}` + (cws[0] ? ` (${cweInfo(cws[0]).name})` : ''),
    attack: techs.length ? techs : ['T1190'], cwe: cws, cves: [v.id], cons: 0,
    p: [r && r.rung >= 4 ? 0.8 : 0.6, pbx, 0.55, 0.85, 0.45, 0.75],
    cvss: v.cvss_vector && /^CVSS:4/.test(v.cvss_vector) ? v.cvss_vector : (v.cvss != null ? '' : VEC.access), cvss_score: v.cvss_vector ? null : (v.cvss ?? null),
    note: v.cvss_vector ? 'CVSS v4.0 Base vector from NVD.' : v.cvss != null ? `CVSS ${v.cvss_version || ''} score from the register — rescore in v4.0 Base.` : 'Generic vector — rescore for this CVE.',
    rat: { Pbx: r ? `Threat Evidence Ladder rung ${r.rung} (${r.evidence}; snapshot ${S.snap.retrieved})${r.applies ? ' — band floor ' + r.band[0] : ' — exposure not confirmed, no uplift'}. Analytical estimate — validation required.` : 'No threat-context snapshot loaded. Analytical estimate — validation required.',
      Pbx_ev: r ? 'threat-context ' + S.snap.retrieved : '' },
    asset: v.asset || '' };
}

function ontoBuilder(top, drawGrid, kind) {
  const ws = S.ws;
  const listBox = el('div', 'scroll-y', { style: { maxHeight: '420px' } }), chosen = el('div', 'chips', { style: { margin: '8px 0' } });
  const info = el('div', 'note');
  const q = el('input', { value: pick.q[kind], placeholder: kind === 'attack' ? 'Search techniques — name or ID (e.g. ransomware, T1190)' : kind === 'cve' ? 'Search the register — CVE, product, asset' : 'Search CWE — ID or words (empty = Top 25)' });
  const items = () => {
    const s = pick.q[kind].trim();
    if (kind === 'attack') {
      let ids = s ? searchTech(s, 120) : parents().flatMap(p => [p, ...subtechniques(p)]);
      if (pick.tactic !== 'all') ids = ids.filter(id => tech(id).tactics.includes(pick.tactic));
      return ids.slice(0, 150).map(id => ({ id, label: tech(id).fullName, sub: `${tech(id).tactics.map(x => TACTICS.find(t => t.short === x)?.name || x).join(', ')} · ${tech(id).groups} groups` }));
    }
    if (kind === 'cwe') return searchCwe(s, 80).map(id => ({ id, label: cweInfo(id).name, sub: (cweInfo(id).top25 ? `Top 25 #${cweInfo(id).top25} · ` : '') + `${techniquesForCwe(id).length} ATT&CK link(s)` }));
    const V = ws.vulns.filter(v => v.kind === 'CVE' && (!s || [v.id, v.product, v.asset, v.title].join(' ').toLowerCase().includes(s.toLowerCase())))
      .filter(v => pick.cveFilter === 'all' || (pick.cveFilter === 'exposed' && v.exposed) || (pick.cveFilter === 'kev' && S.snap?.kev?.cves?.[v.id]));
    const rank = v => (v.exposed ? 2 : 0) + (S.snap?.kev?.cves?.[v.id] ? 1 : 0);
    return V.sort((a, b) => rank(b) - rank(a) || a.id.localeCompare(b.id)).map(v => ({ id: v.id, label: v.product || v.title || '', sub: [v.exposed ? 'exposed' : 'exposure not confirmed', S.snap?.kev?.cves?.[v.id] ? 'in KEV' : null, v.asset].filter(Boolean).join(' · ') }));
  };
  const drawList = () => {
    const it = items();
    listBox.replaceChildren(...it.map(x => {
      const c = el('input', { type: 'checkbox', checked: pick[kind].has(x.id) });
      c.addEventListener('change', () => { c.checked ? pick[kind].add(x.id) : pick[kind].delete(x.id); drawChosen(); });
      return el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid var(--line)' } }, c,
        el('span', null, el('span', 'mono small', x.id + ' '), x.label, el('div', 'small muted', x.sub)));
    }));
    if (!it.length) listBox.append(el('div', 'empty-state', kind === 'cve' ? el('span', null, 'No CVE in the register matches. Add CVEs under ', el('a', { href: '#/vulns' }, 'Vulnerabilities'), ' first.') : 'Nothing matches.'));
  };
  const drawChosen = () => {
    chosen.replaceChildren(...[...pick[kind]].map(id => chip(id, { kind: kind === 'attack' ? 't' : kind === 'cwe' ? 'c' : 'v', onRemove: () => { pick[kind].delete(id); drawChosen(); drawList(); } })));
    if (!pick[kind].size) chosen.append(el('span', 'small muted', 'Nothing selected yet.'));
    count();
  };
  q.addEventListener('input', () => { pick.q[kind] = q.value; drawList(); });
  const filters = [];
  if (kind === 'attack') { const t = select([['all', 'All tactics'], ...TACTICS.map(x => [x.short, x.name])], pick.tactic); t.addEventListener('change', () => { pick.tactic = t.value; drawList(); }); filters.push(t); }
  if (kind === 'cve') { const f = select([['all', 'All register CVEs'], ['exposed', 'Exposure confirmed'], ['kev', 'Listed in KEV']], pick.cveFilter); f.addEventListener('change', () => { pick.cveFilter = f.value; drawList(); }); filters.push(f); }

  // assets and source
  const crown = (ws.assessment.CROWN || []).map(r => r[1]).filter(Boolean);
  const aBox = el('div', 'chips');
  for (const a of [...new Set([...crown, ...pick.assets])]) {
    const c = el('input', { type: 'checkbox', checked: pick.assets.has(a) });
    c.addEventListener('change', () => { c.checked ? pick.assets.add(a) : pick.assets.delete(a); count(); });
    aBox.append(el('label', { class: 'chip', style: { cursor: 'pointer' } }, c, a));
  }
  const extra = el('input', { placeholder: 'Other asset or service — press Enter to add' });
  extra.addEventListener('keydown', e => { if (e.key === 'Enter' && extra.value.trim()) { pick.assets.add(extra.value.trim()); top.replaceChildren(); ontoBuilder(top, drawGrid, kind); } });
  const own = el('input', { type: 'checkbox', checked: pick.ownAsset });
  own.addEventListener('change', () => { pick.ownAsset = own.checked; count(); });
  const srcSel = select([['auto', kind === 'cve' ? 'Opportunistic attacker (typical for a known CVE)' : 'Typical source for each item'], ...THREAT_SOURCES.map(t => [t.id, t.label])], pick.src);
  srcSel.addEventListener('change', () => { pick.src = srcSel.value; });
  const build = () => {
    const out = [];
    const assets = [...pick.assets];
    for (const id of pick[kind]) {
      const p = kind === 'attack' ? fromTechnique(id) : kind === 'cwe' ? fromCwe(id) : fromCve(ws.vulns.find(v => v.id === id));
      const src = pick.src === 'auto' ? p.src : pick.src;
      const targets = kind === 'cve' && pick.ownAsset && p.asset ? [p.asset] : assets.length ? assets : ["the organization's critical systems"];
      for (const a of targets) out.push(makeRow(p, a, src));
    }
    return out;
  };
  function count() { const n = build().length; info.textContent = `${n} candidate${n === 1 ? '' : 's'} will be generated` + (n > 60 ? ' — consider narrowing: about 20 candidates, then the 10 most material.' : '.'); }
  drawList(); drawChosen();
  const title = { attack: 'MITRE ATT&CK techniques', cve: 'CVEs from the vulnerability register', cwe: 'CWE weaknesses' }[kind];
  const how = { attack: 'Each technique becomes a scenario with its CWE weaknesses (via CAPEC). Pb(A) starts from ATT&CK prevalence — flagged as a prior, not evidence.',
    cve: 'Each CVE becomes a scenario linking the CVE, its CWE and the ATT&CK techniques that exploit that weakness. With a snapshot loaded and exposure confirmed, Pb(ψ,A) starts at the floor of the CVE\'s Threat Evidence Ladder band; the rationale says so.',
    cwe: 'Each weakness becomes a scenario linking the ATT&CK techniques that exploit it (via CAPEC).' }[kind];
  top.append(el('div', 'cols2',
    card(el('h2', null, '1 · ' + title), el('p', 'note', how), el('div', 'filterbar', el('div', 'grow', q), ...filters.map(f => el('div', null, f))), chosen, listBox),
    el('div', null,
      card(el('h2', null, '2 · Assets and services'), kind === 'cve' ? el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)', marginBottom: '10px' } }, own, 'Use each CVE\'s own asset from the register when recorded') : null,
        aBox, el('div', { style: { marginTop: '10px' } }, extra)),
      card(el('h2', null, '3 · Threat source'), srcSel, info,
        el('div', 'btnrow', { style: { marginTop: '12px' } }, el('button', { class: 'btn', onclick: () => { const rows = build(); if (!rows.length) { toast('Select at least one item', 'bad'); return; } draft().push(...rows); touch(); drawGrid(); toast(rows.length + ' candidates added to the grid'); } }, 'Generate candidates'))))));
}
