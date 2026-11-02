/* Identity & access management (IAM/PAM) — the registers: accounts, privileged roles, emergency accounts,
   access reviews and segregation of duties. Population counts only.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, pill, select } from '../util.js';
import * as IAM from '../iam.js';
import * as SG from '../safeguards.js';
import { tr } from '../i18n.js';
import { count, tail, stateCell, cnt as c, gap, moduleRegister } from './regcore.js';

const opts = list => list.map(([v, l]) => [String(v), l]);
const regOf = (ws, register, spec) => moduleRegister(IAM, ws, register, spec);

function accounts(body, redraw, ws) {
  const R = IAM.reg(ws); gap(body, R.accounts);
  body.append(el('p', 'note', 'MFA and phishing-resistant MFA apply to employees, contractors and emergency accounts only; they are left empty for service and AI-agent identities.'));
  body.append(regOf(ws, 'accounts', { title: 'Account populations', redraw,
    fields: [{ key: 'type', label: 'Type', type: 'select', options: IAM.TYPES }, { key: 'label', label: 'Population (a group, never a person)', type: 'text', wide: true },
      { key: 'scope', label: 'Scope', type: 'text' }, { key: 'owner', label: 'Owner (role or team)', type: 'text' },
      count('count', 'Accounts'), count('mfa', 'With MFA'), count('mfaPR', 'With phishing-resistant MFA'), count('dormant', 'Dormant'), count('ownerless', 'Without an owner'),
      { key: 'reconciled', label: 'Last reconciliation', type: 'date' }, ...tail(ws)],
    columns: ['id', 'type', { key: 'label', label: 'Population', render: r => el('span', { 'data-noi18n': '' }, r.label) }, { key: 'count', label: 'Accounts', render: r => c(r.count) },
      { key: 'mfa', label: 'MFA · phishing-resistant', render: r => IAM.HUMAN.has(r.type) ? el('span', null, c(r.mfa), ' · ', c(r.mfaPR)) : '—' },
      { key: 'dormant', label: 'Dormant', render: r => c(r.dormant) }, { key: 'ownerless', label: 'Without an owner', render: r => c(r.ownerless) },
      { key: 'reconciled', label: 'Reconciled', render: r => r.reconciled || '—' }, { key: 'st', label: 'State', render: r => stateCell('accounts', r, ws) }] }));
}

function privileged(body, redraw, ws) {
  const R = IAM.reg(ws); gap(body, R.privileged);
  body.append(el('p', 'note', 'Tier 0: identity, security, cloud tenant and keys (the control plane). Tier 1: critical production. Tier 2: limited administration.'));
  body.append(regOf(ws, 'privileged', { title: 'Privileged roles', redraw,
    fields: [{ key: 'tier', label: 'Tier', type: 'select', options: opts(IAM.TIERS), encode: v => String(v), decode: v => Number(v) }, { key: 'label', label: 'Role group', type: 'text', wide: true },
      { key: 'scope', label: 'Scope', type: 'text' }, { key: 'owner', label: 'Owner (role or team)', type: 'text' },
      count('holders', 'Holders'), count('standing', 'Standing'), count('jit', 'Just-in-time'), count('mfa', 'With MFA'), count('mfaPR', 'With phishing-resistant MFA'), count('shared', 'Shared administrative accounts'),
      { key: 'reviewed', label: 'Last review', type: 'date' }, ...tail(ws)],
    columns: ['id', 'tier', { key: 'label', label: 'Role group', render: r => el('span', { 'data-noi18n': '' }, r.label) }, { key: 'holders', label: 'Holders', render: r => c(r.holders) },
      { key: 'sj', label: 'Standing · just-in-time', render: r => el('span', null, c(r.standing), ' · ', c(r.jit)) }, { key: 'mfa', label: 'MFA · phishing-resistant', render: r => el('span', null, c(r.mfa), ' · ', c(r.mfaPR)) },
      { key: 'shared', label: 'Shared', render: r => c(r.shared) }, { key: 'reviewed', label: 'Reviewed', render: r => r.reviewed || '—' }, { key: 'st', label: 'State', render: r => stateCell('privileged', r, ws) }] }));
}

/** The five protective controls as yes / no / unknown selectors. */
const controlsField = () => ({ key: 'controls', label: 'Protective controls', wide: true, make: v => {
  const sels = Object.fromEntries(IAM.CONTROLS_EMERGENCY.map(([k]) => [k, select(IAM.YNU, v?.[k] || 'unknown', { 'data-ctl': k })]));
  return { node: el('div', 'grid g3', ...IAM.CONTROLS_EMERGENCY.map(([k, l]) => el('div', 'field', el('label', null, l), sels[k]))), get: () => Object.fromEntries(Object.entries(sels).map(([k, s]) => [k, s.value])) };
} });
function emergency(body, redraw, ws) {
  const R = IAM.reg(ws); gap(body, R.emergency);
  body.append(regOf(ws, 'emergency', { title: 'Emergency accounts', redraw,
    fields: [{ key: 'label', label: 'Account set', type: 'text', wide: true }, { key: 'scope', label: 'Scope', type: 'text' }, { key: 'owner', label: 'Owner (role or team)', type: 'text' },
      count('count', 'Accounts'), controlsField(), { key: 'lastTest', label: 'Last test', type: 'date' }, count('uses', 'Uses in the review window'), count('usesReviewed', 'Uses reviewed'),
      { key: 'lastUse', label: 'Last use', type: 'date' }, ...tail(ws)],
    columns: ['id', { key: 'label', label: 'Account set', render: r => el('span', { 'data-noi18n': '' }, r.label) }, { key: 'count', label: 'Accounts', render: r => c(r.count) },
      { key: 'ctl', label: 'Controls', render: r => el('div', 'chips', ...IAM.CONTROLS_EMERGENCY.map(([k, l]) => pill(tr(l) + ': ' + tr(IAM.YNU.find(x => x[0] === (r.controls?.[k] || 'unknown'))[1]), r.controls?.[k] === 'yes' ? 'good' : r.controls?.[k] === 'no' ? 'bad' : 'warn'))) },
      { key: 'lastTest', label: 'Last test', render: r => r.lastTest || '—' }, { key: 'uses', label: 'Uses · reviewed', render: r => el('span', null, c(r.uses), ' · ', c(r.usesReviewed)) },
      { key: 'st', label: 'State', render: r => stateCell('emergency', r, ws) }] }));
}

