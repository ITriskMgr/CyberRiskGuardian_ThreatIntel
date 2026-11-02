/* SSVC decisions — Vulnerabilities → SSVC (1.9.0). One decision record per registered vulnerability,
   on the tree chosen for the workspace, with EPSS and KEV as evidence for the Exploitation decision point.
   An SSVC outcome is a response priority. It is never converted into a likelihood and never changes a
   parameter: the risk totals are the same before and after any decision.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, card, kpi, pill, select, toast, banner, table, field, download, toCSV, today } from '../util.js';
import { S, touch } from '../state.js';
import * as SV from '../ssvc.js';
import * as store from '../store.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

let items = null;            // feed items, read once per visit from the Threat feeds cache
async function feedItems() {
  if (items) return items;
  const c = await store.get('blob', 'feeds:items').catch(() => null);
  items = Object.values(c?.bySrc || {}).flatMap(x => x.items || []);
  setTimeout(() => { items = null; }, 60000);
  return items;
}

const outcomePill = (k, extra = '') => k ? pill(SV.outcomeLabel(k) + extra, SV.OUTCOMES[k]?.kind || '') : pill('not decided', '');

export async function render(body, sec, arg) {
  const ws = S.ws; SV.ensure(ws);
  const its = await feedItems();
  const tree = SV.treeOf(ws), T = SV.TREES[tree];
  const sum = SV.summary(ws);
  const focus = arg && arg !== 'ssvc' ? arg.replace(/^ssvc\//, '') : null;

  const treeSel = select(SV.TREE_IDS.map(id => [id, SV.TREES[id].label]), tree, { 'aria-label': 'SSVC tree for this workspace' });
  treeSel.addEventListener('change', () => { SV.setTree(ws, treeSel.value); users.audit('SSVC tree changed', treeSel.value, ws); touch(); body.replaceChildren(); render(body, sec, arg); });
  body.append(
    banner('warn', 'A response priority, not a likelihood', 'SSVC says how soon to respond to a vulnerability. Its outcome is never converted into a probability and never changes Pb(A), Pb(ψ,A) or any other parameter. EPSS and CISA KEV are evidence for the Exploitation decision point only.'),
    card(el('h2', null, 'SSVC decision tree for this workspace'),
      el('div', 'grid g2', field('Tree', treeSel), el('div', 'small muted', { 'data-noi18n': '' }, T.source)),
      el('p', 'note', 'Deployer — CISA SSVC is the default: Exploitation, Automatable, Technical Impact and Mission & Well-being lead to Track, Track*, Attend or Act. The CERT/CC deployer tree uses System Exposure and Human Impact instead; the supplier tree is for organizations that develop the software. Both CERT/CC trees lead to Defer, Scheduled, Out-of-Cycle or Immediate. Decisions taken on another tree are kept and marked for review.'),
      el('div', 'grid g5', kpi('Decided', `${n0(sum.decided)} / ${n0(sum.total)}`, 'on this tree'),
        ...T.outcomes.map(o => kpi(SV.outcomeLabel(o), n0(sum.by[o]), SV.OUTCOMES[o].meaning.split(';')[0], sum.by[o] && SV.OUTCOMES[o].rank >= 2 ? 'bad' : '')))));

  const V = ws.vulns || [];
  if (!V.length) { body.append(card(el('div', 'empty-state', el('b', null, 'The register is empty'), 'Add vulnerabilities in the CVE register first; each one gets its own SSVC decision.'))); return; }
  const rows = V.map(v => { const sug = SV.suggestExploitation(v, S.snap, its); const d = SV.decisionFor(ws, v.id); return { v, sug, d, st: SV.stale(d, ws, sug) }; });
  const form = el('div');
  const open = r => { drawForm(form, r, sec, body, arg); form.scrollIntoView?.({ block: 'nearest' }); };
  body.append(card(el('h2', null, 'Decisions by vulnerability'),
    el('div', 'tablewrap', table([
      { key: 'id', label: 'Vulnerability', render: r => el('div', null, el('a', { href: '#/vulns/' + r.v.id, class: 'mono' }, r.v.id), el('div', { class: 'small muted', 'data-noi18n': '' }, (r.v.title || r.v.product || '').slice(0, 60))), sort: r => r.v.id },
      { key: 'exp', label: 'Exposed', render: r => r.v.exposed ? 'yes' : 'no', sort: r => r.v.exposed ? 1 : 0 },
      { key: 'ev', label: 'Evidence (KEV · EPSS · PoC)', sortable: false, render: r => el('div', 'small', r.sug.kev ? pill('KEV', 'bad') : null, ' ', r.sug.epss ? `EPSS ${(r.sug.epss[0] * 100).toFixed(1)}%` : '', r.sug.poc ? el('span', null, ' · ', tr('PoC in feeds')) : '') },
      { key: 'sug', label: 'Exploitation suggested', render: r => SV.valueLabel('exploitation', r.sug.value), sort: r => ['none', 'public poc', 'active'].indexOf(r.sug.value) },
      { key: 'out', label: 'SSVC outcome', render: r => el('div', null, r.d && r.d.tree === SV.treeOf(ws) ? outcomePill(r.d.outcome) : r.d ? pill('other tree — review', 'warn') : outcomePill(null), r.st ? el('div', 'small', pill('review', 'warn')) : null), sort: r => r.d ? (SV.OUTCOMES[r.d.outcome]?.rank ?? -1) : -1 },
      { key: 'by', label: 'Decided by · date', render: r => r.d ? el('span', 'small', `${r.d.by} · ${r.d.date}`) : '—', sort: r => r.d?.date || '' },
      { key: 'x', label: '', sortable: false, render: r => el('button', { class: 'btn sm ' + (r.d ? 'ghost' : ''), onclick: () => open(r) }, r.d ? 'Review' : 'Decide') },
    ], rows, { sortKey: 'out', sortDir: -1, class: 'compact' })),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn ghost', disabled: !sum.decided, onclick: () => download('ssvc-decisions.csv', toCSV([['vulnerability', 'tree', 'outcome', 'exploitation', 'exploitation_suggested', 'override_justification', 'points', 'derived', 'by', 'date', 'justification', 'kev', 'epss', 'snapshot'],
        ...rows.filter(r => r.d).map(r => [r.v.id, r.d.tree, SV.outcomeLabel(r.d.outcome), r.d.points.exploitation, r.d.evidence?.suggested ?? '', r.d.override?.justification ?? '',
          Object.entries(r.d.points).map(([k, x]) => k + '=' + x).join('; '), Object.entries(r.d.derived).map(([k, x]) => k + '=' + x).join('; '), r.d.by, r.d.date, r.d.justification,
          r.d.evidence?.kev ? 'listed ' + r.d.evidence.kev.added : '', r.d.evidence?.epss ? r.d.evidence.epss[0] : '', r.d.evidence?.snapshot ?? ''])])) }, 'Export decisions (CSV)')),
    el('p', 'note', 'One decision record per vulnerability: the decision points and their values, who decided, when, the justification and the outcome. A new decision keeps the previous one in its history. "Review" appears when the tree changed or when the evidence now points to a stronger Exploitation value.')), form);
  const f = focus && rows.find(r => r.v.id === focus);
  if (f) drawForm(form, f, sec, body, arg);
}

function drawForm(box, r, sec, body, arg) {
  const ws = S.ws, tree = SV.treeOf(ws), T = SV.TREES[tree];
  const cur = r.d && r.d.tree === tree ? Object.assign({}, r.d.points) : {};
  const pts = Object.assign({}, cur);
  if (!pts.exploitation) pts.exploitation = r.sug.value;
  const outBox = el('div'), derivedBox = el('div', 'small');
  const just = el('textarea', { rows: 2, placeholder: 'Why these values — required when Exploitation differs from the evidence', 'data-noi18n': '' });
  just.value = r.d?.justification || '';
  const by = el('input', { value: users.name() || r.d?.by || '', placeholder: 'Name of the person deciding', 'data-noi18n': '' });
  const redraw = () => {
    const e = SV.evaluate(tree, pts);
    derivedBox.replaceChildren(...Object.entries(e.derived).map(([k, x]) => el('div', null, el('b', null, SV.POINTS[k].label + ': '), x ? SV.valueLabel(k, x) : '—')));
    const ov = pts.exploitation !== r.sug.value;
    outBox.replaceChildren(el('div', 'row', { style: { gap: '10px', alignItems: 'center' } }, el('b', null, 'Outcome'), e.complete ? outcomePill(e.outcome) : pill('incomplete', ''),
      e.complete ? el('span', 'small muted', SV.OUTCOMES[e.outcome].meaning) : el('span', 'small muted', tr('Still to set: {0}').replace('{0}', e.missing.map(k => tr(SV.POINTS[k]?.label || k)).join(', ')))),
      ov ? banner('warn', 'Exploitation overridden', 'The evidence suggests ' + tr(SV.valueLabel('exploitation', r.sug.value)) + '. Say why in the justification; the record keeps both values.') : null);
  };
  const grid = el('div', 'grid g3');
  for (const k of T.inputs) {
    const P = SV.POINTS[k];
    const s = select([['', '—'], ...P.values.map(v => [v[0], v[1]])], pts[k] || '', { 'aria-label': P.label });
    const hint = el('div', 'hint', P.values.find(v => v[0] === pts[k])?.[2] || '');
    s.addEventListener('change', () => { pts[k] = s.value; hint.textContent = tr(P.values.find(v => v[0] === s.value)?.[2] || ''); redraw(); });
    grid.append(el('div', 'field', el('label', null, P.label), s, hint));
  }
  box.replaceChildren(card(el('h2', null, tr('SSVC decision — {0}').replace('{0}', r.v.id)),
    el('div', { class: 'small muted', 'data-noi18n': '' }, T.source),
    el('div', { style: { margin: '10px 0' } }, el('b', null, 'Evidence for Exploitation'), el('ul', 'small', ...r.sug.basis.map(b => el('li', null, b))),
      el('div', 'small', tr('Suggested value: {0}').replace('{0}', tr(SV.valueLabel('exploitation', r.sug.value))), ' — ', tr('KEV listed → Active; EPSS high or a public PoC in the feeds → Public PoC; otherwise None.'))),
    grid, derivedBox, el('div', { style: { margin: '10px 0' } }, outBox),
    el('div', 'grid g2', field('Decided by', by), field('Justification', just)),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', onclick: () => {
        try {
          const rec = SV.decide(ws, r.v.id, { tree, points: pts, by: by.value, justification: just.value, suggestion: r.sug });
          users.audit('SSVC decision recorded', `${r.v.id} → ${rec.outcome}`, ws); touch();
          toast(tr('SSVC decision recorded: {0}').replace('{0}', r.v.id + ' → ' + tr(SV.outcomeLabel(rec.outcome))));
          body.replaceChildren(); render(body, sec, 'ssvc');
        } catch (e) { toast(String(e.message || e), 'bad'); }
      } }, 'Record the decision'),
      el('button', { class: 'btn ghost', onclick: () => box.replaceChildren() }, 'Close')),
    r.d?.history?.length ? el('details', null, el('summary', null, tr('Earlier decisions ({0})').replace('{0}', r.d.history.length)),
      el('ul', 'small', ...r.d.history.slice().reverse().map(h => el('li', null, `${h.date} · ${h.by} · ${SV.TREES[h.tree]?.short || h.tree} → `, outcomePill(h.outcome), h.justification ? el('span', { 'data-noi18n': '' }, ' — ' + h.justification) : null)))) : null));
  redraw();
}
