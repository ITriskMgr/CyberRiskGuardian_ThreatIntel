/* ontoprop.js — own scenarios and Add to the ontology (1.9.3, W2b; C7 §I).

   A candidate, a ④ line or a scenario that no scenario of the ontology matches is an own scenario, flagged "theme gap". Add to the
   ontology prepares a library-scenario proposal in CRGO terms (proposal.schema.json, contract library-proposal/v1): causal
   statement, themes, asset categories, threat source types, ATT&CK techniques, CWE, weaknesses, the controls and obligations the
   analyst linked — ANONYMIZED by default with the Risk Registry anonymizer (anon.js), with a preview of exactly what is
   added. NEVER a parameter, an estimate, a CVSS figure, an owner or an organisation figure (the schema has additionalProperties
   false). Status "proposed": nothing enters the library without the administrator's approval (Ontology · CRGO → Proposals).
   Approved proposals stay local unless "Make public" is ticked (text leaves the installation only through the contribution file
   the administrator exports; the application pushes nothing to GitHub). Hidden in classroom and example workspaces.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, pill, toast, modal, field, banner, go } from './util.js';
import { S, touch } from './state.js';
import * as SC from './screening.js';
import * as C from './crgo.js';
import * as CG from './crgo_group.js';
import * as A from './anon.js';
import * as users from './users.js';
import * as LOG from './logs.js';
import * as GR from './ontogroup.js';
import * as FD from './ontofind.js';
import { tr } from './i18n.js';

/** Local yyyy-mm-dd (not UTC: after 19:00 in Montréal UTC is already tomorrow). */
export const today = () => { const d = new Date(), p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; };
const who = () => users.name() || '';

/** Why this workspace cannot propose to the ontology, or null. Decision 11: classroom workspaces (until the Classroom build adds an
 *  instructor control) and the example workspaces (MediBec, CanaRetail). */
export function blockedReason(ws = S.ws) {
  if (ws?.kind === 'classroom') return 'Classroom workspaces cannot propose to the ontology until the Classroom build adds an instructor control.';
  if (ws?.kind === 'example') return 'Example workspaces (MediBec, CanaRetail) cannot propose to the ontology.';
  return null;
}

/* ---------------- sources of a proposal ---------------- */
/** { id, name, store, descriptor(), vulns[], controls[], obligations[], statement } for a scenario, a candidate or a ④ line. */
export function sourceOf(o, ws = S.ws) {
  if (o.kind === 'scenario') {
    const s = o.s;
    return { id: s.id, label: s.name || s.id, holder: s, get: () => s.ontoProposal, set: v => { s.ontoProposal = v; }, descriptor: () => FD.scenarioDescriptor(s, ws),
      vulns: s.vulns || [], controlText: [...(s.crgo?.controls || []), ...(s.controls || [])], obligations: [...(s.obligations || []), ...(s.crgo?.obligations || [])], statement: s.statement || '' };
  }
  if (o.kind === 'candidate') {
    const c = o.c, r = SC.rec(c.id, ws), d = r.draft || {};
    return { id: c.id, label: c.name, holder: r, get: () => r.ontoProposal || null, set: v => { r.ontoProposal = v; }, descriptor: () => {
        const x = GR.descriptorOf(c, ws); if (!x.statement) x.statement = String(d.statement || c.consequence || [c.source, c.vuln, c.assets, c.consequence].filter(Boolean).join(' → ')).slice(0, 4000); return x; },
      vulns: d.vulns?.length ? d.vulns : String(c.vuln || '').split(/;\s*/).filter(Boolean), controlText: [...(d.crgo?.controls || []), ...(Array.isArray(d.existing_controls) ? d.existing_controls : [d.existing_controls || ''])],
      obligations: d.crgo?.obligations || [], statement: d.statement || c.consequence || '' };
  }
  const { s, best } = SC.previewScenario(o.u, ws), h = FD.holderOf(o.u, ws);
  return { id: o.u.id, label: s.name || o.u.id, holder: h, get: () => h.ontoProposal || null, set: v => { h.ontoProposal = v; }, descriptor: () => FD.unitDescriptor(o.u, ws),
    vulns: s.vulns || [], controlText: [...(s.crgo?.controls || []), ...(s.controls || [])], obligations: s.obligations || [], statement: s.statement || '', best };
}
const FW = { ISO22: 'iso27002', CSF2: 'csf2', 'NIST-53': 'sp80053r5' };
/** { csf2: [[id, 'M']], sp80053r5, iso27002 } from the CRGO notations in the analyst's linked controls ("ISO22:5.15"). */
export function controlsFrom(texts) {
  const out = { csf2: [], sp80053r5: [], iso27002: [] };
  for (const t of texts || []) for (const m of String(t).matchAll(/\b(ISO22|CSF2|NIST-53):([A-Za-z0-9][A-Za-z0-9.\-()]{0,40})/g)) {
    const k = FW[m[1]], id = m[2].replace(/[.,;)]+$/, '');
    if (!out[k].some(x => x[0] === id)) out[k].push([id, 'M']);
  }
  return out;
}
const obligationIds = list => [...new Set((list || []).map(x => String(x).split(/\s+[—–-]\s+/)[0].trim()).filter(x => /^[A-Za-z0-9][A-Za-z0-9.\-() ]{0,60}$/.test(x)))].map(x => [x, 'M']);

