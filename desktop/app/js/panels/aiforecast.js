/* Forecasts → Exploitation (30 days), Mitigation optimizer, Residual-risk path (1.9.0).

   Shown apart from the calculated results, like every forecast. The deterministic part runs first and
   is the engine's; AI comes second, behind the payload preview, and its answers stay in their own
   columns marked "Analytical estimate — validation required" until the analyst acts on each one.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, kpi, pill, banner, toast, table, field, select, n0, n2, money, download, toCSV } from '../util.js';
import { S, touch, compute } from '../state.js';
import * as X from '../aiforecast.js';
import * as SV from '../ssvc.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';
import * as store from '../store.js';
import * as users from '../users.js';
import { lineChart } from '../charts.js';
import { tr } from '../i18n.js';

const st = { rows: null, hist: null, ai: null, aiEntry: null, opt: null, optCfg: { budget: null, target: 'within' }, prop: null, propEntry: null, whatIf: null, path: null, pathCfg: { years: 3, trials: 200, seed: 20261102 } };
const bandPill = b => pill(b === 'unknown' ? 'no evidence' : b, b === 'high' ? 'bad' : b === 'moderate' ? 'warn' : b === 'low' ? 'good' : '');
const pctS = x => (x == null ? '—' : (x * 100).toFixed(1) + '%');
const ratio = x => (Number.isFinite(x) ? x.toFixed(2) : '—');
const label = () => el('div', 'small', pill(AI.MARK, 'warn'));

/** Help for the three tabs (Forecasts screen, "?" button). */
export const HELP = {
  exploit: { d: 'Exploitation forecast: the likelihood of exploitation activity in the wild over the next 30 days for each registered CVE.', g: 'forecast-exploit',
    h: ['A published rule over the EPSS history kept in the feeds folder, CISA KEV, feed reports and exposure. It is evidence about the threat environment, never Pb(A) or Pb(ψ,A).', 'It raises a review item only; AI may add a second opinion, shown apart.'] },
  optimizer: { d: 'Mitigation optimizer: the initiatives that bring the most scenarios within tolerance for a budget.', g: 'forecast-optimizer',
    h: ['The deterministic optimizer runs first and the engine computes every figure. AI may then propose cost and effect corrections, each accepted one by one.'] },
  path: { d: 'Residual-risk path: how residual risk falls over one to three years as each funding option phases in.', g: 'forecast-path',
    h: ['Uses the months to benefit of each initiative, the budget-year allocation and the Monte Carlo ranges. The bands describe the ranges entered, not the world.'] },
};

async function feedItems() {
  const c = await store.get('blob', 'feeds:items').catch(() => null);
  return Object.values(c?.bySrc || {}).flatMap(x => x.items || []);
}

