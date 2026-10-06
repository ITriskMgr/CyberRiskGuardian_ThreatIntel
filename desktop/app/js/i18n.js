/* i18n.js — interface languages (1.5.2). English is the source language; French ships with 1.5.2.

   How it works. Screens are written in English. When another language is chosen, every piece of
   interface text that appears on the page — text nodes and the placeholder, title and aria-label
   attributes — is looked up in that language's catalogue and replaced; switching back restores the
   English original, which is kept on the node. A MutationObserver applies the same lookup to
   everything drawn later, so no screen has to know about translation.

   What is NOT translated. Only strings found in the catalogue change. The values of inputs and text
   areas are never touched, and nothing a user typed or a case document contains is in a catalogue,
   so organization data, scenario text, case content and AI answers stay in their original language.
   Elements marked data-noi18n (and their descendants) are skipped entirely.

   Catalogue keys. Exact English strings; '#' stands for a number ("# candidates added to the grid");
   {0}, {1}… stand for any text ("Open {0}"). Adding a language = one file js/i18n/<code>.js exporting
   such a map, plus one line in LANGS. tools/i18n_coverage.py reports what a catalogue still misses.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as prefs from './prefs.js';

export const LANGS = [
  { code: 'en', label: 'EN', name: 'English', locale: 'en-CA' },
  { code: 'fr', label: 'FR', name: 'Français', locale: 'fr-CA' },
];
const LOADERS = { fr: () => import('./i18n/fr.js') };

let lang = 'en', exact = new Map(), numbered = new Map(), patterns = [], byHead = new Map(), loose = [];
const ATTRS = ['placeholder', 'title', 'aria-label'];
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT', 'CODE', 'PRE']);
const NUM = /[+\-−]?\d[\d  ,. ]*\d|\d/g;
const enAttr = new WeakMap();          // element → {attr: english}
let observer = null, busy = false, missing = null;

export const current = () => lang;
export const locale = () => (LANGS.find(l => l.code === lang) || LANGS[0]).locale;
export const isFR = () => lang === 'fr';

function compile(cat) {
  exact = new Map(); numbered = new Map(); patterns = []; byHead = new Map(); loose = [];
  for (const [k, v] of Object.entries(cat)) {
    if (/\{\d+\}/.test(k)) {
      const order = [...k.matchAll(/\{(\d+)\}|#/g)].map(m => m[1] === undefined ? '#' : +m[1]);
      const src = k.split(/(\{\d+\}|#)/).map(p => p === '#' ? '([+\\-−]?\\d[\\d\\u202f\\u00a0,. ]*\\d|\\d)' : /^\{\d+\}$/.test(p) ? '([\\s\\S]+?)' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
      const p = { re: new RegExp('^' + src + '$'), order, fr: v, first: k.split(/\{\d+\}|#/)[0].slice(0, 4) };
      patterns.push(p);
      if (p.first.length === 4) { if (!byHead.has(p.first)) byHead.set(p.first, []); byHead.get(p.first).push(p); } else loose.push(p);
    } else if (k.includes('#')) numbered.set(k, v);
    else exact.set(k, v);
  }
}

/** Translate one English string (trimmed core); returns null when the catalogue has nothing. */
export function lookup(s) {
  if (lang === 'en' || !s) return null;
  const hit = exact.get(s);
  if (hit !== undefined) return hit;
  if (/\d/.test(s)) {
    const nums = s.match(NUM) || [];
    const key = s.replace(NUM, '#');
    const v = numbered.get(key);
    if (v !== undefined) { let i = 0; return v.replace(/#/g, () => nums[i++] ?? '#'); }
  }
  for (const p of [...(byHead.get(s.slice(0, 4)) || []), ...loose]) {
    if (p.first && !s.startsWith(p.first)) continue;
    const m = p.re.exec(s);
    if (!m) continue;
    const vals = {}; const nums = [];
    p.order.forEach((o, i) => { if (o === '#') nums.push(m[i + 1]); else vals[o] = m[i + 1]; });
    let j = 0;
    return p.fr.replace(/\{(\d+)\}|#/g, (all, n) => n === undefined ? (nums[j++] ?? '#') : (tr(vals[n]) ?? vals[n] ?? all));
  }
  return null;
}
/** lookup() plus forgiving fallbacks: inner whitespace, surrounding punctuation, and lists joined by " · " or " + ". */
function lookupLoose(s, depth = 0) {
  let v = lookup(s);
  if (v != null || depth > 1) return v;
  const w = s.replace(/\s+/g, ' ');
  if (w !== s && (v = lookup(w)) != null) return v;
  const m = /^([—–·,:;(•\-\s]*)([\s\S]*?)([\s.:;,)…→]*)$/.exec(w);
  if (m && (m[1] || m[3]) && m[2] && (v = lookup(m[2])) != null) return m[1] + v + (m[3] === ':' ? '\u00a0:' : m[3]);
  for (const sep of [' · ', ' + ', '; ']) {
    if (!w.includes(sep)) continue;
    const parts = w.split(sep), out = parts.map(x => lookupLoose(x, depth + 1));
    if (out.some(x => x != null)) return out.map((x, i) => x ?? parts[i]).join(sep);
  }
  return null;
}
/** Translate a string for code that builds text itself (confirm dialogs, downloads, AI instructions). */
export function tr(s) {
  if (lang === 'en' || s == null) return s;
  const str = String(s), lead = str.match(/^\s*/)[0], trail = str.match(/\s*$/)[0];
  const core = str.trim();
  const v = lookupLoose(core);
  return v == null ? str : lead + v + trail;
}
export const t = tr;

function skip(node) {
  for (let e = node.nodeType === 1 ? node : node.parentElement; e; e = e.parentElement) {
    if (SKIP_TAGS.has(e.tagName) || e.isContentEditable) return true;
    if (e.hasAttribute && e.hasAttribute('data-noi18n')) return true;
  }
  return false;
}
function doText(n) {
  if (n.__crgEn === undefined) { if (!n.nodeValue.trim()) return; n.__crgEn = n.nodeValue; }
  const en = n.__crgEn;
  if (lang === 'en') { if (n.nodeValue !== en) n.nodeValue = en; return; }
  if (n.__crgOut !== undefined && n.nodeValue !== n.__crgOut) { n.__crgEn = n.nodeValue; }   // the app rewrote it
  const src = n.__crgEn, out = tr(src);
  if (out !== src) { n.nodeValue = out; n.__crgOut = out; }
  else { n.__crgOut = undefined; if (missing && src.trim().length > 1 && /[a-z]{2}/i.test(src)) missing.add(src.trim()); }
}
function doAttrs(e) {
  let rec = enAttr.get(e);
  for (const a of ATTRS) {
    if (!e.hasAttribute(a)) continue;
    const v = e.getAttribute(a);
    if (!rec) { rec = {}; enAttr.set(e, rec); }
    if (rec[a] === undefined || (rec['_' + a] !== undefined && v !== rec['_' + a])) rec[a] = v;
    const en = rec[a];
    const out = lang === 'en' ? en : tr(en);
    if (out !== v) e.setAttribute(a, out);
    rec['_' + a] = out;
    if (lang !== 'en' && out === en && missing && /[a-z]{3}/i.test(en)) missing.add(en);
  }
  if (e.tagName === 'INPUT' && (e.type === 'button' || e.type === 'submit') && e.value) {
    if (!rec) { rec = {}; enAttr.set(e, rec); }
    if (rec.value === undefined) rec.value = e.value;
    e.value = lang === 'en' ? rec.value : tr(rec.value);
  }
}
export function translateTree(root) {
  if (root?.nodeType === 1 && root.tagName === 'TEXTAREA' && !root.closest('[data-noi18n]')) { doAttrs(root); return; }
  if (!root || skip(root)) return;
  if (root.nodeType === 3) { doText(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 11) return;
  if (root.nodeType === 1) doAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
    acceptNode: n => {
      if (n.nodeType !== 1) return NodeFilter.FILTER_ACCEPT;
      if (n.hasAttribute('data-noi18n')) return NodeFilter.FILTER_REJECT;
      if (n.tagName === 'TEXTAREA') { doAttrs(n); return NodeFilter.FILTER_REJECT; }   // placeholder yes, content never
      return SKIP_TAGS.has(n.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; } });
  let n; while ((n = w.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
}
function observe() {
  if (observer) return;
  observer = new MutationObserver(muts => {
    if (busy) return;
    busy = true;
    try {
      for (const m of muts) {
        if (m.type === 'childList') for (const n of m.addedNodes) { if (!skip(n)) translateTree(n); }
        else if (m.type === 'characterData') { const n = m.target; if (n.nodeValue !== n.__crgOut && !skip(n)) { n.__crgEn = n.nodeValue; doText(n); } }
        else if (m.type === 'attributes' && (m.target.tagName === 'TEXTAREA' ? !m.target.closest('[data-noi18n]') : !skip(m.target))) {
          const rec = enAttr.get(m.target), v = m.target.getAttribute(m.attributeName);
          if (rec && v !== rec['_' + m.attributeName]) { rec[m.attributeName] = v; rec['_' + m.attributeName] = undefined; }
          doAttrs(m.target);
        }
      }
    } finally { busy = false; }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}

/** Switch the interface language. Content is never translated (see header). */
export async function setLang(code, { save = true } = {}) {
  if (!LANGS.some(l => l.code === code)) code = 'en';
  if (code !== 'en') {
    const mod = await LOADERS[code]();
    compile(mod.default || {});
  }
  lang = code;
  document.documentElement.lang = code;
  if (save) prefs.set('lang', code);
  busy = true;
  try { translateTree(document.body); document.title = code === 'en' ? 'CyberRiskGuardian Desktop' : tr('CyberRiskGuardian Desktop'); }
  finally { busy = false; }
  observe();
  window.dispatchEvent(new CustomEvent('crg-lang', { detail: code }));
}
export async function init() {
  // Native dialogs (confirm, prompt, alert) show text that never enters the page: translate it on the way.
  const trMsg = m => { if (lang === 'en' || m == null) return m; const w = tr(String(m)); return w !== String(m) ? w : String(m).split('\n').map(l => tr(l)).join('\n'); };
  for (const k of ['confirm', 'prompt', 'alert']) { const f = window[k]; if (f && !f.__crg) { const g = (msg, ...r) => f.call(window, trMsg(msg), ...r); g.__crg = true; window[k] = g; } }
  await setLang(prefs.get('lang') || 'en', { save: false });
}

/** Coverage helpers (tests and tools): start collecting strings shown without a translation. */
export function collectMissing() { missing = new Set(); return missing; }
export const missingNow = () => [...(missing || [])];

/** Language switch for the top bar: one button per language, scales to any number of languages. */
export function switcher(el) {
  const box = el('div', { class: 'langswitch', role: 'group', 'aria-label': 'Interface language', 'data-noi18n': '' });
  const draw = () => box.replaceChildren(...LANGS.map(l => el('button', {
    class: 'btn ghost sm' + (l.code === lang ? ' on' : ''), 'aria-pressed': String(l.code === lang), title: l.name,
    onclick: () => setLang(l.code).then(draw) }, l.label)));
  draw();
  window.addEventListener('crg-lang', draw);
  return box;
}
