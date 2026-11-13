/* familypayload.js — the payload of the AI family requests (1.9.3, W3; C6): system text, common blocks, candidate lines,
   trimming to the size budget, the AI.TASKS entry `screening_families`. English by contract with the model (not interface text).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from './state.js';
import { tr } from './i18n.js';
import * as AI from './ai.js';
import * as SC from './screening.js';
import * as MK from './markers.js';
import { TEXT } from './familytext.js';

export const KEY = 'screening_families';
export const BUDGET = 60000;          // bytes of system + prompt one request aims at (the helper's hard limit is 400 kB)
const SYSTEM = `You are a senior cybersecurity risk analyst working inside CyberRiskGuardian, a scenario-driven risk
assessment tool. You help an analyst consolidate candidate scenarios into families, place candidates in families and
check the portfolio for blind spots (book chapter 5, Process steps 6 and 7). You propose; the analyst decides through the
application's review screen, and nothing you return is recorded until the analyst accepts it. You never invent
organizational facts, evidence, identifiers or numbers: you use only the organization context, the evidence register,
the ontology grouping and the candidates in the request, and you cite only identifiers that appear in it. You do not
score, rank, select or quantify: no screening scores, risk parameters, CVSS values, probabilities or costs. Every
proposal is an "${MK.ESTIMATE}". Answer with one JSON object only, in the format the request gives, and nothing else.`;

export const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);                 // code-point order, never localeCompare
export const flat = s => String(s ?? '').replace(/\s+/g, ' ').trim();
export const pad2 = n => String(n).padStart(2, '0');
export const uniq = a => [...new Set(a)];
/** Cut on a word boundary, add "…"; never inside an identifier because identifiers contain no space. */
export function clip(s, n) {
  s = flat(s); if (s.length <= n) return s;
  const cut = s.slice(0, n - 1), i = cut.lastIndexOf(' ');
  return (i > n * 0.6 ? cut.slice(0, i) : cut).replace(/[\s,;:—-]+$/, '') + '…';
}
export const markers = () => ({ estimate: tr(MK.ESTIMATE), gap: tr(MK.INFO_GAP) });
export function seedIndex(seed) {
  const groups = seed?.groups || [], byRef = new Map(), byId = new Map();
  for (const g of groups) { byId.set(g.cluster_id, g); for (const m of g.members || []) byRef.set(m.ref, { g, m }); }
  return { groups, byRef, byId };
}

/* ---------------- coverage ---------------- */
/** Categories no accepted family ticks (selected or not). */
export const gapCategories = (ws = S.ws) => { const cov = new Set(SC.state(ws).families.flatMap(f => f.coverage || [])); return SC.CATEGORIES.filter(c => !cov.has(c)); };

