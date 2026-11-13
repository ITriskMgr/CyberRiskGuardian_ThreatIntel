/* ontofind.js — validate against the ontology: findings only (1.9.3, W2b; C7 §H).

   The same list and actions in three places: ④ Create scenarios (one slot per line, before the scenarios exist), the Scenario
   editor's Ontology · CRGO card, and the Quality review (QC-33 reads scenario.ontologyFindings). A finding is
   { code, severity, field, value, message, suggestion?, state: 'open'|'dismissed', by, at, validatedAt }; CRGO's English
   `message` is kept and shown translated by `code` (crgo.js findingText). States: consistent · needs attention · outside the
   ontology. Findings NEVER block creation or any later step, and the ontology never changes a parameter or a score.
   Actions: Edit (opens the field concerned; a revoked technique's successor in one click, journalled), Delete (the candidate
   before creation, the scenario after; confirmation naming it; audit-log entry; the C2 rule for a selected family), Dismiss.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, pill, toast, modal, field, go } from './util.js';
import { S, touch } from './state.js';
import * as SC from './screening.js';
import * as C from './crgo.js';
import * as CG from './crgo_group.js';
import * as O from './ontology.js';
import * as users from './users.js';
import * as LOG from './logs.js';
import * as GR from './ontogroup.js';
import * as PR from './ontoprop.js';
import { tr } from './i18n.js';

const who = () => users.name() || tr('single-user mode');
const today = () => new Date().toISOString().slice(0, 10);
export const INFO = new Set(['LIBRARY_MATCH', 'THEME_MATCH_ONLY', 'CWE_NO_REFERENCE']);
const GAP_CODES = ['THEME_MATCH_ONLY', 'OUTSIDE_ONTOLOGY'];
export const isAttention = f => f.severity ? f.severity === 'attention' : !INFO.has(f.code);
export const isOpen = f => isAttention(f) && !['dismissed', 'resolved'].includes(String(f.state || 'open'));
/** consistent · attention · outside · unknown (never validated) — derived from the stored findings. */
export function stateOf(findings) {
  const F = findings || [];
  if (!F.length) return 'unknown';
  if (F.some(f => f.code === 'OUTSIDE_ONTOLOGY')) return 'outside';
  return F.some(isOpen) ? 'attention' : 'consistent';
}
export const STATE_TEXT = { consistent: 'consistent', attention: 'needs attention', outside: 'outside the ontology', unknown: 'not validated yet' };
/** The theme of a gap (no ontology scenario matches), or null. */
export const gapTheme = findings => (findings || []).find(f => GAP_CODES.includes(f.code))?.value || null;

/* ---------------- descriptors of a scenario and of a ④ line ---------------- */
export function scenarioDescriptor(s, ws = S.ws) {
  const id = s.crgo?.id || s.origin?.ontologyMatch?.crgoId || '';
  const draft = { statement: s.statement || '', attack: s.attack || [], cwe: s.cwe || [], threat_source: s.threat_source || '', assets: s.assets || '', crgo: { ...(s.crgo || {}), id } };
  return CG.toDescriptor({ id: s.id || 'scenario', name: s.name || '', source: s.threat_source || '', assets: s.assets || '' }, draft, { assets: ws.assets, sources: O.THREAT_SOURCES });
}
/** The record that holds a ④ line's findings: the unique candidate itself, or a family's highest-scoring member. */
export function holderOf(u, ws = S.ws) {
  if (u.kind === 'cand') return SC.rec(u.id, ws);
  const f = SC.state(ws).families.find(x => x.id === u.id);
  return SC.rec((SC.bestMember(f, ws) || { id: (f.members || [])[0] }).id, ws);
}
export function unitDescriptor(u, ws = S.ws) {
  const { s, best } = SC.previewScenario(u, ws);
  const m = (u.kind === 'family' ? (SC.state(ws).families.find(x => x.id === u.id).members || []) : [u.id]).map(i => SC.rec(i, ws).ontologyMatch).find(x => x?.crgoId);
  s.origin = { ontologyMatch: m || null };
  return scenarioDescriptor(s, ws);
}

