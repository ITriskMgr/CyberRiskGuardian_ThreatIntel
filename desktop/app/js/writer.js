/* writer.js — CyberRiskGuardian Security Policy Writer, the model (Writer 0.1.0 beta).

   The Writer writes; ISP management manages.
   • What the person enters for the Writer lives in the workspace, inside the ISP record (ws.isp.writer):
     interview answers with their source, facts proposed from documents (each with its quote), legal
     applicability decisions by a named reviewer, the selected documents and the decisions. The data
     version of the workspace does not change.
   • The engine (questionnaire, catalogue of 28 documents, bilingual clause library, composer, quality
     checks, Word writer and reader, OCR) runs in the local helper (serve.py → crg_writer/), standard
     library only, on 127.0.0.1. Nothing leaves the computer unless the person sends an AI request
     through the usual preview.
   • Generating a document creates or refreshes an ISP DRAFT: sections become clauses, normative clauses
     become statements with their modality and CRGO control identifiers. An approved or published version
     is never touched: ISP management freezes it, publishes it and records acknowledgements. A statement
     edited in ISP management (or re-imported from Word) is kept when the draft is regenerated.
   • Legal applicability comes from the CyberRiskGuardian Ontology (Compliance → Legal applicability);
     a clause that depends on a law is drafted only after a named reviewer records that it applies.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import { S, touch, docText } from './state.js';
import { today } from './util.js';
import * as P from './isp.js';
import * as LOG from './logs.js';
import { isFR } from './i18n.js';
import { GENERATOR, WRITER_NAME, WRITER_VERSION, CHANNEL } from './version.js';

export const WRITER = { name: WRITER_NAME, version: WRITER_VERSION, channel: CHANNEL };
export const WRITER_LABEL = `${WRITER.version} ${WRITER.channel}`;
export const STEPS = [['start', 'Start'], ['interview', 'Interview'], ['documents', 'Documents & facts'], ['legal', 'Legal applicability'],
  ['library', 'Library'], ['decisions', 'Decisions'], ['generate', 'Generate drafts'], ['word', 'Word export & re-import']];
const stamp = () => new Date().toISOString().slice(0, 19);

/* ---------------- the record in the workspace ---------------- */
export function W(ws = S.ws) {
  const I = P.isp(ws);
  I.writer ||= {};
  const w = I.writer;
  w.mode ||= 'express';
  w.languages ||= ['en'];
  for (const k of ['answers', 'applicability', 'families']) w[k] ||= {};
  for (const k of ['facts', 'flagged', 'issues', 'log']) w[k] ||= [];
  if (!('selection' in w)) w.selection = null;
  return w;
}
export const log = (ws, what, by = '', extra = {}) => { const w = W(ws); w.log.unshift({ at: stamp(), by, what, ...extra }); w.log = w.log.slice(0, 300); };

/* ---------------- the helper ---------------- */
export class Offline extends Error {}
export async function call(op, body = {}) {
  let r;
  try {
    r = await fetch('/api/writer/' + op, { method: 'POST', cache: 'no-store', headers: { 'Content-Type': 'application/json', 'X-CRG': '1' }, body: JSON.stringify(body) });
  } catch { throw new Offline('The local helper is not running — start CyberRiskGuardian with its launcher (start.command, start.sh or start.bat).'); }
  const j = await r.json().catch(() => ({}));
  if (r.status === 404 && !j.error_fr) throw new Offline('This helper does not include the Security Policy Writer. Start the application with the launcher of this version.');
  if (!r.ok) throw new Error((isFR() && j.error_fr) || j.error || r.statusText);
  return j;
}
let META = null;
export async function meta(force = false) {
  if (META && !force) return META;
  try {
    const r = await fetch('/api/writer/meta', { cache: 'no-store', headers: { 'X-CRG': '1' } });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
    META = await r.json();
  } catch (e) { META = { error: String(e.message || e) }; }
  return META;
}
const lang = () => (isFR() ? 'fr' : 'en');
/** The common part of every request: the answers, in the interface language. */
export const base = (ws = S.ws) => ({ answers: W(ws).answers, mode: W(ws).mode, lang: lang() });

