/* Settings → Simulation data (Beta 1.6.x) — fictional SIEM and SOAR records for teaching.
   (a) bundled packs (data/simulation/index.json): description, objectives, storyline, exercises; import into
       the current workspace (SIEM, then SOAR, through the modules' own import functions) or download;
   (b) "Generate with AI": the educator chooses the options, sees the exact payload (aiui.request: same
       routing policy, consent and logging as every AI feature), and the answer is validated with
       simgen.validatePack before it can be downloaded or imported;
   (c) removal of the records marked as simulation.
   Every imported record is marked "simulation": true and "simPack": <pack id>. Nothing here changes a risk
   parameter, and no alert becomes an incident: incident confirmations stay with the students.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, banner, pill, kpi, table, select, field, toast, download, today, n0 } from '../util.js';
import { S, touch } from '../state.js';
import { tr, current as curLang } from '../i18n.js';
import * as LOG from '../logs.js';
import * as users from '../users.js';
import * as SIEM from '../siem.js';
import * as SOAR from '../soar.js';
import * as G from '../simgen.js';
import * as AI from '../ai.js';
import * as aiui from '../aiui.js';

const INDEX = 'data/simulation/index.json';
const SIEM_LISTS = ['sources', 'strategies', 'rules', 'tests', 'indicators', 'alerts', 'gaps', 'coverage', 'events'];
const SOAR_LISTS = ['playbooks', 'gates', 'cases', 'approvals', 'executions', 'simulations', 'lessons', 'impacts', 'communications', 'recoveries', 'measurements', 'artefacts'];
const ui = { packs: null, loadErr: '', report: null, gen: { days: 14, intensity: 'medium', focus: 'ransomware', alerts: 25, language: 'en' }, generated: null, opened: null };

/* ---------------- the AI task (same layer as every AI feature: ai.js prepare/send, aiui preview) ---------------- */
AI.TASKS.simulation_pack = {
  label: 'Simulation data for teaching',
  build(ws, opts = {}) { return G.buildPrompt(ws, { caseId: caseIdOf(ws), ...opts }); },
};
export const caseIdOf = ws => /medibec/i.test(ws?.name || ws?.org?.name || '') ? 'medibec' : String(ws?.org?.name || ws?.name || 'case');

/* ---------------- model: import, mark, remove ---------------- */
const ids = rows => new Set((rows || []).map(r => r?.id).filter(Boolean));
function snapshot(ws) {
  const R = SIEM.reg(ws), O = SOAR.reg(ws);
  return { siem: Object.fromEntries(SIEM_LISTS.map(k => [k, ids(R[k])])), soar: Object.fromEntries(SOAR_LISTS.map(k => [k, ids(O[k])])),
    incidents: ids(ws.csm?.incidents), submissions: ids(ws.cms?.submissions) };
}
/** Mark the records a pack added (SIEM: new ids only; SOAR: every id the pack carries, since its import replaces by id). */
function mark(ws, pack, before) {
  const R = SIEM.reg(ws), O = SOAR.reg(ws), tag = r => { r.simulation = true; r.simPack = pack.id; };
  let n = 0;
  for (const k of SIEM_LISTS) { const mine = ids(pack.siem?.[k]); for (const r of R[k]) if (mine.has(r.id) && !before.siem[k].has(r.id)) { tag(r); n++; } }
  for (const k of SOAR_LISTS) { const mine = ids(pack.soar?.[k]); for (const r of O[k]) if (mine.has(r.id)) { tag(r); n++; } }
  for (const r of ws.csm?.incidents || []) if (!before.incidents.has(r.id)) { tag(r); n++; }
  for (const r of ws.cms?.submissions || []) if (!before.submissions.has(r.id)) { tag(r); n++; }
  return n;
}
/**
 * Import a pack into a workspace: SIEM first (importText, envelope), then SOAR (importDoc), through the
 * modules' own importers, then mark what was added. Returns { siem, soar, marked } or { error }.
 */
