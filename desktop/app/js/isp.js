/* isp.js — Information security policy management (ISPMS), the model (Beta 1.6).

   Aligned with CRGO 0.10 `crgo-policy`:
   • A policy (directive) has versions. Each version has a lifecycle state: draft, under review,
     approved, published, retired or superseded (CRGO "directive lifecycle state").
   • Approval freezes a version: its canonical JSON (title, purpose, scope, clauses, statements) is
     hashed with SHA-256 and the hash is recorded with the approver, the date and the time. A frozen
     version is never edited: changing it starts a new draft version. Publication checks that the
     content still has the approved hash; publishing a new version supersedes the previous one.
   • Each policy statement belongs to one exact version, has a stable identifier, a normative
     modality (must, must not, should, may), an optional clause, the controls it is implemented by
     and the training it requires. A guideline is never binding: its modality is should or may.
   • Policy families group policies; reviews are scheduled (review date) or triggered (regulatory
     change, incident, finding, risk, organisational or technology change).
   • Applicability rules (organisational unit, role, system, supplier…) and assignments to people
     or groups with due dates; acknowledgements of an EXACT version (its hash), by person and date.
     An acknowledgement is never compliance. Training requirements are linked to policies and
     statements, with completion records.
   • Departures: non-compliance and violations here (ws.isp.issues); exceptions in the shared
     exception register (ws.shared.exceptions); corrective actions in the shared action register.
   • Independence: the approver of a version must not be its author or its submitter (by name).
   Templates are starting points written for this application — adapt them to the organization; they
   are not legal advice. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch } from './state.js';
import { today } from './util.js';
import * as SH from './shared.js';
import * as LOG from './logs.js';

export const TYPES = [['policy', 'Policy'], ['standard', 'Standard'], ['procedure', 'Procedure'], ['guideline', 'Guideline']];
export const STATUS = [['draft', 'Draft'], ['review', 'In review'], ['approved', 'Approved'], ['published', 'Published'], ['retired', 'Retired'], ['superseded', 'Superseded']];
export const STATUS_KIND = { draft: '', review: 'warn', approved: 'good', published: 'good', retired: '', superseded: '', withdrawn: '' };
/** Version states: the CRGO directive lifecycle states, plus "withdrawn" for an approval reopened before publication. */
export const VSTATE = [...STATUS, ['withdrawn', 'Approval withdrawn']];
/** CRGO terms of the lifecycle states (directive lifecycle state scheme). */
export const CRGO_STATE = { draft: 'draft (directive)', review: 'under review (directive)', approved: 'approved (directive)', published: 'published (directive)', retired: 'retired (directive)', superseded: 'superseded (directive)' };
/** Allowed transitions: from → [[to, action label]]. */
export const FLOW = {
  draft: [['review', 'Submit for review']],
  review: [['approved', 'Approve'], ['draft', 'Send back to draft']],
  approved: [['published', 'Publish'], ['draft', 'Reopen as draft']],
  published: [['draft', 'Start a new version'], ['retired', 'Retire']],
  retired: [['draft', 'Reinstate as a new version']],
  superseded: [],
};
export const MODALITY = [['must', 'Must'], ['mustnot', 'Must not'], ['should', 'Should'], ['may', 'May']];
export const BINDING = new Set(['must', 'mustnot']);
export const TRIGGERS = [['scheduled', 'Scheduled review'], ['regulatory', 'Regulatory change'], ['incident', 'Incident'], ['finding', 'Audit or assessment finding'],
  ['risk', 'Risk change'], ['organisational', 'Organisational change'], ['technology', 'Technology change']];
export const OUTCOMES = [['', 'Open'], ['nochange', 'Reviewed — no change'], ['revise', 'Revise: start a new version'], ['retire', 'Retire the policy']];
export const DIMENSIONS = [['unit', 'Organisational unit'], ['role', 'Role'], ['system', 'System'], ['supplier', 'Supplier'], ['location', 'Location or jurisdiction'], ['worker', 'Worker type']];
export const ACK_METHODS = [['portal', 'Read and accepted on line'], ['signed', 'Signed form'], ['email', 'Reply by e-mail'], ['session', 'Briefing session']];
export const TRAIN_RESULTS = [['completed', 'Completed'], ['passed', 'Passed'], ['failed', 'Failed']];
export const NC_TYPES = [['noncompliance', 'Non-compliance (a requirement is not met)'], ['violation', 'Violation (someone did not respect the policy)'], ['exception', 'Exception (an accepted departure)']];
export const NC_SOURCES = [['audit', 'Audit'], ['incident', 'Incident'], ['monitoring', 'Monitoring or logs'], ['self', 'Self-assessment'], ['report', 'Report by an employee'], ['supplier', 'Supplier review'], ['other', 'Other']];
export const NC_SEVERITY = [['low', 'Low'], ['medium', 'Medium'], ['high', 'High'], ['critical', 'Critical']];
export const NC_STATUS = [['open', 'Open'], ['progress', 'Correction in progress'], ['accepted', 'Accepted exception'], ['closed', 'Closed']];

