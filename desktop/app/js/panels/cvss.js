/* CVSS v4.0 Base score — Base metrics only (constraint C2). © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n2, kpi, banner, card, pill, field, copyText, go, toast } from '../util.js';
import { S, touch, scen } from '../state.js';

const CVSS_LABEL = { AV: 'Attack Vector', AC: 'Attack Complexity', AT: 'Attack Requirements', PR: 'Privileges Required', UI: 'User Interaction',
  VC: 'Vuln. Confidentiality', VI: 'Vuln. Integrity', VA: 'Vuln. Availability', SC: 'Subseq. Confidentiality', SI: 'Subseq. Integrity', SA: 'Subseq. Availability' };
const DEFAULT = { AV: 'N', AC: 'L', AT: 'N', PR: 'N', UI: 'N', VC: 'H', VI: 'H', VA: 'H', SC: 'N', SI: 'N', SA: 'N' };
let picked = Object.assign({}, DEFAULT);

function parseVec(v) {
  const out = {};
  for (const part of String(v || '').split('/').slice(1)) { const [k, x] = part.split(':'); if (CVSS4.BASE.includes(k)) out[k] = x; }
  return out;
}

export function render(sec, arg) {
  let target = null;
  if (arg) { const [v, sid] = arg.split('|'); const p = parseVec(v); if (Object.keys(p).length) picked = Object.assign({}, DEFAULT, p); target = sid && scen(sid) ? sid : null; }
  sec.replaceChildren(el('h1', null, 'CVSS v4.0 Base score'),
    el('p', 'lede', el('span', null, 'Base metrics only. Threat metrics (', el('span', 'mono', 'E:A'), ', ', el('span', 'mono', 'E:P'), ', ', el('span', 'mono', 'E:U'),
      ') and Environmental metrics are deliberately absent — the CRG formula multiplies CVSS and ', el('span', 'mono', 'Pb(ψ,A)'), ', so exploitation evidence counted in both compounds.')));
  const grid = el('div', 'grid g4', { id: 'cvss-metrics' });
  const vec = el('input', { type: 'text', id: 'cvss-vector', class: 'mono' });
  const out = el('div', 'grid g3', { id: 'cvss-out' });
  const update = () => {
    for (const m of CVSS4.BASE) picked[m] = document.getElementById('cv-' + m).value;
    vec.value = CVSS4.build(picked);
    out.replaceChildren();
    let sc; try { sc = CVSS4.score(vec.value); } catch (e) { out.append(banner('bad', 'Invalid vector', String(e.message || e))); return; }
    const sev = CVSS4.severity(sc);
    out.append(kpi('Base score', n2(sc)), kpi('Severity', pill(sev, sc >= 7 ? 'bad' : sc >= 4 ? 'warn' : 'good')), kpi('Metric group', 'Base only', 'Threat and Environmental deliberately absent'));
  };
  for (const m of CVSS4.BASE) {
    const s = el('select', { id: 'cv-' + m });
    for (const v of CVSS4.VALUES[m]) s.append(new Option(v, v, false, picked[m] === v));
    s.addEventListener('change', update);
    grid.append(field(`<b>${m}</b> ${CVSS_LABEL[m] || ''}`, s));
  }
  vec.addEventListener('change', () => { const p = parseVec(vec.value); for (const [k, v] of Object.entries(p)) { const s = document.getElementById('cv-' + k); if (s) s.value = v; } update(); });
  const copyBtn = el('button', { class: 'btn ghost', id: 'cvss-copy', onclick: () => copyText(vec.value, copyBtn) }, 'Copy');
  sec.append(card(grid, el('div', 'row', { style: { marginTop: '14px' } },
    el('div', { style: { flex: '1 1 420px' } }, field('<b>Vector</b> — paste one to load it', vec)), copyBtn,
    el('button', { class: 'btn ghost', id: 'cvss-send', onclick: () => { go('calc'); setTimeout(() => { const i = document.getElementById('p-cvss'); if (i) { i.value = vec.value; document.getElementById('risk-run')?.click(); } }, 60); } }, 'Send to calculator'),
    target ? el('button', { class: 'btn', onclick: () => { const s = scen(target); s.cvss = vec.value; delete s.cvss_score; touch(); toast('Vector saved to ' + target); go('scenario/' + target); } }, 'Save to ' + target) : null)), out);
  update();
}