export async function importPack(ws, pack, { by = users.name() || '', check = true } = {}) {
  if (check) { const v = G.validatePack(pack, ws); if (!v.ok) return { error: v.errors.join(' '), validation: v }; }
  const before = snapshot(ws), out = { pack: pack.id, siem: null, soar: null };
  if (pack.siem) {
    out.siem = await SIEM.importText(JSON.stringify(pack.siem), { fileName: `${pack.id}/siem.json (simulation)`, kind: 'envelope', ws, by });
  }
  if (pack.soar) {
    const text = JSON.stringify(pack.soar);
    out.soar = await SOAR.importDoc(ws, pack.soar);
    if (!out.soar.error) {
      SOAR.reg(ws).imports.push({ date: new Date().toISOString(), file: `${pack.id}/soar.json (simulation)`, sha256: await SOAR.sha256(text), format: SOAR.FORMAT, added: out.soar.added, replaced: out.soar.replaced, skipped: out.soar.skipped.length, simulation: true });
      LOG.data('SOAR import', `${pack.id}/soar.json`, `simulation pack; added ${JSON.stringify(out.soar.added)}; replaced ${JSON.stringify(out.soar.replaced)}; skipped ${out.soar.skipped.length}`, ws.name);
    }
  }
  out.marked = mark(ws, pack, before);
  LOG.data('simulation pack imported', pack.id, `${out.marked} fictional record(s) marked as simulation${by ? ' · ' + by : ''}`, ws.name);
  touch('siem');
  return out;
}
/** Records marked as simulation, per list. With related: also the records people created in class from them. */
export function simulationRecords(ws, { related = false } = {}) {
  const R = SIEM.reg(ws), O = SOAR.reg(ws), out = [];
  const simAlerts = new Set(R.alerts.filter(a => a.simulation).map(a => a.id));
  const simCases = new Set(O.cases.filter(c => c.simulation || (related && c.source?.kind === 'alert' && simAlerts.has(c.source.id))).map(c => c.id));
  const simInc = new Set((ws.csm?.incidents || []).filter(i => i.simulation || (related && simCases.has(i.case))).map(i => i.id));
  const take = (mod, k, rows, extra = () => false) => { const r = rows.filter(x => x?.simulation === true || (related && extra(x))); if (r.length) out.push({ mod, list: k, rows: r }); };
  for (const k of SIEM_LISTS) take('SIEM', k, R[k]);
  for (const k of SOAR_LISTS) take('SOAR', k, O[k], x => k === 'cases' ? simCases.has(x.id) : simCases.has(x.case) || simInc.has(x.incident));
  take('Incidents', 'incidents', ws.csm?.incidents || [], x => simCases.has(x.case));
  take('Compliance', 'submissions', ws.cms?.submissions || [], x => x.source?.kind === 'incident' && simInc.has(x.source.id));
  return out;
}
export function removeSimulation(ws, { related = false, by = users.name() || '' } = {}) {
  const found = simulationRecords(ws, { related });
  let n = 0;
  for (const g of found) {
    const rows = g.mod === 'SIEM' ? SIEM.reg(ws)[g.list] : g.mod === 'SOAR' ? SOAR.reg(ws)[g.list] : g.list === 'incidents' ? ws.csm.incidents : ws.cms.submissions;
    const drop = new Set(g.rows);
    for (let i = rows.length - 1; i >= 0; i--) if (drop.has(rows[i])) { rows.splice(i, 1); n++; }
  }
  LOG.data('simulation data removed', ws.name, `${n} record(s)${related ? ' including records created from them' : ''}${by ? ' · ' + by : ''}`, ws.name);
  touch('siem');
  return n;
}

