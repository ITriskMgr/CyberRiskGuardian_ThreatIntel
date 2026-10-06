/* About (1.5.6) — three pages: the creator and the project, the licence in plain terms, and the
   versions with the engine check.

   The licence page is not a copy of the legal code (LICENSE ships that in full). It answers the
   question people actually have — may I use this, and does my situation need a licence — and says
   plainly which situations do. Non-commercial is the licence's word, not a judgement about who
   deserves free software: a college teaching with it is an institution using it to deliver a paid
   service, which CC BY-NC does not cover, while the student in that class is covered.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, banner, kpi, pill } from '../util.js';
import { HS, probe } from '../helper.js';
import { VERSION as APP_VERSION, CHANNEL } from '../version.js';

export const VERSION = APP_VERSION;          // one source of truth: js/version.js
export const REPO = 'https://github.com/ITriskMgr/CyberRiskGuardian';
export const SITE = 'https://www.leger.ca';
const a = (href, text) => el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text || href);

export const EMAIL = 'marcandre@leger.ca';
export const LICENCE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/';
export const LICENCE_CODE = 'https://creativecommons.org/licenses/by-nc/4.0/legalcode';

let view = 'about';

export function render(sec, arg) {
  if (arg && ['about', 'licence', 'versions'].includes(arg)) view = arg;
  if (HS.helper === undefined) probe().then(() => render(sec)).catch(() => {});
  sec.replaceChildren(
    el('div', 'about-head', el('img', { src: 'icons/icon-192.png', alt: '', width: 72, height: 72 }),
      el('div', null, el('h1', null, 'CyberRiskGuardian'), el('div', 'lede', { style: { margin: 0 } }, 'with Threat Intel features — desktop edition'),
        el('div', 'row', { style: { gap: '6px', marginTop: '6px' } }, pill('Beta ' + VERSION, 'warn'), pill('Proof of concept', 'warn'), pill('CC BY-NC 4.0', '')))));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['about', 'About'], ['licence', 'Licence'], ['versions', 'Versions']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ about, licence, versions }[view])(body, sec);
}

/* ---------------- licence ---------------- */

/** Who may use this under CC BY-NC 4.0, and who has to ask. Plain situations, not categories. */
export const ALLOWED = [
  ['Students, for their own coursework', 'A student using the application to learn the method, do an assignment or work a case study — including handing in the result for a grade. Individual use by the student, not deployment by the school.'],
  ['Personal and private use', 'Learning the method, trying it on your own situation, reading the code, experimenting. Nothing is sent anywhere, so this stays between you and your computer.'],
  ['Non-profit organizations and NGOs', 'A charity, a community organization or a non-governmental organization assessing its own cyber risk. Not a government body, and not a non-profit arm of a commercial group.'],
  ['Research and teaching materials you write yourself', 'Quoting the method, the formulas or the screens in a paper, a thesis or your own course notes, with the attribution below. Reproducing the application itself inside a paid programme is institutional use.'],
  ['Evaluation, for up to 30 days', 'Any organization may install it and try it for no more than 30 days to decide whether to license it. Beyond that, or in production, a licence is required — whichever comes first.'],
];
export const NEEDS_LICENCE = [
  ['Colleges, universities and other educational institutions', 'Using it to deliver teaching — in a course, a programme, a laboratory or an institutional deployment — is a commercial use of the work, whatever the institution\'s own status. The students in that course are covered; the institution is not.'],
  ['Government departments and agencies', 'At any level: municipal, provincial or state, federal or national, and their agencies and regulators.'],
  ['Crown corporations and other public enterprises', 'A public body operating commercially needs a licence like any other enterprise.'],
  ['Businesses and corporations, of any size', 'Including small and medium businesses, consultancies, auditors and advisers using it for client work, and any assessment that supports a commercial activity.'],
  ['Anything embedded in a product or a paid service', 'Hosting it for clients, bundling it, reselling it, or building a service on it — whether or not the application itself is what is charged for.'],
];

