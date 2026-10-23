/* equiv.js — CVSS v4.0 by equivalency for non-technical weaknesses (book ch06, "Non-technical
   vulnerabilities by equivalency").

   A process, people, governance, physical, third-party or configuration weakness has no CVE, yet the
   CyberRiskGuardian formula needs a CVSS score. The weakness is mapped onto the Base metrics by analogy:
   each metric asks a question that can be asked of any weakness. Three things are then required, and this
   module checks them: a one-line justification for every metric, the label "limited applicability" next
   to the score (stored with the scenario and shown in every export), and the marker "Analytical
   estimate — validation required". The score itself is computed by cvss4.js like any other vector.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';

/** The kinds of non-technical weakness the book names. */
export const WEAKNESS_TYPES = [
  ['process', 'Process weakness'],
  ['people', 'People weakness'],
  ['governance', 'Governance weakness'],
  ['physical', 'Physical weakness'],
  ['third-party', 'Third-party weakness'],
  ['configuration', 'Configuration or policy weakness'],
];
export const typeLabel = id => (WEAKNESS_TYPES.find(t => t[0] === id) || [null, id || ''])[1];

/** The question each Base metric asks of any weakness (ch06 equivalency table). */
export const QUESTIONS = {
  AV: 'Who can reach the weakness, and from where?',
  AC: 'Must a safeguard be defeated or a target secret obtained?',
  AT: 'Does success depend on conditions outside the attacker’s control?',
  PR: 'What role, access, or insider status is needed first?',
  UI: 'Must a victim act, and deliberately?',
  VC: 'What happens to the confidentiality of the process or system with the weakness?',
  VI: 'What happens to the integrity of the process or system with the weakness?',
  VA: 'What happens to the availability of the process or system with the weakness?',
  SC: 'What happens downstream to confidentiality?',
  SI: 'What happens downstream to integrity?',
  SA: 'What happens downstream to availability?',
};
export const METRICS = Object.keys(QUESTIONS);

export const LIMITED = 'limited applicability';
export const MARK = 'Analytical estimate — validation required';

export const isEquiv = s => s?.cvss_mode === 'equivalency';

/** Make sure a scenario scored by equivalency carries its record. */
export function ensure(s) {
  s.cvss_equiv ||= { type: '', just: {} };
  s.cvss_equiv.just ||= {};
  s.cvss_limited = true;
  return s.cvss_equiv;
}
/** Switch a scenario between technical scoring and equivalency; the justifications are kept either way. */
export function setMode(s, mode) {
  if (mode === 'equivalency') { s.cvss_mode = 'equivalency'; ensure(s); }
  else { s.cvss_mode = 'technical'; s.cvss_limited = !!s.cvss_limited_manual; }
}

/** What is still missing for the equivalency to meet the book's three requirements. */
export function gaps(s) {
  if (!isEquiv(s)) return [];
  const e = s.cvss_equiv || {}, out = [];
  if (!e.type) out.push('weakness type');
  for (const m of METRICS) if (!String(e.just?.[m] || '').trim()) out.push(m);
  return out;
}
export const complete = s => isEquiv(s) && gaps(s).length === 0;

/** The text an export shows beside the score. */
export function exportLabel(s) {
  if (isEquiv(s)) return `CVSS-B by equivalency (${typeLabel(s.cvss_equiv?.type) || 'type not stated'}) — ${LIMITED}. ${MARK}.`;
  if (s?.cvss_limited) return `CVSS-B — ${LIMITED}.`;
  return 'CVSS-B';
}
/** One line per metric: "AV:N — anyone who can send e-mail". */
export function justificationText(s, vectorMetrics = {}) {
  if (!isEquiv(s)) return '';
  return METRICS.map(m => `${m}:${vectorMetrics[m] || '?'} — ${String(s.cvss_equiv?.just?.[m] || '').trim() || '(no justification)'}`).join('\n');
}
/** The metric values of a vector string. */
export function metricsOf(vector) {
  const out = {};
  for (const part of String(vector || '').split('/').slice(1)) { const [k, x] = part.split(':'); if (k) out[k] = x; }
  return out;
}
