/* The screens the two population-register modules share — Identity & access management (panels/iam.js) and
   Configuration management (panels/cm.js): Overview, Findings & proposals, Import from a report, the read-only card
   the Scenario editor shows, and the register helpers (count fields, provenance, status pill, live checks). Each
   function takes the module's model (X = js/iam.js or js/cm.js), which offers the same names.
   Counts per population only: no names, no account identifiers, no secrets. Nothing here changes a scenario
   except "Accept" on a proposal, a separate act of the analyst.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, kpi, pill, banner, table, field, select, toast, today, modal, n0, go, parseCSV } from '../util.js';
import { S, touch } from '../state.js';
import * as SH from '../shared.js';
import * as MK from '../markers.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';
import * as X_ from '../extract.js';
import * as LOG from '../logs.js';
import * as users from '../users.js';
import * as G from '../grcui.js';
import * as C from '../regcore.js';
import { tr } from '../i18n.js';

/* ---------------- register helpers ---------------- */
export const COUNT_HINT = 'Leave blank when unknown — 0 means none';
export const count = (key, label) => ({ key, label, type: 'number', step: 1, hint: COUNT_HINT });
/** Provenance tag, kept inside prov {tag, method, file, date}. */
const provField = () => ({ key: 'prov', label: 'Provenance', make: v => { const s = select(C.TAGS.map(t => [t, t]), v?.tag || 'ASSUMPTION'); return { node: s, get: () => ({ ...(v || {}), tag: s.value, method: v?.method || 'manual', date: v?.date || new Date().toISOString().slice(0, 10) }) }; } });
export const evidenceField = ws => ({ key: 'evidence', label: 'Evidence (E-number)', type: 'select', options: [['', '—'], ...(ws.assessment.EVIDENCE || []).map(r => [r[0], r[0] + ' ' + String(r[1] || '').slice(0, 60)])] });
export const tail = ws => [{ key: 'source', label: 'Source (at most 200 characters)', type: 'text', wide: true }, { key: 'status', label: 'Status', type: 'select', options: C.STATUS },
  { key: 'conf', label: 'Confidence', type: 'select', options: C.CONF }, evidenceField(ws), provField(), { key: 'note', label: 'Note', type: 'area' }];
/** Status pill, stale badge and the analytical-estimate marker of a row. */
export function stateCell(register, r, ws) {
  const st = C.STATUS.find(x => x[0] === r.status) || C.STATUS[0];
  const stale = C.rowStale(register, r, ws);
  const est = ['INFERENCE', 'ASSUMPTION'].includes(r.prov?.tag) && r.status !== 'confirmed';
  return el('div', null, pill(tr(st[1]), r.status === 'confirmed' ? 'good' : r.status === 'conflicting' ? 'bad' : r.status === 'unknown' ? 'warn' : ''),
    stale ? pill(tr('stale'), 'warn') : null, est ? el('div', 'small muted', MK.ESTIMATE) : null);
}
/** An unknown count reads "unknown", never 0. */
export const cnt = v => v === null || v === undefined || v === '' ? el('span', 'muted', tr('unknown')) : String(v);
export const gap = (body, rows) => { if (!rows.length) body.append(banner('warn', MK.INFO_GAP, 'This register is empty.')); };
/** A register of a module: the live checks run in the form. */
export function moduleRegister(X, ws, register, spec) {
  const R = X.reg(ws);
  return G.register({ rows: R[register], prefix: C.REGISTERS[register].prefix, csv: true, ...spec,
    blank: () => ({ ...C.blankRow(register), id: C.nextIdReg(R[register], C.REGISTERS[register].prefix) }),
    check: r => C.validate(register, r) });
}

/** The router of a module screen: title, sub-tabs, and the tab drawn by its own register tabs or the shared ones. */
export function makeScreen(X, TABS, REG_TABS) {
  let view = 'overview';
  const IMP = importState();
  function render(sec, arg) {
    const a = String(arg || '').split('/')[0];
    if (TABS.some(t => t[0] === a)) view = a;
    if (view !== 'import') IMP.release();
    const ws = S.ws; X.reg(ws);
    sec.replaceChildren(el('h1', null, X.LABEL));
    const st = el('div', { class: 'subtabs', role: 'tablist' });
    for (const [k, t] of TABS) st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; go(X.ID + '/' + k); } }, t));
    sec.append(st);
    const body = el('div'); sec.append(body);
    const redraw = () => render(sec, view);
    if (REG_TABS[view]) return REG_TABS[view](body, redraw, ws);
    if (view === 'findings') return findings(X, body, redraw, ws);
    if (view === 'import' && TABS.some(t => t[0] === 'import')) return importTab(X, IMP, body, redraw, ws);
    overview(X, body, redraw, ws);
  }
  return { render, IMP };
}