/* ---------------- the proposal ---------------- */
export const anonOpts = (pub, extra = '') => ({ ...A.DEFAULT_OPTS, enabled: true, dates: !!pub, custom: extra || '' });
/** Build the proposal (CRGO terms, anonymized). → { proposal (raw fields, anonymized), notes: [what was left out and why], ctx, validation } */
export async function build(src, ws = S.ws, { pub = false, extra = '' } = {}) {
  const d = src.descriptor(), V = await GR.vocabulary();
  const val = await FD.validateDescriptor(d);
  const known = kind => new Set((V[kind] || []).map(v => v.key));
  const notes = [], keepKnown = (list, kind, label) => { const k = known(kind), keep = (list || []).filter(x => k.has(x)); if (keep.length < (list || []).length) notes.push(tr('{0} not in the CRGO vocabulary: left out').replace('{0}', label)); return keep; };
  const bad = code => new Set((val.findings || []).filter(f => f.code === code).map(f => String(f.value)));
  const unkT = bad('TECHNIQUE_UNKNOWN'), depT = bad('TECHNIQUE_DEPRECATED'), unkW = bad('CWE_UNKNOWN');
  const tech = [...new Set((d.techniques || []).map(t => String(t).trim().toUpperCase()).filter(Boolean).map(t => val.replaced_techniques?.[t] || t))].filter(t => !unkT.has(t) && !depT.has(t) && /^T[0-9]{4}(\.[0-9]{3})?$/.test(t));
  if (tech.length < (d.techniques || []).length) notes.push(tr('Unknown or deprecated ATT&CK ids left out'));
  const cwe = [...new Set((d.cwe || []).map(w => (/^[0-9]+$/.test(String(w).trim()) ? 'CWE-' : '') + String(w).trim().toUpperCase()))].filter(w => !unkW.has(w) && /^CWE-[0-9]{1,6}$/.test(w));
  let themes = keepKnown(d.themes, 'theme', tr('A theme')); if (!themes.length && val.primary_theme) themes = [val.primary_theme];
  const ctl = controlsFrom(src.controlText);
  const raw = { name: String(d.name || src.label || '').slice(0, 300), statement: String(d.statement || src.statement || '').slice(0, 4000),
    weaknesses: (src.vulns || []).map(x => String(x).trim()).filter(x => x.length >= 3).map(x => x.slice(0, 300)).slice(0, 20) };
  const opts = anonOpts(pub, extra), ctx = A.context(ws, opts);
  const an = A.walk(raw, ctx, opts);
  const proposal = { name: an.name, statement: an.statement, themes: themes.slice(0, 3) };
  const cats = keepKnown(d.asset_categories, 'asset_category', tr('An asset category')), srcT = keepKnown(d.threat_source_types, 'threat_source_type', tr('A threat source type'));
  if (cats.length) proposal.asset_categories = cats.slice(0, 10);
  if (srcT.length) proposal.threat_source_types = srcT.slice(0, 4);
  if (an.weaknesses.length) proposal.weaknesses = an.weaknesses;
  if (tech.length) proposal.techniques = tech.slice(0, 50).map(t => [t, 'M']);
  if (cwe.length) proposal.cwe = cwe.slice(0, 50).map(w => [w, 'M']);
  for (const [k, v] of Object.entries(ctl)) if (v.length) proposal[k] = v.slice(0, 50);
  const ob = obligationIds(src.obligations); if (ob.length) proposal.loi25 = ob.slice(0, 50);
  return { proposal, notes, ctx, val, opts };
}
/** The final object for propose(): the fields of `p` plus who, when, anonymized, source reference, and public when ticked. */
export function finalize(p, src, { by, pub }) {
  const o = { ...p, proposed_by: by, proposed_on: today(), anonymized: true, source_refs: [src.id] };
  if (pub) o.public = true;
  return o;
}
/** Make public at approval (review M1): the stored proposal text goes through the anonymizer again with every option (dates
 *  included) and the leftovers are listed for the administrator to confirm. → { texts: {name, statement, weaknesses}, left } */
