/* users.js — multi-user mode with RACI-based rights (1.5.2, option A of the proof of concept).

   Option A — one computer, several people. Users, their PIN (stored as a salted SHA-256 hash) and a
   RACI letter per process step live in this browser's storage. The application enforces the rights:
     R  Responsible   view + edit
     A  Accountable   view + edit + approve
     C  Consulted     view (+ comments where a screen has them)
     I  Informed      view
     –  no access     the step's screens are hidden
   Administrators have every right on every step and manage users. Approvals (recommendations,
   formal risk acceptance, measure approval) require the Approve right on their step.

   This is NOT a security boundary: anyone with access to the computer and the browser's developer
   tools can bypass it. It organizes who does what and records who did it. Option B (a team server
   enforcing the same model, see MULTIUSER-ARCHITECTURE.md) is designed to reuse this model as is.
   Single-user mode (the default) behaves exactly as before 1.5.2.

   Menu access (1.5.4). On top of RACI, an administrator can set, per menu (screen), an access mode for a
   user group or a user account: Default (follow RACI), Full (view and edit), View only, Hidden.
   A user's own setting wins; otherwise the most permissive setting among the user's groups applies;
   otherwise RACI decides. Approvals still need RACI “A”. Settings and Backup stay administrator-only.
   Administrators are never restricted.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import { STEPS, stepOf } from './process.js';

export const LETTERS = [['R', 'Responsible — view and edit'], ['A', 'Accountable — view, edit and approve'], ['C', 'Consulted — view'], ['I', 'Informed — view'], ['-', 'No access']];
const RIGHTS = { R: ['view', 'edit'], A: ['view', 'edit', 'approve'], C: ['view'], I: ['view'], '-': [] };
export const U = { enabled: false, users: [], groups: [], current: null, audit: [] };
const SESSION = 'crg-session-user';

export async function load() {
  const d = await store.get('meta', 'users').catch(() => null);
  Object.assign(U, { enabled: false, users: [], groups: [], audit: [] }, d || {});
  let sid = null; try { sid = sessionStorage.getItem(SESSION); } catch { /* none */ }
  U.current = U.enabled ? U.users.find(u => u.id === sid) || null : null;
  return U;
}
export async function save() {
  const { current, ...rest } = U;
  await store.put('meta', 'users', JSON.parse(JSON.stringify(rest)));
}
export const me = () => U.current;
export const active = () => U.enabled;
export const name = () => U.current?.name || '';

export async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(salt + ':' + pin);
  const h = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function signIn(id, pin = '') {
  const u = U.users.find(x => x.id === id);
  if (!u) throw new Error('Unknown user');
  if (u.pinHash && (await hashPin(pin, u.salt)) !== u.pinHash) throw new Error('Wrong PIN');
  U.current = u;
  try { sessionStorage.setItem(SESSION, u.id); } catch { /* none */ }
  audit('sign-in', '');
  return u;
}
export function signOut() { audit('sign-out', ''); U.current = null; try { sessionStorage.removeItem(SESSION); } catch { /* none */ } }

export function newUser(o = {}) {
  return Object.assign({ id: 'u-' + Math.random().toString(36).slice(2, 9), name: '', email: '', title: '', admin: false, raci: Object.fromEntries(STEPS.map(s => [s.id, 'I'])),
    salt: Math.random().toString(36).slice(2, 12), pinHash: '', created: new Date().toISOString().slice(0, 10) }, o);
}
/** Starting rights by template (used by Settings → Users & RACI and by roles imported from documents). */
export function template(t) {
  const m = { viewer: () => 'I', analyst: id => id === 'recommend' ? 'C' : 'R', owner: id => ['evaluate', 'treat', 'recommend'].includes(id) ? 'A' : 'C', manager: () => 'A', admin: () => 'A' };
  const f = m[t] || m.viewer;
  return Object.fromEntries(STEPS.map(s => [s.id, f(s.id)]));
}

