/* nav.js — collapsible navigation sections (1.5.0).
   Section titles are buttons; the items they control collapse and the state is remembered.
   Collapse is a preference of the person using the app, not a property of the workspace, so it is
   stored once in localStorage rather than per workspace.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

const KEY = 'crg-nav-collapsed';
const qsa = s => Array.from(document.querySelectorAll(s));

function read() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return new Set(Array.isArray(v) ? v : []); }
  catch { return new Set(); }                       // private window, blocked storage: start expanded
}
function write(set) {
  try { localStorage.setItem(KEY, JSON.stringify([...set])); } catch {}
}

let collapsed = read();

function apply(sec) {
  const id = sec.dataset.sec;
  const btn = sec.querySelector('.navgroup');
  const items = sec.querySelector('.navitems');
  const shut = collapsed.has(id);
  btn.setAttribute('aria-expanded', String(!shut));
  sec.classList.toggle('shut', shut);
  items.hidden = shut;
  count(sec);
}

/** When a section is closed, show how many screens it holds, so nothing hides silently.
    Deliberately the number of screens, not the sum of their badges: those badges count different
    things (scenarios, assets, risks, measures) and adding them together would mean nothing. */
function count(sec) {
  const out = sec.querySelector('.seccount');
  if (!out) return;
  out.textContent = sec.classList.contains('shut')
    ? String(sec.querySelectorAll('.navitems a.tab').length) : '';
}

/** Open the section holding the current screen, so a route change never lands out of sight. */
function revealCurrent() {
  const panel = (location.hash || '#/register').replace(/^#\/?/, '').split('/')[0];
  const link = document.querySelector(`nav .tab[data-panel="${CSS.escape(panel)}"]`);
  const sec = link && link.closest('.navsec');
  if (!sec) return;
  if (collapsed.delete(sec.dataset.sec)) { write(collapsed); apply(sec); }
}

/** Recompute the collapsed-section counts after the chrome redraws its badges. */
export function refresh() { for (const sec of qsa('nav .navsec')) count(sec); }

export function init() {
  for (const sec of qsa('nav .navsec')) {
    apply(sec);
    sec.querySelector('.navgroup').addEventListener('click', () => {
      const id = sec.dataset.sec;
      if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id);
      write(collapsed);
      apply(sec);
    });
  }
  /* 1.5.6 — General holds two entries that are not screens of this app: the step-by-step guide and
     the user guide, each in its own window so it can stay open beside the work. A plain target would
     open a tab; window.open with features gives a window. If the browser blocks the popup, the link
     is followed normally, which is why these stay real <a href> elements. */
  for (const a of qsa('nav a.tab.navout')) {
    a.addEventListener('click', ev => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) return;   // the person asked for a tab
      const w = window.open(a.getAttribute('href'), a.target || '_blank', 'popup=yes,width=1040,height=920,noopener');
      if (w) { ev.preventDefault(); try { w.focus(); } catch { /* blocked focus is harmless */ } }
    });
  }
  revealCurrent();
  window.addEventListener('hashchange', revealCurrent);
}
