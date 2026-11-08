/* migrate192.js — data version 6 (Desktop 1.9.2): the sub-steps of the step 5 → 6, one list per workstream.

   STEP6 is ws1 … ws5 (js/migrate192/ws<n>.js) concatenated in that order; each entry has the STEP4 format
   (migrate.js): { field, blank, group, title } to add a workspace field and/or up(w, note) for a load-time repair.
   migrate.js imports and re-exports STEP6 and fieldsV6: other modules read them from migrate.js (MIG.STEP6), never
   from this file, so that migrate.js is always evaluated first. This file and the lists import nothing from
   migrate.js. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import WS1 from './migrate192/ws1.js';
import WS2 from './migrate192/ws2.js';
import WS3 from './migrate192/ws3.js';
import WS4 from './migrate192/ws4.js';
import WS5 from './migrate192/ws5.js';
import REVIEW from './migrate192/review.js';   // 1.9.2 review fixes (after ws1 … ws5)

export const STEP6 = [...WS1, ...WS2, ...WS3, ...WS4, ...WS5, ...REVIEW];
/** The blank value of every data-version-6 field (entries with a field), for the workspace factory. */
export const fieldsV6 = () => Object.fromEntries(STEP6.filter(s => s.field).map(s => [s.field, s.blank()]));
