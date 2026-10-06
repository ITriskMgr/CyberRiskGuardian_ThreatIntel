/* Settings → Documents & files (1.5.4, proof of concept) — the administrator's view of every document
   added to every workspace on this computer (business cases, profiles, audit reports…): rename,
   recategorize, replace with a new version (the text is extracted again on this computer), open its
   text, delete, and clean up text no workspace refers to any more. In multi-user mode Settings is
   administrator-only. © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { el, card, pill, select, toast, table, banner, n0, today, kpi, go } from '../util.js';
import { S, touch, docText, setDocText, delDoc, select as selectWs } from '../state.js';
import * as store from '../store.js';
import { extractText } from '../extract.js';
import { DOC_CATS } from './org.js';
import * as users from '../users.js';
import { tr } from '../i18n.js';

const f = { ws: 'all', cat: 'all', q: '' };

async function workspaces() {
  const list = (await store.all('ws')).filter(Boolean);
  return list.map(w => (S.ws && w.id === S.ws.id ? S.ws : w));       // the open workspace: its live copy
}
async function persist(w) { if (S.ws && w.id === S.ws.id) touch(); else { w.modified = new Date().toISOString(); await store.put('ws', w.id, w); } }

export async function render(body, sec, rerender) {
  if (users.U.enabled && !users.me()?.admin) { body.append(banner('warn', 'Administrators only', 'Ask an administrator to manage documents.')); return; }
  const W = await workspaces();
  const rows = W.flatMap(w => (w.docs || []).map(d => ({ w, d })));
  const keys = (await store.keys('blob')).filter(k => String(k).startsWith('doc:'));
  const used = new Set(rows.map(r => 'doc:' + r.d.id));
  const orphans = keys.filter(k => !used.has(k));
  const cats = [...new Set(rows.map(r => r.d.category || 'Other'))].sort();
  body.append(el('div', 'grid g4',
    kpi('Documents', n0(rows.length), `${W.length} ${tr('workspace(s)')}`),
    kpi('Business cases', n0(rows.filter(r => r.d.category === 'Business case').length), 'category “Business case”'),
    kpi('Words of extracted text', n0(rows.reduce((t, r) => t + (r.d.words || 0), 0)), 'kept on this computer'),
    kpi('Unreferenced text', n0(orphans.length), 'left by deleted documents', orphans.length ? 'warn' : 'good')));

  const wsSel = select([['all', 'All workspaces'], ...W.map(w => [w.id, w.name])], f.ws, { 'data-noi18n': '' });
  wsSel.addEventListener('change', () => { f.ws = wsSel.value; draw(); });
  const catSel = select([['all', 'All categories'], ...cats.map(c => [c, c])], f.cat);
  catSel.addEventListener('change', () => { f.cat = catSel.value; draw(); });
  const q = el('input', { type: 'search', placeholder: 'Search — document or workspace name', value: f.q, style: { flex: '2 1 240px', width: 'auto' } });
  q.addEventListener('input', () => { f.q = q.value; draw(); });
  const box = el('div');
  const shown = () => rows.filter(r => (f.ws === 'all' || r.w.id === f.ws) && (f.cat === 'all' || (r.d.category || 'Other') === f.cat) && (!f.q || (r.d.name + ' ' + r.w.name).toLowerCase().includes(f.q.toLowerCase())));
  const picked = new Set();
  function draw() {
    const list = shown();
    box.replaceChildren(list.length ? el('div', 'tablewrap', { style: { maxHeight: '62vh', overflow: 'auto' } }, table([
      { key: 'pick', label: '', sortable: false, cls: 'cb', render: r => { const c = el('input', { type: 'checkbox', checked: picked.has(r.d.id) }); c.addEventListener('change', () => { c.checked ? picked.add(r.d.id) : picked.delete(r.d.id); }); return c; } },
      { key: 'name', label: 'Document', render: r => { const i = el('input', { value: r.d.name, 'data-noi18n': '', 'aria-label': 'Document name' }); i.addEventListener('change', async () => { r.d.name = i.value.trim() || r.d.name; await persist(r.w); users.audit('document renamed', r.d.name); toast(tr('Renamed')); }); return el('div', null, i, el('div', 'small muted', `${(r.d.type || '').toUpperCase()} · ${n0(r.d.words)} ${tr('words')} · ${tr('added')} ${r.d.added}${r.d.updated ? ' · ' + tr('replaced') + ' ' + r.d.updated : ''}${(r.d.versions || []).length ? ` · ${r.d.versions.length} ${tr('earlier version(s)')}` : ''}`)); } },
      { key: 'ws', label: 'Workspace', render: r => el('span', { 'data-noi18n': '' }, r.w.name), sort: r => r.w.name },
      { key: 'cat', label: 'Category', render: r => { const s = select(DOC_CATS, r.d.category || 'Other'); s.addEventListener('change', async () => { r.d.category = s.value; await persist(r.w); toast(tr('Category saved')); }); return s; }, sort: r => r.d.category },
      { key: 'q', label: 'Text', render: r => pill(r.d.quality === 'good' ? 'text extracted' : r.d.type === 'note' ? 'note' : r.d.quality === 'poor' ? 'poor extraction' : 'no text', r.d.quality === 'good' ? 'good' : 'warn') },
      { key: 'x', label: '', sortable: false, render: r => el('div', 'btnrow',
        replaceBtn(r, draw),
        el('button', { class: 'btn sm ghost', onclick: async () => { if (S.ws.id !== r.w.id) await selectWs(r.w.id); go('org/docs'); } }, 'Open text'),
        el('button', { class: 'btn sm ghost danger', onclick: async () => { if (!window.confirm(tr('Delete') + ' “' + r.d.name + '” — ' + r.w.name + '? ' + tr('Its extracted text is removed; values already accepted from it stay, with their source.'))) return; await removeDoc(r); toast(tr('Document deleted')); rerender(); } }, 'Delete')) },
    ], list, { class: 'compact' })) : el('div', 'empty-state', el('b', null, 'No document'), 'Documents are added under Organization → Context documents, or when a workspace is created.'));
  }
  draw();
  body.append(card(el('h2', { style: { marginTop: 0 } }, 'Documents of every workspace'),
    el('p', 'note', 'Business cases, profiles, inventories, audit reports, incident histories… Replace a document with a new version to update its text (it is read again on this computer; the previous text is kept as an earlier version). Deleting a document removes its text; values already accepted from it stay in the workspace with their source.'),
    el('div', 'row', { style: { gap: '8px', alignItems: 'center', flexWrap: 'wrap', margin: '8px 0' } }, q, wsSel, catSel),
    box,
    el('div', 'btnrow', { style: { marginTop: '8px' } }, el('button', { class: 'btn ghost danger', onclick: async () => {
      const t = rows.filter(r => picked.has(r.d.id)); if (!t.length) { toast(tr('Tick at least one document'), 'bad'); return; }
      if (!window.confirm(`${tr('Delete')} ${t.length} ${tr('document(s)')}?`)) return;
      for (const r of t) await removeDoc(r);
      toast(`${t.length} ${tr('document(s) deleted')}`); rerender();
    } }, 'Delete ticked'))));
  if (orphans.length) body.append(card(el('h2', { style: { marginTop: 0 } }, 'Unreferenced text'),
    el('p', 'note', `${orphans.length} ${tr('stored text(s) belong to no document of any workspace — usually left by an interrupted import or an older version.')}`),
    el('button', { class: 'btn ghost danger', onclick: async () => { for (const k of orphans) await store.del('blob', k); users.audit('unreferenced text removed', String(orphans.length)); toast(tr('Cleaned up')); rerender(); } }, 'Remove unreferenced text')));
}

async function removeDoc(r) {
  await delDoc(r.d.id);
  for (const v of r.d.versions || []) if (v.blob) await store.del('blob', v.blob);
  r.w.docs = (r.w.docs || []).filter(x => x !== r.d);
  await persist(r.w);
  users.audit('document deleted', `${r.d.name} (${r.w.name})`, S.ws?.id === r.w.id ? S.ws : null);
}

function replaceBtn(r, redraw) {
  const fileIn = el('input', { type: 'file', accept: '.docx,.xlsx,.xlsm,.pptx,.pdf,.txt,.md,.csv,.tsv,.json,.html,.htm', style: { display: 'none' } });
  fileIn.addEventListener('change', async () => {
    const file = fileIn.files[0]; if (!file) return;
    try {
      const x = await extractText(file);
      const old = await docText(r.d.id);
      const vkey = 'docv:' + r.d.id + ':' + Date.now();
      await store.put('blob', vkey, old);
      (r.d.versions ||= []).unshift({ at: new Date().toISOString(), name: r.d.name, words: r.d.words, blob: vkey });
      r.d.versions = r.d.versions.slice(0, 5);
      await setDocText(r.d.id, x.text);
      Object.assign(r.d, { name: file.name, size: file.size, type: x.method, chars: x.chars, words: x.words, quality: x.quality, excerpt: x.text.slice(0, 400), updated: today() });
      await persist(r.w);
      users.audit('document replaced', `${file.name} (${r.w.name})`);
      toast(`${tr('Replaced')} — ${n0(x.words)} ${tr('words')}`); redraw();
    } catch (e) { toast(tr('Could not read the file: ') + (e.message || e), 'bad'); }
    fileIn.value = '';
  });
  return el('span', null, fileIn, el('button', { class: 'btn sm ghost', onclick: () => fileIn.click() }, 'Replace…'));
}
