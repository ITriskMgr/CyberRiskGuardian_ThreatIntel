/* Configuration management — the screen of the optional module: router and help. The registers (baselines with
   their versions and configuration scopes, deviations and exceptions, configuration changes) are drawn by
   cm_regs.js; Overview, Findings & proposals, Import from a report and the Scenario-editor card by regcore.js,
   shared with Identity & access management. Counts only, never a secret, never licensed benchmark text.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from '../state.js';
import * as CM from '../cm.js';
import * as RC from './regcore.js';
import * as REGS from './cm_regs.js';

export const TABS = [['overview', 'Overview'], ['baselines', 'Baselines'], ['deviations', 'Deviations & exceptions'], ['changes', 'Configuration changes'],
  ['findings', 'Findings & proposals'], ['import', 'Import from a report']];

export const HELP = {
  '': { d: 'Versioned configuration baselines and scopes, deviations with their exceptions, configuration changes, three indicators, and findings that become evidence and proposals.', g: 'cm',
    h: ['Counts per configuration scope or change type — never a secret, never the text of a licensed benchmark.', 'A blank count is unknown, not zero. Unknown or stale data keeps an indicator from showing green.'] },
  overview: { d: 'The three indicators, how complete each register is, the key figures, maturity proposals and the indicator thresholds.', g: 'cm-overview',
    h: ['"Apply ticked" fills empty maturity and statement-of-applicability cells only; an existing answer is shown beside the proposal and never overwritten.', 'Thresholds are editable; "Restore default" brings back the module\'s values.'] },
  baselines: { d: 'Versioned configuration baselines, configuration scopes, and the assets not linked to a baseline.', g: 'cm-baselines',
    h: ['An approved version is frozen with its SHA-256 and becomes read-only; approving a new one supersedes the previous one. CIS Controls v8.1 safeguards 4.1 and 4.7.', 'A licensed benchmark is cited by reference only: never paste its text.'] },
  deviations: { d: 'Deviations from a baseline by drift class, with the exceptions that compensate them.', g: 'cm-deviations',
    h: ['A compensated deviation needs a linked exception. An expired exception is shown "Expired — not counted" and counts in CRG-24.'] },
  changes: { d: 'Configuration changes by period and type, verified or not.', g: 'cm-changes',
    h: ['Suspected unauthorized changes and unverified emergency changes are findings.'] },
  findings: { d: 'Findings derived by the configuration rules, recorded as evidence, linked to scenarios, and proposals of Pb(ψ,A) or θ changes.', g: 'cm-findings',
    h: ['The rule gives a direction only, never a value: the analyst types the proposed value.', 'Saving a proposal changes nothing; accepting it is a separate act and is journalled in the scenario and the revision log.'] },
  import: { d: 'Configuration counts proposed from an uploaded report by AI; the file is read in memory and never stored.', g: 'cm-import',
    h: ['Only scope and change counts are proposed and kept. The file\'s SHA-256, size and row count are recorded as the import trace.', 'The AI request goes to the local model by default, shows the exact payload, and a confidential workspace confirms every call.'] },
};

RC.registerTask(CM, 'Import from a report — configuration management');
const SCREEN = RC.makeScreen(CM, TABS, REGS.TABS);
export const render = SCREEN.render;
export const _imp = SCREEN.IMP;   // for the tests: proves what is (not) held

/** The Scenario editor's read-only card: configuration findings that cite the scenario. */
export const scenarioCard = (s, ws = S.ws) => RC.scenarioCard(CM, 'Configuration management evidence', s, ws);