/* ---------------- menu access by group and user (1.5.4) ---------------- */
export const MENUS = [['process', 'Process'], ['org', 'Organization'], ['dashboard', 'KRI dashboard'], ['assets', 'Information assets'], ['safeguards', 'Existing safeguards'], ['maturity', 'Maturity & resilience'], ['register', 'Scenario register'],
  ['scenario', 'Scenario editor'], ['batch', 'Batch scenarios'], ['calc', 'Risk calculator'], ['riskreg', 'Risk register'], ['mitigation', 'Risk mitigation'], ['recs', 'Recommendations'],
  ['threats', 'Threats · ATT&CK'], ['vulns', 'Vulnerabilities · CVE/CWE'], ['feeds', 'Threat feeds & social'], ['threat', 'Threat context'], ['frameworks', 'Frameworks & standards'],
  ['compliance', 'Compliance'], ['share', 'Publish & share'], ['reset', 'Reset data'], ['cvss', 'CVSS v4.0'], ['budget', 'Budget'], ['export', 'Export · Excel'], ['ai', 'AI assistant'], ['forecast', 'Forecasts'],
  ['backup', 'Backup & restore'], ['settings', 'Settings'], ['about', 'About']];
export const MODES = [['default', 'Default (RACI)'], ['full', 'Full'], ['view', 'View only'], ['hidden', 'Hidden']];
const RANK = { hidden: 1, view: 2, full: 3 };
export function newGroup(name) { return { id: 'g-' + Math.random().toString(36).slice(2, 8), name, menu: {} }; }
/** Effective menu mode for a panel: 'default' | 'full' | 'view' | 'hidden'. */
export function menuMode(panel, u = U.current) {
  if (!U.enabled || !u || u.admin) return 'default';
  const own = u.menu?.[panel];
  let mode = own && own !== 'default' ? own : 'default';
  if (mode === 'default') {
    for (const g of U.groups || []) {
      if (!(u.groups || []).includes(g.id)) continue;
      const m = g.menu?.[panel];
      if (m && m !== 'default' && (mode === 'default' || RANK[m] > RANK[mode])) mode = m;
    }
  }
  if (mode === 'full' && ['settings', 'backup', 'reset'].includes(panel)) mode = 'view';   // administrator-only screens
  return mode;
}

/** Turn multi-user on with a first administrator (the person doing it). */
export async function enable(adminName, pin = '') {
  const u = newUser({ name: adminName || 'Administrator', admin: true, raci: Object.fromEntries(STEPS.map(s => [s.id, 'A'])) });
  if (pin) u.pinHash = await hashPin(pin, u.salt);
  U.users = [u, ...U.users.filter(x => x.id !== u.id)];
  U.enabled = true; U.current = u;
  try { sessionStorage.setItem(SESSION, u.id); } catch { /* none */ }
  audit('multi-user enabled', ''); await save();
  return u;
}
export async function disable() { audit('multi-user disabled', ''); U.enabled = false; U.current = null; await save(); }

/** Rights of the current user on a step ('_admin' for Settings and Backup). */
export function rights(step, u = U.current) {
  if (!U.enabled) return ['view', 'edit', 'approve'];
  if (!u) return [];
  if (u.admin) return ['view', 'edit', 'approve', 'admin'];
  if (step === '_admin') return ['view'];
  if (!step) return ['view', 'edit'];          // screens outside the process (Process, About, AI assistant)
  return RIGHTS[u.raci?.[step] || 'I'] || [];
}
export const can = (right, step, u) => rights(step, u).includes(right);
export const canPanel = (right, panel, arg) => can(right, stepOf(panel, arg));
export const letter = (step, u = U.current) => !U.enabled ? '' : u?.admin ? 'A' : (u?.raci?.[step] || 'I');

/** Who is Accountable / Responsible for a step (for the Process page and approvals). */
export const holders = (step, L) => U.users.filter(u => (u.admin && L === 'A' && !U.users.some(x => !x.admin && x.raci?.[step] === 'A')) || u.raci?.[step] === L);