function licence(body) {
  body.append(banner('warn', 'This is a summary, not the licence',
    'What follows explains how the licence is meant to apply. The licence itself is the Creative Commons legal code, shipped in full as LICENSE in the application folder. Where the two differ, the legal code governs. This is not legal advice.'));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)'),
    el('p', null, 'CyberRiskGuardian — the method, this application, its documentation and its catalogues — is © 2026 Marc-André Léger and licensed under CC BY-NC 4.0.'),
    el('p', null, 'The licence lets anyone share the work — copy and redistribute it in any medium or format — and adapt it — remix, transform and build upon it — as long as two conditions are met:'),
    el('ul', null,
      el('li', null, el('b', null, 'Attribution (BY). '), 'Credit the author, link to the licence and say whether you changed anything — in a way that does not suggest the author endorses you or your use.'),
      el('li', null, el('b', null, 'NonCommercial (NC). '), 'You may not use the work “primarily for commercial advantage or monetary compensation”. That is the licence\'s own wording: it is about the nature of the use, not the size or the goodwill of the user.')),
    el('p', 'small muted', 'There is no additional restriction: you may not apply legal terms or technological measures that stop others doing anything the licence permits. The licence carries no warranty — the application is provided as is, and it is a proof of concept.'),
    el('ul', null,
      el('li', null, 'Licence summary: ', a(LICENCE_URL)),
      el('li', null, 'Legal code: ', a(LICENCE_CODE)),
      el('li', null, 'Identifier: ', el('code', null, 'CC-BY-NC-4.0')))));

  body.append(el('div', 'grid g2',
    card(el('h2', { style: { marginTop: 0 } }, 'Allowed without asking'),
      ...ALLOWED.flatMap(([h, t]) => [el('p', null, el('b', null, h)), el('p', 'small muted', { style: { marginTop: '-4px' } }, t)])),
    card(el('h2', { style: { marginTop: 0 } }, 'Needs a commercial licence'),
      ...NEEDS_LICENCE.flatMap(([h, t]) => [el('p', null, el('b', null, h)), el('p', 'small muted', { style: { marginTop: '-4px' } }, t)]))));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Evaluation: 30 days'),
    el('p', null, 'An organization that would need a licence may still install the application and try it, for no more than 30 days from first use, to decide whether to license it. Within those 30 days it may be used on real data for the purpose of evaluating it. It may not be used to deliver an assessment to a client, to support a decision outside the evaluation, or in teaching.'),
    el('p', 'note', 'Beyond 30 days, or for any of the uses listed as needing a licence, contact the author and we will agree terms.')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Getting a commercial licence'),
    el('p', null, 'Write to me with what you want to do: who the organization is, how many people would use it, whether it is for internal assessments or client work, and over what period. Educational institutions, government bodies and businesses are all welcome — the licence exists so that this can keep being developed.'),
    el('ul', null,
      el('li', null, 'E-mail: ', el('a', { href: 'mailto:' + EMAIL }, EMAIL)),
      el('li', null, 'Website: ', a(SITE, 'www.leger.ca')),
      el('li', null, 'LinkedIn: ', a('https://www.linkedin.com/in/itriskmgr', 'linkedin.com/in/itriskmgr'))),
    el('p', 'note', 'A formal price list will be published. It is not published yet: this project is still in development, and pricing a proof of concept would be premature. Until then, terms are agreed case by case, and early users are treated accordingly.')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'How to credit it'),
    el('p', 'mono small', 'CyberRiskGuardian by Marc-André Léger, CC BY-NC 4.0, ' + REPO),
    el('p', null, `In a report produced with it, naming the method and its version is usually enough: “Assessed with the CyberRiskGuardian method (Léger), CyberRiskGuardian Desktop ${VERSION} beta.”`),
    el('p', 'small muted', 'Third-party material inside the application — the CVSS v4.0 reference tables, MITRE ATT&CK, CAPEC and CWE, the NIST catalogues, the control identifiers of ISO/IEC and CIS, the CISA KEV catalogue and the FIRST EPSS scores — carries its own terms, listed in NOTICE.md. Those terms are not changed by this licence, and some of them restrict redistribution in ways CC BY-NC does not.')));
}

/* ---------------- about ---------------- */

