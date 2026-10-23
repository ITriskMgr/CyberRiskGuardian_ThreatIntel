/* modules.js — features that the administrator switches on or off for this installation.

   A feature switched off leaves the menu (with any section left empty), and its screens say how to
   switch it back on. Nothing it holds is deleted: the data stays in the workspace and comes back when
   the feature is switched on again. Per person, Settings → Users & RACI can further hide screens.
   The choice belongs to this installation (Settings → Modules), like the interface language.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as prefs from './prefs.js';

export const MODULES = [
  // Governance
  { id: 'isms', group: 'Governance', label: 'Information security management', panels: ['isms'], def: true,
    what: 'Scope, security objectives, management reviews and exceptions to internal policies — scoped, approved, compensated and expiring, never waiving a law.' },
  { id: 'isp', group: 'Governance', label: 'Information Security Policy (ISP) management', panels: ['isp'], def: true,
    what: 'Policy library and families, structured editor with clauses and requirements, versions frozen at approval, applicability and assignments, acknowledgements of an exact version, training and non-compliance.' },
  { id: 'writer', group: 'Governance', label: 'Security Policy Writer', panels: ['writer'], def: true,
    what: 'Writes the enterprise policy, topic policies, standards and procedures (English and French) from an interview, the organization’s documents and the ontology, as drafts for ISP management; Word export and re-import; OCR of scanned documents on this computer.' },
  { id: 'csm', group: 'Governance', label: 'Cybersecurity management', panels: ['csm'], def: true,
    what: 'Control testing by line of defence with conflicts shown, governing bodies, Three Lines roles, delegations of authority, decision records and the incident register.' },
  { id: 'shared', group: 'Governance', label: 'Shared registers', panels: ['shared'], def: true,
    what: 'Evidence, corrective actions, exceptions and qualified mappings kept once and used by every management module.' },
  { id: 'qc', group: 'Governance', label: 'Quality review', panels: ['qc'], def: true,
    what: 'The checks to run before a report or an ontology write-back leaves the analyst.' },
  // Compliance and audit
  { id: 'compliance', group: 'Compliance and audit', label: 'Compliance management', panels: ['compliance'], def: true,
    what: 'Sources and obligations, applicability, programmes and framework adoption, qualified mappings, campaigns, determinations backed by evidence, the regulatory calendar, submissions and regulatory change.' },
  { id: 'audit', group: 'Compliance and audit', label: 'Audit management', panels: ['audit'], def: true,
    what: 'Charter, audit universe, risk-weighted plan, engagements, procedures and workpapers, sampling, observations and findings, responses, reports and independent follow-up.' },
  // Security operations
  { id: 'siem', group: 'Security operations', label: 'SIEM', panels: ['siem'], def: true,
    what: 'Telemetry sources and their health, detection rules (Sigma import), coverage validated only by a detection test, gaps, alerts imported from files and triaged by crown jewels, indicators with TLP. Local only: no live connector.' },
  { id: 'soar', group: 'Security operations', label: 'SOAR', panels: ['soar'], def: true,
    what: 'Cases and incidents with a timeline, versioned playbooks, action risk classes, approval gates, dry-run simulation and manually recorded actions. Nothing is executed on a real system.' },
  // Other features
  { id: 'registry', group: 'Other features', label: 'Risk Registry', panels: ['registry', 'share'], def: true,
    what: 'The shared catalogue of risks: browse, contribute, moderate and publish through a common folder.' },
  { id: 'feeds', group: 'Other features', label: 'Threat feeds & social', panels: ['feeds'], def: true,
    what: 'Daily briefings from public threat feeds and social media, matched to your scenarios.' },
  { id: 'ontology', group: 'Other features', label: 'Ontology · CRGO', panels: ['ontology'], def: true,
    what: 'The CyberRiskGuardian Ontology: scenario identification, organisation context, compliance and security-operations contexts, write-back as proposals.' },
  { id: 'ai', group: 'Other features', label: 'AI assistant', panels: ['ai'], def: true,
    what: 'The in-app analyst, parameter critique and scenario generation — the payload is shown before anything is sent.' },
  { id: 'screening', group: 'Other features', label: 'Scenario screening', panels: ['screening'], def: true,
    what: 'Twelve screening criteria with rationale, escalation flags, families, four weighting schemes, the coverage matrix, the watch list and the final portfolio (Process steps 6 and 7).' },
  { id: 'forecast', group: 'Other features', label: 'Forecasts', panels: ['forecast'], def: true,
    what: 'Forecasts of KRIs and risk over the coming periods.' },
  { id: 'budget', group: 'Other features', label: 'Budget', panels: ['budget'], def: true,
    what: 'Multi-year budget arbitrage between treatment initiatives.' },
];
const state = () => ({ ...Object.fromEntries(MODULES.map(m => [m.id, m.def])), ...(prefs.get('modules') || {}) });
export const enabled = id => !!state()[id];
export function set(id, on) { prefs.set('modules', { ...state(), [id]: !!on }); apply(); }
/** The module a screen belongs to, if any. */
export const moduleOf = panel => MODULES.find(m => m.panels.includes(panel)) || null;
export const panelOff = panel => { const m = moduleOf(panel); return !!m && !enabled(m.id); };
/** Every screen of a module that is off. */
export const offPanels = () => MODULES.filter(m => !enabled(m.id)).flatMap(m => m.panels);
/** Ask the chrome to redraw the menu (app.js listens). */
export function apply() { window.dispatchEvent(new Event('crg-visibility')); }
