/* Scenario editor — view and edit one scenario: causal chain, ATT&CK and CWE/CVE links, quantification,
   CVSS, treatment and live KRIs. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as linksPanel from './links.js';
import { el, n0, n2, kpi, banner, card, pill, pillFor, field, select, go, toast, chip, money } from '../util.js';
import { S, touch, scen, PARAMS, PARAM_LABEL, PARAM_HELP, allocation, initiatives, nextScenarioId, setIncluded, included } from '../state.js';
import { linkEditor } from '../picker.js';
import { tech, tacticName, TACTICS } from '../ontology.js';
import { classify as ladder } from '../../threat.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';
import { today } from '../util.js';

const CONS = ['Confidentiality/privacy', 'Integrity', 'Availability', 'Operations', 'Financial', 'Regulatory', 'Reputation', 'Safety'];
const CONF = ['High', 'Medium', 'Low'];

export function render(sec, arg) {
  const a = S.ws.assessment;
  sec.replaceChildren(el('h1', null, 'Scenario editor'));
  if (!a.SCEN.length) {
    sec.append(el('p', 'lede', 'No scenario to edit yet.'), card(el('div', 'btnrow', el('button', { class: 'btn', onclick: () => go('register') }, 'Go to the register'), el('button', { class: 'btn ghost', onclick: () => go('batch') }, 'Batch create'))));
    return;
  }
  const s = scen(arg) || a.SCEN[0];
  if (!arg || !scen(arg)) history.replaceState(null, '', '#/scenario/' + s.id);
  const idx = a.SCEN.indexOf(s);

  // navigation bar
  const pick = select(a.SCEN.map(x => [x.id, x.id + ' — ' + (x.name || '(untitled)').slice(0, 80)]), s.id);
  pick.addEventListener('change', () => go('scenario/' + pick.value));
  const inc = el('input', { type: 'checkbox', checked: included(s.id) });
  inc.addEventListener('change', () => { setIncluded(s.id, inc.checked); live(); });
  sec.append(card(el('div', 'row',
    el('div', { style: { flex: '1 1 380px' } }, field('<b>Scenario</b>', pick)),
    el('button', { class: 'btn ghost', disabled: idx <= 0, onclick: () => go('scenario/' + a.SCEN[idx - 1].id) }, '‹ Previous'),
    el('button', { class: 'btn ghost', disabled: idx >= a.SCEN.length - 1, onclick: () => go('scenario/' + a.SCEN[idx + 1].id) }, 'Next ›'),
    el('label', { style: { display: 'flex', gap: '6px', alignItems: 'center', margin: '0 0 8px', color: 'var(--ink)' } }, inc, 'Include in totals'),
  ), el('div', 'btnrow', { style: { marginTop: '10px' } },
    el('button', { class: 'btn ghost sm', onclick: () => { const c = JSON.parse(JSON.stringify(s)); c.id = nextScenarioId(); c.name = (c.name || '') + ' (copy)'; a.SCEN.splice(idx + 1, 0, c); touch(); go('scenario/' + c.id); } }, 'Duplicate'),
    el('button', { class: 'btn ghost sm', onclick: () => go('calc/' + s.id) }, 'Open in risk calculator'),
    el('button', { class: 'btn ghost sm', onclick: () => go('recs/' + s.id) }, 'Recommendations'),
    el('button', { class: 'btn ghost sm danger', onclick: () => {
      if (!window.confirm(`Delete scenario ${s.id} — ${s.name}?`)) return;
      a.SCEN.splice(idx, 1); for (const i of a.INITIATIVES) if (Array.isArray(i[3])) i[3] = i[3].filter(x => x !== s.id);
      S.ws.excluded = S.ws.excluded.filter(x => x !== s.id); delete S.ws.decisions[s.id]; touch(); toast('Deleted ' + s.id); go('register');
    } }, 'Delete'))));

  // live KRIs
  const liveBox = el('div');
  const live = () => {
    liveBox.replaceChildren();
    let r;
    try { r = CRG.calc(s, a.APPETITE, a.FACTOR); }
    catch (e) { liveBox.append(banner('bad', 'Cannot calculate this scenario yet', String(e.message || e))); return; }
    const cls = CRG.classify(r.ratio), al = allocation()[s.id];
    const st = el('div', 'kpi ' + pillFor(cls)); st.append(el('div', 'k', 'Residual / tolerated'));
    const v = el('div', 'v'); v.append(n2(r.ratio) + ' ', pill(cls, pillFor(cls))); st.append(v);
    liveBox.append(el('div', 'grid g6', kpi('CVSS Base', n2(r.cvss)), kpi('Estimated', n0(r.est)), kpi('Tolerated', n0(r.tol)),
      kpi('Residual', n0(r.res)), st, kpi('Year-1 treatment', al?.y1 ? money(al.y1) : '—', al?.y1 ? 'CE ' + n2((r.est - r.res) / al.y1 * 1000) + ' / $1k' : 'no initiative linked')));
    if (r.mit > r.est) liveBox.append(banner('bad', 'Mitigation exceeds estimated risk', 'Revise the reduction estimates.'));
  };
  const ch = () => { touch(); live(); };
  sec.append(liveBox); live();

  const T = (key, rows = 2, attrs = {}) => { const n = el(rows ? 'textarea' : 'input', Object.assign({ rows }, attrs)); n.value = s[key] ?? ''; n.addEventListener('input', () => { s[key] = n.value; ch(); if (key === 'name') pick.selectedOptions[0].text = s.id + ' — ' + n.value.slice(0, 80); }); return n; };
  const L = (key, rows = 3) => { const n = el('textarea', { rows, placeholder: 'One per line' }); n.value = (s[key] || []).join('\n'); n.addEventListener('input', () => { s[key] = n.value.split('\n').map(x => x.trim()).filter(Boolean); ch(); }); return n; };

  sec.append(card(el('h2', null, 'Identification'), el('div', 'grid g3',
    field('<b>Name</b>', T('name', 0)), field('Library reference / candidate ID', T('ref', 0)), field('Risk owner', T('owner', 0)),
    field('Implementation horizon', T('horizon', 0, { placeholder: 'e.g. 0-6 months' })), field('Stakeholders', T('stakeholders', 0)), field('Origin', el('input', { value: s.origin || 'imported', readOnly: true })),
  ), field('<b>Scenario statement</b> — threat source → vulnerability → asset/process → event → consequence', T('statement', 3))));

  /* 1.5.5 — guideline 4 is the laborious part of the methodology: a statement plus eight structured
     fields, for every scenario. The draft button fills them from what the scenario already holds, and
     the review that follows writes nothing until each field is ticked. A field that already has text
     is never ticked by default. */
  const chainBox = el('div');
  sec.append(card(el('div', 'row', { style: { alignItems: 'center' } },
      el('h2', { style: { flex: 1, margin: 0 } }, 'Causal chain'),
      el('span', 'small muted', 'Threat source → vulnerability → asset or process → event → consequence'),
      el('button', { class: 'btn sm', onclick: e => draftChain(s, sec, chainBox, e.target) }, 'Draft it with AI…')),
    chainBox,
    el('div', 'grid g2',
      field('<b>Threat source</b>', T('threat_source', 2)), field('<b>Initiating event</b>', T('threat_event', 2)),
      field('<b>Vulnerabilities or predisposing conditions</b>', L('vulns')), field('Existing controls (with evidence)', L('controls')),
      field('<b>Affected assets</b>', T('assets', 2)), field('Affected business processes', T('processes', 2)),
      field('Event sequence', L('sequence', 4)), field('Narrative', T('narrative', 4)),
    ), field('Background / major assumptions', T('background', 2))));

  // threats & vulns
  const chain = el('div', 'small muted');
  const drawChain = () => {
    const tacs = new Set((s.attack || []).flatMap(id => tech(id)?.tactics || []));
    chain.replaceChildren('Tactic coverage: ', ...TACTICS.filter(t => tacs.has(t.short)).map((t, i) => el('span', null, i ? ' → ' : '', el('b', null, t.name))));
    if (!tacs.size) chain.textContent = 'Link the ATT&CK techniques that describe how this scenario unfolds.';
  };
  drawChain();
  const cveBox = el('div');
  const drawCveLadder = () => {
    cveBox.replaceChildren();
    if (!s.cves?.length) return;
    if (!S.snap) { cveBox.append(el('div', 'note', 'Load a threat-context snapshot to place these CVEs on the Threat Evidence Ladder.')); return; }
    const exposed = new Set((S.ws.vulns || []).filter(v => v.exposed).map(v => v.id));
    cveBox.append(el('div', 'chips', { style: { marginTop: '8px' } }, ...s.cves.map(c => { const r = ladder(c, S.snap, exposed.has(c)); return el('span', { class: 'pill ' + (r.rung >= 4 ? 'bad' : r.rung >= 3 ? 'warn' : 'good'), title: r.evidence + (r.applies ? '' : ' — exposure not confirmed: watch list only') }, `${c} · rung ${r.rung}${r.applies ? '' : ' (watch)'}`); })));
  };
  drawCveLadder();
  sec.append(el('div', 'cols2',
    card(el('h2', null, 'Threats — MITRE ATT&CK'), linkEditor(s.attack, 'attack', () => { ch(); drawChain(); }), el('div', { style: { marginTop: '10px' } }, chain)),
    card(el('h2', null, 'Vulnerabilities — CWE and CVE'), el('label', null, el('b', null, 'Weakness types (CWE)')), linkEditor(s.cwe, 'cwe', ch),
      el('label', { style: { marginTop: '12px' } }, el('b', null, 'Specific vulnerabilities (CVE)')), linkEditor(s.cves, 'cve', () => { ch(); drawCveLadder(); }), cveBox,
      el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn sm ghost', onclick: () => { linksPanel.scope([s.id]); go('vulns/links'); } }, 'Suggest vulnerabilities for this scenario…')))));

  // consequences
  s.consequences = s.consequences && typeof s.consequences === 'object' ? s.consequences : {};
  sec.append(card(el('h2', null, 'Consequences'), el('div', 'grid g4', ...CONS.map(c => { const n = el('textarea', { rows: 2 }); n.value = s.consequences[c] || ''; n.addEventListener('input', () => { s.consequences[c] = n.value; ch(); }); return field(c, n); }))));

  // quantification
  const pg = el('div', 'paramgrid');
  pg.append(...['Parameter', 'Value 0–1', 'Rationale', 'Evidence', 'Confidence'].map(h => el('div', 'h', h)));
  for (const k of PARAMS) {
    const p = s.params[k];
    const v = el('input', { type: 'number', step: 0.05, min: k === 'Th' ? 0.05 : 0, max: 1, value: p.v });
    v.addEventListener('input', () => { p.v = Number(v.value); ch(); });
    const rat = el('textarea', { rows: 1 }); rat.value = p.rat || ''; rat.addEventListener('input', () => { p.rat = rat.value; touch(); });
    const ev = el('input', { value: p.ev || '', placeholder: 'E1, scan 2026-09…' }); ev.addEventListener('input', () => { p.ev = ev.value; touch(); });
    const cf = select(CONF, p.conf || 'Low'); cf.addEventListener('change', () => { p.conf = cf.value; touch(); });
    pg.append(el('div', { title: PARAM_HELP[k] }, el('b', null, PARAM_LABEL[k]), el('div', 'small muted', PARAM_HELP[k])), v, rat, ev, cf);
  }
  sec.append(card(el('h2', null, 'Quantification'), pg,
    el('p', 'note', 'Values without documented evidence are analytical estimates — validation required. Threat intelligence may move Pb(A) and Pb(ψ,A) only, within ladder bands and with exposure confirmed; never δe, δm, θ or μ(E).')));

  // CVSS + treatment
  const vec = T('cvss', 0, { class: 'mono' });
  const score = el('input', { type: 'number', step: 0.1, min: 0, max: 10, value: s.cvss_score ?? '', placeholder: 'from vector' });
  score.addEventListener('input', () => { if (score.value === '') delete s.cvss_score; else s.cvss_score = Number(score.value); ch(); });
  const red = k => { const n = el('input', { type: 'number', step: 0.05, min: 0, max: 1, value: s[k] }); n.addEventListener('input', () => { s[k] = Number(n.value); ch(); }); return n; };
  const inits = initiatives();
  const initBox = el('div', 'scroll-y', { style: { maxHeight: '220px' } });
  for (const i of inits) {
    const c = el('input', { type: 'checkbox', checked: i.scenarios.includes(s.id) });
    c.addEventListener('change', () => {
      const raw = S.ws.assessment.INITIATIVES.find(x => x[0] === i.id);
      const set = new Set(raw[3] || []); if (c.checked) set.add(s.id); else set.delete(s.id); raw[3] = [...set];
      const si = new Set(s.inits || []); if (c.checked) si.add(i.id); else si.delete(i.id); s.inits = [...si]; ch();
    });
    initBox.append(el('label', { style: { display: 'flex', gap: '8px', color: 'var(--ink)', fontSize: '13px', margin: '4px 0' } }, c, el('span', null, el('b', null, i.id), ' ' + i.name, el('span', 'muted', ` · ${money(i.y1)} Y1 · ${i.scenarios.length} scen.`))));
  }
  if (!inits.length) initBox.append(el('div', 'note', 'No initiatives in this workspace yet — add them under Recommendations, or enter a manual cost.'));
  const manual = el('input', { type: 'number', step: 1000, value: s.cost_y1_manual || '', placeholder: 'used only when no initiative is linked' });
  manual.addEventListener('input', () => { s.cost_y1_manual = Number(manual.value) || 0; ch(); });
  sec.append(el('div', 'cols2',
    card(el('h2', null, 'CVSS v4.0 (Base only)'), field('<b>Vector</b>', vec), el('div', 'grid g2', field('Score override', score, 'Leave empty to compute from the vector'),
      el('div', { style: { alignSelf: 'end' } }, el('button', { class: 'btn ghost', onclick: () => go('cvss/' + encodeURIComponent(s.cvss || '') + '|' + s.id) }, 'Edit in CVSS calculator'))),
      field('CVSS rationale', T('cvss_note', 3)),
      el('p', 'note', 'Threat metrics (E:A/P/U) are not used: exploitation evidence belongs in Pb(ψ,A).')),
    card(el('h2', null, 'Treatment'), el('div', 'grid g2', field('<b>Probability reduction</b>', red('red_p')), field('<b>Impact reduction</b>', red('red_i'))),
      field('Treatment package', T('treatment', 2)), el('label', null, el('b', null, 'Initiatives addressing this scenario')), initBox,
      field('Manual Year-1 cost', manual))));

  // 1.4.0 — assets, measures, risks and intelligence notes
  const ws = S.ws;
  const aBox = el('div', 'chips');
  for (const a of ws.assets || []) aBox.append(el('label', { class: 'chip', style: { cursor: 'pointer' }, title: a.type }, el('input', { type: 'checkbox', checked: (s.assetIds || []).includes(a.id), style: { width: 'auto', margin: 0 },
    onchange: e => { s.assetIds ||= []; if (e.target.checked) s.assetIds.push(a.id); else s.assetIds = s.assetIds.filter(x => x !== a.id); (ws.assetLog ||= []).push({ ts: new Date().toISOString().slice(0, 19), asset: a.id, action: 'link', field: 'scenario', old: e.target.checked ? '' : s.id, new: e.target.checked ? s.id : '', src: 'scenario editor' }); touch(); } }), ' ', a.id + ' ' + a.name.slice(0, 30)));
  const ms = (ws.measures || []).filter(m => m.status !== 'rejected' && (m.scen || []).includes(s.id));
  const rks = (ws.risks || []).filter(r => (r.scenarios || []).includes(s.id));
  sec.append(card(el('h2', null, 'Assets, measures, risks and intelligence'),
    el('label', null, el('b', null, 'Information assets carrying this scenario')), (ws.assets || []).length ? aBox : el('div', 'small muted', 'No asset yet — add them in Information assets.'),
    el('label', { style: { marginTop: '12px' } }, el('b', null, 'Mitigation measures')), ms.length ? el('div', 'chips', ...ms.map(m => chip(`${m.id} ${m.name.slice(0, 40)} · rp ${m.eff?.[s.id]?.rp ?? m.rp} ri ${m.eff?.[s.id]?.ri ?? m.ri}`, { href: '#/mitigation/' + m.id, title: m.status }))) : el('div', 'small muted', 'None — see Risk mitigation.'),
    s.red_source ? el('div', 'note', `red_p / red_i applied from measures ${s.red_source.measures.join(', ')} on ${s.red_source.date} (${s.red_source.rule}).`) : null,
    el('label', { style: { marginTop: '12px' } }, el('b', null, 'Risk register entries')), rks.length ? el('div', 'chips', ...rks.map(r => chip(r.id + ' ' + r.title.slice(0, 40), { href: '#/riskreg/' + r.id }))) : el('div', 'small muted', 'None — see Risk register.'),
    (s.intel || []).length ? el('div', { style: { marginTop: '12px' } }, el('label', null, el('b', null, 'Intelligence notes (informational — never change the parameters)')),
      ...(s.intel || []).map((n, i) => el('div', 'docrow', el('div', null, el('b', null, n.date + ' · ' + n.src), ' ', n.url ? el('a', { href: n.url, target: '_blank', rel: 'noopener noreferrer' }, n.title) : n.title),
        el('button', { class: 'btn sm ghost danger', onclick: () => { s.intel.splice(i, 1); touch(); render(sec, s.id); } }, 'Remove')))) : null));

  // threat basis
  if (Array.isArray(s.threat_basis) && s.threat_basis.length) {
    sec.append(card(el('h2', null, 'Threat-context basis (audit trail)'), ...s.threat_basis.map((b, i) => el('div', 'docrow',
      el('div', null, el('b', null, (b.cve || '') + ' · ' + (b.parameter || '') + ' · rung ' + (b.ladder_rung ?? '')), el('div', 'small', (b.evidence || []).join('; ')), el('div', 'small muted', 'Exposure: ' + (b.exposure || '—'))),
      el('button', { class: 'btn sm ghost danger', onclick: () => { s.threat_basis.splice(i, 1); touch(); render(sec, s.id); } }, 'Remove')))));
  }
}

/* ---------------- guideline 4: draft the causal chain with AI (1.5.5) ----------------
   One scenario at a time, on purpose: a chain is an argument about a specific organization, and a
   batch of eight would get the review a batch gets rather than the review an argument needs. */

/** The fields the draft can fill: key, label, how to read the answer, how to write it. */
const CHAIN_FIELDS = [
  ['statement',   'Statement',        a => str(a.statement)],
  ['threat_source', 'Threat source',  a => str(a.threat_source)],
  ['threat_event', 'Initiating event', a => str(a.initiating_event)],
  ['vulns',       'Vulnerabilities or predisposing conditions', a => lines(a.vulnerabilities)],
  ['controls',    'Existing controls', a => lines(a.existing_controls)],
  ['assets',      'Affected assets',  a => str(a.assets)],
  ['processes',   'Affected business processes', a => str(a.processes)],
  ['sequence',    'Event sequence',   a => lines(a.sequence)],
  ['narrative',   'Narrative',        a => str(a.narrative)],
  ['background',  'Background / major assumptions', a => str(a.assumptions)],
];
const str = v => String(v == null ? '' : v).trim();
const lines = v => (Array.isArray(v) ? v : String(v || '').split('\n')).map(x => str(x)).filter(Boolean);
const shown = v => Array.isArray(v) ? v.join('\n') : str(v);
const isEmpty = v => (Array.isArray(v) ? v.length === 0 : !str(v));

async function draftChain(s, sec, box, btn) {
  const ws = S.ws;
  box.replaceChildren(el('p', 'note', 'Checking where this request may go…'));
  const st = await aiui.status(ws, 'causal_chain');
  if (!st.ok) { box.replaceChildren(banner('warn', 'AI is not available for this', st.why)); return; }
  box.replaceChildren(el('p', 'note', `Preparing the request — it would go to ${AI.where(st.provider)}.`));
  btn.disabled = true;
  let out = null;
  try { out = await aiui.request('causal_chain', { scen: s }, { title: 'Causal chain — what will be sent' }); }
  finally { btn.disabled = false; }
  if (!out) { box.replaceChildren(); return; }
  let ans;
  try { ans = AI.parseJson(out.text); }
  catch (e) {
    box.replaceChildren(banner('bad', 'The answer could not be read as a causal chain', String(e.message || e)),
      el('details', null, el('summary', null, 'What came back'), el('pre', 'mono', { style: { whiteSpace: 'pre-wrap', fontSize: '11.5px' } }, out.text || '')));
    return;
  }
  reviewChain(s, sec, box, ans, out);
}

function reviewChain(s, sec, box, ans, out) {
  const rows = CHAIN_FIELDS.map(([key, label, read]) => {
    const proposed = read(ans);
    const current = s[key];
    return { key, label, proposed, current, empty: isEmpty(current), offered: !isEmpty(proposed) };
  }).filter(r => r.offered);

  // Consequences: a category the answer filled and the scenario has not.
  const cons = Object.entries(ans.consequences || {})
    .map(([k, v]) => ({ k, v: str(v), cur: str((s.consequences || {})[k]) }))
    .filter(c => c.v && CONS.includes(c.k));
  const attack = (Array.isArray(ans.attack) ? ans.attack : []).map(str)
    .filter(t => /^T\d{4}(\.\d{3})?$/.test(t) && !(s.attack || []).includes(t));

  if (!rows.length && !cons.length && !attack.length) {
    box.replaceChildren(banner('', 'Nothing to add', 'The answer proposed nothing this scenario does not already hold.'));
    return;
  }
  const picked = new Set(rows.filter(r => r.empty).map(r => r.key));          // empty fields only
  const pickedCons = new Set(cons.filter(c => !c.cur).map(c => c.k));
  let takeAttack = attack.length > 0;

  const edits = new Map();   // key -> the textarea, so an edited draft is what gets written
  const build = () => {
    const c = el('div');
    c.append(banner('', 'A draft, field by field',
      `Ticked fields will be written when you apply. A field that already has text is left unticked — ` +
      `${rows.filter(r => !r.empty).length} of ${rows.length} would replace something. Edit any draft before applying. ${AI.MARK}`));
    if (out.truncated) c.append(banner('warn', 'The answer was cut short', 'What arrived complete is shown; the rest is missing.'));
    if (str(ans.notes)) c.append(el('p', 'note', el('b', null, 'The model could not determine: '), str(ans.notes)));

    for (const r of rows) {
      const cb = el('input', { type: 'checkbox', checked: picked.has(r.key), style: { width: 'auto' } });
      cb.addEventListener('change', () => { cb.checked ? picked.add(r.key) : picked.delete(r.key); redraw(); });
      const ta = edits.get(r.key) || el('textarea', { rows: r.key === 'statement' || r.key === 'narrative' ? 3 : 2 });
      if (!edits.has(r.key)) { ta.value = shown(r.proposed); edits.set(r.key, ta); }
      c.append(el('div', { style: { borderTop: '1px solid var(--line)', padding: '8px 0' } },
        el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' } }, cb,
          el('b', null, r.label),
          r.empty ? pill('empty now', '') : pill('would replace what is there', 'warn')),
        !r.empty ? el('div', 'small muted', { style: { margin: '4px 0' } }, 'Now: ' + shown(r.current).slice(0, 220)) : null,
        ta));
    }
    if (cons.length) {
      c.append(el('h2', null, 'Consequences'));
      for (const x of cons) {
        const cb = el('input', { type: 'checkbox', checked: pickedCons.has(x.k), style: { width: 'auto' } });
        cb.addEventListener('change', () => { cb.checked ? pickedCons.add(x.k) : pickedCons.delete(x.k); });
        c.append(el('div', { style: { padding: '4px 0' } },
          el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--ink)' } }, cb,
            el('span', null, el('b', null, x.k), x.cur ? pill('would replace', 'warn') : null,
              el('div', 'small', x.v)))));
      }
    }
    if (attack.length) {
      const cb = el('input', { type: 'checkbox', checked: takeAttack, style: { width: 'auto' } });
      cb.addEventListener('change', () => { takeAttack = cb.checked; });
      c.append(el('div', { style: { paddingTop: '8px' } },
        el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)' } }, cb,
          el('span', null, el('b', null, 'Add ATT&CK techniques: '), attack.join(', ')))));
    }
    c.append(el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', onclick: () => apply(s, sec, rows, picked, edits, cons, pickedCons, attack, takeAttack) }, 'Apply the ticked fields'),
      el('button', { class: 'btn ghost', onclick: () => { for (const r of rows) picked.add(r.key); redraw(); } }, 'Tick every field'),
      el('button', { class: 'btn ghost', onclick: () => box.replaceChildren() }, 'Discard the draft')));
    return c;
  };
  const redraw = () => box.replaceChildren(build());
  redraw();
}

