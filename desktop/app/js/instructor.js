/* instructor.js — the instructor side of the Classroom (Educational edition; docs/spec-classroom-exercises.md §3, §8, §9).

   Roster: imported from the LMS participants export (Moodle's columns recognised, in English or French) or typed in;
   kept by the helper in the instructor's confidential folder (<organisation-graph folder>/_installation/classroom/),
   never in a pack or a workspace. Packs carry team names only.
   Packs: built here and signed by the helper with the instructor key (crg_classroom.py).
   Grading: the instructor scores each submission against the pack's rubric. The application pre-fills objective
   evidence (19-step progress, quiz score, exercise timeline, AI-use log, late flag, integrity) for the grader — never as
   the grade. Grades export as a CSV for Moodle's grade import, one row per student, identified by email address.
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';
import * as helper from './helper.js';
import * as EX from './exercise.js';

/* ---------------- roster ---------------- */
const COLS = {
  first: /^(first ?name|prénom|prenom)$/i, last: /^(last ?name|surname|nom( de famille)?)$/i,
  name: /^(name|full ?name|nom complet|participant)$/i, email: /^(e-?mail( address)?|adresse (de )?courriel|courriel|adresse électronique)$/i,
  group: /^(groups?|groupes?|team|équipe)$/i,
};
export function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  const s = String(text || '').replace(/^﻿/, '');
  const sep = (s.split('\n')[0].match(/;/g) || []).length > (s.split('\n')[0].match(/,/g) || []).length ? ';' : ',';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"' && s[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === sep) { row.push(cur); cur = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && s[i + 1] === '\n') i++; row.push(cur); rows.push(row); row = []; cur = ''; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(x => x.trim()));
}
/** [{name, email, group}] from an LMS participants export. Throws when no name or email column is recognised. */
export function parseRoster(text) {
  const [head, ...rows] = parseCSV(text);
  if (!head) throw new Error('The file is empty.');
  const idx = {};
  head.forEach((h, i) => { for (const [k, rx] of Object.entries(COLS)) if (idx[k] === undefined && rx.test(h.trim())) idx[k] = i; });
  if (idx.email === undefined || (idx.name === undefined && idx.first === undefined && idx.last === undefined))
    throw new Error('No name and email columns were recognised. Expected Moodle’s participants export (First name, Last name, Email address, Groups).');
  return rows.map(r => {
    const name = idx.name !== undefined ? r[idx.name] : [r[idx.first], r[idx.last]].filter(Boolean).join(' ');
    return { name: String(name || '').trim(), email: String(r[idx.email] || '').trim().toLowerCase(), group: String(idx.group !== undefined ? r[idx.group] || '' : '').split(',')[0].trim() };
  }).filter(p => p.email);
}
export const teams = roster => [...new Set(roster.map(p => p.group).filter(Boolean))].sort();
export async function loadRoster() { return (await helper.post('/api/classroom/roster_get', {})).data || []; }
export async function saveRoster(roster) { return helper.post('/api/classroom/roster_put', { data: roster }); }
export async function loadGrades() { return (await helper.post('/api/classroom/grades_get', {})).data || {}; }
export async function saveGrades(g) { return helper.post('/api/classroom/grades_put', { data: g }); }
export async function key(create = false) { return (await helper.post('/api/classroom/key', { create })).key; }

/* ---------------- packs ---------------- */
export const CASES = [['medibec', 'MediBec (English)'], ['medibec-fr', 'MediBec (French)'], ['canaretail', 'CanaRetail (English)'], ['canaretail-fr', 'CanaRetail (French)'], ['blank', 'A blank organization']];
export const DELIVERABLES = ['Workbook', 'Report', 'Scenario portfolio', 'Management summary'];
export const RUBRICS = {
  assignment: [
    { criterion: 'Context, evidence and scenario causal chains', weight: 30 },
    { criterion: 'Quantification: parameters, rationale and evidence', weight: 30 },
    { criterion: 'Treatment, budget and recommendations', weight: 20 },
    { criterion: 'Communication, markers and decisions for management', weight: 20 }],
  exercise: [
    { criterion: 'Decisions: timely, owned by the right role, justified', weight: 40 },
    { criterion: 'Debrief: lessons tied to the book', weight: 40 },
    { criterion: 'After-action report', weight: 20 }],
};
export const LEVELS = [['excellent', 'Excellent', 1], ['good', 'Good', 0.8], ['satisfactory', 'Satisfactory', 0.6], ['insufficient', 'Insufficient', 0.3], ['missing', 'Missing', 0]];

