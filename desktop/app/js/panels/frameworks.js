/* frameworks.js (panel) — the frameworks and standards register (1.5.0).

   Two registers, because they are two different things:
     • Control catalogues — selectable controls, feeding Risk mitigation and the Statement of
       Applicability.
     • Methods and standards — management systems, risk processes, scoring schemes and
       quantification models. These are recorded and cited; CRG does not "implement" them, and each
       entry says where it stops.

   Importing an edition shows the diff and the impact before anything is written. A control that is
   renumbered rather than removed is reported as such, because applying a renumbering silently is
   how a Statement of Applicability quietly stops meaning what it says.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, kpi, pill, chip, table, banner, toast, download, field, input, select, parseCSV, n0 } from '../util.js';
import { S } from '../state.js';
import * as K from '../catalog.js';
import * as FW from '../frameworks.js';

let view = 'catalogues';
let pending = null;            // { pack, diff, impact, target }

export async function render(sec, arg) {
  await FW.load();
  sec.replaceChildren();
  sec.append(el('h1', null, 'Frameworks and standards'));
  sec.append(el('p', 'lede', 'What this assessment selects controls from, and which methods it follows. ',
    el('b', null, 'Mapping comes after selection, never before'), ': a framework is used for traceability, ' +
    'validation and assurance, and must not decide the treatment.'));

  const tabs = el('div', 'row', ...[['catalogues', 'Control catalogues'], ['methods', 'Methods and standards'], ['log', 'Revision log']]
    .map(([k, label]) => el('button', { class: 'btn ' + (view === k ? '' : 'ghost'), onclick: () => { view = k; render(sec, arg); } }, label)));
  sec.append(tabs);

  if (view === 'catalogues') catalogues(sec);
  else if (view === 'methods') methods(sec);
  else revisionLog(sec);
}

/* ---------------- control catalogues ---------------- */
function catalogues(sec) {
  const reg = FW.register(K.FRAMEWORKS.filter(f => !['ATTACK-M', 'CRG'].includes(f.id)), K.fwCount);
  const loaded = reg.filter(r => !r.shell);
  const declared = reg.filter(r => r.shell);

  sec.append(el('div', 'grid g4',
    kpi('Catalogues loaded', String(loaded.length), reg.length + ' in the register'),
    kpi('Controls available', n0(loaded.reduce((s, r) => s + r.count, 0)), 'selectable as mitigations'),
    kpi('Imported editions', String(Object.keys(FW.packs()).length), 'replacing or adding to the bundled set'),
    kpi('Awaiting import', String(declared.length), declared.length ? 'requirement list not loaded' : '—')));

  const cols = [
    { key: 'short', label: 'Catalogue', render: r => el('div', null,
        el('b', null, r.short || r.name),
        el('div', 'muted', { style: { fontSize: '11.5px' } }, r.name)) },
    { key: 'edition', label: 'Edition' },
    { key: 'date', label: 'Published', render: r => r.date || '—' },
    { key: 'count', label: 'Controls', num: true, render: r => r.count ? n0(r.count) : '—' },
    { key: 'origin', label: 'Origin', render: r => el('span', null,
        pill(r.shell ? 'not loaded' : r.replaced ? 'imported' : 'bundled', r.shell ? 'warn' : r.replaced ? 'good' : ''),
        ' ', el('span', 'muted', { style: { fontSize: '11.5px' } }, r.origin)) },
    { key: 'loaded', label: 'Loaded', render: r => r.loaded || '—' },
  ];
  sec.append(el('h2', null, 'Control catalogues'));
  sec.append(card(table(cols, reg, { sortKey: 'short', onRow: r => detail(sec, r) }),
    el('p', 'note', 'Select a row for the licence note, the structure and the import actions. ' +
      'An imported edition replaces the bundled controls for that catalogue outright — the two are never mixed.')));

  if (declared.length) {
    sec.append(el('h2', null, 'Declared but not loaded'));
    const c = card();
    c.append(el('p', 'note', 'These ship with the application, extracted from the publishers\u2019 own documents, ' +
      'and load on request rather than automatically \u2014 so the register always records where a catalogue ' +
      'came from and when it was loaded. Loading one makes its controls selectable in Risk mitigation and ' +
      'available for a Statement of Applicability.'));
    for (const r of declared) {
      c.append(el('div', { style: { padding: '10px 0', borderTop: '1px solid var(--line)' } },
        el('b', null, r.short), r.edition ? el('span', 'muted', ' · ' + r.edition) : null,
        r.date ? el('span', 'muted', ' · ' + r.date) : null,
        el('div', null, r.structure || ''),
        el('div', 'muted', { style: { fontSize: '12px', marginTop: '3px' } }, r.note || ''),
        r.url ? el('div', { style: { marginTop: '4px' } }, el('a', { href: r.url, target: '_blank', rel: 'noopener' }, 'Publisher')) : null,
        r.alias ? null : el('div', 'row', { style: { marginTop: '6px' } },
          r.bundled ? el('button', { class: 'btn sm', onclick: e => loadBundled(sec, r, e.target) }, 'Load ' + r.short) : null,
          el('button', { class: 'btn ghost sm', onclick: () => detail(sec, r) },
            r.bundled ? 'Review or import another edition…' : 'Import ' + r.short + '…'))));
    }
    sec.append(c);
  }
}

