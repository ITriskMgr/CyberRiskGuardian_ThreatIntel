/* Settings → Knowledge base — what the Virtual consultant knows, and the library of texts the person adds.

   The library belongs to this installation, not to a workspace: a file is extracted on this computer
   (the same reader as the context documents), indexed once, and available in every workspace, tagged by
   source. Adding a file requires the attestation "I hold a licence for this text; it stays on this
   computer." Library texts are never in a backup, a registry package or an export, and answers quote
   them briefly. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, select, toast, banner, table, field, kpi, n0 } from '../util.js';
import * as LIB from '../kblib.js';
import * as CONS from '../consult.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

export async function render(body, sec, rerender) {
  await LIB.load();
  const files = LIB.list();
  const counts = await CONS.counts().catch(() => ({}));

  body.append(card(el('h2', { style: { marginTop: 0 } }, 'What the Virtual consultant knows'),
    el('p', null, 'Five sources, each indexed on this computer and cited its own way. Retrieval is local; only the passages that match a question go into the request, which you see before it is sent.'),
    table([
      { key: 'label', label: 'Source', render: s => el('div', null, el('b', null, s.label), el('div', 'small muted', s.what)) },
      { key: 'cite', label: 'Cited as', sortable: false, render: s => el('span', 'small', {
        workspace: 'Workspace document “name”, passage n · Workspace — scenario S3',
        library: 'Library — file, section, passage n (short quotes only)',
        book: 'Textbook v2.51b, Chapter N — section',
        crgo: 'CRGO identifier (release, live server or bundled snapshot)',
        catalogue: 'Catalogue identifier and title (ATT&CK, CWE, controls), user guide section, policy template' }[s.id]) },
      { key: 'n', label: 'Passages', num: true, render: s => n0(counts[s.id] || 0) },
    ], CONS.SOURCES, { sortable: false, class: 'compact' })));

  /* --- the library --- */
  const attest = el('input', { type: 'checkbox', style: { width: 'auto' } });
  const tag = select(LIB.TAGS, 'standard');
  const file = el('input', { type: 'file', accept: LIB.ACCEPT, multiple: true, 'aria-label': 'Files to add to the library' });
  const addBtn = el('button', { class: 'btn', disabled: true }, 'Add to the library');
  const msg = el('div');
  const sync = () => { addBtn.disabled = !(attest.checked && file.files.length); };
  attest.addEventListener('change', sync); file.addEventListener('change', sync);
  addBtn.addEventListener('click', async () => {
    if (!attest.checked) { msg.replaceChildren(banner('bad', 'Attestation required', LIB.ATTESTATION)); return; }
    addBtn.disabled = true; addBtn.textContent = tr('Reading…');
    let n = 0;
    for (const f of file.files) {
      try { await LIB.add(f, { attest: true, tag: tag.value, by: users.me?.()?.name || '' }); n++; }
      catch (e) { msg.append(banner('bad', f.name, String(e.message || e))); }
    }
    CONS.forget('library');
    if (n) toast(tr('{0} file(s) added to the library').replace('{0}', n));
    rerender();
  });
  const signals = files.filter(f => f.licensedSignal).length;
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Library — your own texts'),
    el('p', null, 'PDF, Word, Markdown or text files you hold a licence for — a standard, a regulation, guidance, internal documents. The text is read on this computer, indexed once and available in every workspace. It never leaves this computer: backups, registry packages and exports leave it out, and the consultant quotes it in short excerpts only.'),
    el('div', 'grid g4', { style: { marginTop: '8px' } },
      kpi('Files', String(files.length), 'in the library'),
      kpi('Passages', n0(files.reduce((t, f) => t + (f.passages || 0), 0)), 'indexed'),
      kpi('Look like licensed standards', String(signals), 'checked in the Quality review', signals ? 'warn' : 'good')),
    el('label', { class: 'kb-attest', style: { display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--ink)', margin: '12px 0 8px' } }, attest,
      el('span', null, el('b', null, LIB.ATTESTATION), el('div', 'small muted', 'Required for every file. The wording, the date and the person signed in are kept with the file.'))),
    el('div', 'grid g2', field('Source tag', tag), field('Files', file, 'PDF, Word (.docx), Markdown, text or HTML.')),
    el('div', 'btnrow', addBtn), msg));

  if (files.length) body.append(card(table([
    { key: 'name', label: 'File', render: f => el('div', null, el('b', { 'data-noi18n': '' }, f.name), el('div', 'small muted', `${n0(f.words)} ${tr('words')} · ${f.type}`)) },
    { key: 'tag', label: 'Tag', render: f => { const s = select(LIB.TAGS, f.tag); s.addEventListener('change', async () => { await LIB.setTag(f.id, s.value); CONS.forget('library'); toast(tr('Tag saved')); }); return s; } },
    { key: 'passages', label: 'Passages', num: true },
    { key: 'added', label: 'Added' },
    { key: 'att', label: 'Attestation', sortable: false, render: f => el('span', 'small', pill('attested', 'good'), ' ', (f.attestation?.at || '').slice(0, 10), f.attestation?.by ? ' · ' + f.attestation.by : '') },
    { key: 'sig', label: 'Licensed standard?', sortable: false, render: f => f.licensedSignal ? pill('looks like one — quotes stay short', 'warn') : el('span', 'muted', '—') },
    { key: 'x', label: '', sortable: false, render: f => el('button', { class: 'btn sm ghost danger', onclick: async () => {
      if (!window.confirm(tr('Remove {0} from the library? Its text and passages are deleted from this computer.').replace('{0}', f.name))) return;
      await LIB.remove(f.id); CONS.forget('library'); toast(tr('Removed from the library')); rerender();
    } }, 'Remove') },
  ], files, { sortKey: 'added', sortDir: -1 })));
}
