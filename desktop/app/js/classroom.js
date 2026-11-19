/* classroom.js — the student side of the Classroom (BL-25/26; docs/spec-classroom-exercises.md), the model.

   Packs arrive as files signed by the instructor (.crgpack). The helper verifies the signature and pins each course to
   the key of its first pack (crg_classroom.py); this module keeps the accepted packs, the quiz attempts and the link
   between a pack and the classroom workspace a student works in. Packs are a property of the installation, not of a
   workspace, so they live in the `meta` store, like imported framework packs.

   Instructor control travels in the pack and is enforced here:
     • AI: off unless the pack lists the feature (allowedAI); every accepted AI proposal stays in the workspace's AI log
       and goes into the submission;
     • ontology proposals: allowed or not per pack (proposalsAllowed);
     • quiz answers: revealed immediately, after submission, or never;
     • due date: shown, and a late submission is marked late, never refused.
   Classroom work is teaching material: the cases are fictional, and an exercise's alerts are exercise material.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as store from './store.js';
import * as helper from './helper.js';
import { S } from './state.js';

const KEY = 'classroom';
let REC = null;

export async function load() {
  if (REC) return REC;
  const r = (await store.get('meta', KEY)) || {};
  REC = { packs: Array.isArray(r.packs) ? r.packs : [], attempts: Array.isArray(r.attempts) ? r.attempts : [],
    runs: r.runs && typeof r.runs === 'object' ? r.runs : {} };
  return REC;
}
async function save() { await store.put('meta', KEY, REC); }
export function reset() { REC = null; }
export const packs = () => REC?.packs || [];
export const attempts = () => REC?.attempts || [];
/** An exercise team's run for a pack (exercise.js blankRun), kept on this computer until submitted. */
export const run = id => REC?.runs?.[id] || null;
export async function saveRun(id, r) { await load(); REC.runs[id] = r; await save(); }

/** A stable id for a pack: course, kind, title and issue date. */
export const packId = b => [b.course.id, b.kind, b.title, b.issued || ''].join(' · ');
export const byId = id => packs().find(p => p.id === id) || null;

/* ---------------- import ---------------- */
/** Ask the helper to check a pack file. {status, detail, course, fingerprint, pinned}. */
export async function verify(pack) {
  return helper.post('/api/classroom/verify', { pack });
}
/** Accept a pack the helper verified (pins a new course; a key change needs confirm). Stores it on success. */
export async function accept(pack, confirmKeyChange = false) {
  const r = await helper.post('/api/classroom/accept', { pack, confirm_key_change: !!confirmKeyChange });
  if (!r.accepted) return r;
  await load();
  const id = packId(pack.body);
  const old = byId(id);
  const rec = { id, body: pack.body, fingerprint: r.fingerprint, accepted: new Date().toISOString(), ws: old?.ws || null,
    status: old?.status || 'new', submitted: old?.submitted || null };
  REC.packs = [rec, ...packs().filter(p => p.id !== id)];
  await save();
  return { ...r, id };
}
export async function remove(id) { await load(); REC.packs = packs().filter(p => p.id !== id); await save(); }
export async function update(id, patch) { await load(); const p = byId(id); if (p) { Object.assign(p, patch); await save(); } return p; }

/* ---------------- what the pack allows ---------------- */
export const settingsOf = rec => Object.assign({ ai: [], proposals: false, reveal: 'after', due: '' }, rec?.body?.settings || {});
/** The pack a workspace was started from, or null. */
export const packOf = (ws = S.ws) => (ws?.kind === 'classroom' && ws.classroom?.pack) || null;
/** null when the workspace is not tied to a pack (no restriction from here); otherwise whether the AI feature may run. */
export function allowedAI(task, ws = S.ws) {
  const p = packOf(ws);
  if (!p) return null;
  const allowed = new Set(p.settings?.ai || []);
  return task ? allowed.has(task) : allowed.size > 0;
}
export const AI_REFUSED = 'Your instructor has not allowed this AI feature for this assignment.';
export function proposalsAllowed(ws = S.ws) { const p = packOf(ws); return p ? !!p.settings?.proposals : null; }
export const late = (due, day = new Date().toISOString().slice(0, 10)) => !!due && day > due;

/* ---------------- the workspace an assignment is done in ---------------- */
/** What a classroom workspace records about its pack (no signature, no key: the pack stays in `meta`). */
export const wsPack = rec => ({ id: rec.id, course: rec.body.course, title: rec.body.title, kind: rec.body.kind,
  settings: settingsOf(rec), deliverables: rec.body.content?.deliverables || [], steps: rec.body.content?.steps || [] });

/* ---------------- quiz ---------------- */
let QUIZ = null;
export async function quizBank() {
  if (QUIZ) return QUIZ;
  if (!self.CRG_QUIZ) await import('./data/quiz.js');
  QUIZ = self.CRG_QUIZ;
  return QUIZ;
}
/** A deterministic draw: the first `count` questions of the chosen chapters, interleaved, after a seeded shuffle. */
export function draw(bank, chapters, count, seed = 1) {
  const pool = [];
  for (const c of bank.chapters) if (chapters.includes(c.n)) for (const q of c.questions) pool.push({ ch: c.n, chTitle: c.title, ...q });
  let s = seed >>> 0 || 1;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, Math.max(1, Math.min(count, pool.length)));
}
export function score(questions, answers) {
  const right = questions.filter((q, i) => answers[i] === q.answer).length;
  return { right, total: questions.length };
}
export async function recordAttempt(a) {
  await load();
  REC.attempts = [{ ...a, at: new Date().toISOString() }, ...attempts()].slice(0, 200);
  await save();
}

/* ---------------- submission ---------------- */
/** The submission body for a pack (spec §7): the full workspace, the named deliverables, the AI-use log, the 19-step
 *  progress and the quiz or exercise results. Names only as the student typed them. */
export function submissionBody(rec, { team = '', members = '', ws = null, progress = [], aiLog = [], quiz = [], exercise = null } = {}) {
  return {
    course: rec.body.course, pack: rec.id, title: rec.body.title, kind: rec.body.kind, due: settingsOf(rec).due || '',
    team: String(team || ''), members: String(members || ''),
    workspace: ws, deliverables: rec.body.content?.deliverables || [],
    progress, ai_log: aiLog, quiz, exercise,
    teaching: 'Classroom work on a fictional teaching case — not organizational evidence.',
  };
}
export async function submit(rec, parts) {
  const r = await helper.post('/api/classroom/submit', { body: submissionBody(rec, parts) });
  await update(rec.id, { status: 'submitted', submitted: r.submission.body.submitted });
  return r.submission;
}
