/* ontogroup.js — ② Screen → Group with the ontology (1.9.3, W2b; C7 §G).

   Every candidate becomes a CRGO descriptor (crgo_group.js toDescriptor: the kept Batch draft first, then the terms the analyst
   completed, then the asset register and the threat-source catalogue — nothing is guessed from free text), the ontology
   groups them (crgo.js group(): the MCP server when it runs, else the snapshot — identical answers), and the proposals go to
   the review panel (proposalpanel.js). Nothing changes until the analyst accepts. No AI, nothing leaves the computer.
   Accepting writes: families (created or extended), rec.ontologyMatch {crgoId, cluster, score, source, rule, release},
   f.memberMarks[id] = { by, at, source: 'ontology' }, f.ontoMark (the family's mark; f.aiMark stays W3's), the unique mark
   (rec.unique.source = 'ontology') and ws.screening.themeGap. Library values are priors, never evidence.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, pill, chip, toast, field } from './util.js';
import { S, touch } from './state.js';
import * as SC from './screening.js';
import * as C from './crgo.js';
import * as CG from './crgo_group.js';
import * as O from './ontology.js';
import * as users from './users.js';
import * as LOG from './logs.js';
import { tr } from './i18n.js';
import { reviewPanel } from './proposalpanel.js';

/* ---------------- vocabulary (list_values / snapshot) ---------------- */
let VOCAB = null;
export async function vocabulary() {
  if (VOCAB) return VOCAB;
  const out = {};
  for (const k of ['asset_category', 'theme', 'threat_source_type']) { try { out[k] = (await C.call('crgo_list_values', { kind: k })).result || []; } catch { out[k] = []; } }
  return (VOCAB = out);
}

/** The CRGO terms the analyst completes on a candidate (kept in its draft, where toDescriptor reads them) or a scenario (s.crgo). */
export function candidateTerms(c, ws = S.ws) { const r = SC.rec(c.id, ws); r.draft ||= {}; r.draft.crgo ||= {}; return r.draft.crgo; }
export const TERM_FIELDS = [['asset_categories', 'asset_category', 'Asset categories'], ['threat_source_types', 'threat_source_type', 'Threat source types'], ['themes', 'theme', 'Themes']];
/** Three groups of check boxes from the CRGO vocabulary; `target` is { asset_categories, threat_source_types, themes } and is edited in place. */
export function termsEditor(target, V, onChange = () => {}) {
  return el('div', { class: 'onto-terms' }, ...TERM_FIELDS.map(([f, kind, label]) => {
    const list = target[f] ||= [];
    return el('div', { 'data-terms': f }, el('b', { class: 'small' }, tr(label)), el('div', { class: 'chips' }, ...(V[kind] || []).map(v => {
      const cb = el('input', { type: 'checkbox', checked: list.includes(v.key), style: { width: 'auto', margin: 0 }, 'data-key': v.key });
      cb.addEventListener('change', () => { const i = list.indexOf(v.key); if (cb.checked && i < 0) list.push(v.key); if (!cb.checked && i >= 0) list.splice(i, 1); onChange(); });
      return el('label', { class: 'chip', style: { cursor: 'pointer' } }, cb, ' ', el('span', { 'data-noi18n': '' }, v.label));
    })));
  }));
}

/* ---------------- descriptors ---------------- */
export const descriptorOf = (c, ws = S.ws) => CG.toDescriptor(c.row, SC.rec(c.id, ws).draft || null, { assets: ws.assets, sources: O.THREAT_SOURCES });

/* ---------------- grouping ---------------- */
const PANELS = new Map();            // workspace id → { res, items, skipped } kept while the screen is redrawn
const REJECTED = new Map();          // workspace id → Set of group keys rejected in this session
export const lastRun = ws => PANELS.get(ws.id) || null;

/** Group every candidate. → { res (README result + via, why), skipped: [ids without a name or statement] } or an error document. */
export async function run(ws = S.ws, { prefer = 'auto', minConfidence = 'M' } = {}) {
  const skipped = [], descs = [];
  for (const c of SC.candidates(ws)) {
    const d = descriptorOf(c, ws);
    if (!String(d.name || '').trim() && !String(d.statement || '').trim()) { skipped.push(c.id); continue; }
    descs.push(d);
  }
  if (!descs.length) return { error: true, code: 'NO_CANDIDATES', message: 'There is no candidate to group yet: add candidates in the first stage.' };
  const u = await C.groupingUsable();
  if (!u.usable) return { error: true, code: 'NOT_USABLE', message: u.problem };
  const res = await C.group(descs, { prefer, minConfidence });
  if (res.error) return res;
  return { res, skipped, count: descs.length };
}

