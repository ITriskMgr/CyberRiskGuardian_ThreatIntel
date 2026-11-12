/* app.js — CyberRiskGuardian Desktop entry point: engine self-check, router, workspace switcher, update check.
   The calculation engines (crg.js, cvss4.js) are reused verbatim from the verified mobile app
   and are never reimplemented here. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { $, qsa, el, n0, banner, toast, go } from './util.js';
import * as TABKEYS from './tabkeys.js';
import { isReadOnly, S, on, loadAll, select, emit, reopen, reopened, reopenedDone } from './state.js';
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
import * as ontology from './panels/ontology.js';
import * as registry from './panels/rhub.js';
import * as isp from './panels/isp.js';
import * as writer from './panels/writer.js';
import * as isms from './panels/isms.js';
import * as csm from './panels/csm.js';
import * as audit from './panels/audit.js';
import * as qc from './panels/qc.js';
import * as shared from './panels/shared.js';
import * as iam from './panels/iam.js';
import * as cm from './panels/cm.js';
import * as siem from './panels/siem.js';
import * as soar from './panels/soar.js';
import * as evidence from './panels/evidence.js';
import * as screening from './panels/screening.js';
import * as summary from './panels/summary.js';
import * as UPUI from './updateui.js';
import * as i18n from './i18n.js';
import * as MOD from './modules.js';
import * as LOG from './logs.js';
import * as HELP from './helpdesc.js';
import * as users from './users.js';
import * as chat from './chat.js';
import * as consultui from './consultui.js';
import { nextStep } from './process.js';
import * as DETAIL from './detail.js';
import { VERSION as VERSION_NUM, SERIES as VERSION_SERIES } from './version.js';
const VERSION_LABEL = `${VERSION_NUM} Beta (${VERSION_SERIES})`;
/* 1.9.2 (item 1, NV-050) — the one-line footer: © Marc-André Léger · v1.9.2 Beta · ✓ Engine verified. The version is
   read from version.js, never typed here. */
const FOOT_VERSION = `v${VERSION_NUM} Beta`;
import * as A11Y from './a11y.js';
import * as WINLOCK from './winlock.js';
import * as SCREEN from './screencodes.js';
import * as HELPMENU from './helpmenu.js';
import { leaveProfile } from './panels/org.js';
import { hfetch } from './helper.js';

const PANELS = { process: processp, about, reset, org, dashboard, assets, safeguards, maturity, evidence, register, scenario, batch, screening, calc, riskreg, mitigation, recs, threats, vulns, feeds, threat, frameworks, compliance, share, ontology, registry, isp, writer, isms, csm, audit, qc, shared, iam, cm, siem, soar, summary, cvss, budget, export: exportp, ai, forecast, backup, settings };
export const ENGINE = { ok: false };

/* ---------------- engine self-check (MediBec reference: 84,305 / 41,023 since 1.8.0, S2 and S8 at AV:L) ---------------- */
const EXPECTED = { est: 84305, res: 41023 };
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
    if (est === EXPECTED.est && res === EXPECTED.res) {
      ENGINE.totals = { est, res };   // 1.9.2 (X-6): the footer re-formats them in the interface locale (drawFoot)
      state.textContent = `engine verified · ${n0(est)} / ${n0(res)}`;
      return casesCheck(state, out);
    }
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

/* 1.9.0 — the other bundled teaching examples are checked beside MediBec: the French MediBec must give exactly
   the MediBec reference (only its text is translated), and CanaRetail (English and French, same numbers) its own
   reference, computed with engine/crg_calc.py when the case was built. A guarded constant: change it only with
   the case, never to make a diverging engine pass. */
const EXPECTED_CANARETAIL = { est: 27526, res: 16049 };
function casesCheck(state, out) {
  const runs = [];
  if (self.CRG_MEDIBEC_FR) runs.push(['MediBec (French)', self.CRG_MEDIBEC_FR.ASSESSMENT, EXPECTED]);
  if (self.CRG_CANARETAIL) for (const l of ['en', 'fr']) runs.push([`CanaRetail (${l === 'en' ? 'English' : 'French'})`, self.CRG_CANARETAIL[l]?.ASSESSMENT, EXPECTED_CANARETAIL]);
  for (const [name, data, exp] of runs) {
    let est = NaN, res = NaN, err = '';
    try { const r = CRG.run(data); est = Math.round(r.totals.est); res = Math.round(r.totals.res); } catch (e) { err = String(e.message || e); }
    if (est === exp.est && res === exp.res) continue;
    state.textContent = 'engine DIVERGES';
    out.append(banner('bad', `The bundled example ${name} does not reproduce its reference`,
      err || `Expected ${n0(exp.est)} / ${n0(exp.res)}, got ${n0(est)} / ${n0(res)}. Reinstall the application; do not rely on that example until it matches again.`));
    return false;
  }
  if (self.CRG_CANARETAIL) { state.textContent += ` · CanaRetail ${n0(EXPECTED_CANARETAIL.est)} / ${n0(EXPECTED_CANARETAIL.res)}`; if (ENGINE.totals) ENGINE.totals.canaretail = { ...EXPECTED_CANARETAIL }; }
  return true;
}

