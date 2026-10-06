/* process.js — the 12 steps of a complete CyberRiskGuardian risk assessment (1.5.2).
   Shared by the Process page, the help chatbot and the RACI matrix of multi-user mode: each step
   names the screens where it is done, so rights are granted per step and every screen knows which
   step it belongs to. Status is computed from the workspace by transparent rules.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, compute } from './state.js';

const v = (s, k) => s.params?.[k];
const filled = x => Array.isArray(x) ? x.length > 0 : x !== undefined && x !== null && String(x).trim() !== '' && x !== 0;

/** id, title, purpose, inputs, done-when, screens (route + label), tips. */
export const STEPS = [
  { id: 'setup', n: 1, title: 'Set up the workspace',
    purpose: 'One workspace per organization or business case, with its documents.',
    inputs: 'Name, type (organization or educational case), business case and company documents.',
    done: 'The workspace has an organization name and at least one context document.',
    screens: [['org/workspaces', 'Workspaces'], ['org/docs', 'Context documents']],
    /* 1.5.5 — a step is a set of named parts, each with its own state and the screen that fixes it.
       Before this, a step with two requirements showed one opaque "To do" whether you had neither or
       one of them, and step 4's two parts were the worst case: one of them needed the internet. */
    parts: ws => [
      { what: 'The workspace has an organization name', ok: filled(ws.org.name), fix: ['org/workspaces', 'Workspaces'] },
      { what: 'At least one context document', ok: ws.docs.length > 0, fix: ['org/docs', 'Context documents'],
        hint: 'A document is what the extractions read. Without one, every value is typed by hand.' },
    ],
    tips: ['Workspaces → Import from the documents pre-fills assets, BIA, third parties, controls, compliance, incidents, weaknesses, scenarios, risks, budget, KRIs, roles and the classroom setting — each proposal reviewed and tagged.', 'Drop all the documents of the case when you create the workspace, and tick “Extract the profile and crown jewels”.', 'Mark a classroom case as an educational case used for training purposes.'],
    status(ws) { const k = [filled(ws.org.name), ws.docs.length > 0]; return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
  { id: 'context', n: 2, title: 'Describe the context and risk appetite',
    purpose: 'Mission, services, processes, systems, obligations, appetite and budget — the basis of every estimate.',
    inputs: 'Context documents, management statements, budget figures.',
    done: 'At least 8 of the 12 context fields are filled, the appetite has a rationale and the IT budget is entered.',
    screens: [['org/profile', 'Profile & appetite'], ['safeguards', 'Existing safeguards'], ['maturity', 'Maturity & resilience']],
    tips: ['Use “Extract from documents” to propose every field, then accept or edit each one and Save.', 'Values are tagged FACT, INFERENCE, ASSUMPTION, EXTERNAL or UNKNOWN: resolve the UNKNOWN ones first.', 'Existing safeguards records the controls already in force — the context the assessment needs for θ and for the budget baseline. It is not the treatment plan.'],
    status(ws) {
      const o = ws.org, keys = ['context', 'mission', 'services', 'processes', 'systems', 'cloud', 'suppliers', 'sensitive', 'availability', 'maturity', 'incidents', 'regulations'];
      const n = keys.filter(k => filled(o[k])).length;
      const ok = n >= 8 && filled(ws.appetite_rationale) && Number(ws.budget?.it_budget) > 0;
      return ok ? 'done' : n >= 2 ? 'partial' : 'todo'; } },
  { id: 'assets', n: 3, title: 'Identify crown jewels and information assets',
    purpose: 'The services, systems and data whose loss would most harm the mission, and what they depend on.',
    inputs: 'Context, inventories, discovery scans.',
    done: 'At least 3 crown jewels or 5 information assets, with owners and classification.',
    screens: [['org/crown', 'Crown jewels'], ['assets', 'Information assets']],
    tips: ['“Extract from documents” in Crown jewels proposes them from the case.', 'Information assets → “Create from profile & crown jewels” builds the inventory; Batch scenarios then offers them.'],
    status(ws) { const c = (ws.assessment.CROWN || []).length, a = (ws.assets || []).length; return c >= 3 || a >= 5 ? 'done' : c + a > 0 ? 'partial' : 'todo'; } },
  { id: 'threats', n: 4, title: 'Gather threats and vulnerabilities',
    purpose: 'Who could act, how (ATT&CK), through which weaknesses (CVE/CWE) — and current threat intelligence.',
    inputs: 'Threat feeds, KEV/EPSS snapshot, scanner exports.',
    done: 'A threat-context snapshot is loaded and the vulnerability register holds the organization’s exposed CVEs.',
    screens: [['threats', 'Threats · ATT&CK'], ['vulns', 'Vulnerabilities · CVE/CWE'], ['feeds', 'Threat feeds & social'], ['threat', 'Threat context']],
    tips: ['Threat context → “Load the bundled example” needs no network at all, and is enough to finish this step: it carries the CISA KEV catalogue of its build date and an EPSS table pruned at the ladder\u2019s rung-1 ceiling, which classifies every CVE exactly as the unpruned snapshot does.',
      'With network: Vulnerabilities → Online sources downloads KEV and EPSS through the helper, then Threat context builds a snapshot from them.',
      'The register half needs an entry, not a confirmed exposure: Vulnerabilities → “Add a weakness without a CVE” records something you know about without waiting for a scanner.',
      'Feed items never change a score: they inform the analyst.'],
    parts: ws => [
      { what: 'A threat-context snapshot is loaded', ok: !!ws.snapshot, fix: ['threat', 'Threat context'],
        hint: 'The bundled example works offline; your own snapshot or a KEV + EPSS download is better when you can get one.' },
      { what: 'The vulnerability register holds at least one entry', ok: (ws.vulns || []).length > 0, fix: ['vulns', 'Vulnerabilities · CVE/CWE'],
        hint: 'A CVE, or a named weakness with no CVE. Confirmed exposure is not required to finish this step \u2014 it is required before any score moves.' },
    ],
    status(ws) { const k = [!!ws.snapshot, (ws.vulns || []).length > 0]; return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
  { id: 'scenarios', n: 5, title: 'Develop risk scenarios',
    purpose: 'Complete causal chains: threat source → weakness → asset → event → consequence.',
    inputs: 'Steps 2–4.',
    done: 'At least 10 scenarios in the register (20 candidates, the 10 most material kept).',
    screens: [['batch', 'Batch scenarios'], ['register', 'Scenario register'], ['scenario', 'Scenario editor'], ['vulns/links', 'Suggest vulnerability links']],
    tips: ['Batch scenarios → set “Number of candidates” to 20, or “Propose with AI”, then keep the 10 most material.', 'Vulnerabilities → Suggest links: run the rules (no AI), optionally ask AI, then accept the links that hold.', 'A scenario names a causal chain, not just “ransomware”.'],
    status(ws) { const n = ws.assessment.SCEN.length; return n >= 10 ? 'done' : n > 0 ? 'partial' : 'todo'; } },
  { id: 'quantify', n: 6, title: 'Quantify each scenario',
    purpose: 'Pb(A), Pb(ψ,A), δe, δm, θ, μ(E) and CVSS, each with a rationale and a confidence level.',
    inputs: 'Evidence, threat context, the organization’s controls.',
    done: '80% of the parameters of the included scenarios carry a rationale.',
    screens: [['scenario', 'Scenario editor'], ['cvss', 'CVSS v4.0'], ['forecast', 'Forecasts']],
    tips: ['Use Low / Medium / High confidence honestly: Forecasts turns it into ranges.', 'CVSS is Base-only; exploitation evidence belongs in Pb(ψ,A).'],
    status(ws) {
      const sc = ws.assessment.SCEN.filter(s => !(ws.excluded || []).includes(s.id));
      if (!sc.length) return 'todo';
      let all = 0, ok = 0;
      for (const s of sc) for (const k of ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu']) { all++; if (filled(v(s, k)?.rat)) ok++; }
      return ok / all >= 0.8 ? 'done' : ok > 0 ? 'partial' : 'todo'; } },
  { id: 'evaluate', n: 7, title: 'Evaluate against tolerance',
    purpose: 'Residual ↔ tolerated risk for every scenario and the portfolio, with the verified engine.',
    inputs: 'Steps 5–6.',
    done: 'The included scenarios compute without error and each has a management decision recorded.',
    screens: [['calc', 'Risk calculator'], ['dashboard', 'KRI dashboard'], ['riskreg', 'Risk register']],
    tips: ['Ratio < 0.90 below tolerance, 0.90–1.10 approximately at it, > 1.10 above.', 'Create the risk register from the scenarios in one click.'],
    parts: ws => { const R = compute(ws); const dec = R.inc.filter(r => ws.decisions?.[r.id]?.option).length;
      return [
        { what: 'The included scenarios compute without error', ok: R.inc.length > 0 && R.errors.length === 0, fix: ['calc', 'Risk calculator'],
          hint: R.errors.length ? `${R.errors.length} scenario(s) cannot be calculated yet.` : R.inc.length ? '' : 'Nothing is included in the portfolio yet.' },
        { what: 'Every included scenario has a management decision', ok: R.inc.length > 0 && dec === R.inc.length, fix: ['riskreg', 'Risk register'],
          hint: R.inc.length ? `${dec} of ${R.inc.length} recorded.` : '' },
      ]; },
    status(ws) { const R = compute(ws); if (!R.inc.length) return 'todo'; const dec = R.inc.filter(r => ws.decisions?.[r.id]?.option).length; return R.errors.length ? 'partial' : dec === R.inc.length ? 'done' : 'partial'; } },
  { id: 'treat', n: 8, title: 'Select mitigation measures',
    purpose: 'Measures from recognized frameworks with cost and likelihood / impact reduction; shared controls counted once.',
    inputs: 'Scenarios above or near tolerance.',
    done: 'Every scenario above tolerance is covered by at least one measure.',
    screens: [['mitigation', 'Risk mitigation']],
    tips: ['Start from Proposals, then refine costs and effects.', 'A measure must reduce both likelihood and impact somewhere, or the workbook convention mitigates nothing.'],
    status(ws) { const R = compute(ws); const above = R.inc.filter(r => r.est / r.tol > CRG.BAND_HIGH); if (!above.length) return (ws.measures || []).length ? 'done' : 'todo';
      const cov = above.filter(r => (ws.measures || []).some(m => m.status !== 'rejected' && (m.scen || []).includes(r.id))).length;
      return cov === above.length ? 'done' : cov > 0 ? 'partial' : 'todo'; } },
  { id: 'recommend', n: 9, title: 'Recommend and approve',
    purpose: 'Draft recommendations, reviewed and formally approved by the accountable person.',
    inputs: 'Selected measures, treatment need.',
    done: 'At least one recommendation is approved and every risk has a treatment decision.',
    screens: [['recs', 'Recommendations'], ['riskreg', 'Risk register']],
    tips: ['Approval freezes the figures with the approver and date.', 'In multi-user mode only people with the Approve right (RACI “A”) can approve.'],
    status(ws) { const r = ws.recommendations || []; const ap = r.filter(x => ['approved', 'in-implementation', 'completed'].includes(x.status)).length; return ap ? 'done' : r.length ? 'partial' : 'todo'; } },
  { id: 'budget', n: 10, title: 'Align the budget',
    purpose: 'Funding options against the appetite-consistent budget band (4% / 7.8% / 12% of IT).',
    inputs: 'IT budget, current spend, baseline (run) cost, initiatives.',
    done: 'The budget year is filled and the initiatives are allocated.',
    screens: [['budget', 'Budget']],
    tips: ['Baseline = what keeps existing security running; new treatment is added to it.'],
    status(ws) { const b = ws.budget || {}; const k = [Number(b.it_budget) > 0, Number(b.baseline) > 0, (ws.assessment.INITIATIVES || []).length > 0]; return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
  { id: 'monitor', n: 11, title: 'Monitor with KRIs',
    purpose: 'Indicators with thresholds, recorded over time; forecasts of breaches.',
    inputs: 'Operational measurements.',
    done: 'At least one measurement is recorded.',
    screens: [['dashboard', 'KRI dashboard'], ['forecast', 'Forecasts']],
    tips: ['Record a measurement at every review; four readings allow a projection.'],
    status(ws) { const h = (ws.kriHistory || []).length; return h >= 4 ? 'done' : h ? 'partial' : 'todo'; } },
  { id: 'report', n: 12, title: 'Report, demonstrate compliance and share',
    purpose: 'Excel workbook, compliance statement, anonymized registry for others.',
    inputs: 'Everything above.',
    done: 'A compliance framework is assessed or a registry package has been published.',
    screens: [['export', 'Export · Excel'], ['compliance', 'Compliance'], ['frameworks', 'Frameworks & standards'], ['share', 'Publish & share']],
    tips: ['Anonymize anything that leaves the organization.', 'Classroom deliverables are labelled fictional automatically.'],
    status(ws) { const k = [(ws.published || []).length > 0, Object.keys(ws.compliance?.soa || {}).length > 0]; return k.every(Boolean) ? 'done' : k.some(Boolean) ? 'partial' : 'todo'; } },
];
export const STEP = Object.fromEntries(STEPS.map(s => [s.id, s]));

/** The step a screen belongs to (for rights); org depends on its tab. */
export const PANEL_STEP = { org: 'context', dashboard: 'monitor', assets: 'assets', safeguards: 'context', maturity: 'context', register: 'scenarios', scenario: 'quantify', batch: 'scenarios', calc: 'evaluate',
  riskreg: 'recommend', mitigation: 'treat', recs: 'recommend', threats: 'threats', vulns: 'threats', feeds: 'threats', threat: 'threats', frameworks: 'report',
  compliance: 'report', share: 'report', cvss: 'quantify', budget: 'budget', export: 'report', forecast: 'monitor', ai: null, process: null, about: null, backup: '_admin', settings: '_admin' };
export function stepOf(panel, arg) {
  if (panel === 'org') return /^(workspaces|new|class)/.test(arg || '') ? 'setup' : /^crown/.test(arg || '') ? 'assets' : 'context';
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
