/* help.js — the help corpus of the chatbot (1.5.2): a tip for every screen, the 12 process steps and
   frequent questions. Written in English like every interface string; the French catalogue translates
   it on screen and the search matches both languages. The user guide's sections are added at run time.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { VERSION } from './version.js';
import { STEPS } from './process.js';
import { GUIDELINES } from './panels/process.js';

export const SCREENS = {
  process: ['Process', 'The 12 steps of a complete risk assessment, the status of each in this workspace and buttons to open the right screen. Start here when you do not know what to do next.'],
  org: ['Organization', 'Workspaces, the organization profile and risk appetite, crown jewels, the classroom setting, context documents and the evidence imported from them. Use “Extract from documents…” to propose the profile and the crown jewels, then Save; Workspaces → Import from the documents pre-fills the rest of the assessment.'],
  dashboard: ['KRI dashboard', 'Key risk indicators: the five most in need of attention by default, with gauges and trends. Record a measurement at each review.'],
  assets: ['Information assets', 'The inventory of systems, applications, data and services with criticality, business impact, vulnerabilities, dependencies and blast radius. “Create from profile & crown jewels” starts it.'],
  register: ['Scenario register', 'All scenarios with their risk, ratio and status. Tick or untick to include them in the totals; click one to edit it.'],
  scenario: ['Scenario editor', 'One scenario in full: causal chain, ATT&CK and CVE/CWE links, the six parameters with rationale and confidence, CVSS and treatment.'],
  batch: ['Batch scenarios', 'Create many candidates at once — threat patterns × assets (with a number of candidates), Propose with AI, ATT&CK, CVE, CWE, CSV — review them in the grid, then add the selected ones to the register.'],
  calc: ['Risk calculator', 'Estimated, tolerated, mitigated and residual risk of every scenario, with the ratio and its band. Include or exclude scenarios from the portfolio.'],
  riskreg: ['Risk register', 'Risks owned by management, linked to scenarios, threats, vulnerabilities, assets and measures, with ratings, treatment and formal acceptance.'],
  mitigation: ['Risk mitigation', 'Measures from ISO/IEC 27002, NIST, CIS and other catalogues with cost and likelihood / impact reduction; combined per scenario as 1 − ∏(1 − r).'],
  recs: ['Recommendations', 'Treatment need, draft recommendations, approval (which freezes the figures), consolidation into initiatives, roadmap and decisions.'],
  threats: ['Threats · ATT&CK', 'MITRE ATT&CK techniques, mitigations and the scenarios that use them; Navigator export.'],
  vulns: ['Vulnerabilities · CVE/CWE', 'The CVE register with exposure, KEV and EPSS; online updates through the helper; CWE explorer.'],
  feeds: ['Threat feeds & social', 'Feed items triaged into stories that need a decision, are worth watching or are not relevant. Feeds never change a score.'],
  threat: ['Threat context', 'Load or build a KEV/EPSS snapshot and place exposed CVEs on the Threat Evidence Ladder; accept exposure-gated Pb(ψ,A) proposals one by one.'],
  frameworks: ['Frameworks & standards', 'Control catalogues and the methods the assessment follows, with versions and an update mechanism.'],
  compliance: ['Compliance', 'Statements of applicability, maturity against target, gaps linked to measures, Law 25 and PIPEDA checklists.'],
  share: ['Publish & share', 'Publish the risk register and scenario registry, anonymized on request; import registries shared by others.'],
  cvss: ['CVSS v4.0', 'Base metrics only. Exploitation evidence belongs in Pb(ψ,A), not in the vector.'],
  budget: ['Budget', 'Budget years, initiatives over up to three years, and funding options placed on the appetite-consistent band (4% / 7.8% / 12% of IT).'],
  export: ['Export · Excel', 'The workbook with live formulas, the assessment JSON, the context pack and workspace backups.'],
  ai: ['AI assistant', 'The analyst, parameter critique, scenario generation and the decision log. Every request is shown in full before it is sent.'],
  forecast: ['Forecasts', 'Monte Carlo over the CRG model from parameter ranges, driver chart and KRI projections — decision support, shown apart from the calculated results.'],
  backup: ['Backup & restore', 'One file with every workspace, documents and settings (never API keys), restored with a preview of what changes.'],
  settings: ['Settings', 'Language, AI — local & remote (routes, providers, tests), users, RACI rights and menu access, documents and files, links and shared folders, feed sources and keys, AI providers, the scheduled task.'],
  reset: ['Reset data', 'Start a teaching case over from its starting point, and — for an administrator — reset or delete a workspace at the level you choose. The stored API keys are kept unless you ask for them to go.'],
  safeguards: ['Existing safeguards', 'The inventory of what already protects the organization: technical measures, business processes, internal controls, awareness programs and others, and what each contributes to the six resilience capabilities.'],
  maturity: ['Maturity & resilience', 'The CSF 2.0 maturity assessment, the resilience capabilities behind θ(ψ,A), the questionnaire and the history of recorded assessments.'],
  about: ['About', 'The creator, the licence, the use of generative AI, the project website and GitHub repository, versions.'],
};

export const FAQ = [
  ['What is the baseline (run) security cost?', 'The part of the current cybersecurity spend needed just to keep existing security running: salaries of the current security staff, licence renewals, existing managed services, maintenance. It covers no new treatment. Budget adds the cost of new initiatives to it.', 'org/profile'],
  ['What is the difference between the cybersecurity budget and the baseline?', 'The cybersecurity budget (current spend) is everything spent on cybersecurity this year, including projects. The baseline is only the recurring run cost. Projects ending this year are in the spend but not in the baseline.', 'org/profile'],
  ['What do FACT, INFERENCE, ASSUMPTION, EXTERNAL and UNKNOWN mean?', 'They are provenance tags on extracted values. FACT: explicitly in the documents. INFERENCE: derived from facts. ASSUMPTION: a plausible value because information is missing. EXTERNAL: from external evidence such as a web page. UNKNOWN: information still to collect.', 'org/profile'],
  ['How do I extract the profile from documents?', 'Organization → Profile & appetite → “Extract from documents…”. Choose AI (you see what is sent) or rules only. Review the proposed values, tick the ones to keep, then Save. You can also tick the option when creating a workspace.', 'org/profile'],
  ['What is the risk appetite?', 'A value from 0.1 (very risk-averse) to 0.9 (very risk-seeking) approved by management. It sets the tolerated risk of every scenario. 0.3 is a low appetite, 0.5 neutral.', 'org/profile'],
  ['How is risk calculated?', 'Estimated risk = Pb(A) × Pb(ψ,A) × CVSS × ((δe + δm)/2) × μ(E) / θ × factor. Tolerated risk uses the appetite instead of the damages. Mitigated = estimated × red_p × red_i; residual = estimated − mitigated. The verified engine does it; AI never does.', 'calc'],
  ['What do the ratio bands mean?', 'Residual / tolerated below 0.90: below tolerance. From 0.90 to 1.10: approximately at tolerance. Above 1.10: above tolerance.', 'calc'],
  ['How many scenarios should I create?', 'About 20 candidates, then keep the 10 most material for detailed analysis. Batch scenarios lets you set the number of candidates.', 'batch'],
  ['Why are my information assets not offered in Batch scenarios?', 'Since 1.5.2 Batch scenarios lists the crown jewels and the information assets (most critical first). Create assets in Information assets or crown jewels in Organization.', 'batch'],
  ['How do I use AI and what leaves my computer?', 'AI is optional. The browser never calls a model: the local helper does, after showing you the exact text. Choose the Claude API or a local model in the AI assistant and Settings; mark a workspace confidential to confirm every call.', 'ai'],
  ['How do I switch the interface to French?', 'Use the EN / FR buttons in the top bar. Only the interface changes; your data and the case documents stay in their original language.', 'settings/general'],
  ['How do I turn on AI answers in this chat?', 'Settings → AI — local & remote → “Let the chatbot use AI”. AI must also be on for the workspace (same page). Without it the chatbot answers from the built-in help.', 'settings/ai'],
  ['How do I link vulnerabilities to scenarios?', 'Vulnerabilities → Suggest links (or “Suggest vulnerabilities for this scenario…” in the scenario editor). Run the rules — on this computer, no AI — then optionally ask AI for more. Review, tick and accept; a link never changes a score by itself. Exposure proposals mark CVEs that an asset lists or runs.', 'vulns/links'],
  ['Where do my AI requests go?', 'Settings → AI — local & remote shows, for each AI feature, whether it uses the local model, the Claude API or nothing, and lets you change it. Vulnerability linking uses the local model by default because it carries the vulnerability list. The helper enforces the same rules.', 'settings/ai'],
  ['How do I test the AI connection?', 'Settings → AI — local & remote → Providers → “Test the Claude API” or “Test the local model”. The test sends a few tokens and no workspace data.', 'settings/ai'],
  ['How do I import more data from the documents?', 'Organization → Workspaces → Import from the documents: tick the targets (information assets, BIA, third parties, existing controls, compliance, incidents, weaknesses, candidate scenarios, parameter evidence, risks, budget, KRIs, people and roles, classroom), choose AI or rules, click “Start the import”, then review each proposal and click “Add ticked”. Every item keeps its tag and source. You can also tick “Then import more from the documents” when creating a workspace.', 'org/workspaces'],
  ['Where are incidents and roles found in the documents kept?', 'Organization → Evidence: incidents, people and roles (with “Create user” in multi-user mode), the spend breakdown and the import log.', 'org/evidence'],
  ['How do I delete or replace a document such as a business case?', 'Settings → Documents & files (administrators): rename, change the category, “Replace…” with a new version (the text is read again; the previous text is kept as an earlier version), “Open text”, “Delete”, or delete several at once.', 'settings/files'],
  ['How do I limit which menus a user or group can see?', 'Settings → Users & RACI → Menu access by group and user account: create groups, tick members, and set each menu to Default (RACI), Full, View only or Hidden for a group or a user. A user’s own setting wins; between groups the most permissive applies.', 'settings/users'],
  ['Why are amounts shown as $123,423 in French?', 'Amounts use one format in every language and on every screen: the English one, $123,423.', 'budget'],
  ['How do users and rights work?', 'Settings → Users & RACI. Each user has a RACI letter per process step: R edits, A edits and approves, C and I view, – hides the step. Administrators manage users. This organizes work on one computer; it is not a security boundary.', 'settings/users'],
  ['Who can approve a recommendation?', 'In multi-user mode, a user with the Approve right (RACI “A”) on step 9 or an administrator. Approval freezes the figures with the approver and date.', 'recs'],
  ['How do I quit the application?', 'Click Exit in the top bar: your work is saved, the local helper stops and the window closes (in a browser tab you can then close the tab).', 'process'],
  ['How do I back up my work?', 'Backup & restore writes one file with every workspace and the settings; API keys are never included.', 'backup'],
  ['What is a crown jewel?', 'An asset, service, data set or process whose loss or compromise would most harm the mission. Scenarios refer to them as affected assets.', 'org/crown'],
  ['Is this a finished product?', `No. Version ${VERSION} is a beta proof of concept for teaching, exploration and method validation. Validate every result before it supports a real decision.`, 'about'],
];

/** The corpus as searchable entries. */
export function entries() {
  const out = [];
  for (const [id, [title, text]] of Object.entries(SCREENS)) out.push({ id: 'screen:' + id, kind: 'screen', title, text, route: id === 'process' ? 'process' : id });
  for (const s of STEPS) out.push({ id: 'step:' + s.id, kind: 'step', title: `Step ${s.n} — ${s.title}`, text: `${s.purpose} Done when: ${s.done} ${(s.tips || []).join(' ')}`, route: s.screens[0][0] });
  FAQ.forEach(([q, a, r], i) => out.push({ id: 'faq:' + i, kind: 'faq', title: q, text: a, route: r }));
  // 1.5.4 — the detailed guidelines of the Process page
  GUIDELINES.forEach((g, i) => out.push({ id: 'guideline:' + (i + 1), kind: 'guideline', title: `Guideline ${i + 1} — ${g.h}`,
    text: `${g.t} Where: ${g.where}. ${g.steps.map((x, j) => `${j + 1}) ${x}`).join(' ')} Done when: ${g.done}`, route: g.routes[0][0] }));
  return out;
}