/* ---------------- shared bits ---------------- */
const fmt = (d, v) => v === null || v === undefined ? '—' : d.unit === '%' ? (Math.round(v * 100) / 100) + ' %' : String(v);
const kind = k => k === 'bad' ? 'bad' : k === 'warn' ? 'warn' : k === 'good' ? 'good' : '';
export const who = () => users.name() || '';
/** The window inputs of each module (Identity & access management keeps every window; Configuration management the freshness one). */
const WINDOWS = [['staleDays', 'Freshness window (days)'], ['reviewMonths', 'Privileged-review window (months)'], ['testDays', 'Emergency-test window (days)'], ['dormantDays', 'Dormant after (days)']];

/* ---------------- Overview ---------------- */
function overview(X, body, redraw, ws) {
  const R = X.reg(ws), K = X.kri(ws), defs = X.defsWithOverrides(ws), id = X.ID;
  const empty = !X.REGISTER_KEYS.some(k => R[k].length);
  if (empty) body.append(banner('warn', MK.INFO_GAP, X.AI_KEYS && X.countsFromTable ? 'No register holds a row yet. Enter the populations by hand, or propose counts from a report (Import from a report).'
    : 'No register holds a row yet. Enter the baselines, scopes, deviations and changes by hand, or propose counts from a report (Import from a report).'));
  // settings
  const at = el('input', { type: 'date', value: R.settings.asOf || '', id: id + '-asof' });
  at.addEventListener('change', () => { if (at.value && at.value > today()) { toast(tr('A date of this register cannot be in the future.'), 'bad'); at.value = R.settings.asOf || ''; return; } R.settings.asOf = at.value || null; touch(); redraw(); });
  const numIn = k => { const i = el('input', { type: 'number', min: 1, step: 1, value: R.settings[k] }); i.addEventListener('change', () => { const v = Number(i.value); if (Number.isInteger(v) && v > 0) { R.settings[k] = v; touch(); redraw(); } else i.value = R.settings[k]; }); return i; };
  const wins = WINDOWS.filter(([k]) => k in X.blankSettings());
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'As-of date and windows'),
    el('div', 'grid g5', field('As of (empty = today)', at), ...wins.map(([k, l]) => field(l, numIn(k)))),
    el('p', 'note', tr('Indicators are computed as of {0}.').replace('{0}', K.asOf))));
  // KRI tiles
  body.append(el('div', { class: 'grid g4', id: id + '-kris' }, ...defs.map(d => {
    const v = K.values[d.id], m = K.meta[d.id], st = X.status(d, v, m);
    const sub = m.empty ? tr('no data') : m.gap ? `${tr('no data')} · ${tr('{0} unknown').replace('{0}', m.unknown)} · ${tr('Information gap — organizational validation required')}` : m.na ? tr('not applicable') : d.unit === 'count' ? tr('{0} expired').replace('{0}', m.num)
      : `${m.num} / ${m.den} · ${tr('{0} unknown').replace('{0}', m.unknown)} · ${tr('{0} stale').replace('{0}', m.stale)}` + (d.id === 'CRG-22' && m.legacy ? ' · ' + tr('{0} legacy').replace('{0}', m.legacy) : '')
        + (d.id === 'CRG-18' && m.den ? ' · ' + tr('phishing-resistant {0}').replace('{0}', Math.round(1000 * m.pr / m.den) / 10 + ' %') : '');
    const t = kpi(`${d.id} ${tr(d.name)}`, fmt(d, v), sub, kind(st.k));
    t.dataset.kri = d.id; t.append(el('div', 's', pill(tr(st.label), kind(st.k))));
    return t;
  })));
  const kc = X.ID === 'cm' ? 'CRG-25' : 'CRG-23';
  if (K.meta[kc] && !K.meta[kc].empty) body.append(el('p', 'note', tr('Unknown share {0} %, stale values {1}.').replace('{0}', K.values[kc] === null ? '—' : Math.round((100 - K.values[kc]) * 100) / 100).replace('{1}', K.meta[kc].staleValues)));
  // completeness + figures
  const F = X.figures(ws);
  const figs = X.ID === 'iam' ? [
    { k: tr('Dormant accounts'), v: F.dormant === null ? '—' : n0(F.dormant) + (F.dormantUnknown ? ' · ' + tr('{0} rows unknown').replace('{0}', F.dormantUnknown) : '') },
    { k: tr('Revocations not verified'), v: F.unverified === null ? '—' : n0(F.unverified) }] : [
    { k: tr('Open high-severity deviations'), v: F.highOpen.length ? F.highOpen.map(x => `${x.id}${x.age !== null ? ' · ' + tr('{0} days').replace('{0}', x.age) : ''}`).join(', ') : '0' },
    { k: tr('Changes verified'), v: F.changesVerified === null ? '—' : F.changesVerified + ' %' },
    { k: tr('Baseline adherence (compliant ÷ assessed)'), v: F.adherence === null ? '—' : F.adherence + ' %' + (F.unassessed !== null ? ' · ' + tr('{0} % unassessed').replace('{0}', F.unassessed) : '') }];
  body.append(el('div', 'grid g2',
    card(el('h2', { style: { marginTop: 0 } }, 'Completeness per register'), table([
      { key: 'label', label: 'Register', render: r => tr(r.label) }, { key: 'rows', label: 'Rows', num: true }, { key: 'complete', label: 'Complete', num: true }, { key: 'stale', label: 'Stale', num: true },
      { key: 'g', label: '', render: r => r.rows ? '' : pill(tr('information gap'), 'warn') }], X.completeness(ws), { class: 'compact' })),
    card(el('h2', { style: { marginTop: 0 } }, 'Key figures'), table([{ key: 'k', label: 'Figure' }, { key: 'v', label: 'Value' }], figs, { class: 'compact' }))));
  maturityCard(X, body, redraw, ws);
  thresholds(X, body, redraw, ws);
  if (X.crgoPending().length) body.append(el('p', 'note small', tr('Ontology alignment: {0} concepts wait for their CRGO 0.11 identifiers.').replace('{0}', X.crgoPending().length)));
  else if (X.crgoProposed().length) body.append(el('p', 'note small', tr('Ontology alignment: CRGO {0} identifiers; {1} of them are proposed terms awaiting the CRGO project owner’s approval.')
    .replace('{0}', X.CRGO_RELEASE).replace('{1}', X.crgoProposed().length)));
  else body.append(el('p', 'note small', tr('Ontology alignment: CRGO {0} identifiers, all approved by the CRGO project owner.').replace('{0}', X.CRGO_RELEASE)));
}

