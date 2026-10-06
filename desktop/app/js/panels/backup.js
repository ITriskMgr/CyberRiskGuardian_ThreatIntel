/* Backup & restore (1.5.1) — save everything this installation holds, put it back, or move it to
   another machine. The restore preview is what makes migration safe: it labels every workspace
   before anything is written, and a copy that has moved on here is never overwritten by default.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, kpi, pill, banner, toast, table, download, field, input, n0, today } from '../util.js';
import { S, loadAll, emit } from '../state.js';
import * as B from '../backup.js';
import * as K from '../catalog.js';

let inv = null, loaded = null, planned = null, checked = null, chosen = null;
const opts = { documents: true, snapshots: false, settings: true, frameworks: true };

export async function render(sec, arg) {
  sec.replaceChildren(el('h1', null, 'Backup & restore'));
  sec.append(el('p', 'lede', 'Everything lives in this browser on this machine. A backup is one file you ' +
    'can keep, move to another computer, or restore after a mishap. Nothing is sent anywhere.'));
  inv = await B.inventory();
  save(sec);
  restoreUI(sec);
}

/* ---------------- make a backup ---------------- */
function save(sec) {
  sec.append(el('h2', null, 'Make a backup'));
  sec.append(el('div', 'grid g4',
    kpi('Workspaces', n0(inv.workspaces), `${n0(inv.scenarios)} scenarios · ${n0(inv.recommendations)} recommendations`),
    kpi('Assessment data', B.human(inv.wsBytes), 'always included'),
    kpi('Documents', `${n0(inv.documents)}`, B.human(inv.docBytes) + ' of extracted text'),
    kpi('Threat snapshots', `${n0(inv.snapshots)}`, B.human(inv.snapBytes) + ' — large, and rebuildable')));

  const c = card();
  const box = (k, label, hint) => {
    const i = el('input', { type: 'checkbox', checked: opts[k], style: { width: 'auto' } });
    i.addEventListener('change', () => { opts[k] = i.checked; render(sec); });
    return el('label', { style: { display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '6px 0' } },
      i, el('span', null, el('b', null, label), el('div', 'small muted', hint)));
  };
  c.append(
    box('documents', 'Context documents', `The text extracted from uploaded documents — ${B.human(inv.docBytes)}. Without them a restored workspace keeps its document list but not their contents.`),
    box('snapshots', 'Threat-context snapshots', `${B.human(inv.snapBytes)}. Usually the largest part, and rebuildable from the public catalogues, so it is off by default.`),
    box('frameworks', 'Framework catalogues', `${inv.frameworks} loaded or imported pack(s), with the revision log.`),
    box('settings', 'Helper settings', 'Feed sources, folders and links. API keys are never included — the helper keeps those in its own file, outside the browser.'));

  const note = input({ placeholder: 'Note for this backup (optional) — e.g. “before the Q4 review”' });
  c.append(field('Note', note));

  const est = inv.wsBytes + (opts.documents ? inv.docBytes : 0) + (opts.snapshots ? inv.snapBytes : 0);
  c.append(el('div', 'row', { style: { marginTop: '10px', alignItems: 'center' } },
    el('span', 'small muted', { style: { flex: 1 } }, 'Estimated size: about ' + B.human(est)),
    el('button', { class: 'btn', onclick: async e => {
      const b = e.target; b.disabled = true; b.textContent = 'Building…';
      try {
        const obj = await B.build(Object.assign({ note: note.value }, opts));
        download(B.filename(), JSON.stringify(obj), 'application/json');
        toast(`Backup written — ${obj.contents.workspaces} workspace(s), ${B.human(new Blob([JSON.stringify(obj)]).size)}`);
      } catch (err) { sec.append(banner('bad', 'The backup could not be built', String(err.message || err))); }
      b.disabled = false; b.textContent = 'Download backup';
    } }, 'Download backup')));
  sec.append(c);
}

/* ---------------- restore ---------------- */
function restoreUI(sec) {
  sec.append(el('h2', null, 'Restore or migrate'));
  const c = card();
  c.append(el('p', 'note', 'Load a backup file to see exactly what restoring it would do. Nothing is written ' +
    'until you choose. To move this installation to another machine, copy the file there and restore it from ' +
    'this screen in the same version of the app.'));
  const file = el('input', { type: 'file', accept: '.json,application/json' });
  file.addEventListener('change', async () => {
    const f = file.files?.[0]; if (!f) return;
    planned = null; chosen = null; checked = null;
    try {
      loaded = JSON.parse(await f.text());
      const errs = B.validate(loaded);
      if (errs.length) { loaded = null; sec.append(banner('bad', 'The file was not accepted', errs.join(' '))); return; }
      checked = await B.verify(loaded);
      planned = await B.plan(loaded);
      chosen = new Set(planned.rows.filter(r => r.state !== 'newer-here').map(r => r.id));
      render(sec);
    } catch (e) { loaded = null; sec.append(banner('bad', 'The file could not be read', String(e.message || e))); }
  });
  c.append(file);
  sec.append(c);
  if (loaded && planned) sec.append(preview(sec));
}

