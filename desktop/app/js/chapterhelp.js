/* chapterhelp.js — "Read more: Chapter N — section" under every screen title and on every process step
   (1.9.0). The table is js/data/chapters.js; this module only looks an entry up and draws one line.

   The line is a reference, not a link: no textbook text is shipped with it. It carries both languages in
   the table, so it is drawn in the interface language and marked data-noi18n (the catalogue never sees
   it); when the language changes, every line on the page is redrawn.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { BOOK, SECTIONS, SCREENS, STEPS } from './data/chapters.js';
import * as i18n from './i18n.js';

const lang = () => (i18n.current?.() === 'fr' ? 'fr' : 'en');

/** Section id for a screen and its tab ("org", "profile"): the tab's entry, else the screen's; null for "none" or no entry. */
export function sectionFor(panel, arg) {
  const tab = String(arg || '').split('/')[0];
  const id = (tab && SCREENS[panel + '/' + tab]) || SCREENS[panel];
  return id && id !== 'none' && SECTIONS[id] ? id : null;
}
/** Section id for a process step id ("appetite"); null when none. */
export function sectionForStep(stepId) {
  const id = STEPS[stepId];
  return id && id !== 'none' && SECTIONS[id] ? id : null;
}
/** The reference line of a section in a language: "Read more: Chapter 4 — Risk appetite and …". */
export function text(id, l = lang()) {
  const s = SECTIONS[id];
  if (!s) return '';
  return BOOK.format[l].replace('{n}', s[0]).replace('{s}', l === 'fr' ? s[2] : s[1]);
}
function fill(node) {
  const id = node.dataset.chref, l = lang();
  node.textContent = text(id, l);
  node.title = BOOK.hint[l].replace('{e}', BOOK.edition).replace('{t}', BOOK.title);
  node.lang = l;
}
/** A line for a section id (null when there is none). tag/cls let a page match its own layout. */
export function line(id, { tag = 'p', cls = 'readmore' } = {}) {
  if (!id || !SECTIONS[id]) return null;
  const n = document.createElement(tag);
  n.className = cls; n.dataset.chref = id; n.setAttribute('data-noi18n', '');
  fill(n);
  return n;
}
export const forScreen = (panel, arg, opts) => line(sectionFor(panel, arg), opts);
export const forStep = (stepId, opts) => line(sectionForStep(stepId), opts);

/* Redraw every line when the interface language changes (this window or the guide windows). */
if (typeof window !== 'undefined') window.addEventListener('crg-lang', () => document.querySelectorAll('[data-chref]').forEach(fill));