/* ---------------- payload ---------------- */
function commonLines(ws, lvl) {
  const evT = lvl >= 4 ? 60 : 120, mk = markers();
  const ev = (ws.assessment.EVIDENCE || []).slice(0, 60).map(e => `  ${e[0]} — ${clip(e[1], evT)}${e[2] ? ` [${clip(e[2], 40)}]` : ''}`);
  const crown = (ws.assessment.CROWN || []).slice(0, 20).map(r => `  ${r[0]} ${clip(r[1], 100)}${r[2] ? ' — ' + clip(r[2], 100) : ''}`);
  return [AI.orgContext(ws), '',
    crown.length ? 'Crown jewels:' : 'No crown jewel recorded.', ...crown,
    ev.length ? 'Evidence register (cite these IDs where an answer rests on them; the class is in brackets — methodology, reference and illustrative entries are not organizational evidence):'
      : 'Evidence register: empty — no organizational evidence is available to you; every organizational-evidence answer is an information gap.', ...ev, '',
    'Markers (write them exactly as given):', `  estimate: "${mk.estimate}"`, `  gap: "${mk.gap}"`, ''];
}
function seedLines(seed, why, lvl) {
  if (!seed) return ['Ontology grouping: not available' + (why ? ' — ' + clip(why, 160) : '') + ' (start from the candidates alone).', ''];
  const lines = [`Ontology grouping (CRGO ${seed.algorithm || 'crgo-grouping/1'}, release ${seed.release || '?'}, ${seed.via === 'snapshot' ? 'computed from the shipped snapshot' : 'computed on this computer'} — your starting point):`];
  for (const g of seed.groups || []) {
    const refs = (g.members || []).map(m => m.ref).sort(cmp).join(' ');
    if (!g.representative) lines.push(`  ${g.cluster_id} | own | no library match${g.theme_gap ? ' | theme gap: ' + g.theme_gap : ''} | members: ${refs}`);
    else { const rp = g.representative; lines.push(`  ${g.cluster_id} | ${g.kind} | CRGO representative: ${lvl >= 4 ? flat(rp.name) : clip([rp.name, rp.statement].filter(Boolean).join(' — '), 160)} | members: ${refs}`); }
  }
  const gaps = seed.theme_gaps || [];
  lines.push(`  Theme gaps: ${gaps.length ? gaps.map(t => (typeof t === 'string' ? t : t.theme || t.label || JSON.stringify(t))).join('; ') : 'none'}`, '');
  return lines;
}
function famLines(ws, { stm = 400, why = true } = {}) {
  return SC.state(ws).families.map(f => {
    const n = SC.WHY.filter((_, i) => flat(f.why?.[i])).length, marks = [f.aiMark && 'AI-proposed', f.ontoMark && 'Ontology-proposed'].filter(Boolean);
    return `  ${f.id} | ${clip(f.name, 120)} | members: ${(f.members || []).slice().sort(cmp).join(' ')} | ${f.selected ? 'selected' : 'not selected'} | coverage: ${(f.coverage || []).join('; ') || 'not recorded'}${why ? ` | why answers: ${n === 6 ? 'complete' : n ? n + ' of 6' : 'none'}` : ''}${marks.length ? ' | ' + marks.join(', ') : ''} | statement: ${clip(f.statement, stm)}`;
  });
}
function candFull(ws, c, ix, lvl) {
  const r = SC.rec(c.id, ws), d = r.draft || {}, fam = SC.familyOf(c.id, ws), f = [c.id, clip(c.name, 120)];
  const add = (k, v, n) => { v = clip(v, n); if (v) f.push(`${k}: ${v}`); };
  add('source', c.source || d.threat_source, 160); add('weakness', c.vuln || (d.vulns || []).join('; '), 160);
  add('assets', c.assets || d.assets, 160); add('consequence', c.consequence || d.consequence, 160);
  add('statement', d.statement, lvl >= 2 ? 240 : 400);
  const cn = lvl >= 3 ? 100 : 160, ch = [d.initiating_event && 'event ' + clip(d.initiating_event, cn), d.processes && 'processes ' + clip(d.processes, cn), d.existing_controls && 'controls ' + clip(d.existing_controls, cn)].filter(Boolean);
  if (ch.length) f.push('chain: ' + ch.join('; '));
  if ((r.strategy || []).length) f.push('strategy: ' + r.strategy.join(' '));
  const t = SC.total(r); f.push('screening: ' + (t == null ? 'unscored' : `${t}/60${(r.flags || []).length ? ', flags ' + r.flags.join(' ') : ''}`));
  const sx = ix.byRef.get(c.id); f.push('ontology: ' + (sx ? (sx.g.representative ? `${sx.g.cluster_id} (${sx.m.match?.rule || sx.g.kind})` : 'own') : r.ontologyMatch?.cluster ? r.ontologyMatch.cluster : 'none'));
  f.push('family: ' + (fam?.id || '—')); if (r.disp) f.push('disposition: ' + r.disp);
  if (lvl < 1) add('rationale', r.rat, 200);
  return '  ' + f.join(' | ');
}
function candCompact(ws, c, ix, extra = false) {
  const r = SC.rec(c.id, ws), t = SC.total(r), sx = ix.byRef.get(c.id);
  const f = [c.id, clip(c.name, 80), t == null ? 'unscored' : `${t}/60`, 'family: ' + (SC.familyOf(c.id, ws)?.id || '—'), 'ontology: ' + (sx ? (sx.g.representative ? sx.g.cluster_id : 'own') : 'none')];
  if (extra) for (const [k, v] of [['source', c.source], ['weakness', c.vuln], ['assets', c.assets], ['consequence', c.consequence]]) if (flat(v)) f.push(`${k}: ${clip(v, 80)}`);
  return '  ' + f.join(' | ');
}
const nextKey = (p, n) => p + pad2(n);
/** The N keys kept so far (A: new families; B: new families named by matches) → the highest number. */
export const maxN = run => Math.max(0, ...(run?.fams || []).map(f => +f.key.slice(1)), ...[...(run?.newFam?.keys() || [])].map(k => +k.slice(1)));

