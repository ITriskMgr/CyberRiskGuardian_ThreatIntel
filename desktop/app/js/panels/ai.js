/* AI assistant (1.5.1 proof of concept) — the in-app analyst, parameter critique, scenario
   generation, and the decision log that records what was sent and what was done with the answer.

   The outbound preview is not decoration. It is the only honest way to let someone decide whether to
   send their organization's risk assessment to a model, so it shows the payload in full, its size,
   and where it is going, before anything leaves the machine.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, kpi, pill, banner, toast, table, field, select, input, chip, n0, n2, today, download, copyText } from '../util.js';
import { S, touch, compute, scen } from '../state.js';
import * as AI from '../ai.js';
import * as helper from '../helper.js';
import * as F from '../forecast.js';

let view = 'analyst';
let pending = null;            // a prepared payload awaiting the analyst's decision to send
let answer = null;             // the last answer, by task
let busy = false;
const answers = {};
const draft = { question: '', brief: '', count: 8 };

export function render(sec, arg) {
  const ws = S.ws, a = AI.settings(ws);
  // Paint from what is already known and refresh once the helper answers. Awaiting the probe before
  // the first paint let a second render overtake the first and show a stale switch.
  if (helper.HS.helper === undefined) helper.probe().catch(() => {}).then(() => render(sec, arg));
  sec.replaceChildren(el('h1', null, 'AI assistant'));
  sec.append(el('p', 'lede',
    'AI proposes and explains; the ', el('b', null, 'verified engine still calculates'),
    ', and nothing it produces changes a stored value until you accept it. Every call is shown in ' +
    'full before it is sent and recorded afterwards. ', el('b', null, AI.MARK)));

  sec.append(statusCard(sec));
  if (!a.enabled) return;

  const st = el('div', { class: 'subtabs', role: 'tablist' });
  for (const [k, t] of [['analyst', 'Analyst'], ['critique', 'Parameter critique'],
                        ['scenarios', 'Scenario generation'], ['log', 'Decision log']])
    st.append(el('button', { role: 'tab', 'aria-selected': String(view === k), onclick: () => { view = k; pending = null; render(sec); } }, t));
  sec.append(st);
  const body = el('div'); sec.append(body);
  ({ analyst: analystView, critique: critiqueView, scenarios: scenarioView, log: logView }[view])(body, sec);
}

/* ---------------- status and consent ---------------- */
function statusCard(sec) {
  const ws = S.ws, a = AI.settings(ws);
  const info = helper.HS.helper ? helper.HS.ai : null;
  const c = card();
  const providerSel = select(
    Object.entries(info?.providers || { claude: { label: 'Claude API' }, local: { label: 'Local model' } })
      .map(([k, v]) => [k, v.label]), a.provider);
  providerSel.addEventListener('change', () => { a.provider = providerSel.value; touch(); render(sec); });

  const on = el('input', { type: 'checkbox', checked: a.enabled, style: { width: 'auto' } });
  on.addEventListener('change', () => { a.enabled = on.checked; touch(); render(sec); });
  const conf = el('input', { type: 'checkbox', checked: a.confidential, style: { width: 'auto' } });
  conf.addEventListener('change', () => { a.confidential = conf.checked; if (conf.checked) a.acknowledged = ''; touch(); render(sec); });
  const an = el('input', { type: 'checkbox', checked: a.anon, style: { width: 'auto' } });
  an.addEventListener('change', () => { a.anon = an.checked; pending = null; touch(); render(sec); });

  c.append(el('div', 'grid g3',
    field('AI for this workspace', el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '6px' } }, on,
      a.enabled ? 'On' : 'Off'), 'On by default. Switch it off and nothing about this workspace can be sent.'),
    field('Provider', providerSel, info?.providers?.[a.provider]?.local
      ? 'A model on this machine. Nothing leaves it.' : 'Requests go to Anthropic.'),
    field('Treat as confidential', el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center', paddingTop: '6px' } }, conf,
      a.confidential ? 'Yes — confirm every call' : 'No'),
      'A confidential workspace confirms every single call; consent is never remembered.')));
  c.append(field('Anonymize before sending',
    el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, an,
      a.anon ? 'On — organization, people, assets, hosts and amounts replaced' : 'Off'),
    'Uses the same pipeline as Publish & share. The preview shows exactly what the anonymized payload says.'));

  if (!helper.HS.helper) {
    c.append(banner('warn', 'The local helper is not running',
      'AI needs the helper, because the browser never calls a model directly. Start the app with ' +
      'start.command rather than opening index.html, and this panel will connect.'));
  } else if (!info?.keys?.[a.provider] && !AI.isLocal(a.provider)) {
    c.append(banner('warn', 'No Anthropic API key is stored',
      'Add one in Settings. It is written to a file the helper owns, mode 600, never in crg-config.json ' +
      'and never in a log.'));
  }
  if (a.enabled && !AI.isLocal(a.provider)) {
    c.append(el('p', 'note', el('b', null, 'What this changes. '),
      'The application itself still makes no network request. When you send from this screen, the helper ' +
      'transmits the text shown in the preview to Anthropic. That is a real change in what leaves this ' +
      'machine, and it is why the preview exists.'));
  }
  c.append(el('p', 'note', 'Where each AI feature may send its requests — local model, Claude API or nowhere — is set in one place: ',
    el('a', { href: '#/settings/ai' }, 'Settings → AI — local & remote'), '.'));
  return c;
}

