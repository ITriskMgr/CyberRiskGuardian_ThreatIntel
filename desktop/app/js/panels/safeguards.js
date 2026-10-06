/* Existing safeguards (1.5.5) — the inventory of what already protects the organization.
   Four views: the inventory itself, the resilience coverage it adds up to (the six capabilities θ is
   defined as), the existing controls waiting to be brought over from the mitigation plan, and the
   method. Nothing here changes a score: the resilience view proposes a θ, the analyst accepts it
   scenario by scenario in the Scenario editor. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, select, toast, table, banner, field, kpi, chip, money, n0, today, go, debounce } from '../util.js';
import { S, touch, scen } from '../state.js';
import * as SG from '../safeguards.js';
import * as K from '../catalog.js';

let view = 'inventory';
const flt = { q: '', kind: 'all', state: 'all', issue: 'all' };
let openId = null;

export function render(sec) {
  const ws = S.ws;
  SG.list(ws);
  sec.replaceChildren(el('h1', null, 'Existing safeguards'),
    el('p', 'lede', 'What already protects this organization: technical measures, business processes, internal controls, awareness programmes, policies, physical and contractual measures. This is the inventory of what is in force — the treatment portfolio of measures you propose to add lives in Risk mitigation. Keeping them apart is what stops a recommendation claiming credit for a control you already have.'));
  const st = el('div', { class: 'subtabs', role: 'tablist' });
  const cands = SG.candidates(ws).length;
  // Two separate labels rather than one template with an empty placeholder: the interface catalogue
  // matches "Bring controls over ({0})" only when there is something in the brackets.
  const bringLabel = cands ? `Bring controls over (${cands})` : 'Bring controls over';
  for (const [k, t] of [['inventory', `Inventory (${SG.list(ws).length})`], ['resilience', 'Resilience coverage'],
                        ['bring', bringLabel], ['about', 'Method']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ inventory, resilience, bring, about }[view])(body, sec);
}

/* ---------------- inventory ---------------- */
function inventory(body, sec) {
  const ws = S.ws, all = SG.list(ws), s = SG.stats(ws);
  body.append(el('div', 'grid g4',
    kpi('In force', `${s.inForce} / ${s.total}`, 'planned and retired count for nothing', s.inForce ? 'good' : ''),
    kpi('Annual run cost', money(s.runCost), 'what keeps existing security running', s.runCost ? '' : 'warn'),
    kpi('Resilience capabilities covered', `${s.capabilitiesCovered} / ${SG.CAPABILITIES.length}`,
        s.gaps.length ? 'nothing covers ' + s.gaps.join(', ').toLowerCase() : 'all six', s.capabilitiesCovered === SG.CAPABILITIES.length ? 'good' : 'warn'),
    kpi('Not shown to work', String(s.staleOrUntested), `never tested or tested over ${Math.round(SG.STALE_DAYS / 30)} months ago`, s.staleOrUntested ? 'warn' : 'good')));

  if (!all.length) {
    body.append(banner('warn', 'The inventory is empty',
      el('div', null, el('div', null, 'An assessment with no record of existing controls has to guess at resilience. Add what is in force, or bring the controls already in the mitigation plan over on the next tab.'),
        el('div', { style: { marginTop: '6px' } }, el('button', { class: 'btn sm', onclick: () => addNew(sec) }, 'Add a safeguard')))));
  }
  if (s.unowned) body.append(banner('warn', `${s.unowned} safeguard${s.unowned === 1 ? '' : 's'} in force with no owner`,
    'A control nobody owns is a control nobody maintains. Name the accountable person, not the team that installed it.'));
  if (s.ineffective) body.append(banner('bad', `${s.ineffective} safeguard${s.ineffective === 1 ? '' : 's'} tested and found not effective`,
    'Recorded as in force but failing its last test. Either it is not really in force, or it needs work before the assessment can rely on it.'));

  /* filters */
  const q = el('input', { type: 'search', placeholder: 'Search name, scope, owner, evidence…', value: flt.q, style: { minWidth: '240px' } });
  q.addEventListener('input', debounce(() => { flt.q = q.value; render(sec); }, 250));
  const kindSel = select([['all', 'Every kind'], ...SG.KINDS.map(([k, l]) => [k, l])], flt.kind);
  kindSel.addEventListener('change', () => { flt.kind = kindSel.value; render(sec); });
  const stSel = select([['all', 'Every state'], ...SG.STATES.map(([k, l]) => [k, l])], flt.state);
  stSel.addEventListener('change', () => { flt.state = stSel.value; render(sec); });
  const isSel = select([['all', 'Everything'], ['stale', 'Not shown to work'], ['unowned', 'With no owner'],
                        ['ineffective', 'Failed its test'], ['nocap', 'With no resilience contribution']], flt.issue);
  isSel.addEventListener('change', () => { flt.issue = isSel.value; render(sec); });

  const needle = flt.q.trim().toLowerCase();
  const rows = all.filter(sg => {
    if (flt.kind !== 'all' && sg.kind !== flt.kind) return false;
    if (flt.state !== 'all' && sg.state !== flt.state) return false;
    if (flt.issue === 'stale' && !SG.stale(sg)) return false;
    if (flt.issue === 'unowned' && String(sg.owner || '').trim()) return false;
    if (flt.issue === 'ineffective' && sg.result !== 'ineffective') return false;
    if (flt.issue === 'nocap' && SG.CAPABILITIES.some(([c]) => SG.strength(sg, c) > 0)) return false;
    if (!needle) return true;
    return [sg.name, sg.scope, sg.owner, sg.evidence, sg.desc, sg.note].some(x => String(x || '').toLowerCase().includes(needle));
  });

  body.append(card(el('div', 'row', { style: { alignItems: 'center' } }, q, kindSel, stSel, isSel,
      el('span', 'small muted', { style: { flex: 1 } }, `${rows.length} of ${all.length} shown`),
      el('button', { class: 'btn sm', onclick: () => addNew(sec) }, 'Add a safeguard')),
    table([
      { key: 'name', label: 'Safeguard', render: sg => el('div', null, el('b', null, sg.name || '(unnamed)'),
          el('div', 'small muted', [SG.KIND[sg.kind]?.label, sg.owner, sg.scope].filter(Boolean).join(' · '))) },
      { key: 'state', label: 'State', render: sg => pill(SG.STATE[sg.state]?.label || sg.state, SG.STATE[sg.state]?.kind || '') },
      { key: 'cap', label: 'Resilience', sortable: false, render: sg => {
          const on = SG.CAPABILITIES.filter(([c]) => SG.strength(sg, c) > 0);
          return on.length ? el('div', 'row', { style: { gap: '4px', flexWrap: 'wrap' } }, ...on.map(([c, l]) => chip(l + ' ' + SG.strength(sg, c))))
            : el('span', 'small muted', 'none recorded'); } },
      { key: 'recurring', label: 'Run cost / yr', num: true, render: sg => Number(sg.recurring) ? money(sg.recurring) : '—' },
      { key: 'tested', label: 'Last shown to work', render: sg => SG.stale(sg)
          ? pill(sg.tested ? sg.tested + ' — stale' : 'never', 'warn')
          : pill(sg.tested + (sg.result ? ' · ' + (SG.RESULTS.find(r => r[0] === sg.result)?.[1] || '') : ''), sg.result === 'ineffective' ? 'bad' : 'good') },
      { key: 'open', label: '', sortable: false, render: sg => el('button', { class: 'btn sm ghost', onclick: () => { openId = sg.id; render(sec); } }, openId === sg.id ? 'Close' : 'Open') },
    ], rows, { class: 'compact' })));

  const open = all.find(x => x.id === openId);
  if (open) body.append(editor(open, sec));
}

