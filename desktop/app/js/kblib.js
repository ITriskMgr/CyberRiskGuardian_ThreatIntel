/* kblib.js — the knowledge base library: texts the person adds for the Virtual consultant (Settings →
   Knowledge base). Installation level: indexed once, available in every workspace, never part of one.

   The rules, each enforced here rather than on the screen:
     • A file is added only with the attestation "I hold a licence for this text; it stays on this
       computer." The attestation (its wording, the date and who was signed in) is kept with the file.
     • Text is extracted on this computer with the same reader as the context documents (extract.js:
       PDF, Word, Markdown, plain text…). Nothing is uploaded.
     • The text and its passages live in IndexedDB under "kblib:" keys; the list lives in meta
       "kbLibrary". Backups skip both (backup.js), restores refuse them, and neither registry packages nor
       exports read them — the library is never in a shareable file.
     • Answers quote it briefly: a passage shown or saved from the library is cut to QUOTE_MAX characters.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import { extractText } from './extract.js';
import { chunk } from './kbindex.js';
import { uid, today } from './util.js';

export const ATTESTATION = 'I hold a licence for this text; it stays on this computer.';
export const PREFIX = 'kblib:';                 // blob keys: kblib:<id> (text), kblib:<id>:chunks (passages)
export const META = 'kbLibrary';
export const QUOTE_MAX = 240;                   // characters of a library passage shown or saved with an answer
export const ACCEPT = ['.pdf', '.docx', '.md', '.markdown', '.txt', '.text', '.html', '.htm'].join(',');
export const TAGS = [['standard', 'Standard'], ['regulation', 'Law or regulation'], ['guidance', 'Guidance'], ['book', 'Book or article'], ['internal', 'Internal document'], ['other', 'Other']];

let cache = null;
export async function load() {
  const m = await store.get('meta', META).catch(() => null);
  cache = Array.isArray(m?.files) ? m.files : [];
  return cache;
}
/** The library as last loaded (synchronous, for screens and checks that cannot wait). */
export const list = () => cache || [];
async function save() { await store.put('meta', META, { schema: 'crg-kb-library/1', files: cache }); emit(); }

const subs = new Set();
export const onChange = f => { subs.add(f); return () => subs.delete(f); };
function emit() { for (const f of subs) { try { f(); } catch (e) { console.error(e); } } }

/** Licensed-standard signals in a name or a text: what the Quality review asks the person to confirm. */
export const LICENSED = /\b(ISO\s*\/\s*IEC|ISO[\s_-]*\d{4,5}|IEC[\s_-]*\d{4,5}|ISACA|COBIT|IIA|AICPA|COSO|SOC[\s_-]?2|PCI[\s_-]?DSS|CIS[\s_-]Controls?)\b/i;

/**
 * Add one file. attest must be true (the person ticked the attestation for this file); by is the
 * signed-in user, if any. Returns the library entry.
 */
export async function add(file, { attest = false, tag = 'other', by = '' } = {}) {
  if (attest !== true) throw new Error('A file is added to the library only with the attestation: ' + ATTESTATION);
  if (!cache) await load();
  const ex = await extractText(file);
  const text = String(ex?.text ?? ex ?? '');
  if (!text.trim()) throw new Error('No text could be read from ' + file.name + '.');
  const id = uid('kb');
  const passages = chunk(text).map((c, i) => ({ id: `${id}#${i + 1}`, n: i + 1, path: c.path, text: c.text }));
  await store.put('blob', PREFIX + id, text);
  await store.put('blob', PREFIX + id + ':chunks', passages);
  const entry = { id, name: file.name, type: (file.name.split('.').pop() || '').toLowerCase(), bytes: file.size || text.length,
    words: text.split(/\s+/).filter(Boolean).length, quality: ex?.quality || '', passages: passages.length, tag: TAGS.some(t => t[0] === tag) ? tag : 'other',
    added: today(), attestation: { text: ATTESTATION, at: new Date().toISOString(), by: by || '' },
    licensedSignal: LICENSED.test(file.name + ' ' + text.slice(0, 4000)) };
  cache.push(entry);
  await save();
  return entry;
}
export async function remove(id) {
  if (!cache) await load();
  await store.del('blob', PREFIX + id); await store.del('blob', PREFIX + id + ':chunks');
  cache = cache.filter(f => f.id !== id);
  await save();
}
export async function setTag(id, tag) {
  const f = list().find(x => x.id === id); if (!f) return;
  f.tag = tag; await save();
}
/** Every passage of every library file, tagged with its source: [{ id, file, name, tag, path, text }]. */
export async function passages() {
  if (!cache) await load();
  const out = [];
  for (const f of cache) {
    const ps = (await store.get('blob', PREFIX + f.id + ':chunks').catch(() => null)) || [];
    for (const p of ps) out.push({ ...p, file: f.id, name: f.name, tag: f.tag });
  }
  return out;
}
/** A library passage as it may be shown or saved: short. */
export const quote = t => { const s = String(t || '').replace(/\s+/g, ' ').trim(); return s.length > QUOTE_MAX ? s.slice(0, QUOTE_MAX - 1).replace(/\s+\S*$/, '') + ' …' : s; };
/** True for a blob key that belongs to the library (never in a backup). */
export const isLibraryKey = k => String(k).startsWith(PREFIX);