/* ---------------- screen ---------------- */
const canWrite = ws => !(users.active() && ws.kind === 'organization' && !users.me()?.admin);
const kindLabel = k => ({ example: 'example case', classroom: 'classroom workspace', organization: 'organization workspace' }[k] || k || 'workspace');

async function loadPacks() {
  try {
    const idx = await (await fetch(INDEX, { cache: 'no-cache' })).json();
    ui.packs = [];
    for (const p of idx.packs || []) {
      try { ui.packs.push({ entry: p, pack: await G.loadBundled('data/simulation/' + p.path) }); } catch (e) { ui.packs.push({ entry: p, error: String(e.message || e) }); }
    }
  } catch (e) { ui.packs = []; ui.loadErr = String(e.message || e); }
}

export async function render(body, rerender) {
  const ws = S.ws;
  const redraw = rerender || (() => { body.replaceChildren(); render(body); });
  if (!ui.packs) { body.append(el('p', 'muted', 'Loading the bundled packs…')); await loadPacks(); body.replaceChildren(); }
  const writable = canWrite(ws);
  body.append(card(
    el('p', 'note', 'Simulation packs hold fictional SIEM and SOAR records — telemetry sources, detection rules and tests, alerts, indicators, playbooks, cases, approvals and recorded actions — written around a teaching case, with learning objectives and exercises. They are imported into the current workspace like any local SIEM or SOAR file, and every record is marked as simulation so it can be removed later. They never change a risk score or a scenario parameter, and no alert becomes an incident: confirming an incident is left to the students.'),
    el('div', 'grid g4', kpi('Current workspace', el('span', { 'data-noi18n': '' }, ws.name), tr(kindLabel(ws.kind))),
      kpi('Scenarios', n0((ws.assessment?.SCEN || []).length), 'in this workspace'), kpi('Crown jewels', n0((ws.assessment?.CROWN || []).length), 'in this workspace'),
      kpi('Simulation records', n0(simulationRecords(ws).reduce((t, g) => t + g.rows.length, 0)), 'marked in this workspace')),
    ws.kind === 'organization' ? banner('warn', 'This is an organization workspace', 'Simulation data is meant for an example case or a classroom workspace. Imported into an organization workspace, fictional alerts and cases would sit next to real ones — they stay marked as simulation, but prefer a copy of the teaching case.') : null,
    !writable ? banner('bad', 'Administrators only', 'In multi-user mode only an administrator can import simulation data into, or remove it from, an organization workspace.') : null));
  if (ui.report) body.append(reportCard(ui.report));
  bundled(body, ws, writable, redraw);
  generate(body, ws, writable, redraw);
  remove(body, ws, writable, redraw);
}

function reportCard(rep) {
  if (rep.error) return card(banner('bad', 'The pack was not imported', rep.error));
  const s = rep.siem?.counts || {}, o = rep.soar || {};
  const fmt = obj => Object.entries(obj || {}).map(([k, v]) => `${k} ${v}`).join(', ') || '—';
  return card(el('h2', { style: { marginTop: 0 } }, 'Last import'),
    banner(o.skipped?.length || rep.siem?.errors?.length ? 'warn' : 'good', tr('Pack {0} imported into this workspace').replace('{0}', rep.pack),
      el('div', { 'data-noi18n': '' }, el('div', null, 'SIEM: ' + fmt(s)), el('div', null, 'SOAR: ' + fmt(o.added) + (Object.keys(o.replaced || {}).length ? ' · replaced ' + fmt(o.replaced) : '')),
        el('div', null, `${rep.marked} record(s) marked as simulation`))),
    (o.skipped || []).length ? el('div', null, el('p', 'small muted', 'Records the SOAR import refused (a pack may include them on purpose, e.g. a self-approval attempt):'),
      table([{ key: 'list', label: 'List' }, { key: 'id', label: 'ID' }, { key: 'why', label: 'Why it was skipped', render: r => el('span', { 'data-noi18n': '' }, r.why) }], o.skipped, { class: 'compact' })) : null,
    (rep.siem?.errors || []).length ? el('ul', { 'data-noi18n': '' }, ...rep.siem.errors.map(e => el('li', null, e))) : null,
    el('p', 'small muted', 'Open SIEM → Alerts & triage, Coverage & gaps or Indicators & TLP, and SOAR → Cases, Actions or Simulations to work through the exercises.'));
}