/* ---------------- validation ---------------- */
const CACHE = new Map();
export async function validateDescriptor(d) {
  const local = await C.localExtension().catch(() => []);
  const key = CG.canonical(d) + '|' + CG.localInfo(local).sha256;
  if (CACHE.has(key)) return CACHE.get(key);
  const r = await C.validate(d);
  if (!r.error) CACHE.set(key, r);
  return r;
}
/** Findings from a validation result, keeping a dismissal the analyst already recorded for the same code and value. */
export function mergeFindings(old, result) {
  const at = new Date().toISOString();
  return (result.findings || []).map(f => {
    const prev = (old || []).find(x => x.code === f.code && String(x.value) === String(f.value));
    const keep = prev && prev.state === 'dismissed';
    const o = { code: f.code, severity: f.severity, field: f.field, value: f.value, message: f.message, state: keep ? 'dismissed' : 'open', by: keep ? prev.by || '' : '', at: keep ? prev.at || '' : '', validatedAt: at };
    if (f.suggestion != null) o.suggestion = f.suggestion;
    return o;
  });
}
const LAST = new Map();    // owner key → last validation result (controls, obligations, via) for this session
export const lastResult = key => LAST.get(key) || null;
export const lastOf = (o, ws) => LAST.get(o.kind === 'scenario' ? ws.id + ':' + o.s.id : ws.id + ':unit:' + o.u.id) || null;
const ownerKey = (o, ws) => o.kind === 'scenario' ? ws.id + ':' + o.s.id : ws.id + ':unit:' + o.u.id;
const listOf = (o, ws) => o.kind === 'scenario' ? (o.s.ontologyFindings ||= []) : (holderOf(o.u, ws).ontologyFindings ||= []);
const setList = (o, ws, v) => { if (o.kind === 'scenario') o.s.ontologyFindings = v; else holderOf(o.u, ws).ontologyFindings = v; };

/** Validate an owner ({kind:'scenario', s} or {kind:'unit', u}); stores the findings, keeps dismissals, updates the theme-gap mark. */
export async function validate(o, ws = S.ws) {
  const d = o.kind === 'scenario' ? scenarioDescriptor(o.s, ws) : unitDescriptor(o.u, ws);
  const r = await validateDescriptor(d);
  if (r.error) return r;
  setList(o, ws, mergeFindings(listOf(o, ws), r));
  LAST.set(ownerKey(o, ws), r);
  if (o.kind === 'unit') {                       // the candidate's mark follows the validation: a match clears the theme gap, no match sets it
    const h = holderOf(o.u, ws), mk = h.ontologyMatch;
    if (r.match && (!mk || mk.gap)) h.ontologyMatch = { crgoId: r.match.id, cluster: r.match.cluster_id, score: null, source: r.via, rule: r.match.rule, release: r.release };
    else if (!r.match && !mk) h.ontologyMatch = { crgoId: null, cluster: null, score: null, gap: true, theme: r.theme_gap, source: r.via, release: r.release };
    SC.state(ws).themeGap = GR.themeGapList(ws);
  }
  touch();
  return r;
}

