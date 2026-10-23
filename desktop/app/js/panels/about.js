/* About (1.5.6; 1.5.7; 1.5.8; licence page revised after 1.7.0) — three pages: the creator and the project,
   the licence in plain terms, and the versions with the engine check.

   The licence page is not a copy of the licence (the licences folder ships the Commercial and
   Educational Licences in full). It answers the question people actually have — may I use this, and
   which licence does my situation need — and says plainly which situations do.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';
import { el, card, banner, kpi, pill } from '../util.js';
import { HS, probe } from '../helper.js';
import { tr } from '../i18n.js';
import { VERSION as APP_VERSION, CHANNEL, SERIES, WRITER_VERSION } from '../version.js';
import * as UPUI from '../updateui.js';

export const VERSION = APP_VERSION;          // one source of truth: js/version.js
export const REPO = 'https://github.com/ITriskMgr/CyberRiskGuardian';
export const SITE = 'https://www.leger.ca';
const a = (href, text) => el('a', { href, target: '_blank', rel: 'noopener noreferrer' }, text || href);

export const EMAIL = 'marcandre@leger.ca';
/** Licences, quotes and sales (1.8.0: the product's own address, as in the book's appendix). */
export const SALES = 'sales@cyberriskguardian.ca';
export const LICENCE_URL = 'https://creativecommons.org/licenses/by-nc/4.0/';
export const LICENCE_CODE = 'https://creativecommons.org/licenses/by-nc/4.0/legalcode';

let view = 'about';

export function render(sec, arg) {
  if (arg && ['about', 'licence', 'versions'].includes(arg)) view = arg;
  if (HS.helper === undefined) probe().then(() => render(sec)).catch(() => {});
  sec.replaceChildren(
    el('div', 'about-head', el('img', { src: 'icons/icon-192.png', alt: '', width: 72, height: 72 }),
      el('div', null, el('h1', null, 'CyberRiskGuardian'), el('div', 'lede', { style: { margin: 0 } }, 'with Threat Intel features — desktop edition'),
        el('div', 'row', { style: { gap: '6px', marginTop: '6px' } }, pill('Beta ' + VERSION, 'warn'), pill('Proprietary licence', '')))));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['about', 'About'], ['licence', 'Licence'], ['versions', 'Versions']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ about, licence, versions }[view])(body, sec);
}

/* ---------------- licence ---------------- */

/* Licence page (next build after 1.7.0). From the build after 1.7.0, CyberRiskGuardian Desktop is
   proprietary: free for students and non-profit organisations, an Educational Licence for colleges and
   universities, a Commercial Licence for everyone else. Versions up to 1.7.0 stay under CC BY-NC 4.0,
   and the method, the Core plugin and the governance textbook stay free under CC BY-NC 4.0. */
export const PRODUCT_PAGE = 'https://cyberriskguardian.ca';
export const LICENCE_FILES = [
  ['Commercial Licence (English)', 'licences/CyberRiskGuardian-Commercial-Licence-EN.pdf'],
  ['Licence commerciale (français)', 'licences/CyberRiskGuardian-Licence-commerciale-FR.pdf'],
  ['Educational Licence (English)', 'licences/CyberRiskGuardian-Educational-Licence-EN.pdf'],
  ['Licence éducative (français)', 'licences/CyberRiskGuardian-Licence-educative-FR.pdf'],
];

/** Who may use the application free, and who needs which licence. Plain situations, not categories. */
export const ALLOWED = [
  ['Students, for personal learning', 'A student using the application to learn the method, do an assignment or work a case study — including handing in the result for a grade. Individual use by the student, not deployment by the school.'],
  ['Non-profit organisations', 'Registered charities and not-for-profit corporations assessing their own cyber risk. Colleges, universities and government bodies are not included.'],
  ['Evaluation, for up to 30 days', 'Any organization may install it and try it for no more than 30 days to decide whether to license it. Beyond that, or in production, a licence is required — whichever comes first.'],
];
export const NEEDS_LICENCE = [
  ['Colleges, CEGEPs and universities', 'The Educational Licence (Educational edition), at a significantly reduced price that includes installation and customization, the current desktop application and the Educator Edition of the teaching materials. The students in the courses are covered by it.'],
  ['Businesses, consultants and MSSPs', 'The Commercial Licence (Professional editions): Professional (one consultant or analyst), Team (up to 10 users), Enterprise, or MSSP for providers assessing many clients.'],
  ['Government departments, agencies and Crown corporations', 'The Commercial Licence, at any level: municipal, provincial or state, federal or national.'],
  ['Anything embedded in a product or a paid service', 'Hosting it for clients, bundling it, reselling it, or building a service on it needs a Commercial Licence (MSSP or negotiated terms).'],
];