function addNew(sec) {
  const sg = SG.add({}, S.ws);
  openId = sg.id; view = 'inventory'; render(sec);
  toast('Safeguard ' + sg.id + ' added — describe it');
}

/* ---------------- one safeguard ---------------- */
function editor(sg, sec) {
  const ws = S.ws;
  const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, el('span', { 'data-noi18n': '' }, sg.id + ' · ' + (sg.name || '(unnamed)'))),
    el('button', { class: 'btn sm ghost danger', onclick: () => {
      if (!confirm('Remove this safeguard from the inventory?')) return;
      SG.remove(sg.id, ws); openId = null; toast('Removed'); render(sec);
    } }, 'Remove'), el('button', { class: 'btn sm ghost', onclick: () => { openId = null; render(sec); } }, 'Close')));

  const set = (k, v) => { sg[k] = v; touch(); };
  const txt = (k, ph) => { const i = el('input', { type: 'text', value: sg[k] || '', placeholder: ph || '' });
    i.addEventListener('input', () => set(k, i.value)); return i; };
  const area = (k, ph, rows = 3) => { const i = el('textarea', { rows, placeholder: ph || '' }); i.value = sg[k] || '';
    i.addEventListener('input', () => set(k, i.value)); return i; };
  const num = k => { const i = el('input', { type: 'number', min: 0, step: 100, value: Number(sg[k]) || 0 });
    i.addEventListener('input', () => set(k, Math.max(0, +i.value || 0))); return i; };
  const sel = (k, opts) => { const s = select(opts, sg[k] || ''); s.addEventListener('change', () => { set(k, s.value); render(sec); }); return s; };

  c.append(el('div', 'grid g2', field('Name', txt('name', 'Multi-factor authentication on remote access')),
    field('Kind', sel('kind', SG.KINDS.map(([k, l]) => [k, l])), SG.KIND[sg.kind]?.hint)));
  c.append(el('div', 'grid g3',
    field('State', sel('state', SG.STATES.map(([k, l]) => [k, l])), SG.STATE[sg.state]?.hint),
    field('Accountable owner', txt('owner', 'a person, not a team')),
    field('In force since', txt('since', 'YYYY-MM or a year'))));
  c.append(el('div', 'grid g2', field('What it is', area('desc', 'What the safeguard actually does.')),
    field('Scope — and what it does not cover', area('scope', 'Which systems, sites, people. State the exclusions: the scope is where most of the risk hides.'))));

  /* resilience contribution */
  const capBox = el('div', 'grid g3');
  for (const [k, label, hint] of SG.CAPABILITIES) {
    const s = select(SG.STRENGTH.map(([v, l]) => [String(v), `${v} — ${l}`]), String(Number(sg.cap?.[k]) || 0));
    s.addEventListener('change', () => { sg.cap = Object.assign({}, sg.cap, { [k]: +s.value }); touch(); render(sec); });
    capBox.append(field(label, s, hint));
  }
  c.append(el('h2', null, 'Contribution to resilience'),
    el('p', 'note', 'These six are the capabilities θ(ψ,A) is defined as in the methodology. Scoring them here lets resilience be argued from the inventory instead of guessed — and the Resilience coverage tab proposes a θ you can accept scenario by scenario. A score here never changes a parameter on its own.'),
    capBox);

  /* evidence that it works */
  c.append(el('h2', null, 'Evidence that it works'));
  const tested = el('input', { type: 'date', value: sg.tested || '' });
  tested.addEventListener('change', () => { set('tested', tested.value); render(sec); });
  c.append(el('div', 'grid g3', field('Last tested, audited or reviewed', tested),
    field('Result', sel('result', SG.RESULTS.map(([k, l]) => [k, l]))),
    field('Confidence in this record', sel('conf', SG.CONF.map(x => [x, x])))));
  c.append(el('div', 'grid g2', field('Evidence', area('evidence', 'The audit finding, the test report, the ticket, the policy clause — what someone could check.')),
    field('What it depends on', area('deps', 'Another safeguard, a supplier, a person. A dependency is how a control fails quietly.'))));
  if (SG.stale(sg)) c.append(banner('warn', 'Not shown to work recently',
    sg.tested ? `Last evidence ${sg.tested}. Older than ${Math.round(SG.STALE_DAYS / 30)} months, so the assessment is relying on memory.`
      : 'No test, audit or review recorded. An untested control is an assumption, and should be labelled one in the assessment.'));

  /* cost */
  c.append(el('h2', null, 'Cost'));
  c.append(el('div', 'grid g2', field('Annual cost to keep it running', num('recurring'), 'Licences, service, the share of a salary. This is what the budget baseline is made of.'),
    field('One-time cost already spent', num('initial'), 'Optional, and sunk: it does not belong in a future budget.')));

  /* links */
  const assetNames = (ws.assets || []).map(a => a.name).filter(Boolean);
  const crown = (ws.assessment?.CROWN || []).map(x => typeof x === 'string' ? x : x.name).filter(Boolean);
  c.append(el('h2', null, 'What it covers'));
  c.append(el('div', 'grid g2',
    field('Assets and services', multi(sg, 'assets', [...new Set([...crown, ...assetNames])], sec, 'No information assets or crown jewels recorded yet.'),
      'Tick what this safeguard actually protects.'),
    field('Scenarios', multi(sg, 'scen', (ws.assessment?.SCEN || []).map(x => x.id), sec, 'No scenarios in the register yet.',
      id => { const s2 = scen(id); return id + (s2?.name ? ' — ' + s2.name.slice(0, 40) : ''); }),
      'A scenario this safeguard already works against. The resilience tab can then propose a θ for that scenario alone.')));
  const ctlNames = K.controls ? K.controls() : [];
  c.append(el('div', 'grid g1', field('Framework controls it implements',
    el('div', null,
      el('div', 'row', { style: { gap: '4px', flexWrap: 'wrap', marginBottom: '6px' } },
        ...(sg.ctl || []).map(key => el('span', 'pill', key, el('button', { class: 'btn xs ghost', title: 'Remove',
          onclick: () => { sg.ctl = (sg.ctl || []).filter(x => x !== key); touch(); render(sec); } }, '×'))),
        (sg.ctl || []).length ? null : el('span', 'small muted', 'none')),
      ctlAdder(sg, ctlNames, sec)),
    'Claiming a control as implemented in the Statement of Applicability should point at something in here.')));
  c.append(el('div', 'grid g1', field('Note', area('note', '', 2))));
  return c;
}

