// Virtual consultant — retrieval: the chunker and BM25 index, the five sources and their citations, the
// per-question context (documents only as retrieved passages, 400 kB cap), the answer checks, and the
// optional embedding path against a mock LOCAL embedding endpoint (Ollama and OpenAI-compatible), with the
// vector index dropped when the model changes.
import { open, ok, done, EMBED_PORT, tmp } from './lib.mjs';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const EPORT = EMBED_PORT, ELOG = tmp('crg-mock-embed.log');
const mock = spawn('python3', [path.join(HERE, 'mock_embed.py'), String(EPORT), ELOG], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));

const { browser, page, errors } = await open('#/process');
await page.evaluate(async () => { const st = await import('/js/state.js'); const ex = st.S.list.find(w => w.kind === 'example'); await st.select(ex.id); });

/* ---------- chunker and index (pure) ---------- */
const u = await page.evaluate(async () => {
  const K = await import('/js/kbindex.js');
  const md = '# Chapter 9: Test\n\nIntro text about governance.\n\n## Risk appetite\n\nAppetite is set on a scale.\n\n### Tolerance\n\nTolerance bands 0.90 and 1.10.\n';
  const ch = K.chunk(md);
  const I = new K.Index([{ id: 'b', title: 'Alpha', text: 'phishing mail credential' }, { id: 'a', title: 'Alpha', text: 'phishing mail credential' }, { id: 'c', text: 'ransomware backup' }]);
  const s1 = I.search('phishing credentials', 3).map(h => h.doc.id), s2 = I.search('phishing credentials', 3).map(h => h.doc.id);
  return { paths: ch.map(c => c.path.join(' / ')), s1, s2, none: I.search('zzzz').length, toks: K.tokens('Les risques résiduels, T1566.002 and CVE-2024-1234') };
});
ok(u.paths[0] === 'Chapter 9: Test' && u.paths[2] === 'Chapter 9: Test / Risk appetite / Tolerance', 'chunks keep their heading path ' + JSON.stringify(u.paths));
ok(JSON.stringify(u.s1) === JSON.stringify(u.s2) && u.s1[0] === 'a' && u.s1[1] === 'b' && u.s1.length === 2, 'BM25 is deterministic, ties broken by id ' + u.s1);
ok(u.none === 0, 'no match, no passage');
ok(u.toks.includes('t1566.002') && u.toks.includes('cve-2024-1234') && !u.toks.includes('les'), 'identifiers survive tokenization, stop words go ' + u.toks);

/* ---------- the five sources and their citations ---------- */
const R = await page.evaluate(async () => {
  const C = await import('/js/consult.js');
  const q = 'How should risk appetite and tolerance be turned into decision criteria?';
  const a = await C.retrieve(q, { ctx: C.screenContext('#/register') });
  const b = await C.retrieve(q, { ctx: C.screenContext('#/register') });
  const book = await C.retrieve('risk appetite tolerance bands decision criteria', { sources: ['book'] });
  const crgo = await C.retrieve('ransomware encrypts electronic health record', { sources: ['crgo'] });
  const cat = await C.retrieve('T1566 phishing spearphishing attachment', { sources: ['catalogue'] });
  const sel = await C.retrieve('what would reduce this exposure?', { ctx: C.screenContext('#/scenario/S3') });
  return { a: a.passages.map(p => p.id), b: b.passages.map(p => p.id), per: a.passages.reduce((m, p) => (m[p.source] = (m[p.source] || 0) + 1, m), {}), n: a.passages.length,
    numbered: a.passages.every((p, i) => p.n === i + 1), book: book.passages.map(p => p.cite), bookCh: book.passages.map(p => p.id),
    crgo: crgo.passages.map(p => p.cite), cat: cat.passages.map(p => p.cite), sel: sel.passages[0]?.id, counts: await C.counts(), mode: a.mode };
});
ok(JSON.stringify(R.a) === JSON.stringify(R.b), 'the same question retrieves the same passages in the same order');
ok(R.n <= 8 && R.numbered && Object.values(R.per).every(v => v <= 3), 'at most 8 passages, at most 3 per source, numbered P1… ' + JSON.stringify(R.per));
ok(R.mode === 'lexical', 'lexical retrieval by default');
ok(R.book.length && R.book.every(c => /^Textbook v2\.51b, Chapter \d+ — .+/.test(c)), 'textbook cited "Chapter N — section" ' + R.book[0]);
ok(R.bookCh.some(id => id.startsWith('book:ch04.md')), 'the risk-appetite question finds chapter 4 ' + R.bookCh.join(','));
ok(R.crgo.length && R.crgo.every(c => /^CRGO \S+ \(release 0\.10\.1, (bundled snapshot|live server)\)$/.test(c)), 'ontology cited by identifier and release ' + R.crgo[0]);
ok(R.cat.some(c => /ATT&CK.*T1566/.test(c)), 'catalogues cited by identifier ' + R.cat[0]);
ok(R.sel === 'ws:scen:S3', 'the selected scenario is the first passage on its own screen');
ok(R.counts.book > 1000 && R.counts.crgo > 1000 && R.counts.catalogue > 1000 && R.counts.workspace > 10, 'every bundled source is indexed ' + JSON.stringify(R.counts));