function maturityCard(X, body, redraw, ws) {
  const items = X.prefill(ws);
  const lab = it => it.kind === 'answer' ? tr('Resilience question {0}').replace('{0}', it.key) : it.kind === 'category' ? tr('CSF 2.0 category {0}').replace('{0}', it.key) : tr('Statement of applicability {0}').replace('{0}', it.key);
  const show = v => v === -1 ? tr('Unknown') : String(v);
  const ticks = items.map(it => el('input', { type: 'checkbox', checked: it.current === null || it.current === undefined || it.current === '', disabled: !(it.current === null || it.current === undefined || it.current === ''), style: { width: 'auto' } }));
  body.append(card({ id: X.ID + '-maturity' }, el('h2', { style: { marginTop: 0 } }, 'Maturity proposals'),
    el('p', 'note', 'Proposed from the registers for the existing maturity, resilience and statement-of-applicability answers. "Apply ticked" fills empty cells only; a different existing answer is shown and never overwritten.'),
    items.length ? table([
      { key: 't', label: '', sortable: false, render: (it, i) => ticks[i] },
      { key: 'k', label: 'Answer', render: lab }, { key: 'v', label: 'Proposed', render: it => el('b', null, tr(show(it.value))) },
      { key: 'c', label: 'Existing answer', render: it => it.current === null || it.current === undefined || it.current === '' ? el('span', 'muted', tr('empty')) : pill(tr(show(it.current)), String(it.current) === String(it.value) ? 'good' : 'warn') },
      { key: 'r', label: 'Why', render: it => el('span', { class: 'small', 'data-noi18n': '' }, it.rationale) }], items, { class: 'compact' }) : el('div', 'empty-state', tr('Nothing to propose yet.')),
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn', id: X.ID + '-apply-prefill', disabled: !items.length, onclick: () => {
      const n = X.applyPrefill(ws, items.filter((_, i) => ticks[i].checked));
      LOG.data('maturity proposals applied', `${n}`, X.LABEL, ws.name);
      touch(); toast(tr('{0} empty answers filled — review each one').replace('{0}', n)); redraw();
    } }, 'Apply ticked'), el('button', { class: 'btn ghost', onclick: () => go('maturity') }, 'Open Maturity & resilience'))));
}

function thresholds(X, body, redraw, ws) {
  const defs = X.defsWithOverrides(ws);
  const inp = (d, k) => { const i = el('input', { type: 'number', step: 'any', value: d[k] ?? '', style: { width: '80px' }, 'data-kri': d.id, 'data-k': k });
    i.addEventListener('change', () => { const cur = X.defsWithOverrides(ws).find(x => x.id === d.id); const o = { target: cur.target, warn: cur.warn, crit: cur.crit, [k]: i.value === '' ? null : Number(i.value) };
      X.setOverride(ws, d.id, o, who()); touch(); redraw(); });
    return i; };
  body.append(card({ id: X.ID + '-thresholds' }, el('h2', { style: { marginTop: 0 } }, 'Indicator thresholds'),
    table([{ key: 'id', label: 'KRI', render: d => el('span', null, el('b', null, d.id + ' '), tr(d.name)) }, { key: 'dir', label: 'Direction', render: d => d.dir === 'up' ? tr('higher is better') : tr('lower is better') },
      { key: 't', label: 'Target', render: d => inp(d, 'target') }, { key: 'w', label: 'Warning', render: d => inp(d, 'warn') }, { key: 'c', label: 'Critical', render: d => inp(d, 'crit') },
      { key: 'o', label: '', render: d => d.override ? el('button', { class: 'btn xs ghost', onclick: () => { X.setOverride(ws, d.id, null); touch(); redraw(); } }, 'Restore default') : el('span', 'muted small', tr('default')) }],
    defs, { class: 'compact' })));
}

