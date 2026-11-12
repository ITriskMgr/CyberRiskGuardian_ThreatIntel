/* data/scenpatterns.js — the six CRGO 0.11.0 scenario patterns (1.9.0).

   CRGO 0.11.0 (crgo-context) adds the value set *scenario pattern* (CRGO_0001387): recurring shapes of risk
   scenario that identification should check for, narrower than a scenario theme. A risk scenario points to
   its pattern with *has scenario pattern* (CRGO_0001478). In the application a scenario (and a batch row)
   carries the pattern's CRGO identifier in `scenPattern`; the CRGO bridge writes it into the organisation
   graph as `has scenario pattern` when the CRGO in use defines that property.

   Every pattern is an approved CRGO 0.11.0 term (approved by the CRGO project owner on 2026-11-02, tag v0.11.0).
   The ATT&CK and CWE identifiers below are CRGO's pattern links (vocab/pattern-links, confidence H or M), limited to
   those in the bundled knowledge base; ATLAS techniques and newer CWE entries are cited in `refs` only.
   Labels and definitions: CRGO's (EN/FR in data/crgo-snapshot.json, v011.patterns).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export const CRGO_NS = 'https://w3id.org/crgo/';
/** CRGO 0.11.0 terms: the class of the patterns and the property that links a scenario to one. */
export const SCENARIO_PATTERN = 'CRGO_0001387';
export const HAS_SCENARIO_PATTERN = 'CRGO_0001478';
export const RELEASE = '0.11.2';   // 1.9.3: bundled release (1.9.2: 0.11.1); the six patterns are unchanged since 0.11.0
export const STATUS = 'approved';

/** The six patterns: CRGO identifier, CRGO key, English name (French in i18n), CRGO themes, textbook chapter,
 *  CRGO's ATT&CK and CWE pattern links, and references outside the bundled knowledge base. */
export const CRGO_PATTERNS = [
  { id: 'CRGO_0001389', key: 'PatQuantumHarvest', name: 'Harvest now, decrypt later (post-quantum)', themes: ['cryptography'], chapter: 'ch20',
    attack: ['T1040', 'T1557'], cwe: ['CWE-327', 'CWE-326'], refs: ['NIST IR 8547'] },
  { id: 'CRGO_0001390', key: 'PatCryptoAgility', name: 'Crypto-agility failure', themes: ['cryptography'], chapter: 'ch20',
    attack: ['T1600'], cwe: ['CWE-327', 'CWE-326'], refs: [] },
  { id: 'CRGO_0001391', key: 'PatCertificateExpiry', name: 'Certificate expiry outage', themes: ['cryptography', 'continuity'], chapter: 'ch20',
    attack: [], cwe: ['CWE-298', 'CWE-324'], refs: ['CA/Browser Forum Ballot SC-081v3'] },
  { id: 'CRGO_0001392', key: 'PatAgenticMisuse', name: 'Agentic AI misuse', themes: ['emerging technologies'], chapter: 'ch18',
    attack: ['T1078', 'T1059'], cwe: ['CWE-250', 'CWE-269'], refs: ['OWASP Top 10 for Agentic Applications 2026'] },
  { id: 'CRGO_0001393', key: 'PatPromptInjection', name: 'Prompt injection in agent workflows', themes: ['emerging technologies', 'applications'], chapter: 'ch18',
    attack: [], cwe: ['CWE-77'], refs: ['MITRE ATLAS AML.T0051', 'CWE-1427', 'OWASP LLM01:2025'] },
  { id: 'CRGO_0001394', key: 'PatAISupplyChain', name: 'AI supply chain compromise', themes: ['third party', 'emerging technologies'], chapter: 'ch18',
    attack: ['T1195.001', 'T1195'], cwe: ['CWE-494', 'CWE-1357'], refs: ['MITRE ATLAS AML.T0010', 'MITRE ATLAS AML.T0020', 'OWASP LLM03:2025'] },
];

/** The pattern with this CRGO identifier (or full IRI), or null. */
export const pattern = id => CRGO_PATTERNS.find(p => p.id === String(id || '').trim().replace(CRGO_NS, '').toUpperCase()) || null;
/** The full IRI of a pattern identifier. */
export const iri = id => CRGO_NS + String(id || '').replace(CRGO_NS, '');
/** A pattern identifier as given by an AI answer or an import, checked against the six: the identifier, or ''. */
export function valid(x) {
  const s = String(x || '').trim();
  if (!s) return '';
  const p = pattern(s) || CRGO_PATTERNS.find(q => q.key.toLowerCase() === s.toLowerCase() || q.name.toLowerCase() === s.toLowerCase());
  return p ? p.id : '';
}
/** The label of a pattern in the snapshot's language data when given, else the English name. */
export function label(id, lang = 'en', snap = null) {
  const p = pattern(id);
  if (!p) return '';
  const s = snap?.v011?.patterns?.find(q => q.id === p.id);
  return (lang === 'fr' && s?.label?.fr) || p.name;
}
/** The lines an AI prompt gives so that a proposal can carry a pattern. */
export const promptLines = () => [
  'If a proposal is an instance of one of these CRGO 0.11 scenario patterns, put its identifier in "pattern";',
  'otherwise leave "pattern" empty. Never force a pattern onto a scenario that does not fit it.',
  ...CRGO_PATTERNS.map(p => `- ${p.id}: ${p.name}`),
];
