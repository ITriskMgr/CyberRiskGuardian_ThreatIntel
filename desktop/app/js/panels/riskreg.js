/* Risk register (1.4.0) — the organization's risks with their threats (ATT&CK and description),
   vulnerabilities (CVE/CWE, KEV and exposure), assets, scenarios, measures, inherent / current / target
   ratings, treatment, owner, review and formal acceptance, change history and heat map. CRG figures come from
   the linked scenarios through the verified engine. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as users from '../users.js';
import { el, n0, n2, kpi, card, pill, pillFor, chip, select, toast, table, field, today, go, debounce } from '../util.js';
import { S, touch, compute, scen } from '../state.js';
import { linkEditor } from '../picker.js';
import * as G from '../registry.js';

let editId = null, heat = 'current';
const flt = { q: '', status: 'all', cat: 'all', level: 'all' };

export function render(sec, arg) {
  const ws = S.ws; ws.risks ||= [];
  if (arg && ws.risks.some(r => r.id === arg)) editId = arg;
  const R = compute();
  sec.replaceChildren(el('h1', null, 'Risk register'), el('p', 'lede', 'The risks management owns, each linked to the scenarios that quantify it, the threats and vulnerabilities behind it, the assets it affects and the measures that treat it. Ratings use a 1–5 likelihood × impact scale suggested from the scenario parameters; CRG figures are the sum of the linked scenarios.'));
  const rs = ws.risks;
  const lv = r => G.level(G.score(r.current));
  const notLinked = ws.assessment.SCEN.filter(s => !rs.some(r => r.scenarios.includes(s.id)));
  const overdue = rs.filter(r => r.review && r.review < today() && r.status !== 'closed');
  sec.append(el('div', 'grid g5',
    kpi('Risks', n0(rs.length), `${rs.filter(r => r.status !== 'closed').length} open or monitored`),
    kpi('High or very high', n0(rs.filter(r => G.score(r.current) >= 10).length), 'current rating', rs.some(r => G.score(r.current) >= 10) ? 'bad' : 'good'),
    kpi('Above tolerance (CRG)', n0(rs.filter(r => G.crgOf(r, R)?.ratio > CRG.BAND_HIGH).length), 'linked scenarios residual / tolerated'),
    kpi('Formally accepted', n0(rs.filter(r => r.acceptance?.by).length), 'with an acceptance record'),
    kpi('Reviews overdue', n0(overdue.length), 'review date passed', overdue.length ? 'warn' : 'good')));
  // actions
  sec.append(card(el('div', 'btnrow',
    el('button', { class: 'btn', onclick: () => { const r = G.blankRisk(); ws.risks.push(r); editId = r.id; touch(); render(sec); } }, 'New risk'),
    el('button', { class: 'btn ghost', disabled: !notLinked.length, onclick: () => { for (const s of notLinked) ws.risks.push(G.riskFromScenario(s)); touch(); toast(notLinked.length + ' risk(s) created from scenarios'); render(sec); } }, `Create from scenarios not yet in the register (${notLinked.length})`),
    el('button', { class: 'btn ghost', disabled: !rs.length, onclick: () => { let n = 0; for (const r of rs) { const s = scen(r.scenarios[0]); if (!s) continue; const t = G.ratingsFromScenario(s); if (t.current.l !== r.current.l || t.current.i !== r.current.i || t.target.l !== r.target.l || t.target.i !== r.target.i) { G.log(r, `Ratings refreshed from ${s.id}: current ${r.current.l}×${r.current.i} → ${t.current.l}×${t.current.i}, target ${r.target.l}×${r.target.i} → ${t.target.l}×${t.target.i}`); r.current = t.current; r.target = t.target; n++; } } touch(); toast(n + ' risk(s) updated'); render(sec); } }, 'Refresh ratings from scenarios'),
    el('button', { class: 'btn ghost', onclick: () => go('share') }, 'Publish & share…'))));

  // heat map + table
  const hm = heatmap(rs, sec);
  const q = el('input', { placeholder: 'Search risks, owners, threats, vulnerabilities…', value: flt.q });
  const stSel = select([['all', 'All statuses'], ...G.RSTATUS], flt.status), catSel = select([['all', 'All categories'], ...G.CATEGORIES.map(c => [c, c])], flt.cat);
  const lvSel = select([['all', 'All levels'], ['Very high', 'Very high'], ['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']], flt.level);
  const shown = () => rs.filter(r => (flt.status === 'all' || r.status === flt.status) && (flt.cat === 'all' || r.category === flt.cat) && (flt.level === 'all' || lv(r)[0] === flt.level)
    && (!flt.q || [r.id, r.title, r.desc, r.owner, r.threatText, r.threats.join(' '), r.vulns.join(' ')].join(' ').toLowerCase().includes(flt.q.toLowerCase())));
  const cols = [
    { key: 'id', label: 'ID', cls: 'mono' },
    { key: 'title', label: 'Risk', render: r => el('div', null, el('b', null, r.title || '(untitled)'), el('div', 'small muted', [r.category, r.owner].filter(Boolean).join(' · ')),
      el('div', 'chips', { style: { marginTop: '3px' } }, ...r.threats.slice(0, 2).map(t => chip(t, { kind: 't', href: '#/threats/' + t })), ...r.vulns.slice(0, 2).map(v => chip(v, { kind: v.startsWith('CWE') ? 'c' : (S.snap?.kev?.cves?.[v] ? 'k' : 'v'), href: '#/vulns/' + v })))) },
    { key: 'cur', label: 'Current', render: r => { const [t, k] = lv(r); return el('span', null, pill(t, k), el('span', 'small muted', ` ${r.current.l}×${r.current.i}`)); }, sort: r => G.score(r.current) },
    { key: 'tgt', label: 'Target', render: r => { const [t, k] = G.level(G.score(r.target)); return el('span', null, pill(t, k), el('span', 'small muted', ` ${r.target.l}×${r.target.i}`)); }, sort: r => G.score(r.target) },
    { key: 'crg', label: 'CRG ratio', num: true, render: r => { const c = G.crgOf(r, R); return c ? el('span', null, n2(c.ratio), ' ', pill(c.cls.split(' ')[0], pillFor(c.cls))) : '—'; }, sort: r => G.crgOf(r, R)?.ratio ?? -1 },
    { key: 'treatment', label: 'Treatment' },
    { key: 'status', label: 'Status', render: r => (G.RSTATUS.find(x => x[0] === r.status) || [, r.status])[1] },
    { key: 'review', label: 'Review', render: r => r.review ? el('span', { style: { color: r.review < today() && r.status !== 'closed' ? 'var(--bad)' : '' } }, r.review) : '—' },
  ];
  const t = table(cols, shown(), { class: 'compact', sortKey: 'cur', sortDir: -1, onRow: r => { editId = r.id; render(sec); setTimeout(() => document.getElementById('risk-edit')?.scrollIntoView({ behavior: 'smooth' }), 0); } });
  const count = el('div', 'selcount');
  const upd = () => { const x = shown(); t.redraw(x); count.textContent = `${x.length} of ${rs.length} risks`; };
  q.addEventListener('input', debounce(() => { flt.q = q.value; upd(); }, 200));
  for (const [c, k] of [[stSel, 'status'], [catSel, 'cat'], [lvSel, 'level']]) c.addEventListener('change', () => { flt[k] = c.value; upd(); });
  upd();
  sec.append(el('div', 'heat-row', hm, topList(rs, R, sec)));
  sec.append(card(el('div', 'filterbar', el('div', 'grow', q), el('div', null, stSel), el('div', null, catSel), el('div', null, lvSel), count),
      rs.length ? el('div', 'tablewrap', { style: { marginTop: '10px' } }, t) : el('div', 'empty-state', el('b', null, 'The register is empty'), 'Create risks from your scenarios, or add one by hand.')));
  const r = rs.find(x => x.id === editId);
  if (r) sec.append(editor(r, sec, R));
}

function topList(rs, R, sec) {
  const top = rs.filter(r => r.status !== 'closed').sort((a, b) => G.score(b.current) - G.score(a.current) || (G.crgOf(b, R)?.ratio || 0) - (G.crgOf(a, R)?.ratio || 0)).slice(0, 8);
  return card(el('h2', { style: { marginTop: 0 } }, 'Top risks'), top.length ? table([
    { key: 'id', label: 'ID', cls: 'mono' }, { key: 'title', label: 'Risk', render: r => r.title }, { key: 'o', label: 'Owner', render: r => r.owner || '—' },
    { key: 'c', label: 'Current → target', render: r => el('span', null, pill(G.level(G.score(r.current))[0], G.level(G.score(r.current))[1]), ' → ', pill(G.level(G.score(r.target))[0], G.level(G.score(r.target))[1])) },
    { key: 't', label: 'Treatment', render: r => r.treatment }], top, { class: 'compact', onRow: r => { editId = r.id; render(sec); setTimeout(() => document.getElementById('risk-edit')?.scrollIntoView({ behavior: 'smooth' }), 0); } })
    : el('p', 'note', 'No open risk.'));
}

function heatmap(rs, sec) {
  const grid = el('div', { style: { display: 'grid', gridTemplateColumns: '28px repeat(5, 1fr)', gap: '3px', fontSize: '12px' } });
  const col = n => n >= 15 ? 'var(--bad)' : n >= 10 ? 'color-mix(in srgb, var(--bad) 60%, var(--warn))' : n >= 5 ? 'var(--warn)' : 'var(--good)';
  for (let l = 5; l >= 1; l--) {
    grid.append(el('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)' }, title: G.L_LABEL[l] }, String(l)));
    for (let i = 1; i <= 5; i++) {
      const here = rs.filter(r => r[heat]?.l === l && r[heat]?.i === i);
      grid.append(el('div', { title: `${G.L_LABEL[l]} × ${G.I_LABEL[i]}\n${here.map(r => r.id + ' ' + r.title).join('\n')}`,
        style: { aspectRatio: '1', borderRadius: '6px', background: `color-mix(in srgb, ${col(l * i)} ${here.length ? 85 : 22}%, var(--surface))`, color: here.length ? '#fff' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: here.length ? 'pointer' : 'default' },
        onclick: () => { if (here.length) { editId = here[0].id; render(sec); } } }, String(here.length || '')));
    }
  }
  grid.append(el('div'), ...[1, 2, 3, 4, 5].map(i => el('div', { style: { textAlign: 'center', color: 'var(--muted)' }, title: G.I_LABEL[i] }, String(i))));
  const sw = select([['inherent', 'Inherent'], ['current', 'Current'], ['target', 'Target']], heat); sw.addEventListener('change', () => { heat = sw.value; render(sec); });
  return card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, 'Heat map'), el('div', null, sw)), el('div', { style: { marginTop: '10px' } }, grid),
    el('div', 'small muted', { style: { marginTop: '6px' } }, 'Rows: likelihood 1–5 · columns: impact 1–5. Click a cell to open its first risk.'));
}

function editor(r, sec, R) {
  const ws = S.ws;
  const track = (label, before, after) => { if (String(before) !== String(after)) G.log(r, `${label}: ${before || '—'} → ${after || '—'}`); };
  const inp = (k, attrs = {}) => { const i = el('input', Object.assign({ value: r[k] ?? '' }, attrs)); i.addEventListener('change', () => { track(k, r[k], i.value); r[k] = i.value; touch(); }); return i; };
  const sel = (k, opts, redraw) => { const s = select(opts, r[k]); s.addEventListener('change', () => { track(k, r[k], s.value); r[k] = s.value; touch(); if (redraw) render(sec); }); return s; };
  const rating = k => {
    const l = select([1, 2, 3, 4, 5].map(n => [n, `${n} ${G.L_LABEL[n]}`]), r[k].l), i = select([1, 2, 3, 4, 5].map(n => [n, `${n} ${G.I_LABEL[n]}`]), r[k].i);
    const ch = () => { const b = `${r[k].l}×${r[k].i}`; r[k] = { l: +l.value, i: +i.value }; track(k + ' rating', b, `${r[k].l}×${r[k].i}`); touch(); render(sec); };
    l.addEventListener('change', ch); i.addEventListener('change', ch);
    const [t, kk] = G.level(G.score(r[k]));
    return el('div', 'opt', el('div', 'row', { style: { alignItems: 'center' } }, el('b', { style: { flex: 1, textTransform: 'capitalize' } }, k), pill(t + ' · ' + G.score(r[k]), kk)), el('div', 'grid g2', { style: { marginTop: '6px' } }, field('Likelihood', l), field('Impact', i)));
  };
  const scBox = el('div', 'chips');
  for (const s of ws.assessment.SCEN) scBox.append(el('label', { class: 'chip', style: { cursor: 'pointer' }, title: s.name }, el('input', { type: 'checkbox', checked: r.scenarios.includes(s.id), style: { width: 'auto', margin: 0 },
    onchange: e => { if (e.target.checked) r.scenarios.push(s.id); else r.scenarios = r.scenarios.filter(x => x !== s.id); G.log(r, (e.target.checked ? 'Linked ' : 'Unlinked ') + s.id); touch(); render(sec); } }), ' ', s.id));
  const asBox = el('div', 'chips');
  for (const a of ws.assets || []) asBox.append(el('label', { class: 'chip', style: { cursor: 'pointer' }, title: a.type }, el('input', { type: 'checkbox', checked: r.assets.includes(a.id), style: { width: 'auto', margin: 0 },
    onchange: e => { if (e.target.checked) r.assets.push(a.id); else r.assets = r.assets.filter(x => x !== a.id); touch(); } }), ' ', a.id + ' ' + a.name));
  const msBox = el('div', 'chips');
  for (const m of ws.measures || []) msBox.append(el('label', { class: 'chip', style: { cursor: 'pointer' }, title: m.name }, el('input', { type: 'checkbox', checked: r.measures.includes(m.id), style: { width: 'auto', margin: 0 },
    onchange: e => { if (e.target.checked) r.measures.push(m.id); else r.measures = r.measures.filter(x => x !== m.id); touch(); } }), ' ', m.id + ' ' + m.name.slice(0, 40)));
  const cveA = r.vulns.filter(x => !x.startsWith('CWE')), cweA = r.vulns.filter(x => x.startsWith('CWE'));
  const syncV = () => { r.vulns = [...cveA, ...cweA]; touch(); };
  const acc = r.acceptance || {};
  const accIn = k => { const i = el('input', { value: acc[k] || '', type: k === 'date' || k === 'until' ? 'date' : 'text' }); i.addEventListener('change', () => {
    if (k === 'by' && i.value && users.active()) { try { users.requireApprove('recommend'); } catch (e) { toast(e.message, 'bad'); i.value = acc.by || ''; return; } }
    r.acceptance = Object.assign(r.acceptance || {}, { [k]: i.value }); if (k === 'by' && i.value) { G.log(r, 'Acceptance recorded by ' + i.value + (users.active() ? ' (signed in as ' + users.name() + ')' : '')); users.audit('risk accepted', r.id, S.ws); } touch(); }); return i; };
  const c = G.crgOf(r, R);
  const d = el('div', 'grid g3', { style: { marginTop: '10px' } },
    el('div', { style: { gridColumn: '1 / -1' } }, field('<b>Risk title</b>', inp('title'))),
    field('Category', sel('category', G.CATEGORIES)), field('Owner', inp('owner')), field('Status', sel('status', G.RSTATUS, true)),
    field('Treatment', sel('treatment', G.TREAT)), field('Next review', inp('review', { type: 'date' })), field('Threat description', inp('threatText')));
  const desc = el('textarea', null, r.desc || ''); desc.addEventListener('change', () => { r.desc = desc.value; touch(); });
  return card({ id: 'risk-edit' }, el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `${r.id} — ${r.title || 'new risk'}`),
      el('button', { class: 'btn sm ghost danger', onclick: () => { if (!confirm(`Delete ${r.id}?`)) return; ws.risks = ws.risks.filter(x => x !== r); editId = null; touch(); render(sec); } }, 'Delete'),
      el('button', { class: 'btn sm ghost', onclick: () => { editId = null; render(sec); } }, 'Close')),
    c ? el('div', 'note', `CRG (linked scenarios): estimated ${n0(c.est)}, tolerated ${n0(c.tol)}, residual ${n0(c.res)} — ratio ${n2(c.ratio)}, `, pill(c.cls, pillFor(c.cls))) : el('div', 'note', 'No scenario linked: CRG figures need at least one scenario.'),
    d, field('Description', desc),
    el('div', 'grid g3', { style: { marginTop: '10px' } }, rating('inherent'), rating('current'), rating('target')),
    el('h4', null, 'Threats (ATT&CK)'), linkEditor(r.threats, 'attack', () => touch()),
    el('h4', null, 'Vulnerabilities (CVE)'), linkEditor(cveA, 'cve', syncV, { placeholder: 'CVE-… — press Enter' }),
    el('h4', null, 'Weaknesses (CWE)'), linkEditor(cweA, 'cwe', syncV),
    el('h4', null, 'Scenarios'), scBox,
    el('h4', null, 'Assets'), (ws.assets || []).length ? asBox : el('div', 'small muted', 'No asset yet — add them in Information assets.'),
    el('h4', null, 'Measures'), (ws.measures || []).length ? msBox : el('div', 'small muted', 'No measure yet — see Risk mitigation.'),
    el('h4', null, 'Formal acceptance'), el('div', 'grid g4', field('Accepted by', accIn('by')), field('Date', accIn('date')), field('Valid until', accIn('until')), field('Rationale', accIn('rationale'))),
    el('details', { style: { marginTop: '10px' } }, el('summary', null, `History (${(r.history || []).length})`),
      table([{ key: 'date', label: 'Date', cls: 'mono' }, { key: 'what', label: 'Change' }], (r.history || []).slice().reverse(), { class: 'compact' })));
}
