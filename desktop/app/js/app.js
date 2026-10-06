/* app.js — CyberRiskGuardian Desktop 1.5.2 entry point: engine self-check, router, workspace switcher.
   The calculation engines (crg.js, cvss4.js) are reused verbatim from the verified mobile app
   and are never reimplemented here. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { $, qsa, el, n0, banner, toast, go } from './util.js';
import { S, on, loadAll, select, emit } from './state.js';
import * as nav from './nav.js';
import * as FW from './frameworks.js';
import * as org from './panels/org.js';
import * as dashboard from './panels/dashboard.js';
import * as register from './panels/register.js';
import * as scenario from './panels/scenario.js';
import * as batch from './panels/batch.js';
import * as calc from './panels/calc.js';
import * as recs from './panels/recs.js';
import * as threats from './panels/threats.js';
import * as vulns from './panels/vulns.js';
import * as threat from './panels/threatctx.js';
import * as cvss from './panels/cvss.js';
import * as budget from './panels/budget.js';
import * as exportp from './panels/export.js';
import * as assets from './panels/assets.js';
import * as safeguards from './panels/safeguards.js';
import * as maturity from './panels/maturity.js';
import * as riskreg from './panels/riskreg.js';
import * as mitigation from './panels/mitigation.js';
import * as feeds from './panels/feeds.js';
import * as frameworks from './panels/frameworks.js';
import * as compliance from './panels/compliance.js';
import * as share from './panels/share.js';
import * as ai from './panels/ai.js';
import * as forecast from './panels/forecast.js';
import * as backup from './panels/backup.js';
import * as settings from './panels/settings.js';
import * as processp from './panels/process.js';
import * as about from './panels/about.js';
import * as reset from './panels/reset.js';
import * as i18n from './i18n.js';
import * as users from './users.js';
import * as chat from './chat.js';
import { nextStep } from './process.js';
import { leaveProfile } from './panels/org.js';

const PANELS = { process: processp, about, reset, org, dashboard, assets, safeguards, maturity, register, scenario, batch, calc, riskreg, mitigation, recs, threats, vulns, feeds, threat, frameworks, compliance, share, cvss, budget, export: exportp, ai, forecast, backup, settings };
export const ENGINE = { ok: false };

/* ---------------- engine self-check (unchanged from 1.0.0) ---------------- */
const EXPECTED = { est: 84491, res: 41104 };
function selfCheck() {
  const out = $('engine-banner'), state = $('engine-state');
  if (typeof CRG === 'undefined' || typeof CVSS4 === 'undefined') {
    state.textContent = 'engine missing';
    out.append(banner('bad', 'Calculation engine not loaded',
      'crg.js and cvss4.js must sit beside index.html. Copy them from the CyberRiskGuardian_IOS repository; ' +
      'they are the verified originals and must not be reimplemented.'));
    return false;
  }
  if (typeof CRG_SAMPLE === 'undefined') {
    state.textContent = 'engine loaded, unverified';
    out.append(banner('warn', 'Engine loaded but not verified',
      'sample.js is absent, so the MediBec regression could not run. Calculations are available but unchecked.'));
    return true;
  }
  try {
    const r = CRG.run(CRG_SAMPLE);
    const est = Math.round(r.totals.est), res = Math.round(r.totals.res);
    if (est === EXPECTED.est && res === EXPECTED.res) { state.textContent = `engine verified · ${n0(est)} / ${n0(res)}`; return true; }
    state.textContent = 'engine DIVERGES';
    out.append(banner('bad', 'Engine does not reproduce the MediBec baseline',
      `Expected ${n0(EXPECTED.est)} / ${n0(EXPECTED.res)}, got ${n0(est)} / ${n0(res)}. ` +
      'Do not rely on any number in this application until crg.js matches crg_calc.py again.'));
    return false;
  } catch (e) {
    state.textContent = 'engine error';
    out.append(banner('bad', 'Engine raised an error during verification', String(e.message || e)));
    return false;
  }
}

