/* tabkeys.js — keyboard behaviour of every screen's tab list (1.9.0, Atlas).

   The screens draw their sub-tabs as <div role="tablist"> with <button role="tab" aria-selected>. This module gives all
   of them the WAI-ARIA tab pattern without touching the screens: a roving tabindex (only the selected tab is in the Tab
   order), and Left/Right arrows, Home and End move to another tab and select it (selection follows focus). A screen
   redraws itself when a tab is chosen, so the focus is put back on the same tab of the new list. The Scenario editor's
   tab list has its own handler (scenario.js) and is left alone.
   © 2026 Marc-André Léger. */
'use strict';

const OWN = '.scen-tabs';
const tabsOf = list => [...list.children].filter(n => n.getAttribute('role') === 'tab');

/** Put only the selected tab (or the first) in the Tab order. */
function rove(list) {
  const tabs = tabsOf(list);
  if (!tabs.length) return;
  const cur = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
  for (const t of tabs) t.tabIndex = t === cur ? 0 : -1;
}

function decorate(root) {
  const lists = root.matches?.('[role=tablist]') ? [root] : [...(root.querySelectorAll?.('[role=tablist]') || [])];
  for (const l of lists) if (!l.matches(OWN)) rove(l);
}

const MOVE = { ArrowRight: 1, ArrowLeft: -1, Home: 'first', End: 'last' };

function onKey(e) {
  const tab = e.target.closest?.('[role=tab]');
  const list = tab?.parentElement;
  if (!tab || !list || list.getAttribute('role') !== 'tablist' || list.matches(OWN)) return;
  const mv = MOVE[e.key];
  if (mv === undefined || e.altKey || e.ctrlKey || e.metaKey) return;
  const tabs = tabsOf(list), i = tabs.indexOf(tab), n = tabs.length;
  if (i < 0 || !n) return;
  e.preventDefault();
  const j = mv === 'first' ? 0 : mv === 'last' ? n - 1 : (i + mv + n) % n;
  const host = list.closest('section') || document.body, nth = [...host.querySelectorAll('[role=tablist]')].indexOf(list);
  tabs[j].focus();
  tabs[j].click();
  // the screen may have drawn a new tab list: give the focus to the same tab there
  const refocus = () => {
    if (document.activeElement?.closest?.('[role=tablist]')) return;
    const nl = [...host.querySelectorAll('[role=tablist]')][nth];
    const t = nl && tabsOf(nl)[j];
    if (t) t.focus();
  };
  requestAnimationFrame(() => { refocus(); setTimeout(refocus, 120); });
}

let queued = false;
/** Watch the page: every tab list drawn now or later gets the roving tabindex; arrow keys are handled once, here. */
export function init() {
  document.addEventListener('keydown', onKey);
  decorate(document);
  new MutationObserver(muts => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; decorate(document); });
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-selected'] });
}
