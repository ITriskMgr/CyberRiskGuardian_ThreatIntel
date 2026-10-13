/* Compliance — legal applicability and compliance determinations (1.5.8).

   Applicability   the organisation profile in CRGO's terms (organisation type, where it is established,
                   offers services or monitors behaviour, its processing activities with their data
                   categories, where data subjects are and where data goes, and which of these the profile
                   lists completely), assessed against CRGO's legal instruments and their 19 conditions
                   (Loi 25 / P-39.1, A-2.1, R-22.1, PIPEDA, OSFI B-13, GDPR, C-1.1). The answer is
                   applicable, not applicable, potentially applicable (qualified review required) or
                   unknown (an evidence gap) — never legal advice, and unknown never becomes "not applicable".
   Determinations  compliance with a provision, recorded with evidence or with an explicit evidence gap.
                   A control mapped to an obligation SUPPORTS compliance; only a determination with
                   evidence says the obligation is satisfied.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, banner, table, kpi, n0, today, toast, chip } from '../util.js';
import { S, touch } from '../state.js';
import * as C from '../crgo.js';
import * as D from '../dss.js';
import * as G from '../grcui.js';
import { tr } from '../i18n.js';
import * as M from '../cms.js';

const lab = x => (x?.label || {})[document.documentElement.lang === 'fr' ? 'fr' : 'en'] || x?.label?.en || x?.key || '';
async function legal() { return (await C.snapshot()).legal; }

export async function applicability(body, redraw) {
  const ws = S.ws, P = ws.grc.profile;
  let L;
  try { L = await legal(); } catch (e) { body.append(banner('bad', 'The ontology snapshot could not be read', String(e.message || e))); return; }
  body.append(banner('warn', 'Not legal advice', 'Applicability is CRGO\'s evaluation of the profile against each instrument\'s conditions. "Potentially applicable" needs a qualified person; "unknown" means a fact is missing from the profile and is an evidence gap, never "not applicable".'));
  const opts = list => list.map(x => [x.key, lab(x)]);
  const jur = opts(L.jurisdictions), types = opts(L.orgTypes), cats = opts(L.dataCategories);
  const multi = (key, options, label) => {
    const set = new Set(P[key] || []);
    return el('div', 'field', el('label', null, label), el('div', 'chips', ...options.map(([v, t]) => {
      const c = el('input', { type: 'checkbox', checked: set.has(v), style: { width: 'auto' } });
      c.addEventListener('change', () => { P[key] = c.checked ? [...new Set([...(P[key] || []), v])] : (P[key] || []).filter(x => x !== v); touch(); });
      return el('label', { class: 'chip', 'data-noi18n': '' }, c, ' ', t);
    })));
  };
  const COMPLETE = [['hasOrganisationType', 'Organisation types'], ['establishedIn', 'Where it is established'], ['offersServicesIn', 'Where it offers goods or services'],
    ['monitorsBehaviourIn', 'Where it monitors behaviour'], ['carriedOutBy', 'Processing activities'], ['processesDataCategory', 'Data categories'], ['dataSubjectsIn', 'Where data subjects are'], ['transfersDataTo', 'Where data is transferred']];
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Organisation profile for applicability'),
    multi('orgTypes', types, tr('Organisation type')), multi('establishedIn', jur, tr('Established in')), multi('offersServicesIn', jur, tr('Offers goods or services to people in')),
    multi('monitorsBehaviourIn', jur, tr('Monitors the behaviour of people in')),
    el('p', 'small muted', 'A value the profile lists is a fact. A value it does not list counts as absent only for the properties ticked as complete below; otherwise the fact is missing and the condition stays undetermined.'),
    multi('complete', COMPLETE, tr('The profile lists these completely'))));
  P.activities ||= [];
  body.append(G.register({ title: 'Processing activities', rows: P.activities, prefix: 'PA', redraw, csv: false,
    fields: [{ key: 'name', label: 'Activity', type: 'text', wide: true }, { key: 'dataCategories', label: 'Data categories', type: 'multi', options: cats },
      { key: 'dataSubjectsIn', label: 'Data subjects in', type: 'multi', options: jur }, { key: 'transfersTo', label: 'Data transferred to', type: 'multi', options: jur }],
    blank: () => ({ dataCategories: [], dataSubjectsIn: [], transfersTo: [] }),
    columns: ['name', { key: 'dataCategories', label: 'Data categories', render: r => (r.dataCategories || []).map(k => lab(L.dataCategories.find(x => x.key === k))).join(', ') }] }));
  const date = el('input', { type: 'date', value: ws.grc.applicability?.date || today() });
  const out = el('div');
  const show = (res, source, d) => {
    const cond = {}; for (const i of L.instruments) for (const c of i.conditions) cond[c.id] = c;
    const cl = ids => (ids || []).map(id => el('div', { class: 'small', 'data-noi18n': '' }, lab(cond[id]) || id));
    out.replaceChildren(card(el('h2', { style: { marginTop: 0 } }, tr('Legal applicability on {0}').replace('{0}', d)),
      el('p', 'small muted', source === 'mcp' ? tr('Evaluated by CRGO\'s evaluator (pipeline/grc/applicability.py) through the local helper.') : tr('Evaluated in the browser with the port of CRGO\'s evaluator (the same rules), from the snapshot {0}.').replace('{0}', ws.grc.applicability?.release || '')),
      table([{ key: 'i', label: 'Instrument', render: r => el('span', { 'data-noi18n': '' }, el('b', null, r.id), ' ', lab(L.instruments.find(x => x.id === r.id))) },
        { key: 's', label: 'State', render: r => pill(tr(D.STATE_TEXT[r.state] || r.state), D.STATE_KIND[r.state]) },
        { key: 'm', label: 'Conditions met', render: r => el('div', null, ...cl(r.met)) },
        { key: 'u', label: 'Unresolved (facts missing)', render: r => el('div', null, ...cl(r.undetermined)) },
        { key: 'n', label: 'Not met', render: r => el('div', null, ...cl(r.notMet)) }], Object.entries(res).map(([id, v]) => ({ id, ...v })), { class: 'compact' })));
  };
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Evaluate'),
    el('div', 'row', { style: { alignItems: 'end', gap: '8px' } }, el('div', 'field', el('label', null, 'Date of the assessment'), date),
      el('button', { class: 'btn', onclick: async () => {
        const v = D.evaluate(P, date.value, L);
        ws.grc.applicability = { date: date.value, source: 'local', release: (await C.snapshot()).release, results: v }; touch(); show(v, 'local', date.value);
      } }, 'Evaluate in the browser'),
      el('button', { class: 'btn ghost', onclick: async e => {
        e.target.disabled = true;
        const r = await D.applicabilityViaHelper(ws);
        e.target.disabled = false;
        if (r.error) { out.replaceChildren(banner('bad', tr(r.code || 'Error'), tr(r.message || ''))); return; }
        ws.grc.applicability = { date: r.date, source: 'mcp', release: r.release?.tag, results: Object.fromEntries(Object.entries(r.states).map(([k, v]) => [k, v])) }; touch(); show(ws.grc.applicability.results, 'mcp', r.date);
      } }, 'Evaluate with CRGO (helper)')), out));
  if (ws.grc.applicability) show(ws.grc.applicability.results, ws.grc.applicability.source, ws.grc.applicability.date);
}

const SH_KIND = { current: 'good', expired: 'bad', 'judged-insufficient': 'bad', none: 'warn' };
export const COMP = [['satisfied', 'Satisfied'], ['partially-satisfied', 'Partially satisfied'], ['unsatisfied', 'Unsatisfied'], ['not-assessed', 'Not assessed'], ['undetermined', 'Undetermined — evidence gap']];
export async function determinations(body, redraw) {
  const ws = S.ws, R = ws.grc.determinations;
  let L; try { L = await legal(); } catch { L = { provisions: {} }; }
  const C = M.cms(ws);
  const provs = Object.entries(L.provisions).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([n, p]) => [n, `${n} — ${lab(p)}`]);
  for (const o of C.obligations) if (o.provision && !provs.some(p => p[0] === o.provision)) provs.push([o.provision, `${o.provision} — ${o.title || ''}`]);   // provisions cited by the obligation register
  body.append(banner('warn', 'Supports compliance is not compliance', 'A control mapped to an obligation supports compliance with it; it never proves it. Only a determination recorded here with evidence says an obligation is satisfied — otherwise the gap is stated.'));
  body.append(G.register({ title: 'Compliance determinations', rows: R, prefix: 'CD', redraw,
    fields: [{ key: 'provision', label: 'Provision', type: 'select', options: [['', '—'], ...provs], wide: true }, { key: 'state', label: 'State', type: 'select', options: COMP },
      { key: 'date', label: 'Date', type: 'date' }, { key: 'assessor', label: 'Assessed by', type: 'text' },
      { key: 'obligation', label: 'Obligation (obligation register)', type: 'select', options: [['', '—'], ...C.obligations.map(o => [o.id, `${o.id} ${o.title || ''}`])] },
      { key: 'campaign', label: 'Campaign', type: 'select', options: [['', '—'], ...C.campaigns.map(c => [c.id, `${c.id} ${c.name || ''}`])] },
      { key: 'evidence', label: 'Evidence (references or evidence-register IDs)', type: 'list' }, { key: 'evidenceGap', label: 'Evidence gap (what is missing)', type: 'area' },
      { key: 'rootCause', label: 'Root-cause category (if not satisfied)', type: 'select', options: M.ROOT_CAUSES },
      { key: 'ks', label: 'Kind of claim', type: 'select', options: G.KS }, { key: 'notes', label: 'Notes', type: 'area' }],
    blank: () => ({ state: 'not-assessed', date: today(), evidence: [], ks: 'audit-conclusion' }),
    validate: r => M.determinationError(r, ws),
    columns: [{ key: 'provision', label: 'Provision', render: r => el('span', { 'data-noi18n': '' }, r.provision || r.obligation || '') }, { key: 'state', label: 'State', render: r => pill(tr(COMP.find(x => x[0] === r.state)?.[1] || r.state), r.state === 'satisfied' ? 'good' : r.state === 'unsatisfied' ? 'bad' : 'warn') },
      'date', 'assessor', { key: 'evidence', label: 'Evidence', render: r => { const reg = M.registeredEvidence(r, ws); return reg.length ? el('span', null, String((r.evidence || []).length), ' ', pill(tr(M.EVIDENCE_TEXT[M.bestStatus(reg, r.date || today())]), SH_KIND[M.bestStatus(reg, r.date || today())])) : String((r.evidence || []).length); } },
      { key: 'evidenceGap', label: 'Evidence gap', render: r => el('span', { class: 'small', 'data-noi18n': '' }, r.evidenceGap || '') },
      { key: 'campaign', label: 'Campaign', render: r => r.campaign ? el('span', null, el('span', { 'data-noi18n': '' }, r.campaign), C.campaigns.find(c => c.id === r.campaign)?.frozen?.ids?.includes(r.id) ? ' 🔒' : '') : '—' }] }));
  // what the scenarios link to: supported by controls, not compliance
  const rows = [];
  for (const s of ws.assessment.SCEN) {
    const ob = [...new Set([...(s.obligations || []), ...(s.crgo?.obligations || []).map(o => String(o).split(' — ')[0])])];
    for (const o of ob) rows.push({ o, sid: s.id, controls: (s.controls || []).length, det: R.filter(d => d.provision === o).sort((a, b) => String(b.date).localeCompare(String(a.date)))[0] });
  }
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Obligations the scenarios touch'),
    el('p', 'note', 'Obligations linked to scenarios (from the ontology, or added in the scenario editor) with the controls that support them. "Supported by" is a link, not a conclusion.'),
    rows.length ? table([{ key: 'o', label: 'Provision', render: r => el('span', { 'data-noi18n': '' }, r.o) }, { key: 'sid', label: 'Scenario' }, { key: 'controls', label: 'Supported by (controls)' },
      { key: 'det', label: 'Determination', render: r => r.det ? pill(tr(COMP.find(x => x[0] === r.det.state)?.[1] || r.det.state), r.det.state === 'satisfied' ? 'good' : 'warn') : pill(tr(D.GAP), 'bad') }], rows, { class: 'compact' })
      : el('div', 'empty-state', 'No scenario is linked to an obligation yet.')));
}

/** Markdown sections for the compliance report. */
export async function reportSections(ws = S.ws) {
  let L; try { L = await legal(); } catch { L = null; }
  const A = ws.grc.applicability, out = ['## Legal applicability', ''];
  if (A && L) {
    out.push(`Evaluated on ${A.date} (${A.source === 'mcp' ? 'CRGO evaluator through the helper' : 'browser port of the CRGO evaluator'}, CRGO ${A.release || ''}). Not legal advice: "potentially applicable" needs qualified review; "unknown" is an evidence gap.`, '',
      '| Instrument | State | Unresolved conditions | Qualified review needed |', '|---|---|---|---|');
    for (const [id, v] of Object.entries(A.results)) out.push(`| ${id} | ${D.STATE_TEXT[v.state] || v.state} | ${(v.undetermined || []).join(', ') || '—'} | ${v.state === 'PotentiallyApplicable' ? 'yes' : '—'} |`);
  } else out.push(D.GAP + ' The organisation profile has not been assessed for applicability.');
  out.push('', '## Compliance determinations', '', '| Provision | State | Date | Assessed by | Evidence | Evidence gap |', '|---|---|---|---|---|---|',
    ...ws.grc.determinations.map(d => `| ${d.provision} | ${d.state} | ${d.date || ''} | ${d.assessor || ''} | ${(d.evidence || []).join('; ').replace(/\|/g, '/')} | ${String(d.evidenceGap || '').replace(/\|/g, '/')} |`), '',
    'A control that supports an obligation is not evidence of compliance; only the determinations above, with their evidence, state compliance.');
  return out.join('\n');
}