const ruleText = r => ({ kept: 'CRGO id kept', near_duplicate: 'near-duplicate name', theme_technique_asset: 'same theme, technique and asset category' }[r] || r || '');
/** Proposals for the review panel from a grouping result. */
export function itemsOf(res, ws = S.ws) {
  const list = SC.candidates(ws), by = Object.fromEntries(list.map(c => [c.id, c]));
  const out = [];
  for (const g of res.groups) {
    const ids = g.members.map(m => m.ref);
    const first = by[ids[0]];
    const stm = g.representative?.statement || SC.rec(ids[0], ws).draft?.statement || first?.consequence || '';
    const fams = [...new Set(ids.map(i => SC.familyOf(i, ws)?.id).filter(Boolean))];
    const it = { key: g.cluster_id, kind: g.kind, group: g, name: g.representative?.name || first?.name || g.cluster_id, statement: stm,
      members: g.members.map(m => ({ id: m.ref, name: by[m.ref]?.name || '', note: m.match ? tr(ruleText(m.match.rule)) + ' · ' + m.match.id : tr('no match in the ontology') })),
      badges: [], note: '' };
    if (g.representative) it.note = tr('Starting statement: the representative {0} of the cluster ({1}).').replace('{0}', g.representative.id).replace('{1}', tr(g.representative.source === 'local' ? 'this installation' : 'the library'));
    if (g.theme_gap) { it.badges.push('theme gap'); it.note = (it.note ? it.note + ' ' : '') + tr('No scenario of the ontology matches: own scenario, theme {0}.').replace('{0}', g.theme_gap); }
    if (g.kind !== 'family') { if (ids.every(i => SC.familyOf(i, ws))) it.blocked = 'Already in a family.'; else if (SC.rec(ids[0], ws).unique && g.kind === 'unique') it.done = 'already unique'; }
    else if (fams.length > 1) it.blocked = 'The members are already in different families: regroup them by hand.';
    else if (fams.length === 1 && ids.every(i => SC.familyOf(i, ws)?.id === fams[0])) it.done = 'already in ' + fams[0];
    else if (fams.length === 1) it.note = (it.note ? it.note + ' ' : '') + tr('{0} would join the existing family {1}.').replace('{0}', ids.filter(i => !SC.familyOf(i, ws)).join(', ')).replace('{1}', fams[0]);
    out.push(it);
  }
  return out;
}
export const themeGapList = (ws = S.ws) => {
  const st = SC.state(ws);
  return [...new Set(SC.candidates(ws).map(c => st.cands[c.id]?.ontologyMatch).filter(m => m?.gap).map(m => m.theme))].sort();
};
/** A candidate flagged as a theme gap by the ontology grouping (or by validation), with its theme; null otherwise. */
export const gapOf = (id, ws = S.ws) => { const m = SC.state(ws).cands[id]?.ontologyMatch; return m?.gap ? m.theme || '' : null; };

/** Apply one proposal (the analyst accepted it, possibly edited). Returns a message when refused, else null. */
export function accept(item, edits, ctx, ws = S.ws) {
  const { res } = ctx, g = item.group, by = users.name() || tr('single-user mode'), at = new Date().toISOString();
  const via = res.via, release = res.release;
  const keep = new Set(edits.members), members = g.members.filter(m => keep.has(m.ref));
  if (!members.length) return 'Nothing left to accept.';
  const match = m => (m.match ? { crgoId: m.match.id, cluster: g.cluster_id, score: null, source: via, rule: m.match.rule, release }
    : { crgoId: null, cluster: null, score: null, gap: true, theme: g.theme_gap || m.primary_theme, source: via, release });
  const ids = members.map(m => m.ref);
  if (g.kind === 'family') {
    const fams = [...new Set(ids.map(i => SC.familyOf(i, ws)).filter(Boolean))];
    if (fams.length > 1) return 'The members are already in different families: regroup them by hand.';
    const free = ids.filter(i => !SC.familyOf(i, ws));
    if (!free.length) return 'Every member is already in this family.';
    const f = fams.length ? SC.mergeInto(free, { family: fams[0].id }, ws) : SC.mergeInto(free, { name: edits.name, statement: edits.statement }, ws);
    if (!f) return 'The family no longer exists.';
    if (!fams.length && edits.name) f.name = edits.name;
    f.memberMarks ||= {};
    for (const m of members) { if (free.includes(m.ref)) f.memberMarks[m.ref] = { by, at, source: 'ontology', cluster: g.cluster_id }; SC.rec(m.ref, ws).ontologyMatch = match(m); }
    f.ontoMark ||= { by, at, source: 'ontology', cluster: g.cluster_id, representative: g.representative?.id || null, via, release };
    LOG.data('family proposed by the ontology and accepted', f.id, `${free.join(', ')} — ${tr('by')} ${by}`, ws.name);
    users.audit('ontology family accepted', `${f.id}: ${free.join(', ')} (${g.cluster_id}, ${via}, CRGO ${release})`, ws);
  } else {
    const m = members[0], id = m.ref;
    if (SC.familyOf(id, ws)) return 'Already in a family.';
    const prev = SC.rec(id, ws).ontologyMatch;
    SC.rec(id, ws).ontologyMatch = match(m);
    const why = SC.markUnique(id, by, ws);
    if (why) { SC.rec(id, ws).ontologyMatch = prev; return why; }
    Object.assign(SC.rec(id, ws).unique, { source: 'ontology', cluster: g.cluster_id, via, release });
    LOG.data('unique candidate proposed by the ontology and accepted', id, `${g.kind === 'own' ? tr('own scenario, theme gap') : g.cluster_id} — ${tr('by')} ${by}`, ws.name);
    users.audit('ontology unique accepted', `${id} (${g.cluster_id}, ${via}, CRGO ${release})`, ws);
  }
  SC.state(ws).themeGap = themeGapList(ws);
  SC.state(ws).updated = new Date().toISOString().slice(0, 10);
  touch();
  return null;
}