function reviews(body, redraw, ws) {
  const R = IAM.reg(ws); gap(body, R.reviews);
  body.append(el('p', 'note', 'An unverified revocation never counts as done.'));
  body.append(regOf(ws, 'reviews', { title: 'Access-review campaigns', redraw,
    fields: [{ key: 'name', label: 'Campaign', type: 'text', wide: true }, { key: 'population', label: 'Population', type: 'select', options: IAM.POPULATIONS },
      { key: 'scope', label: 'Scope', type: 'text' }, { key: 'owner', label: 'Owner (role or team)', type: 'text' }, { key: 'due', label: 'Due', type: 'date' }, { key: 'closed', label: 'Closed', type: 'date' },
      count('decisionsDue', 'Decisions due'), count('decisionsDone', 'Decisions made'), count('revocationsRequested', 'Revocations requested'), count('revocationsVerified', 'Revocations verified'),
      count('reviewerConflicts', 'Reviewers reviewing their own access'), ...tail(ws)],
    columns: ['id', { key: 'name', label: 'Campaign', render: r => el('span', { 'data-noi18n': '' }, r.name) }, 'population', { key: 'due', label: 'Due', render: r => r.due || '—' },
      { key: 'd', label: 'Decisions made / due', render: r => el('span', null, c(r.decisionsDone), ' / ', c(r.decisionsDue)) },
      { key: 'v', label: 'Revocations verified / requested', render: r => el('span', null, c(r.revocationsVerified), ' / ', c(r.revocationsRequested)) },
      { key: 'rc', label: 'Reviewer conflicts', render: r => c(r.reviewerConflicts) }, { key: 'st', label: 'State', render: r => stateCell('reviews', r, ws) }] }));
}

function sod(body, redraw, ws) {
  const R = IAM.reg(ws); gap(body, R.sod);
  const sgs = SG.list(ws).map(s => [s.id, `${s.id} ${String(s.name || '').slice(0, 50)}`]);
  body.append(regOf(ws, 'sod', { title: 'Segregation-of-duties rules', redraw,
    fields: [{ key: 'rule', label: 'Rule (the two duties that must not be combined)', type: 'text', wide: true }, { key: 'process', label: 'Process', type: 'text' },
      count('conflicts', 'Conflicts'), { key: 'owner', label: 'Owner (role or team)', type: 'text' }, { key: 'mitigation', label: 'Mitigation', type: 'area' },
      { key: 'compensating', label: 'Compensating safeguards', type: 'multi', options: sgs }, { key: 'reviewed', label: 'Last review', type: 'date' }, ...tail(ws)],
    columns: ['id', { key: 'rule', label: 'Rule', render: r => el('span', { 'data-noi18n': '' }, r.rule) }, { key: 'process', label: 'Process', render: r => el('span', { 'data-noi18n': '' }, r.process || '—') },
      { key: 'conflicts', label: 'Conflicts', render: r => c(r.conflicts) }, { key: 'm', label: 'Mitigation', render: r => r.mitigation || (r.compensating || []).length ? '✓' : '—' },
      { key: 'st', label: 'State', render: r => stateCell('sod', r, ws) }] }));
}

export const TABS = { accounts, privileged, emergency, reviews, sod };