/* ---------------- answers ---------------- */
/** Record an answer after the helper validated it. source: user | document | profile | default. */
export async function answer(ws, code, value, status = 'answered', { source = 'user', by = '', fact = null } = {}) {
  const v = await call('answer', { code, value, status });
  const w = W(ws);
  w.answers[code] = { value: v.value, status: v.status, source, by, at: stamp(), ...(fact ? { fact } : {}) };
  touch('isp');
  return w.answers[code];
}
export function clearAnswer(ws, code) { delete W(ws).answers[code]; touch('isp'); }
export const answered = (ws, code) => !!W(ws).answers[code]?.status;

/* ---------------- facts from documents and from the organization profile ---------------- */
/** Read the context documents and the organization profile; merge the proposals with what was decided before. */
export async function extractFacts(ws = S.ws) {
  const docs = [];
  for (const d of ws.docs || []) {
    const text = await docText(d.id);
    if (text && text.trim()) docs.push({ id: d.id, name: d.name, text, date: d.added || '', ocr: !!d.ocr });
  }
  const out = await call('facts', { docs, org: ws.org || {}, crown: ws.assessment?.CROWN || [], lang: lang() });
  const w = W(ws), prev = new Map(w.facts.map(f => [f.id, f]));
  w.facts = out.facts.map(f => {
    const old = prev.get(f.id);
    const cur = w.answers[f.fact_type];
    const same = cur?.status === 'answered' && JSON.stringify(cur.value) === JSON.stringify(f.value);
    return { ...f, state: old?.state && old.state !== 'proposed' ? old.state : same ? 'matches' : 'proposed', decidedBy: old?.decidedBy || '', decidedAt: old?.decidedAt || '' };
  });
  w.flagged = out.flagged;
  w.factsRun = { at: stamp(), docs: docs.length, facts: w.facts.length, flagged: out.flagged.length };
  touch('isp');
  return w.factsRun;
}
/** Confirm a proposed fact: it becomes the answer (lists are merged), with the fact as its source. */
export async function confirmFact(ws, f, by = '') {
  const w = W(ws);
  let value = f.value;
  const cur = w.answers[f.fact_type];
  if (Array.isArray(value) && cur?.status === 'answered' && Array.isArray(cur.value)) value = [...new Set([...cur.value, ...value])];
  await answer(ws, f.fact_type, value, 'answered', { source: f.extractor === 'profile' ? 'profile' : 'document', by, fact: f.id });
  f.state = 'confirmed'; f.decidedBy = by; f.decidedAt = stamp();
  if (f.conflict_group) for (const o of w.facts) if (o !== f && o.conflict_group === f.conflict_group && o.state === 'proposed') { o.state = 'rejected'; o.decidedBy = by; o.decidedAt = stamp(); o.why = 'other value confirmed'; }
  touch('isp');
}
export function rejectFact(ws, f, by = '') { f.state = 'rejected'; f.decidedBy = by; f.decidedAt = stamp(); touch('isp'); }