/* ---------------- templates ---------------- */
const st = (text, refs = []) => ({ text, refs });
export const TEMPLATES = [
  { id: 'umbrella', title: 'Information security policy', type: 'policy', domain: 'Governance', review: 12,
    purpose: 'States management’s direction and support for information security, the principles every other policy follows and who is accountable.',
    scope: 'All information, systems and people of the organization, including suppliers acting on its behalf.',
    statements: [st('Management approves this policy, reviews it at least once a year and after any significant change, and makes it available to all personnel and relevant external parties.', ['ISO22:5.1', 'CSF2:GV.PO-01']),
      st('Information security roles and responsibilities are defined and assigned; a person is accountable for information security at the executive level.', ['ISO22:5.2', 'CSF2:GV.RR-02']),
      st('Information security risks are assessed at least annually, against a risk appetite approved by management, and treated according to an approved plan.', ['ISO22:5.7', 'CSF2:GV.RM-02', 'CSF2:ID.RA-05']),
      st('Topic-specific policies, standards and procedures implement this policy; exceptions follow the exception process and are time-limited.', ['ISO22:5.1', 'ISO22:5.36']),
      st('Non-compliance with information security policies is reported, recorded and corrected; deliberate violations may lead to disciplinary measures.', ['ISO22:6.4', 'ISO22:5.36'])] },
  { id: 'aup', title: 'Acceptable use of information and technology', type: 'policy', domain: 'People', review: 12,
    purpose: 'Sets what personnel may and may not do with the organization’s information, devices, networks and accounts.',
    scope: 'Every person with an account or a device provided by the organization.',
    statements: [st('Information and technology are used for the organization’s purposes; limited personal use is allowed when it does not create risk or cost.', ['ISO22:5.10']),
      st('Credentials are personal and never shared; suspected compromise is reported at once.', ['ISO22:5.17', 'CSF2:PR.AA-01']),
      st('Confidential information is not copied to personal devices, personal cloud services or public generative-AI tools.', ['ISO22:5.10', 'ISO22:5.14']),
      st('Software is installed only from approved sources; security controls are never disabled.', ['ISO22:8.19', 'ISO22:8.7']),
      st('Personnel acknowledge this policy on hiring and every year.', ['ISO22:6.2', 'ISO22:6.3'])] },
  { id: 'access', title: 'Access control and authentication', type: 'policy', domain: 'Identity and access', review: 12,
    purpose: 'Grants access on a need-to-know, least-privilege basis and protects accounts with strong authentication.',
    scope: 'All systems, applications and data, including cloud services and remote access.',
    statements: [st('Access is granted on business need, approved by the owner of the information, and removed when the need ends — on departure, the same day.', ['ISO22:5.15', 'ISO22:5.18', 'CSF2:PR.AA-05']),
      st('Multi-factor authentication is required for remote access, cloud services, e-mail and every privileged account.', ['ISO22:8.5', 'CSF2:PR.AA-03']),
      st('Privileged accounts are separate from everyday accounts, inventoried, and used only for administration.', ['ISO22:8.2', 'CSF2:PR.AA-05']),
      st('Access rights are reviewed by their owners at least twice a year for critical systems and once a year otherwise.', ['ISO22:5.18']),
      st('Shared, generic and service accounts have a named owner and are reviewed with the others.', ['ISO22:5.16'])] },
  { id: 'classification', title: 'Information classification and handling', type: 'standard', domain: 'Information', review: 24,
    purpose: 'Classifies information by sensitivity and states how each class is labelled, stored, transmitted, shared and destroyed.',
    scope: 'All information the organization creates, receives or keeps, in any form.',
    statements: [st('Information is classified Public, Internal, Confidential or Restricted by its owner; personal and health information is at least Confidential.', ['ISO22:5.12', 'CSF2:ID.AM-07']),
      st('Confidential and Restricted information is encrypted at rest on portable media and in transit outside the internal network.', ['ISO22:8.24', 'CSF2:PR.DS-01', 'CSF2:PR.DS-02']),
      st('Restricted information is shared only with named recipients, through approved channels.', ['ISO22:5.14']),
      st('Information is kept according to the retention schedule and then destroyed or anonymized securely.', ['ISO22:5.33', 'ISO22:8.10'])] },
  { id: 'privacy', title: 'Protection of personal information', type: 'policy', domain: 'Privacy', review: 12,
    purpose: 'Governs the collection, use, communication, retention and destruction of personal information, in line with Quebec Law 25 and the other privacy laws that apply.',
    scope: 'All personal information of clients, patients, employees and other individuals held by the organization.',
    statements: [st('A person in charge of the protection of personal information is designated and their title and contact details are published.', ['ISO22:5.34']),
      st('A privacy impact assessment is carried out for every project that involves personal information and before any communication outside Quebec.', ['ISO22:5.34', 'ISO22:5.8']),
      st('Confidentiality incidents are recorded in a register; incidents presenting a risk of serious injury are reported to the Commission d’accès à l’information and the persons concerned.', ['ISO22:5.24', 'ISO22:5.26']),
      st('Personal information is collected with valid consent and used only for the purposes stated at collection.', ['ISO22:5.34']),
      st('Requests for access, rectification and portability are answered within the legal time limit.', ['ISO22:5.34'])] },
  { id: 'incident', title: 'Incident response', type: 'policy', domain: 'Detection and response', review: 12,
    purpose: 'Ensures that security incidents are detected, reported, contained, eradicated and learned from.',
    scope: 'All information security events and incidents, including those at suppliers that affect the organization.',
    statements: [st('Anyone who suspects an incident reports it immediately through the published channel.', ['ISO22:6.8', 'CSF2:DE.AE-02']),
      st('An incident response plan names the team, the roles, the escalation path, the decision to notify and the external contacts; it is tested at least once a year.', ['ISO22:5.24', 'ISO22:5.26', 'CSF2:RS.MA-01']),
      st('Evidence is collected and preserved in a way that allows legal action.', ['ISO22:5.28']),
      st('Every significant incident ends with a lessons-learned review whose actions are tracked to completion.', ['ISO22:5.27', 'CSF2:ID.IM-03'])] },
  { id: 'vuln', title: 'Vulnerability and patch management', type: 'standard', domain: 'Protection', review: 12,
    purpose: 'Keeps systems free of known exploitable weaknesses within defined delays.',
    scope: 'Servers, workstations, network equipment, applications, cloud services and connected devices.',
    statements: [st('Systems are scanned for vulnerabilities at least monthly, and after major changes.', ['ISO22:8.8', 'CSF2:ID.RA-01']),
      st('Vulnerabilities listed in CISA’s Known Exploited Vulnerabilities catalogue are fixed within 14 days on exposed systems; other critical ones within 30 days.', ['ISO22:8.8', 'CSF2:PR.PS-02']),
      st('Systems that can no longer receive security updates are isolated and scheduled for replacement.', ['ISO22:8.8', 'ISO22:8.19']),
      st('A vulnerability that cannot be fixed in time is covered by a documented, time-limited exception with compensating controls.', ['ISO22:5.36'])] },
  { id: 'backup', title: 'Backup and recovery', type: 'standard', domain: 'Resilience', review: 12,
    purpose: 'Makes sure information and systems can be restored within the times the business requires, including after ransomware.',
    scope: 'All systems and data needed by critical processes.',
    statements: [st('Backups follow the 3-2-1 rule, with at least one copy offline or immutable.', ['ISO22:8.13', 'CSF2:PR.DS-11']),
      st('Recovery time and recovery point objectives are set per critical system by its owner.', ['ISO22:5.30']),
      st('Restoration is tested at least quarterly for critical systems and the results are recorded.', ['ISO22:8.13', 'CSF2:RC.RP-03']),
      st('Backup credentials and consoles are separated from the production directory.', ['ISO22:8.2'])] },
  { id: 'supplier', title: 'Supplier and third-party security', type: 'policy', domain: 'Third parties', review: 12,
    purpose: 'Manages the security risks that suppliers, service providers and partners bring.',
    scope: 'Every supplier that handles the organization’s information, connects to its systems or provides a critical service.',
    statements: [st('Suppliers are classified by criticality; critical suppliers are assessed before contract and at least once a year.', ['ISO22:5.19', 'CSF2:GV.SC-07']),
      st('Contracts state the security and privacy requirements, the right to audit, incident notification delays and what happens to information at the end of the contract.', ['ISO22:5.20', 'CSF2:GV.SC-05']),
      st('Supplier remote access uses individual accounts with multi-factor authentication and is logged.', ['ISO22:5.21', 'ISO22:8.5']),
      st('Software and services from the ICT supply chain are checked for authenticity and integrity before use.', ['ISO22:5.21', 'CSF2:ID.RA-09'])] },
  { id: 'remote', title: 'Remote work and mobile devices', type: 'policy', domain: 'Endpoints', review: 12,
    purpose: 'Protects information handled away from the organization’s premises and on mobile devices.',
    scope: 'Teleworkers, travelling personnel, and all laptops, phones and tablets used for work.',
    statements: [st('Work devices are managed, encrypted, protected by endpoint detection and locked automatically.', ['ISO22:8.1', 'ISO22:8.7', 'CSF2:PR.PS-01']),
      st('Remote access goes through the approved, multi-factor protected service only.', ['ISO22:6.7', 'ISO22:8.5']),
      st('Lost or stolen devices are reported within the hour and wiped remotely.', ['ISO22:8.1', 'ISO22:6.8']),
      st('Confidential conversations and screens are protected from being overheard or seen in public places.', ['ISO22:6.7', 'ISO22:7.7'])] },
  { id: 'logging', title: 'Logging and monitoring', type: 'standard', domain: 'Detection and response', review: 12,
    purpose: 'Records security-relevant events and watches them so that attacks are detected in time.',
    scope: 'Critical systems, identity services, network perimeter, cloud services and security tools.',
    statements: [st('Security events of critical systems are collected centrally and kept for at least one year.', ['ISO22:8.15', 'CSF2:DE.CM-01']),
      st('Logs are protected against tampering and their clocks are synchronized.', ['ISO22:8.15', 'ISO22:8.17']),
      st('Alerts are reviewed every day by a named team or service, and critical alerts at once.', ['ISO22:8.16', 'CSF2:DE.AE-02'])] },
  { id: 'continuity', title: 'Business continuity and ICT readiness', type: 'policy', domain: 'Resilience', review: 12,
    purpose: 'Keeps critical services running, or restores them in time, during a disruption — cyber or otherwise.',
    scope: 'Critical business processes and the systems, suppliers and people they depend on.',
    statements: [st('A business impact analysis identifies critical processes, their maximum tolerable downtime and their dependencies.', ['ISO22:5.30', 'CSF2:ID.AM-05']),
      st('Continuity and recovery plans exist for each critical process and are exercised at least once a year, including a cyber scenario.', ['ISO22:5.29', 'ISO22:5.30', 'CSF2:RC.RP-01']),
      st('Manual or degraded procedures exist for processes that cannot stop.', ['ISO22:5.29'])] },
  { id: 'crypto', title: 'Cryptography and key management', type: 'standard', domain: 'Protection', review: 24,
    purpose: 'Uses cryptography correctly to protect confidentiality, integrity and authenticity.',
    scope: 'Encryption of data at rest and in transit, certificates, signing and keys.',
    statements: [st('Only approved algorithms and key lengths are used; deprecated protocols are disabled.', ['ISO22:8.24']),
      st('Keys and certificates are inventoried, protected, rotated and revoked when compromised.', ['ISO22:8.24']),
      st('Keys are never stored with the data they protect.', ['ISO22:8.24'])] },
  { id: 'sdlc', title: 'Secure development and change management', type: 'standard', domain: 'Applications', review: 12,
    purpose: 'Builds and changes software and systems securely.',
    scope: 'In-house and outsourced development, configuration changes to production systems.',
    statements: [st('Security requirements are defined at the start of every project.', ['ISO22:8.26', 'ISO22:8.25']),
      st('Code is reviewed and tested for security before release; secrets are never stored in source code.', ['ISO22:8.28', 'ISO22:8.29']),
      st('Changes to production follow an approved change process with a rollback plan.', ['ISO22:8.32']),
      st('Development, test and production environments are separated; production personal data is not used in test without anonymization.', ['ISO22:8.31', 'ISO22:8.33'])] },
  { id: 'ai', title: 'Use of artificial intelligence', type: 'policy', domain: 'Emerging technology', review: 12,
    purpose: 'Allows the use of AI tools while protecting confidential and personal information and keeping people accountable for decisions.',
    scope: 'Generative AI and other AI services used by personnel or embedded in the organization’s systems.',
    statements: [st('Only AI services approved by the organization are used for work; their data-use terms have been reviewed.', ['ISO22:5.10', 'ISO22:5.23']),
      st('Confidential, personal or health information is not entered into an AI service unless that service is approved for it.', ['ISO22:5.34', 'ISO22:5.14']),
      st('AI output is reviewed by a person before it is relied on; decisions about individuals are not taken by AI alone.', ['ISO22:5.34']),
      st('AI systems built or bought by the organization go through a risk and privacy assessment before use.', ['ISO22:5.8'])] },
  { id: 'physical', title: 'Physical and environmental security', type: 'standard', domain: 'Physical', review: 24,
    purpose: 'Protects premises, equipment and media from unauthorized access, damage and interference.',
    scope: 'Offices, server rooms, clinics or sites, and equipment taken off-site.',
    statements: [st('Secure areas are defined and access to them is controlled and logged.', ['ISO22:7.1', 'ISO22:7.2']),
      st('Equipment and media are disposed of so that information cannot be recovered.', ['ISO22:7.14', 'ISO22:7.10']),
      st('Clear-desk and clear-screen rules apply wherever confidential information is handled.', ['ISO22:7.7'])] },
];
export const template = id => TEMPLATES.find(t => t.id === id) || null;

