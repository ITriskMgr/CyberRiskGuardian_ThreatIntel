/* menu.js — the structure of the side menu, in one place.

   Sections hold screens; a screen with several tabs holds them as a sub-menu. Everything the menu shows
   is built from this tree (nav.js), so a screen switched off in Settings → Modules, or hidden from a
   person by their access rights, simply does not appear — and a section or sub-menu left empty
   disappears with it.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/* Icons: 16×16 strokes, drawn with currentColor. */
export const ICONS = {
  start: 'M5 3l8 5-8 5z',
  organization: 'M3 14V4l5-2 5 2v10M6 6h1M9 6h1M6 9h1M9 9h1M7 14v-2h2v2',
  assessment: 'M2 13h12M4 13V8M7 13V5M10 13V9M13 13V3',
  threats: 'M8 2l6 3v3c0 3-2.5 5.5-6 6-3.5-.5-6-3-6-6V5zM8 6v3M8 11v.5',
  governance: 'M2 6l6-4 6 4M3 6v6M6.5 6v6M9.5 6v6M13 6v6M2 13h12',
  compliance: 'M3 2h10v12H3zM5.5 8l2 2 3.5-4',
  audit: 'M6 2h4v2H6zM4 3H3v11h10V3h-1M5.5 8.5l1.5 1.5 3-3',
  secops: 'M8 8m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M8 8m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M8 8l5-5',
  registry: 'M3 3h10v3H3zM3 7h10v3H3zM3 11h10v3H3z',
  tools: 'M10 2a3 3 0 0 0-3 4L2 11l3 3 5-5a3 3 0 0 0 4-3l-2 1-1.5-1.5L11 3z',
  settings: 'M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3',
  help: 'M8 8m-6 0a6 6 0 1 0 12 0a6 6 0 1 0-12 0M6.3 6.2a1.8 1.8 0 1 1 2.5 1.7c-.5.3-.8.6-.8 1.1M8 11v.5',
};

const T = (panel, label, more = {}) => ({ panel, label, ...more });
const sub = (panel, label, tabs, more = {}) => ({ panel, label, tabs: tabs.map(([arg, l]) => ({ panel, arg, label: l })), ...more });