/* ---------------- legal applicability (CRGO + a named reviewer) ---------------- */
export function decideApplicability(ws, code, { status, reviewer, rationale, crgo = null }, by = '') {
  const w = W(ws);
  if (status === 'candidate') { delete w.applicability[code]; touch('isp'); return null; }
  if (!String(reviewer || '').trim() || !String(rationale || '').trim()) throw new Error('A reviewer name and a rationale are required.');
  w.applicability[code] = { status, reviewer: String(reviewer).trim(), rationale: String(rationale).trim(), at: stamp(), by,
    crgo: crgo ? { instrument: crgo.instrument, state: crgo.state || null, date: crgo.date || null, source: crgo.source || null, release: crgo.release || null } : null };
  log(ws, `Applicability of ${code}: ${status} (${String(reviewer).trim()})`, by);
  touch('isp');
  return w.applicability[code];
}
/** Add the values the interview implies to the CRGO applicability profile (never marks anything complete). */
export function applyProposal(ws, prop) {
  const P0 = ws.grc.profile;
  let n = 0;
  for (const k of ['orgTypes', 'establishedIn', 'offersServicesIn']) for (const x of prop[k] || []) if (!(P0[k] ||= []).includes(x.value)) { P0[k].push(x.value); n++; }
  for (const a of prop.activity || []) {
    const name = a.name[lang()] || a.name.en;
    P0.activities ||= [];
    if (!P0.activities.some(r => r.name === name)) { P0.activities.push({ id: 'PA-' + String(P0.activities.length + 1).padStart(3, '0'), name, dataCategories: a.dataCategories, dataSubjectsIn: a.dataSubjectsIn, transfersTo: [] }); n++; }
  }
  touch('grc');
  return n;
}

/* ---------------- decisions: accept every suggestion ---------------- */
/** Fill the unanswered decisions that carry a suggestion, as "default accepted by <by> on <date>".
    Decisions flagged for legal review and decisions without a suggestion stay open and are returned. */
export function acceptDefaults(ws, groups, { policy = null, by = '' } = {}) {
  const w = W(ws), done = [], open = [];
  for (const g of groups) {
    if (policy && g.policy !== policy) continue;
    for (const q of g.questions) {
      if (w.answers[q.code]?.status) continue;
      if (q.legal || q.suggested === null || q.suggested === undefined || q.suggested === '') { open.push({ ...q, group: g.policy, why: q.legal ? 'legal' : 'none' }); continue; }
      w.answers[q.code] = { value: q.type === 'multi' && !Array.isArray(q.suggested) ? [q.suggested] : q.suggested, status: 'answered', source: 'default', by, at: stamp(), how: 'default accepted' };
      done.push(q.code);
    }
  }
  if (done.length) log(ws, `Suggested defaults accepted (${done.length})${policy ? ' — ' + policy : ''}`, by, { codes: done });
  touch('isp');
  return { done, open };
}

/* ---------------- generation: Writer drafts → ISP drafts ---------------- */
const writerPolicies = (ws, code = null) => P.isp(ws).policies.filter(p => p.writer && (!code || p.writer.code === code));
export const policyFor = (ws, code, lg) => P.isp(ws).policies.find(p => p.writer?.code === code && p.writer?.lang === lg) || null;
export const isWriterPolicy = p => !!p?.writer?.code;

function family(ws, topicCode, title, by) {
  const w = W(ws), I = P.isp(ws);
  const id = w.families[topicCode];
  if (id && I.families.some(f => f.id === id)) return id;
  const f = P.newFamily({ name: title, description: 'Created by the Security Policy Writer', owner: '', writer: topicCode }, ws);
  w.families[topicCode] = f.id;
  log(ws, `Policy family ${f.id} created for ${topicCode}`, by);
  return f.id;
}

/** What the person can do with the ISP policy of a Writer document before generating. */
export function generationState(p) {
  if (!p) return { state: 'new', can: true };
  if (p.status === 'draft') return { state: 'draft', can: true };
  if (p.status === 'published' || p.status === 'retired') return { state: p.status, can: false, newVersion: true };
  return { state: p.status, can: false };
}

/**
 * Create or refresh the ISP draft of one Writer document in one language.
 * d: one item of the helper's compose answer ({code, lang, isp}). Returns a summary.
 */