export function publicReview(stored, ws = S.ws, extra = '') {
  const opts = anonOpts(true, extra), ctx = A.context(ws, opts);
  const t = A.walk({ name: stored.name || '', statement: stored.statement || '', weaknesses: stored.weaknesses || [] }, ctx, opts);
  const texts = { name: t.name, statement: t.statement, weaknesses: t.weaknesses || [] };
  return { texts, left: leftovers(texts, ctx) };
}
/** Workspace terms still present in the proposal text (replacement table) and name-like pairs the anonymizer could not attribute. */
export function leftovers(p, ctx) {
  const text = [p.name, p.statement, ...(p.weaknesses || [])].join('\n');
  const nl = A.nameLike(text, ctx);
  return { terms: A.residual(text, ctx), pairs: nl.pairs.map(x => x.term), acronyms: nl.acronyms.map(x => x.term) };
}

/* ---------------- status ---------------- */
export const statusText = op => !op ? '' : op.state === 'rejected' ? 'Rejected' : op.public === 'submitted' ? 'Public — submitted' : op.public === 'withdrawn' ? 'Public — withdrawn'
  : op.state === 'approved' ? 'Approved — local' : 'Proposed';
export const statusKind = op => !op ? '' : op.state === 'rejected' ? 'bad' : op.state === 'approved' ? 'good' : 'warn';
/** Bring every ontoProposal of the workspace in line with the store (the Proposals tab and other windows may have decided them). */
export async function syncStatus(ws = S.ws) {
  if (!(await C.proposals.available())) return false;
  const l = await C.proposals.list(); if (l.error) return false;
  const by = new Map((l.proposals || []).map(p => [p.id, p]));
  let changed = false;
  const upd = op => { const p = op?.id && by.get(op.id); if (!p) return; const n = { state: p.status, public: p.public || '', makePublic: !!p.public, approvedBy: p.decided_by || '', approvedAt: p.decided_on || '' };
    for (const [k, v] of Object.entries(n)) if (op[k] !== v) { op[k] = v; changed = true; } };
  for (const s of ws.assessment.SCEN || []) upd(s.ontoProposal);
  for (const r of Object.values(SC.state(ws).cands || {})) upd(r?.ontoProposal);
  if (changed) touch();
  return changed;
}

/* ---------------- the flag and the dialog ---------------- */
/** The theme-gap flag with Edit, Delete and Add to the ontology. `o` as for ontofind ({kind:'scenario'|'unit'|'candidate'}). Nothing when there is no gap. */
export function gapFlag(o, ws, { theme = '', onEdit = null, onDelete = null, onChange = () => {} } = {}) {
  const src = sourceOf(o, ws), op = src.get(), block = blockedReason(ws);
  const box = el('div', { class: 'onto-gap', 'data-gap-for': src.id },
    pill(tr('Theme gap{0}').replace('{0}', theme ? ': ' + theme : ''), 'warn'), ' ',
    el('span', { class: 'small' }, tr('No scenario of the ontology matches: this is an own scenario.')), ' ',
    onEdit ? el('button', { class: 'btn xs ghost', 'data-act': 'gap-edit', onclick: onEdit }, tr('Edit')) : null,
    onDelete ? el('button', { class: 'btn xs ghost danger', 'data-act': 'gap-delete', onclick: onDelete }, tr('Delete')) : null);
  if (block) { box.append(el('span', { class: 'small muted onto-gap-reason' }, tr(block))); return box; }
  if (op) box.append(pill(tr(statusText(op)), statusKind(op)), op.makePublic ? pill(tr('Make public'), '') : null);
  else {
    const b = el('button', { class: 'btn xs', 'data-act': 'add-ontology', onclick: () => dialog(o, ws, onChange) }, tr('Add to the ontology'));
    box.append(b);
    C.proposals.available().then(ok => { if (!ok) { b.disabled = true; b.title = tr(C.NO_HELPER); box.append(el('span', { class: 'small muted onto-gap-nohelper' }, tr(C.NO_HELPER))); } });
  }
  return box;
}

