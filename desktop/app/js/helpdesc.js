/* helpdesc.js — a one-line description and a "?" help for every screen and tab.

   decorate() runs after a screen is drawn: under its title it adds the one-line description (unless
   the screen opens with its own introduction), and beside the title a "?" button that opens the
   longer help with a link to the matching section of the user guide (anchor {#id} in USER-GUIDE.md
   and USER-GUIDE.fr.md). A screen module may export HELP = { '': {...}, tab: {...} } for its own
   tabs; the entries below cover the others. Entry: { d: description, h: [paragraphs], g: anchor }.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { tr } from './i18n.js';
import * as i18n from './i18n.js';

export const HELP = {
  process: { d: 'The thirteen steps of a complete risk assessment, where you are, and what to do next.', g: 'process',
    h: ['Each step says what it is for, which screens it uses and when it is done. The badge in the menu shows the next step.', 'Print the checklist to follow an assessment on paper or in a classroom.'] },
  org: { d: 'The organization: mission, services, crown jewels, obligations, risk appetite, workspaces and imports from documents.', g: 'org',
    h: ['Everything the assessment rests on starts here. Facts come from the organization; anything estimated is labelled "Analytical estimate — validation required".', 'Use Import from documents to propose values from your own files; nothing is stored until you accept it.'] },
  assets: { d: 'Information assets, their owners, classification, dependencies and criticality.', g: 'assets',
    h: ['Assets feed crown jewels, scenarios and triage in Security operations (alerts touching a crown jewel come first).'] },
  maturity: { d: 'Cybersecurity maturity and resilience by NIST CSF 2.0 function, with evidence.', g: 'maturity',
    h: ['Maturity informs resilience θ(ψ,A) in the scenarios; it never changes a parameter by itself.'] },
  reset: { d: 'Put a workspace or a teaching case back to a starting point, with a preview of what is removed.', g: 'reset',
    h: ['Every reset is recorded. Teaching cases can be reset by anyone; organization workspaces need an administrator in multi-user mode.'] },
  dashboard: { d: 'Key risk indicators with targets, warning and critical thresholds, and their history.', g: 'dashboard',
    h: ['Record readings to follow each KRI over time; a KRI out of range points to the scenarios it watches.'] },
  safeguards: { d: 'The inventory of what already protects the organization: owner, state and when each control was last shown to work.', g: 'safeguards',
    h: ['Existing safeguards are evidence for the scenarios; the mitigation plan is for what you propose to add.'] },
  register: { d: 'Every risk scenario of the workspace with its estimated, tolerated and residual risk.', g: 'register',
    h: ['Sort, filter and open a scenario. Excluded scenarios stay in the register but do not count in the totals.'] },
  scenario: { d: 'One scenario in full: causal chain, parameters with rationale, controls, ontology context and evidence.', g: 'scenario',
    h: ['Each parameter carries a value, a justification, the evidence and a confidence level. The calculation uses the verified engine.'] },
  batch: { d: 'Create many scenarios at once from crown jewels, assets and threat patterns, or from a CSV file.', g: 'batch',
    h: ['Proposals are drafts: review each one before it joins the register.'] },
  calc: { d: 'The CyberRiskGuardian calculation for one scenario, step by step.', g: 'calc',
    h: ['Shows estimated, tolerated, mitigated and residual risk and the residual-to-tolerance ratio, with every intermediate value.'] },
  riskreg: { d: 'The risk register for management: owners, treatment decisions and residual risk against tolerance.', g: 'riskreg',
    h: ['Decisions to accept, transfer, avoid or mitigate belong to management; the register records them.'] },
  mitigation: { d: 'Proposed treatment measures, their cost, effectiveness, owners and the scenarios they reduce.', g: 'mitigation',
    h: ['Shared measures are counted once even when they reduce several scenarios.'] },
  recs: { d: 'Recommendations ready for management, by time horizon, with cost and the scenarios they address.', g: 'recs',
    h: ['Each recommendation states its treatment objective in risk terms and how success will be measured.'] },
  threats: { d: 'MITRE ATT&CK techniques linked to your scenarios.', g: 'threats', h: ['Link techniques to scenarios to see which ones your controls must cover.'] },
  vulns: { d: 'Vulnerabilities (CVE/CWE) of the organization, with suggested links to scenarios.', g: 'vulns',
    h: ['Import scanner or CMDB exports; links to scenarios are suggestions until you accept them.'] },
  feeds: { d: 'Daily threat-feed and social-media briefings matched to your scenarios.', g: 'feeds',
    h: ['Briefings are written to the feeds folder by the scheduled task or the helper; nothing changes a score automatically.'] },
  threat: { d: 'The KEV/EPSS threat-context snapshot of this workspace: one dated JSON file, the exposure join and the evidence ladder.', g: 'threat',
    h: ['A snapshot is one file named threat-context-YYYY-MM-DD.json. "Use in this workspace" stores it inside the workspace on this computer — no file is created. "Download" saves the same file to your browser\'s download folder (usually Downloads), to load it elsewhere with the Snapshot field, share it or archive it.',
      'A snapshot expires (90 days by default). EPSS is not a likelihood: it is evidence the analyst weighs.'] },
  ontology: { d: 'The CyberRiskGuardian Ontology (CRGO): identification, organisation context, compliance and security-operations contexts, write-back as proposals.', g: 'ontology',
    h: ['CRGO computes no risk. What it returns is evidence; write-backs are always proposals that a person reviews.'] },
  registry: { d: 'The shared Risk Registry: browse, contribute, moderate and configure.', g: 'registry',
    h: ['The registry is shared through a common folder; contributions are anonymized before they leave the workspace.'] },
  share: { d: 'Publish the assessment as a package to share.', g: 'share', h: ['Choose what goes in the package; nothing is sent anywhere by this screen.'] },
  frameworks: { d: 'Control catalogues, methods and standards used by the application, and their revision log.', g: 'frameworks',
    h: ['Licensed standards appear as identifiers and paraphrases only.'] },
  qc: { d: 'The checks to run before a report or an ontology write-back leaves the analyst.', g: 'qc',
    h: ['A failed check links to the screen where it can be fixed. Checks include: no compliance claimed from a mapping, no incident inferred from an alert, no response action presented as authorised, TLP respected.'] },
  cvss: { d: 'CVSS v4.0 calculator for an identifiable technical vulnerability.', g: 'cvss',
    h: ['CVSS measures a vulnerability, not the organization\'s risk.'] },
  budget: { d: 'Multi-year budget arbitrage between treatment initiatives, from risk-averse to risk-seeking.', g: 'budget', h: ['The budget compares what each option buys in risk reduction.'] },
  export: { d: 'Export the assessment to an Excel workbook.', g: 'export', h: ['The file is saved to your browser\'s download folder and recorded in Settings → Logs.'] },
  ai: { d: 'The AI assistant: analyst questions, parameter critique and scenario proposals.', g: 'ai',
    h: ['The exact payload is shown before anything is sent. Every answer is an analytical estimate to validate.'] },
  forecast: { d: 'Forecasts of KRIs and risk over the coming periods.', g: 'forecast', h: ['Forecasts are indicative; they rest on the recorded history.'] },
  backup: { d: 'Back up and restore workspaces, and see their data versions and migrations.', g: 'backup',
    h: ['A backup is a file in your download folder. Restoring migrates older data on a copy and never converts newer data backwards.'] },
  about: { d: 'Version, licence, author and the use of AI in this application.', g: 'about', h: ['The version shown here is the one you are running.'] },
  isms: { d: 'The information security management system: scope, objectives, management reviews and exceptions.', g: 'isms',
    h: ['An exception is time-limited and never waives a law.'] },
  'isms/exceptions': { d: 'Exceptions to internal policies: scoped, approved, compensated and expiring — kept in the shared exception register.', g: 'isms',
    h: ['An expired exception no longer mitigates anything. A departure from a legal obligation is a non-compliance, not an exception.'] },
  csm: { d: 'Cybersecurity management: control testing by line of defence, governance, decisions and the incident register.', g: 'csm',
    h: ['Conflicting test results stay visible; a decision record is a human decision.'] },
  settings: { d: 'Settings shared by every workspace of this installation.', g: 'settings', h: ['Some settings are for administrators only in multi-user mode.'] },
  'settings/general': { d: 'The interface language.', g: 'settings', h: ['English and French; organization data keeps its own language.'] },
  'settings/modules': { d: 'Switch features on or off for this installation.', g: 'settings-modules',
    h: ['A feature that is off leaves the menu, with any section left empty. Its data stays in each workspace. To hide screens from some people only, use Users & RACI → menu access.'] },
  'settings/logs': { d: 'The access log and the data log of this installation: who opened what, and which data and files were saved.', g: 'settings-logs',
    h: ['Logs record when, who, what and where — never the contents of a workspace or file, never a key or a PIN. They stay on this computer and are trimmed to the retention you choose.'] },
  'settings/ai': { d: 'AI providers, local and remote, and what each feature may send.', g: 'settings-ai', h: ['Keys are stored by the helper in crg-keys.json, never in a workspace.'] },
  'settings/users': { d: 'Multi-user mode, users, groups, RACI rights and menu access.', g: 'settings-users',
    h: ['Menu access hides screens from a person or group; the rights are an organizational guard, not a security boundary.'] },
  'settings/files': { d: 'Every document and file the application knows about.', g: 'settings', h: [] },
  'settings/links': { d: 'Your own shared folders and external links.', g: 'settings', h: [] },
  'settings/sources': { d: 'Threat-feed and social-media sources, and API keys.', g: 'settings', h: [] },
  'settings/schedule': { d: 'The Claude scheduled task that downloads the feeds.', g: 'settings', h: [] },
  'settings/network': { d: 'The domains to allow for feeds and AI.', g: 'settings', h: [] },
  'settings/simulation': { d: 'Simulation data for teaching: SIEM and SOAR records for a case, from the bundled packs or generated with AI.', g: 'settings-simulation',
    h: ['Simulation data is fictional and labelled as such. It is imported into the current workspace like any local import and never counts as evidence about a real organization.'] },
  'settings/backup': { d: 'Export or import the settings of this installation.', g: 'settings', h: ['Keys are never exported.'] },
};

/** The entry for a screen (and tab): the module's own HELP first, then this table. */
export function entry(panel, arg, mod) {
  const tab = (arg || '').split('/')[0];
  return (tab && (mod?.HELP?.[tab] || HELP[panel + '/' + tab])) || mod?.HELP?.[''] || HELP[panel] || null;
}