/* ---------------- one catalogue ---------------- */
function detail(sec, r) {
  const c = card();
  c.append(el('h2', null, r.name));
  const meta = FW.METHODS.find(m => m.catalogue === r.id);
  const rows = [
    ['Edition', r.edition || '—'], ['Published', r.date || '—'],
    ['Controls', r.count ? n0(r.count) : 'not loaded'],
    ['Origin', r.origin], ['Loaded', r.loaded || '—'],
  ];
  c.append(el('table', null, el('tbody', null, ...rows.map(([k, v]) =>
    el('tr', null, el('td', null, el('b', null, k)), el('td', null, v))))));
  if (r.structure) c.append(el('p', null, r.structure));
  if (r.note) c.append(el('p', 'note', r.note));
  if (meta) c.append(el('p', 'note', el('b', null, 'Licence. '), meta.licence));
  if (r.alias) c.append(banner('warn', 'This catalogue is an alias, not a copy',
    `Its identifiers are those of ${r.alias}, which is already loaded. Select that catalogue rather than importing a duplicate.`));

  if (r.bundled && r.shell) {
    c.append(el('div', 'row', { style: { margin: '10px 0' } },
      el('button', { class: 'btn', onclick: e => loadBundled(sec, r, e.target) }, 'Load the bundled pack')));
  }
  if (!r.alias) {
    c.append(el('h2', null, 'Import an edition'));
    c.append(importForm(sec, r));
  }
  if (r.replaced) c.append(el('div', 'row', { style: { marginTop: '10px' } },
    el('button', { class: 'btn ghost', onclick: async () => {
      await FW.remove(r.id); K.invalidate(); toast('Imported edition removed; the bundled list is active again.'); render(sec, null);
    } }, 'Remove the imported edition'),
    el('button', { class: 'btn ghost', onclick: () => exportPack(r) }, 'Export as a pack')));
  else if (r.count) c.append(el('div', 'row', { style: { marginTop: '10px' } },
    el('button', { class: 'btn ghost', onclick: () => exportPack(r) }, 'Export as a pack')));

  const back = el('button', { class: 'btn ghost', onclick: () => render(sec, null) }, '← All catalogues');
  sec.replaceChildren(el('h1', null, 'Frameworks and standards'), back, c);
  if (pending) sec.append(diffCard(sec));
}

/** Load a pack that ships with the app. It goes through the same review as an imported file. */
async function loadBundled(sec, r, btn) {
  if (btn) { btn.disabled = true; btn.textContent = 'Reading\u2026'; }
  try {
    const obj = await FW.fetchBundled(r.bundled);
    obj.framework = Object.assign({}, obj.framework, { id: r.id });
    const errs = FW.validate(obj);
    if (errs.length) throw new Error(errs.slice(0, 4).join(' '));
    const current = K.controls().filter(c => c.fw === r.id).map(c => ({ id: c.id, title: c.title }));
    const d = FW.diff(current, obj.controls);
    pending = { target: r, pack: obj, diff: d, impact: FW.impact(r.id, d, S.list || []) };
    detail(sec, r);
  } catch (e) {
    sec.append(banner('bad', 'The bundled pack could not be loaded', String(e.message || e)));
    if (btn) { btn.disabled = false; btn.textContent = 'Load ' + r.short; }
  }
}