function validationBox(v) {
  return el('div', null,
    v.ok ? banner(v.warnings.length ? 'warn' : 'good', v.warnings.length ? tr('Valid for this workspace, with {0} warning(s)').replace('{0}', v.warnings.length) : 'Valid for this workspace', '')
      : banner('bad', tr('{0} error(s): the pack cannot be imported into this workspace').replace('{0}', v.errors.length), ''),
    v.errors.length ? el('ul', { 'data-noi18n': '', class: 'small' }, ...v.errors.slice(0, 40).map(e => el('li', null, e))) : null,
    v.warnings.length ? el('details', null, el('summary', 'small', tr('Warnings ({0})').replace('{0}', v.warnings.length)), el('ul', { 'data-noi18n': '', class: 'small' }, ...v.warnings.slice(0, 60).map(e => el('li', null, e)))) : null);
}

async function doImport(ws, pack, redraw) {
  const v = G.validatePack(pack, ws);
  if (!v.ok) { ui.report = { error: v.errors.slice(0, 6).join(' ') }; redraw(); return; }
  const msg = tr('Import the fictional pack "{0}" into the workspace "{1}"? SIEM records are added, SOAR records with the same identifier are replaced. Every record is marked as simulation and can be removed later.').replace('{0}', pack.title).replace('{1}', ws.name)
    + (ws.kind === 'organization' ? '\n\n' + tr('Warning: this is an organization workspace, not an example or classroom case.') : '');
  if (!window.confirm(msg)) return;
  ui.report = await importPack(ws, pack, { check: false });
  toast(tr('Simulation pack imported'));
  redraw();
}
const packFile = pack => { const { ...p } = pack; return JSON.stringify(p, null, 1); };