/* ======================= exploitation forecast ======================= */
export async function exploit(body, sec, redraw) {
  const ws = S.ws; SV.ensure(ws);
  body.append(banner('warn', 'Exploitation in the wild, next 30 days — evidence, never a likelihood of a scenario', 'The forecast is computed by a published rule from the EPSS history in the dated threat-context snapshots of the feeds folder, CISA KEV, feed reports and exposure. It never changes Pb(A), Pb(ψ,A) or an SSVC decision: it raises a review item, which you take to the SSVC decision or the Threat Evidence Ladder. Analytical estimate — validation required.'));
  const cves = (ws.vulns || []).filter(v => /^CVE-/i.test(v.id));
  if (!cves.length) { body.append(card(el('div', 'empty-state', el('b', null, 'No CVE in the register'), 'Add CVEs under Vulnerabilities; each one gets a 30-day forecast.'))); return; }
  if (!st.rows || st.rowsWs !== ws.id) {
    st.hist = await X.epssHistory(ws);
    st.rows = X.forecastAll(ws, { history: st.hist, snap: S.snap, items: await feedItems() });
    st.rowsWs = ws.id; st.ai = null;
  }
  const rows = st.rows, open = ws.ssvc.review.filter(r => r.status === 'open');
  const flagged = rows.filter(r => r.review && !open.some(o => o.cve === r.id));
  const files = (st.hist.files || []).filter(f => !f.error);
  body.append(el('div', 'grid g5',
    kpi('CVEs forecast', n0(rows.length), S.snap ? 'snapshot ' + S.snap.retrieved : 'no snapshot loaded'),
    kpi('History', n0(files.length), files.length ? `dated snapshot(s), ${files[0].date} → ${files[files.length - 1].date}` : 'no dated snapshot in the feeds folder', files.length < 2 ? 'warn' : ''),
    kpi('High band', n0(rows.filter(r => r.band === 'high').length), '≥ 50% in 30 days', rows.some(r => r.band === 'high') ? 'bad' : ''),
    kpi('Rising', n0(rows.filter(r => r.rising).length), `EPSS trend ≥ +${X.RULE.reviewRising} per 30 days`),
    kpi('Open review items', n0(open.length), flagged.length ? `${flagged.length} more flagged` : 'none flagged', open.length ? 'warn' : '')));
  if (st.hist.error) body.append(banner('warn', 'EPSS history not read', st.hist.error + ' — the forecast uses the snapshot of this workspace only.'));
  const aiBy = new Map((st.ai || []).map(a => [a.id, a]));
  body.append(card(el('h2', null, 'Forecast by CVE'),
    el('div', 'tablewrap', table([
      { key: 'id', label: 'CVE', render: r => el('a', { href: '#/vulns/' + r.id, class: 'mono' }, r.id), sort: r => r.id },
      { key: 'exp', label: 'Exposed', render: r => (r.exposed ? 'yes' : 'no'), sort: r => (r.exposed ? 1 : 0) },
      { key: 'kev', label: 'KEV', render: r => (r.kev ? pill('KEV', 'bad') : 'no'), sort: r => (r.kev ? 1 : 0) },
      { key: 'epss', label: 'EPSS now', num: true, render: r => pctS(r.epss), sort: r => r.epss ?? -1 },
      { key: 'tr', label: 'Trend / 30 d', num: true, render: r => (r.trend.slope30 == null ? '—' : (r.trend.slope30 >= 0 ? '+' : '') + (r.trend.slope30 * 100).toFixed(1) + ' pts'), sort: r => r.trend.slope30 ?? -9 },
      { key: 'feed', label: 'Feeds · PoC', num: true, render: r => `${r.items} · ${r.poc}`, sort: r => r.items },
      { key: 'f', label: 'Forecast (rule)', render: r => el('div', { title: r.reasons.join('\n') }, el('b', null, pctS(r.forecast)), ' ', bandPill(r.band)), sort: r => r.forecast ?? -1 },
      { key: 'ai', label: 'AI second opinion', sortable: false, render: r => { const a = aiBy.get(r.id); return a ? el('div', { title: a.rationale }, el('b', null, pctS(a.likelihood)), ' ', bandPill(a.band), el('div', 'small muted', a.confidence)) : '—'; } },
      { key: 'rev', label: 'Review', sortable: false, render: r => { const o = open.find(x => x.cve === r.id); return o ? pill('open', 'warn') : el('button', { class: 'btn sm ' + (r.review ? '' : 'ghost'), disabled: !r.exposed, title: r.exposed ? '' : 'Exposure not confirmed: watch only', onclick: () => { X.raiseReview(ws, r); users.audit('exploitation review item raised', r.id, ws); touch(); redraw(); } }, r.review ? 'Raise review' : 'Raise anyway'); } },
    ], rows, { sortKey: 'f', sortDir: -1, class: 'compact' })),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', disabled: !flagged.length, onclick: () => { for (const r of flagged) X.raiseReview(ws, r); users.audit('exploitation review items raised', String(flagged.length), ws); touch(); toast(tr('{0} review item(s) raised').replace('{0}', flagged.length)); redraw(); } }, tr('Raise review items for the flagged CVEs ({0})').replace('{0}', flagged.length)),
      el('button', { class: 'btn ghost', onclick: () => { st.rows = null; redraw(); } }, 'Recompute'),
      el('button', { class: 'btn ghost', onclick: () => download('exploitation-forecast.csv', toCSV([['cve', 'exposed', 'kev', 'epss_latest', 'trend_per_30d', 'feed_reports', 'poc_reports', 'forecast_30d', 'band', 'reasons', 'ai_likelihood', 'ai_rationale', 'label'],
        ...rows.map(r => [r.id, r.exposed ? 'yes' : 'no', r.kev ? 'yes' : 'no', r.epss ?? '', r.trend.slope30 ?? '', r.items, r.poc, r.forecast ?? '', r.band, r.reasons.join(' | '), aiBy.get(r.id)?.likelihood ?? '', aiBy.get(r.id)?.rationale ?? '', AI.MARK])])) }, 'Export CSV')),
    el('details', null, el('summary', null, 'The rule'), el('ul', 'small',
      el('li', null, tr('Start from the latest EPSS score (itself a 30-day probability of exploitation activity) and add its trend per 30 days, capped at ±{0}.').replace('{0}', n2(X.RULE.trendCap))),
      el('li', null, tr('Public exploit code (PoC) reported in the loaded feeds: combined uplift of {0}; other feed reports naming the CVE: {1} each, up to {2}.').replace('{0}', n2(X.RULE.pocUplift)).replace('{1}', n2(X.RULE.chatterPerItem)).replace('{2}', n2(X.RULE.chatterMax))),
      el('li', null, tr('In CISA KEV: at least {0} (exploitation already observed).').replace('{0}', n2(X.RULE.kevFloor))),
      el('li', null, 'Bands: high ≥ 50%, moderate ≥ 10%, low below. A review item is proposed when exposure is confirmed and the CVE is in KEV, the band is high or the trend rises by 5 points or more per 30 days.'),
      el('li', null, 'The history is only as long as the dated snapshots kept in the feeds folder (threat-context-YYYY-MM-DD.json). Nothing is downloaded for this screen.')))));

  // AI second opinion
  const aiBox = el('div');
  body.append(card(el('h2', null, 'AI second opinion (optional)'),
    el('p', 'note', 'Sends the table above — CVE identifiers, products, exposure, EPSS history, KEV status and feed headlines — to the model this feature is routed to (the local model by default). You see the payload before anything is sent. The answer is shown in its own column and raises nothing by itself.'),
    el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: async () => {
      const s = await aiui.status(ws, 'exploit_forecast'); if (!s.ok) { toast(s.why, 'bad'); return; }
      const res = await aiui.request('exploit_forecast', { rows }, { title: tr('Exploitation forecast — what will be sent') });
      if (!res) return;
      try { st.ai = X.parseForecastAnswer(res.text, rows); st.aiEntry = res.entryId; } catch (e) { AI.decide(res.entryId, 'rejected', 'unparseable'); toast(String(e.message || e), 'bad'); return; }
      redraw();
    } }, 'Ask AI (preview first)…'), st.ai ? el('button', { class: 'btn ghost', onclick: () => { if (st.aiEntry) AI.decide(st.aiEntry, 'rejected', 'discarded'); st.ai = null; redraw(); } }, 'Discard the AI answer') : null), aiBox));
  if (st.ai) aiBox.append(label(), el('div', 'tablewrap', table([
    { key: 'id', label: 'CVE', cls: 'mono' },
    { key: 'l', label: 'AI likelihood (30 d)', num: true, render: a => pctS(a.likelihood) },
    { key: 'b', label: 'Band', render: a => bandPill(a.band) },
    { key: 'c', label: 'Confidence', render: a => a.confidence },
    { key: 'r', label: 'Rationale', render: a => el('span', { class: 'small', 'data-noi18n': '' }, a.rationale) },
    { key: 'x', label: '', sortable: false, render: a => { const r = rows.find(x => x.id === a.id); return el('button', { class: 'btn sm ghost', disabled: !r?.exposed, onclick: () => { X.raiseReview(ws, r, { source: 'ai', ai: a }); AI.decide(st.aiEntry, 'accepted', 'review item ' + a.id); touch(); redraw(); } }, 'Raise review item'); } },
  ], st.ai, { class: 'compact' })));

  // review items
  const closed = ws.ssvc.review.filter(r => r.status !== 'open');
  body.append(card(el('h2', null, tr('Review items ({0} open)').replace('{0}', open.length)),
    open.length ? el('div', 'tablewrap', table([
      { key: 'cve', label: 'CVE', render: o => el('a', { href: '#/vulns/ssvc/' + o.cve, class: 'mono' }, o.cve) },
      { key: 'date', label: 'Raised', cls: 'mono' },
      { key: 'f', label: 'Forecast', render: o => el('span', null, pctS(o.forecast), ' ', bandPill(o.band)) },
      { key: 'src', label: 'Source', render: o => (o.source === 'ai' ? 'AI second opinion' : 'rule') },
      { key: 'why', label: 'Why', render: o => el('span', 'small', (o.reasons || []).join(' · ')) },
      { key: 'x', label: '', sortable: false, render: o => el('div', 'btnrow',
        el('a', { class: 'btn sm', href: '#/vulns/ssvc/' + o.cve }, 'SSVC decision'),
        el('button', { class: 'btn sm ghost', onclick: () => { X.closeReview(ws, o.id, { status: 'done', by: users.name() }); touch(); redraw(); } }, 'Done'),
        el('button', { class: 'btn sm ghost', onclick: () => { const n = window.prompt(tr('Why is this review item dismissed?')) || ''; if (!n.trim()) return; X.closeReview(ws, o.id, { status: 'dismissed', by: users.name(), note: n }); touch(); redraw(); } }, 'Dismiss')) },
    ], open, { class: 'compact' })) : el('p', 'note', 'No open review item.'),
    closed.length ? el('details', null, el('summary', null, tr('Closed ({0})').replace('{0}', closed.length)), el('ul', 'small', ...closed.slice(-30).reverse().map(o => el('li', null, `${o.cve} · ${o.closed || ''} · ${o.status}${o.by ? ' · ' + o.by : ''}`, o.note ? el('span', { 'data-noi18n': '' }, ' — ' + o.note) : null)))) : null,
    el('p', 'note', 'A review item asks a person to look again: at the SSVC decision for that CVE, and — exposure confirmed — at the Threat Evidence Ladder. It changes nothing by itself.')));
}

