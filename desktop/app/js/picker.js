/* picker.js — type-ahead picker for ATT&CK techniques, CWE entries and CVE identifiers.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, chip } from './util.js';
import { searchTech, techName, searchCwe, cwe, tech } from './ontology.js';

/** A chip list bound to arr, plus a search box. kind: 'attack' | 'cwe' | 'cve' | 'free' */
export function linkEditor(arr, kind, onChange, opts = {}) {
  const wrap = el('div');
  const chips = el('div', 'chips');
  const hrefFor = id => kind === 'attack' ? '#/threats/' + id : kind === 'cwe' || kind === 'cve' ? '#/vulns/' + id : null;
  const titleFor = id => kind === 'attack' ? techName(id) : kind === 'cwe' ? cwe(id)?.name || id : id;
  const drawChips = () => {
    chips.replaceChildren(...arr.map((id, i) => {
      const c = chip(kind === 'attack' || kind === 'cwe' ? id + ' ' + shorten(titleFor(id)) : id,
        { kind: kind === 'attack' ? 't' : kind === 'cwe' ? 'c' : 'v', href: hrefFor(id), title: titleFor(id), onRemove: () => { arr.splice(i, 1); drawChips(); onChange?.(); } });
      return c;
    }));
    if (!arr.length) chips.append(el('span', 'small muted', opts.empty || 'None linked'));
  };
  const box = el('div', 'picker');
  const inp = el('input', { placeholder: opts.placeholder || (kind === 'attack' ? 'Search ATT&CK — e.g. phishing, T1486, valid accounts' : kind === 'cwe' ? 'Search CWE — e.g. 287, authentication, injection' : 'CVE-2026-12345 — press Enter') });
  const res = el('div', 'results'); res.hidden = true;
  let act = -1, items = [];
  const add = id => { id = id.trim(); if (!id) return; if (kind === 'cve') id = id.toUpperCase(); if (!arr.includes(id)) { arr.push(id); onChange?.(); } inp.value = ''; res.hidden = true; drawChips(); };
  const search = () => {
    const q = inp.value;
    items = kind === 'attack' ? searchTech(q, 30) : kind === 'cwe' ? searchCwe(q, 30) : [];
    act = -1;
    res.replaceChildren(...items.map(id => {
      const t = kind === 'attack' ? tech(id) : cwe(id);
      const d = el('div', null, el('span', 'id', id), kind === 'attack' ? t.fullName : t.name,
        kind === 'attack' && t.groups ? el('span', 'small muted', ` · ${t.groups} groups`) : null,
        kind === 'cwe' && t.top25 ? el('span', 'small muted', ` · Top 25 #${t.top25}`) : null);
      d.addEventListener('mousedown', e => { e.preventDefault(); add(id); });
      return d;
    }));
    res.hidden = !items.length || !q.trim();
  };
  inp.addEventListener('input', () => { if (kind === 'attack' || kind === 'cwe') search(); });
  inp.addEventListener('blur', () => setTimeout(() => { res.hidden = true; }, 150));
  inp.addEventListener('keydown', e => {
    const divs = [...res.children];
    if (e.key === 'ArrowDown' && divs.length) { act = Math.min(divs.length - 1, act + 1); divs.forEach((d, i) => d.classList.toggle('act', i === act)); e.preventDefault(); }
    else if (e.key === 'ArrowUp' && divs.length) { act = Math.max(0, act - 1); divs.forEach((d, i) => d.classList.toggle('act', i === act)); e.preventDefault(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (act >= 0 && items[act]) add(items[act]);
      else if (kind === 'cve') { for (const m of inp.value.match(/CVE-\d{4}-\d{4,}/gi) || []) add(m); }
      else if (kind === 'free') add(inp.value);
      else if (items[0]) add(items[0]);
    }
  });
  box.append(inp, res);
  drawChips();
  wrap.append(chips, el('div', { style: { marginTop: '8px' } }, box));
  wrap.refresh = drawChips;
  return wrap;
}
const shorten = s => s && s.length > 38 ? s.slice(0, 36) + '…' : s || '';