/* ---------------- the outbound preview ---------------- */
function previewCard(sec, onSent) {
  const ws = S.ws;
  const p = pending, a = { provider: p.provider || AI.settings(ws).provider };
  const c = card();
  c.append(el('h2', null, 'About to send'));
  c.append(el('div', 'grid g4',
    kpi('Task', p.label, p.anonymized ? 'anonymized' : 'as written'),
    kpi('Size', `${n0(p.bytes)} bytes`, `${n0(p.words)} words`),
    kpi('Destination', AI.isLocal(a.provider) ? 'this machine' : AI.provider(a.provider).label,
        AI.isLocal(a.provider) ? (helper.HS.ai?.bases?.[a.provider] || 'local endpoint') : AI.host(a.provider),
        AI.kindOf(a.provider)),
    kpi('Model', helper.HS.ai?.models?.[a.provider] || '—', 'set in Settings')));
  const ta = el('textarea', { rows: 16, readonly: true, class: 'mono',
    style: { fontSize: '11.5px', whiteSpace: 'pre-wrap' } });
  ta.value = p.system + '\n\n---\n\n' + p.prompt;
  c.append(el('p', 'note', 'This is the payload, byte for byte. Nothing else is transmitted.'));
  c.append(ta);
  if (p.anonymized) c.append(el('p', 'note',
    'Anonymized. Read it anyway — the pipeline replaces what it recognizes, and only you know what else ' +
    'in the free text identifies the organization.'));

  const consent = AI.needsConsent(ws);
  if (consent) c.append(banner(AI.kindOf(a.provider),
    AI.confidential(ws) ? 'This workspace is marked confidential' : 'First send from this workspace',
    AI.confidential(ws)
      ? 'Every call is confirmed individually; nothing is remembered.'
      : 'Confirming once records the date against the workspace. Mark it confidential to be asked every time.'));

  c.append(el('div', 'row', { style: { marginTop: '10px' } },
    el('button', { class: 'btn', disabled: busy, onclick: async e => {
      busy = true; e.target.disabled = true; e.target.textContent = 'Sending…';
      try {
        const out = await AI.send(p, ws);
        AI.acknowledge(ws);
        answers[p.task] = out;
        pending = null;
        toast(`${out.model} answered${out.usage?.out ? ` — ${out.usage.out} tokens` : ''}`);
        onSent && onSent(out);
      } catch (err) {
        sec.append(banner('bad', 'The request failed', String(err.message || err)));
      }
      busy = false; render(sec);
    } }, consent ? 'Confirm and send' : 'Send'),
    el('button', { class: 'btn ghost', onclick: () => { pending = null; render(sec); } }, 'Cancel'),
    el('button', { class: 'btn ghost', onclick: ev => copyText(p.system + '\n\n' + p.prompt, ev.target) }, 'Copy')));
  return c;
}