function about(body) {
  body.append(banner('warn', 'Proof of concept', 'This beta demonstrates the CyberRiskGuardian method and its tooling. It is not a certified product. Results are relative decision-support indicators; validate them before they support a real decision.'));

  body.append(el('div', 'grid g2',
    card(el('h2', { style: { marginTop: 0 } }, 'Creator'),
      el('p', null, el('b', null, 'Marc-André Léger'), ', PhD, MBA, EMBA, MScA (MIS), Adm.A.'),
      el('p', null, 'More than 40 years of experience across cybersecurity, business technology and higher education. His work focuses on cybersecurity governance, digital risk management, practical applications of AI and the strategic integration of information systems. He teaches cybersecurity, business technology management and eBusiness.'),
      el('p', null, 'Author of the CyberRiskGuardian method, the scenario-driven risk analysis model it implements, and its plugin, mobile and desktop editions.'),
      el('ul', null,
        el('li', null, 'E-mail: ', el('a', { href: 'mailto:' + EMAIL }, EMAIL)),
        el('li', null, 'Website: ', a(SITE, 'www.leger.ca')),
        el('li', null, 'LinkedIn: ', a('https://www.linkedin.com/in/itriskmgr', 'linkedin.com/in/itriskmgr')))),
    card(el('h2', { style: { marginTop: 0 } }, 'Project'),
      el('ul', null,
        el('li', null, 'Project and source code on GitHub: ', a(REPO)),
        el('li', null, 'Project website: ', a(SITE, 'www.leger.ca')),
        el('li', null, 'Licence: Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) — see the Licence page'),
        el('li', null, 'Attribution: “CyberRiskGuardian by Marc-André Léger, CC BY-NC 4.0, ', a(REPO, 'github.com/ITriskMgr/CyberRiskGuardian'), '”')),
      el('p', 'small muted', 'Third-party material (CVSS reference tables, MITRE ATT&CK, CAPEC and CWE, NIST catalogues, control identifiers of ISO/IEC and CIS) is listed with its terms in NOTICE.md.'))));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Use of generative AI'),
    el('p', null, 'Generative AI was used to create this application. Anthropic’s Claude models, through Claude (Cowork) and Claude Code, assisted with writing and testing the code, the documentation, the French interface catalogue, the control and framework catalogues and the test suites, under the direction of the author, who specified the features, reviewed the results and remains responsible for them.'),
    el('p', null, 'The risk calculation itself does not use AI: the verified engine (crg.js, cvss4.js) reproduces the CyberRiskGuardian workbook formulas and is checked against the MediBec reference at every start.'),
    el('p', null, 'Inside the app, AI features (AI assistant, extraction from documents, scenario proposals, the chatbot’s AI answers) are optional. They show what would be sent before anything leaves the computer, label every result “Analytical estimate — validation required”, and never change a stored value until a person accepts it.'),
    el('p', 'small muted', 'Claude is a product of Anthropic. This application is not affiliated with or endorsed by Anthropic.')));
}

/* ---------------- versions ---------------- */

function versions(body) {
  const eng = document.getElementById('engine-state')?.textContent || '';
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Versions'),
    el('div', 'grid g4',
      kpi('Application', VERSION + ' ' + CHANNEL, 'proof of concept'),
      kpi('Engine', eng.replace(/^engine /, '') || '—', 'crg.js · cvss4.js', /verified|vérifié/.test(eng) ? 'good' : 'warn'),
      kpi('Local helper', HS.helper?.helper || 'not running', HS.helper ? 'serve.py' : 'start with the launcher'),
      kpi('Knowledge base', (self.CRG_KB?.meta?.attack?.version || 'ATT&CK'), 'CAPEC · CWE')),
    el('p', 'small muted', 'The application version comes from one place in the source (js/version.js). The build fails if the helper, the offline cache and this page disagree, so what this screen says is what you are running.')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'What this release added'),
    el('ul', null,
      el('li', null, el('b', null, 'General'), ' — one menu section for Organization, Information assets, Maturity & resilience, Publish & share and Reset data, plus the step-by-step guide and the user guide, each in a window of its own.'),
      el('li', null, el('b', null, 'Reset data'), ' — a teaching case can be put back to its starting point by anyone working it; an administrator can reset a workspace at one of four depths, or delete it. Confirmation happens in its own window, with the word typed out.'),
      el('li', null, el('b', null, 'Licence'), ' — this page’s neighbour says plainly who may use the application under CC BY-NC 4.0 and whose situation needs a commercial licence.'),
      el('li', null, el('b', null, 'Keys'), ' — one list of every API key stored on this computer, each removable, in Settings → Feed sources & keys.')),
    el('p', 'note', 'Beta ' + VERSION + ' — proof of concept. Earlier releases are listed in CHANGELOG.md in the application folder.')));
}
