/* kbindex.js — the Virtual consultant's local retrieval: a chunker, a BM25 lexical index and the cosine
   ranking of the optional embedding path. Pure functions, no network, no randomness: the same text and the
   same question always return the same passages in the same order (ties are broken by passage id).

   Chunker. Markdown is cut at its headings; each section is packed into passages of about 1,100
   characters on paragraph boundaries (a very long paragraph is cut on sentence boundaries). A passage
   keeps the heading path it sits under, which is what a citation names ("Chapter 4 — Risk appetite…").

   Lexical index. Okapi BM25 (k1 = 1.2, b = 0.75) over word tokens: lower case, accents folded, English
   and French stop words removed, a light suffix stemmer so "risks", "risk" and "risque" meet. Headings
   count twice. One index per knowledge source, built once and kept in memory.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

/* English and French stop words, and words that only say "tell me" (one block, not interface text). */
const STOP = new Set(`
a an and are as at be by can could did do does for from had has have how i if in into is it its may me might my no not
of on or our shall should so such than that the their them then there these they this those to was we were what when
where which who why will with would you your
au aux avec ce ces cette comme dans de des du elle en est et il ils je la le les leur leurs mais ne nous on ou par pas
pour qu que qui quoi sa se ses son sur un une vos votre vous y
être été faire fait comment pourquoi quel quelle quels quelles
book books say says tell explain mean means describe please
livre dit dire explique
`.split(/\s+/).filter(Boolean));

export const fold = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
/** Light stemmer, English and French: enough to make plural and common derivations meet. */
export function stem(w) {
  if (w.length <= 4 || /\d/.test(w)) return w;
  return w.replace(/(ational|ations?|ements?|ments?|ities|ity|ings?|ives?|ies|ues?|es|s|ed|ly|eur|euse|aux)$/, '') || w;
}
/** The tokens a text is indexed and searched by. Identifiers (T1566, CVE-2024-1234, 5.15, E12) survive whole. */
export function tokens(s) {
  return fold(s).split(/[^a-z0-9.\-]+/).map(w => w.replace(/^[.\-]+|[.\-]+$/g, ''))
    .filter(w => w.length > 1 && !STOP.has(w)).map(stem);
}

/* ---------------- chunker ---------------- */

const TARGET = 1100, MAX = 1600;
function packParas(paras) {
  const out = []; let cur = '';
  const flush = () => { if (cur.trim()) out.push(cur.trim()); cur = ''; };
  for (let p of paras) {
    p = p.trim(); if (!p) continue;
    if (p.length > MAX) {                      // cut a very long paragraph on sentence boundaries
      flush();
      let piece = '';
      for (const s of p.split(/(?<=[.!?;:])\s+/)) {
        if ((piece + ' ' + s).length > TARGET && piece) { out.push(piece.trim()); piece = ''; }
        piece += (piece ? ' ' : '') + s;
      }
      if (piece.trim()) out.push(piece.trim());
      continue;
    }
    if ((cur + '\n\n' + p).length > TARGET && cur) flush();
    cur += (cur ? '\n\n' : '') + p;
  }
  flush();
  return out;
}
/**
 * Cut a text into passages. Markdown headings (#…######) start sections; plain text without headings is
 * packed by paragraphs. Returns [{ path: [h1, h2, …], text }].
 */
export function chunk(text) {
  const lines = String(text || '').replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '').split('\n');
  const out = [], path = [];
  let buf = [];
  const flush = () => {
    const paras = buf.join('\n').split(/\n\s*\n/);
    for (const t of packParas(paras)) out.push({ path: path.filter(Boolean).slice(), text: t });
    buf = [];
  };
  for (const ln of lines) {
    const m = /^(#{1,6})\s+(.+?)\s*(?:\{#[\w-]+\})?\s*$/.exec(ln);
    if (m) { flush(); const d = m[1].length; path.length = d - 1; path[d - 1] = m[2].replace(/[*_`]/g, '').trim(); continue; }
    buf.push(ln);
  }
  flush();
  return out;
}

/* ---------------- BM25 ---------------- */

export class Index {
  /** docs: [{ id, title?, text, ...anything kept with the passage }] */
  constructor(docs = []) {
    this.docs = []; this.df = new Map(); this.len = 0; this.N = 0;
    this.add(docs);
  }
  add(docs) {
    for (const d of docs) {
      const tt = tokens(d.title || ''), xt = tokens(d.text || '');
      const tf = new Map();
      for (const w of [...tt, ...tt, ...xt]) tf.set(w, (tf.get(w) || 0) + 1);
      const dl = tt.length * 2 + xt.length;
      for (const w of tf.keys()) this.df.set(w, (this.df.get(w) || 0) + 1);
      this.docs.push({ d, tf, dl });
      this.len += dl; this.N++;
    }
    this.avg = this.N ? this.len / this.N : 1;
    return this;
  }
  idf(w) { const n = this.df.get(w) || 0; return Math.log(1 + (this.N - n + 0.5) / (n + 0.5)); }
  /** The k best passages for a question: [{ doc, score, matched, of }] (matched = question terms found), best first, ties by id. */
  search(q, k = 5) {
    const qt = [...new Set(tokens(q))];
    if (!qt.length || !this.N) return [];
    const K1 = 1.2, B = 0.75, out = [];
    const idf = qt.map(w => [w, this.idf(w)]).filter(([w]) => this.df.has(w));
    if (!idf.length) return [];
    for (const x of this.docs) {
      let s = 0, hit = 0;
      for (const [w, i] of idf) {
        const f = x.tf.get(w); if (!f) continue;
        hit++;
        s += i * (f * (K1 + 1)) / (f + K1 * (1 - B + B * x.dl / this.avg));
      }
      if (hit) out.push({ doc: x.d, score: s, matched: hit, of: qt.length });
    }
    out.sort((a, b) => b.score - a.score || String(a.doc.id).localeCompare(String(b.doc.id)));
    return out.slice(0, k);
  }
  get size() { return this.N; }
}

/* ---------------- vectors (optional local-embedding path) ---------------- */

export function cosine(a, b) {
  let d = 0, na = 0, nb = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? d / Math.sqrt(na * nb) : 0;
}
/** Rank stored vectors against a question vector: [{ id, score }], best first, ties by id. */
export function nearest(qv, vectors, k = 5) {
  const out = [];
  for (const [id, v] of Object.entries(vectors || {})) out.push({ id, score: cosine(qv, v) });
  out.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  return out.slice(0, k);
}
/** Reciprocal-rank fusion of several ranked id lists (k = 60). Deterministic. */
export function fuse(lists, k = 60) {
  const sc = new Map();
  for (const l of lists) l.forEach((id, i) => sc.set(id, (sc.get(id) || 0) + 1 / (k + i + 1)));
  return [...sc.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([id, s]) => ({ id, score: s }));
}
