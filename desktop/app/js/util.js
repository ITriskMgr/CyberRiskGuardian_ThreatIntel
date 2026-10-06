/* util.js — DOM and formatting helpers. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export const $ = id => document.getElementById(id);
export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/** el('div', 'cls', 'text') or el('div', {class, title, ...attrs}, child, child...) */
export function el(tag, a, ...kids) {
  const n = document.createElement(tag);
  // el('div', 'cls', {attrs}, ...kids) — a class string followed by an attribute object
  if ((typeof a === 'string' || a === null) && kids.length && kids[0] && typeof kids[0] === 'object' && !(kids[0] instanceof Node) && !Array.isArray(kids[0])) {
    a = Object.assign({}, kids.shift(), a ? { class: a } : {});
  }
  if (typeof a === 'string') n.className = a;
  else if (a && typeof a === 'object') {
    for (const [k, v] of Object.entries(a)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k in n && typeof v !== 'string') n[k] = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const k of kids.flat()) {
    if (k === undefined || k === null || k === false) continue;
    n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return n;
}

// 1.5.2 — numbers follow the interface language (en-US grouping in English, fr-CA in French).
const LOC = () => (document.documentElement.lang === 'fr' ? 'fr-CA' : 'en-US');
const fmt = (x, o) => Number.isFinite(Number(x)) ? Number(x).toLocaleString(LOC(), o) : '—';
export const n0 = x => fmt(x, { maximumFractionDigits: 0 });
export const n1 = x => fmt(x, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const n2 = x => fmt(x, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const pct = (x, d = 1) => Number.isFinite(Number(x)) ? (LOC() === 'fr-CA' ? (Number(x) * 100).toFixed(d).replace('.', ',') + ' %' : (Number(x) * 100).toFixed(d) + '%') : '—';
// 1.5.4 — amounts use one format in every language and on every screen: the English one ($123,423).
export const n0en = x => Number.isFinite(Number(x)) ? Number(x).toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—';
export const money = (x, cur = '') => !Number.isFinite(Number(x)) ? '—' : (cur && cur !== 'CAD' && cur !== 'USD' ? cur + ' ' : '$') + n0en(x);
export const today = () => new Date().toISOString().slice(0, 10);
export const uid = (p = 'id') => p + '-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
export const clamp01 = x => Math.max(0, Math.min(1, x));
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function kpi(k, v, s, kind) {
  const c = el('div', 'kpi' + (kind ? ' ' + kind : ''));
  c.append(el('div', 'k', k));
  const vv = el('div', 'v'); if (v instanceof Node) vv.append(v); else vv.textContent = v; c.append(vv);
  if (s) c.append(el('div', 's', s));
  return c;
}
export const pillFor = cls => !cls ? '' : cls.startsWith('Below') ? 'good' : cls.startsWith('Approximately') ? 'warn' : 'bad';
export const pill = (text, kind) => el('span', 'pill ' + (kind || ''), text);
export function banner(kind, title, body) {
  const b = el('div', 'banner ' + kind); b.append(el('b', null, title));
  if (body instanceof Node) b.append(body); else if (body) b.append(document.createTextNode(body));
  return b;
}
export function card(...kids) { return el('div', 'card', ...kids); }

export function download(name, data, type = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const a = el('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}

export async function copyText(text, btn) {
  try { await navigator.clipboard.writeText(text); if (btn) flash(btn, 'Copied'); return true; }
  catch { if (btn) flash(btn, 'Copy failed'); return false; }
}
export function flash(btn, label, ms = 1800) {
  const old = btn.dataset.label || btn.textContent; btn.dataset.label = old; btn.textContent = label;
  clearTimeout(btn._t); btn._t = setTimeout(() => { btn.textContent = old; }, ms);
}

let toastT;
export function toast(msg, kind = 'good') {
  let t = $('toast');
  if (!t) { t = el('div', { id: 'toast', role: 'status' }); document.body.append(t); }
  t.className = 'show ' + kind; t.textContent = msg;
  clearTimeout(toastT); toastT = setTimeout(() => { t.className = ''; }, 2600);
}

/** Simple sortable table builder. cols: [{key, label, num, render(row), sort(row)}] */
export function table(cols, rows, opts = {}) {
  const t = el('table', opts.class || null);
  const thead = el('thead'), hr = el('tr');
  let sortKey = opts.sortKey ?? null, dir = opts.sortDir ?? 1;
  const tb = el('tbody');
  const draw = () => {
    let rs = rows.slice();
    if (sortKey !== null) {
      const c = cols.find(c => c.key === sortKey);
      const f = c.sort || (r => r[c.key]);
      rs.sort((a, b) => { const x = f(a), y = f(b); return (x > y ? 1 : x < y ? -1 : 0) * dir; });
    }
    tb.replaceChildren(...rs.map((r, i) => {
      const tr = el('tr');
      if (opts.rowClass) { const rc = opts.rowClass(r); if (rc) tr.className = rc; }
      if (opts.onRow) { tr.classList.add('click'); tr.addEventListener('click', e => { if (!e.target.closest('input,button,a,select')) opts.onRow(r, e); }); }
      for (const c of cols) {
        const td = el('td', c.num ? 'num' : (c.cls || null));
        const v = c.render ? c.render(r, i) : r[c.key];
        if (v instanceof Node) td.append(v); else td.textContent = v ?? '';
        tr.append(td);
      }
      return tr;
    }));
  };
  for (const c of cols) {
    const th = el('th', c.num ? 'num' : null);
    if (c.labelNode) th.append(c.labelNode); else th.textContent = c.label;
    if (c.sortable !== false && !c.labelNode) {
      th.classList.add('sortable');
      th.addEventListener('click', () => { if (sortKey === c.key) dir = -dir; else { sortKey = c.key; dir = c.num ? -1 : 1; } draw(); });
    }
    hr.append(th);
  }
  thead.append(hr); t.append(thead, tb); draw();
  t.redraw = (newRows) => { if (newRows) rows = newRows; draw(); };
  return t;
}

export function field(label, input, hint) {
  const d = el('div', 'field');
  const l = el('label'); if (label instanceof Node) l.append(label); else l.innerHTML = label;
  d.append(l, input); if (hint) d.append(el('div', 'hint', hint));
  return d;
}
export function input(attrs) { return el('input', attrs); }
export function select(options, value, attrs = {}) {
  const s = el('select', attrs);
  for (const o of options) {
    const [v, t] = Array.isArray(o) ? o : [o, o];
    const op = new Option(t, v); if (String(v) === String(value)) op.selected = true; s.append(op);
  }
  return s;
}
export function chip(text, opts = {}) {
  const c = el(opts.href ? 'a' : 'span', { class: 'chip ' + (opts.kind || ''), href: opts.href, title: opts.title });
  c.append(el('span', null, text));
  if (opts.onRemove) c.append(el('button', { class: 'x', title: 'Remove', 'aria-label': 'Remove ' + text,
    onclick: e => { e.preventDefault(); e.stopPropagation(); opts.onRemove(); } }, '×'));
  return c;
}

export function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',' || c === '\t') { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim() !== ''));
}
export function toCSV(rows) {
  return rows.map(r => r.map(v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(',')).join('\n');
}

export const val = x => (x && typeof x === 'object' ? x.v : x);
export const debounce = (f, ms = 250) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), ms); }; };
export const go = p => { location.hash = '#/' + p; };
/** Re-render the active screen after a change made outside it. */
export const redraw = () => window.dispatchEvent(new HashChangeEvent('hashchange'));

