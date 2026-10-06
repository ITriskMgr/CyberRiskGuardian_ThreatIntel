/* ontology.js — MITRE ATT&CK Enterprise, CAPEC links and CWE, from the bundled kb.js (offline).
   © 2026 Marc-André Léger. CC BY-NC 4.0. ATT&CK, CAPEC and CWE © The MITRE Corporation — see NOTICE.md. */
'use strict';
import { GENERATOR } from './version.js';

export const KB = self.CRG_KB || { meta: {}, tactics: [], tech: {}, mit: {}, cwe: {}, top25: [] };
export const TACTICS = KB.tactics.map(([id, short, name]) => ({ id, short, name }));
export const tacticName = short => TACTICS.find(t => t.short === short)?.name || short;

export function tech(id) {
  const t = KB.tech[id]; if (!t) return null;
  const parent = id.includes('.') ? id.split('.')[0] : null;
  return { id, name: t.n, fullName: parent && KB.tech[parent] ? KB.tech[parent].n + ': ' + t.n : t.n, tactics: t.t, desc: t.d,
    platforms: t.p, groups: t.g, mitigations: t.m || [], cwe: t.w || (parent ? KB.tech[parent]?.w : null) || [], capec: t.c || [],
    parent, url: 'https://attack.mitre.org/techniques/' + id.replace('.', '/') + '/' };
}
export const techName = id => tech(id)?.fullName || id;
export const subtechniques = id => Object.keys(KB.tech).filter(k => k.startsWith(id + '.')).sort();
export const parents = () => Object.keys(KB.tech).filter(k => !k.includes('.')).sort();
export function techniquesByTactic(short) {
  return parents().filter(k => KB.tech[k].t.includes(short));
}
export function mitigation(id) { const m = KB.mit[id]; return m ? { id, name: m.n, desc: m.d, url: 'https://attack.mitre.org/mitigations/' + id + '/' } : null; }
export function cwe(id) {
  const c = KB.cwe[id]; if (!c) return null;
  return { id, name: c.n, abstraction: c.a, desc: c.d, top25: KB.top25.indexOf(id) + 1 || null,
    url: 'https://cwe.mitre.org/data/definitions/' + id.split('-')[1] + '.html' };
}
let cweIdx = null;
/** ATT&CK techniques linked to a CWE through CAPEC attack patterns. */
export function techniquesForCwe(id) {
  if (!cweIdx) {
    cweIdx = {};
    for (const [k, t] of Object.entries(KB.tech)) for (const w of (t.w || [])) (cweIdx[w] ||= []).push(k);
  }
  return (cweIdx[id] || []).sort();
}
export function searchTech(q, limit = 40) {
  q = q.trim().toLowerCase(); if (!q) return [];
  const out = [];
  for (const [k, t] of Object.entries(KB.tech)) {
    const hay = (k + ' ' + t.n + ' ' + (k.includes('.') ? KB.tech[k.split('.')[0]]?.n || '' : '')).toLowerCase();
    let score = hay.includes(q) ? (k.toLowerCase() === q ? 100 : k.toLowerCase().startsWith(q) ? 50 : 10) : 0;
    if (!score && t.d.toLowerCase().includes(q)) score = 1;
    if (score) out.push([score + (k.includes('.') ? 0 : 2) + Math.min(t.g, 30) / 30, k]);
  }
  return out.sort((a, b) => b[0] - a[0]).slice(0, limit).map(x => x[1]);
}
export function searchCwe(q, limit = 40) {
  q = q.trim().toLowerCase(); if (!q) return KB.top25.slice(0, limit);
  const out = [];
  for (const [k, c] of Object.entries(KB.cwe)) {
    const kl = k.toLowerCase();
    let sc = kl === q || kl === 'cwe-' + q ? 100 : (kl + ' ' + c.n.toLowerCase()).includes(q) ? 10 : c.d.toLowerCase().includes(q) ? 1 : 0;
    if (sc) out.push([sc + (KB.top25.includes(k) ? 5 : 0), k]);
  }
  return out.sort((a, b) => b[0] - a[0]).slice(0, limit).map(x => x[1]);
}

/** Threat-source catalogue used by the batch builder (CyberRiskGuardian scenario-development guide). */
export const THREAT_SOURCES = [
  { id: 'cybercrime', label: 'Cybercriminal / initial-access broker', motive: 'financial gain' },
  { id: 'ransomware', label: 'Ransomware affiliate', motive: 'extortion' },
  { id: 'nation', label: 'State-sponsored actor', motive: 'espionage or disruption' },
  { id: 'hacktivist', label: 'Hacktivist', motive: 'ideological disruption or exposure' },
  { id: 'insider-mal', label: 'Malicious insider', motive: 'personal gain or grievance' },
  { id: 'insider-err', label: 'Negligent or careless insider', motive: 'error' },
  { id: 'supplier', label: 'Compromised third-party supplier', motive: 'supply-chain intrusion' },
  { id: 'opportunistic', label: 'Opportunistic automated attacker', motive: 'mass exploitation' },
  { id: 'environment', label: 'Non-adversarial event (outage, failure, disaster)', motive: 'n/a' },
];

