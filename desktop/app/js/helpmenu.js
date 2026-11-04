/* helpmenu.js — the one Help of the application (1.9.1), in the top bar.

   Until 1.9.0 the top bar had a "Help" button that opened the help chatbot while the side menu had a Help section
   (Step by step, User guide, About), and the guides meant the second when they said "Help → About". There is now a
   single Help, the top-bar button, opening a menu: help on this screen, Step by step, the User guide, Ask (the help
   chatbot) and About & versions. The "?" beside each screen title stays: it is the same help as the first item.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as chat from './chat.js';
import { toast } from './util.js';

export const ITEMS = [
  ['screen', 'Help on this screen'],
  ['steps', 'Step by step'],
  ['guide', 'User guide'],
  ['ask', 'Ask the help chatbot'],
  ['about', 'About & versions'],
];

/* A help page in its own window, as the side-menu links did (target crg-guide / crg-steps). "noopener" is not passed:
   with it window.open returns null even when the window opens, and the fallback would then replace the application. */
function popup(url, name, w, h) {
  const win = window.open(url, name, `popup=yes,width=${w},height=${h}`);
  if (win) { try { win.opener = null; } catch { /* cross-origin: nothing to clear */ } }
  else toast('Allow pop-up windows for this address to open the help in its own window.', 'warn');
}
function act(id) {
  if (id === 'screen') {
    const sec = [...document.querySelectorAll('main > section')].find(s => !s.hidden);
    const q = sec?.querySelector('h1 .helpq');
    if (q) { q.click(); return; }
    popup('help/user-guide.html', 'crg-guide', 1040, 920); return;
  }
  if (id === 'steps') return popup('help/step-by-step.html', 'crg-steps', 560, 900);
  if (id === 'guide') return popup('help/user-guide.html', 'crg-guide', 1040, 920);
  if (id === 'ask') return chat.toggle();
  if (id === 'about') { location.hash = '#/about/versions'; }
}

/** Turn the top-bar Help button into a menu button. */
export function mount() {
  const btn = document.getElementById('help-toggle');
  if (!btn || btn.dataset.menu) return;
  btn.dataset.menu = '1';
  btn.setAttribute('aria-haspopup', 'menu'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', 'help-menu');
  btn.title = 'Help';
  const menu = document.createElement('div');
  menu.id = 'help-menu'; menu.className = 'help-menu'; menu.setAttribute('role', 'menu'); menu.setAttribute('aria-label', 'Help'); menu.hidden = true;
  for (const [id, label] of ITEMS) {
    const b = document.createElement('button');
    b.type = 'button'; b.setAttribute('role', 'menuitem'); b.dataset.help = id; b.textContent = label; b.tabIndex = -1;
    b.addEventListener('click', () => { close(); act(id); });
    menu.append(b);
  }
  btn.parentNode.style.position = btn.parentNode.style.position || 'relative';
  btn.after(menu);
  const items = () => [...menu.querySelectorAll('[role=menuitem]')];
  function open() { menu.hidden = false; btn.setAttribute('aria-expanded', 'true'); items()[0]?.focus(); document.addEventListener('mousedown', outside, true); }
  function close(back = false) { if (menu.hidden) return; menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('mousedown', outside, true); if (back) btn.focus(); }
  const outside = e => { if (!menu.contains(e.target) && e.target !== btn) close(); };
  btn.addEventListener('click', () => (menu.hidden ? open() : close()));
  btn.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); open(); } });
  menu.addEventListener('keydown', e => {
    const list = items(), i = list.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
    else if (e.key === 'Home') { e.preventDefault(); list[0].focus(); }
    else if (e.key === 'End') { e.preventDefault(); list.at(-1).focus(); }
    else if (e.key === 'Tab') close();
  });
}