/* ======================= mitigation optimizer ======================= */
export function optimizer(body, sec, redraw) {
  const ws = S.ws;
  if (st.optWs !== ws.id) { st.opt = null; st.prop = null; st.whatIf = null; st.optCfg.budget = null; st.optWs = ws.id; }
  const budget = el('input', { type: 'number', step: 10000, min: 0, value: st.optCfg.budget ?? X.defaultBudget(ws), style: { maxWidth: '180px' } });
  const target = select(X.TARGET_IDS.map(k => [k, k === 'within' ? 'At or below tolerance (ratio ≤ 1.10)' : 'Below tolerance (ratio < 0.90)']), st.optCfg.target);
  body.append(card(el('h2', null, 'Bring the most scenarios within tolerance for a budget'),
    el('p', 'note', 'Extends the funding frontier of the Budget screen. The frontier funds scenarios one by one in cost-effectiveness order, with shared initiatives split across them. The optimizer chooses initiatives instead, each counted once however many scenarios it serves, and a scenario counts as treated only when every initiative it needs is funded. Every residual comes from the verified engine. The default budget is the appetite-consistent envelope (target × IT budget − baseline).'),
    el('div', 'grid g3', field('Year-1 budget for new treatment', budget), field('Target', target),
      el('div', 'btnrow', { style: { alignSelf: 'end' } }, el('button', { class: 'btn', onclick: () => {
        st.optCfg = { budget: Number(budget.value) || 0, target: target.value };
        st.opt = X.optimize(ws, st.optCfg); st.prop = null; st.whatIf = null; redraw();
      } }, 'Optimize'))),
    el('a', { href: '#/budget', class: 'small' }, 'Budget — funding frontier →')));
  const o = st.opt;
  if (!o) return;
  const fr = o.frontier;
  body.append(el('div', 'grid g5',
    kpi('Scenarios meeting the target', `${n0(o.count)} / ${n0(o.rows.length)}`, tr('{0} before treatment').replace('{0}', o.countBefore), 'good'),
    kpi('Funding frontier, same budget', n0(fr.count), money(fr.cost) + ' ' + tr('in initiatives')),
    kpi('Year-1 cost', money(o.cost), tr('of {0}').replace('{0}', money(o.budget))),
    kpi('Residual risk', n0(o.residual), tr('{0} removed').replace('{0}', n0(o.removed))),
    kpi('Still above tolerance', n0(o.above), '', o.above ? 'warn' : 'good')));
  const U = new Map(o.units.map(u => [u.id, u]));
  body.append(card(el('h2', null, tr('Portfolio ({0} initiatives)').replace('{0}', o.funded.length)), el('p', 'small muted', { 'data-noi18n': '' }, tr('Method: {0}').replace('{0}', tr(o.method.split(' — ')[0])) + ' — ' + o.method.split(' — ').slice(1).join(' — ')),
    el('div', 'tablewrap', table([
      { key: 'id', label: 'Initiative', render: id => el('div', null, el('b', null, id), ' ', el('span', { 'data-noi18n': '' }, U.get(id).name)) },
      { key: 'c', label: 'Year-1 cost', num: true, render: id => money(U.get(id).y1), sort: id => U.get(id).y1 },
      { key: 'm', label: 'Months to benefit', num: true, render: id => U.get(id).months + (U.get(id).monthsAssumed ? ' *' : ''), sort: id => U.get(id).months },
      { key: 's', label: 'Scenarios', render: id => U.get(id).scenarios.join(', ') },
    ], o.funded, { class: 'compact' })),
    o.units.some(u => u.monthsAssumed) ? el('p', 'small muted', tr('* No end month stated: {0} months assumed.').replace('{0}', X.DEFAULT_MONTHS)) : null,
    el('div', 'tablewrap', { style: { marginTop: '10px' } }, table([
      { key: 'id', label: 'Scenario', render: r => el('a', { href: '#/scenario/' + r.id }, r.id) },
      { key: 'b', label: 'Ratio untreated', num: true, render: r => ratio(r.before), sort: r => r.before },
      { key: 'a', label: 'Ratio with this portfolio', num: true, render: r => ratio(r.after), sort: r => r.after },
      { key: 't', label: 'Treated', render: r => (r.treated ? 'yes' : r.req.length ? 'no' : 'no initiative'), sort: r => (r.treated ? 1 : 0) },
      { key: 'm', label: 'Meets the target', render: r => pill(r.meets ? 'yes' : 'no', r.meets ? 'good' : 'bad'), sort: r => (r.meets ? 1 : 0) },
    ], o.rows, { sortKey: 'a', sortDir: -1, class: 'compact' })),
    el('p', 'note', 'Decision support: management chooses what to fund. Ratios are the engine\'s, with each scenario\'s recorded reductions; Year-1 cost = initial + first-year recurring, as on the frontier.')));

  // AI refinement
  const pBox = el('div');
  body.append(card(el('h2', null, 'AI refinement — costs and effects (optional)'),
    el('p', 'note', 'Sends the initiatives (names, costs, timing), the scenarios they treat (names, reductions, ratios) and the organization profile to the model this feature is routed to (the local model by default). AI proposes corrections; the engine computes what they would change; you accept each one, or none.'),
    el('div', 'btnrow', el('button', { class: 'btn ghost', onclick: async () => {
      const s = await aiui.status(ws, 'mitigation_optimizer'); if (!s.ok) { toast(s.why, 'bad'); return; }
      const res = await aiui.request('mitigation_optimizer', { result: o }, { title: tr('Mitigation optimizer — what will be sent') });
      if (!res) return;
      try { st.prop = X.parseOptimizerAnswer(res.text, o, ws); st.propEntry = res.entryId; st.whatIf = null; } catch (e) { AI.decide(res.entryId, 'rejected', 'unparseable'); toast(String(e.message || e), 'bad'); return; }
      redraw();
    } }, 'Ask AI (preview first)…')), pBox));
  const P = st.prop;
  if (!P) return;
  const tick = new Map();
  pBox.append(label(), P.notes ? el('p', { class: 'small', 'data-noi18n': '' }, P.notes) : null,
    P.costs.length ? el('div', 'tablewrap', table([
      { key: 't', label: '', sortable: false, render: c => { const i = el('input', { type: 'checkbox' }); tick.set(c, i); return i; } },
      { key: 'u', label: 'Initiative', render: c => c.unit },
      { key: 'i', label: 'Initial: now → proposed', render: c => `${money(c.was.initial)} → ${c.initial == null ? '—' : money(c.initial)}` },
      { key: 'r', label: 'Recurring: now → proposed', render: c => `${money(c.was.recurring)} → ${c.recurring == null ? '—' : money(c.recurring)}` },
      { key: 'c', label: 'Confidence', render: c => c.confidence },
      { key: 'why', label: 'Rationale', render: c => el('span', { class: 'small', 'data-noi18n': '' }, c.rationale) },
    ], P.costs, { class: 'compact' })) : el('p', 'note', 'No cost correction proposed.'),
    P.effects.length ? el('div', 'tablewrap', { style: { marginTop: '8px' } }, table([
      { key: 't', label: '', sortable: false, render: e => { const i = el('input', { type: 'checkbox' }); tick.set(e, i); return i; } },
      { key: 's', label: 'Scenario', render: e => e.scenario },
      { key: 'p', label: 'red_p: now → proposed', render: e => `${n2(e.was.red_p)} → ${e.red_p == null ? '—' : n2(e.red_p)}` },
      { key: 'i', label: 'red_i: now → proposed', render: e => `${n2(e.was.red_i)} → ${e.red_i == null ? '—' : n2(e.red_i)}` },
      { key: 'c', label: 'Confidence', render: e => e.confidence },
      { key: 'why', label: 'Rationale', render: e => el('span', { class: 'small', 'data-noi18n': '' }, e.rationale) },
    ], P.effects, { class: 'compact' })) : el('p', 'note', 'No effect correction proposed.'));
  const ticked = () => ({ costs: P.costs.filter(c => tick.get(c)?.checked), effects: P.effects.filter(e => tick.get(e)?.checked) });
  const wi = el('div');
  pBox.append(el('div', 'btnrow', { style: { marginTop: '10px' } },
    el('button', { class: 'btn ghost', onclick: () => {
      const t = ticked(); const all = t.costs.length + t.effects.length ? t : P;
      const w = X.withProposals(ws, all);
      const after = X.optimize(w, st.optCfg), Rw = compute(w);
      wi.replaceChildren(banner('warn', 'If accepted — computed by the engine, not applied', tr('{0} scenario(s) meet the target (now {1}); Year-1 cost {2}; portfolio residual {3} (now {4}).')
        .replace('{0}', after.count).replace('{1}', o.count).replace('{2}', money(after.cost)).replace('{3}', n0(Rw.totals.res)).replace('{4}', n0(compute(ws).totals.res))));
    } }, 'Compute “if accepted” (ticked, or all)'),
    el('button', { class: 'btn', onclick: () => {
      const t = ticked(); const n = t.costs.length + t.effects.length;
      if (!n) { toast('Tick the proposals to accept', 'bad'); return; }
      if (!window.confirm(tr('Apply {0} proposal(s) to the initiatives and scenarios of this workspace?').replace('{0}', n))) return;
      for (const c of t.costs) { const row = ws.assessment.INITIATIVES.find(a => a[0] === c.unit); if (!row) continue; if (c.initial != null) row[6] = c.initial; if (c.recurring != null) row[7] = c.recurring; }
      for (const e of t.effects) { const s = ws.assessment.SCEN.find(x => x.id === e.scenario); if (!s) continue; if (e.red_p != null) s.red_p = e.red_p; if (e.red_i != null) s.red_i = e.red_i; }
      AI.decide(st.propEntry, 'accepted', `${n} proposal(s) applied`); users.audit('mitigation optimizer proposals accepted', String(n), ws);
      touch(); st.prop = null; st.opt = X.optimize(ws, st.optCfg); toast(tr('{0} proposal(s) applied').replace('{0}', n)); redraw();
    } }, 'Accept the ticked proposals'),
    el('button', { class: 'btn ghost', onclick: () => { AI.decide(st.propEntry, 'rejected', 'discarded'); st.prop = null; redraw(); } }, 'Discard')), wi);
}