function licence(body) {
  body.append(banner('warn', 'This is a summary, not the licence',
    'What follows explains who may use the application and which licence applies. The licence itself is the CyberRiskGuardian Commercial Licence or Educational Licence, in French and English, shipped in the licences folder and published on the product page. Where the two differ, the licence governs. This is not legal advice.'));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'CyberRiskGuardian Desktop licence'),
    el('p', null, 'CyberRiskGuardian Desktop is proprietary software, © 2026 Marc-André Léger. It is licensed, not sold.'),
    el('p', null, 'Versions released before this change were licensed under Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0) and remain available under that licence. The Community Edition — the CyberRiskGuardian method, the Core plugin for Claude, the governance textbook skill, the MediBec example and the free teaching package — remains free under CC BY-NC 4.0.'),
    el('ul', null,
      ...LICENCE_FILES.map(([t, f]) => el('li', null, a(f, t))),
      el('li', null, 'Product page, tiers and prices: ', a(PRODUCT_PAGE, 'cyberriskguardian.ca'))),
    el('p', 'small muted', 'A licence carries no warranty beyond what it states: the application is a decision-support tool and a beta version. Validate every result before it supports a real decision.')));

  body.append(el('div', 'grid g2',
    card(el('h2', { style: { marginTop: 0 } }, 'Free'),
      ...ALLOWED.flatMap(([h, t]) => [el('p', null, el('b', null, h)), el('p', 'small muted', { style: { marginTop: '-4px' } }, t)])),
    card(el('h2', { style: { marginTop: 0 } }, 'Needs a licence'),
      ...NEEDS_LICENCE.flatMap(([h, t]) => [el('p', null, el('b', null, h)), el('p', 'small muted', { style: { marginTop: '-4px' } }, t)]))));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Evaluation: 30 days'),
    el('p', null, 'An organization that would need a licence may still install the application and try it, for no more than 30 days from first use, to decide whether to license it. Within those 30 days it may be used on real data for the purpose of evaluating it. It may not be used to deliver an assessment to a client, to support a decision outside the evaluation, or in teaching.'),
    el('p', 'note', 'Beyond 30 days, or for any of the uses listed as needing a licence, choose a licence on the product page or write to the author.')));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Getting a licence'),
    el('p', null, 'Professional and Team licences can be bought online on the product page; payment is handled by Paddle, our reseller and merchant of record. Educational, Enterprise and MSSP licences are on quote: write with your institution or organization, the number of users and how you intend to use the application.'),
    el('ul', null,
      el('li', null, 'Product page: ', a(PRODUCT_PAGE, 'cyberriskguardian.ca')),
      el('li', null, 'E-mail: ', el('a', { href: 'mailto:' + SALES }, SALES)),
      el('li', null, 'LinkedIn: ', a('https://www.linkedin.com/in/itriskmgr', 'linkedin.com/in/itriskmgr')))));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'How to credit it'),
    el('p', 'mono small', 'CyberRiskGuardian Desktop by Marc-André Léger, cyberriskguardian.ca'),
    el('p', null, `In a report produced with it, naming the method and its version is usually enough: “Assessed with the CyberRiskGuardian method (Léger), CyberRiskGuardian Desktop ${VERSION} beta.”`),
    el('p', 'small muted', 'Third-party material inside the application — the CVSS v4.0 reference tables, MITRE ATT&CK, CAPEC and CWE, the NIST catalogues, the control identifiers of ISO/IEC and CIS, the CISA KEV catalogue and the FIRST EPSS scores — carries its own terms, listed in NOTICE.md. Those terms are not changed by this licence.')));
}

/* ---------------- about ---------------- */

function about(body) {
  body.append(banner('warn', 'Beta ' + SERIES, 'This beta demonstrates the CyberRiskGuardian method and its tooling. It is not a certified product. Results are relative decision-support indicators; validate them before they support a real decision.'));

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
        el('li', null, 'Licence: proprietary — free for students and non-profit organisations; see the Licence page'),
        el('li', null, 'Product site: ', a(PRODUCT_PAGE, 'cyberriskguardian.ca'), ' · ', el('a', { href: 'mailto:' + SALES }, SALES)),
        el('li', null, 'Community Edition (the method, the Core plugin and the governance textbook skill): CC BY-NC 4.0, ', a(REPO, 'github.com/ITriskMgr/CyberRiskGuardian'))),
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
    el('div', 'grid g5',
      kpi('Application', VERSION + ' ' + CHANNEL, 'Beta ' + SERIES),
      kpi('Security Policy Writer', WRITER_VERSION + ' ' + CHANNEL, HS.helper?.writer ? tr('engine {0} in the helper').replace('{0}', HS.helper.writer) : tr('engine in the helper — not running'), HS.helper?.writer === WRITER_VERSION ? 'good' : 'warn'),
      kpi('Engine', eng.replace(/^engine /, '') || '—', 'crg.js · cvss4.js', /verified|vérifié/.test(eng) ? 'good' : 'warn'),
      kpi('Local helper', HS.helper?.helper || 'not running', HS.helper ? 'serve.py' : 'start with the launcher'),
      kpi('Knowledge base', (self.CRG_KB?.meta?.attack?.version || 'ATT&CK'), 'CAPEC · CWE')),
    el('p', 'small muted', 'The application version comes from one place in the source (js/version.js). The build fails if the helper, the offline cache and this page disagree, so what this screen says is what you are running.')));
  body.append(UPUI.versionsCard());

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'What the application covers'),
    el('ul', null,
      el('li', null, el('b', null, 'Risk assessment'), ' — organization context, information assets, scenarios, the verified risk calculation, mitigation, recommendations, KRIs and budget.'),
      el('li', null, el('b', null, 'Threats and vulnerabilities'), ' — ATT&CK, CVE/CWE, threat feeds, the KEV/EPSS threat context and the CyberRiskGuardian Ontology (CRGO).'),
      el('li', null, el('b', null, 'Governance'), ' — information security management, security policies (ISP), cybersecurity management, frameworks and standards, shared registers and quality review.'),
      el('li', null, el('b', null, 'Compliance management'), ' — obligations and their applicability, compliance determinations backed by evidence, programmes, campaigns, the regulatory calendar and submissions.'),
      el('li', null, el('b', null, 'Audit management'), ' — charter, audit universe, risk-based plan, engagements, workpapers, findings, recommendations and verified follow-up.'),
      el('li', null, el('b', null, 'Security operations'), ' — SIEM (telemetry, detection rules, coverage, alerts) and SOAR (cases, playbooks, approvals, simulation), local and without live connectors.')),
    el('p', 'note', 'Beta ' + SERIES + '. Validate every result before it supports a real decision.')));
}