/* ---------------- router ---------------- */
let current = null;
function parseHash() {
  const h = (location.hash || '#/register').replace(/^#\/?/, '');
  const [name, ...rest] = h.split('/');
  return { name: PANELS[name] ? name : 'register', arg: rest.map(decodeURIComponent).join('/') || null };
}
let prevHash = location.hash;
function route() {
  // 1.5.2 — unsaved profile changes ask before leaving; signed-out multi-user shows the sign-in
  if (current?.name === 'org' && !location.hash.startsWith('#/org') && !leaveProfile()) { history.replaceState(null, '', prevHash); return; }
  prevHash = location.hash;
  if (users.active() && !users.me()) { signInScreen(); return; }
  let { name, arg } = parseHash();
  if (users.hiddenPanels().includes(name)) { toast(i18n.tr('Your role gives no access to this screen'), 'bad'); const hp = users.hiddenPanels(); name = !hp.includes('process') ? 'process' : 'about'; arg = null; }
  for (const a of qsa('nav .tab')) {
    if (a.dataset.panel === name) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  for (const k of Object.keys(PANELS)) $('panel-' + k).hidden = k !== name;
  current = { name, arg };
  chat.setScreen(name);
  draw();
  $('main').scrollTop = 0;
}
function draw() {
  if (!current || !S.ws) return;
  const sec = $('panel-' + current.name);
  const fail = e => { console.error(e); sec.replaceChildren(banner('bad', 'This screen raised an error', String(e.stack || e))); };
  sec.classList.remove('ro');   // the read-only observer must not lock the new render of another user/step
  const after = () => users.enforce(sec, current.name, current.arg, banner);
  try { const p = PANELS[current.name].render(sec, current.arg); if (p && p.then) p.then(after, fail); else after(); }
  catch (e) { fail(e); }
}


/* ---------------- chrome ---------------- */
function drawChrome() {
  const ws = S.ws; if (!ws) return;
  const sel = $('ws-select'); sel.replaceChildren();
  for (const w of S.list) sel.append(new Option(w.name + (w.org?.name && w.org.name !== w.name ? ' — ' + w.org.name : ''), w.id, false, w.id === ws.id));
  sel.append(new Option('＋ New workspace…', '__new'));
  const kind = $('ws-kind');
  kind.textContent = { example: 'Teaching example', classroom: 'Classroom case', organization: 'Organization' }[ws.kind] || ws.kind;
  kind.className = 'pill ' + (ws.kind === 'organization' ? 'good' : 'warn');
  $('nb-scen').textContent = ws.assessment.SCEN.length || '';
  const tcount = new Set(ws.assessment.SCEN.flatMap(s => s.attack || [])).size;
  $('nb-tech').textContent = tcount || '';
  $('nb-vuln').textContent = (ws.vulns || []).length || '';
  $('nb-assets').textContent = (ws.assets || []).length || '';
  $('nb-sg').textContent = (ws.safeguards || []).length || '';
  $('nb-risks').textContent = (ws.risks || []).length || '';
  $('nb-meas').textContent = (ws.measures || []).filter(m => m.status !== 'rejected').length || '';
  const sn = ws.snapshot;
  const nb = $('nb-snap');
  if (sn?.expires) { const left = Math.round((new Date(sn.expires) - new Date(new Date().toISOString().slice(0, 10))) / 864e5); nb.textContent = left < 0 ? 'expired' : left + 'd'; }
  else nb.textContent = '';
  const nx = nextStep(ws); $('nb-proc').textContent = nx ? nx.s.n + '/12' : '✓';
  for (const a of qsa('nav .tab')) a.hidden = users.hiddenPanels().includes(a.dataset.panel);
  drawUser();
  $('save-state').textContent = S.persistent ? i18n.tr('Saved locally') + ' · ' + new Date(ws.modified).toLocaleTimeString(i18n.locale()) : i18n.tr('Not persisted (private window)');
  nav.refresh();
}

$('ws-select').addEventListener('change', async e => {
  const v = e.target.value;
  if (v === '__new') { e.target.value = S.ws.id; go('org/new'); return; }
  await select(v); toast('Switched to ' + S.ws.name);
});
$('theme-toggle').addEventListener('click', () => {
  const r = document.documentElement;
  const dark = r.dataset.theme ? r.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  r.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('crg-theme', r.dataset.theme); } catch {}
  draw();
});
try { const t = localStorage.getItem('crg-theme'); if (t) document.documentElement.dataset.theme = t; } catch {}

/* ---------------- 1.5.2: language, users, chatbot, exit ---------------- */
$('lang-box').append(i18n.switcher(el));
window.addEventListener('crg-lang', () => { drawChrome(); draw(); });
$('help-toggle').addEventListener('click', () => chat.toggle());
$('exit-btn').addEventListener('click', exitApp);
function drawUser() {
  const box = $('user-box'); if (!box) return;
  if (!users.active()) { box.replaceChildren(); return; }
  const u = users.me();
  box.replaceChildren(el('span', { class: 'pill ' + (u?.admin ? 'good' : ''), title: u ? (u.admin ? 'Administrator' : 'Signed in') : '', 'data-noi18n': '' }, '👤 ' + (u?.name || '—')),
    ' ', el('button', { class: 'btn ghost sm', onclick: () => { users.signOut(); signInScreen(); } }, 'Switch user'));
}
function signInScreen() {
  for (const k of Object.keys(PANELS)) $('panel-' + k).hidden = true;
  let box = $('signin'); if (box) box.remove();
  const pin = el('input', { type: 'password', placeholder: 'PIN (if set)', autocomplete: 'current-password' });
  const msg = el('div');
  box = el('div', { id: 'signin', class: 'card signin' }, el('h1', null, 'Sign in'),
    el('p', 'lede', 'Multi-user mode is on. Choose your name; your rights follow the RACI matrix set by the administrator.'),
    el('div', 'grid g3', ...users.U.users.map(u => el('button', { class: 'btn ghost', 'data-noi18n': '', onclick: async () => {
      try { await users.signIn(u.id, pin.value); box.remove(); drawChrome(); route(); toast(i18n.tr('Signed in as') + ' ' + u.name); }
      catch (e) { msg.replaceChildren(banner('bad', 'Sign-in failed', i18n.tr(e.message))); }
    } }, u.name + (u.admin ? ' ★' : '')))),
    el('div', { style: { maxWidth: '260px', marginTop: '12px' } }, pin), msg,
    el('p', 'note', 'Option A (one computer): this organizes work and records who did what; it is not a security boundary.'));
  $('main').prepend(box);
  drawUser();
}
async function exitApp() {
  if (!leaveProfile()) return;
  if (!window.confirm(i18n.tr('Save your work, stop the local helper and close CyberRiskGuardian?'))) return;
  try { const st = await import('./state.js'); await st.saveNow(); } catch { /* nothing to save */ }
  users.audit('exit', '');
  let stopped = false;
  try { const r = await fetch('/api/quit', { method: 'POST', headers: { 'X-CRG': '1', 'Content-Type': 'application/json' }, body: '{}' }); stopped = r.ok; } catch { /* no helper */ }
  try { window.close(); } catch { /* not a script-opened window */ }
  setTimeout(() => {
    document.body.replaceChildren(el('div', { class: 'exit-screen' }, el('img', { src: 'icons/icon-192.png', alt: '', width: 72, height: 72 }),
      el('h1', null, 'CyberRiskGuardian is closed'),
      el('p', null, stopped ? 'Your work is saved and the local helper has stopped. You can close this window or tab.' : 'Your work is saved. You can close this window or tab (the launcher window, if any, can be closed too).'),
      el('button', { class: 'btn ghost', onclick: () => location.reload() }, 'Reopen')));
    i18n.translateTree(document.body);
  }, 300);
}

let lastAudit = '';
let redrawT;
on(what => {
  if (users.active() && current && what !== 'workspace') { const k = current.name + '|' + new Date().toISOString().slice(0, 15); if (k !== lastAudit) { lastAudit = k; users.audit('edit', current.name, S.ws); } }
  drawChrome();
  if (what === 'workspace' || what === 'snapshot' || what === 'redraw') { clearTimeout(redrawT); redrawT = setTimeout(draw, 0); }
});

/* ---------------- boot ---------------- */
ENGINE.ok = selfCheck();
nav.init();
window.addEventListener('hashchange', route);
Promise.all([loadAll(), FW.load(), i18n.init(), users.load()]).then(() => { chat.mount(); drawChrome(); route(); }).catch(e => {
  console.error(e); $('engine-banner').append(banner('bad', 'Could not open local storage', String(e.message || e)));
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  // When a newer version's service worker takes over (e.g. after replacing 1.0.0), reload once so
  // the page itself is the new version too.
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!reloaded) { reloaded = true; location.reload(); } });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update()).catch(() => {});
}
export { emit };