/* ---------------- actions ---------------- */
export function dismiss(f, o, ws = S.ws) {
  f.state = 'dismissed'; f.by = who(); f.at = new Date().toISOString();
  LOG.data('ontology finding dismissed', f.code, `${f.value} — ${o.kind === 'scenario' ? o.s.id : o.u.id} — ${tr('by')} ${who()}`, ws.name);
  users.audit('ontology finding dismissed', `${o.kind === 'scenario' ? o.s.id : o.u.id}: ${f.code} ${f.value}`, ws);
  touch();
}
/** One click: replace a revoked technique by its successor, in the scenario (revision log) or in the line's candidates (journal). */
export function replaceTechnique(f, o, ws = S.ws) {
  const from = String(f.value), to = String(f.suggestion || '');
  if (!to) return false;
  const swap = a => [...new Set((a || []).map(t => (String(t).toUpperCase() === from ? to : t)))];
  if (o.kind === 'scenario') {
    o.s.attack = swap(o.s.attack);
    (o.s.revisions ||= []).push({ date: today(), what: tr('ATT&CK technique {0} is revoked: replaced by its successor {1} (ontology validation, accepted by {2})').replace('{0}', from).replace('{1}', to).replace('{2}', who()) });
  } else {
    const ids = o.u.kind === 'family' ? (SC.state(ws).families.find(x => x.id === o.u.id)?.members || []) : [o.u.id];
    for (const i of ids) { const d = SC.rec(i, ws).draft; if (d?.attack) d.attack = swap(d.attack); }
  }
  LOG.data('revoked ATT&CK technique replaced', `${from} → ${to}`, `${o.kind === 'scenario' ? o.s.id : o.u.id} — ${tr('by')} ${who()}`, ws.name);
  users.audit('revoked ATT&CK technique replaced', `${o.kind === 'scenario' ? o.s.id : o.u.id}: ${from} → ${to}`, ws);
  touch();
  return true;
}
const parseList = v => [...new Set(String(v || '').split(/[,;\s]+/).map(x => x.trim().toUpperCase()).filter(Boolean))];

/** Edit a ④ line: its candidates' ATT&CK and CWE ids and the CRGO terms of the best member, in one dialog (the field concerned first). */
export async function editUnit(o, ws, focus, done) {
  const u = o.u, f = u.kind === 'family' ? SC.state(ws).families.find(x => x.id === u.id) : null;
  const ids = f ? (f.members || []).slice() : [u.id];
  const V = await GR.vocabulary(), best = (f ? SC.bestMember(f, ws) : { id: u.id }) || { id: ids[0] };
  const rows = ids.map(i => {
    const r = SC.rec(i, ws); r.draft ||= {};
    const at = el('input', { value: (r.draft.attack || []).join(', '), 'data-edit': 'techniques', 'data-id': i, placeholder: 'T1566, T1486' });
    const cw = el('input', { value: (r.draft.cwe || []).join(', '), 'data-edit': 'cwe', 'data-id': i, placeholder: 'CWE-79' });
    at.addEventListener('change', () => { r.draft.attack = parseList(at.value); touch(); });
    cw.addEventListener('change', () => { r.draft.cwe = parseList(cw.value); touch(); });
    return el('div', { class: 'grid g2' }, field(`<b>${i}</b> ` + tr('ATT&CK techniques'), at), field(tr('Weaknesses (CWE)'), cw));
  });
  const terms = GR.termsEditor(GR.candidateTerms({ id: best.id }, ws), V, () => touch());
  const m = modal(tr('Edit {0}').replace('{0}', u.id), el('p', { class: 'note' }, tr('Edit the field the finding concerns, then close: the line is validated again.')),
    ...rows, el('h3', null, tr('CRGO terms of {0}').replace('{0}', best.id)), terms,
    el('div', { class: 'btnrow', style: { marginTop: '10px' } }, el('button', { class: 'btn', id: 'onto-edit-done', onclick: () => { m.close(); } }, tr('Done'))));
  m.back.onclose = () => done?.();
  const target = focus === 'cwe' ? 'cwe' : focus === 'techniques' ? 'techniques' : null;
  (target ? m.box.querySelector(`[data-edit="${target}"]`) : m.box.querySelector('[data-terms] input'))?.focus();
}