/* ---------------- router ---------------- */
let current = null;
/* 1.9.1 — where the application opens: the Process page while any step of the workspace remains, so the next step
   is the first thing seen; at the Minimal level of detail, and once every step is done, the scenario register. */
function landing() {
  if (DETAIL.is('minimal') || users.hiddenPanels().includes('process')) return '#/register';
  try { return S.ws && nextStep(S.ws) ? '#/process' : '#/register'; } catch { return '#/register'; }
}
function parseHash() {
  const h = (location.hash || landing()).replace(/^#\/?/, '');
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
  /* 1.5.7 — a screen with several menu entries (Risk Registry) marks only the entry of its tab. */
  const tabArg = (arg || '').split('/')[0];
  const sameP = qsa('nav .tab').filter(a => a.dataset.panel === name);
  const exact = sameP.find(a => a.dataset.arg && a.dataset.arg === tabArg) || sameP.find(a => !a.dataset.arg) || sameP[0];
  for (const a of qsa('nav .tab')) {
    if (a === exact) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  }
  for (const k of Object.keys(PANELS)) $('panel-' + k).hidden = k !== name;
  if (current?.name !== name || current?.arg !== arg) LOG.access('screen opened', name + (arg ? '/' + arg : ''), '', S.ws?.name || '');
  const panelChanged = !!current && current.name !== name;
  const tabHadFocus = !panelChanged && document.activeElement?.getAttribute('role') === 'tab' && $('panel-' + name).contains(document.activeElement);
  current = { name, arg };
  drawScreenCode();
  chat.setScreen(name);
  draw();
  $('main').scrollTop = 0;
  // 1.9.2 (NV-092) — after a navigation to another screen the focus moves to its title; a tab switch inside a screen
  // (which redraws the screen) puts the focus back on the tab that is now selected.
  if (panelChanged) A11Y.focusHeading($('panel-' + name));
  else if (tabHadFocus) $('panel-' + name).querySelector('[role="tab"][aria-selected="true"]')?.focus();
}
/* 1.9.3 (T7): the stable screen code, as a faint token at the foot of the page (js/screencodes.js) */
function drawScreenCode() {
  let t = document.getElementById('screen-code');
  if (!t) { t = document.createElement('div'); t.id = 'screen-code'; t.className = 'screen-code'; t.setAttribute('aria-hidden', 'true'); t.setAttribute('data-noi18n', ''); document.body.append(t); }
  t.textContent = SCREEN.codeOf(current.name, current.arg);
}
function draw() {
  if (!current || !S.ws) return;
  const sec = $('panel-' + current.name);
  // 1.5.7 — a module switched off in Settings → Modules: say so rather than show a half-hidden screen
  if (MOD.panelOff(current.name)) {
    const m = MOD.moduleOf(current.name);
    sec.replaceChildren(el('h1', null, m.label), banner('warn', i18n.tr('This module is switched off'), i18n.tr('Switch it on in Settings → Modules. Its data stays in the workspace while it is off.')),
      el('div', 'btnrow', el('button', { class: 'btn', onclick: () => { location.hash = '#/settings/modules'; } }, 'Open Settings → Modules')));
    HELP.supportCode(sec, current.name, current.arg);   // 1.9.2 (NV-080): the code is there even when the module is off
    return;
  }
  const fail = e => { console.error(e); sec.replaceChildren(banner('bad', 'This screen raised an error', String(e.stack || e))); };
  sec.classList.remove('ro');   // the read-only observer must not lock the new render of another user/step
  const after = () => {
    HELP.decorate(sec, current.name, current.arg, PANELS[current.name]);   // 1.9.2 (NV-080): also draws the screen's support code
    users.enforce(sec, current.name, current.arg, banner);
    // 1.5.8 — a workspace written by a newer release, or whose migration failed, is never saved over
    if (isReadOnly() && !sec.querySelector('.mig-banner')) {
      const b = banner('warn', i18n.tr('This workspace is open read-only'), i18n.tr('It was written by a newer release of the application, or it could not be brought to this release. You can look at it, but nothing you change here is saved. Backup & restore → Data versions and migrations says why.'));
      b.classList.add('mig-banner'); sec.prepend(b);
    }
  };
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
  const nx = nextStep(ws); $('nb-proc').textContent = nx ? (nx.s.n === 'R' ? 'R' : nx.s.n + '/19') : '✓';
  nav.visibility(new Set([...users.hiddenPanels(), ...MOD.offPanels()]));
  drawUser();
  nav.refresh();
}

$('ws-select').addEventListener('change', async e => {
  const v = e.target.value;
  if (v === '__new') { e.target.value = S.ws.id; go('org/new'); return; }
  if (!leaveProfile()) { e.target.value = S.ws.id; return; }   // 1.9.1 — unsaved profile changes ask before the switch
  await select(v, false);
  await reopen('process', { toast: i18n.tr('Switched to') + ' ' + S.ws.name });   // 1.9.1 (B4)
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
HELPMENU.mount();   // 1.9.1 — one Help, in the top bar
$('consult-toggle').addEventListener('click', () => consultui.toggle());
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
      try { await users.signIn(u.id, pin.value); box.remove(); DETAIL.apply(); drawChrome(); route(); toast(i18n.tr('Signed in as') + ' ' + u.name); }
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
  try { const r = await hfetch('/api/quit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }); stopped = r.ok; } catch { /* no helper */ }
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
/* 1.9.1 — the pinned footer shows the result in two words; the totals stay in #engine-state (for screen readers, the
   link's title and Help → About & versions, which reads them from there). */
/* The state is read from the self-check's own (English) text the first time, before the page translator can change it;
   a later call (language switch) reuses it, unless the text was replaced with another English state (the suites do). */
function drawFoot() {
  const full = $('engine-state').textContent, short = $('engine-short');
  if (/^engine /.test(full) || !ENGINE.state) ENGINE.state = /^engine verified\b/.test(full) && ENGINE.ok ? 'good' : /unverified/.test(full) ? 'unverified' : 'bad';
  const state = ENGINE.state;
  short.replaceChildren(el('span', { 'aria-hidden': 'true' }, { good: '✓ ', unverified: '◻ ', bad: '✗ ' }[state]),
    el('span', null, i18n.tr({ good: 'Engine verified', unverified: 'Engine unverified', bad: 'Engine check failed' }[state])));
  short.classList.toggle('bad', state === 'bad'); short.classList.toggle('unverified', state === 'unverified');
  /* 1.9.2 (X-6, NV-040 "engine status") — the totals follow the interface locale: « moteur vérifié · 84 305 / 41 023 » */
  if (state === 'good' && ENGINE.totals) {
    const t = ENGINE.totals;
    $('engine-state').textContent = `engine verified · ${n0(t.est)} / ${n0(t.res)}` + (t.canaretail ? ` · CanaRetail ${n0(t.canaretail.est)} / ${n0(t.canaretail.res)}` : '');
  }
  const foot = $('nav-foot'), shown = i18n.tr($('engine-state').textContent);
  $('foot-version').textContent = FOOT_VERSION;
  foot.title = `v${VERSION_LABEL} · © 2026 Marc-André Léger — ${shown}`;
  foot.setAttribute('aria-label', i18n.tr('© 2026 Marc-André Léger · {0} · {1} · About & versions').replace('{0}', FOOT_VERSION).replace('{1}', shown));
}
drawFoot();
window.addEventListener('crg-lang', drawFoot);
nav.init();
TABKEYS.init();   // 1.9.0 Atlas: arrow keys and a roving tabindex on every screen's tab list
window.addEventListener('crg-visibility', () => drawChrome());
window.addEventListener('hashchange', route);
/* 1.9.2 (item 2, NV-012) — one window at a time: the lock is taken before anything is read or written. When another
   window holds it, the person chooses "Use it here" (the other window saves, then freezes) or "Close". */
WINLOCK.acquire().then(() => Promise.all([LOG.load(), loadAll(), FW.load(), i18n.init(), users.load()])).then(() => { A11Y.init(); const again = !!reopened(); if (!again) LOG.access('application opened', location.host || 'local'); DETAIL.apply(); chat.mount(); consultui.mount(); drawChrome(); route(); { const r = reopened(); if (r?.carry?.toast) toast(r.carry.toast, r.carry.kind || ''); if (r && !r.carry?.org) reopenedDone(); } setTimeout(() => document.body.classList.remove('boot'), 1400); if (!again) UPUI.startup().catch(console.warn); drawFoot(); }).catch(e => {
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
