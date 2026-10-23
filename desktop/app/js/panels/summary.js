/* Management summary — one page that obtains decisions (book ch06, "The management report"; Process
   step "Report").

   It leads with the decisions management must take, then says how many scenarios are above,
   approximately at and below tolerance before and after treatment, what the recommended portfolio costs
   against the appetite-consistent budget, which risks matter most, what the markers flag and what the
   limitations are. Every figure is read from the verified engine (state.compute) at the moment the page is
   drawn: the summary cannot disagree with the workbook. Treatment directions are decision support; the
   decisions themselves belong to management.
   © 2026 Marc-André Léger. All rights reserved. */
'use strict';
import { el, card, banner, kpi, pill, pillFor, field, toast, table, download, today, n0, n2, money, esc } from '../util.js';
import { S, touch, compute, initiatives, included } from '../state.js';
import { tr } from '../i18n.js';
import * as MK from '../markers.js';
import * as EQ from '../equiv.js';
import * as SCR from '../screening.js';
import * as LOG from '../logs.js';
import { GENERATOR } from '../version.js';

export const HELP = {
  '': { d: 'A one-page management summary: the decisions requested, residual risk against tolerance, the portfolio and the budget, the top risks, the markers and the limitations.', g: 'summary',
    h: ['Every figure comes from the verified engine when the page is drawn, so the summary agrees with the workbook to the unit.',
      'Write each decision requested on its own line. Accepting, transferring, avoiding or mitigating a risk, approving the appetite and funding the portfolio are management decisions.',
      'Export the summary as Markdown or print it; attach the Excel workbook.'] },
};

const CLS = ['Above tolerance', 'Approximately at tolerance', 'Below tolerance'];