function multi(sg, key, options, sec, emptyNote, labelOf = x => x) {
  if (!options.length) return el('span', 'small muted', emptyNote);
  const box = el('div', { style: { maxHeight: '160px', overflow: 'auto' } });
  for (const o of options) {
    const cb = el('input', { type: 'checkbox', checked: (sg[key] || []).includes(o), style: { width: 'auto' } });
    cb.addEventListener('change', () => {
      const cur = new Set(sg[key] || []);
      cb.checked ? cur.add(o) : cur.delete(o);
      sg[key] = [...cur]; touch(); render(sec);
    });
    box.append(el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--ink)', margin: '2px 0' } },
      cb, el('span', { 'data-noi18n': '' }, labelOf(o))));
  }
  return box;
}

function ctlAdder(sg, controls, sec) {
  const inp = el('input', { type: 'search', placeholder: 'Search the control catalogue…' });
  const out = el('div', { style: { marginTop: '4px' } });
  inp.addEventListener('input', debounce(() => {
    const n = inp.value.trim().toLowerCase();
    out.replaceChildren();
    if (n.length < 2) return;
    const hits = controls.filter(c => (c.key + ' ' + (c.title || '')).toLowerCase().includes(n)).slice(0, 8);
    if (!hits.length) { out.append(el('span', 'small muted', 'nothing matches')); return; }
    for (const c of hits) out.append(el('button', { class: 'btn xs ghost', style: { margin: '2px' }, onclick: () => {
      sg.ctl = [...new Set([...(sg.ctl || []), c.key])]; touch(); render(sec);
    } }, `${c.key} · ${(c.title || '').slice(0, 44)}`));
  }, 220));
  return el('div', null, inp, out);
}