function apply(s, sec, rows, picked, edits, cons, pickedCons, attack, takeAttack) {
  let n = 0;
  const changed = [];
  for (const r of rows) {
    if (!picked.has(r.key)) continue;
    const raw = (edits.get(r.key)?.value ?? shown(r.proposed));
    const v = Array.isArray(r.proposed) ? lines(raw) : str(raw);
    if (isEmpty(v)) continue;
    s[r.key] = v; n++; changed.push(r.label);
  }
  if (pickedCons.size) {
    s.consequences = s.consequences && typeof s.consequences === 'object' ? s.consequences : {};
    for (const x of cons) if (pickedCons.has(x.k)) { s.consequences[x.k] = x.v; n++; changed.push('consequence: ' + x.k); }
  }
  if (takeAttack && attack.length) {
    s.attack = [...new Set([...(s.attack || []), ...attack])]; n++; changed.push('ATT&CK ' + attack.join(', '));
  }
  if (!n) { toast('Nothing was ticked', 'bad'); return; }
  (s.revisions ||= []).push({ date: today(), what: `Causal chain drafted with AI and accepted: ${changed.join('; ')}` });
  touch();
  toast(`${n} field${n === 1 ? '' : 's'} written — review them`);
  render(sec, s.id);   // the same scenario: render(sec) alone falls back to the first in the register
}