/* ---------------- Findings & proposals ---------------- */
const regLabel = k => tr(C.REGISTERS[k]?.label || k);
const sevKind = s => s === 'high' ? 'bad' : s === 'medium' ? 'warn' : '';
const pname = p => C.PARAMS.find(x => x[0] === p)?.[1] || p;
const hint = (X, r) => X.RULE[r]?.param ? `${pname(X.RULE[r].param)} ${X.RULE[r].dir}` : '—';

function findings(X, body, redraw, ws) {
  const R = X.reg(ws), props = X.proposed(ws), id = X.ID;
  body.append(card({ id: id + '-proposed' }, el('h2', { style: { marginTop: 0 } }, tr('Proposed findings ({0})').replace('{0}', props.length)),
    el('p', 'note', 'Derived by deterministic rules from the registers. The direction is a hint only; no value is computed.'),
    props.length ? table([
      { key: 'rule', label: 'Rule', render: p => el('b', null, p.rule) }, { key: 'title', label: 'Finding', render: p => tr(p.title) },
      { key: 'row', label: 'Row', render: p => el('span', { 'data-noi18n': '' }, `${p.rowId} ${p.label}`) }, { key: 'reg', label: 'Register', render: p => regLabel(p.register) },
      { key: 'sev', label: 'Severity', render: p => pill(tr(C.SEVERITY.find(x => x[0] === p.severity)[1]), sevKind(p.severity)) }, { key: 'h', label: 'Direction hint', render: p => hint(X, p.rule) },
      { key: 'a', label: '', sortable: false, render: p => el('div', 'btnrow',
        el('button', { class: 'btn xs', 'data-rule': p.rule, 'data-row': p.rowId, onclick: () => { const f = X.record(ws, p); LOG.data('finding recorded', f.id, p.rule, ws.name); touch(); redraw(); } }, 'Record'),
        el('button', { class: 'btn xs ghost', onclick: () => { const why = window.prompt(tr('Why is this finding dismissed?')); if (!why || !why.trim()) return; X.record(ws, p, 'dismissed', why.trim()); touch(); redraw(); } }, 'Dismiss')) }],
      props, { class: 'compact' }) : el('div', 'empty-state', tr('No new finding from the registers.'))));
  const rec = R.findings.filter(f => f.state === 'recorded');
  body.append(card({ id: id + '-recorded' }, el('h2', { style: { marginTop: 0 } }, tr('Recorded findings ({0})').replace('{0}', rec.length)),
    rec.length ? table([
      { key: 'id', label: 'ID', render: f => el('b', null, f.id) }, { key: 'rule', label: 'Rule', render: f => f.rule }, { key: 't', label: 'Finding', render: f => tr(f.title) },
      { key: 'row', label: 'Row', render: f => el('span', { 'data-noi18n': '' }, `${f.rowId} ${C.rowLabel(f.register, C.rowOf(ws, f))}`) },
      { key: 'sev', label: 'Severity', render: f => pill(tr(C.SEVERITY.find(x => x[0] === f.severity)?.[1] || f.severity), sevKind(f.severity)) },
      { key: 'eid', label: 'Evidence', render: f => f.eid ? el('a', { href: '#/evidence' }, f.eid) : '—' },
      { key: 'sc', label: 'Scenarios', render: f => f.scenarios.map(s => s.id + (s.param ? ' ' + pname(s.param) : '')).join(', ') || '—' },
      { key: 'a', label: '', sortable: false, render: f => el('div', 'btnrow',
        f.eid ? null : el('button', { class: 'btn xs', 'data-act': 'evidence', 'data-f': f.id, onclick: () => { const eid = X.recordEvidence(ws, f, regLabel(f.register), tr(f.title)); LOG.data('evidence added', eid, f.id, ws.name); touch(); toast(tr('Saved {0}').replace('{0}', eid)); redraw(); } }, 'Record as evidence'),
        el('button', { class: 'btn xs ghost', 'data-act': 'link', 'data-f': f.id, onclick: () => linkDialog(X, ws, f, redraw) }, 'Link scenario'),
        el('button', { class: 'btn xs ghost', 'data-act': 'propose', 'data-f': f.id, onclick: () => proposeDialog(X, ws, f, redraw) }, 'Propose a parameter change'),
        f.action ? el('a', { class: 'small', href: '#/shared/actions' }, f.action) : el('button', { class: 'btn xs ghost', onclick: () => { const A = SH.actions(ws); const aid = 'ACT-' + String(A.reduce((m, a) => Math.max(m, Number(String(a.id).split('-').pop()) || 0), 0) + 1).padStart(3, '0');
          A.push({ id: aid, title: tr(f.title), source: { kind: X.MODULE.findingKind, id: f.id }, state: 'open', links: [], opened: today(), owner: C.rowOf(ws, f)?.owner || '' }); f.action = aid; touch(); toast(tr('Saved {0}').replace('{0}', aid)); redraw(); } }, 'Raise an action')) }],
      rec, { class: 'compact' }) : el('div', 'empty-state', tr('No finding recorded yet.'))));
  // proposals
  const all = R.findings.flatMap(f => (f.proposals || []).map(p => ({ f, p })));
  const a = ws.assessment;
  const ratio = (sc, param, v) => { try { return CRG.calc(v === undefined ? sc : { ...sc, params: { ...sc.params, [param]: { ...sc.params[param], v } } }, a.APPETITE, a.FACTOR).ratio; } catch { return null; } };
  body.append(card({ id: id + '-proposals' }, el('h2', { style: { marginTop: 0 } }, tr('Proposals ({0})').replace('{0}', all.length)),
    el('p', 'note', 'A proposal changes nothing. Accept writes the value into the scenario, with the finding and its E-number in the scenario\'s basis, its revisions and the revision log. Dismiss needs a reason.'),
    all.length ? table([
      { key: 'f', label: 'Finding', render: x => `${x.f.id} ${x.f.rule}` }, { key: 's', label: 'Scenario', render: x => el('a', { href: '#/scenario/' + x.p.scenario }, x.p.scenario) },
      { key: 'p', label: 'Parameter', render: x => pname(x.p.param) },
      { key: 'v', label: 'From → to', render: x => `${x.p.from} → ${x.p.to}` },
      { key: 'r', label: 'Ratio now → after', render: x => { const sc = a.SCEN.find(s => s.id === x.p.scenario); if (!sc) return '—'; const r0 = ratio(sc), r1 = ratio(sc, x.p.param, x.p.to); return r0 === null ? '—' : `${r0.toFixed(2)} → ${r1.toFixed(2)}`; } },
      { key: 'c', label: 'Confidence', render: x => tr(x.p.conf) }, { key: 'w', label: 'Rationale', render: x => el('span', { class: 'small', 'data-noi18n': '' }, x.p.rationale) },
      { key: 'st', label: 'State', render: x => pill(tr({ proposed: 'Proposed', accepted: 'Accepted', dismissed: 'Dismissed' }[x.p.state]), x.p.state === 'accepted' ? 'good' : x.p.state === 'dismissed' ? '' : 'warn') },
      { key: 'a', label: '', sortable: false, render: x => x.p.state !== 'proposed' ? el('span', 'small muted', [x.p.decidedOn, x.p.decidedBy, x.p.reason].filter(Boolean).join(' · ')) : el('div', 'btnrow',
        el('button', { class: 'btn xs', 'data-act': 'accept', onclick: () => {
          if (!window.confirm(tr('Accept this proposal? The scenario parameter changes and the change is journalled.'))) return;
          try { X.accept(ws, x.f, x.p, who()); LOG.data('proposal accepted', x.p.scenario, x.f.id, ws.name); touch('redraw'); toast(tr('Accepted')); } catch (e) { toast(tr(e.message), 'bad'); }
        } }, 'Accept'),
        el('button', { class: 'btn xs ghost', 'data-act': 'dismiss', onclick: () => {
          const why = window.prompt(tr('Why is this proposal dismissed?'));
          try { X.dismiss(x.f, x.p, why, who()); touch(); redraw(); } catch (e) { toast(tr(e.message), 'bad'); }
        } }, 'Dismiss')) }], all, { class: 'compact' }) : el('div', 'empty-state', tr('No proposal yet.'))));
  const dis = R.findings.filter(f => f.state === 'dismissed');
  if (dis.length) body.append(el('details', null, el('summary', null, tr('Dismissed findings ({0})').replace('{0}', dis.length)),
    el('ul', 'small', ...dis.map(f => el('li', null, `${f.id} ${f.rule} ${f.rowId} — `, el('span', { 'data-noi18n': '' }, f.reason || ''))))));
}

