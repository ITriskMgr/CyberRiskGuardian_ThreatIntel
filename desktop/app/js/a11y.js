/* a11y.js — accessibility backstops (1.9.2, NV-028, NV-064, NV-092).

   Most controls get their name from field() (util.js: label + htmlFor). The screens also draw controls outside a
   field: filter selects, tick boxes with a title only, search inputs with a placeholder only. This module watches the
   page and gives each such control an accessible name from what the screen already shows — its title, its
   placeholder, the selected option of a filter, or the text of its table row — so a screen reader can announce it
   (axe rules "label", "select-name", "label-title-only"). It never changes what is visible.

   It also owns the keyboard path: the "Skip to content" link of index.html, and, after a menu navigation to another
   screen, moving the focus to that screen's title (131 Tab presses were needed to reach the Organization tabs).
   Switching tabs inside a screen keeps the focus where it is. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { tr } from './i18n.js';

const CONTROLS = ['select', 'textarea', 'input:not([type="hidden"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="image"])'].join(', ');

/** Does this control already have an accessible name? */
function named(c) {
  if (c.getAttribute('aria-label') || c.getAttribute('aria-labelledby') || c.getAttribute('title')) return true;
  if (c.closest('label')) return true;
  if (c.id) { try { if (document.querySelector(`label[for="${CSS.escape(c.id)}"]`)) return true; } catch { /* odd id */ } }
  return false;
}
const clean = s => String(s || '').replace(/\s+/g, ' ').trim().slice(0, 120);

/** The best name the screen offers for an unlabelled control. */
function guessName(c) {
  const ph = c.getAttribute('placeholder'); if (ph) return clean(ph);
  if (c.tagName === 'SELECT') {
    const o = c.options[c.selectedIndex] || c.options[0];
    const t = clean(o?.textContent);
    if (t) return t;
  }
  const td = c.closest('td, th');
  if (td) {
    const tr_ = td.closest('tr'), table = td.closest('table');
    const idx = tr_ ? [...tr_.children].indexOf(td) : -1;
    const th = table && idx >= 0 ? table.querySelector('thead > tr:first-child')?.children[idx] : null;
    const col = clean(th?.textContent), row = clean(tr_?.querySelector(['td:not(.cb) b', 'td:not(.cb) a', 'td:not(.cb)'].join(', '))?.textContent);
    const parts = [col, row].filter(Boolean);
    if (parts.length) return parts.join(' — ');
  }
  const prev = c.previousElementSibling;
  if (prev && /^(B|SPAN|LABEL|H[1-6])$/.test(prev.tagName) && clean(prev.textContent)) return clean(prev.textContent);
  return c.type === 'checkbox' ? tr('Select') : c.type === 'file' ? tr('Choose a file') : tr('Value');
}

/** Name every unlabelled control under root (idempotent). */
export function nameControls(root = document.body) {
  if (!root || root.nodeType !== 1) return;
  const list = root.matches?.(CONTROLS) ? [root, ...root.querySelectorAll(CONTROLS)] : [...root.querySelectorAll(CONTROLS)];
  for (const c of list) {
    if (named(c)) {
      // a title-only control (axe label-title-only): make the title an aria-label too, so the name is explicit
      if (!c.getAttribute('aria-label') && !c.getAttribute('aria-labelledby') && c.getAttribute('title') && !c.closest('label') && !(c.id && document.querySelector(`label[for="${CSS.escape(c.id)}"]`))) c.setAttribute('aria-label', c.getAttribute('title'));
      continue;
    }
    c.setAttribute('aria-label', guessName(c));
  }
  // 1.9.2 (NV-064) — a region that scrolls (the ATT&CK matrix) must be reachable from the keyboard
  for (const m of root.querySelectorAll('.matrix:not([tabindex])')) { m.tabIndex = 0; if (!m.getAttribute('aria-label')) m.setAttribute('aria-label', tr('ATT&CK matrix — scroll with the arrow keys')); }
}

let obs = null, pending = false;
export function init() {
  if (obs) return;
  nameControls(document.body);
  obs = new MutationObserver(muts => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) nameControls(n); });
  });
  obs.observe(document.body, { subtree: true, childList: true });
  const skip = document.getElementById('skip-link');
  if (skip) skip.addEventListener('click', e => { e.preventDefault(); focusHeading(); });
}

/** Move the focus to the visible screen's title (after a menu navigation or the skip link). */
export function focusHeading(sec) {
  const s = sec || [...document.querySelectorAll('main > section')].find(x => !x.hidden);
  const h1 = s?.querySelector('h1');
  if (!h1) return false;
  if (!h1.hasAttribute('tabindex')) h1.tabIndex = -1;
  h1.focus({ preventScroll: false });
  return document.activeElement === h1;
}