/* ---------------- SHA-256 (synchronous, FIPS 180-4) ----------------
   The interface freezes versions with crypto.subtle (hashOf); this synchronous twin gives the same
   digest where a transition must stay synchronous (scripts, migrations, the publication check). */
const K256 = new Uint32Array([0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d,
  0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2]);
export function sha256Sync(str) {
  const msg = new TextEncoder().encode(str);
  const len = msg.length, nb = ((len + 9 + 63) >> 6) << 6;
  const buf = new Uint8Array(nb); buf.set(msg); buf[len] = 0x80;
  const dv = new DataView(buf.buffer);
  dv.setUint32(nb - 8, Math.floor(len / 0x20000000)); dv.setUint32(nb - 4, (len << 3) >>> 0);
  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const W = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let o = 0; o < nb; o += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3), s1 = rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K256[i] + W[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] += a; H[1] += b; H[2] += c; H[3] += d; H[4] += e; H[5] += f; H[6] += g; H[7] += h;
  }
  return [...H].map(x => x.toString(16).padStart(8, '0')).join('');
}

/* ---------------- canonical content and hashes ---------------- */
const sortKeys = v => Array.isArray(v) ? v.map(sortKeys) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sortKeys(v[k])])) : v;
/** Canonical JSON: keys sorted at every level, no white space. */
export const canonical = v => JSON.stringify(sortKeys(v));
/** The content of a version — what approval freezes and the hash covers (not owners or review dates). */
export function snapshot(p) {
  return { policy: p.id, title: p.title || '', type: p.type || 'policy', family: p.family || '', version: p.version, purpose: p.purpose || '', scope: p.scope || '', body: p.body || '',
    clauses: (p.clauses || []).map(c => ({ id: c.id, heading: c.heading || '', text: c.text || '' })),
    statements: (p.statements || []).map(s => ({ id: s.id, text: s.text || '', modality: s.modality || 'must', guideline: !!s.guideline, clause: s.clause || '', refs: [...(s.refs || [])], training: [...(s.training || [])] })) };
}
export const hashSync = content => sha256Sync(canonical(content));
/** SHA-256 of a version's canonical JSON with the browser's crypto.subtle (hex). */
export async function hashOf(content) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(content)));
  return [...new Uint8Array(d)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ---------------- the store in the workspace ---------------- */
const nextId = (list, p) => { let n = 0; for (const x of list) { const m = new RegExp('^' + p + '-(\\d+)$').exec(x.id); if (m) n = Math.max(n, +m[1]); } return p + '-' + String(n + 1).padStart(3, '0'); };
export function addMonths(d, m) { const x = new Date(d || today()); x.setMonth(x.getMonth() + (Number(m) || 12)); return x.toISOString().slice(0, 10); }
const stamp = () => new Date().toISOString().slice(0, 19);
const same = (a, b) => !!a && !!b && String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

export function isp(ws = S.ws) {
  ws.isp ||= { policies: [], issues: [] };
  const I = ws.isp;
  for (const k of ['policies', 'issues', 'families', 'assignments', 'acks', 'training', 'reviewsDue', 'rules', 'completions']) I[k] ||= [];
  for (const p of I.policies) normPolicy(p);
  return I;
}
/** Fill the fields of this release in a policy (idempotent). A policy approved before versions were
   frozen gets a version record whose hash is computed now (marked "hash recorded at upgrade"). */
export function normPolicy(p) {
  p.statements ||= []; p.clauses ||= []; p.history ||= []; p.versions ||= [];
  for (const s of p.statements) { s.refs ||= []; s.training ||= []; s.modality ||= s.guideline ? 'should' : 'must'; if (s.guideline && BINDING.has(s.modality)) s.modality = 'should'; }
  if (!p.versions.length && (p.archive?.length || ['approved', 'published', 'retired'].includes(p.status))) {
    for (const a of p.archive || []) {
      const c = snapshot({ ...p, ...a, clauses: a.clauses || [], statements: (a.statements || []).map(s => ({ modality: 'must', ...s })) });
      p.versions.push({ version: a.version, state: 'superseded', hash: hashSync(c), content: c, approval: a.approval || null, effective: a.effective || '', published: a.effective || '', until: a.until || '', legacyHash: true });
    }
    if (['approved', 'published', 'retired'].includes(p.status)) {
      const c = snapshot(p), h = hashSync(c);
      p.versions.push({ version: p.version, state: p.status, hash: h, content: c, approval: p.approval || null, effective: p.effective || '', published: p.status !== 'approved' ? p.effective || '' : '', nextReview: p.nextReview || '', retired: p.retired || '', legacyHash: true });
      if (p.approval && !p.approval.hash) p.approval.hash = h;
    }
  }
  return p;
}
export const versionRec = (p, label) => (p.versions || []).filter(v => v.version === label).at(-1) || null;
/** The version in force: the published one (CRGO: the moving "current version" pointer — acknowledgements never use it, they keep the hash). */
export const inForce = p => (p.versions || []).filter(v => v.state === 'published').at(-1) || null;
export const frozen = (p, label) => (p.versions || []).filter(v => v.version === label && v.state !== 'withdrawn').at(-1) || null;

export function newPolicy(o = {}, ws = S.ws) {
  const I = isp(ws);
  const p = Object.assign({ id: nextId(I.policies, 'POL'), title: '', type: 'policy', domain: '', family: '', version: '0.1', status: 'draft', owner: '', approver: '', author: o._by || '', sponsor: '',
    purpose: '', scope: '', statements: [], clauses: [], body: '', scenarios: [], requirements: [], effective: '', nextReview: '', reviewMonths: 12,
    approval: null, history: [], versions: [], created: today(), origin: 'manual' }, o);
  p.statements = (p.statements || []).map((s, i) => normStatement({ ...s, id: s.id || `${p.id}.${i + 1}` }, p));
  p.history.push({ date: today(), at: stamp(), version: p.version, status: p.status, by: o._by || '', what: o._what || 'Created' });
  delete p._by; delete p._what;
  I.policies.push(p);
  touch('isp');
  return p;
}
export function fromTemplate(id, ws = S.ws, by = '') {
  const t = template(id); if (!t) throw new Error('Unknown template ' + id);
  return newPolicy({ title: t.title, type: t.type, domain: t.domain, purpose: t.purpose, scope: t.scope, reviewMonths: t.review,
    statements: t.statements.map(s => ({ text: s.text, refs: [...s.refs], modality: t.type === 'guideline' ? 'should' : 'must', guideline: t.type === 'guideline' })),
    origin: 'template:' + id, _by: by, _what: 'Created from the template “' + t.title + '”' }, ws);
}
export function normStatement(s, p) {
  const g = !!s.guideline || p?.type === 'guideline';
  let m = s.modality || (g ? 'should' : 'must'); if (g && BINDING.has(m)) m = 'should';
  return { id: s.id || '', text: s.text || '', refs: [...(s.refs || [])], modality: m, guideline: g, clause: s.clause || '', training: [...(s.training || [])] };
}
/** A new statement identifier: stable, never reused within the policy (statements keep their id across versions). */
export function nextStatementId(p) {
  const used = new Set([...(p.statements || []).map(s => s.id), ...(p.versions || []).flatMap(v => (v.content?.statements || []).map(s => s.id)), ...(p.archive || []).flatMap(a => (a.statements || []).map(s => s.id))]);
  let n = 0; for (const id of used) { const m = /\.(\d+)$/.exec(id || ''); if (m) n = Math.max(n, +m[1]); }
  return `${p.id}.${n + 1}`;
}
export function addStatement(p, o = {}) { const s = normStatement({ ...o, id: nextStatementId(p) }, p); p.statements.push(s); touch('isp'); return s; }
export function addClause(p, o = {}) {
  let n = 0; for (const c of p.clauses) { const m = /^C(\d+)$/.exec(c.id); if (m) n = Math.max(n, +m[1]); }
  const c = { id: 'C' + (n + 1), heading: o.heading || '', text: o.text || '' }; p.clauses.push(c); touch('isp'); return c;
}
/** Kept for the AI drafting path, where a fresh set replaces the statements of a never-approved draft. */
export const renumber = p => { if ((p.versions || []).length) { const keep = new Set(); p.statements.forEach(s => { if (!s.id || keep.has(s.id)) s.id = nextStatementId(p); keep.add(s.id); }); return; } p.statements.forEach((s, i) => { s.id = `${p.id}.${i + 1}`; }); };

/** Independence: why `by` may not approve this version (author or submitter), or null. */
export function independenceError(p, by) {
  if (!by) return null;
  if (same(by, p.author)) return 'The approver cannot be the author of this version: approval must be independent.';
  if (same(by, p.submittedBy)) return 'The approver cannot be the person who submitted this version for review: approval must be independent.';
  return null;
}

/** Move a policy through its life cycle. Synchronous; returns the history entry, or throws when not allowed.
   opts.hash: the SHA-256 computed with crypto.subtle by approve(); otherwise computed here. */
export function transition(p, to, { by = '', note = '', hash = '' } = {}) {
  normPolicy(p);
  const ok = (FLOW[p.status] || []).some(([t]) => t === to);
  if (!ok) throw new Error(`A ${p.status} policy cannot become ${to}.`);
  const from = p.status;
  if (to === 'review' && !p.statements.length) throw new Error('Add at least one policy statement first.');
  if (to === 'review') { p.submittedBy = by; p.submitted = today(); }
  if (from === 'review' && to === 'draft') p.submittedBy = '';
  if (from === 'approved' && to === 'draft') {
    const v = versionRec(p, p.version); if (v && v.state === 'approved') { v.state = 'withdrawn'; v.withdrawn = today(); v.withdrawnBy = by; v.withdrawnNote = note; }
    p.approval = null; p.submittedBy = '';
  }
  if ((from === 'published' || from === 'retired') && to === 'draft') {
    p.archive ||= [];
    p.archive.push({ version: p.version, effective: p.effective, until: today(), statements: structuredClone(p.statements), clauses: structuredClone(p.clauses || []), purpose: p.purpose, scope: p.scope, body: p.body, approval: p.approval, hash: versionRec(p, p.version)?.hash || '' });
    p.version = `${(parseInt(p.version, 10) || 0) + 1}.0`;
    p.approval = null; p.effective = ''; p.nextReview = ''; p.author = by; p.submittedBy = '';
  }
  if (to === 'approved') {
    const bad = independenceError(p, by); if (bad) throw new Error(bad);
    if (/^0\./.test(p.version)) p.version = '1.0';
    const content = snapshot(p), h = hash || hashSync(content);
    p.approval = { by, date: today(), at: stamp(), note, hash: h };
    p.versions.push({ version: p.version, state: 'approved', hash: h, content, author: p.author || '', submittedBy: p.submittedBy || '', approval: { ...p.approval }, approvals: [{ by, at: p.approval.at, decision: 'approved', note, hash: h }], effective: '', published: '' });
    LOG.data('policy version approved and frozen', `${p.id} v${p.version}`, 'SHA-256 ' + h, S.ws?.name || '');
  }
  if (to === 'published') {
    if (!p.approval) throw new Error('A policy must be approved before it is published.');
    const v = versionRec(p, p.version);
    const h = hashSync(snapshot(p));
    if (!v || v.state !== 'approved' || !p.approval.hash) throw new Error('A policy must be approved before it is published.');
    if (h !== p.approval.hash || h !== v.hash) throw new Error('The content changed after approval: the approved version is frozen. Start a new draft and have it approved again.');
    for (const o of p.versions) if (o.state === 'published') { o.state = 'superseded'; o.until = today(); o.supersededBy = p.version; }
    p.effective = today(); p.nextReview = addMonths(p.effective, p.reviewMonths);
    Object.assign(v, { state: 'published', effective: p.effective, published: today(), publishedBy: by, nextReview: p.nextReview });
    p.currentPublished = p.version; p.currentHash = v.hash;
    LOG.data('policy version published', `${p.id} v${p.version}`, 'SHA-256 ' + v.hash, S.ws?.name || '');
  }
  if (to === 'retired') {
    p.retired = today();
    const v = inForce(p); if (v) { v.state = 'retired'; v.retired = today(); v.retiredBy = by; }
    p.currentPublished = ''; p.currentHash = '';
  }
  p.status = to;
  const e = { date: today(), at: stamp(), version: p.version, status: to, by, what: `${STATUS.find(s => s[0] === from)?.[1]} → ${STATUS.find(s => s[0] === to)?.[1]}${note ? ' — ' + note : ''}` };
  p.history.push(e);
  touch('isp');
  return e;
}
/** Approval with crypto.subtle: the version label is fixed first, then its canonical JSON is hashed and frozen. */
export async function approve(p, { by = '', note = '' } = {}) {
  if (p.status !== 'review') throw new Error(`A ${p.status} policy cannot become approved.`);
  const bad = independenceError(p, by); if (bad) throw new Error(bad);
  if (/^0\./.test(p.version)) p.version = '1.0';
  const h = await hashOf(snapshot(p));
  return transition(p, 'approved', { by, note, hash: h });
}
/** Record a rejection of the version under review (append-only), and send it back to draft. */
export function reject(p, { by = '', note = '' } = {}) {
  if (p.status !== 'review') throw new Error('Only a version under review can be rejected.');
  if (!String(note).trim()) throw new Error('Give the reason for the rejection.');
  (p.rejections ||= []).push({ version: p.version, by, at: stamp(), note, hash: hashSync(snapshot(p)) });
  return transition(p, 'draft', { by, note: 'changes requested: ' + note });
}
/** A policy replaced by another policy: its version in force becomes superseded. */
export function supersede(p, byPolicy, { by = '' } = {}) {
  if (!['published', 'retired'].includes(p.status)) throw new Error('Only a published or retired policy can be superseded.');
  if (!byPolicy || byPolicy === p.id) throw new Error('Name the policy that replaces it.');
  const v = inForce(p); if (v) { v.state = 'superseded'; v.until = today(); v.supersededBy = byPolicy; }
  const from = p.status; p.status = 'superseded'; p.supersededBy = byPolicy; p.currentPublished = ''; p.currentHash = '';
  const e = { date: today(), at: stamp(), version: p.version, status: 'superseded', by, what: `${STATUS.find(s => s[0] === from)?.[1]} → ${STATUS.find(s => s[0] === 'superseded')?.[1]} — ${byPolicy}` };
  p.history.push(e); touch('isp'); return e;
}
/** Only the working draft (or the version under review) can change; an approved version is frozen. */
export const editable = p => p.status === 'draft' || p.status === 'review';
/** Review date of the version in force (falls back to the policy for records older than versions). */
export const reviewDate = p => inForce(p)?.nextReview || (p.status === 'published' ? p.nextReview : '') || '';
export const overdue = p => { const d = reviewDate(p); return !!d && d < today() && !!(inForce(p) || p.status === 'published'); };
export const dueSoon = p => { const d = reviewDate(p); return !!d && !overdue(p) && d <= addMonths(today(), 1); };

/* ---------------- version comparison ---------------- */
/** Every version that can be compared: the frozen ones, then the working copy when it is a draft or under review. */
export function comparable(p) {
  const out = (p.versions || []).map((v, i) => ({ key: 'v' + i, label: `v${v.version} · ${VSTATE.find(s => s[0] === v.state)?.[1] || v.state}`, content: v.content, hash: v.hash }));
  if (editable(p)) out.push({ key: 'work', label: `v${p.version} · ${STATUS.find(s => s[0] === p.status)?.[1]} (working copy)`, content: snapshot(p), hash: '' });
  return out;
}
/** Word-level differences: [[op, text]] with op '=', '-' or '+'. */
export function wordDiff(a, b) {
  const A = String(a || '').split(/(\s+)/), B = String(b || '').split(/(\s+)/);
  const n = A.length, m = B.length;
  if (n * m > 400000) return [['-', a], ['+', b]];
  const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out = []; let i = 0, j = 0;
  const push = (op, t) => { if (out.length && out.at(-1)[0] === op) out.at(-1)[1] += t; else out.push([op, t]); };
  while (i < n && j < m) { if (A[i] === B[j]) { push('=', A[i]); i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) push('-', A[i++]); else push('+', B[j++]); }
  while (i < n) push('-', A[i++]); while (j < m) push('+', B[j++]);
  return out;
}
/** Differences between two version contents: fields, clauses and statements matched by their stable id. */
export function diff(a, b) {
  const fields = ['title', 'type', 'family', 'purpose', 'scope', 'body'].filter(k => (a[k] || '') !== (b[k] || '')).map(k => ({ key: k, a: a[k] || '', b: b[k] || '' }));
  const pair = (xa, xb, cmp) => {
    const ia = new Map(xa.map(x => [x.id, x])), ib = new Map(xb.map(x => [x.id, x]));
    const ids = [...new Set([...xa.map(x => x.id), ...xb.map(x => x.id)])];
    return ids.map(id => { const x = ia.get(id), y = ib.get(id); if (!x) return { id, kind: 'added', b: y }; if (!y) return { id, kind: 'removed', a: x };
      const ch = cmp(x, y); return { id, kind: ch.length ? 'changed' : 'same', a: x, b: y, changes: ch }; });
  };
  const clauses = pair(a.clauses || [], b.clauses || [], (x, y) => ['heading', 'text'].filter(k => (x[k] || '') !== (y[k] || '')));
  const statements = pair(a.statements || [], b.statements || [], (x, y) => ['text', 'modality', 'guideline', 'clause'].filter(k => (x[k] ?? '') !== (y[k] ?? ''))
    .concat(canonical([...(x.refs || [])].sort()) !== canonical([...(y.refs || [])].sort()) ? ['refs'] : [], canonical([...(x.training || [])].sort()) !== canonical([...(y.training || [])].sort()) ? ['training'] : []));
  const count = k => statements.filter(s => s.kind === k).length;
  return { fields, clauses, statements, summary: { added: count('added'), removed: count('removed'), changed: count('changed'), same: count('same') } };
}

/* ---------------- families and reviews ---------------- */
export function newFamily(o = {}, ws = S.ws) { const I = isp(ws); const f = { id: nextId(I.families, 'FAM'), name: '', description: '', owner: '', ...o }; I.families.push(f); touch('isp'); return f; }
export const familyName = (id, ws = S.ws) => isp(ws).families.find(f => f.id === id)?.name || '';
/** A directive review (CRGO): scheduled or triggered, assigned, due, with an outcome. */
export function newReview(o = {}, ws = S.ws) {
  const I = isp(ws);
  const r = { id: nextId(I.reviewsDue, 'REV'), policy: '', version: '', trigger: 'scheduled', triggeredBy: '', assignee: '', due: '', outcome: '', completed: '', by: '', note: '', opened: today(), ...o };
  if (!r.version) r.version = I.policies.find(p => p.id === r.policy)?.version || '';
  I.reviewsDue.push(r); touch('isp'); return r;
}
/** Close a review. "nochange" moves the next review date; "revise" starts a new draft version; "retire" retires the policy. */
export function completeReview(r, outcome, { by = '', note = '' } = {}, ws = S.ws) {
  const p = isp(ws).policies.find(x => x.id === r.policy);
  if (!outcome) throw new Error('Choose the outcome of the review.');
  if (p && outcome === 'nochange') { const v = inForce(p); const d = addMonths(today(), p.reviewMonths); if (v) v.nextReview = d; if (p.status === 'published') p.nextReview = d; p.lastReviewed = today();
    p.history.push({ date: today(), at: stamp(), version: p.version, status: p.status, by, what: `Reviewed (${r.id}) — no change; next review ${d}${note ? ' — ' + note : ''}` }); }
  if (p && outcome === 'revise' && (p.status === 'published' || p.status === 'retired')) transition(p, 'draft', { by, note: `review ${r.id}` });
  if (p && outcome === 'retire' && p.status === 'published') transition(p, 'retired', { by, note: `review ${r.id}` });
  Object.assign(r, { outcome, completed: today(), by, note: note || r.note });
  touch('isp'); return r;
}
export const reviewOverdue = (r, asOf = today()) => !r.completed && r.due && r.due < asOf;

/* ---------------- applicability and assignments ---------------- */
export function newRule(o = {}, ws = S.ws) { const I = isp(ws); const r = { id: nextId(I.rules, 'APR'), policy: '', statement: '', dimension: 'unit', value: '', effect: 'include', from: '', until: '', note: '', ...o }; I.rules.push(r); touch('isp'); return r; }
const ruleLive = (r, asOf) => (!r.from || r.from <= asOf) && (!r.until || r.until >= asOf);
/** Does a policy apply to a subject {unit, role, system, supplier, location, worker}? Auditable: says which rules matched.
   No rule → applies to everyone. Include rules → at least one must match. Exclude rules win. */
export function evaluate(policyId, subject = {}, ws = S.ws, asOf = today()) {
  const rules = isp(ws).rules.filter(r => r.policy === policyId && !r.statement && ruleLive(r, asOf));
  const hit = r => { const v = subject[r.dimension]; const vals = Array.isArray(v) ? v : String(v || '').split(/\s*[;,]\s*/); return vals.some(x => same(x, r.value)); };
  const inc = rules.filter(r => r.effect !== 'exclude'), exc = rules.filter(r => r.effect === 'exclude');
  const matched = inc.filter(hit).map(r => r.id), excluded = exc.filter(hit).map(r => r.id);
  const applies = !excluded.length && (!inc.length || matched.length > 0);
  return { applies, matched, excluded, noRules: !rules.length, at: stamp(), rules: rules.map(r => r.id) };
}
export function newAssignment(o = {}, ws = S.ws) {
  const I = isp(ws);
  const a = { id: nextId(I.assignments, 'ASG'), policy: '', kind: 'person', subject: '', members: [], unit: '', role: '', system: '', supplier: '', due: '', assigned: today(), by: '', ...o };
  if (!a.policy || !String(a.subject).trim()) throw new Error('An assignment needs a policy and a person or group.');
  const dup = I.assignments.find(x => x.policy === a.policy && same(x.subject, a.subject) && x.kind === a.kind);
  if (dup) return dup;                                   // retries never duplicate an assignment
  a.basis = evaluate(a.policy, a, ws);
  I.assignments.push(a); touch('isp'); return a;
}
/** People assigned to a policy (persons, and the members of assigned groups). */
export function assignedPeople(policyId, ws = S.ws) {
  const out = new Map();
  for (const a of isp(ws).assignments.filter(x => x.policy === policyId)) {
    const names = a.kind === 'group' ? (a.members || []) : [a.subject];
    for (const n of names) { const k = String(n).trim().toLowerCase(); if (k && !out.has(k)) out.set(k, { name: String(n).trim(), due: a.due, assignment: a.id }); }
  }
  return [...out.values()];
}

/* ---------------- acknowledgements ---------------- */
/** Record that a person acknowledged an EXACT version (label and SHA-256). Never compliance.
   The version is the one in force unless a published (or formerly published) version is named.
   A second acknowledgement of the same hash by the same person returns the first one (no duplicate). */
export function acknowledge({ policy, person, date = today(), method = 'portal', version = '', by = '' } = {}, ws = S.ws) {
  const I = isp(ws), p = I.policies.find(x => x.id === policy);
  if (!p) throw new Error('Unknown policy.');
  if (!String(person || '').trim()) throw new Error('Name the person who acknowledged the policy.');
  const v = version ? (p.versions || []).filter(x => x.version === version && x.published).at(-1) : inForce(p);
  if (!v) throw new Error('Only a published version can be acknowledged.');
  const dup = I.acks.find(a => a.policy === policy && a.hash === v.hash && same(a.person, person));
  if (dup) return dup;
  const a = { id: nextId(I.acks, 'ACK'), policy, version: v.version, hash: v.hash, person: String(person).trim(), date, method, recordedBy: by, at: stamp() };
  I.acks.push(a); touch('isp'); return a;
}
/** Coverage of the version in force: assigned people who acknowledged its exact hash. */
export function coverage(policyId, ws = S.ws, asOf = today()) {
  const p = isp(ws).policies.find(x => x.id === policyId), v = p && inForce(p);
  const people = assignedPeople(policyId, ws);
  const acks = isp(ws).acks.filter(a => a.policy === policyId);
  const done = [], stale = [], missing = [], late = [];
  for (const x of people) {
    const mine = acks.filter(a => same(a.person, x.name));
    if (v && mine.some(a => a.hash === v.hash)) done.push(x.name);
    else { missing.push(x.name); if (mine.length) stale.push(x.name); if (x.due && x.due < asOf) late.push(x.name); }
  }
  return { version: v?.version || '', hash: v?.hash || '', assigned: people.length, acknowledged: done.length, missing, stale, late, pct: v && people.length ? done.length / people.length : null };
}

/* ---------------- training ---------------- */
export function newTraining(o = {}, ws = S.ws) { const I = isp(ws); const t = { id: nextId(I.training, 'TRN'), title: '', policies: [], statements: [], audience: '', everyMonths: 12, provider: '', ...o }; I.training.push(t); touch('isp'); return t; }
export function recordCompletion(o = {}, ws = S.ws) {
  const I = isp(ws);
  if (!o.training || !String(o.person || '').trim()) throw new Error('A completion needs a training requirement and a person.');
  const dup = I.completions.find(c => c.training === o.training && same(c.person, o.person) && c.date === (o.date || today()));
  if (dup) return dup;
  const c = { id: nextId(I.completions, 'TC'), training: '', person: '', date: today(), result: 'completed', evidence: '', recordedBy: '', ...o, person: String(o.person).trim() };
  I.completions.push(c); touch('isp'); return c;
}
/** Last completion of a training by a person and whether it is still valid. */
export function trainingStatus(trainingId, person, ws = S.ws, asOf = today()) {
  const t = isp(ws).training.find(x => x.id === trainingId);
  const last = isp(ws).completions.filter(c => c.training === trainingId && same(c.person, person) && c.result !== 'failed').sort((a, b) => (a.date < b.date ? 1 : -1))[0];
  if (!last) return { state: 'missing', last: null };
  const until = t?.everyMonths ? addMonths(last.date, t.everyMonths) : '';
  return { state: until && until < asOf ? 'expired' : 'current', last, until };
}

/* ---------------- departures ---------------- */
export function newIssue(o = {}, ws = S.ws) {
  const I = isp(ws);
  const x = Object.assign({ id: nextId(I.issues, 'NC'), type: 'noncompliance', policy: '', statement: '', version: '', title: '', description: '', source: 'self', detected: today(),
    severity: 'medium', owner: '', status: 'open', action: '', actions: [], due: '', expiry: '', acceptedBy: '', scenarios: [], risk: '', closed: '', history: [] }, o);
  if (x.policy && !x.version) x.version = inForce(I.policies.find(p => p.id === x.policy) || {})?.version || '';
  x.history.push({ date: today(), what: 'Recorded', by: o._by || '' }); delete x._by;
  I.issues.push(x); touch('isp');
  return x;
}
export const issueOverdue = x => x.status !== 'closed' && x.status !== 'accepted' && x.due && x.due < today();
/** Works for the shared exception register and for exceptions recorded here by earlier releases. */
export const exceptionExpired = (x, asOf = today()) => (!x.type || x.type === 'exception') && x.status === 'accepted' && !!x.expiry && x.expiry < asOf;
/** A departure accepted as an exception goes to the SHARED exception register (ws.shared.exceptions).
   It needs a justification and an expiry date; accepted, it needs an approver who is not the requester. */
export function recordException(o = {}, ws = S.ws) {
  const rows = SH.exceptions(ws);
  const p = isp(ws).policies.find(x => x.id === o.policy);
  const r = { id: nextId(rows, 'EXC'), type: 'exception', source: 'isp', title: '', policy: '', statement: '', version: p ? inForce(p)?.version || p.version : '', scope: '', description: '',
    legalObligation: '', compensatedBy: [], scenarios: [], approvedBy: '', requestedBy: '', status: 'requested', expiry: '', severity: 'medium', waivesLaw: false, opened: today(), ...o };
  r.concerns = [...(o.concerns || []), ...(r.policy ? [{ kind: 'policy', id: r.policy }] : []), ...(r.statement ? [{ kind: 'statement', id: r.statement }] : [])];
  if (!String(r.title).trim()) throw new Error('Describe the departure');
  if (!String(r.description).trim()) throw new Error('An exception needs a justification.');
  if (!r.expiry) throw new Error('An exception needs an expiry date.');
  if (r.approvedBy && same(r.approvedBy, r.requestedBy)) throw new Error('The person who approves an exception cannot be the one who requested it.');
  if (r.approvedBy && r.status === 'requested') r.status = 'accepted';
  const bad = SH.exceptionError(r); if (bad) throw new Error(bad);
  rows.push(r); touch('isp'); return r;
}
/** Exceptions of the shared register that concern a policy or one of its statements. */
export function policyExceptions(ws = S.ws, policyId = '') {
  return SH.exceptions(ws).filter(x => (x.policy || (x.concerns || []).some(l => l.kind === 'policy' || l.kind === 'statement')) && (!policyId || x.policy === policyId || (x.concerns || []).some(l => l.kind === 'policy' && l.id === policyId)));
}
/** Move an exception recorded in the policy module by an earlier release into the shared register. */
export function moveLegacyException(x, ws = S.ws) {
  const I = isp(ws);
  const rows = SH.exceptions(ws);
  const r = { id: nextId(rows, 'EXC'), type: 'exception', source: 'isp', title: x.title, policy: x.policy || '', statement: x.statement || '', scope: '', description: x.description || x.title,
    legalObligation: '', compensatedBy: [], scenarios: x.scenarios || [], approvedBy: x.acceptedBy || '', status: x.status === 'accepted' ? 'accepted' : x.status === 'closed' ? 'closed' : 'requested',
    expiry: x.expiry || '', severity: x.severity || 'medium', waivesLaw: false, opened: x.detected || today(), concerns: x.policy ? [{ kind: 'policy', id: x.policy }] : [], movedFrom: x.id };
  rows.push(r); I.issues.splice(I.issues.indexOf(x), 1); touch('isp'); return r;
}
/** A corrective action in the SHARED action register, raised from a non-compliance. */
export function correctiveAction(x, { title = '', owner = '', due = '' } = {}, ws = S.ws) {
  const rows = SH.actions(ws);
  const a = { id: nextId(rows, 'ACT'), title: title || `Correct ${x.id}: ${x.title}`, description: x.action || '', source: { kind: 'issue', id: x.id }, owner: owner || x.owner || '', due: due || x.due || '',
    state: 'open', verifiedBy: '', verified: '', rootCause: '', links: x.policy ? [{ kind: 'policy', id: x.policy }] : [], opened: today() };
  rows.push(a); (x.actions ||= []).push(a.id); x.history.push({ date: today(), what: 'Corrective action ' + a.id }); touch('isp'); return a;
}

/* ---------------- dashboard ---------------- */
/** Every figure of the overview, each with its denominator. */
export function dashboard(ws = S.ws, asOf = today()) {
  const I = isp(ws), P = I.policies;
  const byState = Object.fromEntries(STATUS.map(([k]) => [k, P.filter(p => p.status === k).length]));
  const versionsByState = Object.fromEntries(STATUS.map(([k]) => [k, P.reduce((n, p) => n + (p.versions || []).filter(v => v.state === k).length + (['draft', 'review'].includes(k) && p.status === k ? 1 : 0), 0)]));
  const live = P.filter(p => inForce(p));
  const covs = live.map(p => ({ p, c: coverage(p.id, ws, asOf) })).filter(x => x.c.assigned);
  const assigned = covs.reduce((s, x) => s + x.c.assigned, 0), acked = covs.reduce((s, x) => s + x.c.acknowledged, 0);
  const openRev = I.reviewsDue.filter(r => !r.completed);
  const exc = policyExceptions(ws).filter(x => x.status === 'accepted');
  const soon = addMonths(asOf, 1);
  const stmts = P.filter(p => p.status !== 'retired' && p.status !== 'superseded').flatMap(p => p.statements);
  return {
    policies: P.length, byState, versionsByState, inForce: live.length,
    reviewsOverdue: P.filter(overdue).length + openRev.filter(r => reviewOverdue(r, asOf)).length, reviewable: live.length + openRev.length,
    ack: { assigned, acknowledged: acked, pct: assigned ? acked / assigned : null, policies: covs.length },
    nc: { open: I.issues.filter(x => x.type !== 'exception' && ['open', 'progress'].includes(x.status)).length, total: I.issues.filter(x => x.type !== 'exception').length },
    exceptions: { accepted: exc.length, expiring: exc.filter(x => x.expiry && x.expiry >= asOf && x.expiry <= soon).length, expired: exc.filter(x => exceptionExpired(x, asOf)).length },
    noOwner: P.filter(p => !['retired', 'superseded'].includes(p.status) && !String(p.owner || '').trim()).length,
    unmapped: stmts.filter(s => !(s.refs || []).length).length, statements: stmts.length,
  };
}

/** Scenarios of the register that a policy addresses: those whose ontology controls or measures share a reference with its statements. */
export function scenariosFor(p, ws = S.ws) {
  const refs = new Set(p.statements.flatMap(s => s.refs || []));
  if (!refs.size) return [];
  return ws.assessment.SCEN.filter(s => (s.crgo?.controls || []).some(r => refs.has(r))
    || (ws.measures || []).some(m => (m.scen || []).includes(s.id) && (m.ctl || []).some(r => refs.has(r)))).map(s => s.id);
}

const MOD_LABEL = { must: 'MUST', mustnot: 'MUST NOT', should: 'SHOULD', may: 'MAY' };
/** Markdown of one policy (or one frozen version's content), for download or printing. */
export function toMarkdown(p, ws = S.ws, content = null) {
  const c = content || snapshot(p);
  const v = versionRec(p, c.version);
  const L = [`# ${c.title}`, '', `${ws.org?.name || ws.name} · ${TYPES.find(t => t[0] === c.type)?.[1] || c.type} ${p.id} · version ${c.version} · ${VSTATE.find(s => s[0] === (content ? v?.state : p.status))?.[1] || ''}`, '',
    `| Owner | Approver | Approved | Effective | Next review | SHA-256 |`, '|---|---|---|---|---|---|',
    `| ${p.owner || ''} | ${p.approver || ''} | ${v?.approval ? v.approval.by + ' ' + v.approval.date : p.approval ? p.approval.by + ' ' + p.approval.date : ''} | ${v?.effective || (content ? '' : p.effective) || ''} | ${v?.nextReview || (content ? '' : p.nextReview) || ''} | ${v?.hash ? '`' + v.hash + '`' : ''} |`, '',
    '## Purpose', '', c.purpose || '', '', '## Scope', '', c.scope || '', ''];
  const stmt = s => `**${s.id}** ${s.guideline ? '_(guideline, not binding)_ ' : ''}[${MOD_LABEL[s.modality] || 'MUST'}] ${s.text}${s.refs?.length ? `  \n_Controls: ${s.refs.join(', ')}_` : ''}`;
  if ((c.clauses || []).length) {
    for (const cl of c.clauses) { L.push(`## ${cl.id} ${cl.heading}`, ''); if (cl.text) L.push(cl.text, ''); for (const s of c.statements.filter(s => s.clause === cl.id)) L.push(stmt(s), ''); }
    const loose = c.statements.filter(s => !c.clauses.some(cl => cl.id === s.clause));
    if (loose.length) { L.push('## Other policy statements', ''); for (const s of loose) L.push(stmt(s), ''); }
  } else { L.push('## Policy statements', ''); for (const s of c.statements) L.push(stmt(s), ''); }
  if (c.body) L.push('## Details', '', c.body, '');
  L.push('## Compliance', '', 'Departures from this policy are recorded as non-compliance or, when accepted, as a time-limited exception. An acknowledgement of this policy is not evidence of compliance. Deliberate violations may lead to disciplinary measures.', '',
    '## Revision history', '', '| Date | Version | Status | By | Change |', '|---|---|---|---|---|', ...p.history.map(h => `| ${h.date} | ${h.version} | ${h.status} | ${h.by || ''} | ${String(h.what || '').replace(/\|/g, '/')} |`));
  return L.join('\n');
}