export function applyDraft(ws, d, { by = '', newVersion = false, topic = null } = {}) {
  const I = P.isp(ws), x = d.isp;
  let p = policyFor(ws, d.code, d.lang);
  const res = { code: d.code, lang: d.lang, created: false, updated: 0, kept: 0, added: 0, removed: 0, skipped: '' };
  if (p && p.status !== 'draft') {
    if (newVersion && (p.status === 'published' || p.status === 'retired')) P.transition(p, 'draft', { by, note: 'Security Policy Writer — regenerated' });
    else { res.skipped = p.status; res.policy = p.id; return res; }
  }
  if (!p) {
    p = P.newPolicy({ title: x.title, type: x.type, domain: x.domain, owner: x.owner, approver: x.approver, purpose: x.purpose, scope: x.scope, reviewMonths: x.reviewMonths || 12,
      origin: 'writer:' + d.code, reference: x.reference, _by: by, _what: 'Drafted by the Security Policy Writer' }, ws);
    p.writer = { code: d.code, lang: d.lang, gen: { purpose: x.purpose, scope: x.scope, owner: x.owner, approver: x.approver, clauses: {}, stmts: {} }, clauseMap: {}, sources: {} };
    res.created = true;
  }
  const wr = p.writer;
  wr.gen ||= { clauses: {}, stmts: {} }; wr.clauseMap ||= {}; wr.sources ||= {};
  if (topic) p.family = family(ws, topic.code, topic.title, by);
  // fields: replaced only while they still hold what the Writer produced last time
  for (const [k, v] of [['purpose', x.purpose], ['scope', x.scope], ['owner', x.owner], ['approver', x.approver]]) {
    if (res.created) continue;
    if ((p[k] || '') === (wr.gen[k] || '')) { if ((p[k] || '') !== (v || '')) { p[k] = v; res.updated++; } } else res.kept++;
    wr.gen[k] = v;
  }
  if (res.created) { p.title = x.title; }
  else if (p.title === wr.genTitle) p.title = x.title;
  wr.genTitle = x.title;
  p.reference = x.reference;
  // clauses
  const seen = new Set();
  for (const c of x.clauses) {
    seen.add(c.wsec);
    let cl = p.clauses.find(y => y.id === wr.clauseMap[c.wsec]);
    if (!cl && wr.clauseMap[c.wsec]) { res.kept++; continue; }                     // a section a person removed stays removed
    if (!cl) { cl = P.addClause(p, { heading: c.heading, text: c.text }); wr.clauseMap[c.wsec] = cl.id; res.added++; }
    else if ((cl.text || '') === (wr.gen.clauses[c.wsec] ?? cl.text) && (cl.heading || '') === (wr.gen.headings?.[c.wsec] ?? cl.heading)) {
      if (cl.text !== c.text || cl.heading !== c.heading) { cl.text = c.text; cl.heading = c.heading; res.updated++; }
    } else res.kept++;
    wr.gen.clauses[c.wsec] = c.text; (wr.gen.headings ||= {})[c.wsec] = c.heading;
  }
  // statements, matched by the Writer clause id they came from
  const wids = new Set(x.statements.map(s => s.wid));
  for (const s of x.statements) {
    const clause = wr.clauseMap[s.wsec] || '';
    let st = p.statements.find(y => y.wid === s.wid);
    if (!st && s.wid in wr.gen.stmts) { res.kept++; (wr.removedByPerson ||= []).includes(s.wid) || wr.removedByPerson.push(s.wid); continue; }   // removed by a person: stays removed
    if (!st) {
      st = P.addStatement(p, { text: s.text, modality: s.modality, refs: s.refs, clause });
      st.wid = s.wid; res.added++;
    } else if (st.text === wr.gen.stmts[s.wid]) {
      if (st.text !== s.text || st.modality !== s.modality) { st.text = s.text; st.modality = s.modality; res.updated++; }
      st.refs = [...new Set([...s.refs, ...(st.refs || []).filter(r => !(wr.gen.refs?.[s.wid] || []).includes(r))])];
      st.clause = clause;
    } else { res.kept++; st.refs = [...new Set([...(st.refs || []), ...s.refs])]; }
    wr.gen.stmts[s.wid] = s.text; (wr.gen.refs ||= {})[s.wid] = s.refs;
    wr.sources[st.id] = { src: s.src, ids: s.ids, review: st.text === s.text ? s.review : 'edited', legal: s.legal, wid: s.wid };
  }
  // statements the Writer no longer produces: removed only if nobody changed them
  for (const st of [...p.statements]) {
    if (!st.wid || wids.has(st.wid)) continue;
    if (st.text === wr.gen.stmts[st.wid]) { p.statements.splice(p.statements.indexOf(st), 1); delete wr.sources[st.id]; delete wr.gen.stmts[st.wid]; res.removed++; }
    else res.kept++;
  }
  for (const [wsec, cid] of Object.entries(wr.clauseMap)) {
    if (seen.has(wsec)) continue;
    const cl = p.clauses.find(y => y.id === cid);
    if (cl && (cl.text || '') === (wr.gen.clauses[wsec] || '') && !p.statements.some(s => s.clause === cid)) { p.clauses.splice(p.clauses.indexOf(cl), 1); delete wr.clauseMap[wsec]; res.removed++; }
  }
  // the order of the Writer's sections
  const order = x.clauses.map(c => wr.clauseMap[c.wsec]);
  p.clauses.sort((a, b) => (order.indexOf(a.id) < 0 ? 999 : order.indexOf(a.id)) - (order.indexOf(b.id) < 0 ? 999 : order.indexOf(b.id)));
  Object.assign(wr, { reference: x.reference, level: x.level, levelLabel: x.level_label, template: x.template, parentCode: x.parent_code, parentRef: x.parent,
    parentTitle: x.parent_title, generatedAt: stamp(), generatedBy: by, library: x.meta.library_version, meta: x.meta, writer: WRITER_LABEL });
  if (!res.created) p.history.push({ date: today(), at: stamp(), version: p.version, status: p.status, by,
    what: `Regenerated by the Security Policy Writer — ${res.updated} updated, ${res.added} added, ${res.removed} removed, ${res.kept} kept as edited` });
  res.policy = p.id;
  touch('isp');
  return res;
}