/** "Ontology-proposed, accepted by ‹name› on ‹date›" for a mark. */
export const markText = mk => tr('Ontology-proposed, accepted by {0} on {1}').replace('{0}', mk?.by || '—').replace('{1}', String(mk?.at || '').slice(0, 10));

/* ---------------- ② Screen: the button and the panel ---------------- */
export function groupSection(slot, ws, rerender) {
  const out = el('div', { id: 'scr-onto-out' });
  const btn = el('button', { class: 'btn', id: 'scr-onto-group', onclick: async () => {
    btn.disabled = true; out.replaceChildren(el('p', 'note', tr('Asking the ontology…')));
    try {
      const r = await run(ws);
      if (r.error) { out.replaceChildren(banner('bad', tr('The ontology could not group the candidates'), tr(r.message || r.code))); return; }
      REJECTED.set(ws.id, new Set()); PANELS.set(ws.id, r); draw(r);
    } catch (e) { out.replaceChildren(banner('bad', tr('The ontology could not group the candidates'), String(e.message || e))); }
    finally { btn.disabled = false; }
  } }, tr('Group with the ontology'));
  const draw = r => {
    const rej = REJECTED.get(ws.id) || new Set();
    const items = itemsOf(r.res, ws).filter(i => !rej.has(i.key));
    const g = r.res;
    const source = el('span', null, pill(g.via === 'mcp' ? tr('MCP server') : tr('snapshot'), g.via === 'mcp' ? 'good' : 'warn'), ' ', el('span', { 'data-noi18n': '' }, 'CRGO ' + g.release),
      g.local?.count ? ' · ' + tr('{0} addition(s) approved in this installation').replace('{0}', g.local.count) : '', ' · ', tr('{0} candidate(s) grouped').replace('{0}', r.count),
      r.skipped.length ? ' · ' + tr('{0} without a name or statement skipped').replace('{0}', r.skipped.join(', ')) : '', g.why ? el('span', { class: 'muted' }, ' · ' + g.why) : null);
    const panel = reviewPanel({ id: 'scr-onto-panel', title: tr('The ontology proposes'), items, source, lede: tr('Nothing changes until you accept. Library values are calibration priors, not organisational evidence. Accepting writes “Ontology-proposed, accepted by {0} on {1}” on the family or the candidate.').replace('{0}', users.name() || tr('single-user mode')).replace('{1}', new Date().toISOString().slice(0, 10)),
      onAccept: (it, edits) => { const m = accept(it, edits, r, ws); if (!m) { toast(tr('Accepted: {0}').replace('{0}', it.name)); rerender?.(); } return m; },
      onReject: it => { (REJECTED.get(ws.id) || REJECTED.set(ws.id, new Set()).get(ws.id)).add(it.key); },
      onAcceptAll: true, empty: 'No proposal is left to review.' });
    const unk = [];
    if (g.unknown_techniques?.length) unk.push(tr('Unknown ATT&CK ids') + ': ' + g.unknown_techniques.join(', '));
    for (const [k, v] of Object.entries(g.unknown_values || {})) unk.push(tr('Unknown values') + ' (' + k + '): ' + v.join(', '));
    if (g.unknown_crgo_ids?.length) unk.push(tr('Unknown CRGO ids') + ': ' + g.unknown_crgo_ids.join(', '));
    out.replaceChildren(panel, unk.length ? el('p', { class: 'small muted' }, unk.join(' · ')) : null,
      g.theme_gaps?.length ? el('p', { class: 'small', id: 'scr-onto-gaps' }, el('b', null, tr('Theme gaps')), ': ', ...g.theme_gaps.map(t => chip(t))) : null);
  };
  slot.replaceChildren(el('div', { class: 'btnrow' }, btn, el('span', { class: 'small muted' }, tr('Groups the candidates with the CyberRiskGuardian Ontology on this computer — no AI, nothing leaves it. Complete the CRGO terms of a candidate (asset category, threat source type, themes) in its score card to sharpen the result.'))), out);
  const last = PANELS.get(ws.id); if (last) draw(last);
}
