/* process.js — the nineteen steps of a complete CyberRiskGuardian risk assessment, then the management
   report and the quality review (book v2.51, ch06).
   Shared by the Process page, the help chatbot and the RACI matrix of multi-user mode: each step
   names the screens where it is done, so rights are granted per step and every screen knows which
   step it belongs to. Status is computed from the workspace by transparent rules.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute, vectorState, initiatives, commitments } from './state.js';
import { tr } from './i18n.js';
import * as SCR from './screening.js';
import * as EQ from './equiv.js';
import * as MK from './markers.js';

const v = (s, k) => s.params?.[k];
const filled = x => Array.isArray(x) ? x.length > 0 : x !== undefined && x !== null && String(x).trim() !== '' && x !== 0;

/** id, n, group, title, purpose, inputs, done-when, screens (route + label), tips.
    The nineteen numbered steps of the book (ch06, "The steps of a CRG assessment") in seven groups,
    then the management report and the quality review. Step ids are what the RACI matrix is keyed on:
    the ids of earlier releases are kept where the step kept its meaning, and a new step inherits the
    rights of the step it came from (users.js INHERIT). */
const scenInc = ws => ws.assessment.SCEN.filter(s => !(ws.excluded || []).includes(s.id));
const cands = ws => ws.assessment.CANDIDATES || [];
export const GROUPS = [
  ['context', 'Steps 1 to 3: evidence, context and scope'], ['appetite', 'Step 4: risk appetite and materiality'],
  ['scenarios', 'Steps 5 to 8: scenarios'], ['quant', 'Steps 9 to 11: quantification'], ['treatment', 'Steps 12 to 14: treatment'],
  ['money', 'Steps 15 to 18: robustness, priorities and money'], ['close', 'Step 19 and closing: monitoring and reporting'],
];
/** 1.9.2 review (M3, X-5): a scenario decision is recorded when it has an option, a named decision-maker and, for a transfer, a named approver. */
export const decisionNamed = d => !!(d && d.option && String(d.by || '').trim() && (d.option !== 'Transfer' || String(d.approver || '').trim()));