/* Conditional children: let append()/replaceChildren() skip null, undefined and false, so screens can write
   el.append(a, cond ? b : null). Applied once, to this app's own document only. */
for (const proto of [Element.prototype, DocumentFragment.prototype]) {
  for (const m of ['append', 'replaceChildren', 'prepend']) {
    const orig = proto[m];
    if (orig && !orig._crg) { const f = function (...k) { return orig.apply(this, k.filter(x => x !== null && x !== undefined && x !== false)); }; f._crg = true; proto[m] = f; }
  }
}

/** 1.5.2 — a simple modal dialog. Returns { back, box, close }. */
export function modal(title, ...kids) {
  const back = el('div', { class: 'modal-back', role: 'dialog', 'aria-modal': 'true', 'aria-label': title });
  const close = () => { back.remove(); document.removeEventListener('keydown', esc); back.onclose?.(); };
  const esc = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', esc);
  const box = el('div', 'modal wide',
    el('div', 'row', { style: { alignItems: 'center' } }, el('h2', { style: { flex: 1, margin: 0 } }, title),
      el('button', { class: 'btn sm ghost', 'data-ro-ok': '', 'aria-label': 'Close', onclick: close }, '×')), ...kids);
  back.append(box); document.body.append(back);
  return { back, box, close };
}