function packView(ws, pack, writable, redraw, { source = 'bundled' } = {}) {
  const P = G.localised(pack, curLang());
  const v = G.validatePack(pack, ws);
  const c = v.counts;
  return el('div', null,
    el('div', 'row', { style: { alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, el('h3', { style: { margin: 0, flex: 1 }, 'data-noi18n': '' }, P.title),
      pill('fictional', 'warn'), pill(tr('case: {0}').replace('{0}', pack.case || '—'), ''), source === 'ai' ? pill('generated with AI — ' + AI.MARK, 'warn') : null),
    el('p', { 'data-noi18n': '' }, P.description || ''),
    el('p', 'small muted', `SIEM: ${n0(c.siem?.sources)} sources · ${n0(c.siem?.rules)} rules · ${n0(c.siem?.tests)} tests · ${n0(c.siem?.alerts)} alerts · ${n0(c.siem?.indicators)} indicators — SOAR: ${n0(c.soar?.playbooks)} playbooks · ${n0(c.soar?.cases)} cases · ${n0(c.soar?.approvals)} approvals · ${n0(c.soar?.executions)} actions`),
    pack.asOfHint ? el('p', 'small', { 'data-noi18n': '' }, pack.asOfHint) : null,
    el('details', null, el('summary', null, tr('Learning objectives ({0})').replace('{0}', (P.learningObjectives || []).length)), el('ul', { 'data-noi18n': '' }, ...(P.learningObjectives || []).map(x => el('li', null, x)))),
    el('details', null, el('summary', null, tr('Storyline ({0} days)').replace('{0}', (P.storyline || []).length)),
      table([{ key: 'date', label: 'Date', cls: 'mono' }, { key: 'title', label: 'Day', render: r => el('b', { 'data-noi18n': '' }, r.title || '') }, { key: 'text', label: 'What happens', render: r => el('span', { 'data-noi18n': '' }, r.text) },
        { key: 'alerts', label: 'Alerts', render: r => el('span', { class: 'mono small', 'data-noi18n': '' }, (r.alerts || []).join(' ')) }], P.storyline || [], { class: 'compact' })),
    el('details', null, el('summary', null, tr('Exercises for students ({0})').replace('{0}', (P.exercises || []).length)),
      table([{ key: 'id', label: 'ID', cls: 'mono' }, { key: 'question', label: 'Question', render: r => el('span', { 'data-noi18n': '' }, r.question) },
        { key: 'screen', label: 'Screen', render: r => r.route ? el('a', { href: r.route, 'data-noi18n': '' }, r.screen) : el('span', { 'data-noi18n': '' }, r.screen) },
        { key: 'expected', label: 'Expected finding (for the educator)', render: r => el('details', null, el('summary', 'small', 'Show'), el('span', { 'data-noi18n': '' }, r.expected)) }], P.exercises || [], { class: 'compact' })),
    validationBox(v),
    el('div', 'btnrow', { style: { marginTop: '8px' } },
      el('button', { class: 'btn', disabled: !writable || !v.ok, onclick: () => doImport(ws, pack, redraw) }, 'Import into this workspace'),
      el('button', { class: 'btn ghost', onclick: () => download(`crg-simulation-${pack.id}.json`, packFile(pack), 'application/json') }, 'Download the pack')));
}

function bundled(body, ws, writable, redraw) {
  const box = card(el('h2', { style: { marginTop: 0 } }, 'Bundled packs'),
    el('p', 'small muted', 'Packs shipped with the application in data/simulation. A pack refers to the scenario and crown-jewel identifiers of its teaching case: it validates only in a workspace of that case (for MediBec, the example workspace or a copy of it).'));
  if (ui.loadErr) box.append(banner('warn', 'The list of bundled packs could not be read', ui.loadErr));
  if (!ui.packs.length && !ui.loadErr) box.append(el('p', 'muted', 'No bundled pack.'));
  for (const p of ui.packs) box.append(el('hr'), p.error ? banner('bad', tr('Pack {0} could not be read').replace('{0}', p.entry.id), p.error) : packView(ws, p.pack, writable, redraw));
  body.append(box);
}

function generate(body, ws, writable, redraw) {
  const o = ui.gen;
  const days = select(G.LENGTH.map(([v, l]) => [String(v), l]), String(o.days)); days.addEventListener('change', () => { o.days = Number(days.value); });
  const inten = select(G.INTENSITY, o.intensity); inten.addEventListener('change', () => { o.intensity = inten.value; });
  const focus = select(G.FOCUS, o.focus); focus.addEventListener('change', () => { o.focus = focus.value; });
  const nAl = el('input', { type: 'number', min: 8, max: 40, step: 1, value: o.alerts, style: { width: '7em' } }); nAl.addEventListener('change', () => { o.alerts = Math.max(8, Math.min(40, Number(nAl.value) || 25)); });
  const lang = select([['en', 'English'], ['fr', 'French (Canada)']], o.language); lang.addEventListener('change', () => { o.language = lang.value; });
  const out = el('div');
  const file = el('input', { type: 'file', accept: '.json,application/json', 'aria-label': 'Pack file' });
  const showPack = (pack, source) => { ui.opened = { pack, source }; out.replaceChildren(el('hr'), packView(ws, pack, writable, redraw, { source })); };
  if (ui.opened) showPack(ui.opened.pack, ui.opened.source);
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Generate with AI'),
    el('p', 'note', 'For educators: an AI model writes a new fictional pack for the current workspace. The request carries only the organization profile, the risk scenarios (identifiers, names and ATT&CK techniques), the crown jewels and the information assets of this workspace — no documents, notes, figures or keys — plus the rules of the simulation-data guide and the format. You see the exact payload before anything is sent; the answer is validated before it can be downloaded or imported. ' + AI.MARK),
    el('div', 'grid g5', field('Case', el('span', { 'data-noi18n': '' }, ws.name)), field('Storyline length', days), field('Intensity', inten), field('Focus of the intrusion', focus), field('Number of alerts', nAl)),
    el('div', 'grid g4', field('Language of the texts', lang)),
    el('div', 'btnrow', el('button', { class: 'btn', onclick: async () => {
      const st = await aiui.status(ws, 'simulation_pack'); if (!st.ok) { toast(st.why, 'bad'); return; }
      const r = await aiui.request('simulation_pack', { ...o, today: today() }, { title: tr('Simulation data — what will be sent') });
      if (!r) return;
      let pack;
      try { pack = AI.parseJson(r.text); } catch (e) { AI.decide(r.entryId, 'rejected', 'unparseable'); out.replaceChildren(banner('bad', 'The answer is not a pack', String(e.message || e))); return; }
      if (pack && !pack.id) pack.id = `${G.FOCUS.find(f => f[0] === o.focus)?.[0] || 'sim'}-${today()}`;
      pack.generatedBy = { model: r.model, provider: r.provider, date: today(), note: AI.MARK };
      ui.generated = { pack, entryId: r.entryId };
      const v = G.validatePack(pack, ws);
      AI.decide(r.entryId, v.ok ? 'pending' : 'rejected', v.ok ? `pack ${pack.id}: valid, ${v.warnings.length} warning(s)` : `pack invalid: ${v.errors.length} error(s)`);
      showPack(pack, 'ai');
    } }, 'Prepare the request…'),
      el('span', 'small muted', 'or open a pack file:'), file,
      el('button', { class: 'btn ghost', onclick: async () => {
        const f = file.files[0]; if (!f) { toast(tr('Choose a file first.'), 'warn'); return; }
        try { showPack(JSON.parse(await f.text()), 'file'); } catch (e) { out.replaceChildren(banner('bad', 'The file is not valid JSON', String(e.message || e))); }
      } }, 'Open')),
    out));
}