/** Delete: the candidate before creation (a family line: choose the member), the scenario after. Confirmation names it; audit-log entry. */
export async function deleteOwner(o, ws, done) {
  if (o.kind === 'scenario') {
    const M = await import('./panels/scenario.js');
    if (M.deleteScenario(o.s, { stay: true })) done?.();
    return;
  }
  const u = o.u, made = SC.createdScenario(u, ws);
  if (made) { const M = await import('./panels/scenario.js'); if (M.deleteScenario(made, { stay: true })) done?.(); return; }
  const remove = (id, leave) => {
    const c = SC.candidates(ws).find(x => x.id === id); if (!c) return false;
    const f = SC.familyOf(id, ws);
    if (f && !leave) { toast(tr(SC.removeBlock(id, ws) || 'Take it out of the family first.'), 'bad'); return false; }
    if (f && leave && f.selected && (f.members || []).length <= 1) { toast(tr('A selected family keeps at least one member'), 'bad'); return false; }
    if (!window.confirm(tr('Delete candidate {0} — {1}? Its scores, flags and draft are removed with it (the register is not touched).').replace('{0}', c.id).replace('{1}', c.name))) return false;
    if (f) SC.leaveFamily(id, ws);
    if (!SC.removeCandidate(id, ws)) return false;
    LOG.data('candidate deleted after an ontology finding', id, `${c.name} — ${tr('by')} ${who()}`, ws.name);
    users.audit('candidate removed', `${id} ${c.name} (ontology review)`, ws);
    touch(); return true;
  };
  if (u.kind === 'cand') { if (remove(u.id, false)) done?.(); return; }
  const f = SC.state(ws).families.find(x => x.id === u.id);
  const m = modal(tr('Delete from {0}').replace('{0}', u.id), el('p', { class: 'note' }, tr('A family line is deleted one candidate at a time: the candidate leaves the family, then it is deleted. A selected family keeps at least one member.')),
    ...(f.members || []).map(i => el('div', { class: 'row', style: { alignItems: 'center' } }, el('span', { style: { flex: 1 } }, el('b', null, i), ' ', el('span', { class: 'small', 'data-noi18n': '' }, SC.candidates(ws).find(c => c.id === i)?.name || '')),
      el('button', { class: 'btn sm ghost danger', 'data-delete-member': i, onclick: () => { if (remove(i, true)) { m.close(); done?.(); } } }, tr('Delete')))));
}

/* ---------------- the list ---------------- */
function editScenario(f, s) {
  import('./panels/scenario.js').then(M => { M.requestTab(['techniques', 'cwe'].includes(f.field) ? 'links' : f.field === 'match' || !f.field ? 'onto' : 'onto'); go('scenario/' + s.id); });
}
/**
 * The findings of one owner. `result` (the last validation) adds the controls and obligations the ontology links.
 * onChange() redraws after an action that changed data (the caller revalidates when `revalidate` is true).
 */