/* ======================= residual-risk path ======================= */
export function pathView(body, sec, redraw) {
  const ws = S.ws, c = st.pathCfg;
  if (st.pathWs !== ws.id) { st.path = null; st.pathWs = ws.id; }
  const years = select([[1, '1 year'], [2, '2 years'], [3, '3 years']], c.years);
  const trials = el('input', { type: 'number', min: 50, max: 2000, step: 50, value: c.trials, style: { maxWidth: '120px' } });
  const seed = el('input', { type: 'number', min: 1, step: 1, value: c.seed, style: { maxWidth: '150px' } });
  const bar = el('div', 'small muted');
  body.append(card(el('h2', null, 'Residual risk over time, per funding option'),
    el('p', 'note', 'Each option of the Budget screen (and the optimizer\'s portfolio, if you ran it) phased in month by month: an initiative starts in its budget year and start month and reaches full effect after its months to benefit; the phase-in scales the scenario\'s probability reduction and the engine computes each residual. Bands: a seeded Monte Carlo over the parameter ranges (Parameter ranges tab) and over delivery delays (×0.8 to ×1.5 of each initiative\'s months to benefit).'),
    el('div', 'grid g4', field('Horizon', years), field('Trials', trials), field('Seed', seed),
      el('div', 'btnrow', { style: { alignSelf: 'end' } }, el('button', { class: 'btn', onclick: async e => {
        Object.assign(c, { years: Number(years.value), trials: Math.max(50, Math.min(2000, Number(trials.value) || 200)), seed: Number(seed.value) || 1 });
        e.target.disabled = true;
        try { st.path = await X.residualPath(ws, { ...c, opt: st.opt && st.optWs === ws.id ? st.opt : null, onProgress: p => { bar.textContent = Math.round(p * 100) + '%'; } }); }
        catch (err) { toast(String(err.message || err), 'bad'); }
        e.target.disabled = false; redraw();
      } }, 'Run'))), bar));
  const P = st.path;
  if (!P) return;
  const at = (o, m) => o.central[Math.min(m, P.months)];
  const bandAt = (o, m) => o.band.find(b => b.t === Math.min(m, P.months));
  const date = m => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); };
  const colors = ['var(--muted)', 'var(--series-3)', 'var(--series-1)', 'var(--series-4)', 'var(--series-2)'];
  const focus = P.options.find(o => o.key === (st.pathFocus || 'C')) || P.options[0];
  body.append(card(el('h2', null, 'Residual risk, central path'), label(),
    lineChart({ width: 760, height: 280, yLabel: 'Residual risk', series: [
      ...P.options.map((o, i) => ({ name: o.label, color: colors[i % colors.length], points: o.central.map((y, m) => ({ x: date(m), y })).filter((p, m) => m % 3 === 0 || m === P.months) })),
      { name: focus.key + ' p90', color: 'var(--line)', points: focus.band.map(b => ({ x: date(b.t), y: b.p90 })) },
      { name: focus.key + ' p10', color: 'var(--line)', points: focus.band.map(b => ({ x: date(b.t), y: b.p10 })) },
    ], refs: [{ y: compute(ws).totals.tol, label: 'tolerated (portfolio)', color: 'var(--warn, #d97706)' }] }),
    el('div', 'legend', ...P.options.map((o, i) => el('span', null, el('i', { style: { background: colors[i % colors.length] } }), o.label)),
      el('span', null, tr('Light lines: p10–p90 band of option {0}').replace('{0}', focus.key))),
    el('div', 'btnrow', ...P.options.map(o => el('button', { class: 'btn sm ' + (o === focus ? '' : 'ghost'), onclick: () => { st.pathFocus = o.key; redraw(); } }, tr('Band of {0}').replace('{0}', o.key))))));
  const mm = [12, 24, 36].filter(m => m <= P.months);
  body.append(card(el('h2', null, 'Options compared'), el('div', 'tablewrap', table([
    { key: 'label', label: 'Option', render: o => el('b', null, o.label) },
    { key: 'cost', label: tr('Spend over {0} year(s)').replace('{0}', P.years), num: true, render: o => money(o.cost), sort: o => o.cost },
    ...mm.map(m => ({ key: 'm' + m, label: tr('Residual at {0} months').replace('{0}', m), num: true, sort: o => at(o, m), render: o => { const b = bandAt(o, m); return el('div', null, n0(at(o, m)), b ? el('div', 'small muted', `${n0(b.p10)} – ${n0(b.p90)}`) : null); } })),
    { key: 'full', label: 'Full benefit (month)', num: true, render: o => (o.funded.length ? String(o.benefitMonth) : '—'), sort: o => o.benefitMonth },
    { key: 'av', label: 'Risk avoided (risk × years)', num: true, render: o => n0(o.avoided), sort: o => o.avoided },
    { key: 'k', label: 'Avoided per $1,000', num: true, sort: o => o.perK ?? -1, render: o => (o.perK == null ? '—' : el('div', null, n2(o.perK), o.perKBand ? el('div', 'small muted', `${n2(o.perKBand.p10)} – ${n2(o.perKBand.p90)}`) : null)) },
  ], P.options, { sortKey: null, class: 'compact' })),
    P.assumedMonths.length ? el('p', 'small muted', tr('No end month stated for {0}: {1} months to benefit assumed.').replace('{0}', P.assumedMonths.join(', ')).replace('{1}', X.DEFAULT_MONTHS)) : null,
    el('p', 'note', tr('{0} trials, seed {1}: the same workspace, seed and trials give the same figures. Risk avoided is the area between the status-quo path and the option over the horizon (risk units × years); per $1,000 divides it by the option\'s spend in the same budget years (initial and recurring, as allocated on the Budget screen). The central path is the plan as stated; the bands add delivery delays, so the plan often sits at the optimistic edge of its band. Bands describe the ranges entered, not the world.').replace('{0}', P.trials).replace('{1}', P.seed)),
    el('button', { class: 'btn ghost', onclick: () => download('residual-risk-path.csv', toCSV([['option', 'month', 'central', 'p10', 'p50', 'p90'],
      ...P.options.flatMap(o => o.central.map((y, m) => { const b = o.band.find(x => x.t === m); return [o.key, m, Math.round(y), b ? Math.round(b.p10) : '', b ? Math.round(b.p50) : '', b ? Math.round(b.p90) : '']; }))])) }, 'Export CSV')));
}
