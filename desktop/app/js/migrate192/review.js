/* migrate192/review.js — data version 6 (Desktop 1.9.2): the sub-steps added by the fixes of the independent review
   (review-1.9.2.md). Same entry format and same import rule as ws1 … ws5 (see migrate192/ws1.js): leaf modules only,
   never migrate.js, migrate192.js, state.js or reset.js. Runs after ws1 … ws5 (ws2 has retyped numeric text first).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/* ---------- H2: a score-only scenario keeps computing on its stored score ----------
   Until 1.9.1 a scenario created from a row that carried a score and no vector (a CVE-register row with a v3 score, a
   CRGO prior, a Risk Registry row, a CSV with a numeric CVSS column) kept the builder's placeholder vector beside the
   stored score, and the stored score won. From 1.9.2 the vector wins (X-1), so the placeholder (9.3) would silently
   replace the row's real score. A migration never changes a real organization's numbers: the placeholder vector is
   cleared, the scenario computes on its stored score (engine source "stored score (no vector)"), it is flagged for the
   analyst's confirmation on Process step 10 (vector_source 'score') and the cleared vector is kept in the scenario's
   revisions. Idempotent: a scenario without a placeholder vector, without a stored score, or already confirmed is left
   alone. The placeholder list mirrors state.DEFAULT_VECTOR and panels/batch.js VEC (t75 checks they agree). */
export const PLACEHOLDER_VECTORS = [
  'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:H/SC:N/SI:N/SA:N',   // state.DEFAULT_VECTOR (blank scenario)
  'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:N/VI:H/VA:H/SC:N/SI:N/SA:H',   // batch VEC.impact
  'CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:N/SI:N/SA:N',   // batch VEC.access
  'CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N',   // batch VEC.data
];
const hasScore = v => v !== undefined && v !== null && v !== '' && Number.isFinite(Number(v));
/** The scenarios whose placeholder vector hides a stored score (nothing changed). */
export function scoreOnlyScenarios(w) {
  return (w.assessment?.SCEN || []).filter(s => s && typeof s === 'object' && s.vector_source !== 'confirmed' && s.cvss_mode !== 'equivalency'
    && typeof s.cvss === 'string' && PLACEHOLDER_VECTORS.includes(s.cvss.trim()) && hasScore(s.cvss_score));
}
function scoreOnly(w, note) {
  const hit = scoreOnlyScenarios(w);
  if (!hit.length) { note('CVSS: no scenario computes on a stored score hidden by a placeholder vector (nothing changed)'); return; }
  const day = new Date().toISOString().slice(0, 10);
  for (const s of hit) {
    const vec = s.cvss;
    s.cvss = ''; s.vector_source = 'score'; s.vector_ref = '';
    (s.revisions ||= []).push({ date: day, cvss: vec, what: `Placeholder vector ${vec} cleared by the 1.9.2 upgrade: the scenario was created from a row that carried the score ${s.cvss_score} and no vector, and it keeps computing on that score (as before). Confirm the score or enter the v4.0 Base vector of the actual weakness (Process step 10).` });
  }
  note(`${hit.length} scenario(s) created from a score-only row (${hit.map(s => s.id).join(', ')}) keep computing on their stored score: the placeholder vector was cleared, the old vector kept in the revisions, the score listed on Process step 10 for confirmation (no figure changed)`);
}

export default [
  { group: 'ASSESSMENT', title: 'Scenarios created from a score-only row keep computing on their stored score (placeholder vector cleared, flagged for confirmation)', up: scoreOnly },
  // H3 — intelligence-derived proposals without exposure evidence are recorded here, never applied to an estimate
  { field: 'threatWatch', blank: () => [], group: 'ASSESSMENT', title: 'Threat context: watch list of intelligence without exposure evidence' },
];