/** A pack body (crg_classroom.validate_body) from the builder's form values. */
export function body({ kind, courseId, courseTitle, title, due = '', reveal = 'after', ai = [], proposals = false, content = {} }) {
  const rubric = content.rubric || RUBRICS[kind] || null;
  return { kind, course: { id: courseId, title: courseTitle }, title, issued: new Date().toISOString().slice(0, 10),
    settings: { ai, proposals, reveal, due }, content: rubric ? { ...content, rubric } : content };
}
export async function sign(b) { return (await helper.post('/api/classroom/sign', { body: b })).pack; }
export async function samples() { return (await fetch('examples/classroom/sample-exercises.json')).json(); }
/** An exercise pack body and its facilitator sheet (fresh codes, never in the pack). */
export async function exercisePack(form, exId) {
  const src = await samples();
  const { content, sheet } = await EX.buildContent(src, exId, { fixedRoles: form.fixedRoles || null });
  return { body: body({ ...form, kind: 'exercise', content }), sheet };
}
/** The facilitator sheet as Markdown: the codes, in inject order. For the instructor only. */
export function sheetMarkdown(title, sheet, L = 'en') {
  const fr = L === 'fr';
  return [`# ${fr ? 'Fiche de l’animateur' : 'Facilitator sheet'} — ${title}`, '',
    fr ? 'Lisez chaque code à voix haute quand l’équipe doit ouvrir l’injection. Ne distribuez pas cette fiche.' : 'Read each code aloud when the team should open the inject. Do not hand out this sheet.', '',
    `| # | ${fr ? 'Injection' : 'Inject'} | Code |`, '|---|---|---|',
    ...sheet.map(s => `| ${s.n} | ${s.title[L] || s.title.en} | \`${s.code}\` |`), ''].join('\n');
}
/** A course pack: several pack bodies in one signed bundle (spec §9), to reuse each term or share with a colleague. */
export const coursePack = (courseId, courseTitle, title, items) => body({ kind: 'course', courseId, courseTitle, title, content: { items } });

/* ---------------- submissions and grading ---------------- */
export async function check(sub) { return helper.post('/api/classroom/check', { submission: sub }); }
/** Objective evidence for the grader (spec §8) — never the grade. */
export function evidence(sub) {
  const b = sub.body || {};
  const prog = Array.isArray(b.progress) ? b.progress : [];
  const quiz = Array.isArray(b.quiz) ? b.quiz : [];
  const ex = b.exercise?.run;
  return {
    steps: prog.length ? `${prog.filter(p => p.status === 'done').length} / ${prog.length}` : '—',
    quiz: quiz.length ? quiz.map(q => `${q.right} / ${q.total}`).join(', ') : '—',
    exercise: ex ? `${ex.opened?.length || 0} inject(s) · ${ex.decisions?.length || 0} decision(s) · ${(ex.debrief || []).filter(Boolean).length} debrief answer(s)` : '—',
    ai: Array.isArray(b.ai_log) ? b.ai_log.length : 0,
    late: !!b.late, submitted: b.submitted || '',
  };
}
export function grade(rubric, picks) {
  const tot = rubric.reduce((a, c) => a + Number(c.weight || 0), 0) || 1;
  let got = 0, complete = true;
  rubric.forEach((c, i) => { const lv = LEVELS.find(l => l[0] === picks[i]); if (!lv) complete = false; else got += Number(c.weight || 0) * lv[2]; });
  return { pct: Math.round((got / tot) * 1000) / 10, complete };
}
const csvCell = v => { const s = String(v ?? ''); return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
/** Moodle grade import CSV: "Email address" identifies the student; a team grade goes to every member of its group. */
export function moodleCSV(entries, roster, column = 'Grade') {
  const out = [['Email address', column, 'Feedback comments']];
  for (const e of entries) {
    if (!e.complete) continue;
    const members = roster.filter(p => p.group && p.group === e.team).concat(roster.filter(p => p.email === e.team.toLowerCase() || p.name === e.team));
    for (const p of [...new Map(members.map(m => [m.email, m])).values()]) out.push([p.email, e.pct, e.comment || '']);
  }
  return out.map(r => r.map(csvCell).join(',')).join('\n') + '\n';
}