/* ---------------- resilience coverage ---------------- */
function resilience(body, sec) {
  const ws = S.ws;
  const scens = (ws.assessment?.SCEN || []);
  const scopeSel = select([['all', 'The whole inventory'], ...scens.map(s => [s.id, s.id + ' — ' + (s.name || '').slice(0, 50)])], flt.scope || 'all');
  scopeSel.addEventListener('change', () => { flt.scope = scopeSel.value; render(sec); });
  const scope = flt.scope && flt.scope !== 'all' ? flt.scope : null;
  const prop = SG.proposedTheta(ws, { scen: scope });

  body.append(card(el('div', 'row', { style: { alignItems: 'center' } },
      el('label', { style: { margin: 0 } }, el('b', null, 'Resilience of')), scopeSel),
    el('p', 'note', 'θ(ψ,A) is the organization’s ability to prevent, detect, contain, respond, recover and maintain critical operations. Scored from the safeguards in force, each capability taking its strongest contributor — three partial backups are not a recovery capability.'),
    el('div', 'grid g3',
      kpi('Capabilities covered', `${prop.covered} / ${prop.of}`, scope ? 'by safeguards linked to ' + scope : 'across the inventory', prop.covered === prop.of ? 'good' : 'warn'),
      kpi('Proposed θ', String(prop.theta), `analytical estimate, band ${SG.THETA_FLOOR}–${SG.THETA_CEIL}`),
      kpi('Not covered', prop.weakest.length ? String(prop.weakest.length) : '0', prop.weakest.join(', ') || 'nothing missing', prop.weakest.length ? 'warn' : 'good'))));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Where the resilience comes from'),
    table([
      { key: 'label', label: 'Capability', render: c => el('div', null, el('b', null, c.label),
          el('div', 'small muted', SG.CAPABILITY[c.key]?.hint)) },
      { key: 'best', label: 'Strongest contributor', render: c => c.best
          ? pill(`${c.best} / ${SG.MAX_STRENGTH} — ${SG.STRENGTH.find(s => s[0] === c.best)?.[1]}`, c.best >= 2 ? 'good' : 'warn')
          : pill('nothing in force', 'bad') },
      { key: 'count', label: 'Safeguards', num: true },
      { key: 'who', label: 'Which ones', sortable: false, render: c => c.contributors.length
          ? el('div', 'row', { style: { gap: '4px', flexWrap: 'wrap' } }, ...c.contributors.slice(0, 6).map(sg =>
              el('button', { class: 'btn xs ghost', onclick: () => { view = 'inventory'; openId = sg.id; render(sec); } }, sg.name || sg.id)))
          : el('span', 'small muted', 'none') },
    ], prop.coverage, { class: 'compact' })));

  const scenTheta = scope ? (scen(scope)?.params?.Th?.v ?? null) : null;
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Proposing this θ'),
    el('p', null, prop.why),
    scope ? el('p', null, `Scenario ${scope} currently holds θ = `, el('b', null, scenTheta === null ? 'not set' : String(scenTheta)),
      '. The proposal is ', el('b', null, String(prop.theta)), '.') : null,
    banner('warn', 'A proposal, not a change',
      'Nothing on this screen alters a parameter. Resilience is a property of the organization, and the analyst accepts a θ scenario by scenario in the Scenario editor, with the rationale this screen provides. Copy it across with the button below, then review it there.'),
    el('div', 'btnrow',
      el('button', { class: 'btn', disabled: !scope, onclick: () => {
        const s = scen(scope); if (!s) return;
        s.params ||= {};
        const before = s.params.Th?.v;
        s.params.Th = Object.assign({}, s.params.Th, { v: prop.theta, rat: prop.why, conf: prop.covered >= 4 ? 'Medium' : 'Low' });
        (s.revisions ||= []).push({ date: today(), what: `θ set to ${prop.theta}` + (before === undefined ? '' : ` (was ${before})`) + ' from the inventory of existing safeguards' });
        touch(); toast(`θ of ${scope} set to ${prop.theta} — review the rationale in the Scenario editor`);
        render(sec);
      } }, scope ? `Put θ = ${prop.theta} on ${scope}` : 'Choose a scenario first'),
      el('button', { class: 'btn ghost', onclick: () => go('scenario' + (scope ? '/' + scope : '')) }, 'Open the Scenario editor'))));
}