function exportPack(r) {
  const controls = K.controls().filter(c => c.fw === r.id)
    .map(c => ({ id: c.id, title: c.title, grp: c.grp, fn: c.fn, tags: c.tags, note: c.note, enh: c.enh }));
  if (!controls.length) { toast('Nothing to export: this catalogue has no rows loaded.', 'bad'); return; }
  download(`crg-framework-${r.id}.json`, JSON.stringify({
    schema: FW.PACK_SCHEMA,
    framework: { id: r.id, name: r.name, short: r.short, edition: r.edition, date: r.date, origin: r.origin, note: r.note, url: r.url },
    controls,
  }, null, 1), 'application/json');
}

function importForm(sec, r) {
  const wrap = el('div');
  const file = el('input', { type: 'file', accept: '.json,.csv,.txt,application/json,text/csv' });
  const edition = input({ type: 'text', placeholder: 'e.g. Revision 3', value: r.edition || '' });
  const date = input({ type: 'date', value: r.date || '' });
  wrap.append(el('p', 'note', 'Accepts a CyberRiskGuardian framework pack, a NIST OSCAL catalogue, or a CSV with ' +
    'at least an ', el('span', 'mono', 'id'), ' column and a ', el('span', 'mono', 'title'), ' column ' +
    '(optionally group, function, tags, note, enhancement). Nothing is written until you have seen the differences.'));
  wrap.append(el('div', 'grid g3', field('Edition label', edition), field('Published', date)));
  wrap.append(el('div', { style: { marginTop: '8px' } }, file));

  file.addEventListener('change', async () => {
    const f = file.files?.[0]; if (!f) return;
    try {
      const text = await f.text();
      let obj;
      if (/\.csv$/i.test(f.name) || (!text.trimStart().startsWith('{') && text.includes(','))) {
        obj = FW.fromCSV(parseCSV(text), { id: r.id, name: r.name, short: r.short, url: r.url });
      } else {
        const json = JSON.parse(text);
        obj = json.catalog ? FW.fromOSCAL(json, { id: r.id, name: r.name, short: r.short, url: r.url })
                           : json;
      }
      obj.framework = Object.assign({}, obj.framework, { id: r.id });
      if (edition.value) obj.framework.edition = edition.value;
      if (date.value) obj.framework.date = date.value;
      const errs = FW.validate(obj);
      if (errs.length) { sec.append(banner('bad', 'The file was not accepted', errs.slice(0, 6).join(' '))); return; }
      const current = K.controls().filter(c => c.fw === r.id).map(c => ({ id: c.id, title: c.title }));
      pending = { target: r, pack: obj, diff: FW.diff(current, obj.controls),
                  impact: FW.impact(r.id, FW.diff(current, obj.controls), S.list || []) };
      detail(sec, r);
    } catch (e) {
      sec.append(banner('bad', 'The file could not be read', String(e.message || e)));
    }
  });
  return wrap;
}