function scenarioOptions(ws, f) {
  const linked = new Set(f.scenarios.map(s => s.id));
  return ws.assessment.SCEN.slice().sort((a, b) => (linked.has(b.id) - linked.has(a.id))).map(s => [s.id, `${s.id} ${String(s.name || '').slice(0, 70)}`]);
}
function linkDialog(X, ws, f, redraw) {
  const id = X.ID;
  const sc = select(scenarioOptions(ws, f), f.scenarios[0]?.id || ''); sc.id = id + '-link-scen'; sc.setAttribute('data-noi18n', '');
  const pr = select([['', '—'], ...C.PARAMS], X.RULE[f.rule]?.param || ''); pr.id = id + '-link-param';
  const m = modal(tr('Link scenario'), el('p', 'note', 'The finding cites the scenario; the scenario itself is not modified.'),
    el('div', 'grid g2', field('Scenario', sc), field('Parameter concerned', pr)),
    el('div', 'btnrow', el('button', { class: 'btn', id: id + '-link-save', onclick: () => { C.link(f, sc.value, pr.value || null); touch(); m.close(); redraw(); } }, 'Link'),
      el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
}
function proposeDialog(X, ws, f, redraw) {
  const a = ws.assessment, rule = X.RULE[f.rule], id = X.ID;
  const sc = select(scenarioOptions(ws, f), f.scenarios[0]?.id || ''); sc.id = id + '-prop-scen'; sc.setAttribute('data-noi18n', '');
  const pr = select(C.PARAMS, rule?.param || 'Pbx'); pr.id = id + '-prop-param';
  const to = el('input', { type: 'number', step: '0.01', min: 0, max: 1, id: id + '-prop-to' });
  const conf = select(C.CONF, 'Low'); conf.id = id + '-prop-conf';
  const rat = el('textarea', { rows: 3, id: id + '-prop-rat', 'data-noi18n': '' });
  rat.value = `${f.rule} ${tr(f.title)} (${f.id}${f.eid ? ', ' + f.eid : ''}). ${MK.ESTIMATE}.`;
  const cur = el('div'), msg = el('div');
  const upd = () => {
    const s = a.SCEN.find(x => x.id === sc.value); if (!s) return;
    const from = Number(s.params?.[pr.value]?.v);
    let r0 = null, r1 = null; try { r0 = CRG.calc(s, a.APPETITE, a.FACTOR).ratio; if (to.value !== '') r1 = CRG.calc({ ...s, params: { ...s.params, [pr.value]: { ...s.params[pr.value], v: Number(to.value) } } }, a.APPETITE, a.FACTOR).ratio; } catch { /* shown as — */ }
    cur.replaceChildren(el('div', 'grid g3', kpi('Current value', String(from)), kpi('Direction hint', rule?.param === pr.value ? `${pname(pr.value)} ${rule.dir}` : '—'),
      kpi('Ratio now → after', r0 === null ? '—' : `${r0.toFixed(2)} → ${r1 === null ? '…' : r1.toFixed(2)}`)));
  };
  for (const x of [sc, pr, to]) x.addEventListener('input', upd);
  const m = modal(tr('Propose a parameter change'), el('p', 'note', 'Type the value you propose: nothing is computed for you, and saving changes nothing in the scenario.'),
    el('div', 'grid g2', field('Scenario', sc), field('Parameter', pr), field('To', to), field('Confidence', conf)), cur, field('Rationale', rat), msg,
    el('div', 'btnrow', el('button', { class: 'btn', id: id + '-prop-save', onclick: () => {
      try { C.propose(ws, f, { scenario: sc.value, param: pr.value, to: to.value === '' ? '' : Number(to.value), conf: conf.value, rationale: rat.value, by: who() }); C.link(f, sc.value, pr.value); }
      catch (e) { msg.replaceChildren(banner('bad', tr(e.message))); return; }
      touch(); m.close(); toast(tr('Saved as a proposal — nothing changed yet')); redraw();
    } }, 'Save as proposal'), el('button', { class: 'btn ghost', onclick: () => m.close() }, 'Cancel')));
  upd();
}

/* ---------------- Import from a report ---------------- */
/* The file is held in a module's import state, in memory, for the time of the review only: never in ws.docs, blobs or importLog. */
export function importState() {
  const IMP = { file: null, text: '', rows: null, sha: '', bytes: 0, items: null, method: '', dropped: 0, release() { Object.assign(IMP, { file: null, text: '', rows: null, sha: '', bytes: 0, items: null, method: '', dropped: 0 }); } };
  return IMP;
}

/* The instructions sent to the model (never shown as interface text). They come first and are long, so the
   AI log's one-line summary never reaches the report itself. */
const SYSTEM = `You are a senior cybersecurity risk analyst who extracts aggregate, population-level counts
from organizational reports. You never output personal information or secrets, and never calculate risk.`;

/** The module's AI task (extract_s_<module>: sensitive extraction, routed to the local model by default). */
export function registerTask(X, label) {
  AI.TASKS['extract_s_' + X.ID] = {
    label,
    build(ws, { text = '' } = {}) {
      return { system: SYSTEM, prompt: [X.AI_PROMPT, '', 'DOCUMENTS:', text].join('\n'), max_tokens: 3000, json: true, keepLanguage: true };
    },
  };
}

function importTab(X, IMP, body, redraw, ws) {
  const R = X.reg(ws), id = X.ID;
  body.append(banner('', 'Counts only, read in memory', 'The file is read on this computer for the time of the review and released after Accept or when you leave this tab. Only the counts you accept are kept, with the file name, its SHA-256, its size and the row count as the import trace.'));
  const fileIn = el('input', { type: 'file', id: id + '-file', accept: '.csv,.xlsx,.xlsm,.pdf,.docx,.txt,.md' });
  const status = el('div');
  fileIn.addEventListener('change', async () => {
    const f = fileIn.files[0]; if (!f) return;
    IMP.release();
    try {
      const buf = await f.arrayBuffer();
      const out = await X_.extractText(f);
      Object.assign(IMP, { file: f.name, text: out.text, bytes: buf.byteLength, sha: await C.sha256(buf) });
      const ext = f.name.toLowerCase().split('.').pop();
      if (X.countsFromTable && ['csv', 'xlsx', 'xlsm'].includes(ext)) IMP.rows = C.tableRows(out.text, parseCSV);
      redraw();
    } catch (e) { status.replaceChildren(banner('bad', 'Could not read the file', String(e.message || e))); }
  });
  body.append(card(el('h2', { style: { marginTop: 0 } }, '1. File'), field('CSV, XLSX, PDF, DOCX or TXT', fileIn), status,
    IMP.file ? el('p', 'small', { 'data-noi18n': '' }, `${IMP.file} · ${n0(IMP.bytes)} B · SHA-256 ${IMP.sha.slice(0, 16)}…`) : null));
  if (IMP.file && !IMP.items) {
    if (IMP.rows) {
      const header = IMP.rows[0] || [], cols = X.guessColumns(header);
      const sels = {};
      const opts = [[-1, '—'], ...header.map((h, i) => [i, String(h)])];
      const grid = el('div', 'grid g4', ...[['type', 'Account type'], ['enabled', 'Enabled'], ['lastSignIn', 'Last sign-in'], ['mfa', 'MFA'], ['mfaMethod', 'MFA method'], ['owner', 'Owner'], ['tier', 'Role or tier']]
        .map(([k, l]) => { const s = select(opts, cols[k]); s.dataset.col = k; s.setAttribute('data-noi18n', ''); sels[k] = s; return field(l, s); }));
      body.append(card(el('h2', { style: { marginTop: 0 } }, '2. Rules (offline)'),
        el('p', 'note', tr('{0} rows. Map the columns; the counts per population and tier are computed here, dormant = last sign-in older than {1} days.').replace('{0}', IMP.rows.length - 1).replace('{1}', R.settings.dormantDays)),
        grid, el('div', 'btnrow', el('button', { class: 'btn', id: id + '-rules', onclick: () => {
          const c = Object.fromEntries(Object.entries(sels).map(([k, s]) => [k, Number(s.value)]));
          const r = X.countsFromTable(IMP.rows.slice(1), c, { dormantDays: R.settings.dormantDays, at: X.asOf(ws) });
          IMP.items = r.items; IMP.method = 'rules'; redraw();
        } }, 'Compute the counts'))));
    }
    aiBox(X, IMP, body, redraw, ws);
  }
  if (IMP.items) review(X, IMP, body, redraw, ws);
  if (R.imports.length) body.append(card(el('h2', { style: { marginTop: 0 } }, 'Import trace'), table([
    { key: 'at', label: 'When', render: x => x.at.slice(0, 16).replace('T', ' ') }, { key: 'file', label: 'File', render: x => el('span', { 'data-noi18n': '' }, x.file) },
    { key: 'sha', label: 'SHA-256', render: x => el('span', 'mono small', x.sha256.slice(0, 16) + '…') }, { key: 'bytes', label: 'Bytes', num: true }, { key: 'rows', label: 'Rows', num: true },
    { key: 'method', label: 'Method' }, { key: 'proposed', label: 'Proposed', num: true }, { key: 'accepted', label: 'Accepted', num: true }, { key: 'by', label: 'By' }], R.imports.slice().reverse(), { class: 'compact' })));
}

function aiBox(X, IMP, body, redraw, ws) {
  const id = X.ID, task = 'extract_s_' + id;
  const route = AI.route(task, ws), remote = route.provider && !AI.isLocal(route.provider);
  const n = C.tokenCount(IMP.text);
  const tick = el('input', { type: 'checkbox', id: id + '-remote-ok', style: { width: 'auto' } });
  const go2 = el('button', { class: 'btn', id: id + '-ai', disabled: !route.provider || remote, onclick: async () => {
    const out = await aiui.request(task, { text: IMP.text }, { title: tr('Import from a report — what will be sent'), ws });
    if (!out) return;
    try { const r = X.parseAIItems(AI.parseJson(out.text)); IMP.items = r.items; IMP.dropped = r.dropped; IMP.method = 'ai'; redraw(); }
    catch (e) { toast(tr(e.message), 'bad'); }
  } }, 'Prepare the AI request');
  tick.addEventListener('change', () => { go2.disabled = !tick.checked; });
  body.append(card({ id: id + '-ai-box' }, el('h2', { style: { marginTop: 0 } }, IMP.rows ? '3. AI (prose reports)' : '2. AI (prose reports)'),
    el('div', 'grid g3', kpi('Destination', route.provider ? (AI.isLocal(route.provider) ? tr('this machine') : AI.where(route.provider)) : '—', route.provider ? (AI.isLocal(route.provider) ? tr('local model') : tr('remote provider')) : tr(route.why || ''), route.provider ? AI.kindOf(route.provider) : 'bad'),
      kpi('Personal-data-like tokens', n0(n), tr('e-mail, UPN, DOMAIN\\user or SID shapes'), n ? 'warn' : 'good'),
      kpi('Characters', n0(IMP.text.length))),
    n ? el('p', 'note', 'The preview offers the anonymizer before anything is sent.') : null,
    remote ? el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', margin: '8px 0' } }, tick,
      el('span', null, tr('This report contains personal information about staff; I am authorized to send it to {0}.').replace('{0}', AI.provider_label(route.provider)))) : null,
    AI.confidential(ws) ? el('p', 'note', 'This workspace is marked confidential: every call is confirmed.') : null,
    el('div', 'btnrow', go2)));
}

function review(X, IMP, body, redraw, ws) {
  const items = IMP.items, ticks = items.map(() => el('input', { type: 'checkbox', checked: true, style: { width: 'auto' } }));
  const keys = it => Object.entries(it).filter(([k, v]) => !['register', 'type', 'tier', 'tag', 'page'].includes(k) && v !== null && v !== undefined).map(([k, v]) => `${k} ${v}`).join(' · ');
  body.append(card({ id: X.ID + '-review' }, el('h2', { style: { marginTop: 0 } }, tr('Review: {0} proposed counts').replace('{0}', items.length)),
    IMP.dropped ? el('p', 'note', tr('{0} item(s) dropped: not a count, or failing the personal-data or secret guard.').replace('{0}', IMP.dropped)) : null,
    items.length ? table([{ key: 't', label: '', sortable: false, render: (it, i) => ticks[i] }, { key: 'r', label: 'Register', render: it => regLabel(it.register) },
      { key: 'g', label: 'Population', render: it => it.register === 'accounts' ? tr(C.TYPES.find(t => t[0] === it.type)?.[1] || it.type) : it.register === 'privileged' ? tr(C.TIERS.find(t => t[0] === it.tier)?.[1] || '') : (it.type ? tr(C.CH_TYPES.find(t => t[0] === it.type)?.[1] || it.type) : '—') },
      { key: 'c', label: 'Counts', render: it => el('span', 'mono small', keys(it)) }, { key: 'tag', label: 'Provenance', render: it => pill(it.tag, it.tag === 'FACT' ? 'good' : 'warn') },
      { key: 'p', label: 'Page', render: it => it.page || '—' }], items, { class: 'compact' }) : el('div', 'empty-state', tr('Nothing was proposed.')),
    el('div', 'btnrow', { style: { marginTop: '8px' } },
      el('button', { class: 'btn', id: X.ID + '-accept', onclick: () => {
        const made = X.acceptImport(ws, items.filter((_, i) => ticks[i].checked), { file: IMP.file, sha256: IMP.sha, bytes: IMP.bytes, rows: IMP.rows ? IMP.rows.length - 1 : 0, method: IMP.method, by: who() });
        LOG.data('counts imported', `${made.length}`, X.LABEL, ws.name);
        IMP.release(); touch(); toast(tr('{0} rows added with their provenance').replace('{0}', made.length)); redraw();
      } }, 'Accept ticked'),
      el('button', { class: 'btn ghost', onclick: () => { IMP.release(); redraw(); } }, 'Discard'))));
}

/* ---------------- the Scenario editor's read-only card ---------------- */
export function scenarioCard(X, title, s, ws = S.ws) {
  if (!X.on()) return null;
  const F = X.forScenario(s.id, ws), basis = X.basisOf(s, ws);
  if (!F.length && !basis.length) return null;
  return card({ id: X.ID + '-scenario' }, el('h2', null, title),
    el('p', 'note', 'Read-only: findings that cite this scenario. A change to a parameter comes only from an accepted proposal (Findings & proposals).'),
    el('ul', 'small', ...F.map(f => el('li', null, el('b', null, f.eid || '—'), ` ${f.id} ${f.rule} — ${tr(f.title)} (${f.rowId})`))),
    basis.length ? el('div', 'small', el('b', null, tr('Accepted changes: ')), basis.map(b => `${b.date} ${b.parameter} ${b.from} → ${b.to} (${b.finding}${b.eid ? ', ' + b.eid : ''})`).join(' · ')) : null,
    el('button', { class: 'btn sm ghost', onclick: () => go(X.ID + '/findings') }, 'Open Findings & proposals'));
}
