/* exercise.js — tabletop exercises for the Classroom (BL-26; docs/spec-classroom-exercises.md §6).

   An exercise pack carries its injects ENCRYPTED: each inject (title, text and question, in English and French) is
   sealed with AES-GCM under a key derived from its unlock code (PBKDF2-SHA-256). The codes are made fresh each time the
   instructor builds the pack and are printed on the facilitator sheet only — never in the pack — so a student who opens
   the pack file cannot read an inject before the facilitator reads out its code. The facilitator controls the tempo;
   everything works offline.

   The team picks its roles (unless the pack fixes them), opens injects with the codes, records each decision with the
   role that took it and the time, answers the debrief questions, and exports the after-action report. Alerts and
   indicator matches in an exercise are exercise material, never confirmed incidents (evidence-discipline rule).
   © 2026 Marc-André Léger. CC BY-NC 4.0 */
'use strict';

export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';     // no 0/O, 1/I/L: read aloud without confusion
const ITER = 150000;
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = u8 => btoa(String.fromCharCode(...u8));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
export const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

export function newCode(len = 6) {
  const r = crypto.getRandomValues(new Uint8Array(len));
  return [...r].map(x => CODE_ALPHABET[x % CODE_ALPHABET.length]).join('');
}
async function keyFor(code, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(normCode(code)), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function seal(obj, code) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await keyFor(code, salt), enc.encode(JSON.stringify(obj))));
  return { salt: b64(salt), iv: b64(iv), ct: b64(ct) };
}
/** The inject, or null when the code is wrong (AES-GCM authenticates: a wrong code never yields garbage). */
export async function open(box, code) {
  try {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(box.iv) }, await keyFor(code, unb64(box.salt)), unb64(box.ct));
    return JSON.parse(dec.decode(pt));
  } catch { return null; }
}

/** From an exercise source (examples/classroom/sample-exercises.json): the pack content with sealed injects, and the
 *  facilitator sheet with the fresh codes. `fixedRoles` maps role ids to team members when the pack fixes them. */
export async function buildContent(source, exId, { fixedRoles = null } = {}) {
  const ex = source.exercises.find(e => e.id === exId);
  if (!ex) throw new Error('Unknown exercise: ' + exId);
  const sheet = [], injects = [];
  for (const [i, inj] of ex.injects.entries()) {
    const code = newCode();
    sheet.push({ n: i + 1, title: inj.title, code });
    injects.push({ n: i + 1, ...(await seal({ title: inj.title, text: inj.text, ask: inj.ask }, code)) });
  }
  const content = { exercise: ex.id, case: ex.case, title: ex.title, chapters: ex.chapters, brief: ex.brief, debrief: ex.debrief,
    roles: ex.roles.map(r => ({ id: r, name: source.roles[r] })), fixedRoles, injects,
    teaching: source.note };
  return { content, sheet };
}

/* ---------------- the team's run ---------------- */
export const blankRun = () => ({ started: new Date().toISOString(), roles: {}, opened: [], decisions: [], debrief: [] });
export function opened(run, n) { return run.opened.find(o => o.n === n) || null; }

/** The after-action report (spec §6), as Markdown: when each inject was opened, each decision with its role and time,
 *  the debrief answers, and the book chapters. Teaching material, labelled so. */
export function afterAction(content, run, L = 'en', team = '') {
  const t = o => (o && typeof o === 'object' ? (o[L] || o.en) : String(o || ''));
  const fr = L === 'fr';
  const roleName = id => t(content.roles.find(r => r.id === id)?.name) || id;
  const hm = iso => (iso ? iso.slice(0, 16).replace('T', ' ') : '');
  const out = [`# ${fr ? 'Rapport après action' : 'After-action report'} — ${t(content.title)}`, '',
    `*${fr ? 'Exercice sur table fictif — matériel pédagogique. Les alertes et les indicateurs de l’exercice ne sont pas des incidents confirmés.' : 'Fictional tabletop exercise — teaching material. Alerts and indicators in the exercise are not confirmed incidents.'}*`, ''];
  if (team) out.push(`**${fr ? 'Équipe' : 'Team'}:** ${team}`, '');
  out.push(`## ${fr ? 'Rôles' : 'Roles'}`, '');
  for (const r of content.roles) out.push(`- ${t(r.name)}: ${run.roles[r.id] || (fr ? '(non attribué)' : '(not assigned)')}`);
  out.push('', `## ${fr ? 'Chronologie' : 'Timeline'}`, '');
  const opened = [...run.opened].sort((a, b) => a.n - b.n);
  if (!opened.length) out.push(fr ? 'Aucune injection ouverte.' : 'No inject opened.');
  for (const o of opened) {
    out.push(`### ${fr ? 'Injection' : 'Inject'} ${o.n} — ${t(o.title)} (${fr ? 'ouverte' : 'opened'} ${hm(o.at)})`, '');
    const ds = run.decisions.filter(d => d.n === o.n);
    if (!ds.length) out.push(fr ? '- Aucune décision consignée.' : '- No decision recorded.');
    for (const d of ds) out.push(`- ${hm(d.at)} · **${roleName(d.role)}** — ${d.text}`);
    out.push('');
  }
  out.push(`## ${fr ? 'Rétroaction' : 'Debrief'}`, '');
  content.debrief.forEach((q, i) => out.push(`${i + 1}. ${t(q)}`, '', `   ${run.debrief[i] || (fr ? '(sans réponse)' : '(no answer)')}`, ''));
  out.push(`## ${fr ? 'Chapitres du manuel' : 'Book chapters'}`, '', (fr ? 'Chapitres ' : 'Chapters ') + content.chapters.join(', '), '');
  return out.join('\n');
}