/* ---------------- bring controls over ---------------- */
function bring(body, sec) {
  const ws = S.ws, cands = SG.candidates(ws);
  body.append(card(el('p', null, 'Until 1.5.5 the existing controls found in your documents were added to the ',
      el('b', null, 'Risk mitigation'), ' plan as measures marked implemented. That is the treatment portfolio, not an inventory: it is why a recommendation could appear to claim credit for a control you already had, and why nothing could answer who owns a control or when it was last shown to work.'),
    el('p', 'note', 'Nothing is moved for you. Tick what belongs in the inventory. The measure stays in the plan — a measure already implemented contributes nothing to a recommendation, so leaving it there is harmless; remove it if you prefer the plan to hold only what you propose to add.')));

  if (!cands.length) {
    body.append(banner('good', 'Nothing waiting',
      'No measure in the mitigation plan is marked implemented and missing from the inventory.'));
    return;
  }
  const picked = new Set();
  const rows = cands.map(c => ({ ...c, id: c.m.id }));
  const tbl = table([
    { key: 'pick', label: '', sortable: false, render: r => {
        const cb = el('input', { type: 'checkbox', style: { width: 'auto' } });
        cb.addEventListener('change', () => { cb.checked ? picked.add(r.id) : picked.delete(r.id); count(); });
        return cb; } },
    { key: 'name', label: 'Measure', render: r => el('div', null, el('b', null, r.m.name), el('div', 'small muted', r.why)) },
    { key: 'fn', label: 'Function', render: r => r.m.fn },
    { key: 'recurring', label: 'Run cost / yr', num: true, render: r => Number(r.m.recurring) ? money(r.m.recurring) : '—' },
    { key: 'scen', label: 'Scenarios', render: r => (r.m.scen || []).join(', ') || '—' },
  ], rows, { class: 'compact' });
  const info = el('div', 'note');
  const count = () => { info.textContent = `${picked.size} of ${rows.length} ticked.`; };
  count();
  body.append(card(tbl, info, el('div', 'btnrow', { style: { marginTop: '10px' } },
    el('button', { class: 'btn', onclick: () => {
      if (!picked.size) { toast('Tick the ones to bring over first', 'bad'); return; }
      let n = 0;
      for (const r of rows) if (picked.has(r.id)) { SG.adoptMeasure(r.m, ws); n++; }
      touch(); toast(`${n} brought into the inventory — review each one`); view = 'inventory'; render(sec);
    } }, 'Bring the ticked ones into the inventory'),
    el('button', { class: 'btn ghost', onclick: () => { for (const r of rows) picked.add(r.id); count(); toast('All ticked'); } }, 'Tick all'))));
}