/** Add to the ontology: the preview of exactly what will be added, Make public, and Propose. */
export async function dialog(o, ws, onDone = () => {}) {
  const src = sourceOf(o, ws), block = blockedReason(ws);
  if (block) { toast(tr(block), 'bad'); return; }
  if (!(await C.proposals.available())) { toast(tr(C.NO_HELPER), 'bad'); return; }
  const V = await GR.vocabulary();
  const state = { pub: false, extra: '' };
  let B = await build(src, ws, state);
  const P = B.proposal;
  const body = el('div', { class: 'onto-prop-body' });
  const by = el('input', { value: who(), id: 'onto-prop-by', 'aria-label': tr('Proposed by') });
  const pubBox = el('input', { type: 'checkbox', id: 'onto-prop-public', style: { width: 'auto' } });
  const pubInfo = el('div', { id: 'onto-prop-public-info', hidden: true });
  const extra = el('textarea', { rows: 2, id: 'onto-prop-extra', placeholder: 'Marc-André Léger\nProject Bluefin' });
  const out = el('div');
  const name = el('input', { value: P.name, id: 'onto-prop-name', 'aria-label': tr('Name') }), stm = el('textarea', { rows: 4, id: 'onto-prop-statement', 'aria-label': tr('Statement') });
  stm.value = P.statement;
  const wk = el('textarea', { rows: 3, id: 'onto-prop-weak', 'aria-label': tr('Weaknesses') }); wk.value = (P.weaknesses || []).join('\n');
  const choose = (key, kind, max, label) => {
    const list = P[key] ||= [];
    return field(tr(label), el('div', { class: 'chips', 'data-prop': key }, ...(V[kind] || []).map(v => {
      const cb = el('input', { type: 'checkbox', checked: list.includes(v.key), style: { width: 'auto', margin: 0 }, 'data-key': v.key });
      cb.addEventListener('change', () => { const i = list.indexOf(v.key); if (cb.checked && i < 0) list.push(v.key); if (!cb.checked && i >= 0) list.splice(i, 1); refresh(); });
      return el('label', { class: 'chip', style: { cursor: 'pointer' } }, cb, ' ', el('span', { 'data-noi18n': '' }, v.label));
    })), max ? tr('At most {0}').replace('{0}', max) : '');
  };
  const pairs = (key, label) => (P[key] || []).length ? el('div', { class: 'small', 'data-prop-list': key }, el('b', null, tr(label) + ': '), el('span', { 'data-noi18n': '' }, P[key].map(x => x[0]).join(', '))) : null;
  // the ground truth of the preview: what propose() will send
  const current = () => {
    const p = { ...P, name: name.value.trim(), statement: stm.value.trim() };
    const w = wk.value.split('\n').map(x => x.trim()).filter(x => x.length >= 3); if (w.length) p.weaknesses = w; else delete p.weaknesses;
    for (const k of ['asset_categories', 'threat_source_types']) if (!(p[k] || []).length) delete p[k];
    // the edited text goes through the anonymizer again: typing a name back in does not get it out
    const t = A.walk({ name: p.name, statement: p.statement, weaknesses: p.weaknesses || [] }, A.context(ws, anonOpts(state.pub, state.extra)), anonOpts(state.pub, state.extra));
    p.name = t.name; p.statement = t.statement; if (p.weaknesses) p.weaknesses = t.weaknesses;
    return finalize(p, src, { by: by.value.trim(), pub: state.pub });
  };
  const refresh = () => {
    const f = current();
    const lo = leftovers(f, B.ctx);
    out.replaceChildren(
      el('details', { open: true }, el('summary', { class: 'small' }, tr('Exactly what will be added (JSON)')), el('pre', { id: 'onto-prop-json', class: 'small', style: { whiteSpace: 'pre-wrap', maxHeight: '220px', overflow: 'auto' }, 'data-noi18n': '' }, JSON.stringify(f, null, 1))),
      lo.terms.length ? banner('bad', tr('Workspace terms still present'), lo.terms.join(', ')) : null,
      state.pub ? el('div', { class: 'small', id: 'onto-prop-leftovers' }, el('b', null, tr('Leftover workspace terms') + ': '), lo.terms.length ? lo.terms.join(', ') : tr('none'),
        lo.pairs.length || lo.acronyms.length ? el('div', { class: 'muted' }, tr('Name-like words the anonymizer could not attribute') + ': ' + [...lo.pairs, ...lo.acronyms].join(', ')) : null) : null);
  };
  for (const e of [name, stm, wk, by]) e.addEventListener('input', refresh);
  pubBox.addEventListener('change', async () => {
    state.pub = pubBox.checked; pubInfo.hidden = !state.pub;
    B = await build(src, ws, state); refresh();
  });
  extra.addEventListener('change', async () => { state.extra = extra.value; B = await build(src, ws, state); refresh(); });
  pubInfo.append(banner('warn', tr('This text will leave this installation'), tr('Once the administrator approves it and exports the contribution file, the text goes to the public ontology (ITriskMgr/CyberRiskGuardian-Ontology), where the CRGO maintainer reviews it. The anonymizer was run again with every option, including dates. The application never pushes anything to GitHub.')),
    field(tr('Additional terms to remove (one per line)'), extra));
  body.append(
    el('p', { class: 'note' }, tr('A proposal in CRGO terms. Never included: parameters, estimates, CVSS figures, owners, amounts or organisation figures. Names of the organization, people and assets are replaced. Nothing enters the library without the administrator’s approval (Ontology · CRGO → Proposals).')),
    B.notes.length ? el('p', { class: 'small muted' }, B.notes.join(' · ')) : null,
    field('Name', name), field('Statement', stm),
    choose('themes', 'theme', 3, 'Themes'), choose('asset_categories', 'asset_category', 10, 'Asset categories'), choose('threat_source_types', 'threat_source_type', 4, 'Threat source types'),
    field(tr('Weaknesses (one per line)'), wk),
    pairs('techniques', 'ATT&CK techniques'), pairs('cwe', 'Weaknesses (CWE)'), pairs('csf2', 'NIST CSF 2.0'), pairs('sp80053r5', 'NIST SP 800-53 r5'), pairs('iso27002', 'ISO/IEC 27002:2022'), pairs('loi25', 'Obligations'),
    field('Proposed by', by),
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' } }, pubBox, el('b', null, tr('Make public')), el('span', { class: 'small muted' }, tr('Unticked: the proposal stays in this installation’s ontology and never leaves it.'))),
    pubInfo, out);
  const m = modal(tr('Add to the ontology'), body, el('div', { class: 'btnrow', style: { marginTop: '10px' } },
    el('button', { class: 'btn', id: 'onto-prop-send', onclick: async e => {
      const f = current();
      if (!f.proposed_by) { toast(tr('Say who proposes it'), 'bad'); by.focus(); return; }
      if (f.name.length < 3 || f.statement.length < 10) { toast(tr('The name needs 3 characters and the statement 10.'), 'bad'); return; }
      if (!f.themes.length) { toast(tr('Choose at least one theme'), 'bad'); return; }
      e.target.disabled = true;
      const r = await C.proposals.propose(f);
      e.target.disabled = false;
      if (r.error) { toast(tr(r.message || r.code) + (r.details ? ' — ' + r.details.join('; ') : ''), 'bad'); return; }
      src.set({ state: r.status || 'proposed', makePublic: !!state.pub, id: r.id, proposedBy: f.proposed_by, proposedAt: f.proposed_on, approvedBy: '', approvedAt: '', exportedAt: '', file: '', public: state.pub ? 'requested' : '' });
      LOG.data('ontology proposal made', r.id, `${src.id} — ${state.pub ? tr('Make public') : tr('local')} — ${tr('by')} ${f.proposed_by}`, ws.name);
      users.audit('ontology proposal made', `${r.id} from ${src.id}${state.pub ? ' (make public)' : ''}`, ws);
      touch(); m.close();
      toast(r.existing ? tr('The same proposal exists already: {0} ({1})').replace('{0}', r.id).replace('{1}', tr(r.status)) : tr('Proposed: {0} — waiting for the administrator’s approval').replace('{0}', r.id), 'good');
      onDone();
    } }, tr('Propose')),
    el('button', { class: 'btn ghost', onclick: () => m.close() }, tr('Cancel'))));
  refresh();
}
