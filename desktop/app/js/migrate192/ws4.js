/* migrate192/ws4.js — data version 6 (Desktop 1.9.2): the sub-steps owned by workstream ws4.

   Only workstream ws4 edits this file. migrate192.js concatenates ws1 … ws5, in that order, into STEP6; the
   step 5 → 6 of migrate.js runs it, and KNOWN_FIELDS, the workspace factory (state.newWorkspace), the shape repair
   (state.migrate) and the reset groups (reset.GROUPS) read it. Do not edit DATA_VERSION, KNOWN_FIELDS or MIGRATIONS.

   Entry format (the same as STEP4 in migrate.js):
     field   the top-level workspace field (optional: an entry may be a load-time repair only)
     blank   () => its empty value: what a new workspace gets and what an older one is given (required with field)
     group   the reset group it belongs to (reset.js: ORGANIZATION, DOCUMENTS, CONTEXT, ASSESSMENT, KRI_DEFS, AUDIT)
     title   one line for the migration journal
     up      optional (w, note) => void, for a sub-step that does more than add the blank field (it replaces the
             default "add the blank field"); it must be idempotent, leave numbers untouched (one written exception:
             item 23), and journal what it did with note('…')
   Sub-steps run in the order listed, on the copy the migration works on.

   Imports: never import migrate.js, migrate192.js, state.js or reset.js here (directly or through another module):
   migrate.js imports this list while it is itself being evaluated, so the cycle would meet an uninitialised binding.
   Import leaf modules only (e.g. util.js, markers.js, a module of your own that imports none of those four). © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export default [];