function guideHref(g) { return 'help/user-guide.html' + (g ? '#' + encodeURIComponent(g) : ''); }

/* Screens redraw themselves (a tab switched, a value loaded): watch each section and put the
   description and the "?" back whenever its title is redrawn without them. */
function watch(sec) {
  if (sec._helpObs) return;
  sec._helpObs = new MutationObserver(() => {
    const h1 = sec.querySelector('h1');
    if (!h1 || h1.querySelector('.helpq') || sec.hidden || !sec._help) return;
    const [, arg] = (location.hash || '').replace(/^#\/?/, '').split(/\/(.*)/);
    decorate(sec, sec._help.panel, arg || null, sec._help.mod);
  });
  sec._helpObs.observe(sec, { childList: true });
}

export function decorate(sec, panel, arg, mod) {
  sec._help = { panel, mod }; watch(sec);
  const e = entry(panel, arg, mod);
  const h1 = sec.querySelector('h1');
  if (!e || !h1) return;
  sec.querySelectorAll(':scope > .paneldesc, :scope > .helppop').forEach(n => n.remove());
  const next = h1.nextElementSibling;
  if (e.d && !(next && next.classList.contains('lede'))) {
    const p = document.createElement('p'); p.className = 'paneldesc'; p.textContent = tr(e.d); h1.after(p);
  }
  if (h1.querySelector('.helpq')) return;
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'helpq'; b.textContent = '?'; b.title = tr('Help on this screen'); b.setAttribute('aria-label', tr('Help on this screen')); b.setAttribute('aria-expanded', 'false');
  b.addEventListener('click', () => {
    const open = sec.querySelector(':scope > .helppop');
    if (open) { open.remove(); b.setAttribute('aria-expanded', 'false'); return; }
    const box = document.createElement('div'); box.className = 'helppop'; box.setAttribute('role', 'note');
    const x = document.createElement('button'); x.type = 'button'; x.className = 'btn ghost sm x'; x.textContent = '×'; x.setAttribute('aria-label', tr('Close'));
    x.addEventListener('click', () => { box.remove(); b.setAttribute('aria-expanded', 'false'); b.focus(); });
    box.append(x);
    const t = document.createElement('p'); const strong = document.createElement('b'); strong.textContent = tr(e.d || ''); t.append(strong); box.append(t);
    for (const para of (e.h || [])) { const p = document.createElement('p'); p.textContent = tr(para); box.append(p); }
    const p = document.createElement('p'); p.className = 'small';
    const a = document.createElement('a'); a.href = guideHref(e.g); a.target = 'crg-guide'; a.rel = 'noopener'; a.textContent = tr('Open this section of the user guide') + ' ↗';
    a.addEventListener('click', ev => { if (ev.metaKey || ev.ctrlKey || ev.shiftKey) return; const w = window.open(a.href, 'crg-guide', 'popup=yes,width=1040,height=920,noopener'); if (w) ev.preventDefault(); });
    p.append(a); box.append(p);
    const anchor = sec.querySelector(':scope > .paneldesc') || h1;
    anchor.after(box); b.setAttribute('aria-expanded', 'true'); x.focus();
  });
  h1.append(b);
  if (i18n.isFR?.()) i18n.translateTree?.(h1);
}
