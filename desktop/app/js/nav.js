/* nav.js — the side menu: built from menu.js, hierarchical, collapsible.

   • Sections and sub-menus open and close; their state is remembered on this computer.
   • The whole menu folds into a narrow rail of section icons (the button beside the name); a section's
     screens then open in a flyout. The choice is remembered.
   • On a narrow screen the menu is a drawer opened from the ☰ button of the top bar.
   • visibility(hidden) leaves out screens switched off or hidden from the person, and any section or
     sub-menu left empty — nothing hides silently: a closed section shows how many screens it holds.
   These are preferences of the person, not of the workspace, so they live in localStorage.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { MENU, ICONS } from './menu.js';

const KEY = 'crg-nav-collapsed', RAIL = 'crg-nav-rail';
const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private window */ } },
};
let collapsed = new Set(store.get(KEY, ['registry', 'tools', 'settings', 'sub:settings']));
const save = () => store.set(KEY, [...collapsed]);

const NS = 'http://www.w3.org/2000/svg';
function svg(path, cls) {
  const s = document.createElementNS(NS, 'svg'); s.setAttribute('viewBox', '0 0 16 16'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
  if (cls) s.setAttribute('class', cls);
  const p = document.createElementNS(NS, 'path'); p.setAttribute('d', path); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor');
  p.setAttribute('stroke-width', '1.6'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
  s.append(p); return s;
}
const chev = () => svg('M6 4l4 4-4 4', 'chev');
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v === null || v === undefined || v === false) continue; if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else e.setAttribute(k, v === true ? '' : v); }
  for (const k of kids) if (k !== null && k !== undefined) e.append(k);
  return e;
}

function link(i, extraClass = '') {
  if (i.out) return h('a', { class: 'tab navout ' + extraClass, href: i.out, target: i.target, rel: 'noopener' }, i.label + ' ', h('span', { class: 'ext', 'aria-hidden': 'true', text: '↗' }));
  const href = '#/' + i.panel + (i.arg ? '/' + i.arg : '');
  return h('a', { class: 'tab ' + extraClass, href, 'data-panel': i.panel, 'data-arg': i.arg || null }, i.label, i.badge ? h('span', { class: 'badge', id: i.badge }) : null);
}

function subGroup(i) {
  const id = 'sub:' + i.panel, shut = collapsed.has(id);
  const box = h('div', { class: 'navsub' + (shut ? ' shut' : ''), 'data-sub': i.panel });
  const items = h('div', { class: 'subitems', id: 'subitems-' + i.panel, role: 'group' }, ...i.tabs.map(t => link(t, 'sub')));
  items.hidden = shut;
  const tog = h('button', { type: 'button', class: 'subtoggle', 'aria-expanded': String(!shut), 'aria-controls': 'subitems-' + i.panel, title: i.label }, chev());
  tog.addEventListener('click', () => { toggle(id); box.classList.toggle('shut', collapsed.has(id)); items.hidden = collapsed.has(id); tog.setAttribute('aria-expanded', String(!collapsed.has(id))); });
  box.append(h('div', { class: 'subhead' }, link(i, 'parent'), tog), items);
  return box;
}

function section(s) {
  const shut = collapsed.has(s.id);
  const sec = h('div', { class: 'navsec' + (shut ? ' shut' : ''), 'data-sec': s.id });
  const btn = h('button', { type: 'button', class: 'navgroup', id: 'navbtn-' + s.id, 'aria-expanded': String(!shut), 'aria-controls': 'navitems-' + s.id, title: s.label },
    svg(ICONS[s.id] || ICONS.help, 'ico'), chev(), h('span', { class: 'navgroup-label', text: s.label }), h('span', { class: 'badge seccount', 'aria-hidden': 'true' }));
  const items = h('div', { class: 'navitems', id: 'navitems-' + s.id, role: 'group', 'aria-labelledby': 'navbtn-' + s.id });
  for (const i of s.items) {
    if (i.tabs && i.flat) items.append(...i.tabs.map(t => link(t)));
    else if (i.tabs) items.append(subGroup(i));
    else items.append(link(i));
  }
  items.hidden = shut;
  btn.addEventListener('click', () => {
    if (document.body.classList.contains('navrail')) { flyout(sec); return; }
    toggle(s.id); apply(sec);
  });
  sec.append(btn, items);
  return sec;
}