export function findingsView(o, ws, { result = null, onChange = () => {}, withEdit = true } = {}) {
  const F = listOf(o, ws), st = stateOf(F), gap = gapTheme(F);
  const box = el('div', { class: 'onto-findings', 'data-state': st, 'data-for': o.kind === 'scenario' ? o.s.id : o.u.id });
  const redo = async () => { await validate(o, ws); onChange(); };
  const pillKind = { consistent: 'good', attention: 'warn', outside: 'bad', unknown: '' }[st];
  box.append(el('div', { class: 'row', style: { alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
    pill(tr(STATE_TEXT[st]), pillKind),
    result ? el('span', { class: 'small muted' }, (result.via === 'mcp' ? tr('MCP server') : tr('snapshot')) + ' · CRGO ' + result.release) : null));
  if (gap) box.append(PR.gapFlag(o, ws, { theme: gap, onChange,
    onEdit: withEdit ? () => (o.kind === 'scenario' ? editScenario({ field: 'themes' }, o.s) : editUnit(o, ws, 'themes', redo)) : null, onDelete: () => deleteOwner(o, ws, onChange) }));
  const open = F.filter(f => isAttention(f));
  if (open.length) box.append(el('ul', { class: 'onto-findings-list small', style: { listStyle: 'none', padding: 0 } }, ...open.map(f => {
    const dismissed = f.state === 'dismissed';
    return el('li', { class: 'onto-finding', 'data-code': f.code, 'data-state': f.state },
      el('span', { 'data-noi18n': '' }, C.findingText(f, tr)), ' ',
      dismissed ? el('span', { class: 'muted' }, tr('Seen by {0} on {1}').replace('{0}', f.by || '—').replace('{1}', String(f.at || '').slice(0, 10))) :
        el('span', { class: 'btnrow', style: { display: 'inline-flex', gap: '4px' } },
          f.code === 'TECHNIQUE_REVOKED' && f.suggestion ? el('button', { class: 'btn xs', 'data-act': 'replace', onclick: async () => { if (replaceTechnique(f, o, ws)) { toast(tr('{0} replaced by {1}').replace('{0}', f.value).replace('{1}', f.suggestion)); await redo(); } } }, tr('Replace {0} with {1}').replace('{0}', f.value).replace('{1}', f.suggestion)) : null,
          withEdit ? el('button', { class: 'btn xs ghost', 'data-act': 'edit', onclick: () => o.kind === 'scenario' ? editScenario(f, o.s) : editUnit(o, ws, f.field, redo) }, tr('Edit')) : null,
          el('button', { class: 'btn xs ghost danger', 'data-act': 'delete', onclick: () => deleteOwner(o, ws, onChange) }, tr('Delete')),
          el('button', { class: 'btn xs ghost', 'data-act': 'dismiss', onclick: () => { dismiss(f, o, ws); onChange(); } }, tr('Dismiss'))));
  })));
  const info = F.filter(f => !isAttention(f));
  if (info.length) box.append(el('details', { class: 'small' }, el('summary', null, tr('Information from the ontology ({0})').replace('{0}', info.length)), el('ul', null, ...info.map(f => el('li', { 'data-noi18n': '' }, C.findingText(f, tr))))));
  if (result && (result.obligations?.length || Object.values(result.controls || {}).some(l => l.length))) {
    const fw = Object.fromEntries(C.FRAMEWORKS);
    box.append(el('details', { class: 'small onto-links' }, el('summary', null, tr('Controls and obligations the ontology links (for step 12 and compliance)')),
      ...Object.entries(result.controls || {}).filter(([, l]) => l.length).map(([k, l]) => el('div', null, el('b', null, fw[k] || k), ': ', el('span', { 'data-noi18n': '' }, l.slice(0, 12).map(x => `${x.id} ${x.title || ''}`.trim()).join('; ')))),
      result.obligations?.length ? el('div', null, el('b', null, tr('Obligations')), ': ', el('span', { 'data-noi18n': '' }, result.obligations.slice(0, 12).map(x => `${x.id} ${x.title || ''}`.trim()).join('; '))) : null,
      el('p', { class: 'muted' }, tr('The ontology lists them; it does not say they are in place. “Supports compliance with” is not compliance.'))));
  }
  return box;
}

/** ④: fill every `.scr-finding-slot[data-findings-for]` and the `#scr-findings-slot` button. `units` are the selected lines. */
export function fillReview(root, ws, units, rerender) {
  const slots = [...root.querySelectorAll('.scr-finding-slot[data-findings-for]')];
  const draw = async (u, slot, fresh) => {
    const made = SC.createdScenario(u, ws);
    const o = made ? { kind: 'scenario', s: made } : { kind: 'unit', u };
    slot.replaceChildren(el('span', { class: 'small muted' }, tr('Validating…')));
    let r = null;
    try {
      if (fresh || !listOf(o, ws).length) { r = await validate(o, ws); if (r.error) { slot.replaceChildren(banner('warn', tr('The ontology could not validate this line'), tr(r.message || r.code))); return; } }
      else r = lastResult(ownerKey(o, ws));
    } catch (e) { slot.replaceChildren(banner('warn', tr('The ontology could not validate this line'), String(e.message || e))); return; }
    slot.replaceChildren(findingsView(o, ws, { result: r, onChange: () => { rerender?.(); } }));
  };
  const all = async fresh => { for (const slot of slots) { const u = units.find(x => x.id === slot.dataset.findingsFor); if (u && slot.isConnected) await draw(u, slot, fresh); } };
  const host = root.querySelector('#scr-findings-slot');
  host?.replaceChildren(el('div', { class: 'btnrow' }, el('button', { class: 'btn ghost', id: 'scr-validate', onclick: async e => { e.target.disabled = true; await all(true); e.target.disabled = false; } }, tr('Validate against the ontology')),
    el('span', { class: 'small muted' }, tr('Findings never block the creation. Edit the field, delete the item or dismiss a finding once you have seen it.'))));
  return all(false);
}