function preview(sec) {
  const c = card();
  const n = loaded.contents || {};
  c.append(el('h2', null, 'What this file holds'));
  c.append(el('div', 'grid g4',
    kpi('Written', (loaded.created || '').slice(0, 16).replace('T', ' '), 'by version ' + (loaded.app || '?')),
    kpi('Workspaces', n0(n.workspaces ?? planned.rows.length), `${n0(n.scenarios || 0)} scenarios · ${n0(n.recommendations || 0)} recommendations`),
    kpi('Documents', n0(n.documents || 0), n.snapshots ? n0(n.snapshots) + ' snapshot(s) too' : 'no snapshots'),
    kpi('Integrity', checked?.ok === true ? 'verified' : checked?.ok === false ? 'FAILED' : 'unknown',
        checked?.note || '', checked?.ok === true ? 'good' : checked?.ok === false ? 'bad' : 'warn')));
  if (loaded.note) c.append(el('p', null, el('b', null, 'Note: '), loaded.note));
  if (checked?.ok === false) c.append(banner('bad', 'Checksum mismatch',
    'This file does not match its own checksum. It has been altered or truncated. Restoring it may put ' +
    'incomplete data into the application; use another copy if you have one.'));

  const risky = planned.rows.filter(r => r.state === 'newer-here');
  if (risky.length) c.append(banner('warn',
    `${risky.length} workspace${risky.length === 1 ? ' has' : 's have'} been modified here since this backup`,
    'They are unticked below. Restoring one would discard the work done since the backup was written — ' +
    'tick it only if that is what you intend.'));

  c.append(table([
    { key: 'sel', label: '', sortable: false, cls: 'cb', render: r => {
        const i = el('input', { type: 'checkbox', checked: chosen.has(r.id), 'aria-label': 'Restore ' + r.name });
        i.addEventListener('change', () => { i.checked ? chosen.add(r.id) : chosen.delete(r.id); render(sec); });
        return i; } },
    { key: 'name', label: 'Workspace', render: r => el('div', null, el('b', null, r.name),
        el('div', 'small muted', `${r.scenarios} scenario(s) · ${r.recommendations} recommendation(s)`)) },
    { key: 'state', label: 'If restored', render: r => pill(
        { new: 'added', identical: 'no change', 'older-here': 'brought forward', 'newer-here': 'would lose work' }[r.state],
        r.state === 'newer-here' ? 'bad' : r.state === 'new' || r.state === 'older-here' ? 'good' : '') },
    { key: 'note', label: 'Why', sortable: false, render: r => el('span', 'small', r.note) },
  ], planned.rows, { sortKey: 'name' }));

  if (planned.orphan.length) c.append(el('p', 'note',
    `${planned.orphan.length} workspace(s) here are not in this file: ` +
    planned.orphan.map(o => o.name).join(', ') + '. A merge leaves them alone; a full replacement deletes them.'));

  const mode = el('select', null,
    new Option('Merge — add and update the ticked workspaces, leave the rest alone', 'merge'),
    new Option('Replace everything — this installation ends up holding exactly what the file holds', 'replace'));
  c.append(field('How to restore', mode));

  c.append(el('div', 'row', { style: { marginTop: '12px' } },
    el('button', { class: 'btn', onclick: async e => {
      const ids = [...chosen];
      if (!ids.length && mode.value === 'merge') { toast('Nothing is ticked.', 'bad'); return; }
      const losing = planned.rows.filter(r => r.state === 'newer-here' && chosen.has(r.id));
      const deleting = mode.value === 'replace' ? planned.orphan.length : 0;
      const warn = [
        losing.length ? `${losing.length} workspace(s) modified here since the backup will be overwritten` : '',
        deleting ? `${deleting} workspace(s) not in the file will be deleted` : '',
      ].filter(Boolean);
      if (warn.length && !confirm(warn.join('.\n') + '.\n\nContinue?')) return;
      const b = e.target; b.disabled = true; b.textContent = 'Restoring…';
      try {
        const done = await B.restore(loaded, { ids, mode: mode.value, frameworks: true, settings: true });
        K.invalidate();
        await loadAll();
        loaded = planned = chosen = null;
        emit('workspace');
        toast(`Restored ${done.workspaces} workspace(s)` +
              (done.deleted ? `, deleted ${done.deleted}` : '') +
              (done.frameworks ? `, ${done.frameworks} framework pack(s)` : ''));
        render(sec);
      } catch (err) {
        sec.append(banner('bad', 'The restore failed part-way', String(err.message || err) +
          ' Some data may already have been written; check the workspace list before continuing.'));
        b.disabled = false; b.textContent = 'Restore';
      }
    } }, 'Restore'),
    el('button', { class: 'btn ghost', onclick: () => { loaded = planned = chosen = null; render(sec); } }, 'Cancel')));
  return c;
}
