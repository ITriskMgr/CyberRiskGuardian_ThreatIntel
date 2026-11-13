/* familyai.js — C6 (1.9.3, W3): the AI proposes families, matches candidates to families and looks for blind spots in the
   coverage matrix, for review (decided items C6 1–5). The ontology grouping (ontogroup.js, no AI) is the starting point.

   One task, `screening_families` (ai.js FEATURES "Screening family proposals", sensitivity medium, default workspace provider;
   the helper's policy knows the same id), three requests carried in the payload line `REQUEST: A|B|C`:
     A  propose families for ALL candidates (and draft the six "why this scenario?" answers of each new family);
     B  match candidates to families (all candidates, or one);
     C  propose families — or new candidates — for coverage categories no accepted family ticks.
   A and B cover every candidate, in batches of at most 40 sent one after the other, each with its own preview; the review
   panel (proposalpanel.js, shared with the ontology grouping) opens once, after the last batch. Rules that hold whatever the
   answer says (validation.md of the design):
     • nothing is written by parse(); only an analyst's click writes (accept, edit then accept, reject);
     • an analyst's family is never changed, and a candidate is never moved, without its own accepted suggestion (shown beside
       the current family); a candidate ends in at most one family;
     • AI proposes grouping, reasons and drafts — never scores, parameters, dispositions or selection;
     • the six "why" drafts wait in f.whyDraft until accepted at ③ Select; an organizational-evidence answer that cites no
       evidence ID of the register is replaced by "Information gap — organizational validation required";
     • a candidate proposed for a coverage gap lands in ① as "[AI — coverage gap]", unscored;
     • every accepted object carries aiMark {by, at, model, entryId, request, key}: "AI-proposed, accepted by ‹name› on ‹date›".
   Switched off in Settings → AI, the AI buttons are hidden and the ontology grouping stays.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, banner, toast, pill, chip } from './util.js';
import { S, touch } from './state.js';
import { tr } from './i18n.js';
import * as AI from './ai.js';
import * as aiui from './aiui.js';
import * as SC from './screening.js';
import * as MK from './markers.js';
import * as LOG from './logs.js';
import * as users from './users.js';
import * as GR from './ontogroup.js';
import { reviewPanel } from './proposalpanel.js';
import { KEY, cmp, flat, pad2, uniq, clip, markers, seedIndex, gapCategories, maxN } from './familypayload.js';

export const MAX_BATCH = 40;          // candidates per request (A, B)
export const enabled = () => (AI.policy().tasks?.[KEY] || 'workspace') !== 'off';

export { KEY, clip, markers, gapCategories };
/* ---------------- small helpers ---------------- */
const lang = () => (document.documentElement.lang === 'fr' ? 'fr' : 'en');
void lang;
const RE_EST = /(?:Analytical estimate|Estimation analytique)\s*[—–-]\s*(?:validation required|validation requise)/i;
const RE_GAP = /(?:Information gap|Lacune d['’]information)\s*[—–-]\s*(?:organi[sz]ational validation required|validation organisationnelle requise)/i;
const RE_EST_G = new RegExp(RE_EST.source, 'gi'), RE_GAP_G = new RegExp(RE_GAP.source, 'gi');
const NONORG = /methodolog|external reference|illustrative|calibration/i;
const TRUNC = new Set(['max_tokens', 'length', 'max_output_tokens']);
const CONF = ['High', 'Medium', 'Low'];

/* ---------------- the seed (ontology grouping) ---------------- */
let SEED_OVERRIDE = null;
/** Tests inject a crgo-grouping/1 result instead of asking the ontology. */
export const setSeed = s => { SEED_OVERRIDE = s || null; };
export async function seedFor(ws = S.ws) {
  if (SEED_OVERRIDE) return { seed: SEED_OVERRIDE, why: '' };
  try { const r = await GR.run(ws); if (r.error) return { seed: null, why: r.message || r.code || '' }; return { seed: { ...r.res }, why: '' }; }
  catch (e) { return { seed: null, why: String(e.message || e) }; }
}
/* ---------------- batches (≤ 40; seed groups and existing families never split) — validation.md §8 ---------------- */
export function batches(refs, seed, families, max = MAX_BATCH) {
  if (!refs.length) return [];
  const par = new Map(refs.map(r => [r, r]));
  const find = x => { while (par.get(x) !== x) { par.set(x, par.get(par.get(x))); x = par.get(x); } return x; };
  const join = list => { const ms = list.filter(r => par.has(r)); for (const r of ms.slice(1)) par.set(find(r), find(ms[0])); };
  for (const g of seed?.groups || []) join((g.members || []).map(m => m.ref));
  for (const f of families) join(f.members || []);
  const comps = new Map();
  for (const r of refs) { const k = find(r); if (!comps.has(k)) comps.set(k, []); comps.get(k).push(r); }
  const list = [...comps.values()].map(c => c.sort(cmp)).sort((a, b) => cmp(a[0], b[0]));
  const nb = Math.ceil(refs.length / max), target = Math.ceil(refs.length / nb), out = [[]];
  for (let c of list) {
    while (c.length > max) { if (out.at(-1).length) out.push([]); out.at(-1).push(...c.slice(0, max)); out.push([]); c = c.slice(max); }
    if (out.at(-1).length && (out.at(-1).length >= target || out.at(-1).length + c.length > max)) out.push([]);
    out.at(-1).push(...c);
  }
  return out.filter(b => b.length).map(b => b.sort(cmp));
}

/* ---------------- the run: everything kept from the answers of one request ---------------- */
export function newRun(request, ws, { seed = null, seedWhy = '', refs = [], single = false, gaps = [] } = {}) {
  const ev = new Map((ws.assessment.EVIDENCE || []).map(e => [String(e[0]), String(e[2] || '')]));
  return { request, ws, id: 'fr-' + Date.now().toString(36), seed, seedWhy, single, all: refs.slice().sort(cmp), allSet: new Set(refs), gaps, ev,
    crown: new Set((ws.assessment.CROWN || []).map(r => String(r[0]))),
    fams: [], uniques: [], exist: new Map(), moves: [], renames: [], ticks: [], bm: new Map(), newFam: new Map(), keeps: new Set(), cats: [], gapCands: [],
    counts: {}, notAnswered: new Set(), truncated: false, trunc: [], entryIds: [], models: new Set(), resolved: new Set(), accepted: 0, rejected: 0, keyMap: {},
    sentNext: 1, notSent: [], batches: 0, batchesOf: 1, nextGap: 1, lastModel: '' };
}
const cnt = (run, k, n = 1) => { run.counts[k] = (run.counts[k] || 0) + n; };

/* ---------------- parse: why answers (validation.md §6) ---------------- */
function cleanWhy(w, run) {
  if (!w || typeof w !== 'object') return null;
  const mk = markers(), raw = SC.WHY_KEYS.map(k => flat(w[k]));
  if (!raw.some(Boolean)) return null;
  const res = { answers: [], evidence: [], evOriginal: '', evReplaced: false, evNonOrg: false };
  raw.forEach((t0, i) => {
    let t = t0; if (!t) { res.answers.push(''); return; }
    t = MK.modernize(t);
    if (t.length > 400) { t = clip(t, 400); cnt(run, 'trimmed'); }
    const hasE = RE_EST.test(t), hasG = RE_GAP.test(t), before = t;
    t = t.replace(RE_EST_G, mk.estimate).replace(RE_GAP_G, mk.gap);
    if (t !== before) cnt(run, 'markerNormalized');
    if (!hasE && !hasG) { t = t.replace(/\s+$/, ''); if (!/[.!?]$/.test(t)) t += '.'; t += ' ' + mk.estimate + '.'; cnt(run, 'markerAdded'); }
    if (i === 1) {
      const lst = Array.isArray(w.evidence_ids) ? w.evidence_ids : String(w.evidence_ids || '').split(/[\s,;]+/);
      const ids = uniq([...(t.match(/\bE\d{1,3}\b/g) || []), ...lst.map(flat).filter(Boolean)]);
      const known = ids.filter(e => run.ev.has(e)), unknown = ids.filter(e => !run.ev.has(e) && /^E\d{1,3}$/.test(e));
      if (unknown.length) cnt(run, 'unknownEvidence');
      if (!known.length && !RE_GAP.test(t)) { res.evOriginal = t; t = mk.gap + '.'; res.evReplaced = true; cnt(run, 'evReplaced'); }
      else if (known.length && known.every(e => NONORG.test(run.ev.get(e) || ''))) res.evNonOrg = true;
      res.evidence = known;
    }
    res.answers.push(t);
  });
  return res;
}
const confOf = c => (CONF.includes(c) ? c : 'Low');
const catsOf = (run, a) => (Array.isArray(a) ? a : []).filter(c => { const ok = SC.CATEGORIES.includes(c); if (!ok) cnt(run, 'invalidValues'); return ok; }).filter((c, i, l) => l.indexOf(c) === i);
const txt = (run, s, n) => { let t = MK.modernize(flat(s)); if (t.length > n) { t = clip(t, n); cnt(run, 'trimmed'); } return t; };
const extras = (run, x, allowed) => { for (const k of Object.keys(x)) if (!allowed.includes(k)) cnt(run, 'extraFields'); };
const A_FAM = ['kind', 'id', 'seed', 'continues', 'name', 'statement', 'members', 'left_out', 'also_fits', 'reason', 'coverage', 'confidence', 'why'];
const A_UNI = ['kind', 'ref', 'seed', 'reason', 'coverage', 'confidence', 'why'];

/* ---------------- parse: request A ---------------- */
export function ingestA(run, parsed, scope, meta = {}) {
  const ws = run.ws, SCOPE = new Set(scope), ALL = run.allSet, fams = SC.state(ws).families, EXIST = new Map(fams.map(f => [f.id, f]));
  const sx = seedIndex(run.seed), arr = parsed.proposals || parsed.families || parsed.items;
  if (!Array.isArray(arr)) throw new Error(tr('The answer named no known candidate.'));
  let top = Math.max(maxN(run), ...arr.map(x => +(/^N(\d+)$/.exec(String(x?.id || ''))?.[1] || 0)));
  const used = new Set(), placed = new Set(), meta2 = { entryId: meta.entryId || '', model: meta.model || '', batch: meta.batch || 1 };
  const own = r => { const f = SC.familyOf(r, ws); return f ? f.id : null; };
  const seedOf = s => { s = flat(s); if (!s) return null; if (sx.byId.has(s)) return s; if (sx.groups.length || run.seed) cnt(run, 'unknownSeed'); return null; };
  const alsoQueue = [];
  for (const x of arr) {
    if (!x || typeof x !== 'object') { cnt(run, 'invalidItems'); continue; }
    if (x.kind === 'unique') {
      extras(run, x, A_UNI);
      const ref = flat(x.ref);
      if (!ALL.has(ref)) { cnt(run, 'unknownRefs'); continue; }
      if (!SCOPE.has(ref)) { cnt(run, 'outOfBatch'); continue; }
      if (placed.has(ref)) { cnt(run, 'duplicateMembership'); continue; }
      placed.add(ref);
      const cur = own(ref);
      if (cur) { run.moves.push({ ref, from: cur, to: { kind: 'unique' }, reason: txt(run, x.reason, 600), conf: confOf(x.confidence), ...meta2 }); cnt(run, 'moveSuggestions'); continue; }
      run.uniques.push({ ref, seed: seedOf(x.seed), reason: txt(run, x.reason, 600), coverage: catsOf(run, x.coverage), conf: confOf(x.confidence), why: cleanWhy(x.why, run), downgraded: false, ...meta2 });
      continue;
    }
    if (x.kind !== 'family') { cnt(run, 'invalidItems'); continue; }
    extras(run, x, A_FAM);
    let id = flat(x.id), type = null;
    if (EXIST.has(id)) type = 'exist';
    else if (/^N\d\d$/.test(id)) {
      const carried = run.fams.find(f => f.key === id && f.batch < meta2.batch);
      if (x.continues === true && carried) type = 'cont';
      else if (x.continues === true && !carried) {
        if (flat(x.name) && flat(x.statement) && (x.members || []).length >= 2) { type = 'new'; cnt(run, 'continuesFixed'); } else { cnt(run, 'unknownRefs'); continue; }
      } else type = 'new';
      if (type === 'new' && (used.has(id) || run.fams.some(f => f.key === id) || +id.slice(1) < run.sentNext)) { top += 1; id = 'N' + pad2(top); cnt(run, 'renumbered'); }
    } else { cnt(run, 'unknownRefs'); continue; }
    // members
    const keep = [], seen = new Set();
    for (const raw of Array.isArray(x.members) ? x.members : []) {
      const ref = flat(raw); if (seen.has(ref)) continue; seen.add(ref);
      if (!ALL.has(ref)) { cnt(run, 'unknownRefs'); continue; }
      if (!SCOPE.has(ref)) { cnt(run, 'outOfBatch'); continue; }
      if (placed.has(ref)) { cnt(run, 'duplicateMembership'); continue; }
      const cur = own(ref);
      if (cur && cur !== id) { run.moves.push({ ref, from: cur, to: type === 'exist' ? { kind: 'existing', id } : { kind: 'proposal', key: id }, reason: txt(run, x.reason, 600), conf: confOf(x.confidence), ...meta2 }); cnt(run, 'moveSuggestions'); continue; }
      placed.add(ref); keep.push(ref);
    }
    const base = { reason: txt(run, x.reason, 600), coverage: catsOf(run, x.coverage), conf: confOf(x.confidence) };
    const leftOut = (Array.isArray(x.left_out) ? x.left_out : []).filter(l => { const ok = l && ALL.has(flat(l.ref)); if (!ok) cnt(run, 'unknownRefs'); return ok; }).map(l => ({ ref: flat(l.ref), reason: txt(run, l.reason, 300) }));
    if (type === 'exist') {
      const f = EXIST.get(id), adds = keep.filter(r => !(f.members || []).includes(r));
      if (flat(x.name) && (flat(x.name) !== flat(f.name) || (flat(x.statement) && flat(x.statement) !== flat(f.statement)))) {
        run.renames.push({ id, name: txt(run, x.name, 200), statement: txt(run, x.statement || f.statement, 900), reason: base.reason, conf: base.conf, ...meta2 }); cnt(run, 'renameSuggestions');
      }
      const e = run.exist.get(id) || { id, adds: [], reasons: [], conf: base.conf, ...meta2 };
      e.adds.push(...adds); if (base.reason) e.reasons.push(base.reason); run.exist.set(id, e);
      if (!own(id)) { /* the family exists by construction */ }
    } else if (type === 'cont') {
      const f = run.fams.find(z => z.key === id);
      if (!keep.length) continue;
      f.members = uniq([...f.members, ...keep]); if (base.reason) f.reasons.push(`${tr('batch')} ${meta2.batch}: ${base.reason}`);
      f.leftOut.push(...leftOut); used.add(id);
    } else {
      if (!keep.length) { cnt(run, 'emptyDropped'); continue; }
      if (keep.length === 1) {
        run.uniques.push({ ref: keep[0], seed: seedOf(x.seed), ...base, why: cleanWhy(x.why, run), downgraded: true, ...meta2 }); cnt(run, 'downgradedToUnique'); continue;
      }
      used.add(id);
      const f = { key: id, seed: seedOf(x.seed), name: txt(run, x.name, 200), statement: txt(run, x.statement, 900), members: keep, leftOut, alsoFits: [], reasons: [base.reason].filter(Boolean),
        coverage: base.coverage, conf: base.conf, why: cleanWhy(x.why, run), ...meta2 };
      run.fams.push(f);
    }
    // also_fits is resolved after every item of the answer is known
    for (const a of Array.isArray(x.also_fits) ? x.also_fits : []) alsoQueue.push({ ref: flat(a?.ref), reason: txt(run, a?.reason, 400), id, type, conf: base.conf });
  }
  for (const a of alsoQueue) {
    if (!ALL.has(a.ref)) { cnt(run, 'unknownRefs'); continue; }
    if (placed.has(a.ref) && !own(a.ref)) continue;                            // placed in this answer
    const cur = own(a.ref), earlier = run.uniques.find(u => u.ref === a.ref && u.batch < meta2.batch) || run.fams.find(f => f.batch < meta2.batch && f.members.includes(a.ref));
    const to = a.type === 'exist' ? { kind: 'existing', id: a.id } : { kind: 'proposal', key: a.id };
    if (cur && cur !== a.id) { if (!run.moves.some(m => m.ref === a.ref && JSON.stringify(m.to) === JSON.stringify(to))) run.moves.push({ ref: a.ref, from: cur, to, reason: a.reason, conf: a.conf, ...meta2 }); }
    else if (earlier) run.moves.push({ ref: a.ref, from: earlier.ref ? 'unique' : earlier.key, to, reason: a.reason, conf: a.conf, ...meta2 });
  }
  for (const r of scope) {
    const f = SC.familyOf(r, ws);
    if (placed.has(r) || f) run.notAnswered.delete(r); else run.notAnswered.add(r);
  }
  // current members of an existing family count as answered
  return { kept: arr.length };
}

/* ---------------- parse: request B ---------------- */
const B_ALLOWED = ['ref', 'current', 'suggestion', 'family_id', 'with', 'new_family', 'reason', 'confidence'];
export function ingestB(run, parsed, scope, meta = {}) {
  const ws = run.ws, SCOPE = new Set(scope), ALL = run.allSet, EXIST = new Map(SC.state(ws).families.map(f => [f.id, f])), sx = seedIndex(run.seed);
  const arr = parsed.matches || parsed.items || parsed.proposals;
  if (!Array.isArray(arr)) throw new Error(tr('The answer named no known candidate.'));
  const seen = new Set(), meta2 = { entryId: meta.entryId || '', model: meta.model || '' };
  for (const x of arr) {
    if (!x || typeof x !== 'object') { cnt(run, 'invalidItems'); continue; }
    extras(run, x, B_ALLOWED);
    const ref = flat(x.ref);
    if (!ALL.has(ref)) { cnt(run, 'unknownRefs'); continue; }
    if (!SCOPE.has(ref)) { cnt(run, 'outOfBatch'); continue; }
    if (seen.has(ref) || run.bm.has(ref)) { cnt(run, 'duplicateMembership'); continue; }
    seen.add(ref);
    const cur = SC.familyOf(ref, ws), echo = x.current == null || x.current === '' ? null : flat(x.current);
    if (echo !== (cur?.id || null)) cnt(run, 'currentEcho');
    let sug = flat(x.suggestion), fid = x.family_id == null ? null : flat(x.family_id);
    const base = { reason: txt(run, x.reason, 600), conf: confOf(x.confidence), with: (Array.isArray(x.with) ? x.with : []).map(flat).filter(w => { const ok = ALL.has(w); if (!ok) cnt(run, 'unknownRefs'); return ok && w !== ref; }), ...meta2 };
    if (sug === 'keep') {
      if (!cur) { cnt(run, 'keepWithoutFamily'); run.bm.set(ref, { sug: 'noop', ...base }); continue; }
      if (fid && fid !== cur.id && EXIST.has(fid)) sug = 'existing'; else { run.keeps.add(ref); run.bm.set(ref, { sug: 'keep', fid: cur.id, ...base }); continue; }
    }
    if (sug === 'existing') {
      if (!EXIST.has(fid)) { cnt(run, 'unknownRefs'); continue; }
      if (cur && fid === cur.id) { run.keeps.add(ref); run.bm.set(ref, { sug: 'keep', fid, ...base }); continue; }
      run.bm.set(ref, { sug: 'existing', fid, ...base });
    } else if (sug === 'seed') {
      if (!sx.byId.has(fid)) { cnt(run, 'unknownSeed'); continue; }
      run.bm.set(ref, { sug: 'seed', fid, ...base });
    } else if (sug === 'new') {
      if (!/^N\d\d$/.test(fid || '')) { cnt(run, 'unknownRefs'); continue; }
      const nf = x.new_family && typeof x.new_family === 'object' ? { name: txt(run, x.new_family.name, 200), statement: txt(run, x.new_family.statement, 900) } : { name: '', statement: '' };
      const have = run.newFam.get(fid);
      if (!have) run.newFam.set(fid, nf); else if (nf.name && have.name && nf.name !== have.name) cnt(run, 'newFamilyMismatch');
      run.bm.set(ref, { sug: 'new', fid, ...base });
    } else if (sug === 'unique') run.bm.set(ref, { sug: 'unique', fid: null, ...base });
    else { cnt(run, 'invalidItems'); continue; }
  }
  for (const r of scope) if (!run.bm.has(r)) run.notAnswered.add(r); else run.notAnswered.delete(r);
  return { kept: arr.length };
}

/* ---------------- parse: request C ---------------- */
const C_ITEM = ['category', 'decision', 'credible', 'material', 'basis', 'reason', 'confidence', 'families', 'proposal', 'not_proposed_reason', 'new_candidates'];
const RE_ATT = /^T\d{4}(\.\d{3})?$/, RE_CWE = /^CWE-\d{1,5}$/;
export function ingestC(run, parsed, meta = {}) {
  const ws = run.ws, GAPS = new Set(run.gaps), ALL = run.allSet, EXIST = new Map(SC.state(ws).families.map(f => [f.id, f])), sx = seedIndex(run.seed);
  const arr = parsed.categories || parsed.items;
  if (!Array.isArray(arr)) throw new Error(tr('The answer named no gap category.'));
  const meta2 = { entryId: meta.entryId || '', model: meta.model || '' }, orgText = flat(AI.orgContext(ws)).toLowerCase();
  const dups = new Set(SC.candidates(ws).map(c => SC.dupKey(c)));
  let newTotal = 0, topN = Math.max(maxN(run), 0);
  const placed = new Set();
  for (const x of arr) {
    if (!x || typeof x !== 'object') { cnt(run, 'invalidItems'); continue; }
    extras(run, x, C_ITEM);
    const cat = flat(x.category);
    if (!GAPS.has(cat)) { cnt(run, 'notAGap'); continue; }
    if (run.cats.some(c => c.category === cat)) { cnt(run, 'duplicateItems'); continue; }
    let decision = flat(x.decision), reason = txt(run, x.reason, 800);
    const b = x.basis && typeof x.basis === 'object' ? x.basis : {};
    const basis = { evidence: [], crown: [], facts: [], theme: flat(b.theme_gap) || null };
    for (const e of Array.isArray(b.evidence_ids) ? b.evidence_ids : []) { if (run.ev.has(flat(e))) basis.evidence.push(flat(e)); else cnt(run, 'unknownEvidence'); }
    for (const c of Array.isArray(b.crown_jewels) ? b.crown_jewels : []) { if (run.crown.has(flat(c))) basis.crown.push(flat(c)); else cnt(run, 'unknownRefs'); }
    for (const f of Array.isArray(b.profile_facts) ? b.profile_facts : []) { const t = flat(f); if (!t) continue; const found = orgText.includes(t.toLowerCase()); if (!found) cnt(run, 'factNotFound'); basis.facts.push({ text: t, found }); }
    const item = { category: cat, decision, reason, conf: confOf(x.confidence), basis, ...meta2, tick: [], proposal: null, cands: [], notProposed: null };
    if (decision !== 'not_proposed' && (x.credible === false || x.material === false)) {
      item.notProposed = x.credible === false ? 'not_credible' : 'not_material'; item.decision = 'not_proposed'; cnt(run, 'notCredibleProposed'); run.cats.push(item); continue;
    }
    if (decision === 'not_proposed') { item.notProposed = x.not_proposed_reason === 'not_credible' ? 'not_credible' : 'not_material'; run.cats.push(item); continue; }
    if (decision === 'covered') {
      item.tick = (Array.isArray(x.families) ? x.families : []).map(flat).filter(f => { const ok = EXIST.has(f); if (!ok) cnt(run, 'unknownRefs'); return ok; });
      if (!item.tick.length) continue; run.cats.push(item); continue;
    }
    if (decision === 'existing_candidates') {
      const p = x.proposal && typeof x.proposal === 'object' ? x.proposal : null; if (!p) continue;
      const mem = [];
      for (const raw of Array.isArray(p.members) ? p.members : []) {
        const ref = flat(raw); if (!ALL.has(ref)) { cnt(run, 'unknownRefs'); continue; } if (placed.has(ref) || mem.includes(ref)) { cnt(run, 'duplicateMembership'); continue; }
        const cur = SC.familyOf(ref, ws);
        if (cur) { run.moves.push({ ref, from: cur.id, to: { kind: 'proposal', key: 'N?' }, reason, conf: item.conf, ...meta2, pending: cat }); cnt(run, 'moveSuggestions'); continue; }
        mem.push(ref);
      }
      mem.forEach(r => placed.add(r));
      if (!mem.length) continue;
      let key = flat(p.id); if (!/^N\d\d$/.test(key) || run.fams.some(f => f.key === key)) { topN += 1; key = 'N' + pad2(topN); } else topN = Math.max(topN, +key.slice(1));
      if (mem.length >= 2) { item.proposal = { key, seed: null, name: txt(run, p.name, 200), statement: txt(run, p.statement, 900), members: mem, leftOut: [], alsoFits: [], reasons: [txt(run, p.reason, 600) || reason], coverage: uniq([cat, ...catsOf(run, p.coverage)]), conf: item.conf, why: null, ...meta2, batch: 1 }; run.fams.push(item.proposal); }
      else { item.proposal = null; run.uniques.push({ ref: mem[0], seed: null, reason: txt(run, p.reason, 600) || reason, coverage: uniq([cat, ...catsOf(run, p.coverage)]), conf: item.conf, why: null, downgraded: false, ...meta2, gap: cat }); }
      for (const m of run.moves) if (m.pending === cat) { m.to = { kind: 'proposal', key }; delete m.pending; }
      run.cats.push(item); continue;
    }
    if (decision === 'new_candidates') {
      if (!basis.evidence.length && !basis.crown.length && !basis.facts.some(f => f.found)) { cnt(run, 'ungrounded', (Array.isArray(x.new_candidates) ? x.new_candidates : []).length || 1); item.cands = []; run.cats.push(item); continue; }
      let n = 0;
      for (const c of Array.isArray(x.new_candidates) ? x.new_candidates : []) {
        if (!c || typeof c !== 'object') continue;
        if (n >= 3 || newTotal >= 12) { cnt(run, 'overCap'); continue; }
        const vulns = (Array.isArray(c.vulns) ? c.vulns : String(c.vulns || '').split(/;\s*/)).map(flat).filter(Boolean);
        const cand = { key: flat(c.key), name: txt(run, c.name, 120), statement: txt(run, c.statement, 600), threat_source: txt(run, c.threat_source, 160), initiating_event: txt(run, c.initiating_event, 240), vulns: vulns.slice(0, 5).map(v => clip(v, 160)),
          assets: txt(run, c.assets, 160), processes: txt(run, c.processes, 160), consequence: txt(run, c.consequence, 240), existing_controls: txt(run, c.existing_controls, 240), assumptions: txt(run, c.assumptions, 300),
          attack: (Array.isArray(c.attack) ? c.attack : []).map(flat).filter(a => { const ok = RE_ATT.test(a); if (!ok) cnt(run, 'invalidValues'); return ok; }),
          cwe: (Array.isArray(c.cwe) ? c.cwe : []).map(flat).filter(a => { const ok = RE_CWE.test(a); if (!ok) cnt(run, 'invalidValues'); return ok; }),
          cia: (Array.isArray(c.cia) ? c.cia : []).filter(v => ['C', 'I', 'A'].includes(v)),
          strategy: (Array.isArray(c.strategy) ? c.strategy : []).filter(v => SC.STRATEGIES.some(s => s[0] === v)), categories: uniq([cat, ...catsOf(run, c.categories)]),
          note: txt(run, c.note, 400) };
        if (!cand.name || !cand.statement || !cand.threat_source || !cand.initiating_event || !cand.vulns.length || !cand.assets || !cand.consequence) { cnt(run, 'incomplete'); continue; }
        const k = SC.dupKey({ name: cand.name, source: cand.threat_source, assets: cand.assets });
        if (dups.has(k)) { cnt(run, 'duplicateCandidate'); continue; }
        dups.add(k);
        if (!/^G\d\d$/.test(cand.key) || run.gapCands.some(g => g.key === cand.key)) { cand.key = 'G' + pad2(run.nextGap); cnt(run, 'renumbered'); }
        run.nextGap = Math.max(run.nextGap, +cand.key.slice(1)) + 1;
        const cb = c.basis && typeof c.basis === 'object' ? c.basis : {};
        cand.basis = { evidence: (cb.evidence_ids || []).map(flat).filter(e => run.ev.has(e)), crown: (cb.crown_jewels || []).map(flat).filter(e => run.crown.has(e)), facts: (cb.profile_facts || []).map(flat).filter(Boolean) };
        if (!cand.basis.evidence.length && !cand.basis.crown.length) { cand.basis.evidence = basis.evidence.slice(); cand.basis.crown = basis.crown.slice(); }
        cand.cat = cat; Object.assign(cand, meta2); item.cands.push(cand); run.gapCands.push(cand); n++; newTotal++;
      }
      if (item.cands.length || true) run.cats.push(item);
      continue;
    }
    cnt(run, 'invalidItems');
  }
  const answered = new Set(run.cats.map(c => c.category));
  for (const g of run.gaps) if (!answered.has(g)) run.notAnswered.add(g); else run.notAnswered.delete(g);
  void sx; return { kept: arr.length };
}

/** Mark-as-unique is refused when the ontology puts the candidate in a group with candidates still outside a family (spec 3.4 (1)); the grouping of this run counts even before it is stored on the cards. */
function uniqueBlockFor(run, ref, ws) {
  const why = SC.uniqueBlock(ref, ws); if (why) return why;
  const g = seedIndex(run.seed).byRef.get(ref)?.g; if (!g?.representative) return null;
  const mates = (g.members || []).map(m => m.ref).filter(m => m !== ref && run.allSet.has(m) && !SC.familyOf(m, ws));
  return mates.length ? `The ontology puts ${ref} in a cluster with ${mates.join(', ')}: group them in a family, or reject the match first.` : null;
}
/* ---------------- marks ---------------- */
const markOf = (run, it) => ({ by: users.name() || tr('single-user mode'), at: new Date().toISOString(), model: it.model || run.lastModel || '', entryId: it.entryId || '', request: run.request, key: it.key || '' });
export const isAiMark = m => !!m && !!m.request;
export const markText = mk => tr('AI-proposed, accepted by {0} on {1}').replace('{0}', mk?.by || '—').replace('{1}', String(mk?.at || '').slice(0, 10));

/* ---------------- items for the review panel ---------------- */
const KIND_NOTE = { b: 'Matches', };
void KIND_NOTE;
function detailNode(run, f, by) {
  const kids = [];
  if (f.reasons?.length) kids.push(el('div', { class: 'small', 'data-noi18n': '' }, el('b', null, tr('Reason'), ': '), f.reasons.join(' ')));
  if (f.coverage?.length) kids.push(el('div', { class: 'small' }, el('b', null, tr('Coverage'), ': '), ...f.coverage.map(c => chip(tr(c)))));
  if (f.leftOut?.length) kids.push(el('div', { class: 'small', 'data-noi18n': '' }, el('b', null, tr('Considered and left out'), ': '), f.leftOut.map(l => `${l.ref} (${l.reason})`).join(' · ')));
  if (f.why) {
    kids.push(el('details', { class: 'small fai-why' }, el('summary', null, pill(tr('why drafts'), 'warn'), ' ', tr('Drafts of the six “why this scenario?” answers — kept as drafts until you accept them at ③ Select'),
      f.why.evReplaced ? ' ' : '', f.why.evReplaced ? pill(tr('replaced: no evidence ID of the register cited'), 'warn') : '', f.why.evNonOrg ? pill(tr('cites reference material only'), 'warn') : ''),
      ...SC.WHY.map((q, i) => el('div', null, el('b', null, tr(q)), ' ', el('span', { 'data-noi18n': '' }, f.why.answers[i] || '—'))),
      f.why.evOriginal ? el('div', { class: 'muted', 'data-noi18n': '' }, tr('The model wrote') + ': ' + f.why.evOriginal) : null));
  } else if (f.members && f.members.length > 1 && run.request === 'A') kids.push(el('div', { class: 'small muted' }, tr('why drafts missing — draft at ③ Select')));
  void by;
  return kids.length ? el('div', { class: 'fai-detail' }, ...kids) : null;
}
export function itemsOf(run, ws = S.ws) {
  const by = Object.fromEntries(SC.candidates(ws).map(c => [c.id, c])), sx = seedIndex(run.seed);
  const mem = r => ({ id: r, name: by[r]?.name || '', note: sx.byRef.get(r)?.g.representative ? sx.byRef.get(r).g.cluster_id : '' });
  const confB = c => `${c} confidence`;
  const out = [];
  const modelNote = m => (m ? '' : '');
  void modelNote;
  const famItem = (f, op = 'family') => ({ key: 'fam:' + f.key, kind: 'family', op, ref: f, name: f.name, statement: f.statement, members: f.members.map(mem), badges: [confB(f.conf), ...(f.seed ? [] : [])],
    note: f.seed ? tr('Starts from the ontology group {0}.').replace('{0}', f.seed) : '', extra: detailNode(run, f) });
  const uniqItem = u => {
    const blocked = uniqueBlockFor(run, u.ref, ws);
    return { key: 'uniq:' + u.ref, kind: 'unique', op: 'unique', ref: u, name: by[u.ref]?.name || u.ref, statement: u.reason, members: [mem(u.ref)], badges: [confB(u.conf), ...(u.downgraded ? ['reduced to one member'] : [])],
      note: u.coverage?.length ? tr('Coverage') + ': ' + u.coverage.map(tr).join(', ') : '', blocked: blocked ? blocked : null,
      extra: u.why ? el('details', { class: 'small fai-why' }, el('summary', null, pill(tr('why drafts'), 'warn'), ' ', tr('Drafts of the six “why this scenario?” answers — kept as drafts until you accept them at ③ Select')),
        ...SC.WHY.map((q, i) => el('div', null, el('b', null, tr(q)), ' ', el('span', { 'data-noi18n': '' }, u.why.answers[i] || '—')))) : null };
  };
  const moveItem = m => {
    const to = m.to.kind === 'unique' ? tr('unique') : m.to.kind === 'existing' ? m.to.id : m.to.key;
    return { key: ['move', m.ref, m.to.kind === 'unique' ? 'unique' : m.to.id || m.to.key].join('|'), kind: 'move', op: 'move', ref: m, name: `${m.ref}: ${m.from || '—'} → ${to}`, statement: m.reason, members: [mem(m.ref)], badges: [confB(m.conf)],
      note: tr('A suggestion beside the current family {0}: accepting moves {1} out of it.').replace('{0}', m.from || '—').replace('{1}', m.ref) };
  };
  if (run.request === 'A' || run.request === 'C') {
    if (run.request === 'C') {
      for (const c of run.cats) {
        if (c.decision === 'covered') for (const fid of c.tick) out.push({ key: ['tick', fid, c.category].join('|'), kind: 'tick', op: 'tick', ref: { fid, category: c.category, ...c }, name: `${fid}: ${tr(c.category)}`, statement: c.reason, members: [], badges: [confB(c.conf)], note: tr('An accepted family already addresses this category but is not ticked: accepting ticks it (marked AI).'), editable: false });
        else if (c.notProposed) out.push({ key: 'info:' + c.category, kind: 'info', op: 'info', name: tr(c.category), statement: c.reason, members: [], badges: [], done: c.notProposed === 'not_credible' ? 'not proposed — not credible here' : 'not proposed — not material here', extra: basisNode(c.basis) });
        else if (c.proposal) out.push({ ...famItem(c.proposal), extra: el('div', null, detailNode(run, c.proposal), basisNode(c.basis)), note: tr('For the missing category {0}.').replace('{0}', tr(c.category)) });
        else for (const g of c.cands) out.push(gapItem(g, c, mem));
      }
      for (const u of run.uniques) out.push(uniqItem(u));
    } else {
      for (const f of run.fams) out.push(famItem(f));
      for (const e of run.exist.values()) if (e.adds.length) out.push({ key: 'join:' + e.id, kind: 'family', op: 'join', ref: e, name: e.id + ' — ' + (SC.state(ws).families.find(f => f.id === e.id)?.name || ''), statement: e.reasons.join(' '), members: e.adds.map(mem), badges: [confB(e.conf)], note: tr('{0} would join the existing family {1}.').replace('{0}', e.adds.join(', ')).replace('{1}', e.id), editable: false });
      for (const u of run.uniques) out.push(uniqItem(u));
    }
    for (const m of run.moves) out.push(moveItem(m));
    for (const r of run.renames) out.push({ key: 'rename:' + r.id, kind: 'rename', op: 'rename', ref: r, name: r.id + ': ' + r.name, statement: r.statement, members: [], badges: [confB(r.conf)], note: tr('A new name or statement for the existing family {0}.').replace('{0}', r.id) });
  } else {
    const fam = SC.state(ws).families, free = r => !SC.familyOf(r, ws), taken = new Set(), groups = new Map();
    for (const [ref, m] of run.bm) {
      const cur = SC.familyOf(ref, ws);
      if (m.sug === 'keep' || m.sug === 'noop') continue;
      if (m.sug === 'existing') { if (cur) out.push(moveItem({ ref, from: cur.id, to: { kind: 'existing', id: m.fid }, reason: m.reason, conf: m.conf })); else { const j = groups.get('join:' + m.fid) || { op: 'join', id: m.fid, adds: [], reasons: [], conf: m.conf, entryId: m.entryId, model: m.model }; j.adds.push(ref); if (m.reason) j.reasons.push(`${ref}: ${m.reason}`); groups.set('join:' + m.fid, j); } }
      else if (m.sug === 'seed' || m.sug === 'new') { const k = m.sug + ':' + m.fid; const g = groups.get(k) || { op: m.sug, id: m.fid, refs: [], reasons: [], conf: m.conf, entryId: m.entryId, model: m.model }; g.refs.push(ref, ...m.with); if (m.reason) g.reasons.push(`${ref}: ${m.reason}`); groups.set(k, g); }
      else if (m.sug === 'unique') { if (cur) out.push(moveItem({ ref, from: cur.id, to: { kind: 'unique' }, reason: m.reason, conf: m.conf })); else out.push(uniqItem({ ref, reason: m.reason, conf: m.conf, coverage: [], why: null, downgraded: false, entryId: m.entryId, model: m.model })); }
    }
    const fams = [], moves = [];
    for (const g of groups.values()) {
      if (g.op === 'join') { out.unshift({ key: 'join:' + g.id, kind: 'family', op: 'join', ref: g, name: g.id + ' — ' + (fam.find(f => f.id === g.id)?.name || ''), statement: g.reasons.join(' '), members: g.adds.map(mem), badges: [confB(g.conf)], note: tr('{0} would join the existing family {1}.').replace('{0}', g.adds.join(', ')).replace('{1}', g.id), editable: false }); continue; }
      const refs = uniq(g.refs).filter(r => run.allSet.has(r));
      let name, statement, key = g.id, seed = null;
      if (g.op === 'seed') { const sg = sx.byId.get(g.id); seed = g.id; refs.push(...(sg?.members || []).map(m => m.ref)); name = sg?.representative?.name || ''; statement = sg?.representative?.statement || ''; } else { const nf = run.newFam.get(g.id) || {}; name = nf.name; statement = nf.statement; }
      const freeM = uniq(refs).filter(r => free(r) && !taken.has(r)), inFam = uniq(refs).filter(r => !free(r) && (run.bm.get(r)?.fid === g.id));
      if (freeM.length >= 2) { freeM.forEach(r => taken.add(r)); fams.push({ key, seed, name, statement, members: freeM, leftOut: [], alsoFits: [], reasons: g.reasons, coverage: [], conf: g.conf, why: null, entryId: g.entryId, model: g.model }); for (const r of inFam) moves.push({ ref: r, from: SC.familyOf(r, ws).id, to: { kind: 'proposal', key }, reason: run.bm.get(r).reason, conf: run.bm.get(r).conf }); }
      else if (freeM.length === 1) { cnt(run, 'downgradedToUnique'); out.push(uniqItem({ ref: freeM[0], reason: g.reasons.join(' '), conf: g.conf, coverage: [], why: null, downgraded: true, entryId: g.entryId, model: g.model })); }
    }
    fams.forEach(f => out.unshift(famItem(f))); moves.forEach(m => out.push(moveItem(m)));
    out.sort((a, b) => ORDER.indexOf(a.op) - ORDER.indexOf(b.op));
    if (run.keeps.size) out.push({ key: 'info:keep', kind: 'info', op: 'info', name: tr('{0} confirmed in their family').replace('{0}', run.keeps.size), statement: [...run.keeps].sort(cmp).join(' '), members: [], badges: [], done: 'nothing to accept' });
  }
  return out.filter(i => !run.resolved.has(i.key));
}
const ORDER = ['family', 'new', 'seed', 'join', 'unique', 'move', 'rename', 'tick', 'gap', 'info'];
function basisNode(b) {
  if (!b) return null;
  const parts = [...b.evidence, ...b.crown];
  return el('div', { class: 'small', 'data-noi18n': '' }, el('b', null, tr('Basis'), ': '), parts.join(' ') || '—', ...b.facts.map(f => [' · ', f.text, f.found ? '' : ' ']).flat(), ...b.facts.filter(f => !f.found).map(() => pill(tr('not found in the profile'), 'warn')));
}
function gapItem(g, c, mem) {
  void mem;
  return { key: 'gap:' + g.key, kind: 'gap', op: 'gap', ref: g, name: g.name, statement: g.statement, members: [], badges: [`${c.conf} confidence`, ...g.strategy], note: `${tr('Missing category')}: ${tr(c.category)}. ${c.reason}`,
    extra: el('div', { class: 'fai-detail', 'data-noi18n': '' }, el('div', null, el('b', null, tr('Threat source'), ': '), g.threat_source, ' · ', el('b', null, tr('Initiating event'), ': '), g.initiating_event),
      el('div', null, el('b', null, tr('Weaknesses'), ': '), g.vulns.join('; ')), el('div', null, el('b', null, tr('Assets'), ': '), g.assets, ' · ', el('b', null, tr('Consequence'), ': '), g.consequence), basisNode({ evidence: g.basis.evidence, crown: g.basis.crown, facts: g.basis.facts.map(t => ({ text: t, found: true })) })) };
}

/* ---------------- acceptance (the only writes) ---------------- */
const who = () => users.name() || tr('single-user mode');
const finishWrite = ws => { SC.state(ws).updated = new Date().toISOString().slice(0, 10); touch(); };
function logAccept(ws, what, target, detail) { LOG.data(what, target, `${detail} — ${tr('by')} ${who()}`, ws.name); users.audit(what, `${target}: ${detail}`, ws); }
function setWhyDraft(holder, why, mk) { holder.whyDraft = { answers: why.answers.slice(), evidence: why.evidence.slice(), evOriginal: why.evOriginal || '', evReplaced: !!why.evReplaced, evNonOrg: !!why.evNonOrg, model: mk.model, at: mk.at, entryId: mk.entryId, request: mk.request, key: mk.key }; }
function acceptItem(run, it, edits, ws) {
  const mk = markOf(run, { ...it.ref, key: it.ref?.key || it.key, entryId: it.ref?.entryId, model: it.ref?.model });
  const have = new Set(SC.candidates(ws).map(c => c.id));
  switch (it.op) {
    case 'info': return null;
    case 'family': case 'new': case 'seed': {
      const ids = (edits.members || []).filter(i => have.has(i)), free = ids.filter(i => !SC.familyOf(i, ws));
      if (free.length < 2) return free.length < ids.length ? 'Some members are already in a family: reject, or edit the members.' : 'A family needs at least two members; reject it or keep two.';
      const f = SC.mergeInto(free, { name: edits.name, statement: edits.statement }, ws);
      f.name = edits.name || f.name; f.statement = edits.statement ?? f.statement;
      const rf = it.ref;
      if (rf.reasons?.length) f.rationale = 'AI: ' + rf.reasons.join(' ') + ' — ' + MK.ESTIMATE + '.';
      f.aiMark = mk; f.memberMarks ||= {}; for (const m of free) f.memberMarks[m] = mk;
      f.coverage = uniq([...(f.coverage || []), ...(rf.coverage || [])]); f.coverageMarks ||= {}; for (const c of rf.coverage || []) f.coverageMarks[c] = mk;
      if (rf.why) setWhyDraft(f, rf.why, mk);
      run.keyMap[rf.key] = f.id; finishWrite(ws);
      logAccept(ws, 'family proposed by AI and accepted', f.id, `${free.join(', ')} (${rf.key})`);
      return null;
    }
    case 'join': {
      const f = SC.state(ws).families.find(x => x.id === it.ref.id); if (!f) return 'The family no longer exists.';
      const free = (edits.members || []).filter(i => have.has(i) && !SC.familyOf(i, ws));
      if (!free.length) return 'Every member is already in a family.';
      SC.mergeInto(free, { family: f.id }, ws); f.memberMarks ||= {}; for (const m of free) f.memberMarks[m] = mk;
      finishWrite(ws); logAccept(ws, 'candidates added to a family by an accepted AI suggestion', f.id, free.join(', ')); return null;
    }
    case 'unique': {
      const r = it.ref.ref; if (!have.has(r)) return 'No such candidate.';
      const why = uniqueBlockFor(run, r, ws) || SC.markUnique(r, who(), ws); if (why) return why;
      const rec = SC.rec(r, ws); rec.unique.ai = mk;
      if (it.ref.why) rec.proposals.push({ kind: 'why', state: 'draft', answers: it.ref.why.answers.slice(), evidence: it.ref.why.evidence.slice(), evReplaced: !!it.ref.why.evReplaced, request: mk.request, key: mk.key, model: mk.model, at: mk.at, entryId: mk.entryId });
      finishWrite(ws); logAccept(ws, 'unique candidate proposed by AI and accepted', r, it.ref.reason || ''); return null;
    }
    case 'move': {
      const m = it.ref, cur = SC.familyOf(m.ref, ws);
      if (m.from && m.from !== 'unique' && cur?.id !== m.from) return 'The candidate is no longer in that family.';
      if (cur && cur.selected && (cur.members || []).length <= 1) return 'A selected family keeps at least one member';
      if (m.to.kind === 'unique') {
        const idx = cur ? cur.members.indexOf(m.ref) : -1; SC.leaveFamily(m.ref, ws);
        const why = SC.markUnique(m.ref, who(), ws); if (why) { if (cur) cur.members.splice(idx, 0, m.ref); return why; }
        SC.rec(m.ref, ws).unique.ai = mk; if (cur?.memberMarks) delete cur.memberMarks[m.ref];
      } else {
        const id = m.to.kind === 'existing' ? m.to.id : run.keyMap[m.to.key];
        if (!id) return tr('Accept the family {0} first.').replace('{0}', m.to.key || '');
        const f = SC.state(ws).families.find(x => x.id === id); if (!f) return 'The family no longer exists.';
        if (cur?.memberMarks) delete cur.memberMarks[m.ref];
        SC.mergeInto([m.ref], { family: f.id }, ws); f.memberMarks ||= {}; f.memberMarks[m.ref] = mk;
      }
      finishWrite(ws); logAccept(ws, 'candidate moved by an accepted AI suggestion', m.ref, `${m.from || '—'} → ${m.to.kind === 'unique' ? 'unique' : m.to.id || run.keyMap[m.to.key] || m.to.key}`); return null;
    }
    case 'rename': {
      const f = SC.state(ws).families.find(x => x.id === it.ref.id); if (!f) return 'The family no longer exists.';
      f.name = edits.name?.replace(new RegExp('^' + f.id + ':\\s*'), '') || it.ref.name; f.statement = edits.statement || it.ref.statement; finishWrite(ws);
      logAccept(ws, 'family renamed by an accepted AI suggestion', f.id, f.name); return null;
    }
    case 'tick': {
      const f = SC.state(ws).families.find(x => x.id === it.ref.fid); if (!f) return 'The family no longer exists.';
      f.coverage = uniq([...(f.coverage || []), it.ref.category]); (f.coverageMarks ||= {})[it.ref.category] = mk; finishWrite(ws);
      logAccept(ws, 'coverage tick proposed by AI and accepted', f.id, it.ref.category); return null;
    }
    case 'gap': {
      const g = it.ref, o = { name: edits.name || g.name, source: g.threat_source, vuln: g.vulns.join('; '), assets: g.assets, consequence: g.consequence, ref: '', status: 'Candidate' };
      if (SC.hasDuplicate(o, ws)) return 'A candidate with this name, threat source and assets already exists.';
      const note = `${tr('[AI — coverage gap]')} ${g.cat} — ${g.note} — ${MK.ESTIMATE}.`;
      const draft = { statement: edits.statement || g.statement, threat_source: g.threat_source, vulns: g.vulns.slice(), assets: g.assets, processes: g.processes, consequence: g.consequence, initiating_event: g.initiating_event,
        existing_controls: g.existing_controls, assumptions: g.assumptions, attack: g.attack.slice(), cwe: g.cwe.slice(), cves: [], params: {}, origin: 'ai' };
      const id = SC.addCandidate({ ...o, note, strategy: g.strategy, draft }, ws), rec = SC.rec(id, ws);
      rec.aiGap = { category: g.cat, key: g.key, ...mk, key2: g.key }; rec.aiGap.key = g.key;
      rec.basis = [...g.basis.evidence, ...g.basis.crown, ...g.basis.facts.map(f => 'profile: ' + f)].join('; ');
      finishWrite(ws); logAccept(ws, 'coverage-gap candidate proposed by AI and accepted', id, `${g.cat} (${g.key})`); return null;
    }
    default: return 'Unknown proposal.';
  }
}

/* ---------------- the "why" drafts at ③ Select ---------------- */
export function draftOf(unit, ws = S.ws) {
  if (unit.kind === 'family') return SC.state(ws).families.find(f => f.id === unit.id)?.whyDraft || null;
  return SC.rec(unit.id, ws).proposals.find(p => p.kind === 'why' && p.state === 'draft') || null;
}
export function useDraft(unit, ws = S.ws, { replace = false } = {}) {
  const d = draftOf(unit, ws); if (!d) return 0;
  const w = SC.whyOf(unit, ws); let n = 0;
  d.answers.forEach((a, i) => { if (a && (replace || !flat(w[i]))) { w[i] = a; n++; } });
  const mk = { by: who(), at: new Date().toISOString(), model: d.model, entryId: d.entryId, request: d.request, key: d.key, replaced: !!replace };
  if (unit.kind === 'family') { const f = SC.state(ws).families.find(x => x.id === unit.id); f.whyMark = mk; f.whyDraft = null; } else { d.state = 'accepted'; d.mark = mk; SC.rec(unit.id, ws).whyMark = undefined; delete SC.rec(unit.id, ws).whyMark; }
  finishWrite(ws); logAccept(ws, 'why-this-scenario drafts proposed by AI and accepted', unit.id, `${n} answer(s)${replace ? ', replacing' : ''}`);
  return n;
}
export function discardDraft(unit, ws = S.ws) {
  const d = draftOf(unit, ws); if (!d) return;
  if (unit.kind === 'family') SC.state(ws).families.find(x => x.id === unit.id).whyDraft = null; else d.state = 'discarded';
  finishWrite(ws); LOG.data('why-this-scenario drafts proposed by AI discarded', unit.id, `${tr('by')} ${who()}`, ws.name);
}
/** The box shown above the six answers of a selected item that has an AI draft. */
export function whyDraftNode(unit, ws, rerender) {
  const d = draftOf(unit, ws); if (!d) return null;
  const mk = markers();
  return el('div', { class: 'card fai-why-draft', 'data-draft': unit.id, style: { margin: '6px 0' } },
    el('div', { class: 'small' }, pill(tr('AI draft'), 'warn'), ' ', el('b', null, tr('Drafts of the six answers, proposed by AI')), ' ', el('span', { class: 'muted', 'data-noi18n': '' }, `${d.model || ''} ${String(d.at || '').slice(0, 10)}`),
      d.evReplaced ? [' ', pill(tr('replaced: no evidence ID of the register cited'), 'warn')] : ''),
    el('p', { class: 'small muted' }, mk.estimate + '. ' + tr('Nothing is recorded until you accept: the draft fills the empty answers (or replaces them all), and you can edit every answer afterwards.')),
    ...SC.WHY.map((q, i) => el('div', { class: 'small' }, el('b', null, tr(q)), ' ', el('span', { 'data-noi18n': '' }, d.answers[i] || '—'))),
    el('div', { class: 'btnrow', style: { marginTop: '6px' } },
      el('button', { class: 'btn sm', 'data-act': 'use-draft', onclick: () => { const n = useDraft(unit, ws); toast(tr('{0} answer(s) filled from the AI draft').replace('{0}', n)); rerender?.(); } }, tr('Use the draft (fills the empty answers)')),
      el('button', { class: 'btn sm ghost', 'data-act': 'replace-draft', onclick: () => { const n = useDraft(unit, ws, { replace: true }); toast(tr('{0} answer(s) filled from the AI draft').replace('{0}', n)); rerender?.(); } }, tr('Replace all six answers')),
      el('button', { class: 'btn sm ghost', 'data-act': 'discard-draft', onclick: () => { discardDraft(unit, ws); rerender?.(); } }, tr('Discard the draft'))));
}

/* ---------------- the flows ---------------- */
const RUNS = new Map();                      // workspace id → the last run, kept while the screen is redrawn
export const lastRun = ws => RUNS.get(ws.id) || null;
const TITLE = { A: 'Propose families with AI — what will be sent', B: 'Match candidates to families — what will be sent', C: 'Propose families for missing categories — what will be sent' };

/** Send one request (one batch) through the preview and ingest its answer. → true when something was ingested. */
async function sendOne(run, ws, { ids, batch, again = false, gaps = null }) {
  run.sentNext = maxN(run) + 1;
  const out = await aiui.request(KEY, { request: run.request, ids, batch, run, seed: run.seed, single: run.single, again, gaps: gaps || run.gaps, nextGap: run.nextGap, seedWhy: run.seedWhy },
    { title: tr(TITLE[run.request]) + (batch.of > 1 ? ` (${batch.index}/${batch.of})` : ''), ws });
  if (!out) return null;
  run.entryIds.push(out.entryId); run.models.add(out.model); run.lastModel = out.model;
  let parsed;
  try { parsed = AI.parseJson(out.text); } catch (e) { toast(tr('The answer was not machine-readable: ') + e.message, 'bad'); AI.decide(out.entryId, 'rejected', 'unreadable answer', ws); return false; }
  if (parsed && !Array.isArray(parsed) && parsed.request && parsed.request !== run.request) { toast(tr('The answer is for request {0}, not {1}.').replace('{0}', parsed.request).replace('{1}', run.request), 'bad'); AI.decide(out.entryId, 'rejected', 'answer for another request', ws); return false; }
  if (Array.isArray(parsed)) parsed = { [run.request === 'A' ? 'proposals' : run.request === 'B' ? 'matches' : 'categories']: parsed };
  const trunc = !!out.truncated || TRUNC.has(out.stop_reason) || !!parsed.__truncated || AI.truncated(parsed, out.usage, out.maxTokens || 0);
  const meta = { entryId: out.entryId, model: out.model, batch: batch.index };
  let r;
  try { r = run.request === 'A' ? ingestA(run, parsed, ids, meta) : run.request === 'B' ? ingestB(run, parsed, ids, meta) : ingestC(run, parsed, meta); }
  catch (e) { toast(e.message, 'bad'); AI.decide(out.entryId, 'rejected', e.message, ws); return false; }
  if (trunc) { run.truncated = true; run.trunc.push({ batch: batch.index, stop: out.stop_reason || '', tokens: out.usage?.out, kept: r.kept }); }
  return true;
}
async function runRequest(ws, rerender, request, o = {}) {
  if (!enabled()) { toast(tr('Screening family proposals are switched off (Settings → AI — local & remote).'), 'bad'); return null; }
  const st = await aiui.status(ws, KEY); if (!st.ok) { toast(tr(st.why), 'bad'); return null; }
  const cands = SC.candidates(ws); if (!cands.length) { toast(tr('There is no candidate to group yet: add candidates in the first stage.'), 'bad'); return null; }
  const { seed, why } = request === 'C' ? await seedFor(ws) : await seedFor(ws);
  const refs = cands.map(c => c.id);
  const gaps = request === 'C' ? gapCategories(ws) : [];
  const run = newRun(request, ws, { seed, seedWhy: why, refs, single: !!o.ids && o.ids.length === 1 && request === 'B', gaps });
  const prev = RUNS.get(ws.id); if (prev && prev.entryIds.length && !prev.settled) settle(prev, ws, true);
  if (request === 'C') {
    if (!gaps.length && !(seed?.theme_gaps || []).length) { toast(tr('Every coverage category has a family.'), 'warn'); return null; }
    run.batchesOf = 1; const ok = await sendOne(run, ws, { ids: refs, batch: { index: 1, of: 1 }, gaps });
    if (ok === null) return null; if (ok === false) return null;
  } else {
    const scope = o.ids || refs, parts = o.ids ? [scope.slice().sort(cmp)] : batches(scope, seed, SC.state(ws).families);
    run.batchesOf = parts.length; run.scope = scope;
    for (let i = 0; i < parts.length; i++) {
      run.batches = i + 1;
      const ok = await sendOne(run, ws, { ids: parts[i], batch: { index: i + 1, of: parts.length } });
      if (ok === null) { run.notSent = parts.slice(i).flat(); break; }            // the preview was cancelled
      if (ok === false) { run.notSent = parts.slice(i + 1).flat(); run.failed = true; break; }
    }
    if (run.notSent.length) for (const r of run.notSent) run.notAnswered.add(r);
    if (!run.entryIds.length) return null;
    if (run.failed && !run.fams.length && !run.uniques.length && !run.exist.size && !run.bm.size) return null;   // nothing was readable: the error toast says so, nothing is shown or applied
  }
  RUNS.set(ws.id, run);
  if (!itemsOf(run, ws).length && !run.notAnswered.size && !run.truncated && request !== 'C') { toast(tr('The answer named no known candidate.'), 'bad'); for (const id of run.entryIds) AI.decide(id, 'rejected', 'nothing usable', ws); return null; }
  rerender?.(); redraw(ws, rerender);
  return run;
}
export const proposeA = (ws = S.ws, rerender) => runRequest(ws, rerender, 'A');
export const proposeB = (ws = S.ws, rerender, ids = null) => runRequest(ws, rerender, 'B', { ids });
export const proposeC = (ws = S.ws, rerender) => runRequest(ws, rerender, 'C');
async function askAgain(run, ws, rerender) {
  const refs = [...run.notAnswered].sort(cmp);
  if (!refs.length) return;
  if (run.request === 'C') { const ok = await sendOne(run, ws, { ids: run.all, batch: { index: 1, of: 1 }, gaps: refs, again: true }); void ok; }
  else { const ok = await sendOne(run, ws, { ids: refs, batch: { index: 1, of: 1 }, again: true }); void ok; run.notSent = run.notSent.filter(r => run.notAnswered.has(r)); }
  settleCheck(run);
  rerender?.(); redraw(ws, rerender);
}

/* ---------------- journal ---------------- */
function settle(run, ws, force = false) {
  const note = `${run.accepted} accepted, ${run.rejected} rejected${run.truncated ? ', answer cut off' : ''}${run.batchesOf > 1 ? `, ${run.batchesOf} batches` : ''}, by ${who()}`;
  for (const id of run.entryIds) AI.decide(id, run.accepted ? 'accepted' : 'rejected', run.accepted || force ? note : 'proposals dismissed', ws);
  if (!itemsOf(run, ws).length) run.settled = true;
}
function settleCheck(run) { void run; }

/* ---------------- the panel ---------------- */
const COUNT_LABELS = { unknownRefs: 'identifiers not in the request', unknownSeed: 'ontology group not in the request', unknownEvidence: 'evidence IDs not in the register', outOfBatch: 'candidates outside the batch',
  duplicateMembership: 'candidates already placed (first placement kept)', moveSuggestions: 'moves suggested beside a current family', emptyDropped: 'families with no valid member', downgradedToUnique: 'families reduced to one member (shown as unique)',
  evReplaced: 'evidence answers replaced by the information-gap marker', markerAdded: 'answers given the estimate marker', markerNormalized: 'markers put in the interface language', invalidValues: 'values outside the lists', extraFields: 'fields ignored (not part of the format)', renumbered: 'keys renumbered',
  renameSuggestions: 'name or statement changes suggested for an existing family', trimmed: 'texts shortened', currentEcho: 'current families corrected from the workspace', keepWithoutFamily: '“keep” for a candidate with no family', newFamilyMismatch: 'new-family names that differed between items',
  invalidItems: 'items not understood', notAGap: 'categories that were not gaps', duplicateItems: 'categories answered twice', notCredibleProposed: 'proposals dropped for a category not credible or not material', ungrounded: 'new candidates without a basis', incomplete: 'new candidates missing a chain field',
  duplicateCandidate: 'new candidates duplicating an existing one', overCap: 'new candidates over the limit', factNotFound: 'profile facts not found in the profile', evNonOrg: 'evidence answers citing reference material only', continuesFixed: 'continuations read as new families' };
function redraw(ws, rerender) {
  const host = document.querySelector('#scr-ai-fam-out'); if (!host) return;
  const run = RUNS.get(ws.id); if (!run) { host.replaceChildren(); return; }
  drawRun(host, run, ws, rerender);
}
export function drawRun(host, run, ws, rerender) {
  const items = itemsOf(run, ws);
  const lbl = { A: 'Propose families with AI', B: 'Match candidates to families', C: 'Propose families for missing categories' }[run.request];
  const source = el('span', null, pill(tr(lbl), 'good'), ' ', el('span', { 'data-noi18n': '' }, [...run.models].join(', ')),
    run.batchesOf > 1 ? ` · ${tr('{0} batches').replace('{0}', run.batchesOf)}` : '', ' · ', tr('{0} candidate(s) covered').replace('{0}', run.all.length - run.notAnswered.size > 0 && run.request !== 'C' ? run.all.length - run.notAnswered.size : run.all.length),
    run.seed ? el('span', { class: 'muted', 'data-noi18n': '' }, ` · CRGO ${run.seed.release || ''}`) : el('span', { class: 'muted' }, ' · ' + tr('no ontology grouping')));
  const panel = reviewPanel({ id: 'scr-ai-fam-panel', title: tr(lbl), items, source,
    lede: tr('Nothing changes until you accept. Proposed by AI — an analytical estimate, not a decision. Accepting writes “AI-proposed, accepted by {0} on {1}” on the family, the membership or the candidate; your own families are never changed without a separate accepted suggestion.').replace('{0}', who()).replace('{1}', new Date().toISOString().slice(0, 10)),
    onAccept: (it, edits) => { const m = acceptItem(run, it, edits, ws); if (!m) { run.resolved.add(it.key); run.accepted++; settle(run, ws); toast(tr('Accepted: {0}').replace('{0}', it.name)); rerender?.(); } return m; },
    onReject: it => { run.resolved.add(it.key); run.rejected++; settle(run, ws); },
    onAcceptAll: true, empty: 'No proposal is left to review.' });
  const counts = Object.entries(run.counts).filter(([k, v]) => v && COUNT_LABELS[k]);
  const kids = [banner('warn', tr(MK.ESTIMATE), tr('Proposed by {0}. Only what you accept is recorded.').replace('{0}', [...run.models].join(', ') || 'AI'))];
  if (run.truncated) kids.push(banner('bad', tr('The answer was cut off'), tr('{0}: the complete proposals were kept; the last one was incomplete and left out. Ask again for the rest.').replace('{0}', run.trunc.map(t => `${tr('batch')} ${t.batch}${t.stop ? ` (${t.stop}${t.tokens ? ', ' + t.tokens + ' tokens' : ''})` : ''}`).join('; '))));
  if (run.failed) kids.push(banner('bad', tr('A batch could not be read'), tr('The candidates of the batches that were not read are listed below.')));
  kids.push(panel);
  if (run.notAnswered.size) kids.push(el('div', { class: 'card fai-unanswered', id: 'scr-ai-fam-unanswered' }, el('b', null, run.request === 'C' ? tr('Categories not answered') : tr('Candidates not covered')), ': ',
    ...[...run.notAnswered].sort(cmp).map(r => chip(r)), ' ', el('button', { class: 'btn sm', id: 'scr-ai-fam-again', onclick: () => askAgain(run, ws, rerender) }, tr('Ask again for these {0}').replace('{0}', run.notAnswered.size))));
  if (counts.length) kids.push(el('details', { class: 'small', id: 'scr-ai-fam-counts' }, el('summary', null, tr('What the application changed or left out')), el('ul', null, ...counts.map(([k, v]) => el('li', null, `${v} ${tr(COUNT_LABELS[k])}`)))));
  kids.push(el('div', { class: 'btnrow' }, el('button', { class: 'btn ghost sm', id: 'scr-ai-fam-dismiss', onclick: () => { for (const it of itemsOf(run, ws)) { run.resolved.add(it.key); run.rejected++; } run.notAnswered.clear(); settle(run, ws, true); RUNS.delete(ws.id); rerender?.(); redraw(ws, rerender); } }, tr('Dismiss all'))));
  host.replaceChildren(...kids);
}

/** ② Screen: the AI buttons and the last panel (the slot sits under the ontology grouping). */
export function section(slot, ws, rerender) {
  const out = el('div', { id: 'scr-ai-fam-out' });
  if (!enabled()) { slot.replaceChildren(); return; }
  const gaps = gapCategories(ws), tg = SC.state(ws).themeGap || [];
  const a = el('button', { class: 'btn', id: 'scr-ai-fam-a', onclick: () => proposeA(ws, rerender) }, tr('Propose families with AI'));
  const c = el('button', { class: 'btn ghost', id: 'scr-ai-fam-c', disabled: !gaps.length && !tg.length, title: gaps.length || tg.length ? gaps.join(', ') : tr('Every coverage category has a family'),
    onclick: () => proposeC(ws, rerender) }, tr('Propose families for missing categories'));
  slot.replaceChildren(el('div', { class: 'btnrow', style: { marginTop: '8px' } }, a, c,
    el('span', { class: 'small muted' }, tr('The AI sees every candidate (in batches of at most 40, each with its own preview), the ontology grouping and your families. It proposes; you accept, edit or reject.'))), out);
  if (RUNS.get(ws.id)) redraw(ws, rerender);
}