const prep = (sec, task, opts) => {
  try { pending = AI.prepare(task, S.ws, opts); render(sec); }
  catch (e) { sec.append(banner('bad', 'The request could not be prepared', String(e.message || e))); }
};

/* ---------------- analyst ---------------- */
function analystView(body, sec) {
  const q = el('textarea', { rows: 3, value: draft.question,
    placeholder: 'Ask about this workspace — "which scenarios drive the portfolio ratio?", "is our appetite consistent with the sector?", "what is missing before I take this to the committee?"' });
  q.addEventListener('input', () => { draft.question = q.value; });
  body.append(card(
    el('p', 'note', 'The analyst answers from this workspace and names the identifiers it used, so you can ' +
      'check it. It is given the organization profile, the included scenarios with their parameters and the ' +
      'engine\'s own figures, the measures, the recommendations and the indicator names.'),
    field('Question', q),
    el('div', 'row', el('button', { class: 'btn', onclick: () => prep(sec, 'analyst', { question: draft.question }) }, 'Prepare the request'))));
  if (pending?.task === 'analyst') body.append(previewCard(sec));
  const out = answers.analyst;
  if (out) {
    const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, 'Answer'),
      pill(out.model, 'good')));
    c.append(el('div', { style: { whiteSpace: 'pre-wrap' } }, out.text));
    c.append(el('p', 'note', AI.MARK + ' Check the identifiers it cites against the register before relying on it.'));
    body.append(c);
  }
}

/* ---------------- parameter critique ---------------- */
function critiqueView(body, sec) {
  body.append(card(
    el('p', 'note', 'A reviewer\'s pass over the estimates: inconsistency between similar scenarios, ' +
      'confidence the evidence does not support, θ out of line with the controls recorded, consequence ' +
      'categories that look unconsidered. It ', el('b', null, 'suggests and never applies'), ' — accepting a ' +
      'finding opens the scenario so you make the change yourself.'),
    el('div', 'row', el('button', { class: 'btn', onclick: () => prep(sec, 'critique') }, 'Prepare the request'))));
  if (pending?.task === 'critique') body.append(previewCard(sec));
  const out = answers.critique;
  if (!out) return;
  let parsed;
  try { parsed = AI.parseJson(out.text); }
  catch (e) {
    body.append(banner('warn', 'The answer was not machine-readable', String(e.message || e)));
    body.append(card(el('div', { style: { whiteSpace: 'pre-wrap' } }, out.text)));
    return;
  }
  const rows = (parsed.findings || []).map((f, i) => Object.assign({ i }, f));
  const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `${rows.length} finding(s)`), pill(out.model, 'good')));
  if (AI.truncated(parsed, out.usage, 12000)) c.append(banner('warn', 'The answer was cut short',
    `The model reached its output limit. The ${rows.length} complete finding(s) below were recovered; ` +
    'anything after them was lost. Narrow the workspace or run it again.'));
  c.append(table([
    { key: 'severity', label: 'Severity', render: f => pill(f.severity || 'medium',
        f.severity === 'high' ? 'bad' : f.severity === 'low' ? '' : 'warn') },
    { key: 'scenario', label: 'Scenario', render: f => f.scenario && scen(f.scenario)
        ? chip(f.scenario, { href: '#/scenario/' + f.scenario }) : (f.scenario || '—') },
    { key: 'parameter', label: 'Parameter', cls: 'mono' },
    { key: 'issue', label: 'Issue' },
    { key: 'evidence', label: 'What points to it', render: f => el('span', 'small', f.evidence || '—') },
    { key: 'suggestion', label: 'Suggestion', render: f => el('span', 'small', f.suggestion || '—') },
  ], rows, { sortKey: 'severity' }));
  c.append(el('p', 'note', AI.MARK + ' Nothing here has changed any value. Open the scenario to act on a finding.'));
  c.append(decisionBar(sec, out, 'critique'));
  body.append(c);
}

