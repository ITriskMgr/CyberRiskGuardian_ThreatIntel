/* setupwizard.js — the first-run set-up questions (1.9.1).

   The questions of the first-time setup guide's module table ("keep it on if…"), plus one about experience that
   sets the level of detail. Answering sets Settings → Modules and the level; nothing about a workspace changes and
   nothing is deleted (a module switched off keeps its data). Skippable, and re-opened from Settings → Modules.
   At first start the Process page shows an invitation (not a blocking dialog: the screen stays usable).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, modal, toast } from './util.js';
import * as prefs from './prefs.js';
import * as MOD from './modules.js';
import * as DETAIL from './detail.js';
import { tr } from './i18n.js';
import * as users from './users.js';
import * as LOG from './logs.js';

/** Modules belong to the installation: in multi-user mode only an administrator answers the module questions. */
const admin = () => !users.active() || !!users.me()?.admin;

/** Each question switches the modules it names on (yes) or off (no); "not sure" leaves them as they are. */
export const QUESTIONS = [
  { id: 'isms', q: 'Do you run or assess an information security management system (ISO/IEC 27001 style)?', mods: ['isms'] },
  { id: 'isp', q: 'Do you maintain the organization’s security policies?', mods: ['isp'] },
  { id: 'writer', q: 'Do you write or rewrite policies, standards or procedures?', mods: ['writer'] },
  { id: 'iam', q: 'Are identity, privileged access or segregation of duties in your scope?', mods: ['iam'] },
  { id: 'cm', q: 'Do hardening baselines, configuration drift or change control matter to the scenarios you assess?', mods: ['cm'] },
  { id: 'compliance', q: 'Must you show compliance with laws or frameworks (Law 25, ISO/IEC 27001, NIST CSF 2.0, PCI DSS…)?', mods: ['compliance'] },
  { id: 'audit', q: 'Are you an internal or external auditor?', mods: ['audit'] },
  { id: 'secops', q: 'Do you have security-operations (SOC) data, or assess or exercise incident response?', mods: ['siem', 'soar'] },
  { id: 'registry', q: 'Do you share risks with a community of practice?', mods: ['registry'] },
  { id: 'feeds', q: 'Do you follow threats week by week?', mods: ['feeds'] },
  { id: 'ai', q: 'Will you set up AI — a model on this computer or a remote provider?', mods: ['ai'] },
  { id: 'forecast', q: 'Do you track key risk indicators over time?', mods: ['forecast'] },
  { id: 'budget', q: 'Do you calibrate the cybersecurity budget?', mods: ['budget'] },
];
export const EXPERIENCE = [
  ['detailed', 'New to it — show me why each screen matters'],
  ['standard', 'Some experience'],
  ['minimal', 'I know the method well — keep the screens short'],
];
const KEY = 'setupWizard';
/** Answered or skipped already (the invitation is not shown again; Settings → Modules re-opens the questions). */
export const settled = () => !!prefs.get(KEY);
export function skip() { prefs.set(KEY, { skipped: new Date().toISOString().slice(0, 10) }); }

/** Apply a set of answers: { experience: 'standard', isms: 'yes' | 'no' | '' , … }. Returns the modules changed. */
export async function applyAnswers(ans) {
  const changed = [];
  for (const q of QUESTIONS) {
    const a = ans[q.id];
    if (a !== 'yes' && a !== 'no') continue;
    if (!admin()) continue;
    for (const m of q.mods) if (MOD.enabled(m) !== (a === 'yes')) {
      MOD.set(m, a === 'yes'); changed.push(m);
      users.audit('module ' + (a === 'yes' ? 'on' : 'off'), m); LOG.access('feature ' + (a === 'yes' ? 'switched on' : 'switched off'), m, 'set-up questions');
    }
  }
  if (DETAIL.LEVELS.some(l => l[0] === ans.experience)) await DETAIL.set(ans.experience);
  prefs.set(KEY, { answered: new Date().toISOString().slice(0, 10), answers: ans });
  return changed;
}

/** The questions, in a dialog. Pre-filled with the current state of each module. */
export function open(onDone) {
  const ans = { experience: DETAIL.level() };
  for (const q of QUESTIONS) ans[q.id] = q.mods.every(m => MOD.enabled(m)) ? 'yes' : q.mods.every(m => !MOD.enabled(m)) ? 'no' : '';
  const radios = (name, opts, cur, set) => el('div', { class: 'wiz-opts', role: 'radiogroup' }, ...opts.map(([v, label]) => {
    const r = el('input', { type: 'radio', name, value: v, checked: cur === v, style: { width: 'auto' } });
    r.addEventListener('change', () => { if (r.checked) set(v); });
    return el('label', { class: 'wiz-opt' }, r, el('span', null, label));
  }));
  const yn = [['yes', 'Yes'], ['no', 'No'], ['', 'Not sure — keep as it is']];
  const m = modal(tr('Set up the application'),
    el('p', null, 'A few questions so the menu shows what your practice needs and the screens explain as much as you want. Nothing is deleted: a module switched off keeps its data and comes back when you switch it on in Settings → Modules.'),
    el('fieldset', { class: 'wiz-q', id: 'wiz-experience' }, el('legend', null, el('b', null, 'How familiar are you with cybersecurity risk assessment?')),
      radios('wiz-exp', EXPERIENCE, ans.experience, v => { ans.experience = v; })),
    ...QUESTIONS.map(q => el('fieldset', { class: 'wiz-q', 'data-q': q.id }, el('legend', null, q.q),
      radios('wiz-' + q.id, yn, ans[q.id], v => { ans[q.id] = v; }))),
    el('p', 'small muted', 'The method’s own modules — Cybersecurity management, Shared registers, Quality review, the ontology and Scenario screening — stay on: risk decisions and the method use them.'),
    el('div', 'btnrow', { style: { marginTop: '12px' } },
      el('button', { class: 'btn', id: 'wiz-apply', onclick: async () => {
        const changed = await applyAnswers(ans); m.close();
        toast(changed.length ? tr('Set-up saved: {0} module(s) changed').replace('{0}', changed.length) : tr('Set-up saved'), 'good');
        onDone?.();
      } }, 'Apply'),
      el('button', { class: 'btn ghost', id: 'wiz-skip', onclick: () => { if (!settled()) skip(); m.close(); onDone?.(); } }, 'Skip for now')));
  return m;
}

/** The invitation on the Process page at first start. */
export function invitation(redraw) {
  if (settled() || !admin()) return null;   // the modules are the administrator's; a person sets their own level in Settings
  return el('div', { class: 'card wiz-invite', id: 'setup-invite' },
    el('h2', { style: { marginTop: 0 } }, 'Set up the application for your practice'),
    el('p', null, 'Answer a few questions (about two minutes) and the menu keeps what you need, with the level of detail that suits you. You can change everything later in Settings.'),
    el('div', 'btnrow',
      el('button', { class: 'btn primary', id: 'setup-open', 'data-ro-ok': '', onclick: () => open(redraw) }, 'Answer the set-up questions'),
      el('button', { class: 'btn ghost', id: 'setup-skip', 'data-ro-ok': '', onclick: () => { skip(); redraw?.(); } }, 'Skip — keep the defaults')));
}