function toggle(id) { if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id); save(); }
function apply(sec) {
  const shut = collapsed.has(sec.dataset.sec);
  sec.classList.toggle('shut', shut);
  sec.querySelector('.navgroup').setAttribute('aria-expanded', String(!shut));
  sec.querySelector('.navitems').hidden = shut;
  count(sec);
}
function count(sec) {
  const out = sec.querySelector('.seccount');
  if (out) out.textContent = sec.classList.contains('shut') ? String(qsa('.navitems a.tab:not([hidden]):not(.parent)', sec).length) : '';
}

/* ---------------- rail and flyout ---------------- */
let openFly = null;
function closeFly() { if (openFly) { openFly.classList.remove('fly'); openFly.querySelector('.navitems').style.top = ''; openFly = null; } }
function flyout(sec) {
  const was = openFly === sec; closeFly(); if (was) return;
  const items = sec.querySelector('.navitems'); items.hidden = false;
  sec.classList.add('fly'); openFly = sec;
  const r = sec.querySelector('.navgroup').getBoundingClientRect();
  items.style.top = Math.max(8, Math.min(r.top, window.innerHeight - items.offsetHeight - 8)) + 'px';
}
function setRail(on) {
  document.body.classList.toggle('navrail', on); store.set(RAIL, on); closeFly();
  const b = document.getElementById('nav-rail'); if (b) { b.setAttribute('aria-pressed', String(on)); b.title = on ? 'Expand the menu' : 'Collapse the menu'; b.textContent = on ? '»' : '«'; }
  if (!on) for (const sec of qsa('nav .navsec')) apply(sec);
}

/** Open the section (and sub-menu) holding the current screen, so a route change never lands out of sight. */
function revealCurrent() {
  const [panel, arg] = (location.hash || '#/register').replace(/^#\/?/, '').split('/');
  const cands = qsa(`nav .tab[data-panel="${CSS.escape(panel)}"]`);
  const a = cands.find(x => x.dataset.arg === arg) || cands[0];
  if (!a) return;
  const sec = a.closest('.navsec'), sub = a.closest('.navsub');
  if (sub && collapsed.delete('sub:' + sub.dataset.sub)) { save(); sub.classList.remove('shut'); sub.querySelector('.subitems').hidden = false; sub.querySelector('.subtoggle').setAttribute('aria-expanded', 'true'); }
  if (sec && collapsed.delete(sec.dataset.sec)) { save(); apply(sec); }
  closeFly(); document.body.classList.remove('navopen');
}

/** Show only what this person may use: hidden is a Set (or array) of screens to leave out. */
export function visibility(hidden) {
  const off = hidden instanceof Set ? hidden : new Set(hidden || []);
  for (const a of qsa('nav a.tab[data-panel]')) { const no = off.has(a.dataset.panel); a.hidden = no; a.style.display = no ? 'none' : ''; }
  for (const sub of qsa('nav .navsub')) { const any = qsa('.subitems a.tab', sub).some(a => !a.hidden); sub.hidden = !any; }
  for (const sec of qsa('nav .navsec')) { const any = qsa('.navitems a.tab', sec).some(a => !a.hidden); sec.hidden = !any; count(sec); }
}
/** Recompute the closed-section counts after the chrome redraws. */
export function refresh() { for (const sec of qsa('nav .navsec')) count(sec); }

export function init() {
  const tree = document.getElementById('navtree');
  tree.replaceChildren(...MENU.map(section));
  for (const sec of qsa('nav .navsec')) count(sec);
  /* Guides open in a window of their own, so they can stay beside the work; a blocked popup follows the link. */
  for (const a of qsa('nav a.tab.navout')) {
    a.addEventListener('click', ev => {
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) return;
      const w = window.open(a.getAttribute('href'), a.target || '_blank', 'popup=yes,width=1040,height=920,noopener');
      if (w) { ev.preventDefault(); try { w.focus(); } catch { /* harmless */ } }
    });
  }
  document.getElementById('nav-rail')?.addEventListener('click', () => setRail(!document.body.classList.contains('navrail')));
  document.getElementById('nav-toggle')?.addEventListener('click', () => { const o = !document.body.classList.contains('navopen'); document.body.classList.toggle('navopen', o); document.getElementById('nav-toggle').setAttribute('aria-expanded', String(o)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeFly(); document.body.classList.remove('navopen'); } });
  document.addEventListener('click', e => { if (openFly && !openFly.contains(e.target)) closeFly(); });
  setRail(!!store.get(RAIL, false));
  revealCurrent();
  window.addEventListener('hashchange', revealCurrent);
}