/* ---------------- scenario generation ---------------- */
function scenarioView(body, sec) {
  const ws = S.ws;
  const b = el('textarea', { rows: 2, value: draft.brief,
    placeholder: 'Optional: a direction — "focus on the supplier chain", "we are opening a telehealth service", "think about insider risk"' });
  b.addEventListener('input', () => { draft.brief = b.value; });
  const n = input({ type: 'number', min: 1, max: 20, value: draft.count, style: { maxWidth: '110px' } });
  n.addEventListener('change', () => { draft.count = Math.max(1, Math.min(20, Number(n.value) || 8)); });

  // feed items already matched locally, offered as seeds
  const notes = Object.entries(ws.feedNotes || {}).flatMap(([id, arr]) => (arr || []).map(x => ({ id, ...x })));
  const seeds = notes.slice(0, 40);
  const picked = new Set();
  const seedBox = el('div', 'chips');
  for (const s of seeds) {
    const lab = el('label', { class: 'chip', style: { cursor: 'pointer' } },
      el('input', { type: 'checkbox', style: { width: 'auto', margin: 0 },
        onchange: e => { e.target.checked ? picked.add(s) : picked.delete(s); } }),
      ' ' + (s.title || s.note || s.id).slice(0, 70));
    seedBox.append(lab);
  }

  body.append(card(
    el('p', 'note', 'Candidates land in Batch scenarios for review — they never enter the register directly. ' +
      'Each comes back as a full causal chain with the six parameters, a reason for each and a confidence, ' +
      'and is marked as generated until you have been through it.'),
    el('div', 'grid g3', field('How many', n)),
    field('Direction (optional)', b),
    seeds.length ? field('Seed from threat-feed items already matched to this organization', seedBox) : null,
    el('div', 'row', el('button', { class: 'btn', onclick: () => prep(sec, 'scenarios',
      { brief: draft.brief, count: draft.count, feedItems: [...picked] }) }, 'Prepare the request'))));
  if (pending?.task === 'scenarios') body.append(previewCard(sec));

  const out = answers.scenarios;
  if (!out) return;
  let parsed;
  try { parsed = AI.parseJson(out.text); }
  catch (e) {
    body.append(banner('warn', 'The answer was not machine-readable', String(e.message || e)));
    body.append(card(el('div', { style: { whiteSpace: 'pre-wrap' } }, out.text.slice(0, 4000))));
    return;
  }
  const list = parsed.scenarios || [];
  const chosen = new Set(list.map((_, i) => i));
  const c = card(el('div', 'row', el('h2', { style: { flex: 1, margin: 0 } }, `${list.length} candidate(s)`), pill(out.model, 'good')));
  if (parsed.__truncated) c.append(banner('warn', 'The answer was cut short',
    `The model reached its output limit. The ${list.length} complete candidate(s) below were recovered. ` +
    'Ask for fewer at a time.'));
  c.append(table([
    { key: 'sel', label: '', sortable: false, cls: 'cb', render: (s, i) => {
        const cb = el('input', { type: 'checkbox', checked: true });
        cb.addEventListener('change', () => { cb.checked ? chosen.add(i) : chosen.delete(i); });
        return cb; } },
    { key: 'name', label: 'Scenario', render: s => el('div', null, el('b', null, s.name || '(unnamed)'),
        el('div', 'small muted', (s.statement || '').slice(0, 160))) },
    { key: 'params', label: 'Parameters', sortable: false, render: s => el('span', 'mono small',
        ['PbA', 'Pbx', 'De', 'Dm', 'Th', 'Mu'].map(k => `${k}=${Number(s.params?.[k]?.v ?? 0).toFixed(2)}`).join(' ')) },
    { key: 'seed', label: 'Prompted by', render: s => s.seed ? el('span', 'small', s.seed) : el('span', 'muted', '—') },
  ], list, { sortable: false }));
  c.append(el('div', 'row', { style: { marginTop: '10px' } },
    el('button', { class: 'btn', onclick: () => {
      const a = ws.assessment;
      a.CANDIDATES = a.CANDIDATES || [];
      let n2 = 0;
      for (const [i, s] of list.entries()) {
        if (!chosen.has(i)) continue;
        a.CANDIDATES.push({
          id: 'CAND-' + (a.CANDIDATES.length + 1), name: s.name || '(unnamed)',
          statement: s.statement || '', threat_source: s.threat_source || '',
          initiating_event: s.initiating_event || '', vulnerability: s.vulnerability || '',
          asset: s.asset || '', process: s.process || '', consequence: s.consequence || '',
          existing_controls: s.existing_controls || '', assumptions: s.assumptions || '',
          params: s.params || {}, attack: s.attack || [],
          source: 'ai', model: out.model, generated: today(), reviewed: false,
          note: AI.MARK + (s.seed ? ' Prompted by feed item ' + s.seed : ''),
        });
        n2++;
      }
      touch(); AI.decide(out.entryId, 'accepted', `${n2} candidate(s) sent to Batch scenarios`);
      toast(`${n2} candidate(s) added to Batch scenarios for review`);
      location.hash = '#/batch';
    } }, 'Send the ticked candidates to Batch scenarios'),
    el('button', { class: 'btn ghost', onclick: () => { AI.decide(out.entryId, 'rejected'); answers.scenarios = null; render(sec); } }, 'Reject all')));
  body.append(c);
}