/** Consequence vocabulary aligned with the methodology's impact categories. */
export const CONSEQUENCES = [
  'unauthorized disclosure of sensitive or personal information',
  'disruption of critical services and operations',
  'loss or corruption of critical data',
  'fraudulent financial transactions',
  'regulatory sanctions and mandatory breach notification',
  'harm to the safety or wellbeing of individuals',
  'loss of trust and reputational damage',
];

/** CRG measure catalogue mapped to ATT&CK mitigations, for the recommendations engine. */
export const MEASURES = [
  { key: 'mfa', name: 'Phishing-resistant MFA and conditional access', fn: 'Prevention', mits: ['M1032', 'M1036'] },
  { key: 'pam', name: 'Privileged access management (PAM) and least privilege', fn: 'Prevention', mits: ['M1026', 'M1018'] },
  { key: 'iam', name: 'Identity governance — joiner/mover/leaver, access reviews', fn: 'Governance', mits: ['M1018', 'M1027'] },
  { key: 'seg', name: 'Network segmentation and Zero Trust access', fn: 'Prevention', mits: ['M1030', 'M1035', 'M1037'] },
  { key: 'edr', name: 'EDR/XDR on all endpoints and servers', fn: 'Detection', mits: ['M1040', 'M1049', 'M1050'] },
  { key: 'siem', name: 'Centralized logging, SIEM and 24/7 monitoring (SOC/MDR)', fn: 'Detection', mits: ['M1047'] },
  { key: 'mail', name: 'E-mail security and web filtering', fn: 'Prevention', mits: ['M1054', 'M1021', 'M1031'] },
  { key: 'vuln', name: 'Vulnerability and patch management with SLAs', fn: 'Prevention', mits: ['M1051', 'M1016'] },
  { key: 'harden', name: 'Secure configuration baselines and attack-surface reduction', fn: 'Prevention', mits: ['M1042', 'M1028', 'M1038', 'M1048'] },
  { key: 'crypto', name: 'Encryption of data at rest and in transit, key management', fn: 'Prevention', mits: ['M1041'] },
  { key: 'dlp', name: 'Data loss prevention and data classification', fn: 'Detection', mits: ['M1057'] },
  { key: 'cloud', name: 'Cloud security posture management and tenant hardening', fn: 'Prevention', mits: ['M1022', 'M1018'] },
  { key: 'backup', name: 'Immutable, isolated backups with tested restoration', fn: 'Recovery', mits: ['M1053'] },
  { key: 'bcp', name: 'Business continuity and disaster recovery plans, exercised', fn: 'Resilience', mits: [] },
  { key: 'ir', name: 'Incident response plan, retainer and simulation exercises', fn: 'Response', mits: [] },
  { key: 'tprm', name: 'Third-party risk management and vendor access brokering', fn: 'Governance', mits: [] },
  { key: 'cti', name: 'Threat intelligence programme feeding the threat-context snapshot', fn: 'Governance', mits: ['M1019'] },
  { key: 'aware', name: 'Security awareness and phishing simulation', fn: 'Prevention', mits: ['M1017'] },
  { key: 'pentest', name: 'Penetration testing and secure development (AppSec)', fn: 'Prevention', mits: ['M1013', 'M1016'] },
  { key: 'insurance', name: 'Cyber insurance (risk transfer)', fn: 'Transfer', mits: [] },
];
export function measuresForTechniques(ids) {
  const mits = new Set(ids.flatMap(id => tech(id)?.mitigations || []));
  return MEASURES.filter(m => m.mits.some(x => mits.has(x)));
}

/** ATT&CK Navigator layer (format 4.5) — opens in the public or a self-hosted Navigator. */
export function navigatorLayer(name, scores, comments = {}) {
  const max = Math.max(1, ...Object.values(scores));
  return {
    name, versions: { attack: (KB.meta.attack?.version || '').replace(/[^0-9.]/g, '') || '19', navigator: '5.1.0', layer: '4.5' },
    domain: 'enterprise-attack', description: 'Exported from CyberRiskGuardian Desktop. Score = number of assessed scenarios using the technique.',
    sorting: 3, hideDisabled: false,
    techniques: Object.entries(scores).map(([techniqueID, score]) => ({ techniqueID, score, comment: comments[techniqueID] || '', enabled: true })),
    gradient: { colors: ['#ffffff', '#f6c28b', '#d2504a'], minValue: 0, maxValue: max },
    legendItems: [], metadata: [{ name: 'generator', value: GENERATOR }],
  };
}