/** Link the policies of one generation run: language twins and parent documents. */
export function linkRun(ws) {
  const ps = writerPolicies(ws);
  for (const p of ps) {
    const w = p.writer;
    w.twin = ps.find(o => o !== p && o.writer.code === w.code)?.id || '';
    w.parentId = w.parentCode ? (ps.find(o => o.writer.code === w.parentCode && o.writer.lang === w.lang)?.id || '') : '';
  }
}

/** Ask the helper to compose and hand the drafts over to ISP management. */
export async function generate(ws, { codes = null, by = '', newVersion = {}, topics = {} } = {}) {
  const w = W(ws);
  const refs = Object.fromEntries(writerPolicies(ws).filter(p => p.writer.lang === w.languages[0]).map(p => [p.writer.code, p.id]));
  const out = await call('compose', { ...base(ws), selection: w.selection || [], languages: w.languages, applicability: w.applicability,
    crgo: ws.grc?.applicability || null, codes, facts: w.facts, refs });
  const results = [];
  for (const d of out.documents) results.push(applyDraft(ws, d, { by, newVersion: !!newVersion[d.code], topic: topics[d.code] }));
  linkRun(ws);
  w.issues = out.issues;
  w.lastRun = { at: stamp(), by, library: out.library, results: results.map(r => ({ ...r })), inputs: out.inputs };
  log(ws, `Generated ${results.filter(r => !r.skipped).length} draft(s)` + (results.some(r => r.skipped) ? `, ${results.filter(r => r.skipped).length} skipped (not a draft)` : ''), by);
  LOG.data('policy drafts generated', results.map(r => r.policy).join(', '), 'Security Policy Writer ' + WRITER_LABEL, ws.name || '');
  touch('isp');
  return { results, issues: out.issues };
}