/* ---------------- decision bar and log ---------------- */
function decisionBar(sec, out, task) {
  const row = el('div', 'row', { style: { marginTop: '10px' } });
  for (const [d, label] of [['accepted', 'Useful — accepted'], ['edited', 'Useful with changes'], ['rejected', 'Not useful']])
    row.append(el('button', { class: 'btn sm ghost', onclick: () => {
      AI.decide(out.entryId, d); toast('Recorded in the decision log'); render(sec);
    } }, label));
  return el('div', null, el('p', 'note', 'Record what you did with this answer, so the log says whether the AI earned its place.'), row);
}

function logView(body, sec) {
  const rows = AI.log(S.ws);
  const by = k => rows.filter(r => r.decision === k).length;
  body.append(el('div', 'grid g4',
    kpi('Calls', String(rows.length), 'from this workspace'),
    kpi('Accepted', String(by('accepted') + by('edited')), `${by('edited')} with changes`),
    kpi('Rejected', String(by('rejected')), 'recorded as not useful'),
    kpi('Undecided', String(by('pending')), 'answer not yet judged', by('pending') ? 'warn' : 'good')));
  if (!rows.length) { body.append(card(el('p', 'empty', 'Nothing has been sent from this workspace.'))); return; }
  body.append(card(table([
    { key: 'at', label: 'When', render: r => new Date(r.at).toLocaleString() },
    { key: 'label', label: 'Task' },
    { key: 'provider', label: 'Provider', render: r => pill(r.provider, AI.kindOf(r.provider)) },
    { key: 'model', label: 'Model', cls: 'mono' },
    { key: 'bytes', label: 'Sent', num: true, render: r => n0(r.bytes) + ' B' },
    { key: 'anonymized', label: 'Anon.', render: r => r.anonymized ? pill('yes', 'good') : el('span', 'muted', 'no') },
    { key: 'usage', label: 'Tokens', num: true, sortable: false,
      render: r => r.usage ? `${n0(r.usage.in || 0)} / ${n0(r.usage.out || 0)}` : '—' },
    { key: 'decision', label: 'Analyst', render: r => pill(r.decision,
        r.decision === 'accepted' ? 'good' : r.decision === 'rejected' ? 'bad' : r.decision === 'edited' ? 'good' : 'warn') },
    { key: 'summary', label: 'Request began', render: r => el('span', 'small muted', (r.summary || '').slice(0, 70) + '…') },
  ], rows, { sortKey: 'at', sortDir: -1 })));
  body.append(el('div', 'row', el('button', { class: 'btn ghost sm', onclick: () => {
    download(`crg-ai-log-${today()}.json`, JSON.stringify(rows, null, 1), 'application/json');
  } }, 'Export the log')));
}