/* ---------- documents reach the model only as retrieved passages; 400 kB cap ---------- */
const P = await page.evaluate(async () => {
  const st = await import('/js/state.js'); const store = await import('/js/store.js');
  const w = st.newWorkspace({ name: 'Consultant docs' });
  w.docs = [{ id: 'doc-c1', name: 'policy.txt', category: 'Policy' }];
  const filler = Array.from({ length: 3000 }, (_, i) => `Paragraph ${i} about routine facilities, parking and cafeteria menus.`).join('\n\n');
  await store.put('blob', 'doc:doc-c1', 'Our backup tapes are rotated weekly to the KESTREL vault in Laval.\n\n' + filler + '\n\nThe FALCONRIDGE contract ends in March.');
  await st.create(w);
  const AI = await import('/js/ai.js'); AI.settings(w).acknowledged = new Date().toISOString();
  const C = await import('/js/consult.js');
  const r = await C.retrieve('Where are the backup tapes rotated?', { ws: w, ctx: C.screenContext('#/org/docs') });
  const p = AI.prepare('consultant', w, { question: 'Where are the backup tapes rotated?', ctx: C.screenContext('#/org/docs'), passages: r.passages, history: [] });
  const out = { has: p.prompt.includes('KESTREL'), whole: p.prompt.includes('FALCONRIDGE'), bytes: p.bytes, cite: r.passages.find(x => x.source === 'workspace')?.cite, provider: p.provider,
    risk: /Portfolio \(engine\)/.test(p.prompt), org: /Organization: Consultant docs/.test(p.prompt), screen: /screen "Documents/.test(p.prompt) || /on the screen/.test(p.prompt) };
  await st.remove(w.id);
  return out;
});
ok(P.has && !P.whole, 'a document reaches the request only as the passage that matches');
ok(P.bytes < 400000, 'request under the 400 kB cap ' + P.bytes);
ok(/^Workspace document “policy\.txt”, passage \d+$/.test(P.cite || ''), 'workspace document cited by name and passage ' + P.cite);
ok(P.risk && P.org && P.screen, 'the request carries the organization summary, the risk picture and the screen');

/* ---------- reading an answer ---------- */
const A = await page.evaluate(async () => {
  const C = await import('/js/consult.js');
  const allowed = C.engineFigures();
  const ps = [{ n: 1 }, { n: 2 }];
  const r = C.parseAnswer('The book sets appetite on a 0–1 scale [P1].\n\nGENERAL: Boards review it yearly.\n\nThe portfolio residual risk is 41,023 and the estimated risk is 84,305 [P2].\n\nThe residual risk of S9 is 77,777 [P2] and the ratio 3.14.\n\nWrong marker [P9].\n\n```json\n{"scenarios":[{"name":"New one","statement":"x"}]}\n```', ps, allowed);
  return { kinds: r.parts.map(p => p.kind), texts: r.parts.map(p => p.text), removed: r.removed, props: r.proposals.scenarios.length, flags: r.parts.flatMap(p => p.flags) };
});
ok(A.kinds.join(',') === 'cited,general,cited,cited,general', 'paragraphs split into cited and general knowledge ' + A.kinds);
ok(A.texts[2].includes('41,023') && A.texts[2].includes('84,305'), 'figures the engine computed are kept');
ok(A.removed.includes('77,777') && A.removed.includes('3.14') && !A.texts[3].includes('77,777'), 'figures the engine did not compute are removed ' + A.removed);
ok(!A.texts[4].includes('[P9]') && A.flags.some(f => /P9/.test(f)), 'a marker for a passage never sent is removed and flagged');
ok(A.props === 1, 'proposals are read from the fenced block');

/* ---------- embeddings: local model only, vectors invalidated on model change ---------- */
const setEmbed = (e) => page.evaluate(async (e) => { const h = await import('/js/helper.js'); await h.loadConfig();
  h.HS.config.ai = { ...(h.HS.config.ai || {}), ollama_base: `http://127.0.0.1:${e.port}/v1`, lmstudio_base: `http://127.0.0.1:${e.port}/v1`, embed: { provider: e.provider, model: e.model } };
  await h.saveConfig(); await h.probe(true); }, { ...e, port: EPORT });
await setEmbed({ provider: 'ollama', model: 'mock-embed-a' });
const E = await page.evaluate(async () => {
  const C = await import('/js/consult.js'); const st = await import('/js/state.js'); const store = await import('/js/store.js');
  const ws = st.S.ws; const ready = C.embedReady();
  const lexOnly = C.retrievalMode(ws);
  ws.consultant.retrieval = 'hybrid';
  const n = await C.buildVectors('workspace', ws);
  const r = await C.retrieve('phishing of clinical administrator credentials', { ws });
  const r2 = await C.retrieve('phishing of clinical administrator credentials', { ws });
  const keys = (await store.keys('blob')).filter(k => String(k).startsWith('kbvec:'));
  return { ready, lexOnly, n, mode: r.mode, via: r.sources.workspace?.via, same: JSON.stringify(r.passages.map(p => p.id)) === JSON.stringify(r2.passages.map(p => p.id)), keys };
});
let log = fs.readFileSync(ELOG, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
ok(E.ready && E.lexOnly === 'lexical', 'hybrid is offered once a local model is configured; lexical until chosen');
ok(E.n > 10 && E.keys.length === 1, 'vectors built for the workspace source ' + E.n);
ok(E.mode === 'hybrid' && E.via === 'hybrid' && E.same, 'hybrid retrieval fuses lexical and vector rankings, deterministically');
ok(log.length && log.every(l => l.path === '/api/embeddings' && l.model === 'mock-embed-a'), 'Ollama is called on /api/embeddings with the configured model');
// OpenAI-compatible local endpoint, then a model change
await setEmbed({ provider: 'lmstudio', model: 'mock-embed-b' });
const E2 = await page.evaluate(async () => {
  const C = await import('/js/consult.js'); const st = await import('/js/state.js'); const store = await import('/js/store.js');
  const before = (await store.keys('blob')).filter(k => String(k).startsWith('kbvec:')).length;
  const status = await C.vectorStatus(st.S.ws);          // the stored set was built with another model: dropped
  const after = (await store.keys('blob')).filter(k => String(k).startsWith('kbvec:')).length;
  const r = await C.retrieve('phishing credentials', { ws: st.S.ws });
  const n = await C.buildVectors('workspace', st.S.ws);
  return { before, stale: status.workspace.stale, after, via: r.sources.workspace?.via, n };
});
log = fs.readFileSync(ELOG, 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
ok(E2.before === 1 && E2.stale && E2.after === 0, 'a change of embedding model invalidates the vector index');
ok(E2.via === 'lexical', 'without vectors for the current model, retrieval falls back to lexical');
ok(log.some(l => l.path === '/v1/embeddings' && l.model === 'mock-embed-b' && l.n > 1), 'a local OpenAI-compatible endpoint is called on /embeddings in batches');
// Settings → AI: saving a new model clears the index
await page.evaluate(() => { location.hash = '#/settings/ai'; }); await page.waitForTimeout(1500);
ok(await page.isVisible('#panel-settings >> text=Virtual consultant — retrieval'), 'Settings → AI shows the retrieval card');
await page.fill('#panel-settings input[aria-label="Embedding model"]', 'mock-embed-c');
await page.click('#panel-settings >> text=Save the embedding model'); await page.waitForTimeout(1200);
const left = await page.evaluate(async () => (await (await import('/js/store.js')).keys('blob')).filter(k => String(k).startsWith('kbvec:')).length);
ok(left === 0, 'saving another model in Settings clears the vector index');
// clean up: no embedding model, lexical
await page.evaluate(async () => { const h = await import('/js/helper.js'); h.HS.config.ai = { ...h.HS.config.ai, embed: { provider: '', model: '' } }; await h.saveConfig(); await h.probe(true);
  const st = await import('/js/state.js'); st.S.ws.consultant.retrieval = 'lexical'; st.touch(); });
ok(!errors.length, 'no console errors ' + errors.join(' | ').slice(0, 300));
await browser.close(); mock.kill(); done('t44 consultant retrieval');