AI.TASKS[KEY] = {
  label: 'Screening family proposals',
  build(ws, o = {}) {
    const request = o.request || 'A', run = o.run || null, cands = SC.candidates(ws);
    if (!cands.length) throw new Error('No candidate to group.');
    const scope = (o.ids || cands.map(c => c.id)).slice().sort(cmp), inScope = new Set(scope);
    const seed = o.seed !== undefined ? o.seed : run?.seed || null, ix = seedIndex(seed), batch = o.batch || { index: 1, of: 1 };
    const next = run ? maxN(run) + 1 : 1;
    const sorted = cands.slice().sort((a, b) => cmp(a.id, b.id));
    const sysBytes = new Blob([SYSTEM]).size;
    let lvl = 0, body = '';
    for (; lvl <= 4; lvl++) {
      body = assemble(lvl);
      if (new Blob([body]).size + sysBytes <= BUDGET) break;
    }
    function assemble(lvl) {
      const L = [], inB = sorted.filter(c => inScope.has(c.id)), others = sorted.filter(c => !inScope.has(c.id));
      const again = o.again ? `; asking again for ${scope.length} candidate(s) the earlier answer did not place` : '';
      if (request === 'A' || request === 'B') {
        L.push(request === 'A' ? `REQUEST: A — propose families for all candidates (batch ${batch.index} of ${batch.of}${again})`
          : o.single ? `REQUEST: B — match one candidate to a family (${scope[0]})` : `REQUEST: B — match candidates to families (all candidates, batch ${batch.index} of ${batch.of}${again})`, '');
        L.push(...commonLines(ws, lvl), ...seedLines(seed, o.seedWhy || run?.seedWhy, lvl));
        L.push('Existing families (accepted by the analyst — never remove or move their members; propose additions or suggestions only):', ...(famLines(ws).length ? famLines(ws) : ['  none yet']), '');
        const carried = run ? carriedList(run) : [];
        if (carried.length) L.push(`${request === 'A' ? 'Families' : 'New families'} proposed in earlier batches of this request (reuse these ids):`,
          ...carried.map(c => `  ${c.key} | ${clip(c.name, 120)} | members so far: ${c.members.slice().sort(cmp).join(' ')} | statement: ${clip(c.statement, 240)}`), '');
        L.push(request === 'A' ? `Candidates in this batch (${inB.length} of ${sorted.length}) — place every one:` : `Candidates to match (${inB.length} of ${sorted.length}):`, ...inB.map(c => candFull(ws, c, ix, lvl)), '');
        if (others.length) L.push('Other candidates (context only' + (request === 'A' ? ' — never place them' : '') + '):', ...others.map(c => candCompact(ws, c, ix)), '');
        if (request === 'A') L.push('Coverage categories (use these names exactly): ' + SC.CATEGORIES.join('; '), '');
        L.push(request === 'A' ? TEXT.rulesA : TEXT.rulesB, '', (request === 'A' ? TEXT.outA : TEXT.outB).replace('"index":1,"of":2', `"index":${batch.index},"of":${batch.of}`).replace('"index":1,"of":1', `"index":${batch.index},"of":${batch.of}`), `Next new family id: ${nextKey('N', next)}`);
      } else {
        const gaps = o.gaps || gapCategories(ws), m = new Map(SC.CATEGORIES.map(c => [c, []]));
        for (const f of SC.state(ws).families) for (const c of f.coverage || []) m.get(c)?.push(f.id);
        L.push('REQUEST: C — propose families or candidates for missing coverage categories', '', ...commonLines(ws, lvl));
        L.push('Coverage matrix (accepted families\' coverage ticks; a test for blind spots, not a quota):', ...SC.CATEGORIES.map(c => `  ${c}: ${m.get(c).join(' ') || 'none'}`), '');
        L.push('Gap categories to answer (one item each): ' + gaps.join('; '));
        const tg = seed?.theme_gaps || [];
        L.push('Ontology theme gaps (CRGO): ' + (tg.length ? tg.map(t => (typeof t === 'string' ? t : t.theme || t.label)).join('; ') + (seed ? ' — candidates: ' + sorted.filter(c => ix.byRef.get(c.id) && !ix.byRef.get(c.id).g.representative && ix.byRef.get(c.id).g.theme_gap).map(c => c.id).join(' ') : '') : 'none'), '');
        L.push('Families (accepted):', ...(famLines(ws, { stm: 240, why: false }).length ? famLines(ws, { stm: 240, why: false }) : ['  none yet']), '');
        L.push('Candidates (compact; a gap family is built from these first):', ...sorted.map(c => candCompact(ws, c, ix, sorted.length <= 120)), '');
        L.push(TEXT.rulesC, '', TEXT.outC, `Next new candidate key: ${nextKey('G', o.nextGap || 1)}   ·   Next new family id: ${nextKey('N', next)}`);
      }
      return L.join('\n');
    }
    const n = scope.length, g = (o.gaps || (request === 'C' ? gapCategories(ws) : [])).length;
    const max = request === 'A' ? Math.min(32000, 3000 + 450 * n) : request === 'B' ? Math.min(16000, 1500 + 160 * n) : Math.min(24000, 3000 + 1500 * g);
    return { system: SYSTEM, prompt: (lvl ? `(trimmed to fit: level ${Math.min(lvl, 4)})\n` : '') + body, max_tokens: max, json: true };
  },
};
function carriedList(run) {
  if (run.request === 'A') return run.fams.map(f => ({ key: f.key, name: f.name, statement: f.statement, members: f.members }));
  const by = new Map();
  for (const [ref, m] of run.bm || []) if (m.sug === 'new' && /^N\d\d$/.test(m.fid)) { const e = by.get(m.fid) || { key: m.fid, name: run.newFam.get(m.fid)?.name || '', statement: run.newFam.get(m.fid)?.statement || '', members: [] }; e.members.push(ref, ...m.with.filter(w => !e.members.includes(w))); by.set(m.fid, e); }
  return [...by.values()].map(e => ({ ...e, members: uniq(e.members) }));
}

