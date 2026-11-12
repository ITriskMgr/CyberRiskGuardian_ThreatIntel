/* migrate193.js — data version 7 (Desktop 1.9.3): the step 6 → 7, "From candidates to scenarios".

   Every field is optional and nested in records the workspace already holds, so KNOWN_FIELDS and the reset groups are unchanged
   (ws.screening and the scenarios belong to the ASSESSMENT group). The step creates them EMPTY, for every workstream of 1.9.3:
     screening.cands[id]   unique {by, at, ai?} (W1; ai = W3 aiMark) · why[6] (a unique candidate's six answers, W1) · aiGap (W3) ·
                           unique {by, at} (W1) · ontologyMatch {crgoId, cluster, score, source} (W2) · proposals[] marks (W3) ·
                           ontologyFindings[] {code, detail, state, by, at} (W2)
     screening.families[]  whyDraft (W3: drafted "why this scenario?" answers, not accepted) · whyMark (W3: who accepted, when) ·
                           aiMark · memberMarks{} · coverageMarks{} (W3: aiMark = {by, at, model, entryId, request, key})
     screening.themeGap[]  (W2: themes with no library scenario)
     scenario              origin (object, W1: where a scenario created from the screening came from) · ontologyFindings[] (W2) ·
                           ontoProposal {state, makePublic, approvedBy, approvedAt, exportedAt, file} (W2)
   A scenario created before this version gets `origin` reconstructed ONLY when a family lists it (journalled); the earlier
   origin text is kept in origin.text. Never invented for any other scenario. No number is touched.
   Imports nothing (migrate.js imports this file while it is itself being evaluated). © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

function candidateFields(w, note) {
  const S = (w.screening ||= { cands: {}, families: [], watch: [], plan: [], updated: null });
  let n = 0;
  for (const r of Object.values(S.cands ||= {})) {
    if (!r || typeof r !== 'object') continue;
    if (r.unique === undefined) { r.unique = null; n++; }
    if (r.aiGap === undefined) r.aiGap = null;
    if (!Array.isArray(r.why)) r.why = [];
    if (r.ontologyMatch === undefined) r.ontologyMatch = null;
    if (!Array.isArray(r.proposals)) r.proposals = [];
    if (!Array.isArray(r.ontologyFindings)) r.ontologyFindings = [];
  }
  for (const f of S.families ||= []) { if (f.whyDraft === undefined) f.whyDraft = null; if (f.whyMark === undefined) f.whyMark = null; if (f.aiMark === undefined) f.aiMark = null;
    if (!f.memberMarks || typeof f.memberMarks !== 'object') f.memberMarks = {}; if (!f.coverageMarks || typeof f.coverageMarks !== 'object') f.coverageMarks = {}; }
  if (!Array.isArray(S.themeGap)) S.themeGap = [];
  note(`candidate and family records given the empty 1.9.3 fields (unique, ontologyMatch, proposals, ontologyFindings, whyDraft, whyMark; themeGap): ${n} candidate record(s)`);
}
function scenarioFields(w, note) {
  const S = w.screening || {}, C = S.cands || {}, done = [];
  for (const s of w.assessment?.SCEN || []) {
    if (!s || typeof s !== 'object') continue;
    if (!Array.isArray(s.ontologyFindings)) s.ontologyFindings = [];
    if (s.ontoProposal === undefined) s.ontoProposal = null;
    if (s.origin && typeof s.origin === 'object') continue;           // already an origin record
    const f = (S.families || []).find(x => (x.scenarios || []).includes(s.id));
    if (!f) continue;                                                 // no family link: never invented
    const ids = (f.members || []).slice();
    s.origin = { candidateIds: ids, familyId: f.id,
      scores: Object.fromEntries(ids.filter(i => C[i]).map(i => [i, { scores: (C[i].scores || []).slice(), total: Array.isArray(C[i].scores) && C[i].scores.length === 12 && C[i].scores.every(Number.isInteger) ? C[i].scores.reduce((a, b) => a + b, 0) : null, ai: C[i].ai ? { by: C[i].ai.by || '', date: C[i].ai.date || '', model: C[i].ai.model || '' } : null }])),
      why: Array.isArray(f.why) ? f.why.slice() : [], ontologyMatch: null, createdBy: '', createdAt: '', reconstructed: true, text: typeof s.origin === 'string' ? s.origin : '' };
    done.push(s.id);
  }
  note(done.length ? `${done.length} scenario(s) given an origin rebuilt from the family that lists them (${done.join(', ')}); the earlier origin text is kept inside it` : 'no scenario is listed by a family: no origin rebuilt (none is invented)');
}

export default [
  { group: 'ASSESSMENT', title: 'Candidates, families and scenarios: the empty fields of From candidates to scenarios', up: candidateFields },
  { group: 'ASSESSMENT', title: 'Scenarios: ontology findings, ontology proposal; origin rebuilt only where a family link exists', up: scenarioFields },
];