export const MENU = [
  { id: 'start', label: 'Start', items: [T('process', 'Process', { badge: 'nb-proc' })] },
  { id: 'organization', label: 'Organization', items: [
    T('org', 'Organization profile'), T('assets', 'Information assets', { badge: 'nb-assets' }), T('maturity', 'Maturity & resilience'), T('reset', 'Reset data')] },
  { id: 'assessment', label: 'Risk assessment', items: [
    T('dashboard', 'KRI dashboard'), T('safeguards', 'Existing safeguards', { badge: 'nb-sg' }), T('register', 'Scenario register', { badge: 'nb-scen' }),
    T('scenario', 'Scenario editor'), T('batch', 'Batch scenarios'), T('calc', 'Risk calculator'), T('riskreg', 'Risk register', { badge: 'nb-risks' }),
    T('mitigation', 'Risk mitigation', { badge: 'nb-meas' }), T('recs', 'Recommendations')] },
  { id: 'threats', label: 'Threats & vulnerabilities', items: [
    T('threats', 'Threats · ATT&CK', { badge: 'nb-tech' }), T('vulns', 'Vulnerabilities · CVE/CWE', { badge: 'nb-vuln' }), T('feeds', 'Threat feeds & social'),
    T('threat', 'Threat context', { badge: 'nb-snap' }), T('ontology', 'Ontology · CRGO')] },
  { id: 'governance', label: 'Governance', items: [
    sub('isms', 'Information security management', [['overview', 'Overview'], ['exceptions', 'Exceptions']]),
    sub('isp', 'ISP management', [['overview', 'Overview'], ['policies', 'Policy library'], ['policy', 'Policy editor'], ['reviews', 'Versions & approvals'],
      ['applicability', 'Applicability & assignments'], ['acks', 'Acknowledgements & training'], ['issues', 'Non-compliance']]),
    sub('csm', 'Cybersecurity management', [['tests', 'Control testing'], ['governance', 'Governance'], ['decisions', 'Decisions'], ['incidents', 'Incidents']]),
    T('frameworks', 'Frameworks & standards'),
    sub('shared', 'Shared registers', [['evidence', 'Evidence'], ['actions', 'Corrective actions'], ['exceptions', 'Exceptions'], ['mappings', 'Mappings']]),
    T('qc', 'Quality review')] },
  { id: 'compliance', label: 'Compliance management', items: [
    sub('compliance', 'Compliance management', [['dashboard', 'Dashboard'], ['obligations', 'Sources & obligations'], ['applicability', 'Legal applicability'],
      ['programmes', 'Programmes & frameworks'], ['mappings', 'Mappings'], ['assessment', 'Frameworks & checklists'], ['requirements', 'Requirements'],
      ['campaigns', 'Campaigns'], ['determinations', 'Determinations'], ['calendar', 'Regulatory calendar'], ['submissions', 'Submissions'],
      ['changes', 'Regulatory change'], ['ai', 'AI-assisted assessment'], ['report', 'Reporting']], { flat: true })] },
  { id: 'audit', label: 'Audit management', items: [
    sub('audit', 'Audit management', [['dashboard', 'Dashboard'], ['charter', 'Charter & methodology'], ['universe', 'Audit universe'], ['plan', 'Audit plan'],
      ['engagements', 'Engagements'], ['programmes', 'Procedures · SP 800-53A'], ['workpapers', 'Workpapers & sampling'], ['findings', 'Observations & findings'],
      ['followup', 'Responses & follow-up'], ['reports', 'Reports'], ['quality', 'Quality & independence'], ['assurance', 'SOC reports & evidence'], ['trace', 'Traceability']], { flat: true })] },
  { id: 'secops', label: 'Security operations', items: [
    sub('siem', 'SIEM', [['dashboard', 'Overview'], ['sources', 'Telemetry sources'], ['rules', 'Detection rules'], ['coverage', 'Coverage & gaps'], ['alerts', 'Alerts & triage'], ['intel', 'Indicators & TLP'], ['import', 'Import']]),
    sub('soar', 'SOAR', [['dashboard', 'Overview'], ['cases', 'Cases'], ['incidents', 'Incidents'], ['playbooks', 'Playbooks'], ['approvals', 'Approval gates'], ['actions', 'Actions'], ['simulations', 'Simulations'], ['lessons', 'Lessons learned']])] },
  { id: 'registry', label: 'Risk Registry', items: [
    T('registry', 'Browse & search', { arg: 'browse' }), T('registry', 'Contribute risks', { arg: 'contribute' }), T('registry', 'My contributions', { arg: 'mine' }),
    T('registry', 'Moderation', { arg: 'moderate' }), T('share', 'Publish & share'), T('registry', 'Registry settings', { arg: 'settings' })] },
  { id: 'tools', label: 'Tools', items: [
    T('cvss', 'CVSS v4.0'), T('budget', 'Budget'), T('export', 'Export · Excel'), T('ai', 'AI assistant'), T('forecast', 'Forecasts'), T('backup', 'Backup & restore')] },
  { id: 'settings', label: 'Settings', items: [
    sub('settings', 'Settings', [['general', 'Language'], ['modules', 'Modules'], ['logs', 'Logs'], ['ai', 'AI — local & remote'], ['users', 'Users & RACI'],
      ['files', 'Documents & files'], ['links', 'Links & shared folders'], ['sources', 'Feed sources & keys'], ['schedule', 'Scheduled task'],
      ['network', 'Network allowlist'], ['simulation', 'Simulation data'], ['backup', 'Export / import']], { flat: true })] },
  { id: 'help', label: 'Help', items: [
    { out: 'help/step-by-step.html', target: 'crg-steps', label: 'Step by step' },
    { out: 'help/user-guide.html', target: 'crg-guide', label: 'User guide' },
    T('about', 'About')] },
];

/** Every screen the menu can open (for the access matrix and the tests). */
export const PANELS_IN_MENU = [...new Set(MENU.flatMap(s => s.items.flatMap(i => i.panel ? [i.panel] : [])))];
/** The label of a screen, or of one of its tabs. */
export function labelOf(panel, arg) {
  for (const s of MENU) for (const i of s.items) {
    if (i.panel !== panel) continue;
    if (arg && i.tabs) { const t = i.tabs.find(t => t.arg === arg); if (t) return t.label; }
    if (arg && i.arg && i.arg !== arg) continue;
    return i.label;
  }
  return null;
}
/** The section a screen belongs to. */
export const sectionOf = panel => MENU.find(s => s.items.some(i => i.panel === panel)) || null;
