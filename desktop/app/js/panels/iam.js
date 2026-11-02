/* Identity & access management (IAM/PAM) — the screen of the optional module: router and help. The registers
   (accounts, privileged roles, emergency accounts, access reviews, segregation of duties) are drawn by
   iam_regs.js; Overview, Findings & proposals, Import from a report and the Scenario-editor card by
   regcore.js, shared with Configuration management. Counts per population only: no names, no account
   identifiers, no secrets. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S } from '../state.js';
import * as IAM from '../iam.js';
import * as RC from './regcore.js';
import * as REGS from './iam_regs.js';

export const TABS = [['overview', 'Overview'], ['accounts', 'Accounts'], ['privileged', 'Privileged roles'], ['emergency', 'Emergency accounts'], ['reviews', 'Access reviews'],
  ['sod', 'Segregation of duties'], ['findings', 'Findings & proposals'], ['import', 'Import from a report']];

export const HELP = {
  '': { d: 'Population-level registers of identities, privileged access, emergency accounts, access reviews and segregation of duties, six indicators, and findings that become evidence and proposals.', g: 'iam',
    h: ['Counts per group of accounts, roles or campaigns — never names, account identifiers or secrets.', 'A blank count is unknown, not zero. Unknown or stale data keeps an indicator from showing green.'] },
  overview: { d: 'The six indicators, how complete each register is, the key figures, maturity proposals and the indicator thresholds.', g: 'iam-overview',
    h: ['"Apply ticked" fills empty maturity and statement-of-applicability cells only; an existing answer is shown beside the proposal and never overwritten.', 'Thresholds are editable; "Restore default" brings back the module\'s values.'] },
  accounts: { d: 'Account populations by type: how many, with MFA and phishing-resistant MFA, dormant, without an owner, and when they were last reconciled.', g: 'iam-accounts',
    h: ['MFA applies to employees, contractors and emergency accounts; service and AI-agent identities have no MFA count.', 'Registers hold groups, not people: use a role or team as the owner. CIS Controls v8.1 safeguards 5.1, 5.3 and 6.2.'] },
  privileged: { d: 'Privileged roles by tier: holders, standing and just-in-time, MFA, shared accounts and the last review.', g: 'iam-privileged',
    h: ['Tier 0 is the control plane (identity, security, cloud tenant, keys); tier 1 critical production; tier 2 limited administration. CIS Controls v8.1 safeguards 5.4, 6.5 and 6.8.'] },
  emergency: { d: 'Emergency (break-glass) accounts: protective controls, last test, uses and their review.', g: 'iam-emergency',
    h: ['Each of the five controls is yes, no or unknown. An emergency account not tested within the test window, or with a control at no, is a finding.'] },
  reviews: { d: 'Access-review campaigns in summary: decisions due and made, revocations requested and verified, reviewer conflicts.', g: 'iam-reviews',
    h: ['An unverified revocation never counts as done. CIS Controls v8.1 safeguards 5.3 and 6.1.'] },
  sod: { d: 'Segregation-of-duties rules with their conflict counts and mitigations.', g: 'iam-sod',
    h: ['A rule with conflicts and no mitigation or compensating safeguard is a finding.'] },
  findings: { d: 'Findings derived by the identity and access rules, recorded as evidence, linked to scenarios, and proposals of Pb(ψ,A) or θ changes.', g: 'iam-findings',
    h: ['The rule gives a direction only, never a value: the analyst types the proposed value.', 'Saving a proposal changes nothing; accepting it is a separate act and is journalled in the scenario and the revision log.'] },
  import: { d: 'Counts proposed from an uploaded report, by rules (tables) or AI (prose); the file is read in memory and never stored.', g: 'iam-import',
    h: ['Only counts are proposed and kept. The file\'s SHA-256, size and row count are recorded as the import trace.', 'The AI request goes to the local model by default, shows the exact payload, and a confidential workspace confirms every call.'] },
};

RC.registerTask(IAM, 'Import from a report — identity & access management');
const SCREEN = RC.makeScreen(IAM, TABS, REGS.TABS);
export const render = SCREEN.render;
export const _imp = SCREEN.IMP;   // for the tests: proves what is (not) held

/** The Scenario editor's read-only card: identity and access findings that cite the scenario. */
export const scenarioCard = (s, ws = S.ws) => RC.scenarioCard(IAM, 'Identity & access management evidence', s, ws);