function remove(body, ws, writable, redraw) {
  const found = simulationRecords(ws), withRel = simulationRecords(ws, { related: true });
  const total = found.reduce((t, g) => t + g.rows.length, 0), totalRel = withRel.reduce((t, g) => t + g.rows.length, 0);
  const rel = el('input', { type: 'checkbox', style: { width: 'auto' } });
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Remove simulation data from this workspace'),
    el('p', 'note', 'Removes only the records marked as simulation (imported from a pack). Records people created themselves stay — unless you tick the box below, which also removes the cases escalated from simulation alerts and the incidents, approvals and actions recorded on simulation cases.'),
    total ? table([{ key: 'mod', label: 'Module' }, { key: 'list', label: 'List' }, { key: 'n', label: 'Records', num: true }], found.map(g => ({ mod: g.mod, list: g.list, n: g.rows.length })), { class: 'compact' })
      : el('p', 'muted', 'No simulation record in this workspace.'),
    totalRel > total ? el('label', { style: { display: 'flex', gap: '8px', alignItems: 'center' } }, rel, el('span', null, tr('Also remove {0} record(s) created in class from simulation records').replace('{0}', totalRel - total))) : null,
    el('div', 'btnrow', el('button', { class: 'btn ghost danger', disabled: !writable || !total, onclick: () => {
      const related = rel.checked, n = related ? totalRel : total;
      if (!window.confirm(tr('Remove {0} simulation record(s) from "{1}"? This cannot be undone (a backup restores it).').replace('{0}', n).replace('{1}', ws.name))) return;
      const k = removeSimulation(ws, { related });
      ui.report = null; toast(tr('{0} simulation record(s) removed').replace('{0}', k)); redraw();
    } }, 'Remove simulation data'))));
}
