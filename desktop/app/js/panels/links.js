/* Suggested vulnerability links (1.5.3, proof of concept) — a sub-tab of Vulnerabilities, also opened
   from the scenario editor for one scenario. Stage 1 (rules, local) and stage 2 (AI, routed by the
   policy in Settings → AI — local & remote) both land in one review list; nothing is linked until the
   analyst accepts it. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, n0, kpi, card, pill, chip, toast, banner, table, select, field } from '../util.js';
import { S } from '../state.js';
import * as L from '../linker.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

let only = null;            // scenario ids in scope (null = all)
let fConf = 'all', fMethod = 'all', fText = '';

/** Open the review for one scenario (scenario editor). */
export function scope(ids) { only = ids && ids.length ? ids : null; }

const confKind = c => c === 'High' ? 'good' : c === 'Medium' ? 'warn' : '';
const routeLabel = st => !st.ok ? tr('not available') : AI.isLocal(st.provider) ? tr('local model — stays on this computer') : AI.provider(st.provider).label + ' — ' + tr('leaves this computer');

export async function render(body, sec, rerender) {
  const ws = S.ws, d = L.draft(ws);
  const scenSel = select([['', tr('All scenarios') + ` (${ws.assessment.SCEN.length})`], ...ws.assessment.SCEN.map(s => [s.id, `${s.id} — ${String(s.name || '').slice(0, 60)}`])], only?.length === 1 ? only[0] : '', { 'data-noi18n': '', 'aria-label': 'Scenarios in scope', 'data-ro-ok': '' });
  scenSel.addEventListener('change', () => { only = scenSel.value ? [scenSel.value] : null; rerender(); });
  const st = await aiui.status(ws, 'link_vulns');
  const aiInfo = el('span', { class: 'pill ' + (!st.ok ? '' : AI.kindOf(st.provider)) }, 'AI: ' + routeLabel(st));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Suggest links between vulnerabilities and scenarios'),
    el('p', 'note', 'Proposals only. A link exists when you accept it, and a link alone never changes a score: Pb(ψ,A) moves only for exposed CVEs, through the ladder proposals you accept in Threat context.'),
    el('div', 'grid g3', field('Scenarios in scope', scenSel),
      field('Stage 1 — rules', el('div', null, el('button', { class: 'btn', onclick: () => {
        const r = L.byRules(ws, { only });
        L.merge(r.links, ws);
        d.exposure = mergeExposure(d.exposure, r.exposure); d.gaps = r.gaps; d.ran.rules = new Date().toISOString();
        toast(`${r.links.length} ${tr('link(s) proposed by the rules')} · ${r.exposure.length} ${tr('exposure proposal(s)')}`);
        rerender();
      } }, 'Run the rules')), 'On this computer, no AI: assets, weaknesses, ATT&CK techniques and products.'),
      field('Stage 2 — AI', el('div', null, el('button', { class: 'btn ghost', disabled: !st.ok, onclick: async () => {
        const rules = d.links.filter(l => l.method !== 'ai');
        const out = await aiui.request('link_vulns', { only, rules }, { title: tr('Vulnerability linking — what will be sent'), ws });
        if (!out) return;
        try {
          const r = L.parseAI(out.text, ws);
          L.merge(r.links, ws);
          d.doubts = r.doubts; d.noEvidence = r.noEvidence; d.ran.ai = new Date().toISOString(); d.ran.aiEntry = out.entryId;
          toast(`${r.links.length} ${tr('link(s) proposed by AI')}${r.dropped ? ` · ${r.dropped} ${tr('dropped (unknown identifier)')}` : ''}`, r.dropped ? 'warn' : 'good');
        } catch (e) { toast(tr('The AI answer could not be read: ') + (e.message || e), 'bad'); AI.decide(out.entryId, 'rejected', 'unreadable'); }
        rerender();
      } }, 'Ask AI for more links'), ' ', aiInfo), st.ok ? 'You see the exact payload before anything is sent. Routing: Settings → AI — local & remote.' : st.why))));

  // KPIs
  const scopeOk = l => !only || only.includes(l.scen);
  const rows = d.links.filter(scopeOk);
  body.append(el('div', 'grid g5',
    kpi('Proposed links', n0(rows.length), `${rows.filter(r => r.method !== 'ai').length} ${tr('rules')} · ${rows.filter(r => r.method === 'ai').length} AI`),
    kpi('High confidence', n0(rows.filter(r => r.conf === 'High').length), 'ticked by default', 'good'),
    kpi('Exposure proposals', n0(d.exposure.length), 'CVEs an asset lists or runs', d.exposure.length ? 'warn' : ''),
    kpi('Scenarios without evidence', d.gaps ? n0(d.gaps.scenarios.length) : '—', 'no CVE or CWE, none proposed'),
    kpi('CVEs not linked', d.gaps ? n0(d.gaps.vulns.length) : '—', 'register entries no scenario uses')));

  // review table
  const q = el('input', { type: 'search', placeholder: 'Filter — scenario, CVE, CWE, reason', value: fText, 'data-ro-ok': '', style: { flex: '2 1 240px', width: 'auto' } });
  q.addEventListener('input', () => { fText = q.value; draw(); });
  const fc = select([['all', 'All confidence levels'], ['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low']], fConf, { 'data-ro-ok': '', style: { flex: '0 1 200px', width: 'auto' } });
  fc.addEventListener('change', () => { fConf = fc.value; draw(); });
  const fm = select([['all', 'Rules and AI'], ['rules', 'Rules'], ['ai', 'AI']], fMethod, { 'data-ro-ok': '', style: { flex: '0 1 160px', width: 'auto' } });
  fm.addEventListener('change', () => { fMethod = fm.value; draw(); });
  const box = el('div');
  const shown = () => rows.filter(r => (fConf === 'all' || r.conf === fConf) && (fMethod === 'all' || (fMethod === 'ai' ? r.method !== 'rules' : r.method !== 'ai'))
    && (!fText || (r.scen + ' ' + r.id + ' ' + r.why).toLowerCase().includes(fText.toLowerCase())));
  const vOf = id => (ws.vulns || []).find(v => v.id === id);
  function draw() {
    const list = shown();
    box.replaceChildren(list.length ? el('div', 'tablewrap', { style: { maxHeight: '60vh', overflow: 'auto' } }, table([
      { key: 'take', label: '', sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: !!r.take }); c.addEventListener('change', () => { r.take = c.checked; }); return c; } },
      { key: 'scen', label: 'Scenario', render: r => { const s = ws.assessment.SCEN.find(x => x.id === r.scen); return el('div', { 'data-noi18n': '' }, chip(r.scen, { href: '#/scenario/' + r.scen }), el('div', 'small muted', String(s?.name || '').slice(0, 70))); } },
      { key: 'id', label: 'Vulnerability', render: r => { const v = vOf(r.id); return el('div', null, chip(r.id, { href: '#/vulns/' + r.id }), r.kind === 'CVE' ? el('div', 'small', v?.exposed ? pill('exposed', 'bad') : pill('exposure not confirmed', ''), v?.product ? el('span', { class: 'muted', 'data-noi18n': '' }, ' ' + v.product) : null) : el('div', 'small muted', 'weakness type')); } },
      { key: 'why', label: 'Reason', render: r => el('div', { class: 'small', 'data-noi18n': r.method === 'ai' ? '' : null }, r.why) },
      { key: 'method', label: 'Method', render: r => pill(r.method === 'ai' ? 'AI' : r.method === 'rules' ? tr('rules') : r.method, r.method === 'rules' ? '' : 'warn') },
      { key: 'conf', label: 'Confidence', render: r => pill(r.conf, confKind(r.conf)) },
    ], list, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'No proposal to review'), !(ws.vulns || []).length ? 'The vulnerability register is empty. Add CVEs first — CVE register, Import files (scanner, NVD) or Online sources — then run the rules.' : d.ran.rules ? 'Every link the rules can find is already in place — or was rejected. Ask AI for links the rules cannot see.' : 'Run the rules to start; it takes a second and sends nothing.'));
  }
  draw();
  const by = users.name ? users.name() : '';
  body.append(card(el('div', 'row', { style: { alignItems: 'center', flexWrap: 'wrap', gap: '8px' } }, el('h2', { style: { margin: 0, flex: '1 0 100%' } }, 'Review'), q, fc, fm),
    el('div', 'btnrow', { style: { margin: '10px 0' } },
      el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { for (const r of shown()) r.take = r.conf === 'High'; draw(); } }, 'Tick high confidence'),
      el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { for (const r of shown()) r.take = true; draw(); } }, 'Tick all shown'),
      el('button', { class: 'btn ghost sm', 'data-ro-ok': '', onclick: () => { for (const r of rows) r.take = false; draw(); } }, 'Untick all'),
      el('button', { class: 'btn', onclick: () => {
        const t = rows.filter(r => r.take); if (!t.length) { toast(tr('Tick at least one proposal'), 'bad'); return; }
        const n = L.accept(t, by, ws);
        if (d.ran.aiEntry && t.some(r => r.method !== 'rules')) AI.decide(d.ran.aiEntry, 'accepted', `${t.filter(r => r.method !== 'rules').length} AI link(s) accepted`);
        users.audit?.('links accepted', `${n} link(s)`, ws);
        toast(`${n} ${tr('link(s) added to the scenarios')}`); rerender();
      } }, 'Accept ticked'),
      el('button', { class: 'btn ghost danger', onclick: () => {
        const t = rows.filter(r => r.take); if (!t.length) { toast(tr('Tick at least one proposal'), 'bad'); return; }
        L.reject(t, by, ws); toast(`${t.length} ${tr('proposal(s) rejected — they will not be proposed again')}`); rerender();
      } }, 'Reject ticked')),
    box));

  if (d.doubts?.length) body.append(card(el('h2', { style: { marginTop: 0 } }, 'Doubts raised by AI about rule-proposed links'),
    ...d.doubts.map(x => el('div', { class: 'small', style: { margin: '4px 0' } }, el('b', { 'data-noi18n': '' }, `${x.scen} — ${x.id}: `), el('span', { 'data-noi18n': '' }, x.why)))));

  // exposure
  if (d.exposure.length) {
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'Exposure proposals'),
      el('p', 'note', 'Exposure is the gate of the threat-context method. Confirm only what the inventory or a scan supports; the evidence is written into the register entry.'),
      table([
        { key: 'take', label: '', sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: !!r.take }); c.addEventListener('change', () => { r.take = c.checked; }); return c; } },
        { key: 'id', label: 'CVE', render: r => chip(r.id, { href: '#/vulns/' + r.id }) },
        { key: 'why', label: 'Evidence', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.why) },
        { key: 'conf', label: 'Confidence', render: r => pill(r.conf, confKind(r.conf)) },
      ], d.exposure, { class: 'compact' }),
      el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn', onclick: () => {
        const t = d.exposure.filter(x => x.take); if (!t.length) { toast(tr('Tick at least one proposal'), 'bad'); return; }
        const n = L.markExposed(t, by, ws); users.audit?.('exposure confirmed', `${n} CVE(s)`, ws); toast(`${n} ${tr('CVE(s) marked exposed')}`); rerender();
      } }, 'Mark ticked as exposed'))));
  }

  // gaps
  if (d.gaps || d.noEvidence?.length) {
    const g = d.gaps || { scenarios: [], vulns: [] };
    body.append(card(el('h2', { style: { marginTop: 0 } }, 'Gaps'),
      el('p', null, el('b', null, 'Scenarios with no vulnerability evidence: '), g.scenarios.length ? el('span', 'chips', ...g.scenarios.map(id => chip(id, { href: '#/scenario/' + id }))) : tr('none')),
      d.noEvidence?.length ? el('p', null, el('b', null, 'AI found no supporting vulnerability for: '), el('span', 'chips', ...d.noEvidence.map(id => chip(id, { href: '#/scenario/' + id })))) : null,
      el('p', null, el('b', null, 'Register CVEs no scenario uses or is proposed for: '), g.vulns.length ? el('span', 'chips', ...g.vulns.slice(0, 60).map(id => chip(id, { href: '#/vulns/' + id }))) : tr('none')),
      el('p', 'note', 'A scenario without evidence may still be valid (an insider, an outage); a CVE no scenario uses may call for a new scenario — Batch scenarios → From CVE.')));
  }

  const lg = (ws.linkLog || []).slice(0, 25);
  if (lg.length) body.append(card(el('h2', { style: { marginTop: 0 } }, 'Recent decisions'),
    table([{ key: 'at', label: 'Time', cls: 'mono', render: e => e.at.slice(0, 16).replace('T', ' ') }, { key: 'action', label: 'Decision', render: e => pill(e.action === 'linked' ? tr('linked') : tr('rejected'), e.action === 'linked' ? 'good' : '') },
      { key: 'scen', label: 'Scenario', render: e => el('span', { 'data-noi18n': '' }, e.scen) }, { key: 'id', label: 'Vulnerability', render: e => el('span', { 'data-noi18n': '' }, e.id) },
      { key: 'method', label: 'Method' }, { key: 'by', label: 'By', render: e => el('span', { 'data-noi18n': '' }, e.by || '—') }], lg, { class: 'compact' })));
}

function mergeExposure(cur, add) {
  const out = [...(cur || [])];
  for (const x of add) if (!out.some(y => y.id === x.id)) out.push({ ...x, take: x.conf === 'High' });
  return out;
}