export const STEPS = [
  { id: 'setup', n: 1, g: 'context', title: 'Build the evidence register',
    purpose: 'One workspace per organization or business case, its documents, and the evidence register: every source numbered E1, E2… and typed as documented, exercise, SME input or external.',
    inputs: 'Organizational documents and evidence; the business case in a course.',
    done: 'The workspace has an organization name, at least one context document and at least one entry in the evidence register.',
    screens: [['evidence', 'Evidence register'], ['org/docs', 'Context documents'], ['org/import', 'Import from documents'], ['org/workspaces', 'Workspaces']],
    parts: ws => [
      { what: 'The workspace has an organization name', ok: filled(ws.org.name), fix: ['org/workspaces', 'Workspaces'] },
      { what: 'At least one context document', ok: ws.docs.length > 0, fix: ['org/docs', 'Context documents'],
        hint: 'A document is what the extractions read. Without one, every value is typed by hand.' },
      { what: 'The evidence register has at least one entry', ok: (ws.assessment.EVIDENCE || []).length > 0, fix: ['evidence', 'Evidence register'],
        hint: 'Exercise or simulation material is indicative evidence to validate, never a confirmed incident.' },
      ...importPlan(ws).map(id => ({ what: tr('Reviewed: {0}').replace('{0}', tr(importLabel(id))), ok: new Set((ws.importLog || []).map(e => e.section)).has(id), fix: ['org/import', 'Import from documents'], optional: true })),
    ],
    tips: ['Organization → Import from documents pre-fills assets, BIA, third parties, controls, compliance, incidents, weaknesses, scenarios, evidence, risks, budget, KRIs, roles and the classroom setting — each proposal reviewed and tagged.', 'Drop all the documents of the case when you create the workspace, and tick “Extract the profile and crown jewels”.', 'Instructor, template or benchmark values are calibration aids, not organizational evidence.'],
    status(ws) { const k = [filled(ws.org.name), ws.docs.length > 0, (ws.assessment.EVIDENCE || []).length > 0]; return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
  { id: 'context', n: 2, g: 'context', title: 'Describe the context and identify the crown jewels',
    purpose: 'Mission, services, processes, systems, obligations and existing controls; the crown jewels with their owners, confidentiality, integrity and availability requirements and their dependencies.',
    inputs: 'Context documents, management statements, inventories.',
    done: 'At least 8 of the 12 context fields are filled, and there are at least 3 crown jewels or 5 information assets.',
    screens: [['org/profile', 'Profile & appetite'], ['org/crown', 'Crown jewels'], ['assets', 'Information assets'], ['safeguards', 'Existing safeguards'], ['maturity', 'Maturity & resilience']],
    parts: ws => { const n = CTX.filter(k => filled(ws.org[k])).length, C = ws.assessment.CROWN || [], c = C.length, a = (ws.assets || []).length, inc = C.filter(r => !crownComplete(r));
      return [{ what: 'At least 8 of the 12 context fields', ok: n >= 8, fix: ['org/profile', 'Profile & appetite'], hint: `${n} of 12.` },
        { what: 'At least 3 crown jewels or 5 information assets', ok: c >= 3 || a >= 5, fix: ['org/crown', 'Crown jewels'] },
        // 1.9.2 (NV-035) — the book's crown jewel names its owner and its confidentiality, integrity and availability requirements
        { what: 'Every crown jewel names its owner and its C/I/A requirements', ok: c > 0 && !inc.length, fix: ['org/crown', 'Crown jewels'], hint: inc.length ? tr('{0} without an owner or a C/I/A rating: {1}.').replace('{0}', inc.length).replace('{1}', inc.map(r => r[0]).slice(0, 6).join(', ')) : c ? '' : tr('No crown jewel yet.') }]; },
    tips: ['Use “Extract from documents” to propose every field, then accept or edit each one and Save.', 'Where a topic has no evidence, write “Information gap — organizational validation required” rather than filling it in.', 'Existing safeguards records the controls already in force — the context the assessment needs for θ and for the budget baseline. It is not the treatment plan.'],
    status(ws) { const n = CTX.filter(k => filled(ws.org[k])).length, C = ws.assessment.CROWN || [], c = C.length, a = (ws.assets || []).length;
      const k = [n >= 8, c >= 3 || a >= 5, c > 0 && C.every(crownComplete)]; return k.every(Boolean) ? 'done' : (n >= 2 || c + a > 0) ? 'partial' : 'todo'; } },
  { id: 'scope', n: 3, g: 'context', title: 'Define the scope, the horizon and the threat context',
    purpose: 'What is covered and excluded, the risk perspectives, one 12-month horizon for every estimate, and the dated threat context (ATT&CK, CVE/CWE, KEV/EPSS) the estimates may use.',
    inputs: 'The context, threat feeds, a KEV/EPSS snapshot, scanner exports.',
    done: 'The scope, the exclusions and the risk perspectives are written, the assessment period is stated, a threat-context snapshot is loaded and the vulnerability register holds at least one entry.',
    screens: [['org/profile', 'Profile & appetite'], ['threat', 'Threat context'], ['vulns', 'Vulnerabilities · CVE/CWE'], ['threats', 'Threats · ATT&CK'], ['feeds', 'Threat feeds & social']],
    parts: ws => [
      // 1.9.2 (NV-035) — the book's step 3: what is covered, what is left out, and the perspectives (operational, financial, regulatory…)
      { what: 'The scope is written (what the assessment covers)', ok: filled(ws.org.scope), fix: ['org/profile', 'Profile & appetite'], hint: 'Profile & appetite → Scope, exclusions and perspectives.' },
      { what: 'The exclusions are written (or “none”)', ok: filled(ws.org.exclusions), fix: ['org/profile', 'Profile & appetite'], hint: 'What is deliberately left out, and why; write “none” when nothing is.' },
      { what: 'The risk perspectives are named', ok: filled(ws.org.perspectives), fix: ['org/profile', 'Profile & appetite'], hint: 'Operational, financial, regulatory, reputational, privacy, safety…' },
      { what: 'The assessment period (horizon) is stated', ok: filled(ws.assessment.PERIOD), fix: ['org/profile', 'Profile & appetite'], hint: 'Normally the next 12 months.' },
      { what: 'A threat-context snapshot is loaded', ok: !!ws.snapshot, fix: ['threat', 'Threat context'],
        hint: 'The bundled example works offline; your own snapshot or a KEV + EPSS download is better when you can get one.' },
      { what: 'The vulnerability register holds at least one entry', ok: (ws.vulns || []).length > 0, fix: ['vulns', 'Vulnerabilities · CVE/CWE'],
        hint: 'A CVE, or a named weakness with no CVE. Confirmed exposure is not required to finish this step — it is required before any score moves.' },
    ],
    tips: ['Threat context → “Load the bundled example” needs no network at all: it carries the CISA KEV catalogue of its build date and an EPSS table pruned at the ladder’s rung-1 ceiling.',
      'With network: Vulnerabilities → Online sources downloads KEV and EPSS through the helper, then Threat context builds a snapshot from them.',
      'Feed items never change a score: they inform the analyst.'],
    status(ws) { const k = [filled(ws.org.scope), filled(ws.org.exclusions), filled(ws.org.perspectives), filled(ws.assessment.PERIOD), !!ws.snapshot, (ws.vulns || []).length > 0]; return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
  { id: 'appetite', n: 4, g: 'appetite', title: 'Set the risk appetite and the materiality criteria',
    purpose: 'The approved appetite, or an estimate on the CyberRiskGuardian anchors labelled as such, and the materiality criteria it implies for scenario selection.',
    inputs: 'Management statements, regulation, the IT budget.',
    done: 'The appetite is strictly between 0 and 1 with a rationale, the IT budget is entered and the materiality criteria are written.',
    screens: [['org/profile', 'Profile & appetite'], ['budget', 'Budget']],
    parts: ws => { const ap = Number(ws.assessment.APPETITE);
      return [{ what: 'The appetite has a value and a rationale', ok: ap > 0 && ap < 1 && filled(ws.appetite_rationale), fix: ['org/profile', 'Profile & appetite'] },
        { what: 'The total IT budget is entered', ok: Number(ws.budget?.it_budget) > 0, fix: ['org/profile', 'Profile & appetite'] },
        { what: 'The materiality criteria are written', ok: filled(ws.org.materiality), fix: ['org/profile', 'Profile & appetite'], hint: 'Which consequences matter enough to justify a scenario.' }]; },
    tips: ['When management has not approved an appetite, the “Appetite estimator” proposes one: Analytical estimate — validation required, and Management decision required.', 'A health, public-safety or critical-infrastructure organization rarely justifies more than 0.3.'],
    status(ws) { const ap = Number(ws.assessment.APPETITE); const k = [ap > 0 && ap < 1 && filled(ws.appetite_rationale), Number(ws.budget?.it_budget) > 0, filled(ws.org.materiality)];
      return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
  { id: 'generate', n: 5, g: 'scenarios', title: 'Generate candidate scenarios',
    purpose: 'Build a list of at least 20 candidate scenarios in Scenario screening. Write them there, or generate them in Batch scenarios and send the ticked rows. Scenarios already in the register count only once you add them as candidates. One-sentence causal chains from at least three of the five strategies: top-down, bottom-up, threat-driven, dependency-driven and localized generic.',
    inputs: 'Steps 1–4, threat intelligence, scenario libraries, the ontology, the register.',
    done: 'At least 20 candidate scenarios in Scenario screening (distinct; about 25 to 40 for a portfolio of ten; 20 is the quick lab version). Rows in the Batch grid and scenarios in the register count only once they are candidates.',
    screens: [['batch', 'Batch scenarios'], ['screening', 'Scenario screening'], ['ontology', 'Ontology · CRGO']],
    parts: ws => { const n = SCR.distinctCount(ws), all = cands(ws).length, grid = (ws.batchDraft || []).length;
      return [{ what: '20 candidates in Scenario screening', ok: n >= 20, fix: n ? ['screening', 'Scenario screening'] : ['batch', 'Batch scenarios'],
        hint: tr('{0} now').replace('{0}', n) + (all > n ? ' ' + tr('({0} rows, {1} duplicates not counted)').replace('{0}', all).replace('{1}', all - n) : '') + (grid ? ' · ' + tr('{0} row(s) wait in the Batch grid: tick them and “Add the ticked rows as screening candidates”.').replace('{0}', grid) : '') + '.',
        // 1.9.2 (C4) — the three ways, in order, each with its screen (the Process page draws them as buttons)
        ways: [['batch', 'Batch scenarios', tr('Generate or write rows, then “Add the ticked rows as screening candidates”')], ['screening', 'Scenario screening', tr('“Add a candidate”, then its chain and scores on the card')], ['screening', 'Add scenarios from the register as candidates', tr('Scenario screening → “Add scenarios from the register as candidates”')]] }]; },
    tips: ['Top-down: start from the mission and the crown jewels — what would hurt the organization most?', 'Bottom-up: start from the inventory — which asset, system or process could fail or be attacked?', 'Threat-driven: start from the threat landscape — which actors and techniques target this sector (ATT&CK, KEV, feeds)?', 'Dependency-driven: start from the suppliers, platforms and single points of failure the organization relies on.', 'Localized generic: start from a generic library (patterns, CRGO, the register of another case) and localize each item to this organization.', 'Batch scenarios builds the rows (threat patterns × assets, AI, ATT&CK, CVE, CWE, SIEM & SOAR, CSV); “Add the ticked rows as screening candidates” makes them candidates — the grid itself counts for nothing.', 'The count is of distinct candidates: a row identical to an existing candidate (same name, source and assets) is skipped when added, and duplicates in the list are counted once.', 'Variants of one exposure are expected: they are consolidated into families in step 7, not suppressed now.'],
    status(ws) { const n = SCR.distinctCount(ws); return n >= 20 ? 'done' : n > 0 || (ws.batchDraft || []).length ? 'partial' : 'todo'; } },
  { id: 'screen', n: 6, g: 'scenarios', title: 'Screen the candidates',
    purpose: 'Every candidate scored 1 to 5 on twelve criteria with a rationale (total out of 60, a screening aid), mandatory escalation flags, a selection confidence and a disposition.',
    inputs: 'The candidates and the evidence register.',
    done: 'Every candidate has its twelve scores and a disposition.',
    screens: [['screening', 'Scenario screening']],
    parts: ws => { const n = cands(ws).length, sc = SCR.scoredCount(ws), dp = SCR.dispositionCount(ws); return [
      { what: 'Every candidate has its twelve scores', ok: n > 0 && sc === n, fix: ['screening', 'Scenario screening'], hint: `${sc} of ${n}. ` + tr('Scores proposed by AI count once you have accepted them. Candidates & scores → Score opens the card: twelve scores, a rationale, the flags and a disposition. “Estimate with AI” drafts them for review.') },
      { what: 'Every candidate has a disposition', ok: n > 0 && dp === n, fix: ['screening', 'Scenario screening'], hint: `${dp} of ${n}. ` + tr('The disposition stays your decision, also for AI-scored candidates: Select, Consolidate (a duplicate gets Consolidate), Consider (explicit review) or Defer.') }]; },
    tips: ['Candidates & scores → Score: twelve criteria 1 (very low) to 5 (very high), a one-line rationale, the escalation flags, the selection confidence and a disposition — Select, Consolidate (a variant of another candidate), Consider (explicit review) or Defer.', '“Estimate with AI” drafts the scores of one candidate, “Estimate all unscored” the whole list; proposals count only once you accept them, and evidence strength above 2 needs a cited evidence ID.', 'Escalation flags protect severe but improbable scenarios: excluding a flagged scenario is a management decision.', 'Do not rank on CVSS.'],
    status(ws) { const n = cands(ws).length, sc = SCR.scoredCount(ws), dp = SCR.dispositionCount(ws); return n && sc === n && dp === n ? 'done' : sc > 0 || dp > 0 ? 'partial' : 'todo'; } },
  { id: 'select', n: 7, g: 'scenarios', title: 'Select the most material scenarios',
    purpose: 'Variants consolidated into families, the selection tested under four weighting schemes, a coverage matrix, a watch list with promotion triggers — and the final portfolio, normally ten.',
    inputs: 'The screened candidates.',
    done: 'At least one family is selected, every judgment-based selection has its rationale, and every flagged exclusion is reviewed.',
    screens: [['screening/families', 'Families'], ['screening/weights', 'Weighting schemes'], ['screening/coverage', 'Coverage matrix'], ['screening/final', 'Final portfolio']],
    parts: ws => { const a = SCR.analysis(ws);
      return [{ what: 'Families are selected for the portfolio', ok: a.selected.length > 0, fix: ['screening/families', 'Families'], hint: `${a.selected.length} selected (normally ten). ` + tr('Families → Add a family, then assign its members from each candidate’s score card (Family); a candidate selected on its own needs no family.') },
        { what: 'Every selection by judgment has a rationale', ok: a.judgmentMissing.length === 0, fix: ['screening/weights', 'Weighting schemes'] },
        { what: 'Every flagged candidate left out is reviewed', ok: a.flaggedUnreviewed.length === 0, fix: ['screening/watch', 'Watch list & plan'] }]; },
    tips: ['Families → Add a family, then assign members from each candidate’s card (Family); Weighting schemes shows the rank of each family under four schemes and marks selections by judgment; Coverage matrix tests for blind spots; Watch list keeps the strongest candidates left out.', 'The final ten are chosen for materiality, coverage and decision usefulness — not as the ten highest totals.'],
    status(ws) { const a = SCR.analysis(ws); if (!a.selected.length) return a.scored ? 'partial' : 'todo'; return a.judgmentMissing.length || a.flaggedUnreviewed.length ? 'partial' : 'done'; } },
  { id: 'scenarios', n: 8, g: 'scenarios', title: 'Develop each selected scenario as a causal chain',
    purpose: 'Threat source → vulnerability → asset or process → event → consequence, with stakeholders, existing controls, the event sequence and the major assumptions.',
    inputs: 'Steps 5–7.',
    done: 'At least 10 scenarios in the register, and every included scenario is a complete causal chain: statement, threat source, initiating event, vulnerabilities, affected assets and consequences — with its stakeholders, existing controls and event sequence.',
    screens: [['register', 'Scenario register'], ['scenario', 'Scenario editor'], ['vulns/links', 'Suggest vulnerability links']],
    parts: ws => { const n = ws.assessment.SCEN.length, inc = scenInc(ws), ch = inc.filter(chainOk).length, full = inc.filter(chainFull), miss = inc.filter(s => !chainFull(s));
      return [{ what: 'At least 10 scenarios in the register', ok: n >= 10, fix: ['register', 'Scenario register'] },
        { what: 'Every included scenario is a complete causal chain', ok: inc.length > 0 && ch === inc.length, fix: ['scenario', 'Scenario editor'], hint: `${ch} of ${inc.length}.` },
        // 1.9.2 (NV-035) — the book's chain: initiating event and consequences too, then stakeholders, existing controls and the sequence
        { what: 'Every included scenario names its initiating event and its consequences', ok: inc.length > 0 && full.length === inc.length, fix: ['scenario', 'Scenario editor'], hint: miss.length ? miss.slice(0, 6).map(s => s.id + ' (' + chainMissing(s).join(', ') + ')').join('; ') : '' },
        { what: 'Stakeholders, existing controls and the event sequence are recorded', ok: inc.length > 0 && inc.every(chainRich), fix: ['scenario', 'Scenario editor'], optional: true, hint: inc.filter(s => !chainRich(s)).slice(0, 6).map(s => s.id).join(', ') }]; },
    tips: ['A scenario names a causal chain, not just “ransomware”.', 'Vulnerabilities → Suggest links: run the rules (no AI), optionally ask AI, then accept the links that hold.'],
    status(ws) { const n = ws.assessment.SCEN.length, inc = scenInc(ws), ch = inc.filter(chainOk).length; return n >= 10 && inc.length && ch === inc.length && inc.every(chainFull) ? 'done' : n > 0 ? 'partial' : 'todo'; } },
  { id: 'quantify', n: 9, g: 'quant', title: 'Estimate the six parameters',
    purpose: 'Pb(A), Pb(ψ,A), δe, δm, θ and μ(E), each with a rationale, the evidence and a confidence level (High, Medium, Low).',
    inputs: 'Evidence register, threat context, the organization’s controls.',
    done: '80% of the parameters of the included scenarios are estimated: a rationale that is not the placeholder, the evidence it rests on and a confidence level.',
    screens: [['scenario', 'Scenario editor'], ['forecast', 'Forecasts']],
    parts: ws => { const q = quantified(ws);
      return [{ what: '80% of the six parameters estimated (rationale, evidence, confidence)', ok: q.all > 0 && q.ok / q.all >= 0.8, fix: ['scenario', 'Scenario editor'],
        hint: q.all ? `${q.ok} of ${q.all}. ` + (q.placeholders ? tr('{0} parameter(s) still carry the placeholder written at creation: they do not count.').replace('{0}', q.placeholders) + ' ' : '') + tr('A parameter counts when its rationale is written, its evidence (E1, E2…) is named and its confidence is set.') : tr('Nothing is included in the portfolio yet.') }]; },
    tips: ['Use Low / Medium / High confidence honestly: Forecasts turns it into ranges.', 'Pb(A) and Pb(ψ,A) are estimated separately; δm is at least δe.', 'A scenario created from a candidate keeps the candidate’s starting values: they are a starting point until you write the rationale and the evidence.'],
    status(ws) { const q = quantified(ws); if (!q.all) return 'todo'; return q.ok / q.all >= 0.8 ? 'done' : q.ok > 0 ? 'partial' : 'todo'; } },
  { id: 'cvss', n: 10, g: 'quant', title: 'Score the representative weakness with CVSS v4.0',
    purpose: 'CVSS-B (Base metrics only) for each scenario; a non-technical weakness is scored by equivalency, every metric justified and the score labelled “limited applicability”.',
    inputs: 'Advisories, scanner output, the equivalency analysis.',
    done: 'Every included scenario has a valid CVSS score entered by the analyst (a vector, or a score by equivalency) — not the vector the scenario was created with — and every score by equivalency has all its justifications.',
    screens: [['cvss', 'CVSS v4.0'], ['scenario', 'Scenario editor']],
    parts: ws => { const inc = scenInc(ws), bad = inc.filter(s => { try { CRG.cvssOf(s); return false; } catch { return true; } }), eq = inc.filter(s => EQ.isEquiv(s) && EQ.gaps(s).length);
      const def = inc.filter(s => vectorState(s) === 'default'), pat = inc.filter(s => vectorState(s) === 'pattern'), sco = inc.filter(s => vectorState(s) === 'score');
      return [{ what: 'Every included scenario has a CVSS score', ok: inc.length > 0 && !bad.length, fix: ['scenario', 'Scenario editor'], hint: bad.length ? bad.map(s => s.id).join(', ') : '' },
        { what: 'Every vector was entered by the analyst, not left at the default', ok: inc.length > 0 && !def.length, fix: ['scenario', 'Scenario editor'],
          hint: def.length ? def.map(s => s.id).join(', ') + ' — ' + tr('still the default vector of a new scenario: score the representative weakness (vector or equivalency) in the editor’s CVSS tab.') : '' },
        { what: 'Vectors that came with a pattern or a candidate are confirmed', ok: !pat.length, fix: ['scenario', 'Scenario editor'],
          hint: pat.length ? pat.map(s => s.id).join(', ') + ' — ' + tr('the vector of the pattern or candidate the scenario came from: confirm it here (one click, recorded) or change it in the editor’s CVSS tab (a changed vector counts as entered).') : '', confirm: pat.map(s => s.id) },
        // 1.9.2 review (H2) — a scenario created from a row that carried a score and no vector computes on that score
        { what: 'Scores that came without a vector (CVE register, ontology prior, registry or batch row) are confirmed', ok: !sco.length, fix: ['scenario', 'Scenario editor'],
          hint: sco.length ? sco.map(s => `${s.id} (${s.cvss_score})`).join(', ') + ' — ' + tr('the stored score of the row the scenario came from, used as is: confirm it here (one click, recorded) or enter the v4.0 Base vector of the actual weakness in the editor’s CVSS tab.') : '', confirm: sco.map(s => s.id) },
        { what: 'Every score by equivalency is justified metric by metric', ok: !eq.length, fix: ['cvss', 'CVSS v4.0'], hint: eq.map(s => s.id).join(', ') }]; },
    tips: ['CVSS is Base-only; exploitation evidence belongs in Pb(ψ,A).', 'CVSS is a multiplier, never a selection criterion.', 'A new scenario carries a default vector (9.3) so that it computes; it is not a score of anything until you replace it.'],
    status(ws) { const inc = scenInc(ws); if (!inc.length) return 'todo'; const bad = inc.filter(s => { try { CRG.cvssOf(s); return false; } catch { return true; } }).length, eq = inc.filter(s => EQ.isEquiv(s) && EQ.gaps(s).length).length, def = inc.filter(s => vectorState(s) !== 'entered').length;
      return !bad && !eq && !def ? 'done' : 'partial'; } },
  { id: 'evaluate', n: 11, g: 'quant', title: 'Calculate estimated and tolerated risk',
    purpose: 'Estimated and tolerated risk for every scenario with the verified engine; the pre-treatment ratio against tolerance.',
    inputs: 'Steps 9–10 and the appetite.',
    done: 'The included scenarios compute without error.',
    screens: [['calc', 'Risk calculator'], ['register', 'Scenario register']],
    parts: ws => { const R = compute(ws);
      return [{ what: 'The included scenarios compute without error', ok: R.inc.length > 0 && R.errors.length === 0, fix: ['calc', 'Risk calculator'],
        hint: R.errors.length ? `${R.errors.length} scenario(s) cannot be calculated yet.` : R.inc.length ? '' : 'Nothing is included in the portfolio yet.' }]; },
    tips: ['Ratio < 0.90 below tolerance, 0.90–1.10 approximately at it, > 1.10 above.', 'Risk indices are relative decision-support values, not dollars and not KRIs.'],
    status(ws) { const R = compute(ws); if (!R.inc.length) return 'todo'; return R.errors.length ? 'partial' : 'done'; } },
  { id: 'treat', n: 12, g: 'treatment', title: 'Design mitigation measures',
    purpose: 'Measures from recognized frameworks covering governance, prevention, detection, response, recovery and resilience, with cost and likelihood / impact reduction.',
    inputs: 'Scenarios above or near tolerance.',
    done: 'Every scenario above tolerance is covered by at least one measure.',
    screens: [['mitigation', 'Risk mitigation']],
    tips: ['Start from Proposals, then refine costs and effects.', 'Several measures on the same lever combine as 1 − ∏(1 − r): reductions never add up beyond 1.'],
    status(ws) { const R = compute(ws); const above = R.inc.filter(r => r.est / r.tol > CRG.BAND_HIGH); if (!above.length) return (ws.measures || []).length ? 'done' : 'todo';
      const cov = above.filter(r => (ws.measures || []).some(m => m.status !== 'rejected' && (m.scen || []).includes(r.id))).length;
      return cov === above.length ? 'done' : cov > 0 ? 'partial' : 'todo'; } },
  { id: 'shared', n: 13, g: 'treatment', title: 'Identify shared controls',
    purpose: 'Measures that reduce several scenarios, with their cost allocated once across the scenarios they address.',
    inputs: 'The measures and initiatives.',
    done: 'Every initiative addresses at least one scenario, so its cost is allocated without double-counting.',
    screens: [['recs/shared', 'Shared controls'], ['mitigation', 'Risk mitigation']],
    parts: ws => { const I = (ws.assessment.INITIATIVES || []), orphan = I.filter(i => !(i[3] || []).length), m = (ws.measures || []).filter(x => x.status !== 'rejected' && !x.initId).length;
      return [{ what: 'At least one initiative funds the measures', ok: I.length > 0, fix: ['recs/shared', 'Shared controls'],
          hint: I.length ? '' : m ? tr('No initiative yet. Shared controls → “Create initiatives from the measures ({0})”, or Risk mitigation → “→ Initiative” on a measure.').replace('{0}', m) : tr('Design the measures first (step 12); each becomes an initiative with “→ Initiative”.') },
        { what: 'Every initiative addresses at least one scenario', ok: I.length > 0 && !orphan.length, fix: ['recs/shared', 'Shared controls'], hint: orphan.length ? orphan.map(i => i[0]).join(', ') : '' }]; },
    tips: ['An initiative addressing several scenarios is split equally across the included ones: the same investment is never counted twice.'],
    status(ws) { const I = (ws.assessment.INITIATIVES || []); if (!I.length) return (ws.measures || []).length ? 'partial' : 'todo'; return I.every(i => (i[3] || []).length) ? 'done' : 'partial'; } },
  { id: 'residual', n: 14, g: 'treatment', title: 'Recalculate mitigated and residual risk',
    purpose: 'Mitigated and residual risk and the risk-to-tolerance ratio after treatment, compared with the tolerated risk for every scenario.',
    inputs: 'Steps 11–13.',
    done: 'Every included scenario above tolerance before treatment carries probability and impact reductions that come from its measures or from an explicit analyst entry — never the value a new scenario started with.',
    screens: [['mitigation', 'Risk mitigation'], ['calc', 'Risk calculator'], ['register', 'Scenario register']],
    parts: ws => { const R = compute(ws), need = R.inc.filter(r => r.pre_ratio > CRG.BAND_HIGH), ok = need.filter(r => reduced(r.s) && !underReview(r.s, ws)).length, rev = need.filter(r => underReview(r.s, ws)).map(r => r.id);
      return [{ what: 'Reductions are set where treatment is needed', ok: need.length === ok, fix: ['mitigation', 'Risk mitigation'], hint: `${ok} of ${need.length}. ` + (rev.length ? tr('{0} still on the earlier default 0.5 / 0.5 listed for review (D2): {1} — review them on the Process page or set their reductions. ').replace('{0}', rev.length).replace('{1}', rev.join(', ')) : '') + tr('Risk mitigation → “Apply to all covered scenarios” writes the measures’ combined reductions (1 − ∏(1 − r)) on each scenario, and records where they came from.') }]; },
    tips: ['Residual below tolerance (< 0.90) needs rp × ri > 1 − 0.90 × appetite ÷ average damage; a ratio of 1.0 or less needs rp × ri ≥ 1 − appetite ÷ average damage.', 'A new scenario starts at rp = ri = 0: its residual risk is its estimated risk until a measure or the analyst reduces it.'],
    status(ws) { const R = compute(ws); if (!R.inc.length) return 'todo'; const need = R.inc.filter(r => r.pre_ratio > CRG.BAND_HIGH); return need.every(r => reduced(r.s) && !underReview(r.s, ws)) ? 'done' : 'partial'; } },
  { id: 'sensitivity', n: 15, g: 'money', title: 'Run the sensitivity analysis',
    purpose: 'Lower, central and higher cases (±0.10) for the important or uncertain scenarios, and the decisions that change when the assumptions do.',
    inputs: 'The quantified scenarios and their confidence.',
    done: 'At least one scenario’s sensitivity is recorded as reviewed.',
    screens: [['calc', 'Risk calculator'], ['forecast', 'Forecasts']],
    tips: ['Risk calculator → load a scenario → “Record the sensitivity review”.', 'A classification that flips between the cases marks a recommendation as sensitive to its assumptions.'],
    status(ws) { const n = (ws.assessment.SENS_IDS || []).length; return n ? 'done' : 'todo'; } },
  { id: 'prioritize', n: 16, g: 'money', title: 'Prioritize scenarios and treatments',
    purpose: 'Priorities on several criteria — criticality, maximum consequences, legal and privacy obligations, safety, velocity, exposure, dependencies, cost, feasibility, time to benefit — and a management decision for every scenario.',
    inputs: 'Steps 11–15.',
    done: 'Every included scenario has a management decision recorded.',
    screens: [['recs/scenarios', 'Recommendations — By scenario'], ['riskreg', 'Risk register']],
    // 1.9.2 review (M3, X-5): a decision counts only when it names its decision-maker (and, for a transfer, its approver)
    parts: ws => { const R = compute(ws); const dec = R.inc.filter(r => decisionNamed(ws.decisions?.[r.id])).length, unnamed = R.inc.filter(r => ws.decisions?.[r.id]?.option && !decisionNamed(ws.decisions[r.id])).map(r => r.id);
      return [{ what: 'Every included scenario has a management decision by a named person', ok: R.inc.length > 0 && dec === R.inc.length, fix: ['recs/scenarios', 'Recommendations — By scenario'], hint: R.inc.length ? `${dec} of ${R.inc.length} recorded. ` + (unnamed.length ? tr('{0} recorded without a named decision-maker (or transfer approver): {1}. ').replace('{0}', unnamed.length).replace('{1}', unnamed.join(', ')) : '') + tr('Recommendations → By scenario: accept, transfer, avoid or mitigate, with the accountable owner — Management decision required.') : '' }]; },
    tips: ['Prioritization is a matter of judgment in every tool: the score is one input.', 'Accept, transfer, avoid or mitigate: Management decision required.'],
    status(ws) { const R = compute(ws); if (!R.inc.length) return 'todo'; const dec = R.inc.filter(r => decisionNamed(ws.decisions?.[r.id])).length; return dec === R.inc.length ? 'done' : dec ? 'partial' : 'todo'; } },
  { id: 'recommend', n: 17, g: 'money', title: 'Assemble the investment portfolio',
    purpose: 'The recommended portfolio, by horizon, with costs, owners and sequence, reviewed and formally approved by the accountable person.',
    inputs: 'Selected measures, priorities.',
    done: 'At least one recommendation is approved.',
    screens: [['recs', 'Recommendations'], ['riskreg', 'Risk register']],
    tips: ['Approval freezes the figures with the approver and date.', 'In multi-user mode only people with the Approve right (RACI “A”) can approve.'],
    status(ws) { const r = ws.recommendations || []; const ap = r.filter(x => ['approved', 'in-implementation', 'completed'].includes(x.status)).length; return ap ? 'done' : r.length ? 'partial' : 'todo'; } },
  { id: 'budget', n: 18, g: 'money', title: 'Calibrate the cybersecurity budget',
    purpose: 'Funding options against the appetite-consistent budget target (best practice: 12% / 7.8% / 4% of IT at appetite 0.30 / 0.50 / 0.70).',
    inputs: 'IT budget, current spend, baseline (run) cost, initiatives.',
    done: 'The budget year is filled (IT budget, baseline) and every initiative is allocated to the budget years with a cost.',
    screens: [['budget', 'Budget']],
    parts: ws => { const b = ws.budget || {}, I = initiatives(ws), un = I.filter(i => !(Number(i.initial) > 0 || Number(i.recurring) > 0));
      let per = {}; try { per = commitments(ws).per; } catch { /* no budget years yet */ }
      const years = Object.values(per).filter(v => v > 0).length;
      return [{ what: 'The total IT budget and the baseline cost are entered', ok: Number(b.it_budget) > 0 && Number(b.baseline) > 0, fix: ['budget', 'Budget'] },
        { what: 'At least one initiative', ok: I.length > 0, fix: ['budget', 'Budget'], hint: I.length ? '' : tr('Risk mitigation → “→ Initiative”, or Shared controls → “Create initiatives from the measures”.') },
        // 1.9.2 (NV-035) — allocation: every initiative carries a cost, and the commitments land in at least one budget year
        { what: 'Every initiative is allocated: a cost, committed to the budget years', ok: I.length > 0 && !un.length && years > 0, fix: ['budget', 'Budget'], hint: un.length ? tr('{0} initiative(s) without a cost: {1}.').replace('{0}', un.length).replace('{1}', un.slice(0, 6).map(i => i.id).join(', ')) : I.length && !years ? tr('No amount committed to a budget year yet (Budget → Initiatives allocated over the years).') : '' }]; },
    tips: ['Baseline = what keeps existing security running; new treatment is added to it.', 'A gap to the target is escalated, not reconciled silently.', 'Budget → “Initiatives allocated over the years” spreads each initiative over up to three years (automatic, by percentage or by amount).'],
    status(ws) { const b = ws.budget || {}, I = initiatives(ws); let years = 0; try { years = Object.values(commitments(ws).per).filter(v => v > 0).length; } catch { /* none */ }
      const k = [Number(b.it_budget) > 0, Number(b.baseline) > 0, I.length > 0, I.length > 0 && I.every(i => Number(i.initial) > 0 || Number(i.recurring) > 0) && years > 0]; return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
  { id: 'monitor', n: 19, g: 'close', title: 'Define key risk indicators',
    purpose: 'Measured indicators with an owner, a data source, a frequency, a target and warning and critical thresholds, recorded over time — not the computed risk indices.',
    inputs: 'Operational measurements.',
    done: 'At least one KRI is fully defined — the scenarios it addresses, its measurement method, data source, owner, frequency, target and thresholds — and at least one measurement is recorded.',
    screens: [['dashboard', 'KRI dashboard'], ['forecast', 'Forecasts']],
    parts: ws => { const K = ws.assessment.KRIS || [], full = K.filter(kriFull).length, h = (ws.kriHistory || []).length, partial = K.filter(k => !kriFull(k));
      return [{ what: 'At least one KRI with the scenarios addressed, the measurement method, source, owner, frequency, target and thresholds', ok: full > 0, fix: ['dashboard', 'KRI dashboard'],
          hint: partial.length ? tr('{0} KRI(s) incomplete: {1}.').replace('{0}', partial.length).replace('{1}', partial.map(k => k[0] + ' (' + kriMissing(k).join(', ') + ')').slice(0, 4).join('; ')) : '' },
        { what: 'At least one measurement is recorded', ok: h > 0, fix: ['dashboard', 'KRI dashboard'] }]; },
    tips: ['Record a measurement at every review; four readings allow a projection.', 'A KRI names the scenarios it watches and how it is measured: an indicator that cannot be tied to a scenario measures nothing of the assessment.'],
    status(ws) { const full = (ws.assessment.KRIS || []).filter(kriFull).length, h = (ws.kriHistory || []).length; return full && h ? 'done' : full || h ? 'partial' : 'todo'; } },
  { id: 'report', n: 'R', g: 'close', title: 'Management report, quality review and sharing',
    purpose: 'The management summary that obtains decisions, the independent quality review, the Excel workbook, the compliance statement, policies in force and anonymized risk cards for the shared Risk Registry.',
    inputs: 'Everything above.',
    done: 'The management summary has been exported and the quality review shows no failed check.',
    screens: [['summary', 'Management summary'], ['qc', 'Quality review'], ['export', 'Export · Excel'], ['compliance', 'Compliance management'], ['isp', 'ISP management'], ['registry/contribute', 'Risk Registry'], ['share', 'Publish & share']],
    parts: ws => { const f = qcFailed(ws);
      return [{ what: 'The management summary has been exported', ok: !!ws.mgmtSummary?.date, fix: ['summary', 'Management summary'] },
        { what: 'The quality review shows no failed check', ok: f !== null && f.length === 0, fix: ['qc', 'Quality review'], hint: f === null ? tr('Open Quality review to run the checks.') : f.length ? tr('Failed: {0}.').replace('{0}', f.join(', ')) : '' }]; },
    tips: ['Anonymize anything that leaves the organization — the Risk Registry does it by default.', 'Classroom deliverables are labelled fictional automatically.', 'The memo must agree with the workbook to the unit.'],
    status(ws) { const f = qcFailed(ws); if (ws.mgmtSummary?.date && f !== null && !f.length) return 'done'; return ws.mgmtSummary?.date || (ws.published || []).length || Object.keys(ws.compliance?.soa || {}).length ? 'partial' : 'todo'; } },
];
export const CTX = ['context', 'mission', 'services', 'processes', 'systems', 'cloud', 'suppliers', 'sensitive', 'availability', 'maturity', 'incidents', 'regulations'];
export const chainOk = s => filled(s.statement) && filled(s.threat_source) && filled(s.vulns) && filled(s.assets);
/** 1.9.2 (NV-035, step 8) — the book's chain adds the initiating event and the consequences; stakeholders, controls and the sequence complete it. */
const consequencesOk = s => (s.consequences && typeof s.consequences === 'object' && Object.values(s.consequences).some(v => filled(v))) || filled(s.consequence);
export const chainMissing = s => [[!filled(s.statement), 'statement'], [!filled(s.threat_source), 'threat source'], [!filled(s.threat_event), 'initiating event'], [!filled(s.vulns), 'vulnerabilities'], [!filled(s.assets), 'assets'], [!consequencesOk(s), 'consequences']].filter(x => x[0]).map(x => tr(x[1]));
export const chainFull = s => chainOk(s) && filled(s.threat_event) && consequencesOk(s);
export const chainRich = s => filled(s.stakeholders) && filled(s.controls) && filled(s.sequence);
/** 1.9.2 (NV-035, step 2) — a crown jewel row [id, name, role, owner, C, I, A, …] names its owner and its three ratings. */
export const crownComplete = r => Array.isArray(r) && filled(r[3]) && filled(r[4]) && filled(r[5]) && filled(r[6]);
/** 1.9.2 (NV-002, NV-035) — step 9: a parameter counts as estimated when its rationale is written and is not the placeholder
 *  the application wrote at creation, its evidence is named and its confidence is one of the three levels. */
export const paramEstimated = p => !!p && !MK.isPlaceholder(p.rat) && filled(p.ev) && ['High', 'Medium', 'Low'].includes(p.conf);
export function quantified(ws = S.ws) {
  const sc = scenInc(ws); let all = 0, ok = 0, placeholders = 0;
  for (const s of sc) for (const k of ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu']) { all++; const p = v(s, k); if (paramEstimated(p)) ok++; else if (MK.isPlaceholder(p?.rat) && filled(p?.rat)) placeholders++; }
  return { all, ok, placeholders, scenarios: sc.length };
}
/** 1.9.2 (NV-002) — step 14: reductions count when they come from the measures or from an explicit entry (red_source), or
 *  when both are above 0 (an entry, since a new scenario starts at 0 / 0). */
export const reduced = s => !!s.red_source || (Number(s.red_p) > 0 && Number(s.red_i) > 0);
/** 1.9.2 review (M4) — a scenario still on the D2 review list (untouched 0.5 / 0.5 of a migrated workspace) is not reduced
 *  until the review is marked done or its reductions change. No number changes. */
export function underReview(s, ws) {
  const rv = ws?.reductionReview;
  if (!rv || rv.reviewed || !(rv.scenarios || []).includes(s.id)) return false;
  return Number(s.red_p) === 0.5 && Number(s.red_i) === 0.5 && !s.red_source;
}
/** 1.9.2 (NV-035) — step 19: a KRI is complete with the scenarios it addresses (2), its measurement method (3), data source (4),
 *  owner (5), frequency (6), target (7) and the warning and critical thresholds (8, 9). */
const KRI_FIELDS = [[2, 'scenarios'], [3, 'measurement'], [4, 'data source'], [5, 'owner'], [6, 'frequency'], [7, 'target'], [8, 'warning threshold'], [9, 'critical threshold']];
export const kriMissing = k => KRI_FIELDS.filter(([i]) => !filled(k[i])).map(([, l]) => tr(l));
export const kriFull = k => KRI_FIELDS.every(([i]) => filled(k[i]));
/* 1.9.2 (NV-018) — the quality review registers its checks here (panels/qc.js), so the report step can require that none
   fails without this module importing the screen (which would be an import cycle through users.js). */
let qcChecker = null;
export function registerQc(fn) { qcChecker = fn; }
/** The ids of the failed quality checks, or null when the quality review is not available. */
export function qcFailed(ws = S.ws) {
  if (!qcChecker) return null;
  try { return qcChecker(ws).filter(c => c.state === 'fail').map(c => c.id); } catch (e) { console.warn('qc', e); return null; }
}
/** The rights a step added in 1.8.0 takes from the step it came from (users.js). */
export const INHERIT = { scope: 'threats', appetite: 'context', generate: 'scenarios', screen: 'scenarios', select: 'scenarios', cvss: 'quantify',
  shared: 'treat', residual: 'evaluate', sensitivity: 'evaluate', prioritize: 'recommend', import: 'assets' };
/* 1.5.7 — the import plan: the targets ticked on Organization → Import from documents. */
export const DEFAULT_IMPORT_PLAN = ['assets', 'controls', 'weaknesses', 'incidents', 'scenarios'];
export function importPlan(ws = S.ws) { return Array.isArray(ws?.importPlan) && ws.importPlan.length ? ws.importPlan : DEFAULT_IMPORT_PLAN; }
const IMPORT_LABELS = { profile: 'Profile & appetite', crown: 'Crown jewels' };
export function setImportLabels(map) { Object.assign(IMPORT_LABELS, map); }
const importLabel = id => IMPORT_LABELS[id] || id;

export const STEP = Object.fromEntries(STEPS.map(s => [s.id, s]));

/** The step a screen belongs to (for rights); org depends on its tab. */
export const PANEL_STEP = { org: 'context', dashboard: 'monitor', assets: 'context', safeguards: 'context', maturity: 'context', register: 'scenarios', scenario: 'quantify', batch: 'generate', calc: 'evaluate',
  riskreg: 'prioritize', mitigation: 'treat', recs: 'recommend', threats: 'scope', vulns: 'scope', feeds: 'scope', threat: 'scope', frameworks: 'report',
  compliance: 'report', share: 'report', ontology: 'generate', registry: 'report', isp: 'report', writer: 'report', isms: 'report', csm: 'treat', audit: 'report', qc: 'report', shared: 'report', iam: 'context', cm: 'context', siem: 'scope', soar: 'treat', cvss: 'cvss', budget: 'budget', export: 'report', forecast: 'sensitivity',
  evidence: 'setup', screening: 'screen', summary: 'report', ai: null, process: null, about: null, backup: '_admin', settings: '_admin' };
export function stepOf(panel, arg) {
  if (panel === 'org') return /^(workspaces|new|class|import|docs|evidence)/.test(arg || '') ? 'setup' : 'context';
  if (panel === 'screening') return /^(families|weights|coverage|watch|final)/.test(arg || '') ? 'select' : 'screen';
  return PANEL_STEP[panel] ?? null;
}

export function statuses(ws = S.ws) {
  return STEPS.map(s => { let st = 'todo'; try { st = s.status(ws); } catch (e) { console.warn(s.id, e); } return { s, st }; });
}
export function nextStep(ws = S.ws) { return statuses(ws).find(x => x.st !== 'done') || null; }

/** The named parts of a step, each with its own state — or null for a step that has only one test.
    Wrapped so a throwing part cannot take the Process page down with it. */
export function partsOf(step, ws = S.ws) {
  if (typeof step.parts !== 'function') return null;
  try { return step.parts(ws); } catch (e) { console.warn('parts', step.id, e); return null; }
}