/** Drafts whose answers changed after they were generated (the inputs they used). */
export function stale(ws) {
  const w = W(ws), run = w.lastRun;
  if (!run) return [];
  return Object.entries(run.inputs || {}).filter(([, codes]) => codes.some(c => (w.answers[c]?.at || '') > run.at)).map(([code]) => code);
}

/* ---------------- Word ---------------- */
const b64 = buf => { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); };
export const fileToB64 = async f => b64(await f.arrayBuffer());
export const b64ToBlob = (s, type) => new Blob([Uint8Array.from(atob(s), c => c.charCodeAt(0))], { type });

/** The payload of the Word renderer for a policy (the working copy, or the content of a frozen version). */
export function docPayload(ws, p, { version = null } = {}) {
  const I = P.isp(ws);
  const v = version ? P.frozen(p, version) : null;
  const c = v ? v.content : null;
  const pol = c ? { ...p, ...c, id: p.id, status: v.state, version: v.version, history: p.history } : p;
  const frozen = v ? { version: v.version, hash: v.hash, state: v.state, effective: v.effective || '', nextReview: v.nextReview || '', approved: v.approval?.date || '' }
    : ['approved', 'published'].includes(p.status) ? (() => { const r = P.versionRec(p, p.version); return r ? { version: r.version, hash: r.hash, state: r.state, effective: r.effective || '', nextReview: r.nextReview || '', approved: r.approval?.date || '' } : null; })() : null;
  const parent = p.writer?.parentId ? I.policies.find(x => x.id === p.writer.parentId) : null;
  const lg = p.writer?.lang || (isFR() ? 'fr' : 'en');
  return {
    lang: lg, org: ws.org?.name || ws.name, ws: ws.id,
    policy: { id: p.id, reference: p.reference || p.writer?.reference || p.id, title: pol.title, type: pol.type, version: pol.version, status: pol.status, owner: p.owner, approver: p.approver,
      purpose: pol.purpose || '', scope: pol.scope || '', body: pol.body || '', clauses: pol.clauses || [], statements: pol.statements || [], history: p.history || [],
      reviewMonths: p.reviewMonths, effective: p.effective || '', nextReview: P.reviewDate(p) || '' },
    writer: p.writer ? { code: p.writer.code, template: p.writer.template, library_version: p.writer.library, sources: p.writer.sources,
      assumptions: p.writer.meta?.assumptions || [], gaps: (p.writer.meta?.gaps || []).map(g => ({ ...g, where: g.where })) } : null,
    family: P.familyName(p.family, ws), parent: parent ? `${parent.reference || parent.id} — ${parent.title}` : (p.writer?.parentRef ? `${p.writer.parentRef} — ${p.writer.parentTitle || ''}` : ''),
    frozen, generator: `${GENERATOR} · ${WRITER.name} ${WRITER_LABEL}`,
  };
}
export const docName = (p, lg, version) => `${(p.reference || p.writer?.reference || p.id).replace(/[^\w.-]+/g, '-')}_v${version || p.version}_${lg}.docx`;
export async function exportDocx(ws, p, opts = {}) {
  const pay = docPayload(ws, p, opts);
  const out = await call('docx', { doc: pay, name: docName(p, pay.lang, pay.policy.version) });
  return { name: out.name, blob: b64ToBlob(out.data, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), bytes: out.bytes };
}
export async function compareWord(ws, p, file) {
  return call('reimport', { data: await fileToB64(file), policy: docPayload(ws, p).policy, ws: ws.id });
}