export function audit(action, detail, ws = null) {
  const e = { at: new Date().toISOString().slice(0, 19), user: U.current?.name || (U.enabled ? '(signed out)' : 'single user'), action, detail };
  U.audit.unshift(e); U.audit = U.audit.slice(0, 2000);
  if (ws) { (ws.userAudit ||= []).unshift(e); ws.userAudit = ws.userAudit.slice(0, 2000); }
  save().catch(() => {});
}

/* ---------------- enforcement on screens ---------------- */
const ALLOW = /^(export|download|copy|open|close|view|show|hide|compare|print|search|filter|back|previous|next|cancel|help|sign|switch|refresh|reset to top 5|top 5|tick|untick|select shown|deselect shown|load latest|read|exporter|télécharger|copier|ouvrir|fermer|afficher|masquer|imprimer|précédent|suivant|annuler|aide)/i;
/** Make a rendered screen read-only for a user without the Edit right on its step. */
export function enforce(sec, panel, arg, banner) {
  if (!U.enabled) { sec.classList.remove('ro'); return; }
  const step = stepOf(panel, arg);
  const r = rights(step);
  const mm = menuMode(panel);
  if (mm === 'full' || (mm !== 'view' && r.includes('edit'))) { sec.classList.remove('ro'); return; }
  sec.classList.add('ro');
  const lock = root => {
    for (const n of root.querySelectorAll('input, select, textarea, button')) {
      if (n.closest('.subtabs') || n.getAttribute('role') === 'tab' || n.dataset.roOk !== undefined) continue;
      if (n.tagName === 'BUTTON' && ALLOW.test((n.textContent || '').trim())) continue;
      if (n.tagName === 'INPUT' && n.type === 'search') continue;
      if (/^(search|filter|recherche)/i.test(n.getAttribute('placeholder') || '')) continue;
      n.disabled = true; n.title = 'Read-only: your role on this step is ' + (letter(step) || '—');
    }
  };
  lock(sec);
  if (!sec._roObs) { sec._roObs = new MutationObserver(() => { if (sec.classList.contains('ro')) lock(sec); }); sec._roObs.observe(sec, { childList: true, subtree: true }); }
  if (banner && !sec.querySelector('.ro-banner')) {
    const b = mm === 'view' ? banner('warn', 'Read-only', `${U.current?.name || 'You'} — this screen is set to “View only” for your account or group (Settings → Users & RACI → Menu access).`)
      : banner('warn', 'Read-only', `${U.current?.name || 'You'} — role “${letter(step) || '—'}” on step “${STEPS.find(s => s.id === step)?.title || step}”. Viewing is allowed; editing needs R or A (ask an administrator).`);
    b.classList.add('ro-banner'); sec.prepend(b);
  }
}
export const hiddenPanels = () => {
  if (!U.enabled || !U.current || U.current.admin) return [];
  const steps = STEPS.filter(s => (U.current.raci?.[s.id] || 'I') === '-').map(s => s.id);
  const byRaci = Object.entries({ org: 'context', dashboard: 'monitor', assets: 'assets', register: 'scenarios', scenario: 'quantify', batch: 'scenarios', calc: 'evaluate', riskreg: 'recommend',
    mitigation: 'treat', recs: 'recommend', threats: 'threats', vulns: 'threats', feeds: 'threats', threat: 'threats', frameworks: 'report', compliance: 'report', share: 'report',
    cvss: 'quantify', budget: 'budget', export: 'report', forecast: 'monitor' }).filter(([, st]) => steps.includes(st)).map(([p]) => p);
  // 1.5.4 — menu access: Hidden hides, Full or View only shows the menu even when RACI says “–”
  const out = new Set(byRaci);
  for (const [p] of MENUS) { const m = menuMode(p); if (m === 'hidden') out.add(p); else if (m === 'full' || m === 'view') out.delete(p); }
  return [...out];
};
/** Throw unless the current user may approve on this step (used by approval code paths). */
export function requireApprove(step) {
  if (!can('approve', step)) throw new Error(`Approval needs the Approve right (RACI “A”) on step “${STEPS.find(s => s.id === step)?.title || step}”. Your role: ${letter(step) || '—'}.`);
}