function diffCard(sec) {
  const { pack, diff: d, impact: hits, target } = pending;
  const c = card();
  c.append(el('h2', null, 'Review before applying'));
  c.append(el('div', 'grid g4',
    kpi('Added', String(d.counts.added), 'new controls'),
    kpi('Removed', String(d.counts.removed), 'no longer in this edition'),
    kpi('Renumbered', String(d.counts.renumbered), 'same control, new identifier'),
    kpi('Retitled', String(d.counts.retitled), d.counts.unchanged + ' unchanged')));

  const list = (title, rows, render) => rows.length ? el('details', 'card',
    el('summary', null, `${title} (${rows.length})`),
    el('ul', null, ...rows.slice(0, 200).map(x => el('li', null, render(x)))),
    rows.length > 200 ? el('p', 'note', `…and ${rows.length - 200} more.`) : null) : null;

  c.append(list('Added', d.added, x => `${x.id} — ${x.title}`));
  c.append(list('Removed', d.removed, x => `${x.id} — ${x.title}`));
  c.append(list('Renumbered', d.renumbered, x => `${x.from} → ${x.to} — ${x.title}`));
  c.append(list('Retitled', d.retitled, x => `${x.id}: “${x.from}” → “${x.to}”`));

  if (hits.length) {
    c.append(banner('warn', `${hits.length} existing reference${hits.length === 1 ? '' : 's'} point at a control this edition moves or drops`,
      'Nothing is remapped automatically. Renumbered controls are listed with their new identifier so you can ' +
      'update the reference deliberately; removed ones need a decision.'));
    c.append(table([
      { key: 'ws', label: 'Workspace' }, { key: 'kind', label: 'Reference' },
      { key: 'ref', label: 'Item' }, { key: 'key', label: 'Control' },
      { key: 'moved', label: 'Becomes', render: x => x.moved ? x.moved.split(':')[1] : el('span', 'muted', 'removed') },
    ], hits, { sortKey: 'ws' }));
  } else {
    c.append(el('p', 'note', 'No measure or statement of applicability in any workspace points at a control this edition moves or drops.'));
  }

  c.append(el('div', 'row', { style: { marginTop: '12px' } },
    el('button', { class: 'btn', onclick: async () => {
      try {
        await FW.install(pack, { note: `${d.counts.added} added, ${d.counts.removed} removed, ${d.counts.renumbered} renumbered` });
        K.invalidate();
        toast(`${pack.framework.short || pack.framework.id}: ${n0(pack.controls.length)} controls loaded.`);
        pending = null; render(sec, null);
      } catch (e) { sec.append(banner('bad', 'The import failed', String(e.message || e))); }
    } }, `Apply — load ${n0(pack.controls.length)} controls`),
    el('button', { class: 'btn ghost', onclick: () => { pending = null; detail(sec, target); } }, 'Cancel')));
  return c;
}

/* ---------------- methods ---------------- */
function methods(sec) {
  sec.append(el('h2', null, 'Methods and standards followed'));
  sec.append(card(el('p', 'note',
    'These are not control lists. A management system, a risk process, a scoring scheme and a quantification ' +
    'model are recorded here so an assessment can cite what it followed — and so the boundary is explicit. ' +
    'CyberRiskGuardian claims conformity with none of them except its own model.')));

  for (const m of FW.METHODS) {
    const c = card();
    c.append(el('div', 'row', { style: { alignItems: 'baseline' } },
      el('h2', { style: { margin: '0', flex: '1 1 auto' } }, m.short),
      pill(m.kind, m.claims ? 'good' : ''),
      m.edition ? el('span', 'muted', m.edition + (m.date ? ' · ' + m.date : '')) : null));
    c.append(el('div', 'muted', { style: { fontSize: '12.5px', marginBottom: '6px' } }, m.name + ' · ' + m.body));
    c.append(el('p', null, m.role));
    c.append(el('p', null, el('b', null, 'In CyberRiskGuardian. '), m.crg));
    const foot = el('div', 'row', { style: { marginTop: '6px', fontSize: '12px' } });
    foot.append(el('span', 'muted', m.licence));
    if (m.catalogue) foot.append(chip('Catalogue: ' + m.catalogue, { href: '#/frameworks' }));
    if (m.url) foot.append(el('a', { href: m.url, target: '_blank', rel: 'noopener' }, 'Publisher'));
    if (m.verified) foot.append(pill('verified ' + m.verified.on, 'good'));
    c.append(foot);
    if (m.verified) c.append(el('p', 'note', 'Verified against the publisher: ' + m.verified.fact));
    sec.append(c);
  }
}

/* ---------------- revision log ---------------- */
function revisionLog(sec) {
  const rows = FW.log();
  sec.append(el('h2', null, 'Revision log'));
  if (!rows.length) { sec.append(card(el('p', 'empty', 'No framework has been imported, replaced or removed on this installation.'))); return; }
  sec.append(card(table([
    { key: 'at', label: 'When', render: r => new Date(r.at).toLocaleString() },
    { key: 'fw', label: 'Catalogue' },
    { key: 'action', label: 'Action', render: r => pill(r.action, r.action === 'removed' ? 'warn' : 'good') },
    { key: 'from', label: 'From', render: r => r.from || '—' },
    { key: 'to', label: 'To', render: r => r.to || '—' },
    { key: 'count', label: 'Controls', num: true, render: r => n0(r.count) },
    { key: 'note', label: 'Change' },
  ], rows, { sortKey: 'at', sortDir: -1 })));
}
