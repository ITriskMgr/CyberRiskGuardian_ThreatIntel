/* Threats — MITRE ATT&CK Enterprise matrix, technique detail with mitigations and CAPEC→CWE links,
   scenario mapping and ATT&CK Navigator export. Offline: data bundled in kb.js.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, n2, kpi, card, pill, chip, select, toast, go, download, banner, table, pillFor } from '../util.js';
import { S, touch, compute, scen, blankScenario, nextScenarioId } from '../state.js';
import { KB, TACTICS, tech, techName, techniquesByTactic, subtechniques, mitigation, cwe, measuresForTechniques, navigatorLayer, THREAT_SOURCES } from '../ontology.js';

let view = 'matrix', onlyLinked = false, q = '';

function usage() {
  const R = compute();
  const map = {};   // technique id (parent-rolled) -> {scen:Set, res}
  const add = (id, r) => { const m = (map[id] ||= { scen: new Set(), res: 0 }); if (!m.scen.has(r.id)) { m.scen.add(r.id); m.res += r.inc ? r.res : 0; } };
  for (const r of R.rows) for (const t of (r.s.attack || [])) { add(t, r); if (t.includes('.')) add(t.split('.')[0], r); }
  return { map, R };
}

export function render(sec, arg) {
  if (arg) view = 'detail';
  sec.replaceChildren(el('h1', null, 'Threats — MITRE ATT&CK'),
    el('p', 'lede', `Scenarios are connected to adversary behaviour through ${KB.meta.attack?.version || 'ATT&CK'} (${n0(KB.meta.attack?.techniques)} techniques and sub-techniques, ${KB.meta.attack?.mitigations} mitigations), linked onward to CAPEC attack patterns and CWE weaknesses. The knowledge base is bundled — browsing it sends nothing anywhere.`));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['matrix', 'Matrix'], ['detail', 'Technique detail'], ['mapping', 'Scenario mapping'], ['sources', 'Threat sources']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; if (k !== 'detail') history.replaceState(null, '', '#/threats'); render(sec, k === 'detail' ? arg : null); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ matrix, detail, mapping, sources }[view])(body, arg, sec);
}

function matrix(body) {
  const { map } = usage();
  const linked = Object.keys(map).filter(k => !k.includes('.')).length;
  const search = el('input', { placeholder: 'Filter techniques — name or ID', value: q });
  const only = el('input', { type: 'checkbox', checked: onlyLinked });
  const grid = el('div', 'matrix');
  const draw = () => {
    grid.replaceChildren();
    for (const t of TACTICS) {
      let ids = techniquesByTactic(t.short);
      if (onlyLinked) ids = ids.filter(id => map[id]);
      if (q) ids = ids.filter(id => (id + ' ' + KB.tech[id].n + ' ' + subtechniques(id).map(s => KB.tech[s].n).join(' ')).toLowerCase().includes(q.toLowerCase()));
      ids.sort((x, y) => (map[y]?.scen.size || 0) - (map[x]?.scen.size || 0) || KB.tech[x].n.localeCompare(KB.tech[y].n));
      const col = el('div', 'col', el('h3', null, t.name, el('small', null, `${t.id} · ${ids.length}`)));
      for (const id of ids) {
        const n = map[id]?.scen.size || 0;
        col.append(el('div', { class: 'cell' + (n >= 4 ? ' h3' : n >= 2 ? ' h2' : n ? ' h1' : ''), title: `${id} ${KB.tech[id].n}${n ? ` — ${n} scenario(s)` : ''}`, onclick: () => go('threats/' + id) },
          el('div', 'tid', id + (n ? ` · ${n} scen.` : '')), KB.tech[id].n));
      }
      grid.append(col);
    }
  };
  search.addEventListener('input', () => { q = search.value; draw(); });
  only.addEventListener('change', () => { onlyLinked = only.checked; draw(); });
  draw();
  body.append(el('div', 'grid g4', kpi('Techniques linked', n0(linked), 'parent techniques used by scenarios'), kpi('Scenarios mapped', `${S.ws.assessment.SCEN.filter(s => s.attack?.length).length} / ${S.ws.assessment.SCEN.length}`),
    kpi('Tactics covered', n0(TACTICS.filter(t => techniquesByTactic(t.short).some(id => map[id])).length) + ' / ' + TACTICS.length), kpi('ATT&CK release', KB.meta.attack?.version?.replace('ATT&CK Enterprise ', '') || '—', 'modified ' + (KB.meta.attack?.modified || ''))),
    card(el('div', 'row', el('div', { style: { flex: '1 1 300px' } }, search), el('label', { style: { display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--ink)', margin: 0 } }, only, 'Only techniques linked to scenarios'),
      el('button', { class: 'btn ghost', onclick: exportNavigator }, 'Export ATT&CK Navigator layer')),
      el('div', 'legend', el('span', null, el('i', { style: { background: 'color-mix(in srgb, var(--warn) 22%, var(--surface))' } }), '1 scenario'), el('span', null, el('i', { style: { background: 'color-mix(in srgb, var(--bad) 30%, var(--surface))' } }), '2–3'), el('span', null, el('i', { style: { background: 'color-mix(in srgb, var(--bad) 55%, var(--surface))' } }), '4 or more'), el('span', null, 'Click a technique for detail, mitigations and linked weaknesses.'))),
    card(grid));
}

function exportNavigator() {
  const { map } = usage();
  const scores = {}, comments = {};
  for (const [k, v] of Object.entries(map)) { scores[k] = v.scen.size; comments[k] = 'Scenarios: ' + [...v.scen].join(', '); }
  download('crg-attack-layer.json', JSON.stringify(navigatorLayer((S.ws.org.name || S.ws.name) + ' — CyberRiskGuardian scenarios', scores, comments), null, 1), 'application/json');
  toast('Navigator layer exported');
}

function detail(body, arg) {
  const id = arg && KB.tech[arg] ? arg : null;
  if (!id) {
    body.append(card(el('div', 'empty-state', el('b', null, 'Choose a technique'), 'Click a cell in the matrix, a threat chip on a scenario, or search below.')));
    const s = el('input', { placeholder: 'Technique ID or name' }); const out = el('div');
    s.addEventListener('input', () => { out.replaceChildren(...Object.keys(KB.tech).filter(k => (k + ' ' + KB.tech[k].n).toLowerCase().includes(s.value.toLowerCase())).slice(0, 20).map(k => el('div', null, el('a', { href: '#/threats/' + k }, k + ' — ' + techName(k))))); });
    body.append(card(s, out));
    return;
  }
  const t = tech(id);
  const { map, R } = usage();
  const u = map[id];
  const parent = t.parent ? tech(t.parent) : null;
  body.append(card(
    el('div', 'row', el('div', { style: { flex: 1 } }, el('div', 'mono small muted', id + (parent ? ' · sub-technique of ' + parent.id : '')), el('h2', { style: { textTransform: 'none', fontSize: '19px', color: 'var(--ink)', margin: '2px 0 8px', letterSpacing: 0 } }, t.fullName)),
      el('a', { class: 'btn ghost sm', href: t.url, target: '_blank', rel: 'noopener' }, 'attack.mitre.org ↗')),
    el('div', 'chips', ...t.tactics.map(x => chip(TACTICS.find(y => y.short === x)?.name || x, { kind: 't' })), ...t.platforms.map(p => chip(p))),
    el('p', null, t.desc),
    el('div', 'small muted', `Used by ${t.groups} tracked intrusion set(s) in ATT&CK — an indication of prevalence, not of likelihood for this organization (Pb(A) still needs organizational evidence).`)));

  const subs = subtechniques(t.parent || id).filter(x => x !== id);
  const mits = t.mitigations.map(mitigation).filter(Boolean);
  const meas = measuresForTechniques([id]);
  const cwes = t.cwe.map(cwe).filter(Boolean);
  body.append(el('div', 'cols2',
    el('div', null,
      card(el('h2', null, `Scenarios using this technique (${u?.scen.size || 0})`),
        u ? el('div', null, ...[...u.scen].map(sid => { const r = R.rows.find(x => x.id === sid); return el('div', 'docrow', el('div', null, el('a', { href: '#/scenario/' + sid }, sid + ' — ' + (r?.name || scen(sid)?.name))), r ? pill(r.cls, pillFor(r.cls)) : ''); }))
          : el('p', 'note', 'No scenario uses this technique yet.'),
        linkToScenario(id)),
      card(el('h2', null, `ATT&CK mitigations (${mits.length})`), mits.length ? el('div', null, ...mits.map(m => el('div', { style: { margin: '8px 0' } }, el('a', { href: m.url, target: '_blank', rel: 'noopener' }, el('b', null, m.id + ' ' + m.name)), el('div', 'small muted', m.desc)))) : el('p', 'note', 'ATT&CK lists no mitigation for this technique (often: cannot be easily mitigated with preventive controls).'),
        meas.length ? el('div', null, el('hr', 'sep'), el('div', 'small muted', 'CyberRiskGuardian measure catalogue entries that implement these mitigations:'), el('div', 'chips', { style: { marginTop: '6px' } }, ...meas.map(m => chip(m.name)))) : null)),
    el('div', null,
      card(el('h2', null, 'Related weaknesses — CWE via CAPEC'), cwes.length ? el('div', 'chips', ...cwes.map(c => chip(c.id + ' ' + c.name, { kind: 'c', href: '#/vulns/' + c.id, title: c.desc }))) : el('p', 'note', 'No CAPEC attack pattern links this technique to a CWE weakness.'),
        t.capec.length ? el('div', 'small muted', { style: { marginTop: '10px' } }, 'CAPEC: ' + t.capec.join(', ')) : null),
      subs.length ? card(el('h2', null, parent ? 'Sibling sub-techniques' : 'Sub-techniques'), el('div', null, ...subs.map(x => el('div', null, el('a', { href: '#/threats/' + x }, x + ' — ' + KB.tech[x].n), map[x] ? el('span', 'small muted', ` · ${map[x].scen.size} scen.`) : '')))) : null,
      parent ? card(el('a', { href: '#/threats/' + parent.id }, '↑ Parent technique: ' + parent.id + ' ' + parent.name)) : null)));
}

function linkToScenario(id) {
  const a = S.ws.assessment;
  const opts = a.SCEN.filter(s => !(s.attack || []).includes(id)).map(s => [s.id, s.id + ' — ' + (s.name || '').slice(0, 60)]);
  const sel = select([['', 'Link to scenario…'], ...opts], '');
  return el('div', 'btnrow', { style: { marginTop: '12px' } }, el('div', { style: { flex: '1 1 260px' } }, sel),
    el('button', { class: 'btn sm', onclick: () => { const s = scen(sel.value); if (!s) return; s.attack.push(id); touch('redraw'); toast(id + ' linked to ' + s.id); } }, 'Link'),
    el('button', { class: 'btn sm ghost', onclick: () => {
      const t = tech(id), s = blankScenario(nextScenarioId());
      s.name = t.fullName + ' against [asset]'; s.attack = [id]; s.cwe = t.cwe.slice(0, 3); s.threat_event = t.fullName;
      s.statement = `A [threat source] uses ${t.fullName.toLowerCase()} (${id}), exploiting [weakness], to affect [asset/process], resulting in [consequence].`;
      a.SCEN.push(s); touch(); go('scenario/' + s.id);
    } }, 'New scenario from this technique'));
}

function mapping(body) {
  const { map, R } = usage();
  const head = el('tr', null, el('th', null, 'Scenario'), ...TACTICS.map(t => el('th', { title: t.name, style: { writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '10.5px', padding: '6px 2px', height: '150px' } }, t.name)), el('th', null, 'Status'));
  const tb = el('tbody');
  for (const r of R.rows) {
    const tacs = {};
    for (const id of r.s.attack || []) for (const x of tech(id)?.tactics || []) (tacs[x] ||= []).push(id);
    tb.append(el('tr', r.inc ? null : 'off', el('td', null, el('a', { href: '#/scenario/' + r.id }, r.id + ' ' + (r.name || '').slice(0, 46))),
      ...TACTICS.map(t => el('td', { style: { textAlign: 'center', background: tacs[t.short] ? 'color-mix(in srgb, var(--bad) 22%, transparent)' : '' }, title: (tacs[t.short] || []).map(techName).join(', ') }, tacs[t.short] ? String(tacs[t.short].length) : '')),
      el('td', null, pill(r.cls, pillFor(r.cls)))));
  }
  const top = Object.entries(map).filter(([k]) => !k.includes('.')).sort((x, y) => y[1].res - x[1].res).slice(0, 12);
  body.append(card(el('h2', null, 'Kill-chain coverage by scenario'), el('div', 'tablewrap', el('table', 'compact', el('thead', null, head), tb)),
    el('p', 'note', 'Counts are techniques per tactic. Unmapped scenarios cannot be compared with threat intelligence or the ATT&CK mitigations.')),
    card(el('h2', null, 'Techniques carrying the most residual risk (included scenarios)'), table([
      { key: 'id', label: 'Technique', render: ([k]) => el('a', { href: '#/threats/' + k }, k + ' ' + techName(k)) },
      { key: 'n', label: 'Scenarios', num: true, render: ([, v]) => n0(v.scen.size), sort: ([, v]) => v.scen.size },
      { key: 'res', label: 'Residual risk (sum)', num: true, render: ([, v]) => n0(v.res), sort: ([, v]) => v.res },
      { key: 'm', label: 'Mitigations', sortable: false, render: ([k]) => el('div', 'chips', ...(tech(k).mitigations.slice(0, 5).map(m => chip(m, { title: mitigation(m)?.name })))) },
    ], top, { sortKey: 'res', sortDir: -1 }),
    el('div', 'btnrow', { style: { marginTop: '10px' } }, el('button', { class: 'btn ghost', onclick: exportNavigator }, 'Export ATT&CK Navigator layer'))));
}

function sources(body) {
  const { R } = usage();
  const groups = {};
  for (const r of R.rows) {
    const src = (r.s.threat_source || 'Unspecified').trim();
    const key = THREAT_SOURCES.find(t => src.toLowerCase().includes(t.label.split(/[ /(]/)[0].toLowerCase()))?.label || src.split(/[.(;]/)[0];
    (groups[key] ||= []).push(r);
  }
  body.append(card(el('h2', null, 'Scenarios grouped by threat source'), table([
    { key: 'src', label: 'Threat source', render: ([k]) => el('b', null, k) },
    { key: 'n', label: 'Scenarios', num: true, render: ([, v]) => n0(v.length), sort: ([, v]) => v.length },
    { key: 'res', label: 'Residual (included)', num: true, render: ([, v]) => n0(v.filter(r => r.inc).reduce((s, r) => s + r.res, 0)), sort: ([, v]) => v.reduce((s, r) => s + r.res, 0) },
    { key: 'ids', label: 'Scenarios', sortable: false, render: ([, v]) => el('div', 'chips', ...v.map(r => chip(r.id, { href: '#/scenario/' + r.id, title: r.name }))) },
  ], Object.entries(groups), { sortKey: 'res', sortDir: -1 })),
  card(el('h2', null, 'Threat-source catalogue'), el('div', 'grid g3', ...THREAT_SOURCES.map(t => el('div', 'opt', el('h4', null, t.label), el('div', 'small muted', 'Typical motive: ' + t.motive))))));
}