/** Everything the summary says, as data (the screen, the Markdown export and the tests read the same thing). */
export function build(ws = S.ws) {
  const R = compute(ws), a = ws.assessment, b = ws.budget || {};
  const before = Object.fromEntries(CLS.map(c => [c, R.inc.filter(r => CRG.classify(r.pre_ratio) === c).length]));
  const after = Object.fromEntries(CLS.map(c => [c, R.inc.filter(r => r.cls === c).length]));
  const it = Number(b.it_budget) || 0, spend = Number(b.spend) || 0, appetite = Number(a.APPETITE);
  const target = it > 0 && appetite > 0 && appetite < 1 ? CRG.budgetTarget(appetite) : null;
  const y1 = initiatives(ws).reduce((t, i) => t + (Number(i.y1) || 0), 0);
  const top = R.inc.slice().sort((x, y) => y.res - x.res).slice(0, 5);
  // the decisions the assessment itself shows are needed (the analyst adds the others)
  const auto = [];
  if (/estimat|validation required/i.test(ws.appetite_rationale || '')) auto.push(tr('Approve the risk appetite ({0}) or set another value.').replace('{0}', n2(appetite)));
  for (const r of R.inc.filter(x => x.cls === 'Above tolerance')) {
    const d = ws.decisions?.[r.id];
    auto.push(d?.option ? tr('{0} — {1} recorded ({2}); confirm the residual risk above tolerance (ratio {3}) and who accepts it.').replace('{0}', r.id).replace('{1}', tr(d.option)).replace('{2}', d.owner || tr('no owner')).replace('{3}', n2(r.ratio))
      : tr('{0} — decide: mitigate further, transfer, avoid or accept (ratio {1} after treatment).').replace('{0}', r.id).replace('{1}', n2(r.ratio)));
  }
  if (target !== null && spend < target * it) auto.push(tr('Fund the gap to the appetite-consistent budget ({0}) or record why it is not funded.').replace('{0}', money(Math.round(target * it - spend))));
  if (y1 > 0) auto.push(tr('Approve the recommended portfolio: {0} in year 1.').replace('{0}', money(Math.round(y1))));
  const A = SCR.analysis(ws);
  for (const c of A.flaggedOut.filter(x => !(ws.screening?.watch || []).some(w => w.id === x.id))) auto.push(tr('Confirm the exclusion of the flagged candidate {0}.').replace('{0}', c.id));
  for (const t of R.inc.filter(r => ws.decisions?.[r.id]?.option === 'Transfer' && !ws.decisions[r.id].approver)) auto.push(tr('Name the approver of the transfer of {0}.').replace('{0}', t.id));
  // markers
  let estimates = 0, noEvidence = 0;
  for (const r of R.inc) for (const k of ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu']) { const p = r.s.params?.[k]; if (/estimat/i.test(p?.rat || '')) estimates++; if (!String(p?.ev || '').trim()) noEvidence++; }
  const equiv = R.inc.filter(r => EQ.isEquiv(r.s) || r.s.cvss_limited).map(r => r.id);
  const gaps = [];
  if (!(a.EVIDENCE || []).length) gaps.push(tr('No evidence register.'));
  if (!ws.snapshot) gaps.push(tr('No threat-context snapshot.'));
  if (!(it > 0)) gaps.push(tr('No IT budget.'));
  if (R.errors.length) gaps.push(tr('{0} scenario(s) cannot be calculated.').replace('{0}', R.errors.length));
  return { ws, R, before, after, it, spend, appetite, target, y1, top, auto, decisions: (ws.mgmtSummary?.decisions || []).filter(x => String(x).trim()),
    estimates, noEvidence, equiv, gaps, limitations: ws.mgmtSummary?.limitations || '', nextSteps: ws.mgmtSummary?.nextSteps || '', preparedBy: ws.mgmtSummary?.preparedBy || '',
    period: a.PERIOD || '', screening: { candidates: A.list.length, selected: A.selected.length } };
}

const STANDARD_LIMITS = 'The risk indices are relative decision-support values, not predictions of loss and not key risk indicators. Values marked “Analytical estimate — validation required” must be validated with the organization before they support a decision. Decisions to accept, transfer, avoid or mitigate a risk remain with management.';

/** The summary in Markdown. */
export function markdown(ws = S.ws) {
  const x = build(ws), L = [];
  const org = ws.org?.name || ws.name;
  L.push(`# ${tr('Management summary')} — ${org}`, '', `${tr('Assessment period')}: ${x.period || '—'} · ${tr('Risk appetite')}: ${n2(x.appetite)} · ${today()} · ${GENERATOR}`, '');
  if (ws.kind !== 'organization') L.push(`> ${tr('Fictional teaching case — not organizational evidence.')}`, '');
  L.push(`## ${tr('Decisions requested')}`, '');
  for (const d of [...x.decisions, ...x.auto]) L.push(`- ${d} — **${tr(MK.MGMT)}**`);
  if (!x.decisions.length && !x.auto.length) L.push(`- ${tr('No decision is requested yet.')}`);
  L.push('', `## ${tr('Residual risk against tolerance')}`, '', `| | ${CLS.map(tr).join(' | ')} |`, '|---|---|---|---|',
    `| ${tr('Before treatment')} | ${CLS.map(c => x.before[c]).join(' | ')} |`, `| ${tr('After treatment')} | ${CLS.map(c => x.after[c]).join(' | ')} |`, '',
    `${tr('Total estimated')} ${n0(x.R.totals.est)} · ${tr('total tolerated')} ${n0(x.R.totals.tol)} · ${tr('total residual')} ${n0(x.R.totals.res)} (${tr('risk units, not dollars')}).`, '');
  L.push(`## ${tr('Portfolio and budget')}`, '', `- ${tr('Recommended portfolio, year 1')}: ${money(Math.round(x.y1))}`,
    `- ${tr('Total IT budget')}: ${x.it ? money(x.it) : '—'} · ${tr('current cybersecurity spend')}: ${x.it ? money(x.spend) + ' (' + (x.spend / x.it * 100).toFixed(1) + '%)' : '—'}`,
    `- ${tr('Appetite-consistent target (best practice)')}: ${x.target !== null ? (x.target * 100).toFixed(1) + '% = ' + money(Math.round(x.target * x.it)) : '—'}`, '');
  L.push(`## ${tr('Top risks')}`, '', `| ID | ${tr('Scenario')} | ${tr('Residual')} | ${tr('Risk-to-tolerance ratio')} | ${tr('Classification')} | ${tr('Decision')} |`, '|---|---|---|---|---|---|');
  for (const r of x.top) L.push(`| ${r.id} | ${String(r.name).replace(/\|/g, '/')} | ${n0(r.res)} | ${n2(r.ratio)} | ${tr(r.cls)} | ${tr(ws.decisions?.[r.id]?.option || '—')} |`);
  L.push('', `## ${tr('Markers')}`, '', `- ${tr(MK.ESTIMATE)}: ${tr('{0} parameter value(s) labelled as estimates; {1} without an evidence reference.').replace('{0}', x.estimates).replace('{1}', x.noEvidence)}`);
  if (x.equiv.length) L.push(`- ${tr('CVSS with limited applicability (equivalency)')}: ${x.equiv.join(', ')}`);
  for (const g of x.gaps) L.push(`- ${tr(MK.INFO_GAP)}: ${g}`);
  L.push('', `## ${tr('Limitations')}`, '', x.limitations || '', '', tr(STANDARD_LIMITS), '');
  if (x.nextSteps) L.push(`## ${tr('Next steps')}`, '', x.nextSteps, '');
  if (x.preparedBy) L.push(`${tr('Prepared by')}: ${x.preparedBy}`, '');
  return L.join('\n');
}

export function render(sec) {
  const ws = S.ws, M = (ws.mgmtSummary ||= { decisions: [], limitations: '', nextSteps: '', preparedBy: '', date: null }), x = build(ws);
  sec.replaceChildren(el('h1', null, 'Management summary'),
    el('p', 'lede', 'One page that leads with the decisions management must take. Every figure is read from the verified engine now, so it agrees with the workbook.'));
  if (ws.kind !== 'organization') sec.append(banner('warn', 'Fictional teaching case', 'The summary of a teaching case is labelled fictional in its export.'));
  if (x.R.errors.length) sec.append(banner('bad', 'Some scenarios cannot be calculated', x.R.errors.map(e => e.error).slice(0, 4).join(' · ')));

  // decisions
  const dec = el('textarea', { rows: 4, id: 'sum-decisions', placeholder: 'One decision per line — e.g. Approve the 2027 treatment portfolio' }); dec.value = (M.decisions || []).join('\n');
  dec.addEventListener('input', () => { M.decisions = dec.value.split('\n'); touch(); });
  sec.append(card(el('h2', null, 'Decisions requested'),
    x.auto.length ? el('ul', null, ...x.auto.map(d => el('li', null, d, ' ', pill(MK.MGMT, 'warn')))) : el('p', 'small muted', 'The assessment shows no decision yet.'),
    field('Other decisions requested', dec, 'Each line is exported with the marker “Management decision required”.')));

  // residual vs tolerance
  const grid = el('table', 'compact');
  grid.append(el('thead', null, el('tr', null, el('th', null, ''), ...CLS.map(c => el('th', 'num', tr(c))))),
    el('tbody', null, el('tr', null, el('td', null, tr('Before treatment')), ...CLS.map(c => el('td', 'num', String(x.before[c])))),
      el('tr', null, el('td', null, tr('After treatment')), ...CLS.map(c => el('td', 'num', String(x.after[c]))))));
  sec.append(el('div', 'cols2',
    card(el('h2', null, 'Residual risk against tolerance'), grid,
      el('div', 'grid g3', { style: { marginTop: '10px' } }, kpi('Estimated', n0(x.R.totals.est)), kpi('Tolerated', n0(x.R.totals.tol)), kpi('Residual', n0(x.R.totals.res))),
      el('p', 'note', 'Risk units are relative decision-support indicators, not dollars.')),
    card(el('h2', null, 'Portfolio and budget'), el('div', 'grid g2',
      kpi('Recommended portfolio, year 1', money(Math.round(x.y1))),
      kpi('Appetite-consistent target', x.target !== null ? (x.target * 100).toFixed(1) + '%' : '—', x.target !== null ? money(Math.round(x.target * x.it)) : tr('IT budget required')),
      kpi('Current spend', x.it ? (x.spend / x.it * 100).toFixed(2) + '%' : '—', money(x.spend)),
      kpi('Gap to target', x.target !== null ? money(Math.round(x.target * x.it - x.spend)) : '—', '', x.target !== null && x.spend < x.target * x.it ? 'warn' : 'good')))));

  sec.append(card(el('h2', null, 'Top risks'), el('div', 'tablewrap', table([
    { key: 'id', label: 'ID', render: r => el('a', { href: '#/scenario/' + r.id }, r.id) }, { key: 'name', label: 'Scenario' },
    { key: 'res', label: 'Residual', num: true, render: r => n0(r.res) }, { key: 'ratio', label: 'Risk-to-tolerance ratio', num: true, render: r => n2(r.ratio) },
    { key: 'cls', label: 'Classification', render: r => pill(r.cls, pillFor(r.cls)) },
    { key: 'dec', label: 'Decision', render: r => ws.decisions?.[r.id]?.option ? tr(ws.decisions[r.id].option) : el('span', 'muted', '—') },
  ], x.top, { class: 'compact' }))));

  sec.append(card(el('h2', null, 'Markers'), el('ul', null,
    el('li', null, pill(MK.ESTIMATE, 'warn'), ' ', tr('{0} parameter value(s) labelled as estimates; {1} without an evidence reference.').replace('{0}', x.estimates).replace('{1}', x.noEvidence)),
    x.equiv.length ? el('li', null, pill(EQ.LIMITED, 'warn'), ' ', tr('CVSS with limited applicability (equivalency)'), ': ', x.equiv.join(', ')) : null,
    ...x.gaps.map(g => el('li', null, pill(MK.INFO_GAP, 'bad'), ' ', g)))));

  const lim = el('textarea', { rows: 3, id: 'sum-limits', placeholder: 'Key uncertainties, scope exclusions, evidence still to collect' }); lim.value = M.limitations || ''; lim.addEventListener('input', () => { M.limitations = lim.value; touch(); });
  const nxt = el('textarea', { rows: 2, placeholder: 'Validation activities, owners and dates' }); nxt.value = M.nextSteps || ''; nxt.addEventListener('input', () => { M.nextSteps = nxt.value; touch(); });
  const by = el('input', { value: M.preparedBy || '', placeholder: 'Name and role' }); by.addEventListener('input', () => { M.preparedBy = by.value; touch(); });
  sec.append(card(el('h2', null, 'Limitations and next steps'), field('Limitations', lim, tr(STANDARD_LIMITS)), field('Next steps', nxt), field('Prepared by', by),
    el('div', 'btnrow', { style: { marginTop: '10px' } },
      el('button', { class: 'btn', id: 'sum-md', onclick: () => { const md = markdown(ws); download(`management-summary-${today()}.md`, md, 'text/markdown'); exported(ws); toast('Summary exported'); } }, 'Export the summary (.md)'),
      el('button', { class: 'btn ghost', id: 'sum-print', onclick: () => { printable(ws); exported(ws); } }, 'Printable summary')),
    M.date ? el('p', 'small muted', tr('Last exported on {0}.').replace('{0}', M.date)) : null));
}

function exported(ws) { ws.mgmtSummary.date = today(); LOG.data('management summary exported', ws.name, '', ws.name); touch(); }

function printable(ws) {
  const w = window.open('', '_blank'); if (!w) return;
  const md = markdown(ws);
  const html = md.split('\n').map(l => {
    if (l.startsWith('# ')) return `<h1>${esc(l.slice(2))}</h1>`;
    if (l.startsWith('## ')) return `<h2>${esc(l.slice(3))}</h2>`;
    if (l.startsWith('- ')) return `<li>${esc(l.slice(2)).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')}</li>`;
    if (l.startsWith('|---')) return '';
    if (l.startsWith('|')) return '<tr>' + l.split('|').slice(1, -1).map(c => `<td>${esc(c.trim())}</td>`).join('') + '</tr>';
    if (l.startsWith('> ')) return `<p><i>${esc(l.slice(2))}</i></p>`;
    return l.trim() ? `<p>${esc(l)}</p>` : '';
  }).join('\n');
  w.document.write(`<!doctype html><html lang="${document.documentElement.lang}"><meta charset="utf-8"><title>${esc(tr('Management summary'))}</title><style>body{font:13px/1.45 system-ui,sans-serif;margin:28px;max-width:820px}h1{font-size:19px}h2{font-size:15px;margin-top:18px}td{border:1px solid #ccc;padding:3px 6px}table{border-collapse:collapse}</style>${html.replace(/(<tr>[\s\S]*?<\/tr>\n?)+/g, m => '<table>' + m + '</table>')}`);
  w.document.close(); w.focus(); w.print();
}