/** Paragraph k (1-based, tables skipped) of a text field, replaced or removed. */
function editParagraph(text, k, value) {
  const lines = String(text || '').split('\n');
  let n = 0;
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim() || lines[i].trim().startsWith('|')) continue;
    if (++n === k) { if (value) lines[i] = value; else lines.splice(i, 1); break; }
  }
  return lines.join('\n');
}
/** Apply the accepted changes of a Word re-import to the working draft. Only a draft changes. */
export function applyWord(ws, p, changes, { by = '', file = '' } = {}) {
  if (p.status !== 'draft') throw new Error('Only a draft can take changes from Word. Send the version back to draft, or start a new version, first.');
  const acc = changes.filter(c => c.decision === 'accept');
  const field = key => key === 'purpose' || key === 'scope' || key === 'body' ? key : null;
  const text = k => field(k) ? p[k] || '' : p.clauses.find(c => c.id === k)?.text || '';
  const setText = (k, v) => { if (field(k)) p[k] = v; else { const c = p.clauses.find(x => x.id === k); if (c) c.text = v; } };
  // paragraph edits first, from the last paragraph up, so the numbers stay right
  for (const c of acc.filter(x => x.kind === 'text').sort((a, b) => b.index - a.index)) setText(c.section, editParagraph(text(c.section), c.index, c.new));
  for (const c of acc) {
    if (c.kind === 'modified') {
      const s = p.statements.find(x => x.id === c.statement); if (!s) continue;
      s.text = c.new;
      if (c.modality_to) Object.assign(s, P.normStatement({ ...s, modality: c.modality_to }, p), { id: s.id, wid: s.wid });
      if (p.writer) (p.writer.sources[s.id] ||= {}).review = 'edited';
    } else if (c.kind === 'deleted') {
      const i = p.statements.findIndex(x => x.id === c.statement); if (i >= 0) p.statements.splice(i, 1);
    } else if (c.kind === 'added_statement') {
      const clause = p.clauses.some(x => x.id === c.section) ? c.section : '';
      const s = P.addStatement(p, { text: c.new, modality: c.modality_to || 'must', clause });
      if (c.after) { const i = p.statements.findIndex(x => x.id === c.after); if (i >= 0) { p.statements.splice(p.statements.indexOf(s), 1); p.statements.splice(i + 1, 0, s); } }
      if (p.writer) p.writer.sources[s.id] = { src: 'user_added', review: 'edited' };
      c.created = s.id;
    } else if (c.kind === 'added_text') {
      const k = c.section || (p.clauses[0]?.id ?? 'body');
      setText(k, (text(k) ? text(k) + '\n' : '') + c.new);
    }
  }
  p.history.push({ date: today(), at: stamp(), version: p.version, status: p.status, by, what: `Edited in Word and re-imported${file ? ' (' + file + ')' : ''} — ${acc.length} change(s) accepted, ${changes.length - acc.length} rejected` });
  LOG.data('policy re-imported from Word', p.id + ' v' + p.version, `${acc.length} change(s) accepted`, ws.name || '');
  touch('isp');
  return acc.length;
}

/* ---------------- risk scenarios a document addresses (through CRGO control identifiers) ---------------- */
/** A control identifier of the library ("CSF2:PR.AA") matches a subcategory ("CSF2:PR.AA-05"). */
const hit = (refs, ctl) => refs.some(r => r === ctl || (/^CSF2:[A-Z]{2}\.[A-Z]{2}$/.test(r) && ctl.startsWith(r + '-')));
export function registerScenarios(ws, refs) {
  if (!refs?.length) return [];
  const ctlOf = s => [...(s.crgo?.controls || []), ...(ws.measures || []).filter(m => (m.scen || []).includes(s.id)).flatMap(m => m.ctl || [])];
  return ws.assessment.SCEN.filter(s => ctlOf(s).some(c => hit(refs, c))).map(s => s.id);
}
export function libraryScenarios(snapshot, refs) {
  if (!snapshot || !refs?.length) return 0;
  let n = 0;
  for (const s of snapshot.scenarios || []) {
    const c = s.controls || {};
    const ids = [...(c['iso27002-2022'] || []).map(x => 'ISO22:' + x.id), ...(c.csf2 || []).map(x => 'CSF2:' + x.id)];
    if (ids.some(x => hit(refs, x))) n++;
  }
  return n;
}