/* ---------------- method ---------------- */
function about(body) {
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Why this is a separate register'),
    el('p', null, 'Two different questions get two different registers. ', el('b', null, 'Risk mitigation'),
      ' answers “what should we add, what would it cost, and what would it buy us?” — measures with a likelihood and impact reduction, feeding the recommendations. ',
      el('b', null, 'Existing safeguards'), ' answers “what protects us today, who owns it, and when was it last shown to work?”'),
    el('p', null, 'Conflating them has two consequences the methodology warns about: a treatment portfolio padded with things already in place, and a resilience estimate with no evidence behind it.'),
    el('h2', null, 'What the inventory is used for'),
    el('ul', null,
      el('li', null, el('b', null, 'Context. '), 'The methodology asks for the organization’s existing cybersecurity controls. This is that, as a record rather than a recollection.'),
      el('li', null, el('b', null, 'θ(ψ,A). '), 'The six capabilities scored against each safeguard are exactly the ones θ is defined as. The Resilience coverage tab proposes a θ; you accept it per scenario.'),
      el('li', null, el('b', null, 'The budget baseline. '), 'The annual run cost of what is in force is what the budget band calls the baseline — previously typed from memory.'),
      el('li', null, el('b', null, 'The Statement of Applicability. '), 'A control claimed as implemented should point at a safeguard here.')),
    el('h2', null, 'What it deliberately does not do'),
    el('ul', null,
      el('li', null, 'It computes no reduction and changes no score.'),
      el('li', null, 'A safeguard marked ', el('b', null, 'planned'), ' counts for nothing: a control protects an organization when it operates, not when it is decided.'),
      el('li', null, 'A capability takes its ', el('b', null, 'strongest'), ' contributor, never the sum.'),
      el('li', null, 'A proposed θ is an ', el('b', null, 'analytical estimate — validation required'), ', floored at ' + SG.THETA_FLOOR + ' and capped at ' + SG.THETA_CEIL + ': an inventory cannot prove perfect resilience, and an organization with nothing recorded is undocumented rather than helpless.'))));
}
