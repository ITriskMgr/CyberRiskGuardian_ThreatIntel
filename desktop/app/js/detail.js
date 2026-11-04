/* detail.js — the level of detail of the interface (1.9.1): Minimal, Standard or Detailed.

   Standard is the interface as it was. Minimal hides the introduction under each screen title and the explanatory
   hints under fields, but never a hint that changes what a value means (blank versus 0, the FACT / INFERENCE /
   ASSUMPTION / EXTERNAL / UNKNOWN tags, units): those carry the "keep" flag. Detailed adds one line per screen
   saying why the screen matters, and on the Process page opens the Tips and the guidelines of the next step.
   The level belongs to the person: stored for this installation, or for the signed-in person in multi-user mode.
   Nothing about a workspace changes with it; formulas and numbers never do.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as prefs from './prefs.js';
import * as users from './users.js';
import * as i18n from './i18n.js';

export const LEVELS = [
  ['minimal', 'Minimal', 'For people who know the method: the screens without introductions or explanatory hints.'],
  ['standard', 'Standard', 'The interface as designed: an introduction under each title and hints under the fields.'],
  ['detailed', 'Detailed', 'For a first assessment: also why each screen matters, and the tips of the next step opened.'],
];
export const DEFAULT = 'standard';
/* The French names are given here rather than through the catalogue, where "Standard" already means a standard
   (a document): the level is « Standard » in French too. */
const FR = { minimal: 'Minimal', standard: 'Standard', detailed: 'Détaillé' };
export const label = id => (i18n.isFR?.() ? FR[id] : (LEVELS.find(l => l[0] === id) || [])[1]) || id;
const valid = v => LEVELS.some(l => l[0] === v);

/** The level for the person using the application now. */
export function level() {
  const me = users.active() ? users.me() : null;
  if (me && valid(me.detail)) return me.detail;
  const p = prefs.get('detail');
  return valid(p) ? p : DEFAULT;
}
export const is = v => level() === v;

/** Set the level (for the signed-in person in multi-user mode, else for this installation) and redraw. */
export async function set(v) {
  if (!valid(v)) return;
  const me = users.active() ? users.me() : null;
  if (me) { me.detail = v; await users.save(); }
  else prefs.set('detail', v);
  apply();
  window.dispatchEvent(new HashChangeEvent('hashchange'));   // redraw the current screen with the new level
}
/** Write the level on the document, where the style sheet reads it. */
export function apply() {
  try { document.documentElement.dataset.detail = level(); } catch { /* no document (tests in Node) */ }
}

/** Whether a hint stays visible at the Minimal level (the rule lives in util.js, beside field()). */
export { KEEP_HINT } from './util.js';
